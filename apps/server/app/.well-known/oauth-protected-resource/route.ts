import { getPublicOrigin, oauthCorsHeaders, protectedResourceMetadata } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

// GET /.well-known/oauth-protected-resource (RFC 9728)
export async function GET(request: Request) {
  return Response.json(protectedResourceMetadata(getPublicOrigin(request)), {
    headers: oauthCorsHeaders,
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: oauthCorsHeaders });
}
