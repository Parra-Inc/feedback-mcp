# Product Hunt launch (secondary)

The secondary launch, reframed from Hacker News: warmer, benefit-first, and carried by a
visual gallery. Run it **3-4 days after HN**, not the same day (unless a second person
owns these comments).

## Files

| File | What it's for |
|------|---------------|
| [`title.md`](title.md) | Name, tagline (≤60 chars) + alternates, description, topics |
| [`first-comment.md`](first-comment.md) | Paste-ready maker's first comment, story-first, ends on a question |
| [`gallery.md`](gallery.md) | The 6-frame gallery order + captions; images in [`exports/gallery/`](exports/gallery/) |
| [`launch-day.md`](launch-day.md) | 12:01 AM PT timeline + comment-handling |
| [`checklist.md`](checklist.md) | Pre-launch gate as tickable items |
| [`follow-up.md`](follow-up.md) | T+1 day retrospective + what it feeds next |

## The gallery (already rendered)

Six on-brand frames at 1270×760, in [`exports/gallery/`](exports/gallery/):

1. **Hero** (thumbnail): collect feedback, analyze with Claude
2. **One endpoint in**: the curl POST
3. **MCP out**: Claude answering "what are iOS users asking for?"
4. **Forms as config**: declarative JSON, no dashboard
5. **Your database**: Postgres / SQLite / D1, one env var, one-click deploy
6. **No dashboard. On purpose.**: CTA to the repo

Re-render after editing a template:

```bash
open-assets render marketing/launches/product-hunt --output marketing/launches/product-hunt/exports --force
```

## The 60-second version

1. **When:** 12:01 AM PT, 3-4 days after the HN launch, to bank a full day.
2. **Name/tagline:** from `title.md`. Topics: Developer Tools, Open Source, AI.
3. **Gallery:** upload the 6 frames in order; add a demo GIF at position 2 if you can.
4. **Immediately:** post the maker's first comment.
5. **Then:** answer every comment through the day. Never ask for upvotes.

## One thing worth doing before launch

Render the **demo video** and add it as gallery item #2. It's the single highest-leverage
addition to a Product Hunt gallery. It's built as code — see [`../demo-video.md`](../demo-video.md)
and run [`/demo-video`](../../../.claude/skills/demo-video/SKILL.md). Capture the real
footage and add music for the polished cut.

## Related

- Top-level plan and sequencing: [`../README.md`](../README.md)
- The HN launch this follows: [`../hacker-news/`](../hacker-news/)
