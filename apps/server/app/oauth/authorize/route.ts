import { safeEqual } from "@/lib/auth/secret";
import {
  CODE_PREFIX,
  CODE_TTL_SECONDS,
  nowSeconds,
  signOAuthToken,
} from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

interface AuthorizeParams {
  redirectUri: string;
  state: string;
  codeChallenge: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateParams(searchParams: URLSearchParams): AuthorizeParams | { error: string } {
  const responseType = searchParams.get("response_type");
  if (responseType !== "code") return { error: 'response_type must be "code"' };

  const redirectUri = searchParams.get("redirect_uri");
  if (!redirectUri || !/^https?:\/\//.test(redirectUri)) {
    return { error: "redirect_uri must be an http(s) URL" };
  }

  const codeChallenge = searchParams.get("code_challenge");
  if (!codeChallenge) return { error: "code_challenge is required (PKCE)" };

  const method = searchParams.get("code_challenge_method") ?? "S256";
  if (method !== "S256") return { error: "Only the S256 code_challenge_method is supported" };

  return {
    redirectUri,
    state: searchParams.get("state") ?? "",
    codeChallenge,
  };
}

function renderPage(params: AuthorizeParams, errorMessage?: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Connect to Feedback MCP</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0b0e14; color: #e6e9ef;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .card { width: min(400px, calc(100vw - 48px)); background: #11151f; border: 1px solid #1f2733;
    border-radius: 16px; padding: 32px; }
  .mark { font-size: 32px; margin-bottom: 12px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  p { color: #9aa4b2; font-size: 14px; line-height: 1.5; margin: 0 0 20px; }
  label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase; color: #9aa4b2; margin-bottom: 6px; }
  input { width: 100%; box-sizing: border-box; background: #0b0e14; color: #e6e9ef;
    border: 1px solid #1f2733; border-radius: 10px; padding: 12px; font-size: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  input:focus { outline: none; border-color: #34d399; }
  button { width: 100%; margin-top: 16px; background: #34d399; color: #0b0e14; border: none;
    border-radius: 10px; padding: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }
  button:hover { background: #10b981; }
  .error { color: #f87171; font-size: 13px; margin: 12px 0 0; }
</style>
</head>
<body>
  <main class="card">
    <div class="mark">💬</div>
    <h1>Connect to Feedback MCP</h1>
    <p>An MCP client is requesting access to this instance. Enter the server's MCP secret to approve it.</p>
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(params.redirectUri)}" />
      <input type="hidden" name="state" value="${escapeHtml(params.state)}" />
      <input type="hidden" name="code_challenge" value="${escapeHtml(params.codeChallenge)}" />
      <label for="secret">MCP secret</label>
      <input id="secret" name="secret" type="password" autocomplete="off" autofocus required />
      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}
      <button type="submit">Approve connection</button>
    </form>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: errorMessage ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// GET /oauth/authorize
export async function GET(request: Request) {
  const result = validateParams(new URL(request.url).searchParams);
  if ("error" in result) {
    return Response.json({ error: "invalid_request", error_description: result.error }, { status: 400 });
  }
  return renderPage(result);
}

// POST /oauth/authorize (the approval form submits here)
export async function POST(request: Request) {
  const form = await request.formData();
  const params: AuthorizeParams = {
    redirectUri: String(form.get("redirect_uri") ?? ""),
    state: String(form.get("state") ?? ""),
    codeChallenge: String(form.get("code_challenge") ?? ""),
  };
  if (!/^https?:\/\//.test(params.redirectUri) || !params.codeChallenge) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const secret = process.env.MCP_SECRET;
  if (!secret) {
    return renderPage(params, "This server has no MCP_SECRET configured.");
  }

  const provided = String(form.get("secret") ?? "");
  if (!provided || !safeEqual(provided, secret)) {
    return renderPage(params, "That secret is not correct.");
  }

  const code =
    CODE_PREFIX +
    signOAuthToken(
      {
        t: "code",
        exp: nowSeconds() + CODE_TTL_SECONDS,
        challenge: params.codeChallenge,
        redirectUri: params.redirectUri,
      },
      secret
    );

  const redirect = new URL(params.redirectUri);
  redirect.searchParams.set("code", code);
  if (params.state) redirect.searchParams.set("state", params.state);

  return Response.redirect(redirect.toString(), 302);
}
