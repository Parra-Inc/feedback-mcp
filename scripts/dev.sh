#!/usr/bin/env bash
#
# feedback-mcp dev: one command to boot the local stack.
#
#   Frees stale ports, starts the dev Postgres (when DATABASE_PROVIDER is
#   postgresql), syncs the schema, optionally tunnels through ngrok, opens
#   or refreshes the Chrome tab, then runs the server and site dev servers.
#
# Usage:
#   pnpm dev                normal boot (server :3065 + site :3066)
#   pnpm dev:force          wipe the dev Postgres volume, resync, clear caches
#   pnpm dev:tunnel         boot with an ngrok tunnel to the server
#   bash scripts/dev.sh --help
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# --- Config (per project) -------------------------------------------------------
SERVER_PORT=3065               # feedback server, next dev (host-managed)
SITE_PORT=3066                 # marketing site, next dev (host-managed)
STUDIO_PORT=5572               # prisma studio (host-managed)
PG_PORT=5452                   # dev postgres (docker-managed)
COMPOSE="docker compose -f apps/server/docker-compose.yml"
COMPOSE_PROJECT="feedback-mcp-dev"   # matches the compose file's `name:` field
SERVER_ENV="apps/server/.env"

# --- Colors (only when stdout is a TTY) -------------------------------------------
if [ -t 1 ]; then
  C_ACCENT='\033[38;5;33m'; C_DIM='\033[2m'; C_BOLD='\033[1m'; C_RESET='\033[0m'
else
  C_ACCENT=''; C_DIM=''; C_BOLD=''; C_RESET=''
fi

usage() {
  cat <<EOF
Usage: bash scripts/dev.sh [flags]

  --force, -f     Wipe the dev Postgres volume, resync schema, clear caches
  --tunnel, -t    Start an ngrok tunnel to the server and inject PUBLIC_URL
  --studio, -s    Also run Prisma Studio
  --port N, -p N  Override the server port (default $SERVER_PORT)
  --help, -h      Show this help
EOF
}

# --- Flags ---------------------------------------------------------------------------
FORCE=false; TUNNEL=false; STUDIO=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force|-f)          FORCE=true; shift ;;
    --tunnel|-t|--ngrok) TUNNEL=true; shift ;;   # --ngrok kept for muscle memory
    --studio|-s)         STUDIO=true; shift ;;
    --port|-p)           SERVER_PORT="$2"; shift 2 ;;
    --help|-h)           usage; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; usage; exit 1 ;;
  esac
done

# --- Env bootstrap -------------------------------------------------------------------
# First run: create apps/server/.env from the example so `next dev` (which
# loads it, not this shell's env) has the local defaults.
if [ ! -f "$SERVER_ENV" ] && [ -f "$SERVER_ENV.example" ]; then
  echo "Creating $SERVER_ENV from $SERVER_ENV.example..."
  cp "$SERVER_ENV.example" "$SERVER_ENV"
fi
# Read ONLY DATABASE_URL and DATABASE_PROVIDER from the env file. Never
# source the whole file: app vars can share names with this script's config.
# Next and Prisma load the env file themselves; the script needs these two
# only for the provider switch and the localhost guard. Either may be absent
# (SQLite mode, or the docker Postgres fallback), hence the || true.
if [ -f "$SERVER_ENV" ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' "$SERVER_ENV" | tail -1 | cut -d= -f2- | tr -d '"' || true)
  DATABASE_PROVIDER=$(grep -E '^DATABASE_PROVIDER=' "$SERVER_ENV" | tail -1 | cut -d= -f2- | tr -d '"' || true)
fi
PROVIDER="${DATABASE_PROVIDER:-postgresql}"

# Refuse to run destructive db commands against anything but localhost. Env
# files sometimes hold a production URL (Neon, RDS); db:sync --accept-data-loss
# against that would be catastrophic. SQLite mode is skipped: its file: URL is
# local by definition. Empty is fine: prisma falls back to the localhost
# docker Postgres.
if [ "$PROVIDER" = "postgresql" ]; then
  case "${DATABASE_URL:-}" in
    ""|*@localhost*|*@127.0.0.1*) ;;
    *)
      echo "DATABASE_URL does not point at localhost:" >&2
      echo "  $DATABASE_URL" >&2
      echo "Refusing to run db:sync against a remote database." >&2
      echo "Point $SERVER_ENV at the docker Postgres for local dev." >&2
      exit 1
      ;;
  esac
fi

# --- Preflight -----------------------------------------------------------------------------
DOCKER_UP=false
if docker info >/dev/null 2>&1; then DOCKER_UP=true; fi
if [ "$PROVIDER" = "postgresql" ] && ! $DOCKER_UP; then
  echo "Docker isn't running and DATABASE_PROVIDER is postgresql." >&2
  echo "Start Docker Desktop, or use SQLite: DATABASE_PROVIDER=sqlite pnpm dev" >&2
  exit 1
fi

