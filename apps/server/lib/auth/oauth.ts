import { createHash, createHmac } from "node:crypto";
import { safeEqual } from "./secret";

// A deliberately minimal, stateless OAuth 2.1 implementation so MCP clients
// that require OAuth (like claude.ai remote connectors) can connect. There is
// exactly one "user": whoever knows MCP_SECRET. The authorize page asks for
// the secret, and every issued token is an HMAC over MCP_SECRET, so nothing
// needs to be stored in the database and rotating MCP_SECRET revokes every
// outstanding token at once.
//
// Tradeoff of statelessness: authorization codes are not single-use within
// their 5 minute lifetime. PKCE (required, S256) binds each code to the
// client that started the flow, which is the mitigation the spec relies on
// for public clients.

export const ACCESS_TOKEN_PREFIX = "mcp_at_";
export const REFRESH_TOKEN_PREFIX = "mcp_rt_";
export const CODE_PREFIX = "mcp_code_";

export const CODE_TTL_SECONDS = 5 * 60;
export const ACCESS_TTL_SECONDS = 7 * 24 * 60 * 60;
export const REFRESH_TTL_SECONDS = 90 * 24 * 60 * 60;

export interface OAuthTokenPayload {
  t: "code" | "access" | "refresh";
  exp: number; // epoch seconds
  challenge?: string; // PKCE S256 challenge, codes only
  redirectUri?: string; // codes only
}

function hmac(data: string, secret: string): string {
  return createHmac("sha256", `feedback-mcp-oauth:${secret}`).update(data).digest("base64url");
}

export function signOAuthToken(payload: OAuthTokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body, secret)}`;
}

export function verifyOAuthToken(token: string, secret: string): OAuthTokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, hmac(body, secret))) return null;

  let payload: OAuthTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function verifyPkce(codeVerifier: string, challenge: string): boolean {
  const computed = createHash("sha256").update(codeVerifier).digest("base64url");
  return safeEqual(computed, challenge);
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

// The public origin of this deployment, used in OAuth metadata. Behind a
// proxy set PUBLIC_URL; otherwise derived from forwarded headers or the
// request URL.
export function getPublicOrigin(request: Request): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? (url.protocol === "https:" ? "https" : "http");
  return `${proto}://${host}`;
}

export const oauthCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-protocol-version",
  "Access-Control-Max-Age": "86400",
};

export function protectedResourceMetadata(origin: string) {
  return {
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp"],
  };
}

export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
  };
}
