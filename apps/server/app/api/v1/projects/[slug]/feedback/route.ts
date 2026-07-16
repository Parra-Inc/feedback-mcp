import { verifyAdminRequest } from "@/lib/auth/admin";
import { getProject } from "@/lib/config/load";
import { listFeedback, MAX_PAGE_SIZE } from "@/lib/feedback/query";

export const dynamic = "force-dynamic";

function parseDate(value: string | null): Date | null | "invalid" {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid" : date;
}

// GET /api/v1/projects/[slug]/feedback?form=&platform=&since=&until=&limit=&cursor=
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = verifyAdminRequest(request);
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    return Response.json({ error: `Unknown project "${slug}"` }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;

  const since = parseDate(searchParams.get("since"));
  if (since === "invalid") {
    return Response.json({ error: "Invalid `since` date" }, { status: 400 });
  }
  const until = parseDate(searchParams.get("until"));
  if (until === "invalid") {
    return Response.json({ error: "Invalid `until` date" }, { status: 400 });
  }

  let limit: number | undefined;
  const rawLimit = searchParams.get("limit");
  if (rawLimit) {
    limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
      return Response.json(
        { error: `\`limit\` must be an integer between 1 and ${MAX_PAGE_SIZE}` },
        { status: 400 }
      );
    }
  }

  const { items, nextCursor } = await listFeedback({
    project: project.slug,
    form: searchParams.get("form") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    since: since ?? undefined,
    until: until ?? undefined,
    limit,
    cursor: searchParams.get("cursor") ?? undefined,
  });

  return Response.json({ feedback: items, nextCursor });
}
