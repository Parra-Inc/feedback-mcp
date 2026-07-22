# HN first comment

Post this as a top-level comment within seconds of the submission going live. It carries
the technical substance the title can't, and the "what it doesn't do yet" section
disarms the top critical reply before anyone writes it.

HN wants the hard parts first. Lead with the substance, not the "why."

`[fill in]` markers are the only things to touch before posting.

---

Hi HN, Ian here, I built this.

I ship a lot of small apps, and every one needs a feedback channel. My options always
felt wrong: hosted feedback tools bill per seat and bury everything in a dashboard I
never open, and a raw Slack webhook becomes an unsearchable wall within a week. What I
actually wanted was one endpoint to POST to from any app, the data in my own database,
and to *read* it by asking Claude instead of building another admin panel. So there's no
dashboard, on purpose. The read interface is a built-in MCP server: "summarize this
week's bug reports," "what are iOS users asking for most," and Claude runs the queries.

What's interesting under the hood:

- **The MCP server is the read layer, not an afterthought.** It's served over streamable
  HTTP with a full stateless OAuth 2.1 flow (HMAC-signed tokens over a single
  `MCP_SECRET`, PKCE, open dynamic client registration), so claude.ai and Claude Desktop
  can add it as a custom connector with no per-user accounts. Rotating `MCP_SECRET`
  revokes every issued token. Tools: `list_feedback`, `search_feedback`, `feedback_stats`,
  etc.
- **Projects and forms are declarative JSON config, not database rows.** Adding a form is
  a pull request, and an LLM can edit your form schema as easily as you can. Submissions
  are validated against the form's field definitions with Zod. The only DB table is the
  feedback itself.
- **One portable Prisma schema across Postgres, SQLite, and Cloudflare D1,** switched with
  a single env var. A prepare script rewrites the datasource provider before generate, and
  each provider uses its Prisma driver adapter. On Workers it runs on D1 at the edge (no
  per-seat pricing, data stays yours); the Prisma client is a lazy proxy so the D1 binding
  resolves per request, and the config tree is bundled at build since you can't walk the
  filesystem at runtime there.
- Ingest is rate-limited per-IP and per-project out of the box, and there's NDJSON export
  plus filtered bulk delete for GDPR erasure and a retention sweep.

What it doesn't do yet:

- **No web dashboard, by design.** If you want a UI to click through feedback, this is the
  wrong tool. The interface is the MCP server, the REST read API, and optional Slack
  cross-posting.
- **No MongoDB yet,** blocked on a Prisma 7 driver adapter for Mongo.
- **Destructive ops are REST-only.** Delete isn't exposed as an MCP tool yet (didn't want
  an LLM deleting feedback on a misread).
- Rate limiting is in-process, so multi-replica or serverless deployments need a shared
  limit at the proxy.

Repo (MIT): https://github.com/Parra-Inc/feedback-mcp
Live one-pager: https://parra-inc.github.io/feedback-mcp/

Happy to go deep on the stateless MCP OAuth flow, the config-as-code choice over an admin
API, or the single-schema-across-three-databases setup. What would you want it to do that
it doesn't?
