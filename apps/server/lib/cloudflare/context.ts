// Access to Cloudflare Workers bindings (D1, etc.) when running on Workers via
// the OpenNext adapter. Returns undefined everywhere else (local dev, Node
// production, tests, build scripts) so callers can degrade gracefully instead
// of crashing off-Workers.
//
// getCloudflareContext() throws when called outside a request or off-Workers,
// so it must never be called at module scope. Keep every call behind cfEnv().
export function cfEnv(): CloudflareEnv | undefined {
  try {
    // Lazy require so the import never runs during Node builds/tests where the
    // OpenNext runtime is absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    return getCloudflareContext().env as CloudflareEnv;
  } catch {
    return undefined;
  }
}
