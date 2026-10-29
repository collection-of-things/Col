import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { createColMcpServer } from "../lib/mcp-server.ts";
import { previewWidgetHtml } from "../lib/preview-widget.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { solidPreviews } from "../data/component-previews/solid/index.ts";

// A small MCP Apps host exercises real transport, widget delivery, and frame replacement.
const require = createRequire(import.meta.url);
const { chromium, expect } = require((process.env.PLAYWRIGHT_MODULE || "playwright") + "/test");
const output = process.env.SOLID_APPS_OUTPUT || ".scratch/solid-library-69/apps";
await mkdir(output, { recursive: true });
const mcp = createColMcpServer({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const [client, transport] = InMemoryTransport.createLinkedPair();
await mcp.connect(transport);
await client.start();
let nextId = 0;
const pending = new Map();
client.onmessage = message => { pending.get(message.id)?.(message); pending.delete(message.id); };
async function request(method, params) {
  const id = ++nextId;
  const response = new Promise(resolve => pending.set(id, resolve));
  await client.send({ jsonrpc: "2.0", id, method, params });
  const reply = await response;
  if (reply.error) throw new Error(JSON.stringify(reply.error));
  return reply.result;
}
await request("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "Col Solid verification host", version: "1" } });
await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/widget") { res.setHeader("Content-Type", "text/html"); res.end(previewWidgetHtml()); return; }
  if (url.pathname === "/result") {
    const args = { id: url.searchParams.get("id"), theme: url.searchParams.get("theme") };
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ args, result: await request("tools/call", { name: "render_component", arguments: args }) }));
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}iframe{width:100%;height:1000px;border:0}</style>
  <iframe id="app" sandbox="allow-scripts" src="/widget"></iframe><script>
  const frame = document.getElementById('app'); window.events = []; window.ready = false;
  const send = message => frame.contentWindow.postMessage({jsonrpc:'2.0',...message}, '*');
  window.loadExample = async (id,theme) => { const data = await (await fetch('/result?id='+encodeURIComponent(id)+'&theme='+theme)).json(); send({method:'ui/notifications/tool-input',params:{arguments:data.args}}); send({method:'ui/notifications/tool-result',params:data.result}); return data.result; };
  addEventListener('message', event => { if(event.source !== frame.contentWindow) return; const m=event.data; window.events.push(m);
    if(m.method==='ui/initialize') send({id:m.id,result:{protocolVersion:m.params.protocolVersion,hostInfo:{name:'Col verification host',version:'1'},hostCapabilities:{updateModelContext:{}},hostContext:{theme:'light',displayMode:'inline',availableDisplayModes:['inline']}}});
    else if(m.method==='ui/notifications/initialized') window.ready=true;
    else if(m.id!==undefined) send({id:m.id,result:{}});
  });</script>`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const results = [];
try {
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => window.ready, { timeout: 30000 });
  const app = page.frameLocator("#app");
  for (const theme of ["light", "dark"]) {
    for (const id of process.env.SOLID_NAMES?.split("|") || Object.keys(solidPreviews)) {
      const before = errors.length;
      const row = { id, theme };
      try {
        const result = await page.evaluate(({ id, theme }) => window.loadExample(id, theme), { id, theme });
        if (result.isError || result.structuredContent.preview.code !== undefined || !result._meta?.["col/preview"]?.code) throw new Error("MCP response did not isolate the source payload");
        await expect(app.locator("[data-col-provenance]")).toContainText(`${id} —`);
        const frame = app.frameLocator('iframe[title="Component preview"]');
        await frame.locator("#col-root > *").first().waitFor({ state: "visible", timeout: 25000 });
        await frame.locator("#col-status").waitFor({ state: "hidden", timeout: 10000 });
        row.errors = errors.slice(before);
        if (row.errors.length) throw new Error(row.errors.join("; "));
        row.pass = true;
      } catch (error) { row.pass = false; row.failure = error.message; }
      results.push(row);
      console.log(theme, id, row.pass ? "PASS" : "FAIL", row.failure?.slice(0, 200) || "");
      await writeFile(`${output}/results.json`, JSON.stringify({ browser: browser.version(), results }, null, 2));
    }
  }
} finally { await browser.close(); server.close(); await mcp.close(); await client.close(); }
console.log(JSON.stringify({ total: results.length, passed: results.filter(row => row.pass).length }));
if (results.some(row => !row.pass)) process.exitCode = 1;
