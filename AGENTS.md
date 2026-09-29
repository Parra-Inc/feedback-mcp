## Before you push

Run `pnpm check` before pushing. It runs, in CI order, with deps already
installed:

1. Typecheck `@feedback-mcp/server`
2. Typecheck `@feedback-mcp/site`
3. Unit tests for `@feedback-mcp/server`
4. The server smoke test (build, boot against a throwaway SQLite db, exercise
   ingest, auth, admin, export, OAuth, MCP, and rate limiting)
5. Build `@feedback-mcp/site`

Takes roughly a minute, most of it the smoke test's `next build`. It never
deploys, never touches a real database, and never needs production secrets.

If you change what CI runs, update check to match.
