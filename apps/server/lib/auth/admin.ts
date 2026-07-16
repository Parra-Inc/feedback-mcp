import { getBearerToken, safeEqual } from "./secret";

export type AdminAuthResult =
  | { success: true }
  | { success: false; error: string; status: number };

// The MCP secret guards everything that reads feedback: the admin REST API
// and the MCP server. One instance-wide secret, set via the MCP_SECRET env.
export function verifyAdminRequest(request: Request): AdminAuthResult {
  const secret = process.env.MCP_SECRET;
  if (!secret) {
    return {
      success: false,
      error: "Server is not configured: set the MCP_SECRET environment variable",
      status: 500,
    };
  }

  const token = getBearerToken(request);
  if (!token || !safeEqual(token, secret)) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  return { success: true };
}
