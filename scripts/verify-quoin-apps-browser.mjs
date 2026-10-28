import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createColMcpServer } from '../lib/mcp-server.ts';
import { previewWidgetHtml } from '../lib/preview-widget.ts';
import { libraries } from '../data/libraries.ts';
import { componentIndex } from '../data/components.ts';
import { libraryDetails } from '../data/library-details/index.ts';
import { libraryCorpus } from '../data/library-corpus/index.ts';
import { compatibility } from '../data/compatibility.ts';
import examples from '../data/quoin/examples.json' with { type: 'json' };
const require = createRequire(import.meta.url);
await mkdir('artifacts/quoin-browser-2026-10-28', { recursive: true });
const { chromium, expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
const mcp = createColMcpServer({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const [client, transport] = InMemoryTransport.createLinkedPair();
await mcp.connect(transport); await client.start();
let id = 0;
const pending = new Map();
client.onmessage = message => { pending.get(message.id)?.(message); pending.delete(message.id); };
async function request(method, params) {
  const requestId = ++id;
  const response = new Promise(resolve => pending.set(requestId, resolve));
  await client.send({ jsonrpc: '2.0', id: requestId, method, params });
  const reply = await response;
  if (reply.error) throw new Error(JSON.stringify(reply.error));
  return reply.result;
}
await request('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'Quoin browser verification', version: '1.0' } });
await client.send({ jsonrpc: '2.0', method: 'notifications/initialized' });
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/widget') { res.setHeader('Content-Type', 'text/html'); res.end(previewWidgetHtml()); return; }
  if (url.pathname === '/result') {
    const args = { id: 'quoin-ui/' + url.searchParams.get('name'), theme: 'dark' };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ args, result: await request('tools/call', { name: 'render_component', arguments: args }) })); return;
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#000;color:white}iframe{width:100%;height:1000px;border:0}</style>
  <iframe id="app" sandbox="allow-scripts" src="/widget"></iframe><script>
  const frame = document.getElementById('app'); window.events = []; window.ready = false;
  const send = message => frame.contentWindow.postMessage({jsonrpc:'2.0',...message}, '*');
  window.loadExample = async name => { const data = await (await fetch('/result?name='+encodeURIComponent(name))).json(); send({method:'ui/notifications/tool-input',params:{arguments:data.args}});send({method:'ui/notifications/tool-result',params:data.result});return data.result; };
  addEventListener('message', event => { if(event.source !== frame.contentWindow) return; const m=event.data; window.events.push(m);
    if(m.method==='ui/initialize') send({id:m.id,result:{protocolVersion:m.params.protocolVersion,hostInfo:{name:'Col verification host',version:'1.0'},hostCapabilities:{updateModelContext:{}},hostContext:{theme:'dark',displayMode:'inline',availableDisplayModes:['inline']}}});
    else if(m.method==='ui/notifications/initialized') window.ready=true;
    else if(m.id!==undefined) send({id:m.id,result:{}});
  });</script>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 }, colorScheme: 'dark' });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const results = [];
try {
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.waitForFunction(() => window.ready, { timeout: 30000 });
  const app = page.frameLocator('#app');
  for (const name of process.env.QUOIN_NAMES?.split(',') || Object.keys(examples)) {
    const startErrors = errors.length;
    const result = await page.evaluate(name => window.loadExample(name), name);
    const row = { name, available: result.structuredContent.preview.available, runtime: result.structuredContent.preview.runtime };
    try {
      await expect(app.locator('[data-col-provenance]')).toContainText('quoin-ui/' + name + ' —');
      const frame = app.frameLocator('iframe[title="Component preview"]');
      await frame.locator('#col-root > *').first().waitFor({ state: 'visible', timeout: 20000 });
      await frame.locator('#col-status').waitFor({ state: 'hidden', timeout: 10000 });
      row.errors = errors.slice(startErrors);
      row.pass = !row.errors.length;
      if (name === 'Button') { await frame.getByRole('button').click(); await expect(frame.getByRole('button')).toHaveText('Count: 1'); }
      if (name === 'Dialog') { await frame.getByRole('button').click(); await expect(frame.getByRole('dialog')).toBeVisible(); }
      // Next iteration replaces the real inner frame, including an open dialog portal.
    } catch(e) { row.pass = false; row.failure = e.message; }
    results.push(row); console.log(name, row.pass ? 'PASS' : 'FAIL', row.failure?.slice(0, 180) || '');
    await writeFile('artifacts/quoin-browser-2026-10-28/apps-results.json', JSON.stringify({ browser: browser.version(), results, errors, events: await page.evaluate(() => window.events.filter(e => e.method !== 'ui/notifications/size-changed')) }, null, 2));
  }
} finally { await browser.close(); server.close(); await mcp.close(); await client.close(); }
if (results.some(r => !r.pass)) process.exitCode = 1;
