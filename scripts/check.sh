#!/usr/bin/env bash
# Runs every verification step CI runs, in CI order. Assumes deps are
# installed. Never deploys, never touches a real database or secrets.
set -euo pipefail
cd "$(dirname "$0")/.."

step() { echo "==> $1"; }

step "Typecheck (server)"
pnpm --filter @feedback-mcp/server typecheck

step "Typecheck (site)"
pnpm --filter @feedback-mcp/site typecheck

step "Unit tests (server)"
pnpm --filter @feedback-mcp/server test

step "Smoke test (server build + boot + API/MCP/OAuth end to end)"
bash apps/server/scripts/smoke.sh

step "Build site"
pnpm --filter @feedback-mcp/site build

echo ""
echo "check OK: all steps passed"
