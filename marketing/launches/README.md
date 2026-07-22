# Feedback MCP launch kit

Everything needed to launch [Feedback MCP](https://github.com/Parra-Inc/feedback-mcp)
on Hacker News and Product Hunt. Each folder is paste-ready: open the file, copy, post.

## The verdict: HN first, Product Hunt second

Feedback MCP is a self-hosted, open-source developer tool. That points squarely at
**Hacker News (Show HN)** as the primary launch, with **Product Hunt** as a reframed
secondary a few days later.

| Platform | Why it fits | Role |
|----------|-------------|------|
| **Hacker News** | Developer tool + open source + a genuinely novel angle (no dashboard, your AI reads the feedback over MCP). This is exactly HN's wheelhouse. | **Primary.** The room where this earns the right audience. |
| **Product Hunt** | The visual story is strong (form in, Claude out) and MCP is a hot topic there too. Less native to a self-hosted OSS tool, but a clean gallery carries it. | **Secondary,** 2-4 days after HN. |

**Do not run both on the same day** unless a second person owns the Product Hunt
comments. Split attention loses both. The recommended shape:

| Day | Move |
|-----|------|
| Day 0 (eve) | Warm your own channels: a short "launching tomorrow" note to X / Discord / anyone who'd care. |
| Day 1, ~7:00 AM PT | **Show HN.** Post, drop the first comment, live in the thread for 3 hours. |
| Day 1, all day | Answer every comment. The thread is the launch. |
| Day 4, 12:01 AM PT | **Product Hunt,** reframed warmer and more visual. Reuse the momentum and any testimonials from HN. |
| Day 6 | Recap on X / owned channels: "what happened when we launched." |

## Folders

- [`hacker-news/`](hacker-news/): the primary launch. Title, first comment, launch-day timeline, checklist, follow-up.
- [`product-hunt/`](product-hunt/): the secondary launch. Same set, plus a `gallery.md` and rendered gallery images under `product-hunt/exports/`.
- [`demo-video.md`](demo-video.md): the shared demo video (56s), built as code in [`../demo-video/`](../demo-video/). Used by both launches.

## Readiness gate (run before you post)

Blockers must all pass. Items marked **on you** are yours to confirm on the day.

| # | Check | Status |
|---|-------|--------|
| 1 | Demo works from a cold browser | ✅ Marketing site live at [parra-inc.github.io/feedback-mcp](https://parra-inc.github.io/feedback-mcp/) (200); `docker compose up` quickstart works from the README. **On you:** confirm the site still loads the morning of. |
| 2 | Landing page says what it does above the fold | ✅ "Collect user feedback from any app. Analyze it with Claude." |
| 3 | Someone free to answer comments for 3 hours | **On you.** Block the calendar before posting. This is the single biggest lever. |
| 4 | First comment drafted with substance + honest limitations | ✅ [`hacker-news/first-comment.md`](hacker-news/first-comment.md), [`product-hunt/first-comment.md`](product-hunt/first-comment.md) |
| 5 | Title is specific, concrete, no superlatives | ✅ [`hacker-news/title.md`](hacker-news/title.md), [`product-hunt/title.md`](product-hunt/title.md) |
| 6 | Pricing transparent | ✅ Free, MIT, self-hosted. No pricing to hide. |
| 7 | Not posted to the platform inside its cooldown | **On you.** First-time launch, so clear. |

**Strong-signal items still worth doing:**

- [ ] **The demo video** (56s: endpoint in → forms → Claude analysis → deploy → CTA). Highest-leverage asset; both platforms benefit and HN will ask. Built as code — see [`demo-video.md`](demo-video.md) and run [`/demo-video`](../../.claude/skills/demo-video/SKILL.md). Renders with animated stand-ins immediately; capture real footage + add music before launch.
- [ ] **HN account with some karma.** If yours is cold, spend a few days genuinely commenting first. Cold accounts get more scrutiny.
- [x] OG image renders (already in `assets/exports/og/`).
- [ ] 2-3 people who've actually used it and can speak to it in the thread.

## One primary goal

**GitHub stars + real self-host installs.** Keep every CTA pointed at the repo, not a
signup. Secondary goal: honest feedback on the "no dashboard, MCP is the interface"
bet.

## The narrative (source material for every asset)

I build a lot of small apps. Every one needs a way to hear from users, and every option
was wrong for me: SaaS feedback tools bill per seat and bury the data in a dashboard I
never open, and a raw Slack webhook turns into an unsearchable wall. I wanted one
endpoint to POST to from any app, the feedback in my own database, and to *read* it by
just asking Claude, not by building yet another admin panel. So the read interface is a
built-in MCP server: "summarize this week's bug reports," "what are iOS users asking for
most." No dashboard, by design. Your AI assistant is the dashboard.
