import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  // Make sure the config tree (projects + forms) is included in serverless
  // deployments that rely on output file tracing (e.g. Vercel).
  outputFileTracingIncludes: {
    "/**/*": ["./config/**/*"],
  },
};

export default nextConfig;
