import { authorizationServerMetadata, getPublicOrigin, oauthCorsHeaders } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

// GET /.well-known/oauth-authorization-server (RFC 8414)
export async function GET(request: Request) {
  return Response.json(authorizationServerMetadata(getPublicOrigin(request)), {
    headers: oauthCorsHeaders,
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: oauthCorsHeaders });
}
