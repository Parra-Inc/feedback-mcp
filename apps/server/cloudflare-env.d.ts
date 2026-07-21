// Structural type for the Cloudflare Workers bindings this app uses.
// getCloudflareContext() picks up this interface by name (see lib/cloudflare/
// context.ts). Kept minimal on purpose: only the D1 database binding is read
// by application code. The `import(...)` type reference avoids pulling
// @cloudflare/workers-types into the Next.js type graph globally.
interface CloudflareEnv {
  DB: import("@cloudflare/workers-types").D1Database;
}
