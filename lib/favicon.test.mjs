import assert from "node:assert/strict";
import test from "node:test";
import { createFaviconHandler } from "./favicon.ts";
import { libraries } from "../data/libraries.ts";
import { connectorPaths, integrations } from "../data/integrations.ts";
import config from "../next.config.ts";
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern.js";

const local = (query) => `https://col.test/api/favicon${query}`;
const icon = () => new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/png" } });

test("remote optimizer accepts only the expected GitHub avatar URLs", () => {
  const matches = (url) => hasRemoteMatch([], config.images.remotePatterns, new URL(url));
  assert.equal(matches("https://avatars.githubusercontent.com/u/208310261?v=4"), true);
  for (const url of [
    "https://avatars.githubusercontent.com:444/u/208310261?v=4",
    "https://avatars.githubusercontent.com/u/208310261?v=4&size=1",
    "https://avatars.githubusercontent.com/u/208310261",
    "https://www.google.com/s2/favicons?domain=example.com&sz=128",
  ]) assert.equal(matches(url), false, url);
});

test("favicon endpoint validates and normalizes catalog domains", async () => {
  const calls = [];
  const handle = createFaviconHandler(async (url, options) => { calls.push([String(url), options]); return icon(); });
  for (const query of ["", "?domain=example.com", "?domain=ui.shadcn.com&sz=32", "?domain=ui.shadcn.com&domain=example.com", "?domain=UI.SHADCN.COM", "?domain=ui.shadcn.com%26sz%3D32"]) {
    assert.equal((await handle(local(query))).status, 400, query);
  }
  assert.equal(calls.length, 0);
  const response = await handle(local("?domain=ui.shadcn.com"));
  assert.equal(response.status, 200);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
  assert.equal(calls[0][0], "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=128");
  assert.equal(calls[0][1].redirect, "error");
  assert.equal((await handle(local("?domain=ui.shadcn.com"))).status, 200);
  assert.equal(calls.length, 1);

  const urls = [...libraries.map((library) => library.url), ...integrations.flatMap((integration) => [integration.provider.url, ...connectorPaths(integration).map((connector) => connector.url)])];
  for (const url of urls) {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    assert.equal((await handle(local(`?domain=${domain}`))).status, 200, url);
  }
});

test("favicon endpoint coalesces concurrent fetches and limits retries", async () => {
  let time = 1;
  let calls = 0;
  let finish;
  const handle = createFaviconHandler(() => { calls++; return new Promise((resolve) => { finish = resolve; }); }, () => time);
  const first = handle(local("?domain=ui.shadcn.com"));
  const second = handle(local("?domain=ui.shadcn.com"));
  assert.equal(calls, 1);
  finish(new Response("bad", { headers: { "Content-Type": "image/svg+xml" } }));
  assert.equal((await first).status, 502);
  assert.equal((await second).status, 502);
  assert.equal((await handle(local("?domain=ui.shadcn.com"))).status, 429);
  time += 60_000;
  const retry = handle(local("?domain=ui.shadcn.com"));
  assert.equal(calls, 2);
  finish(new Response(new Uint8Array(128 * 1024 + 1), { headers: { "Content-Type": "image/png" } }));
  assert.equal((await retry).status, 502);
});
