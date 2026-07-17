#!/bin/sh
set -e

echo "[feedback-mcp] database provider: ${DATABASE_PROVIDER:-postgresql}"

# The Prisma client is provider-specific, so it is (re)generated at container
# start based on the runtime DATABASE_PROVIDER, then the schema is applied.
# PostgreSQL gets real migration history; SQLite uses db push (its migrations
# would need separate SQL, and push is safe: it refuses destructive changes).
node scripts/prepare-prisma.mjs
pnpm exec prisma generate

provider="${DATABASE_PROVIDER:-postgresql}"
if [ "$provider" = "postgresql" ] || [ "$provider" = "postgres" ]; then
  pnpm exec prisma migrate deploy
else
  pnpm exec prisma db push
fi

exec pnpm exec next start -p "${PORT:-3000}"
