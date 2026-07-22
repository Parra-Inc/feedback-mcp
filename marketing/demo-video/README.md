# Feedback MCP demo video

The launch demo video, built as code: **Remotion** for the animated scenes, **VHS** and
**Playwright** for real captured footage, one 56-second 1080p MP4 out the other end. Every
frame is deterministic and re-renderable, so tweaking a word or a color is an edit, not a
re-shoot.

- **Script:** [`script.md`](script.md), the timed beat sheet (single source of truth for timings lives in [`src/config.ts`](src/config.ts)).
- **Remotion reference:** [`references/remotion.md`](references/remotion.md), best practices this project follows.
- **Skill:** run [`/demo-video`](../../.claude/skills/demo-video/SKILL.md) to (re)build the whole thing.

## What it shows (7 scenes, 56s)

1. Title, Feedback MCP, "collect feedback, analyze with Claude"
2. **One endpoint in**, the real `curl POST` (VHS capture / animated fallback)
3. **Forms as config**, the form JSON writing itself
4. **MCP out**, Claude answering "what are iOS users asking for?" + a chart (the money beat)
5. **Your database**, Postgres / SQLite / D1, one env var, one-click deploy
6. **See it live**, the marketing site scrolling (Playwright capture / placeholder)
7. Outro, "No dashboard. On purpose." + repo CTA

## Quick start (animation only, no external tools)

```bash
cd marketing/demo-video
npm install
npm run studio      # preview at localhost:3000, scrub the timeline
npm run render      # -> out/feedback-mcp-demo.mp4
```

This renders immediately: the captured-clip scenes show polished animated fallbacks until
you capture real footage, and the video is silent until you add music. That's intentional -
the pipeline never blocks on assets you haven't made yet.

## Full build (real footage + music)

Three capture sources feed the same `src/captures.json` manifest; Remotion picks up
whatever exists.

### 1. Terminal (VHS), the ingest scene

```bash
brew install vhs                       # once (charmbracelet/vhs)
# start the stack so curl hits a real server, from the repo root:
MCP_SECRET=dev EXAMPLE_APP_INGEST_KEY=dev pnpm dev:server
# then, from marketing/demo-video:
npm run capture:terminal               # -> public/captures/terminal.mp4, points captures.json at it
```

### 2. Web (Playwright), the form submit + the live site

```bash
npx playwright install chromium        # once
npm run capture                        # -> public/captures/{form,site}.webm + timing.json
```

By default the site clip records the live one-pager at
`https://parra-inc.github.io/feedback-mcp/` and the form clip POSTs to
`http://localhost:3065`. Override with env vars:

```bash
SITE_URL=http://localhost:3066 API_URL=http://localhost:3065 \
  EXAMPLE_APP_INGEST_KEY=dev npm run capture
```

If the API isn't running, the form still shows a clean success so the clip is usable.

### 3. Music

Drop a royalty-free track at `public/music/track.mp3` and set `MUSIC_SRC` in
[`src/config.ts`](src/config.ts). See [`public/music/README.md`](public/music/README.md)
for sources and licensing.

### 4. Render

```bash
npm run render                         # -> out/feedback-mcp-demo.mp4
npm run still                          # -> out/thumbnail.png (frame 690, the MCP beat)
```

## How the pieces fit

```
capture/terminal.tape ──vhs──▶ public/captures/terminal.mp4 ─┐
capture/demo.spec.ts ──pw───▶ public/captures/{form,site}.webm ─┤
                                                     timing.json ─┤
                                                                   ├─▶ src/captures.json ─▶ Remotion (OffthreadVideo)
public/music/track.mp3 ────────────────────────────────────────── ▶ src/config.ts (MUSIC_SRC) ─▶ <Audio>
src/scenes/*.tsx (animations) ─────────────────────────────────────────────────────────────────▶ Demo composition ─▶ out/*.mp4
```

- **Timings** live in `src/config.ts` (`SCENES`). Change a duration there and update
  `script.md`.
- **Brand tokens** live in `src/theme.ts` (kept in lockstep with the repo's open-assets
  banner/OG and the Product Hunt gallery).
- **Captured vs animated** is decided per-scene by `src/captures.json`; a `null` entry
  renders the animated fallback.

## Editing tips

- Reword a caption: edit the scene in `src/scenes/`, scrub in `npm run studio`.
- Retime a scene: change its `durationInFrames` in `src/config.ts` (keep `from` values
  contiguous), then reflect it in `script.md`.
- Swap the terminal scene for the product-form capture: point `EndpointScene` at
  `captures.form` (see the note at the bottom of `script.md`).
- Prefer a shorter cut: drop a scene from `Demo.tsx` and shift the later `from` offsets.

## Why VHS + Playwright (and not just screen recording)

- **VHS** (`.tape`) produces pixel-clean, perfectly paced terminal video from a script, no
  wobbly manual typing, re-runnable in CI. It's the right tool for the `curl` scene.
- **Playwright** drives a real browser headlessly, records video, and hits scripted beats
  at scripted times, so the capture stays in sync with the script and regenerates on
  demand. Better than a manual screen recording for anything repeatable.
- **Remotion** composites and animates around that footage with the exact brand system.

Not used here but worth knowing: for **iOS** app demos the equivalent is XCUITest driving
the Simulator with `xcrun simctl io booted recordVideo`, composited the same way. This
project is a web/dev tool, so VHS + Playwright are the fit.
