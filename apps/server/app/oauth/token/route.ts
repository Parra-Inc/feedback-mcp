import {
  ACCESS_TOKEN_PREFIX,
  ACCESS_TTL_SECONDS,
  CODE_PREFIX,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TTL_SECONDS,
  nowSeconds,
  oauthCorsHeaders,
  signOAuthToken,
  verifyOAuthToken,
  verifyPkce,
} from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

function tokenError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    { status, headers: oauthCorsHeaders }
  );
}

function issueTokens(secret: string) {
  const accessToken =
    ACCESS_TOKEN_PREFIX +
    signOAuthToken({ t: "access", exp: nowSeconds() + ACCESS_TTL_SECONDS }, secret);
  const refreshToken =
    REFRESH_TOKEN_PREFIX +
    signOAuthToken({ t: "refresh", exp: nowSeconds() + REFRESH_TTL_SECONDS }, secret);

  return Response.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TTL_SECONDS,
      refresh_token: refreshToken,
      scope: "mcp",
    },
    { headers: oauthCorsHeaders }
  );
}

// POST /oauth/token
export async function POST(request: Request) {
  const secret = process.env.MCP_SECRET;
  if (!secret) {
    return tokenError("server_error", "This server has no MCP_SECRET configured.", 500);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return tokenError("invalid_request", "Expected a form-encoded request body.");
  }

  const grantType = String(form.get("grant_type") ?? "");

  if (grantType === "authorization_code") {
    const code = String(form.get("code") ?? "");
    const codeVerifier = String(form.get("code_verifier") ?? "");
    const redirectUri = String(form.get("redirect_uri") ?? "");

    if (!code.startsWith(CODE_PREFIX)) {
      return tokenError("invalid_grant", "Unrecognized authorization code.");
    }
    const payload = verifyOAuthToken(code.slice(CODE_PREFIX.length), secret);
    if (!payload || payload.t !== "code" || !payload.challenge) {
      return tokenError("invalid_grant", "The authorization code is invalid or expired.");
    }
    if (!codeVerifier || !verifyPkce(codeVerifier, payload.challenge)) {
      return tokenError("invalid_grant", "PKCE verification failed.");
    }
    if (payload.redirectUri && redirectUri && payload.redirectUri !== redirectUri) {
      return tokenError("invalid_grant", "redirect_uri does not match the authorization request.");
    }
    return issueTokens(secret);
  }

  if (grantType === "refresh_token") {
    const refreshToken = String(form.get("refresh_token") ?? "");
    if (!refreshToken.startsWith(REFRESH_TOKEN_PREFIX)) {
      return tokenError("invalid_grant", "Unrecognized refresh token.");
    }
    const payload = verifyOAuthToken(refreshToken.slice(REFRESH_TOKEN_PREFIX.length), secret);
    if (!payload || payload.t !== "refresh") {
      return tokenError("invalid_grant", "The refresh token is invalid or expired.");
    }
    return issueTokens(secret);
  }

  return tokenError("unsupported_grant_type", `Unsupported grant_type "${grantType}".`);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: oauthCorsHeaders });
}
