import { randomBytes } from "node:crypto";
import { oauthCorsHeaders } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

// POST /oauth/register (RFC 7591 dynamic client registration)
// Registration is open and stateless: any client may register, because the
// only thing a token grants is what MCP_SECRET grants, and issuing one always
// requires entering that secret on the authorize page.
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // Empty registration payloads are fine.
  }

  return Response.json(
    {
      client_id: `mcp_client_${randomBytes(12).toString("hex")}`,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: Array.isArray(body.redirect_uris) ? body.redirect_uris : [],
      client_name: typeof body.client_name === "string" ? body.client_name : undefined,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "mcp",
    },
    { status: 201, headers: oauthCorsHeaders }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: oauthCorsHeaders });
}
