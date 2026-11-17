import assert from "node:assert/strict";
import { test } from "node:test";
import { createUsageStore, libraryFromToolCall } from "../mcp-app/usage.ts";
import { forwardLibraryUsage } from "../lib/library-usage.ts";

test("MCP tool calls map to the library they used; searches count for none", () => {
  assert.equal(libraryFromToolCall("get_library", { slug: "shadcn-ui" }), "shadcn-ui");
  assert.equal(libraryFromToolCall("get_component", { id: "shadcn-ui/Date Picker" }), "shadcn-ui");
  assert.equal(libraryFromToolCall("render_component", { id: "magicui/Marquee", format: "html" }), "magicui");
  assert.equal(libraryFromToolCall("search_libraries", { query: "date picker" }), null);
  assert.equal(libraryFromToolCall("get_component", { id: "no-separator" }), null);
});

test("ranking sums sources and events within each window", () => {
  const store = createUsageStore(":memory:");
  const now = new Date("2026-11-17T12:00:00Z");
  const daysAgo = (days) => new Date(now.getTime() - days * 86_400_000);
  store.record("shadcn-ui", "mcp", "get_component", now);
  store.record("shadcn-ui", "mcp", "get_component", now);
  store.record("shadcn-ui", "web", "view", daysAgo(6));
  store.record("magicui", "web", "view", now);
  store.record("magicui", "mcp", "render_component", daysAgo(10));
  store.record("magicui", "web", "outbound", daysAgo(20));

  assert.deepEqual(store.ranking(7, now), [
    { library: "shadcn-ui", total: 3, mcp: 2, web: 1, events: { get_component: 2, view: 1 } },
    { library: "magicui", total: 1, mcp: 0, web: 1, events: { view: 1 } },
  ]);
  assert.deepEqual(store.ranking(30, now).map(({ library, total }) => [library, total]), [["magicui", 3], ["shadcn-ui", 3]]);
  store.close();
});

test("the site forwards only the library and event, with the service token", async () => {
  const sent = [];
  const send = async (url, init) => (sent.push([String(url), init]), new Response(null, { status: 204 }));
  const env = { COL_MCP_ORIGIN: "https://mcp.example", COL_USAGE_TOKEN: "secret" };
  const beacon = (body) => new Request("https://usecol.com/api/usage", { method: "POST", body: JSON.stringify(body), headers: { cookie: "a=b" } });

  assert.equal((await forwardLibraryUsage(beacon({ library: "shadcn-ui", event: "view", extra: "x" }), env, send)).status, 204);
  assert.deepEqual(sent, [["https://mcp.example/usage", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer secret" },
    body: JSON.stringify({ library: "shadcn-ui", event: "view" }),
  }]]);
  assert.equal((await forwardLibraryUsage(beacon({ library: "shadcn-ui", event: "copy" }), env, send)).status, 400);
  assert.equal((await forwardLibraryUsage(beacon({ library: "shadcn-ui", event: "view" }), {}, send)).status, 204);
  assert.equal(sent.length, 1);
});
