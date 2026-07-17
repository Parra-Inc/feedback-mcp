import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp/server";
import { getBearerToken } from "@/lib/auth/secret";
import { verifyMcpToken } from "@/lib/auth/admin";
import { getPublicOrigin } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

// Accepts the raw MCP_SECRET or an OAuth access token issued by this
// instance (see lib/auth/oauth.ts for the claude.ai connector flow).
function authenticateRequest(request: Request): boolean {
  const token = getBearerToken(request);
  if (!token) return false;
  return verifyMcpToken(token);
}

// POST /api/mcp
export async function POST(request: Request) {
  if (!authenticateRequest(request)) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Unauthorized" },
        id: null,
      },
      {
        status: 401,
        headers: {
          // Points OAuth-capable MCP clients at the discovery document.
          "WWW-Authenticate": `Bearer resource_metadata="${getPublicOrigin(request)}/.well-known/oauth-protected-resource"`,
        },
      }
    );
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
    enableJsonResponse: true, // Return JSON instead of SSE for simple request/response
  });

  await server.connect(transport);

  return transport.handleRequest(request);
}

// GET /api/mcp
export async function GET() {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Only POST requests are accepted for MCP",
      },
      id: null,
    },
    { status: 405 }
  );
}
