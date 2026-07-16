// Runs once at server startup. Validates the config tree so a broken
// project.json or form file fails fast with a clear error instead of
// surfacing as 500s later.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadConfig } = await import("@/lib/config/load");
    const { projects } = loadConfig({ force: true });
    console.log(
      `[feedback-mcp] loaded ${projects.length} project(s): ${projects
        .map((project) => `${project.slug} (${project.forms.length} form(s))`)
        .join(", ")}`
    );
    if (!process.env.MCP_SECRET) {
      console.warn(
        "[feedback-mcp] MCP_SECRET is not set: the MCP server and admin API will reject all requests"
      );
    }
  }
}
