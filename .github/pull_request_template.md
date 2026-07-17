## What does this PR do?

<!-- One or two sentences. Link related issues with "Fixes #123". -->

## Checklist

- [ ] `pnpm --filter @feedback-mcp/server typecheck` passes
- [ ] `pnpm --filter @feedback-mcp/server test` passes
- [ ] `pnpm --filter @feedback-mcp/server smoke` passes
- [ ] `CHANGELOG.md` updated under `[Unreleased]` (user-facing changes)
- [ ] `README.md` / `.env.example` updated (new env vars, endpoints, or config fields)
- [ ] Schema changes include a PostgreSQL migration (`pnpm db:migrate`)
