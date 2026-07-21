# Deploy to Cloudflare Workers (D1)

Feedback MCP runs on Cloudflare Workers with a [D1](https://developers.cloudflare.com/d1/) database (SQLite at the edge). There are no servers to manage, no external database, and no per-seat pricing. This is an alternative to the Docker / Render / Vercel targets in the main [README](../README.md); the app code is identical, selected by `DATABASE_PROVIDER=d1`.

## How it works

- **Hosting:** [OpenNext](https://opennext.js.org/cloudflare) adapts the Next.js app to a Worker (`pnpm build:cf` produces `.open-next/worker.js`).
- **Database:** a D1 binding named `DB`. `lib/prisma/client.ts` uses `@prisma/adapter-d1` when `DATABASE_PROVIDER=d1`.
- **Config:** Workers cannot read the `config/` directory tree at runtime, so `pnpm build:config` bundles it into `lib/config/generated.json` and the Worker reads that (`CONFIG_SOURCE=bundle`, set in `wrangler.jsonc`).
- **Secrets:** `MCP_SECRET` and ingest keys are Worker secrets, pushed by CI (or `wrangler secret put`), never committed.

All Cloudflare settings live in [`apps/server/wrangler.jsonc`](../apps/server/wrangler.jsonc).

## Option A: one-time manual deploy

From `apps/server`:

```bash
# 1. Authenticate wrangler (opens a browser)
pnpm exec wrangler login

# 2. Create the D1 database, then paste its id into wrangler.jsonc
#    (replace REPLACE_WITH_D1_DATABASE_ID)
pnpm cf:d1:create

# 3. Apply the schema to the remote D1 database
pnpm cf:d1:migrate

# 4. Build and deploy
pnpm cf:deploy

# 5. Set the secrets (the worker must exist first, so after the first deploy)
pnpm exec wrangler secret put MCP_SECRET
pnpm exec wrangler secret put EXAMPLE_APP_INGEST_KEY
# optional:
pnpm exec wrangler secret put SLACK_WEBHOOK_URL
```

Then attach a custom domain: Cloudflare dashboard → Workers & Pages → `feedback-mcp-web-production` → Settings → Domains & Routes. Set `PUBLIC_URL` as a var in `wrangler.jsonc` (or a secret) so the OAuth discovery metadata reports the right origin.

## Option B: continuous deploy via GitHub Actions

[`.github/workflows/deploy-cloudflare.yml`](../.github/workflows/deploy-cloudflare.yml) builds, provisions D1 (create-if-missing, then substitutes the id), applies migrations, deploys, and pushes secrets on every push to `main`. It is inert until you configure:

**Repo/org variable**

- `CLOUDFLARE_ACCOUNT_ID` — your account id. The job is skipped when this is empty, so forks are unaffected.

**`production` environment secrets**

- `CLOUDFLARE_API_TOKEN` — token with `Workers Scripts:Edit`, `D1:Edit`, and `Account Settings:Read`.
- `MCP_SECRET` — `openssl rand -hex 32`.
- `EXAMPLE_APP_INGEST_KEY` — the ingest key for the example project (rename per your own projects).
- `SLACK_WEBHOOK_URL`, `EXAMPLE_APP_SLACK_WEBHOOK` — optional; empty values are skipped.

```bash
gh variable set CLOUDFLARE_ACCOUNT_ID --body "<account-id>"
gh secret set CLOUDFLARE_API_TOKEN --env production
gh secret set MCP_SECRET --env production --body "$(openssl rand -hex 32)"
gh secret set EXAMPLE_APP_INGEST_KEY --env production --body "$(openssl rand -hex 32)"
```

## Local preview against a real Worker (workerd + local D1)

`pnpm dev` still runs plain `next dev` against Postgres or SQLite. To exercise the actual Worker build with a local D1:

```bash
cd apps/server
cp .dev.vars.example .dev.vars      # fill in MCP_SECRET and EXAMPLE_APP_INGEST_KEY
pnpm build:cf                       # OpenNext build
pnpm cf:d1:migrate:local            # apply schema to the local D1
pnpm preview                        # runs the worker in workerd on localhost
```

Then submit and query exactly as in the README, pointing at the preview URL.

## Schema changes

The D1 schema lives in [`apps/server/prisma/d1/migrations`](../apps/server/prisma/d1/migrations) as SQLite SQL. After changing the Prisma schema, regenerate the migration:

```bash
cd apps/server
DATABASE_PROVIDER=sqlite pnpm prisma:prepare
pnpm exec prisma migrate diff \
  --from-schema-datasource prisma/schema \
  --to-schema-datamodel prisma/schema \
  --script > prisma/d1/migrations/000N_description.sql
DATABASE_PROVIDER=postgresql pnpm prisma:prepare   # restore the committed default
```

`wrangler d1 migrations apply` tracks which files have run, so only new ones execute. (PostgreSQL deployments keep their own history under `prisma/migrations`; the two never mix.)

## Rollback

`pnpm exec wrangler rollback` reverts to the previous Worker version; secrets are versioned with each deploy.
