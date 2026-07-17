import { verifyAdminRequest } from "@/lib/auth/admin";
import { getProject } from "@/lib/config/load";
import { iterateFeedback } from "@/lib/feedback/query";

export const dynamic = "force-dynamic";

// GET /api/v1/projects/[slug]/export
// Streams every submission for a project as NDJSON, oldest first. Useful for
// backups, offline analysis, and data portability requests.
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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const item of iterateFeedback(project.slug)) {
          controller.enqueue(encoder.encode(`${JSON.stringify(item)}\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Content-Disposition": `attachment; filename="${project.slug}-feedback.ndjson"`,
      "Cache-Control": "no-store",
    },
  });
}
