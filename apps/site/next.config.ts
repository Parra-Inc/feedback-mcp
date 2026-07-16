import type { NextConfig } from "next";

// Static export for GitHub Pages. The Pages workflow sets
// PAGES_BASE_PATH=/feedback-mcp because project pages serve from a subpath.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH || "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
