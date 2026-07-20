# Contributing to Feedback MCP

Thanks for helping make Feedback MCP better. This guide covers everything you need to get a change from idea to merged PR.

## Development setup

Requirements: Node 24+, pnpm 9+, Docker (for the local Postgres and the container smoke tests).

```bash
git clone https://github.com/Parra-Inc/feedback-mcp.git
cd feedback-mcp
pnpm install

# Option A: PostgreSQL (matches production defaults)
pnpm up                      # local Postgres on :5452
pnpm db:sync

# Option B: SQLite (no Docker needed)
DATABASE_PROVIDER=sqlite pnpm db:sync

# Run the server (http://localhost:3065)
MCP_SECRET=dev EXAMPLE_APP_INGEST_KEY=dev pnpm dev:server
```

Or boot everything at once (frees stale ports, starts the dev Postgres,
syncs the schema, runs the server and the site): `pnpm dev`.

Other useful commands (all from the repo root unless noted):

| Command | What it does |
|---|---|
| `pnpm dev:site` | Marketing site dev server on :3066 |
| `pnpm --filter @feedback-mcp/server test` | Unit tests (Vitest) |
| `pnpm --filter @feedback-mcp/server smoke` | Full end-to-end smoke test (build, boot, API/MCP/OAuth) |
| `pnpm --filter @feedback-mcp/server typecheck` | TypeScript check |
| `pnpm --filter @feedback-mcp/server db:studio` | Prisma Studio on :5572 |

## Project layout

```
apps/server   the self-hosted app: ingest API, read API, MCP server, OAuth
apps/site     the marketing one-pager (static export, GitHub Pages)
assets        open-assets project for the banner and social images
```

## Making schema changes

The Prisma schema lives in `apps/server/prisma/schema/`. Two rules:

1. Keep it **portable**: the same schema runs on PostgreSQL and SQLite. No provider-specific types (`Json`, `dbgenerated(...)`, enums). JSON is stored as `String`; IDs are generated in the app layer (`lib/id.ts`).
2. **Create a migration for PostgreSQL.** With the dev Postgres running (`pnpm up`):

```bash
cd apps/server
DATABASE_PROVIDER=postgresql pnpm db:migrate   # prompts for a migration name
```

SQLite deployments intentionally use `prisma db push` (see `docker-entrypoint.sh`), so no SQLite migration files are needed.

Note: `scripts/prepare-prisma.mjs` rewrites the datasource provider in `schema.prisma` based on `DATABASE_PROVIDER`. Commit the file with `provider = "postgresql"` (the default).

## Testing your change

Every PR should pass all three:

```bash
pnpm --filter @feedback-mcp/server typecheck
pnpm --filter @feedback-mcp/server test
pnpm --filter @feedback-mcp/server smoke
```

CI runs the same checks plus the site build. If you add behavior, add a unit test; if you add an endpoint or flow, extend `apps/server/scripts/smoke.sh`.

## Pull requests

- Keep PRs focused: one change per PR.
- Update `CHANGELOG.md` under `[Unreleased]` for anything user-facing.
- Update `README.md` and `apps/server/.env.example` if you add env vars, endpoints, or config fields.
- No secrets in code or fixtures. Config references secrets by env var name on purpose.

## Style

- TypeScript strict mode, no `any` unless there is truly no alternative.
- API routes follow the existing pattern: a `// METHOD /path` comment, auth check first with early return, Zod validation with `z.flattenError` details, `Response.json(...)` with namespaced payloads (`{ feedback }`, `{ projects }`).
- Never use em dashes in copy or comments.

## Versioning and releases

Semver. Maintainers cut releases by updating `CHANGELOG.md`, bumping the package versions, tagging `vX.Y.Z`, and publishing a GitHub release.

## Questions

Open a [discussion or issue](https://github.com/Parra-Inc/feedback-mcp/issues). For security problems, see [SECURITY.md](SECURITY.md) instead of filing a public issue.
