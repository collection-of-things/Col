import { isMcpOriginAllowed } from "@/lib/mcp-origin";
import { mcpProxyHeaders } from "@/lib/mcp-proxy";

/**
 * Col's MCP endpoint is served by the standalone service in `mcp-app/`:
 * its verified preview payload exceeds what a Cloudflare Worker can hold, so
 * the site proxies here instead of bundling it. `COL_MCP_ORIGIN` points at
 * that service (e.g. `http://localhost:8787` in development).
 */
export async function POST(request: Request) {
  if (!isMcpOriginAllowed(request.headers.get("origin"), process.env.COL_MCP_ALLOWED_ORIGINS)) {
    return new Response("Forbidden Origin", { status: 403 });
  }
  const origin = process.env.COL_MCP_ORIGIN;
  if (!origin) return new Response("MCP service is not configured", { status: 503 });
  const body = await request.arrayBuffer();
  return fetch(new URL("/api/mcp", origin), { method: "POST", headers: mcpProxyHeaders(request.headers), body, signal: request.signal });
}
