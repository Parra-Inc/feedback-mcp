# Feedback MCP demo video script

**Length:** 56s · **Format:** 1920×1080 · 30fps · **Music:** calm-but-driving tech bed
(see [public/music/README.md](public/music/README.md)).

The frame ranges below are the single source of truth in
[`src/config.ts`](src/config.ts) (`SCENES`). Seconds = frames ÷ 30. The Playwright
capture (`capture/demo.spec.ts`) and VHS tape (`capture/terminal.tape`) hit the
scripted beats at the scripted times so real footage drops straight into the
matching scene.

There is no voiceover by design, the on-screen text and captured product carry
it, so it plays silently in a feed. If you want VO, the "Narration" column is a
ready read; record it and add an `<Audio>` track per scene.

---

## Beat sheet

### 1 · Title, 0:00–0:04 (frames 0–120)
- **On screen:** the chat-bubble mark springs in. `SELF-HOSTED · OPEN SOURCE · MIT`, then **Feedback MCP**, then "Collect user feedback from any app. **Analyze it with Claude.**"
- **Narration (optional):** "Feedback MCP is a free, self-hosted way to collect user feedback, and read it back with Claude."
- **Music:** soft pad in.

### 2 · One endpoint in, 0:04–0:14 (frames 120–420)
- **On screen:** caption "ONE ENDPOINT IN / POST from any app." A terminal types the real `curl POST /api/v1/feedback`, then the `← 200 OK` response appears.
- **Capture:** VHS `terminal.mp4` (real curl against a running server). Falls back to the animated terminal if not captured. **Sync:** the tape's response lands ~frame 168 into the scene; keep the clip ≥10s.
- **Narration:** "Your apps POST to one endpoint. iOS, Android, web, any backend."

### 3 · Forms as config, 0:14–0:21 (frames 420–630)
- **On screen:** caption "FORMS AS CONFIG / No dashboard. Just files." The `bug-report.json` form definition writes itself line by line.
- **Narration:** "Forms are declarative JSON, validated with Zod. Adding one is a pull request, humans or LLMs can edit them."

### 4 · MCP out, 0:21–0:34 (frames 630–1020), the money beat
- **On screen:** caption "MCP OUT / Your AI is the **dashboard.**" A Claude chat: the question "What are iOS users asking for most this week?" springs in, then Claude's reply builds, 3 themes, then a bar chart grows in.
- **Narration:** "There's no dashboard. You connect the built-in MCP server to Claude and just ask. It runs the queries and summarizes for you."
- **Music:** lift here, this is the payoff.

### 5 · Your database, your infra, 0:34–0:41 (frames 1020–1230)
- **On screen:** "One env var. Three databases." Postgres / SQLite / Cloudflare D1 cards, each with `DATABASE_PROVIDER=…`, then the one-click deploy row (Render / Vercel / Cloudflare / Docker).
- **Narration:** "Feedback lives in a database you own. Switch engines with one env var. Deploy in one click."

### 6 · See it live, 0:41–0:50 (frames 1230–1500)
- **On screen:** caption "SEE IT LIVE / Clone it. Run it in a minute." The live marketing one-pager scrolls inside a browser frame.
- **Capture:** Playwright `site.webm` (real site scroll). Falls back to a browser-chrome placeholder. **Sync:** the test scrolls in 5 smooth steps at ~1.5s intervals; keep the clip ≥9s.
- **Narration:** "It's open source and MIT-licensed. Clone it, `docker compose up`, and you're collecting feedback."

### 7 · Outro / CTA, 0:50–0:56 (frames 1500–1680)
- **On screen:** mark + "No dashboard. **On purpose.**" + `★ github.com/Parra-Inc/feedback-mcp` + chips (MIT, Next.js 16 · Prisma 7, MCP over streamable HTTP).
- **Narration:** "Feedback MCP. Own your feedback. Link in the description."
- **Music:** resolve and fade.

---

## Alternate: the form capture

`capture/demo.spec.ts` also records `form.webm` (a real fill-and-submit of the demo
feedback form). It's not in the default cut, but you can swap it into scene 2 in
place of the terminal by editing `EndpointScene.tsx` to read `captures.form`, some
audiences prefer a product-looking form to a curl. Keep whichever is more honest for
your framing (the curl is the literal integration).

## Timing manifest

The capture writes `public/captures/timing.json` with the real second-offsets of each
beat (e.g. `form.submit`, `site.scroll3`). Use it to fine-tune scene lengths or to
place a caption exactly on a captured moment. It is data, not required, the default
cut plays the clips straight.
