#!/bin/sh
set -e

echo "[feedback-mcp] database provider: ${DATABASE_PROVIDER:-postgresql}"

# The Prisma client is provider-specific, so it is (re)generated at container
# start based on the runtime DATABASE_PROVIDER, then the schema is applied.
node scripts/prepare-prisma.mjs
pnpm exec prisma generate
pnpm exec prisma db push

exec pnpm exec next start -p "${PORT:-3000}"
