import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Feedback MCP has no ISR or `use cache`, so the default configuration (no
// incremental cache) is all that is needed. Background work (retention sweep)
// runs opportunistically on ingest, so no queue or scheduled handler either.
export default defineCloudflareConfig();
