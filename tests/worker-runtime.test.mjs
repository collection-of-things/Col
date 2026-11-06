import assert from "node:assert/strict";
import test from "node:test";
import { CLIENT_CAPABILITIES_META_KEY, PROTOCOL_VERSION_META_KEY } from "@modelcontextprotocol/server";
import { page, request } from "./site.mjs";

const meta = { [PROTOCOL_VERSION_META_KEY]: "2026-07-28", [CLIENT_CAPABILITIES_META_KEY]: {} };
const mcp = (method, params, headers = {}) => request("/api/mcp", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "mcp-protocol-version": "2026-07-28", "mcp-method": method, ...headers },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: { _meta: meta, ...params } }),
});

test("/api/mcp reaches the MCP service through the Worker's runtime variables", async () => {
  const listed = await (await mcp("tools/list", {})).json();
  assert.ok(listed.result.tools.some(({ name }) => name === "render_component"));
  // COL_MCP_ALLOWED_ORIGINS adds trusted origins; others are refused before proxying.
  assert.equal((await mcp("tools/list", {}, { origin: "http://localhost:3000" })).status, 200);
  const refused = await mcp("tools/list", {}, { origin: "https://untrusted.example" });
  assert.equal(refused.status, 403);
  assert.equal((await request("/api/mcp")).status, 405);
});

test("abandoned MCP streams are cancelled upstream, so the service never runs out of subscriptions", { timeout: 120_000 }, async () => {
  // The service allows 1024 concurrent subscriptions; each disconnect must release one.
  for (let i = 0; i < 1026; i++) {
    const response = await mcp("subscriptions/listen", { notifications: { toolsListChanged: true } }, { accept: "text/event-stream, application/json" });
    assert.equal(response.status, 200, `stream ${i}`);
    const reader = response.body.getReader();
    await reader.read();
    await reader.cancel();
    await (await request("/robots.txt")).text();
  }
});

test("pages and assets keep their cache semantics", async () => {
  const cacheControl = async (path) => {
    const response = await request(path);
    await response.arrayBuffer();
    return response.headers.get("cache-control");
  };
  assert.equal(await cacheControl("/"), "public, s-maxage=300, stale-while-revalidate=31535700");
  assert.equal(await cacheControl("/contributors"), "public, s-maxage=3600, stale-while-revalidate=31532400");
  for (const path of ["/libraries", "/components", "/integrations"]) {
    assert.equal(await cacheControl(path), "private, no-cache, no-store, max-age=0, must-revalidate", path);
  }
  const stylesheet = (await page("/")).match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
  assert.ok(stylesheet);
  assert.equal(await cacheControl(stylesheet), "public, max-age=31536000, immutable");
  const trailing = await request("/docs/");
  assert.equal(trailing.status, 307);
  assert.equal(new URL(trailing.headers.get("location"), "http://x").pathname, "/docs");
});

test("query strings stay plain text and render on the server", async () => {
  assert.ok((await page("/components?q=123")).includes('value="123"'));
  assert.ok((await page("/components?q=date%20picker")).includes('value="date picker"'));
});

test("/api/image serves resized WebP for local files and refuses other sources", async () => {
  const response = await request("/api/image?url=%2Fhero-logos%2Fshadcn-glow.png&w=256&q=75");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.ok((await response.arrayBuffer()).byteLength < 100_000);
  assert.equal((await request("/api/image?url=https%3A%2F%2Fexample.com%2Fa.png&w=256&q=75")).status, 400);
  assert.equal((await request("/api/image?url=%2Fmissing.png&w=256&q=75")).status, 404);
});
