# Security Policy

## Supported versions

The latest release on `main` is supported. Older versions do not receive fixes; upgrade to the newest release.

## Reporting a vulnerability

Please do not open public issues for security problems.

Report privately via [GitHub private vulnerability reporting](https://github.com/Parra-Inc/feedback-mcp/security/advisories/new). Include reproduction steps and the impact you believe the issue has. You should get an initial response within a few days.

## Deployment hardening notes

- `MCP_SECRET` guards all reads (admin API + MCP) and the OAuth flow. Generate it with `openssl rand -hex 32` and rotate it if leaked; rotation invalidates every outstanding OAuth token at once.
- Ingest keys ship inside client apps. Treat them as spam deterrents, not authentication: anyone with your binary can extract them. Rate limits (`RATE_LIMIT_IP_PER_MINUTE`, `RATE_LIMIT_PROJECT_PER_MINUTE`) bound the damage; keep them enabled.
- The in-process rate limiter is per instance. If you run multiple replicas or serverless, enforce global limits at your reverse proxy or CDN.
- Run behind HTTPS. OAuth tokens and the MCP secret travel in the Authorization header.
