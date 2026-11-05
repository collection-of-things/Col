import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { PROTOCOL_VERSION_META_KEY, CLIENT_CAPABILITIES_META_KEY } from "@modelcontextprotocol/server";

test("MCP disconnects release subscriptions and shutdown completes an active stream", { timeout: 60_000 }, async (t) => {
  // IPC emits the real shutdown event on Windows, where kill('SIGTERM')
  // terminates Node without invoking its signal handlers.
  const child = spawn(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--input-type=module", "-e", `
    process.on('message', () => process.emit('SIGTERM'));
    await import('./mcp-app/server.ts');
  `], { cwd: new URL("../", import.meta.url), env: { ...process.env, PORT: "0" }, stdio: ["ignore", "pipe", "pipe", "ipc"] });
  t.after(() => child.kill());
  let errors = "";
  child.stderr.setEncoding("utf8").on("data", chunk => { errors += chunk; });
  const url = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", code => reject(new Error(`Service exited ${code}: ${errors}`)));
    let output = "";
    child.stdout.setEncoding("utf8").on("data", chunk => {
      output += chunk;
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) resolve(match[0]);
    });
  });
  const listen = () => fetch(`${url}/api/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream, application/json", "mcp-protocol-version": "2026-07-28", "mcp-method": "subscriptions/listen" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "subscriptions/listen", params: { _meta: { [PROTOCOL_VERSION_META_KEY]: "2026-07-28", [CLIENT_CAPABILITIES_META_KEY]: {} }, notifications: { toolsListChanged: true } } }),
  });
  // The SDK allows 1024 concurrent subscriptions. Abandoning more than that
  // must still allow a fresh stream, rather than exhaust the shared handler.
  for (let i = 0; i < 1026; i++) {
    const response = await listen();
    assert.equal(response.status, 200, response.status === 200 ? undefined : await response.text());
    assert.match(response.headers.get("content-type"), /text\/event-stream/);
    const reader = response.body.getReader();
    const first = await reader.read();
    assert.match(new TextDecoder().decode(first.value), /"toolsListChanged":true/);
    await reader.cancel();
    // A completed HTTP round trip lets the service observe the disconnect.
    const health = await fetch(`${url}/health`);
    await health.text();
  }
  const active = await listen();
  const reader = active.body.getReader();
  await reader.read();
  const exited = once(child, "exit");
  child.send("shutdown");
  let finalFrames = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    finalFrames += new TextDecoder().decode(value);
  }
  assert.match(finalFrames, /"resultType":"complete"/);
  assert.deepEqual(await exited, [0, null]);
  assert.equal(errors, "");
});
