import { verifyAdminRequest } from "@/lib/auth/admin";
import { loadConfig } from "@/lib/config/load";
import { serializeProject } from "@/lib/config/serialize";

export const dynamic = "force-dynamic";

// GET /api/v1/projects
export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { projects } = loadConfig();
  return Response.json({ projects: projects.map(serializeProject) });
}
