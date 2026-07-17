import { verifyAdminRequest } from "@/lib/auth/admin";
import { getProject } from "@/lib/config/load";
import { deleteFeedback, listFeedback, MAX_PAGE_SIZE } from "@/lib/feedback/query";

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

// DELETE /api/v1/projects/[slug]/feedback?user=&form=&platform=&before=&all=true
// Bulk delete with filters. Deleting by `user` handles GDPR/CCPA erasure
// requests; `before` supports manual retention cleanups. Requires at least
// one filter, or an explicit all=true to wipe a project.
export async function DELETE(
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

  const before = parseDate(searchParams.get("before"));
  if (before === "invalid") {
    return Response.json({ error: "Invalid `before` date" }, { status: 400 });
  }

  const filters = {
    form: searchParams.get("form") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    userId: searchParams.get("user") ?? undefined,
    until: before ?? undefined,
  };

  const hasFilter = Object.values(filters).some((value) => value !== undefined);
  if (!hasFilter && searchParams.get("all") !== "true") {
    return Response.json(
      {
        error:
          "Refusing to delete all feedback without a filter. Pass `user`, `form`, `platform`, or `before`, or confirm with `all=true`.",
      },
      { status: 400 }
    );
  }

  const deleted = await deleteFeedback({ project: project.slug, ...filters });
  return Response.json({ deleted });
}
