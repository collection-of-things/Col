import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { createCatalogueTools } from "../lib/mcp-tools.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";

const require = createRequire(import.meta.url);
const { chromium, expect } = require((process.env.PLAYWRIGHT_MODULE || "playwright") + "/test");
const output = process.env.KOBALTE_BROWSER_OUTPUT || ".scratch/solid-full-coverage/kobalte-browser";
await mkdir(output, { recursive: true });
const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const ids = componentIndex.kobalte.map(item => `kobalte/${item.name}`);
const button = (frame, name) => frame.getByRole("button", { name, exact: true }).first();
const openDialog = async (frame, role = "dialog") => { await button(frame, "Open").click(); const dialog = frame.getByRole(role); await expect(dialog).toBeVisible(); await dialog.getByRole("button").first().click(); await expect(dialog).toHaveCount(0); };
const changeRange = async frame => { const input = frame.locator('input[type="range"]').first(); const before = await input.inputValue(); await input.focus(); await input.press("ArrowRight"); await expect(input).not.toHaveValue(before); };
const increment = async frame => { const input = frame.getByRole("spinbutton").first(); const before = await input.inputValue(); await button(frame, "Increment").click(); await expect(input).not.toHaveValue(before); };
const actions = {
  Button: async frame => button(frame, "Click me").click(),
  Dialog: openDialog,
  Tabs: async frame => { await frame.getByRole("tab", { name: "Dashboard" }).click(); await expect(frame.getByText("Dashboard details")).toBeVisible(); },
  Accordion: async frame => { const item = frame.getByRole("button", { name: /Is it unstyled/ }); await item.click(); await expect(item).toHaveAttribute("aria-expanded", "true"); },
  "Alert Dialog": async frame => openDialog(frame, "alertdialog"),
  Alert: async frame => expect(frame.getByRole("alert")).toBeVisible(),
  Badge: async frame => expect(frame.getByRole("status")).toBeVisible(),
  Breadcrumbs: async frame => expect(frame.getByRole("link", { name: "Breadcrumbs" })).toBeVisible(),
  Checkbox: async frame => { await frame.getByText("Subscribe", { exact: true }).click(); await expect(frame.locator('input[type="checkbox"]')).toBeChecked(); },
  Collapsible: async frame => { const item = frame.getByRole("button").first(); await item.click(); await expect(item).toHaveAttribute("aria-expanded", "true"); },
  "Color Area": changeRange,
  "Color Channel Field": increment,
  "Color Field": async frame => { const input = frame.locator('input[type="text"]').first(); await input.fill("#00ffff"); await expect(input).toHaveValue("#00ffff"); },
  "Color Slider": changeRange,
  "Color Swatch": async frame => expect(frame.getByRole("img")).toBeVisible(),
  "Color Wheel": changeRange,
  Combobox: async frame => { await frame.getByRole("combobox").fill("App"); await expect(frame.getByRole("option").first()).toBeVisible(); },
  "Context Menu": async frame => { await frame.getByText("Right click here.").click({ button: "right" }); await expect(frame.getByRole("menu").first()).toBeVisible(); },
  "Dropdown Menu": async frame => { await frame.getByRole("button").first().click(); await expect(frame.getByRole("menu").first()).toBeVisible(); },
  "File Field": async frame => { await frame.locator('input[type="file"]').setInputFiles({ name: "col-preview.txt", mimeType: "text/plain", buffer: Buffer.from("test") }); await expect(frame.getByText("col-preview.txt")).toBeVisible(); },
  "Hover Card": async frame => { await frame.getByRole("link", { name: "@kobaltedev" }).hover(); await expect(frame.getByText("A UI toolkit for building accessible web apps and design systems with SolidJS.")).toBeVisible(); },
  Image: async frame => { await expect(frame.getByText("KB", { exact: true })).toBeVisible(); await expect(frame.getByText("J", { exact: true })).toBeVisible(); await expect(frame.locator('img[alt="Kobalte"]')).toHaveCount(0); },
  Link: async frame => expect(frame.getByRole("link", { name: "Kobalte" })).toHaveAttribute("href", "https://kobalte.dev"),
  Menubar: async frame => { await frame.getByRole("menuitem", { name: "Git", exact: true }).click(); await expect(frame.getByRole("menu").first()).toBeVisible(); },
  Meter: async frame => expect(frame.getByRole("meter")).toBeVisible(),
  "Navigation Menu": async frame => { const trigger = frame.getByRole("menuitem", { name: /Learn/ }).first(); await trigger.click(); await expect(trigger).toHaveAttribute("aria-expanded", "true"); },
  "Number Field": increment,
  Pagination: async frame => { await button(frame, "2").click(); await expect(button(frame, "2")).toHaveAttribute("aria-current", "page"); },
  Popover: async frame => { await button(frame, "Open").click(); await expect(frame.getByRole("dialog")).toBeVisible(); },
  Progress: async frame => expect(frame.getByRole("progressbar")).toBeVisible(),
  "Radio Group": async frame => { await frame.getByText("Orange", { exact: true }).click(); await expect(frame.locator('input[type="radio"]:checked')).toHaveCount(1); },
  Rating: async frame => { const item = frame.getByRole("radio").nth(3); await item.click(); await expect(item).toHaveAttribute("aria-checked", "true"); },
  Search: async frame => { await frame.getByRole("combobox").fill("grinning"); await expect(frame.getByRole("option").first()).toBeVisible(); },
  "Segmented Control": async frame => { await frame.getByText("Orange", { exact: true }).click(); await expect(frame.locator('input[type="radio"]:checked')).toHaveCount(1); },
  Select: async frame => { const trigger = frame.locator('button[aria-label="Fruit"]'); await trigger.click(); await frame.getByRole("option", { name: "Apple", exact: true }).click(); await expect(trigger).toContainText("Apple"); },
  Separator: async frame => expect(frame.getByRole("separator")).toBeVisible(),
  Skeleton: async frame => expect(frame.getByText(/A UI toolkit for building accessible/)).toBeVisible(),
  Slider: changeRange,
  Switch: async frame => { const item = frame.getByRole("switch"); await frame.getByText("Airplane mode", { exact: true }).click(); await expect(item).toBeChecked(); },
  "Text Field": async frame => { const input = frame.locator('input[type="text"]'); await input.fill("Pear"); await expect(input).toHaveValue("Pear"); },
  "Time Field": async frame => { const hour = frame.getByRole("spinbutton", { name: "hour" }); await hour.focus(); await hour.press("ArrowUp"); await expect(hour).not.toHaveAttribute("aria-valuetext", "Empty"); },
  Toast: async frame => { await button(frame, "Show toast").click(); await expect(frame.getByText(/toast/i).last()).toBeVisible(); },
  "Toggle Button": async frame => { const item = button(frame, "Mute"); const before = await item.getAttribute("aria-pressed"); await item.click(); await expect(item).not.toHaveAttribute("aria-pressed", before); },
  "Toggle Group": async frame => { const item = button(frame, "Bold"); await item.click(); await expect(item).toHaveAttribute("aria-pressed", "true"); },
  Tooltip: async frame => { await button(frame, "Trigger").hover(); await expect(frame.getByRole("tooltip")).toBeVisible(); },
  "I18n Provider": async frame => expect(frame.getByText("fr-FR (ltr)")).toBeVisible(),
};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const result = tools.invoke("render_component", { id: url.searchParams.get("id"), theme: url.searchParams.get("theme"), format: "html" });
  if (result.isError) { res.writeHead(500).end(result.content[0].text); return; }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${result.structuredContent.html}`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
const results = [];
try {
  for (const theme of ["light", "dark"]) {
    if (process.env.KOBALTE_THEMES && !process.env.KOBALTE_THEMES.split(",").includes(theme)) continue;
    const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, colorScheme: theme });
    for (const id of process.env.KOBALTE_NAMES?.split("|") || ids) {
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      const errors = [], failedRequests = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("requestfailed", request => failedRequests.push(request.url()));
      const row = { id, theme, errors, failedRequests };
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/?id=${encodeURIComponent(id)}&theme=${theme}`);
        const frame = page.frameLocator('iframe[data-col-preview]');
        await frame.locator("#col-root > *").first().waitFor({ state: "visible", timeout: 25000 });
        await frame.locator("#col-status").waitFor({ state: "hidden", timeout: 10000 });
        await frame.locator("body").evaluate(() => document.fonts.ready);
        row.dom = await frame.locator("body").evaluate(body => {
          const visible = element => { const bounds = element.getBoundingClientRect(); return bounds.width > 0 && bounds.height > 0; };
          const elements = [...body.querySelectorAll("button,input,[role],a")].filter(visible).slice(0, 20).map(element => ({ tag: element.tagName, role: element.getAttribute("role"), label: element.getAttribute("aria-label"), text: (element.textContent ?? "").trim().slice(0, 70), type: element.getAttribute("type"), checked: element.getAttribute("aria-checked"), expanded: element.getAttribute("aria-expanded") }));
          return { elements, text: (body.querySelector("#col-root")?.textContent ?? "").trim().slice(0, 180), failedImages: [...body.querySelectorAll("img")].filter(image => image.complete && !image.naturalWidth).map(image => image.currentSrc || image.src), width: innerWidth, scrollWidth: document.documentElement.scrollWidth };
        });
        if (row.dom.failedImages.length || failedRequests.length || errors.length) throw new Error("A preview asset or script failed");
        if (row.dom.scrollWidth > row.dom.width + 1) throw new Error(`Horizontal overflow: ${row.dom.scrollWidth} > ${row.dom.width}`);
        await expect(frame.locator("#col-root > *").first()).toBeVisible();
        const name = id.slice("kobalte/".length);
        if (!actions[name]) throw new Error(`No interaction or semantic assertion for ${id}`);
        await actions[name](frame);
        if (errors.length) throw new Error(errors.join("; "));
        row.pass = true;
      } catch (error) {
        row.pass = false;
        row.failure = error.message;
        await page.screenshot({ path: `${output}/${theme}-${id.replaceAll("/", "-").replaceAll(" ", "-")}.png` }).catch(() => {});
      }
      results.push(row);
      console.log(theme, id, row.pass ? "PASS" : "FAIL", row.failure?.slice(0, 140) || "");
      await writeFile(`${output}/results.json`, JSON.stringify({ browser: browser.version(), results }, null, 2));
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); server.close(); }
console.log(JSON.stringify({ total: results.length, passed: results.filter(row => row.pass).length }));
if (results.some(row => !row.pass)) process.exitCode = 1;
