import { prisma } from "@/lib/prisma/client";
import { loadConfig } from "@/lib/config/load";

export const dynamic = "force-dynamic";

// Two modes. A DB query resets Neon's autosuspend timer, so a probe that hits
// the database faster than its ~5-minute idle window keeps the compute awake
// permanently. The default path checks only the (in-memory) config and touches
// no database; `?deep=1` also proves the database is serving queries and is
// meant for an infrequent (15-30 minute) probe. Point frequent uptime polling
// at the default.
//
//   GET /api/health          Deployment liveness + config. No database touch.
//   GET /api/health?deep=1   Also checks the database.
export async function GET(req: Request) {
  const deep = new URL(req.url).searchParams.get("deep") === "1";

  let config: "ok" | "error" = "ok";
  let projects = 0;
  try {
    projects = loadConfig().projects.length;
  } catch {
    config = "error";
  }

  let database: "ok" | "error" | "skipped" = "skipped";
  if (deep) {
    database = "ok";
    try {
      await prisma.feedback.count();
    } catch {
      database = "error";
    }
  }

  const healthy = config === "ok" && database !== "error";
  return Response.json(
    { status: healthy ? "ok" : "degraded", database, config, projects },
    { status: healthy ? 200 : 503, headers: { "cache-control": "no-store" } }
  );
}
