import { getBearerToken, safeEqual } from "./secret";
import { ACCESS_TOKEN_PREFIX, verifyOAuthToken } from "./oauth";

export type AdminAuthResult =
  | { success: true }
  | { success: false; error: string; status: number };

// Accepts either the raw MCP_SECRET or an OAuth access token issued by this
// instance (which is an HMAC over MCP_SECRET, see lib/auth/oauth.ts).
export function verifyMcpToken(token: string): boolean {
  const secret = process.env.MCP_SECRET;
  if (!secret) return false;
  if (safeEqual(token, secret)) return true;
  if (token.startsWith(ACCESS_TOKEN_PREFIX)) {
    const payload = verifyOAuthToken(token.slice(ACCESS_TOKEN_PREFIX.length), secret);
    return payload?.t === "access";
  }
  return false;
}

// The MCP secret guards everything that reads feedback: the admin REST API
// and the MCP server. One instance-wide secret, set via the MCP_SECRET env.
export function verifyAdminRequest(request: Request): AdminAuthResult {
  if (!process.env.MCP_SECRET) {
    return {
      success: false,
      error: "Server is not configured: set the MCP_SECRET environment variable",
      status: 500,
    };
  }

  const token = getBearerToken(request);
  if (!token || !verifyMcpToken(token)) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  return { success: true };
}
