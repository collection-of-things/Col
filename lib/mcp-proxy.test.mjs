import assert from "node:assert/strict";
import test from "node:test";
import { mcpProxyHeaders } from "./mcp-proxy.ts";

test("MCP proxy forwards content negotiation and every Mcp-* header, nothing else", () => {
  const forwarded = mcpProxyHeaders(new Headers({
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2026-07-28",
    "Mcp-Session-Id": "session",
    "Mcp-Method": "tools/call",
    "Mcp-Name": "search_libraries",
    "Mcp-Param-Query": "button",
    Cookie: "secret=1",
    Authorization: "Bearer token",
    Host: "usecol.com",
  }));
  assert.deepEqual([...forwarded.keys()].sort(), [
    "accept", "content-type", "mcp-method", "mcp-name", "mcp-param-query", "mcp-protocol-version", "mcp-session-id",
  ]);
  assert.equal(forwarded.get("mcp-method"), "tools/call");
});