# --- Free ports --------------------------------------------------------------------------------
# Host-managed ports: kill stale dev-server / studio processes.
kill_port() {
  local port=$1 pids
  pids=$(lsof -ti:"$port" 2>/dev/null) || true
  if [ -n "$pids" ]; then
    echo "Killing processes on port $port..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

# Docker-managed ports: stop containers from OTHER projects squatting on the
# port (including a local self-host container from the root compose files).
# Our own dev compose services are left running; `up -d --wait` reuses them.
free_docker_port() {
  local port=$1 containers
  containers=$(docker ps --filter "publish=$port" \
    --format '{{.ID}} {{.Label "com.docker.compose.project"}}' 2>/dev/null \
    | awk -v own="$COMPOSE_PROJECT" '$2 != own {print $1}') || true
  if [ -n "$containers" ]; then
    echo "Stopping other projects' containers on port $port..."
    echo "$containers" | xargs docker stop >/dev/null 2>&1 || true
  fi
}

if $DOCKER_UP; then
  for port in "$SERVER_PORT" "$SITE_PORT" "$PG_PORT"; do free_docker_port "$port"; done
fi
for port in "$SERVER_PORT" "$SITE_PORT" "$STUDIO_PORT"; do kill_port "$port"; done

# --- Tunnel (opt-in) ----------------------------------------------------------------------------
STARTED_NGROK=false
NGROK_URL=""
STUDIO_PID=""
cleanup() {
  # Strip the injected block so stale tunnel URLs never leak into later runs.
  if $TUNNEL; then
    sed -i '' '/# Added by dev.sh --tunnel/,$d' "$SERVER_ENV" 2>/dev/null || true
  fi
  if [ -n "$STUDIO_PID" ]; then
    kill "$STUDIO_PID" 2>/dev/null || true
  fi
  if $STARTED_NGROK; then
    echo "Stopping ngrok..."
    killall ngrok 2>/dev/null || true
  fi
}
if $TUNNEL; then
  if ! command -v ngrok-url >/dev/null 2>&1; then
    echo "ngrok-url helper not found on PATH." >&2
    exit 1
  fi
  # Remember whether ngrok was already running so cleanup only kills our own.
  if ! curl -s -o /dev/null http://localhost:4040 2>/dev/null; then
    STARTED_NGROK=true
  fi
  NGROK_URL=$(ngrok-url "$SERVER_PORT")
  if [ -z "$NGROK_URL" ]; then
    echo "Failed to get ngrok URL. Is ngrok authenticated?" >&2
    echo "Run: ngrok config add-authtoken <your-token>" >&2
    exit 1
  fi

  # OAuth discovery metadata (claude.ai connectors) reads PUBLIC_URL.
  {
    echo ""
    echo "# Added by dev.sh --tunnel (removed on exit)"
    echo "PUBLIC_URL=$NGROK_URL"
  } >> "$SERVER_ENV"
fi
if $TUNNEL || $STUDIO; then
  trap cleanup EXIT
fi

# --- Infra + database -------------------------------------------------------------------------------
if [ "$PROVIDER" = "postgresql" ]; then
  if $FORCE; then
    echo "Force reset: tearing down the dev Postgres volume..."
    $COMPOSE down -v
  fi
  echo "Starting dev Postgres..."
  $COMPOSE up -d --wait
fi

if $FORCE; then
  echo "Clearing build caches..."
  rm -rf apps/server/.next apps/site/.next
fi

echo "Syncing database schema..."
pnpm --filter @feedback-mcp/server db:sync --accept-data-loss

# --- Banner -------------------------------------------------------------------------------------------
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
echo ""
printf "${C_BOLD}  feedback-mcp${C_RESET}\n"
printf "  ${C_ACCENT}Server${C_RESET}    http://localhost:%s\n" "$SERVER_PORT"
[ -n "$LAN_IP" ] && printf "  ${C_ACCENT}Network${C_RESET}   http://%s:%s\n" "$LAN_IP" "$SERVER_PORT"
printf "  ${C_ACCENT}Site${C_RESET}      http://localhost:%s\n" "$SITE_PORT"
$STUDIO && printf "  ${C_ACCENT}Studio${C_RESET}    http://localhost:%s\n" "$STUDIO_PORT"
if [ "$PROVIDER" = "postgresql" ]; then
  printf "  ${C_ACCENT}Postgres${C_RESET}  %s\n" "${DATABASE_URL:-postgresql://feedback:feedback@localhost:$PG_PORT/feedback}"
else
  printf "  ${C_ACCENT}SQLite${C_RESET}    %s\n" "${DATABASE_URL:-file:./data/feedback.db}"
fi
if [ -n "$NGROK_URL" ]; then
  printf "  ${C_ACCENT}Tunnel${C_RESET}    %s\n" "$NGROK_URL"
  printf "${C_DIM}  Health check: %s/api/health${C_RESET}\n" "$NGROK_URL"
fi
echo ""

# --- Open or refresh Chrome --------------------------------------------------------------------------------
(
  until curl -s -o /dev/null -m 2 "http://localhost:$SERVER_PORT"; do sleep 1; done
  "$SCRIPT_DIR/lib/open-chrome-tab.sh" "http://localhost:$SERVER_PORT" 2>/dev/null || true
) &

# --- Handoff -------------------------------------------------------------------------------------------------
if $STUDIO; then
  echo "Starting Prisma Studio on port $STUDIO_PORT..."
  pnpm --filter @feedback-mcp/server db:studio &
  STUDIO_PID=$!
fi

echo "Starting dev servers..."
if $TUNNEL || $STUDIO; then
  # No exec: the EXIT trap must survive to clean up ngrok, env, and studio.
  pnpm -r --parallel run dev
else
  exec pnpm -r --parallel run dev
fi
