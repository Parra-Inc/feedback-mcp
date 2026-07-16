import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp/server";
import { getBearerToken, safeEqual } from "@/lib/auth/secret";

export const dynamic = "force-dynamic";

function authenticateRequest(request: Request): boolean {
  const secret = process.env.MCP_SECRET;
  if (!secret) return false;

  const token = getBearerToken(request);
  if (!token) return false;

  return safeEqual(token, secret);
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
      { status: 401 }
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
