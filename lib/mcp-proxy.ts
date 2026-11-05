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
