import { verifyAdminRequest } from "@/lib/auth/admin";
import { getProject } from "@/lib/config/load";
import { serializeProject } from "@/lib/config/serialize";

export const dynamic = "force-dynamic";

// GET /api/v1/projects/[slug]
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

  return Response.json({ project: serializeProject(project) });
}
