import { prisma } from "@/lib/prisma/client";
import { loadConfig } from "@/lib/config/load";

export const dynamic = "force-dynamic";

// GET /api/health
export async function GET() {
  let database: "ok" | "error" = "ok";
  try {
    await prisma.feedback.count();
  } catch {
    database = "error";
  }

  let config: "ok" | "error" = "ok";
  let projects = 0;
  try {
    projects = loadConfig().projects.length;
  } catch {
    config = "error";
  }

  const healthy = database === "ok" && config === "ok";
  return Response.json(
    { status: healthy ? "ok" : "degraded", database, config, projects },
    { status: healthy ? 200 : 503 }
  );
}
