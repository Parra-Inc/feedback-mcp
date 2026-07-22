# HN launch day

Times are US Pacific. Post in the **6:00-9:00 AM PT** window (catches US East morning +
Europe afternoon). Aim for ~7:00 AM PT on a Tue/Wed/Thu.

"T" = the moment you submit.

| Time | Do |
|------|-----|
| T-12h | Confirm the repo README and [live site](https://parra-inc.github.io/feedback-mcp/) load cold. First comment final in clipboard. Warm your own channels with "launching tomorrow." |
| T-1h | Clear the calendar for 3 hours. Notifications on. First comment ready. Verify the demo GIF (if you made one) plays. |
| T-0 | Submit to HN. URL = the **GitHub repo**. Title from [`title.md`](title.md). |
| T+0 (seconds) | Post the [first comment](first-comment.md) as a top-level reply. |
| T+0 to T+15m | Share the link neutrally to your own channels ("I just posted Feedback MCP to HN"). **Never** ask for upvotes anywhere. Watch for the first replies. |
| T+15m to T+2h | **The whole game.** Reply to every comment, fastest on the critical ones. Do nothing else. |
| T+2h to T+6h | Keep answering. Capture feature requests. Thank thoughtful commenters. |
| T+6h to EOD | Steady presence, answer follow-ups. |
| T+24h | Retrospective (see [`follow-up.md`](follow-up.md)). |

## The first hour is the whole game

Ranking front-loads the first 1-2 hours of votes. You don't control votes, you control
the thread's energy, and the thread tracks how fast and how well you answer.

## Handling comments

| Comment type | Move |
|--------------|------|
| "Why no dashboard?" (you'll get this) | It's the core bet, not a gap. Explain: the read layer is MCP + REST + Slack, and asking Claude beats clicking a UI you never open. Point to `feedback_stats` / `search_feedback`. Don't get defensive. |
| "Why MCP and not just a REST API?" | Both exist; REST is there. MCP is what lets Claude/Claude Desktop query it conversationally without you wiring a client. |
| "Isn't this just a Slack webhook + a DB?" | Fair framing. The value is the config-as-code forms, the portable schema across 3 DBs, and the MCP OAuth so your AI can read it. Slack cross-posting is one optional output. |
| Valid technical critique | "You're right." Explain your reasoning, ask for their suggestion. |
| Competitor comparison (Canny, Sleekplan, etc.) | Be gracious. Your angle: self-hosted, own your data, no per-seat pricing, AI-native read layer. Never trash theirs. |
| Feature request | "Good call, noted." Or explain the constraint (e.g. Mongo is blocked on a Prisma adapter). |
| Trolling | One brief factual reply, or none. |

The whole thread is watching how you handle the hardest comment. Never argue, never go
sarcastic, never get defensive.

## Do not

- ❌ Ask anyone, anywhere, to upvote. Bannable, and the fastest way to kill the post.
- ❌ Vote or comment from alt accounts.
- ❌ Refresh the rank instead of answering comments.
- ❌ Start the Product Hunt launch the same day (unless someone else owns those comments).
- ❌ Post a marketing-voice anything. First person, plain, real trade-offs.

## If it goes flat after an hour

Information, not failure. Read the top comment: if people are confused about what it is,
the title or the above-the-fold was the problem, not the product. Don't repost or
vote-beg to rescue it. Note what to change and consider a cleaner re-up after 24h with a
more specific title (the `no dashboard` alternate in `title.md` is your re-up angle).
