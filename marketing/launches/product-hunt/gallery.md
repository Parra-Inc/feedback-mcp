# Product Hunt gallery

Six brand-matched frames, rendered at the Product Hunt gallery size (1270×760). Upload in
this order. **Frame 1 is the thumbnail** and does most of the work in the feed, so it
leads.

Rendered PNGs: [`exports/gallery/`](exports/gallery/). Source templates:
[`screenshots/`](screenshots/).

| # | File | Caption to paste under it | Job |
|---|------|---------------------------|-----|
| 1 | [`01-hero.png`](exports/gallery/01-hero.png) | Collect user feedback from any app. Analyze it with Claude. One endpoint in, an MCP server out. | **Thumbnail.** The whole pitch in one frame: form → server → Claude. |
| 2 | [`02-endpoint-in.png`](exports/gallery/02-endpoint-in.png) | One endpoint in. POST from iOS, Android, web, or any backend, validated against your form schema. | Show how feedback gets in. Real curl call. |
| 3 | [`03-mcp-out.png`](exports/gallery/03-mcp-out.png) | MCP out. Connect the built-in server to Claude and just ask. Your AI assistant is the dashboard. | The payoff. This is the "aha." |
| 4 | [`04-forms-as-config.png`](exports/gallery/04-forms-as-config.png) | Forms are declarative JSON, not database rows. Adding one is a pull request, editable by humans or LLMs. | The config-as-code design bet. |
| 5 | [`05-your-database.png`](exports/gallery/05-your-database.png) | Your data, your infra. Postgres, SQLite, or Cloudflare D1 with one env var. Deploy in one click. | Own-your-data + easy deploy. |
| 6 | [`06-cta.png`](exports/gallery/06-cta.png) | No dashboard, on purpose. Free, open-source, self-hosted, MIT. Clone it and be running in a minute. | Closing CTA to the repo. |

## Strongly recommended: add the demo video as gallery item #2

A static gallery underperforms one with a moving demo. This one is already built as code:
see [`../demo-video.md`](../demo-video.md) and run [`/demo-video`](../../../.claude/skills/demo-video/SKILL.md)
(or `cd marketing/demo-video && npm install && npm run render`). It's the same 56s cut that
mirrors these frames: endpoint in → forms → Claude analysis → deploy → CTA.

Drop the rendered MP4 in right after the hero (position 2) so it autoplays near the top.
Capture the real terminal + live-site footage and add music first (both documented in the
demo-video project) for the polished version.

## Re-rendering

Edit any template in [`screenshots/`](screenshots/), then from the repo root:

```bash
open-assets render marketing/launches/product-hunt --output marketing/launches/product-hunt/exports --force
```

One template only: add `--collection gallery --template 03-mcp-out`.

## Notes on the art

- Palette, type (Inter + JetBrains Mono), the chat-bubble mark, and the grid/glow backdrop
  all match the repo's existing `assets/` banner and OG so the launch reads as one brand.
- Frames render at 1270×760 (exact PH gallery size). The `assets.json` also declares a 2×
  size; open-assets renders the native size by default. For 2× crispness, run with
  `--size 2x`.
