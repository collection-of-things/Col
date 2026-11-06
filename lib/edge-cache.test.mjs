import assert from "node:assert/strict";
import test from "node:test";
import { sharedMaxAge, withEdgeCache } from "./edge-cache.ts";

const response = (cacheControl, init = {}) => new Response("body", { ...init, headers: { "Cache-Control": cacheControl, ...init.headers } });

test("only public responses with s-maxage are stored", () => {
  assert.equal(sharedMaxAge(response("public, s-maxage=300, stale-while-revalidate=31535700")), 300);
  assert.equal(sharedMaxAge(response("public, max-age=14400, must-revalidate")), 0);
  assert.equal(sharedMaxAge(response("private, no-cache, no-store, max-age=0, must-revalidate")), 0);
  assert.equal(sharedMaxAge(response("public, s-maxage=300", { status: 502 })), 0);
  assert.equal(sharedMaxAge(response("public, s-maxage=300", { headers: { "Set-Cookie": "a=b" } })), 0);
});

test("a stored response answers the next GET of the same deploy without rendering", async () => {
  const store = new Map();
  const cache = { match: async (key) => store.get(String(key))?.clone(), put: async (key, value) => void store.set(String(key), value) };
  const writes = [];
  let renders = 0;
  const render = () => (renders++, response("public, s-maxage=300"));
  const get = (version, method = "GET") => withEdgeCache(new Request("https://usecol.com/", { method }), render, { cache, version, defer: (task) => writes.push(task) });
  assert.equal(await (await get("a")).text(), "body");
  await Promise.all(writes);
  assert.equal(await (await get("a")).text(), "body");
  assert.equal(renders, 1);
  await get("b");
  assert.equal(renders, 2, "a new deploy renders again");
  await get("a", "POST");
  assert.equal(renders, 3);
});
