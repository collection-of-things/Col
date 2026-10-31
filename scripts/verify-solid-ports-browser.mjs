import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { createCatalogueTools } from "../lib/mcp-tools.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";

// Set PORT_SLUG to a Solid port; PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE may
// select an existing Playwright install and browser. Playwright defaults otherwise.
// PORT_THEMES (comma-separated), PORT_NAMES (pipe-separated), and PORT_OUTPUT
// optionally narrow a retry or choose where to write screenshots and results.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const slug = process.env.PORT_SLUG;
if (!slug || !componentIndex[slug]) throw new Error("PORT_SLUG must name an indexed library");
const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const output = process.env.PORT_OUTPUT || `.scratch/verify-solid-ports/${slug}`;
await mkdir(output, { recursive: true });
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const result = tools.invoke("render_component", { id: url.searchParams.get("id"), theme: url.searchParams.get("theme"), format: "html" });
  if (result.isError || result.structuredContent.status !== "html") { res.writeHead(500); res.end("Unavailable preview"); return; }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:8px}</style>${result.structuredContent.html}`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), headless: true });
const checkedAt = new Date().toISOString();
const rows = [];
try {
  for (const theme of ["light", "dark"]) {
    if (process.env.PORT_THEMES && !process.env.PORT_THEMES.split(",").includes(theme)) continue;
    const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, colorScheme: theme });
    for (const component of componentIndex[slug]) {
      const id = `${slug}/${component.name}`;
      if (process.env.PORT_NAMES && !process.env.PORT_NAMES.split("|").includes(component.name)) continue;
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      const errors = [], failures = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("requestfailed", request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
      const row = { id, theme, errors, failures };
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/?id=${encodeURIComponent(id)}&theme=${theme}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        const frame = page.frameLocator('iframe[data-col-preview]');
        await frame.locator("#col-root > *").filter({ visible: true }).first().waitFor({ state: "visible", timeout: 25000 });
        await frame.locator("#col-status").waitFor({ state: "hidden", timeout: 10000 });
        await frame.locator("body").evaluate(async () => { await document.fonts.ready; });
        const button = frame.locator('#col-root button:not([disabled]):not([type="submit"])').filter({ visible: true }).first();
        if (await button.count() && !["Hover Card", "Tooltip"].includes(component.name)) {
          const label = (await button.innerText()).trim();
          const pressed = await button.getAttribute("aria-pressed");
          await button.focus();
          row.focused = await button.evaluate(element => element === document.activeElement);
          if (!row.focused) throw new Error("The first visible button could not receive keyboard focus");
          if (!/delete|remove|save|submit|send|share|download|purchase|log in|sign in|checkout/i.test(label)) {
            await button.click({ timeout: 12000 });
            row.clicked = label || "icon button";
            if (pressed === "false" && await button.getAttribute("aria-pressed") === "false") throw new Error("The toggle did not change its pressed state");
          }
        } else {
          const checkbox = frame.getByRole("checkbox").filter({ visible: true }).first();
          if (await checkbox.count() && await checkbox.isEnabled()) {
            const before = await checkbox.isChecked();
            await checkbox.focus();
            await checkbox.press("Space", { timeout: 12000 });
            if (await checkbox.isChecked() === before) throw new Error("The checkbox did not change its state");
            row.clicked = "checkbox (keyboard)";
          } else {
            const slider = frame.getByRole("slider").filter({ visible: true }).first();
            if (await slider.count() && await slider.isEnabled()) {
              const before = await slider.getAttribute("aria-valuenow");
              const max = await slider.getAttribute("aria-valuemax");
              await slider.focus();
              await slider.press(before === max ? "ArrowLeft" : "ArrowRight");
              if (before !== null && await slider.getAttribute("aria-valuenow") === before) throw new Error("The slider did not change its value");
              row.clicked = "slider (keyboard)";
            } else {
              const input = frame.locator('input:not([disabled]):not([readonly]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]), textarea:not([disabled]):not([readonly])').filter({ visible: true }).first();
              if (await input.count() && await input.isEditable()) {
                const type = await input.getAttribute("type");
                if (!type || ["text", "search", "email", "password", "tel", "url", "number"].includes(type)) {
                  const value = type === "email" ? "preview@example.test" : type === "url" ? "https://example.test" : "1";
                  await input.fill(value);
                  if (await input.inputValue() !== value) throw new Error("The input did not accept its test value");
                  row.clicked = "input (text entry)";
                }
              }
            }
          }
        }
        if (component.name === "Context Menu") {
          const trigger = frame.getByText(/right click here/i).filter({ visible: true }).first();
          await trigger.click({ button: "right", timeout: 12000 });
          await frame.getByRole("menu").filter({ visible: true }).first().waitFor({ state: "visible", timeout: 5000 });
          row.clicked = "context menu (right click)";
        }
        if (component.name === "Radio Group" || component.name === "Switch") {
          const role = component.name === "Switch" ? "switch" : "radio";
          const controls = frame.getByRole(role).filter({ visible: true });
          let control = controls.first();
          if (role === "radio" && await control.isChecked() && await controls.count() > 1) control = controls.nth(1);
          const before = await control.isChecked();
          await control.focus();
          await control.press("Space", { timeout: 12000 });
          if (await control.isChecked() === before) throw new Error(`The ${role} did not change its state`);
          row.clicked = `${role} (keyboard)`;
        }
        if (component.name === "Hover Card" || component.name === "Tooltip") {
          const before = await frame.locator("body").innerText();
          await frame.locator('#col-root button:not([disabled])').filter({ visible: true }).first().hover();
          await page.waitForTimeout(1000);
          if (await frame.locator("body").innerText() === before) throw new Error("The hover content did not appear");
          row.clicked = "hover content";
        }
        if (id === "zaidan/Toast") {
          await frame.getByText("Event created", { exact: true }).first().waitFor({ state: "visible", timeout: 5000 });
          row.clicked = "show toast";
        }
        await page.waitForTimeout(120);
        await frame.locator("body").evaluate(async body => {
          await Promise.all([...body.querySelectorAll("img")].map(image => image.complete ? undefined : new Promise(resolve => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 3000);
          })));
        });
        row.dom = await frame.locator("body").evaluate(body => ({
          failedImages: [...body.querySelectorAll("img")].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.currentSrc || image.src),
          scrollWidth: document.documentElement.scrollWidth,
          width: innerWidth,
          visibleText: (body.innerText || "").trim().slice(0, 150),
        }));
        const preview = tools.invoke("get_component", { id }).structuredContent.preview;
        if (row.dom.failedImages.length && !preview.gaps.some(gap => /image|asset/i.test(gap))) throw new Error("An original demo image failed without a disclosed limitation");
        const imageDemos = ["solid-ui/Aspect Ratio", "zaidan/Aspect Ratio", "zaidan/Attachment"];
        const expectedImages = imageDemos.includes(id) ? (preview.assets ?? []).filter(asset => asset.mediaType === "image/webp") : [];
        if (imageDemos.includes(id) && expectedImages.length !== (id === "zaidan/Attachment" ? 3 : 1)) throw new Error("The converted image provenance is missing");
        if (expectedImages.length) {
          const images = await frame.locator("img").evaluateAll(elements => elements.map(element => ({ src: element.currentSrc || element.src, width: element.naturalWidth, height: element.naturalHeight })));
          row.loadedImages = expectedImages.map(asset => {
            const match = images.find(item => item.src.startsWith("data:image/webp;base64,") && createHash("sha256").update(Buffer.from(item.src.split(",")[1], "base64")).digest("hex") === asset.sha256);
            if (!match?.width || !match.height) throw new Error(`The recorded WebP image did not load: ${asset.url}`);
            return { sha256: asset.sha256, width: match.width, height: match.height };
          });
        }
        const cookieGap = id.endsWith("/Sidebar") && preview.gaps.some(gap => /cookie/i.test(gap)) && errors.every(error => /cookie.*sandboxed.*allow-same-origin/i.test(error));
        if (errors.length && !cookieGap) throw new Error(errors.join("; "));
        if (errors.length) row.expectedError = "The opaque sandbox blocks the original preference cookie write.";
        row.pass = true;
      } catch (error) {
        row.pass = false;
        const statusNode = page.frameLocator('iframe[data-col-preview]').locator("#col-status");
        const status = await statusNode.isVisible({ timeout: 1000 }).then(visible => visible ? statusNode.textContent() : "").catch(() => "");
        row.failure = status?.trim() ? `${error.message}\nPreview status: ${status.trim()}` : error.message;
        await page.screenshot({ path: `${output}/${theme}-${component.name.replaceAll(/[^a-zA-Z0-9-]/g,"-")}.png` }).catch(() => {});
      }
      rows.push(row);
      console.log(theme, id, row.pass ? "PASS" : "FAIL", row.failure?.slice(0,160) ?? "");
      const resultPath = `${output}/results.json`;
      await writeFile(`${resultPath}.tmp`, JSON.stringify({ checkedAt, browser: browser.version(), renderer: "render_component HTML", sandbox: "allow-scripts allow-forms", viewport: { width: 1280, height: 960 }, rows }, null, 2));
      await rename(`${resultPath}.tmp`, resultPath);
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); server.close(); }
console.log(JSON.stringify({ total: rows.length, passed: rows.filter(row => row.pass).length }));
if (rows.some(row => !row.pass)) process.exitCode = 1;
