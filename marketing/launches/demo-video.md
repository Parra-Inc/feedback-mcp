# Demo video (shared launch asset)

The single highest-leverage asset for both launches. A short, moving demo outperforms
static screenshots on Product Hunt and is the first thing HN commenters ask for. This one
is built as code so it re-renders on demand and stays on-brand.

## Where it lives

- **Project:** [`../demo-video/`](../demo-video/), a Remotion + VHS + Playwright pipeline.
- **Script:** [`../demo-video/script.md`](../demo-video/script.md), the timed beat sheet.
- **Build it:** run [`/demo-video`](../../.claude/skills/demo-video/SKILL.md), or
  `cd marketing/demo-video && npm install && npm run render`.
- **Output:** `marketing/demo-video/out/feedback-mcp-demo.mp4` (56s, 1080p) and
  `out/thumbnail.png`.

## The cut (56s)

Title → **one endpoint in** (real `curl`) → forms as config → **MCP out** (Claude answering
"what are iOS users asking for?" + chart) → your database / deploy → **live site** → CTA.
It mirrors the Product Hunt gallery beat-for-beat, so the still frames and the video read
as one story.

## How each platform uses it

| Platform | Placement |
|----------|-----------|
| **Product Hunt** | Add the MP4 as **gallery item #2**, right after the hero thumbnail, so it autoplays near the top. A moving demo is the difference-maker on PH. See [`product-hunt/gallery.md`](product-hunt/gallery.md). |
| **Hacker News** | Link it in the first comment ("2-min demo: …") and describe it in words too, HN doesn't autoplay and many read text-only. The repo README can embed it or link the MP4. |
| **X / owned** | The lead media for the launch-recap post. |
| **GitHub README** | Drop the MP4/GIF near the top; it's the best "what is this" in 10 seconds. |

## Two things still on you before it's final

1. **Capture the real footage** (optional but recommended): `npm run capture:terminal`
   (VHS, needs the server running) and `npm run capture` (Playwright, records the live
   site + form). Without them the video still renders with polished animated stand-ins.
2. **Add music:** drop a royalty-free track at `marketing/demo-video/public/music/track.mp3`
   and set `MUSIC_SRC`. See [`../demo-video/public/music/README.md`](../demo-video/public/music/README.md).

## Formats to export for the launch

- **MP4 1080p**, Product Hunt gallery, X, the repo.
- **A short GIF** (optional), for the README top and quick shares: convert with
  `ffmpeg -i out/feedback-mcp-demo.mp4 -vf "fps=15,scale=960:-1" out/demo.gif` (or render a
  15fps `--codec=gif` cut from Remotion). Keep it under ~10s / a few MB for the README.
