import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-pg",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-d1",
    "better-sqlite3",
    // pg is never used on the D1/Workers path, but its workerd-specific
    // require("pg-cloudflare") breaks the OpenNext esbuild pass unless both
    // are kept out of the bundle (opennext.js.org/cloudflare/howtos/workerd).
    "pg",
    "pg-cloudflare",
  ],
  // Make sure the config tree (projects + forms) is included in serverless
  // deployments that rely on output file tracing (e.g. Vercel). Cloudflare
  // reads the build-time bundle instead (CONFIG_SOURCE=bundle).
  outputFileTracingIncludes: {
    "/**/*": ["./config/**/*"],
  },
};

export default nextConfig;

// Exposes simulated Cloudflare bindings (D1 via miniflare) inside `next dev`
// when targeting the Workers build. Dev-only and best-effort so the package
// stays a devDependency and the Node production path (`next start`) never
// imports it. The canonical way to exercise D1 locally is `pnpm preview`.
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch(() => {});
}
