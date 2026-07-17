import { z } from "zod";
import { getForm, getProject, ConfigError } from "@/lib/config/load";
import { compileFormSchema } from "@/lib/forms/compile";
import { verifyIngestKey } from "@/lib/auth/ingest";
import { verifyUserToken } from "@/lib/auth/user-jwt";
import { postFeedbackToSlack } from "@/lib/slack/post";
import { prisma } from "@/lib/prisma/client";
import { serializeJson } from "@/lib/json";
import { maybeSweepRetention } from "@/lib/feedback/retention";
import { checkRateLimit, getClientIp, rateLimitFromEnv } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Feedback is submitted from client apps (iOS, Android, web), so the ingest
// endpoint is CORS-open. Authorization comes from the X-Feedback-Key header,
// not the origin.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Feedback-Key, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: corsHeaders });
}

const bodySchema = z.strictObject({
  project: z.string().min(1),
  form: z.string().min(1),
  platform: z.string().min(1).max(40).optional(),
  data: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const MAX_PAYLOAD_BYTES = 100_000;

// OPTIONS /api/v1/feedback
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function tooManyRequests(retryAfterSeconds: number) {
  return Response.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { ...corsHeaders, "Retry-After": String(retryAfterSeconds) },
    }
  );
}

// POST /api/v1/feedback
export async function POST(request: Request) {
  // Cheap shed before any parsing: per-IP first, per-project after routing.
  const ip = getClientIp(request);
  const ipLimit = rateLimitFromEnv("RATE_LIMIT_IP_PER_MINUTE", 60);
  const ipCheck = checkRateLimit(`ip:${ip}`, ipLimit);
  if (!ipCheck.allowed) return tooManyRequests(ipCheck.retryAfterSeconds);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, 400);
  }

  const parsedBody = bodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return json(
      { error: "Invalid request body", details: z.flattenError(parsedBody.error) },
      400
    );
  }
  const { project: projectSlug, form: formSlug, platform, data, metadata } = parsedBody.data;

  let project;
  try {
    project = getProject(projectSlug);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error("[config]", error.message);
      return json({ error: "Server configuration error" }, 500);
    }
    throw error;
  }
  if (!project) {
    return json({ error: `Unknown project "${projectSlug}"` }, 404);
  }

  const projectLimit = rateLimitFromEnv("RATE_LIMIT_PROJECT_PER_MINUTE", 600);
  const projectCheck = checkRateLimit(`project:${project.slug}`, projectLimit);
  if (!projectCheck.allowed) return tooManyRequests(projectCheck.retryAfterSeconds);

  const ingestAuth = verifyIngestKey(request, project);
  if (!ingestAuth.success) {
    return json({ error: ingestAuth.error }, ingestAuth.status);
  }

  const form = getForm(project, formSlug);
  if (!form) {
    return json({ error: `Unknown form "${formSlug}" for project "${projectSlug}"` }, 404);
  }

  if (
    project.platforms &&
    project.platforms.length > 0 &&
    platform &&
    !project.platforms.includes(platform)
  ) {
    return json(
      {
        error: `Unknown platform "${platform}" for project "${projectSlug}". Expected one of: ${project.platforms.join(", ")}`,
      },
      400
    );
  }

  const dataResult = compileFormSchema(form).safeParse(data);
  if (!dataResult.success) {
    return json(
      {
        error: `Feedback data does not match the "${form.slug}" form schema`,
        details: z.flattenError(dataResult.error),
      },
      400
    );
  }

  const userAuth = await verifyUserToken(request, project);
  if (!userAuth.success) {
    return json({ error: userAuth.error }, userAuth.status);
  }

  const serializedData = serializeJson(dataResult.data);
  const serializedMetadata = metadata ? serializeJson(metadata) : null;
  if (
    serializedData.length + (serializedMetadata?.length ?? 0) >
    MAX_PAYLOAD_BYTES
  ) {
    return json({ error: "Feedback payload is too large" }, 413);
  }

  const feedback = await prisma.feedback.create({
    data: {
      projectSlug: project.slug,
      formSlug: form.slug,
      platform: platform ?? null,
      data: serializedData,
      metadata: serializedMetadata,
      userId: userAuth.userId,
    },
  });

  // Opportunistic retention sweep; no-op unless FEEDBACK_RETENTION_DAYS is set.
  maybeSweepRetention();

  // Cross-post to Slack after the write. postFeedbackToSlack never throws.
  await postFeedbackToSlack({
    project,
    form,
    feedbackId: feedback.id,
    platform: feedback.platform,
    data: dataResult.data,
    metadata: metadata ?? null,
    userId: feedback.userId,
    createdAt: feedback.createdAt,
  });

  return json({ feedback: { id: feedback.id, createdAt: feedback.createdAt } }, 201);
}
