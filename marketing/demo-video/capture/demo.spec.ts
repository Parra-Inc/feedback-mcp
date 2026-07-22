import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Records two clips that go along with the script, hitting scripted beats at
 * scripted times, and writes their timings to a manifest so Remotion can sync
 * captions to the real footage:
 *
 *   public/captures/form.webm  – filling and submitting the demo feedback form
 *                                (POSTs to the real API when it is running)
 *   public/captures/site.webm  – scrolling the live marketing one-pager
 *   public/captures/timing.json – { form: {...beats}, site: {...beats} } in seconds
 *
 * It also points src/captures.json at whatever it produced. Run:
 *   npm run capture
 * Optional env:  SITE_URL, API_URL, EXAMPLE_APP_INGEST_KEY
 */

declare global {
  interface Window {
    __API_URL?: string;
    __INGEST_KEY?: string;
  }
}

const CAPTURES = path.resolve(__dirname, "../public/captures");
const RAW = path.join(CAPTURES, "raw");
const MANIFEST = path.resolve(__dirname, "../src/captures.json");
const HARNESS = pathToFileURL(path.join(__dirname, "harness/index.html")).href;

const SITE_URL =
  process.env.SITE_URL ?? "https://parra-inc.github.io/feedback-mcp/";
const API_URL = process.env.API_URL ?? "http://localhost:3065";
const INGEST_KEY =
  process.env.EXAMPLE_APP_INGEST_KEY ?? process.env.INGEST_KEY ?? "dev";

const SIZE = { width: 1360, height: 766 };

type Timing = Record<string, Record<string, number>>;

function mark(timing: Timing, clip: string, name: string, t0: number) {
  (timing[clip] ??= {})[name] = Number(((Date.now() - t0) / 1000).toFixed(2));
}

test("capture demo footage", async ({ browser }) => {
  fs.mkdirSync(RAW, { recursive: true });
  const timing: Timing = {};

  // ---------- Clip 1: the feedback form (real submit against the API) ----------
  {
    const context = await browser.newContext({
      viewport: SIZE,
      recordVideo: { dir: RAW, size: SIZE },
    });
    await context.addInitScript(
      ({ api, key }) => {
        window.__API_URL = api;
        window.__INGEST_KEY = key;
      },
      { api: API_URL, key: INGEST_KEY }
    );
    const page = await context.newPage();
    await page.goto(HARNESS);
    const t0 = Date.now();

    await page.waitForTimeout(700);
    await page.locator("#title").click();
    await page
      .locator("#title")
      .pressSequentially("Crash on launch", { delay: 55 });
    mark(timing, "form", "title", t0);

    await page.waitForTimeout(300);
    await page.locator("#description").click();
    await page
      .locator("#description")
      .pressSequentially("App closes immediately after opening on iPhone 15.", {
        delay: 30,
      });
    await page.waitForTimeout(300);

    await page.locator('.pill[data-sev="high"]').click();
    mark(timing, "form", "severity", t0);
    await page.waitForTimeout(500);

    await page.locator("#submit").click();
    mark(timing, "form", "submit", t0);
    await page.waitForSelector("#toast.show");
    mark(timing, "form", "success", t0);
    await page.waitForTimeout(2200);

    const video = page.video();
    await context.close();
    if (video) fs.renameSync(await video.path(), path.join(CAPTURES, "form.webm"));
  }

  // ---------- Clip 2: the live marketing site, scrolled top to bottom ----------
  {
    const context = await browser.newContext({
      viewport: SIZE,
      recordVideo: { dir: RAW, size: SIZE },
    });
    const page = await context.newPage();
    await page
      .goto(SITE_URL, { waitUntil: "networkidle" })
      .catch(() => page.goto(SITE_URL).catch(() => {}));
    const t0 = Date.now();
    await page.waitForTimeout(900);

    const maxScroll = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight
    );
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "smooth" }),
        (maxScroll * i) / steps
      );
      mark(timing, "site", `scroll${i}`, t0);
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(600);

    const video = page.video();
    await context.close();
    if (video) fs.renameSync(await video.path(), path.join(CAPTURES, "site.webm"));
  }

  // ---------- Update the manifests Remotion reads ----------
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (fs.existsSync(path.join(CAPTURES, "form.webm")))
    manifest.form = "captures/form.webm";
  if (fs.existsSync(path.join(CAPTURES, "site.webm")))
    manifest.site = "captures/site.webm";
  manifest.timing = timing;
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(
    path.join(CAPTURES, "timing.json"),
    JSON.stringify(timing, null, 2) + "\n"
  );
});
