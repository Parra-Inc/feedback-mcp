import { defineConfig } from "@playwright/test";

/**
 * Capture-only Playwright config. We manage the recording context by hand inside
 * the test (so the output filenames are predictable), so the runner-level video
 * option is intentionally off. One worker, no retries: this is a recorder, not a
 * test suite that needs isolation.
 */
export default defineConfig({
  testDir: "./capture",
  testMatch: /demo\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1360, height: 766 },
    deviceScaleFactor: 2,
  },
});
