#!/usr/bin/env bash
# End-to-end smoke test: builds the server, boots it against a throwaway
# SQLite database, and exercises ingest, auth, admin, lifecycle, OAuth
# metadata, MCP, and rate limiting. Exits non-zero on the first failure.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${SMOKE_PORT:-3199}"
BASE="http://localhost:${PORT}"
WORKDIR="$(mktemp -d)"

export DATABASE_PROVIDER=sqlite
export DATABASE_URL="file:${WORKDIR}/smoke.db"
export MCP_SECRET=smoke-mcp-secret
export EXAMPLE_APP_INGEST_KEY=smoke-ingest-key
export RATE_LIMIT_IP_PER_MINUTE=25
export NEXT_TELEMETRY_DISABLED=1

SERVER_PID=""
cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

fail() { echo "SMOKE FAIL: $1"; exit 1; }

step() { echo "==> $1"; }

step "prepare + generate + push (sqlite)"
node scripts/prepare-prisma.mjs
pnpm exec prisma generate > /dev/null
pnpm exec prisma db push > /dev/null

step "next build"
pnpm exec next build > /dev/null

step "next start on :${PORT}"
pnpm exec next start -p "$PORT" > "${WORKDIR}/server.log" 2>&1 &
SERVER_PID=$!

for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/health" 2>/dev/null || true)
  [ "$code" = "200" ] && break
  [ "$i" = "60" ] && { cat "${WORKDIR}/server.log"; fail "server did not become healthy"; }
  sleep 1
done

step "health"
curl -sf "$BASE/api/health" | grep -q '"status":"ok"' || fail "health not ok"

step "submit valid feedback -> 201"
code=$(curl -s -o "${WORKDIR}/submit.json" -w "%{http_code}" -X POST "$BASE/api/v1/feedback" \
  -H "Content-Type: application/json" -H "X-Feedback-Key: smoke-ingest-key" \
  -d '{"project":"example-app","form":"bug-report","platform":"ios","data":{"title":"Smoke","description":"smoke test","severity":"low"},"metadata":{"appVersion":"9.9.9"}}')
[ "$code" = "201" ] || fail "expected 201, got $code"
grep -q '"id":"fb_' "${WORKDIR}/submit.json" || fail "no prefixed feedback id"
FEEDBACK_ID=$(python3 -c "import json;print(json.load(open('${WORKDIR}/submit.json'))['feedback']['id'])")

step "invalid data -> 400 with details"
code=$(curl -s -o "${WORKDIR}/bad.json" -w "%{http_code}" -X POST "$BASE/api/v1/feedback" \
  -H "Content-Type: application/json" -H "X-Feedback-Key: smoke-ingest-key" \
  -d '{"project":"example-app","form":"bug-report","data":{"title":"missing description"}}')
[ "$code" = "400" ] || fail "expected 400, got $code"
grep -q "does not match" "${WORKDIR}/bad.json" || fail "missing schema error message"

step "wrong ingest key -> 401"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/feedback" \
  -H "Content-Type: application/json" -H "X-Feedback-Key: wrong" \
  -d '{"project":"example-app","form":"bug-report","data":{"title":"x","description":"y"}}')
[ "$code" = "401" ] || fail "expected 401, got $code"

step "admin list without auth -> 401, with auth -> 200"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/projects")
[ "$code" = "401" ] || fail "expected 401, got $code"
curl -sf "$BASE/api/v1/projects" -H "Authorization: Bearer smoke-mcp-secret" \
  | grep -q '"slug":"example-app"' || fail "admin project list"

step "get + delete feedback by id"
curl -sf "$BASE/api/v1/feedback/$FEEDBACK_ID" -H "Authorization: Bearer smoke-mcp-secret" \
  | grep -q "$FEEDBACK_ID" || fail "get by id"
curl -sf -X DELETE "$BASE/api/v1/feedback/$FEEDBACK_ID" -H "Authorization: Bearer smoke-mcp-secret" \
  | grep -q '"deleted":true' || fail "delete by id"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/feedback/$FEEDBACK_ID" \
  -H "Authorization: Bearer smoke-mcp-secret")
[ "$code" = "404" ] || fail "expected 404 after delete, got $code"

step "bulk delete requires a filter"
code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/api/v1/projects/example-app/feedback" -H "Authorization: Bearer smoke-mcp-secret")
[ "$code" = "400" ] || fail "expected 400, got $code"

