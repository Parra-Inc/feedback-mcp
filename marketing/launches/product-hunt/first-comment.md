# PH maker's first comment

Post this as the maker's first comment the moment the launch goes live. Product Hunt tone
is warmer and more "why"-first than HN: lead with the story, end with a real question.

`[fill in]` markers are the only things to touch.

---

Hey Product Hunt 👋 Ian here, I made Feedback MCP.

I build a lot of small apps, and every one needs a way to hear from users. My options
always felt off: hosted feedback tools charge per seat and bury everything in a dashboard
I never actually open, and a raw Slack webhook turns into an unsearchable wall fast. I
just wanted one endpoint to POST to from any app, the feedback sitting in my own database,
and to *read* it by asking Claude instead of building yet another admin panel.

So that's what this is. There's no dashboard, on purpose. You send feedback to one API
endpoint, and you read it back through a built-in MCP server. In claude.ai, Claude
Desktop, or Claude Code you just ask: "summarize this week's bug reports," "what are iOS
users asking for most," and Claude runs the queries for you. Your AI assistant is the
dashboard.

A few things I'm proud of:

- **Forms are config, not a database.** You declare projects and forms as JSON, so adding
  one is a pull request, and an LLM can edit your forms as easily as you can.
- **Your data, your infra.** Postgres, SQLite, or Cloudflare D1 with one env var. It's
  MIT-licensed and deploys in one click to Render, Vercel, Cloudflare Workers, or any
  Docker host. No SaaS, no per-seat pricing.
- **It connects to Claude as a proper MCP connector** with a real OAuth flow, so there are
  no extra accounts to manage.

It's early and opinionated. The biggest thing it deliberately *doesn't* have is a UI to
click through feedback, and if that's a dealbreaker for you, I'd genuinely like to know.
Mongo support and a drop-in feedback widget are on the roadmap.

Repo (MIT): https://github.com/Parra-Inc/feedback-mcp

Question for you: **if your AI assistant could answer one question about your users'
feedback every morning, what would you want it to be?** 👇
