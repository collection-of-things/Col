import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createCatalogueTools } from '../lib/mcp-tools.ts';
import { libraries } from '../data/libraries.ts';
import { componentIndex } from '../data/components.ts';
import { libraryDetails } from '../data/library-details/index.ts';
import { libraryCorpus } from '../data/library-corpus/index.ts';
import { compatibility } from '../data/compatibility.ts';
import examples from '../data/quoin/examples.json' with { type: 'json' };
import { interact } from './quoin-browser-interactions.mjs';

// Opt-in browser verification; intentionally outside npm test's offline test discovery.

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = new URL('../artifacts/quoin-browser-2026-10-28/', import.meta.url);
await mkdir(output, { recursive: true });
const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const name = url.searchParams.get('name') || 'Button';
  const theme = url.searchParams.get('theme') || 'light';
  const result = tools.invoke('render_component', { id: `quoin-ui/${name}`, theme, format: 'html' });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{color-scheme:${theme};background:${theme === 'dark' ? '#000' : '#fff'};color:${theme === 'dark' ? '#fff' : '#111'};font:14px system-ui}body{margin:8px}</style>${result.structuredContent.html}`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
console.log('Browser:', browser.version());
const results = [];
const interactionMode = process.env.QUOIN_INTERACTIONS === '1';
try {
  for (const [label, width, theme] of [['desktop-light', 1280, 'light'], ['desktop-dark', 1280, 'dark'], ['mobile-light', 390, 'light'], ['mobile-dark', 390, 'dark']]) {
    if (process.env.QUOIN_PROFILES && !process.env.QUOIN_PROFILES.split(',').includes(label)) continue;
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
    for (const name of process.env.QUOIN_NAMES?.split(',') || Object.keys(examples)) {
      const page = await context.newPage();
      page.setDefaultTimeout(7000);
      const errors = [], failedRequests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', r => failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
      const row = { name, profile: label, errors, failedRequests };
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/?name=${encodeURIComponent(name)}&theme=${theme}`);
        const frame = page.frameLocator('iframe[data-col-preview]');
        await frame.locator('#col-root > *').first().waitFor({ state: 'visible', timeout: 25000 });
        await frame.locator('#col-status').waitFor({ state: 'hidden', timeout: 10000 });
        if (interactionMode) {
          await interact(name, frame, page, async state => {
            await frame.locator('body').evaluate(async () => { await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))); });
            await page.locator('iframe').screenshot({ path: new URL(`${label}-${name.replaceAll(' ', '-')}-${state}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
            row.popupBounds = await frame.locator('.Popup,.MenuPopup,.DrawerPopup,.Toast,[role="tooltip"]').evaluateAll(elements => elements.filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, viewport: { width: innerWidth, height: innerHeight } }; }));
            if (row.popupBounds.some(r => r.x < -1 || r.y < -1 || r.x + r.width > r.viewport.width + 1 || r.y + r.height > r.viewport.height + 1)) throw new Error('Opened popup exceeds the iframe viewport: ' + JSON.stringify(row.popupBounds));
          });
          row.interaction = 'passed';
          await frame.locator('#col-status').waitFor({ state: 'hidden', timeout: 5000 });
        }
        row.dom = await frame.locator('body').evaluate(body => ({
          text: body.innerText, width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          height: innerHeight, scrollHeight: document.documentElement.scrollHeight,
          controls: [...body.querySelectorAll('button,input,select,textarea,[role]')].map(e => ({ tag: e.tagName, role: e.getAttribute('role'), text: e.textContent?.slice(0, 100), label: e.getAttribute('aria-label'), type: e.getAttribute('type'), checked: e.getAttribute('aria-checked'), expanded: e.getAttribute('aria-expanded') })),
          images: [...body.querySelectorAll('img')].map(e => ({ src: e.src, complete: e.complete, width: e.naturalWidth })),
        }));
        row.pass = errors.length === 0 && row.dom.scrollWidth <= row.dom.width;
      } catch (e) { row.pass = false; row.failure = e.message; row.failedDom = await page.frameLocator('iframe[data-col-preview]').locator('body').evaluate(e => e.innerHTML.replace(/<script[\s\S]*?<\/script>/g, '')).catch(() => 'unavailable'); }
      row.status = await page.frameLocator('iframe[data-col-preview]').locator('#col-status').textContent().catch(() => 'unavailable');
      const filename = `${label}-${name.replaceAll(' ', '-')}.png`;
      await page.locator('iframe').screenshot({ path: new URL(filename, output).pathname.replace(/^\/(\w:)/, '$1'), timeout: 10000 }).catch(() => {});
      results.push(row);
      console.log(label, name, row.pass ? 'PASS' : 'FAIL', row.failure?.slice(0, 180) || '', errors.join(';'));
      await writeFile(new URL(process.env.QUOIN_REPORT || (interactionMode ? 'interaction-results.json' : 'render-results.json'), output), JSON.stringify(results, null, 2));
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); server.close(); }
console.log(JSON.stringify({ total: results.length, passed: results.filter(r => r.pass).length }));
if (results.some(row => !row.pass)) process.exitCode = 1;
