# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Cloudflare Workers deployment target backed by a D1 (SQLite) database, via OpenNext and `@prisma/adapter-d1`. New `DATABASE_PROVIDER=d1`, `wrangler.jsonc`, `build:cf`/`preview`/`cf:*` scripts, a `deploy-cloudflare.yml` workflow, and [docs/DEPLOY-CLOUDFLARE.md](docs/DEPLOY-CLOUDFLARE.md). Existing PostgreSQL, SQLite, Docker, Render, and Vercel targets are unchanged.
- Build-time config bundle (`pnpm build:config` → `lib/config/generated.json`) so the config tree loads without filesystem access on Workers (`CONFIG_SOURCE=bundle`).

### Changed

- The Prisma client is now constructed lazily (on first use) instead of at module load, so the D1 binding resolves per request on Workers.
- Bumped Next.js to 16.2.10 (required by `@opennextjs/cloudflare`).

## [0.2.0] - 2026-07-16

### Added

- Rate limiting on the ingest endpoint: per-IP and per-project fixed windows, tunable via `RATE_LIMIT_IP_PER_MINUTE` and `RATE_LIMIT_PROJECT_PER_MINUTE`, returning 429 with `Retry-After`.
- OAuth 2.1 support for the MCP server so claude.ai remote connectors can connect: RFC 9728/8414 discovery metadata, open dynamic client registration, a PKCE-required authorization flow gated by the MCP secret, and stateless HMAC access/refresh tokens. Rotating `MCP_SECRET` revokes all tokens.
- Data lifecycle endpoints: `GET`/`DELETE /api/v1/feedback/:id`, filtered bulk delete (`DELETE /api/v1/projects/:slug/feedback?user=&form=&platform=&before=`), and NDJSON export (`GET /api/v1/projects/:slug/export`).
- Optional automatic retention: set `FEEDBACK_RETENTION_DAYS` and older feedback is swept opportunistically (at most hourly) on ingest traffic.
- PostgreSQL migration history: the Docker entrypoint runs `prisma migrate deploy` for Postgres (SQLite keeps `db push`), with a baseline `init` migration.
- Test suite: 58 Vitest unit tests plus an end-to-end smoke script (`apps/server/scripts/smoke.sh`) covering ingest, auth, lifecycle, OAuth, MCP, and rate limiting.
- CI workflow running typecheck, unit tests, the smoke test, and the site build on every push and PR.
- Client integration examples for Swift and TypeScript in `examples/`.
- Community files: CONTRIBUTING.md, SECURITY.md, issue and PR templates.

### Fixed

- Docker entrypoint used the removed Prisma 7 `--skip-generate` flag.

## [0.1.0] - 2026-07-16

### Added

- Initial release: self-hosted feedback collection with a built-in MCP server.
- Ingest endpoint (`POST /api/v1/feedback`) with Zod validation against declarative form schemas.
- Config-as-code projects and forms under `config/projects/`.
- Admin read API and MCP server (8 read/analysis tools) guarded by `MCP_SECRET`.
- PostgreSQL and SQLite support via `DATABASE_PROVIDER`.
- Optional end-user JWT verification (JWKS, PEM, or HMAC) via jose.
- Optional Slack cross-posting after each accepted submission.
- Docker Compose self-hosting, Render blueprint, Vercel deploy button.
- Marketing one-pager deployed to GitHub Pages.

[Unreleased]: https://github.com/Parra-Inc/feedback-mcp/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Parra-Inc/feedback-mcp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Parra-Inc/feedback-mcp/releases/tag/v0.1.0
