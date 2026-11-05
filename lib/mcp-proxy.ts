import { isMcpOriginAllowed } from "./mcp-origin.ts";

/**
 * Picks the request headers the site's `/api/mcp` proxy forwards to the
 * standalone MCP service: content negotiation plus every `Mcp-*` protocol
 * header (`Mcp-Protocol-Version`, `Mcp-Session-Id`, `Mcp-Method`, `Mcp-Name`,
 * `Mcp-Param-*`). The MCP handler rejects modern requests whose `Mcp-Method`
 * or `Mcp-Name` header is missing, so an allowlist of fixed names would break
 * them. Cookies, auth and hop-by-hop headers stay behind.
 */
export function mcpProxyHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const [name, value] of source) {
    if (name === "content-type" || name === "accept" || name.startsWith("mcp-")) headers.set(name, value);
  }
  return headers;
}

/** Runtime settings for the proxy, read from the Worker's dashboard variables. */
export type McpProxyEnv = {
  /** Base URL of the standalone service, e.g. `http://localhost:8787`. */
  COL_MCP_ORIGIN?: string;
  /** Comma-separated extra trusted browser origins. */
  COL_MCP_ALLOWED_ORIGINS?: string;
};

/**
 * Serves the site's `POST /api/mcp`: checks the browser origin, then streams the
 * request to the standalone service and its response back. The client's abort
 * signal is passed on, so a disconnect cancels the upstream stream.
 */
export async function proxyMcp(request: Request, env: McpProxyEnv, send: typeof fetch = fetch): Promise<Response> {
  if (!isMcpOriginAllowed(request.headers.get("origin"), env.COL_MCP_ALLOWED_ORIGINS)) {
    return new Response("Forbidden Origin", { status: 403 });
  }
  if (!env.COL_MCP_ORIGIN) return new Response("MCP service is not configured", { status: 503 });
  // Forward uploads with backpressure instead of buffering them in the isolate.
  // Node's fetch also requires duplex for streamed request bodies.
  const upstream = { method: "POST", headers: mcpProxyHeaders(request.headers), body: request.body, signal: request.signal, duplex: "half" };
  return send(new URL("/api/mcp", env.COL_MCP_ORIGIN), upstream);
}