step "export streams NDJSON"
curl -s -X POST "$BASE/api/v1/feedback" \
  -H "Content-Type: application/json" -H "X-Feedback-Key: smoke-ingest-key" \
  -d '{"project":"example-app","form":"feature-request","data":{"title":"Export me","details":"row for export"}}' > /dev/null
curl -sf "$BASE/api/v1/projects/example-app/export" -H "Authorization: Bearer smoke-mcp-secret" \
  | head -1 | python3 -c "import json,sys; json.loads(sys.stdin.readline())" || fail "export is not NDJSON"

step "OAuth discovery metadata"
curl -sf "$BASE/.well-known/oauth-protected-resource" | grep -q '"authorization_servers"' \
  || fail "protected resource metadata"
curl -sf "$BASE/.well-known/oauth-authorization-server" | grep -q '"token_endpoint"' \
  || fail "authorization server metadata"

step "OAuth full flow (register -> authorize -> token -> MCP call)"
VERIFIER=$(python3 -c "import secrets;print(secrets.token_urlsafe(48))")
CHALLENGE=$(python3 -c "
import base64,hashlib
v='$VERIFIER'
print(base64.urlsafe_b64encode(hashlib.sha256(v.encode()).digest()).rstrip(b'=').decode())")
curl -sf -X POST "$BASE/oauth/register" -H "Content-Type: application/json" \
  -d '{"client_name":"smoke","redirect_uris":["https://client.test/cb"]}' \
  | grep -q '"client_id"' || fail "dynamic registration"
LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" -X POST "$BASE/oauth/authorize" \
  --data-urlencode "secret=smoke-mcp-secret" \
  --data-urlencode "redirect_uri=https://client.test/cb" \
  --data-urlencode "state=xyz" \
  --data-urlencode "code_challenge=$CHALLENGE")
echo "$LOCATION" | grep -q "code=mcp_code_" || fail "authorize did not issue a code"
CODE=$(python3 -c "
from urllib.parse import urlparse, parse_qs
print(parse_qs(urlparse('$LOCATION').query)['code'][0])")
curl -sf -X POST "$BASE/oauth/token" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=$CODE" \
  --data-urlencode "code_verifier=$VERIFIER" \
  --data-urlencode "redirect_uri=https://client.test/cb" > "${WORKDIR}/token.json"
grep -q '"access_token"' "${WORKDIR}/token.json" || fail "token exchange"
ACCESS_TOKEN=$(python3 -c "import json;print(json.load(open('${WORKDIR}/token.json'))['access_token'])")
curl -s -X POST "$BASE/api/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  | grep -q '"list_feedback"' || fail "MCP tools/list with OAuth access token"

step "PKCE mismatch rejected"
LOCATION2=$(curl -s -o /dev/null -w "%{redirect_url}" -X POST "$BASE/oauth/authorize" \
  --data-urlencode "secret=smoke-mcp-secret" \
  --data-urlencode "redirect_uri=https://client.test/cb" \
  --data-urlencode "code_challenge=$CHALLENGE")
CODE2=$(python3 -c "
from urllib.parse import urlparse, parse_qs
print(parse_qs(urlparse('$LOCATION2').query)['code'][0])")
curl -s -X POST "$BASE/oauth/token" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=$CODE2" \
  --data-urlencode "code_verifier=not-the-right-verifier" \
  --data-urlencode "redirect_uri=https://client.test/cb" \
  | grep -q '"invalid_grant"' || fail "PKCE mismatch was not rejected"

step "MCP with raw secret + stats"
curl -s -X POST "$BASE/api/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer smoke-mcp-secret" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"feedback_stats","arguments":{"project":"example-app","groupBy":"form"}},"id":2}' \
  | python3 -c "
import json, sys
response = json.load(sys.stdin)
stats = json.loads(response['result']['content'][0]['text'])
assert stats['total'] >= 1, stats
assert stats['groupBy'] == 'form', stats
" || fail "feedback_stats"

step "MCP 401 advertises OAuth discovery"
curl -s -i -X POST "$BASE/api/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  | grep -qi "www-authenticate: Bearer resource_metadata" || fail "missing WWW-Authenticate"

step "rate limiting returns 429 eventually"
GOT_429=""
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/feedback" \
    -H "Content-Type: application/json" -H "X-Feedback-Key: smoke-ingest-key" \
    -d '{"project":"example-app","form":"bug-report","data":{"title":"rl","description":"rate limit probe"}}')
  if [ "$code" = "429" ]; then GOT_429=1; break; fi
done
[ -n "$GOT_429" ] || fail "never hit the rate limit"

echo ""
echo "SMOKE OK: all checks passed"
