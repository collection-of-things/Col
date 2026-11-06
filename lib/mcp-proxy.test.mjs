import assert from "node:assert/strict";
import test from "node:test";
import { mcpProxyHeaders, proxyMcp } from "./mcp-proxy.ts";

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

test("MCP uploads reach upstream before their body finishes and retain cancellation", { timeout: 2000 }, async () => {
  let upload;
  const body = new ReadableStream({ start(controller) { upload = controller; } });
  const abort = new AbortController();
  const request = new Request("https://usecol.com/api/mcp", { method: "POST", body, duplex: "half", signal: abort.signal });
  const response = await proxyMcp(request, { COL_MCP_ORIGIN: "https://mcp.test" }, async (url, init) => {
    assert.equal(String(url), "https://mcp.test/api/mcp");
    assert.equal(init.body, request.body);
    assert.equal(request.bodyUsed, false);
    abort.abort();
    assert.equal(init.signal.aborted, true);
    return new Response(null, { status: 204 });
  });
  assert.equal(response.status, 204);
  upload.close();
});
