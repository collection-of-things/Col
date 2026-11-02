import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { createCatalogueTools } from "../lib/mcp-tools.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { solidPreviews } from "../data/component-previews/solid/index.ts";
import { verifyReactLens } from "./verify-react-lens.mjs";
import { blockCultRadixCdn, verifyCultRecovery } from "./verify-cult-recovery.mjs";
import { verifyTorchTableView } from "./verify-torch-table-view.mjs";
import { verifyMagicuiTweet } from "./verify-magicui-tweet.mjs";
import { verifyMagicuiConfetti } from "./verify-magicui-confetti.mjs";
import { verifyTorchVideo } from "./verify-torch-video.mjs";
import { verifyTorchReview } from "./verify-torch-review.mjs";

// Opt-in verification of the real standalone HTML frame, outside npm test.
const require = createRequire(import.meta.url);
const { chromium, expect } = require((process.env.PLAYWRIGHT_MODULE || "playwright") + "/test");
const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const output = process.env.SOLID_BROWSER_OUTPUT || ".scratch/solid-library-69/browser";
await mkdir(output, { recursive: true });

const button = (frame, name) => frame.getByRole("button", { name, exact: true }).first();
const playVideo = async frame => {
  const video = frame.locator("video").first();
  await expect(video).toBeVisible();
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0);
};
const interact = {
  "magic-ui/Lens": frame => verifyReactLens(frame, expect),
  "kobalte/Button": async frame => expect(button(frame, "Click me")).toBeVisible(),
  "kobalte/Dialog": async frame => { await button(frame, "Open").click(); await expect(frame.getByRole("dialog")).toContainText("About Kobalte"); await frame.getByRole("dialog").getByRole("button").click(); await expect(frame.getByRole("dialog")).toHaveCount(0); },
  "kobalte/Tabs": async frame => { await frame.getByRole("tab", { name: "Dashboard" }).click(); await expect(frame.getByText("Dashboard details")).toBeVisible(); },
  "solid-ui/Button": async frame => expect(button(frame, "Primary")).toBeVisible(),
  "solid-ui/Accordion": async frame => { const trigger = button(frame, "Is it accessible?"); await trigger.click(); await expect(trigger).toHaveAttribute("aria-expanded", "true"); await expect(frame.getByText("Yes. It adheres to the WAI-ARIA design pattern.")).toBeVisible(); },
  "solid-ui/Progress Circle": async frame => { await expect(frame.locator("circle[stroke-dashoffset]").first()).toBeVisible(); await expect(frame.getByText("75%").first()).toBeVisible(); },
  "shadcn-solid/Button": async frame => expect(frame.locator('[data-slot="button"]').first()).toHaveText("Button"),
  "shadcn-solid/Dialog": async frame => { await button(frame, "Scrollable Content").click(); await expect(frame.getByRole("dialog")).toBeVisible(); await frame.getByRole("dialog").press("Escape"); await expect(frame.getByRole("dialog")).toHaveCount(0); },
  "shadcn-solid/Tabs": async frame => { await frame.getByRole("tab", { name: "Password" }).click(); await expect(button(frame, "Save password")).toBeVisible(); },
  "zaidan/Button": async frame => expect(frame.locator('[data-slot="button"]').first()).toBeVisible(),
  "zaidan/Checkbox": async frame => { const input = frame.locator('input[name="terms-checkbox"]'); await expect(input).not.toBeChecked(); await frame.locator('label[for="terms-checkbox"]').click(); await expect(input).toBeChecked(); },
  "zaidan/Dialog": async frame => { await button(frame, "Open Dialog").click(); const dialog = frame.getByRole("dialog"); await expect(dialog).toContainText("Edit profile"); await dialog.getByRole("button", { name: "Dismiss", exact: true }).filter({ hasText: "Cancel" }).click(); await expect(dialog).toHaveCount(0); },
  "hope-ui/Button": async frame => expect(frame.getByRole("button", { name: /Save/ }).first()).toBeVisible(),
  "hope-ui/Dialog": async frame => { await button(frame, "Delete project").click(); await expect(frame.getByRole("dialog")).toContainText("Delete project"); await frame.getByRole("dialog").getByRole("button", { name: "Cancel" }).click(); await expect(frame.getByRole("dialog")).toHaveCount(0); },
  "hope-ui/Select": async frame => { await frame.getByRole("combobox", { name: "Choose a fruit" }).click(); await frame.getByRole("option", { name: "Apple" }).click(); await expect(frame.getByRole("combobox", { name: "Choose a fruit" })).toContainText("Apple"); },
  "rocksolid/Button": async frame => { await button(frame, "Clicked 0 times").click(); await expect(button(frame, "Clicked 1 times")).toBeVisible(); },
  "rocksolid/Badge": async frame => expect(button(frame, "Notifications")).toBeVisible(),
  "rocksolid/Dialog": async frame => { await button(frame, "Open dialog").click(); await expect(frame.getByRole("dialog")).toContainText("Getting Started"); await frame.getByRole("dialog").getByRole("button", { name: "Close" }).click(); await expect(frame.getByRole("dialog")).toHaveCount(0); },
  "rocksolid/Tabs": async frame => { await frame.getByRole("tab", { name: "Profile" }).click(); await expect(frame.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true"); await expect(frame.locator('[dir="rtl"]')).toBeVisible(); },
  "nikala-ui/Button": async frame => expect(button(frame, "Button")).toBeVisible(),
  "nikala-ui/Toggle Group": async frame => { await frame.getByRole("radio", { name: "Align Center" }).click(); await expect(frame.getByText("Selected Alignment: center")).toBeVisible(); const right = frame.getByRole("radio", { name: "Align Right" }); await right.focus(); await right.press("Space"); await expect(frame.getByText("Selected Alignment: right")).toBeVisible(); },
  "nikala-ui/Timeline": async frame => { await expect(frame.getByText("Order Placed")).toBeVisible(); await expect(frame.getByText("Out for Delivery")).toBeVisible(); },
  "torch-ui/Button": async frame => { await button(frame, "Select").click(); await expect(button(frame, "Selected")).toHaveAttribute("aria-pressed", "true"); },
  "torch-ui/Dialog": async frame => { await button(frame, "Summon Familiar").click(); await expect(frame.getByRole("dialog")).toContainText("Summon a Familiar"); await frame.getByRole("dialog").getByRole("button", { name: "Close" }).click(); await expect(frame.getByRole("dialog")).toHaveCount(0); },
  "torch-ui/Accordion": async frame => { const trigger = button(frame, "Section 2"); await trigger.click(); await expect(trigger).toHaveAttribute("aria-expanded", "true"); },
  "torch-ui/Table View": async (frame, theme) => verifyTorchTableView(frame, expect, theme),
  "torch-ui/Video": frame => verifyTorchVideo(frame, expect),
  "magicui-solid/Marquee": async frame => expect(frame.locator(".animate-marquee").first()).toBeVisible(),
  "magicui-solid/Ripple Button": async frame => { await button(frame, "Click me").click(); await expect(frame.locator(".animate-rippling").first()).toBeVisible(); await expect(frame.locator(".animate-rippling")).toHaveCount(0); },
  "magicui-solid/Shimmer Button": async frame => expect(button(frame, "Shimmer Button")).toBeVisible(),
  "magicui-solid/Backlight": playVideo,
  "magicui-solid/Confetti": frame => verifyMagicuiConfetti(frame, expect),
  "magicui-solid/Video Text": async frame => { await playVideo(frame); await expect(frame.getByText("OCEAN", { exact: true })).toHaveCount(1); expect(await frame.locator("video").first().evaluate(element => getComputedStyle(element.parentElement).maskImage)).toContain("data:image/svg+xml"); },
  "magicui-solid/Tweet Card": async (frame, theme) => verifyMagicuiTweet(frame, expect, theme),
  "mystic-ui/Marquee": async frame => expect(frame.locator(".animate-marquee").first()).toBeVisible(),
  "mystic-ui/Orbiting Circles": async frame => expect(frame.locator(".animate-orbit").first()).toBeVisible(),
  "mystic-ui/Ripple": async frame => { await expect(frame.locator(".animate-ripple")).toHaveCount(8); await expect(frame.getByAltText("Solid JS")).toBeVisible(); },
};

async function verifyVisibleControl(frame) {
  const control = frame.locator('#col-root :is(button, input, [tabindex]):not(:disabled):visible').first();
  if (await control.count()) {
    await control.focus();
    await expect.poll(() => frame.locator("#col-root").evaluate(root => root.contains(root.ownerDocument.activeElement))).toBe(true);
    return "focus";
  }
  return "display";
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const theme = url.searchParams.get("theme");
  const result = tools.invoke("render_component", { id, theme, format: "html", ...(process.env.SOLID_USER_CSS ? { styles: process.env.SOLID_USER_CSS } : {}) });
  if (result.isError) { res.writeHead(500); res.end(result.content[0].text); return; }
  if (process.env.SOLID_RESTRICT_NETWORK) res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://esm.sh https://cdn.jsdelivr.net; style-src 'unsafe-inline'; font-src data:; img-src data: blob:; media-src data: blob:; connect-src 'none'; frame-src 'self' blob:");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:${theme};background:${theme === "dark" ? "#000" : "#fff"};color:${theme === "dark" ? "#fff" : "#111"};font:14px system-ui}body{margin:8px}</style>${result.structuredContent.html}`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
const results = [];
try {
  for (const [profile, width, theme] of [["desktop-light", 1280, "light"], ["desktop-dark", 1280, "dark"], ["mobile-light", 390, "light"], ["mobile-dark", 390, "dark"]]) {
    if (process.env.SOLID_PROFILES && !process.env.SOLID_PROFILES.split(",").includes(profile)) continue;
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: process.env.SOLID_REDUCED_MOTION || "no-preference" });
    const ids = process.env.SOLID_NAMES?.split("|") || Object.keys(solidPreviews).filter(id => !process.env.SOLID_LIBRARY || id.startsWith(`${process.env.SOLID_LIBRARY}/`));
    for (const id of ids) {
      const page = await context.newPage();
      if (process.env.SOLID_BLOCK_CULT_RADIX) await blockCultRadixCdn(page);
      page.setDefaultTimeout(7000);
      const errors = [], failedRequests = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("requestfailed", request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      const row = { id, profile, errors, failedRequests };
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/?id=${encodeURIComponent(id)}&theme=${theme}`);
        const frame = page.frameLocator('iframe[data-col-preview]');
        await frame.locator("#col-root > *:visible").first().waitFor({ state: "visible", timeout: 25000 });
        await frame.locator("#col-status").waitFor({ state: "hidden", timeout: 10000 });
        const cultInteraction = await verifyCultRecovery(frame, id, expect, theme);
        const torchInteraction = await verifyTorchReview(frame, id, expect);
        if (torchInteraction) await expect(page.locator('iframe[data-col-preview]')).toHaveAttribute("sandbox", "allow-scripts allow-forms");
        row.check = cultInteraction || torchInteraction || interact[id] ? "interaction" : await verifyVisibleControl(frame);
        if (!cultInteraction && interact[id]) await interact[id](frame, theme);
        if (id === "torch-ui/Table View") {
          await expect(page.locator("[data-col-provenance]")).toContainText("TableView wrapper is not yet available");
          await expect(page.locator('iframe[data-col-preview]')).toHaveAttribute("sandbox", "allow-scripts allow-forms");
        }
        if (id === "torch-ui/Board") {
          await expect(page.locator("[data-col-provenance]")).toContainText("scroll horizontally on narrow screens");
          const region = frame.getByRole("region", { name: "Board, scroll horizontally" });
          await expect(region).toBeVisible();
          if (width < 500) {
            expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
            await region.focus();
            await region.press("ArrowRight");
            await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
          }
        }
        if (id === "torch-ui/Video") {
          await expect(page.locator("[data-col-provenance]")).toContainText("replaces the documented poster");
          await expect(page.locator('[data-col-provenance] a[href="https://creativecommons.org/licenses/by/4.0/"]')).toHaveCount(2);
          await expect(page.locator('iframe[data-col-preview]')).toHaveAttribute("sandbox", "allow-scripts allow-forms");
        }
        if (id === "magicui-solid/Tweet Card") {
          await expect(page.locator("[data-col-provenance]")).toContainText("Sample content");
          await expect(page.locator('iframe[data-col-preview]')).toHaveAttribute("sandbox", "allow-scripts allow-forms");
        }
        if (id === "magicui-solid/Confetti") await expect(page.locator('iframe[data-col-preview]')).toHaveAttribute("sandbox", "allow-scripts allow-forms");
        if (process.env.SOLID_USER_CSS) {
          const radius = await frame.locator("#col-root button").first().evaluate(element => getComputedStyle(element).borderRadius);
          if (radius !== "2px") throw new Error(`User CSS was not applied after the library styles: ${radius}`);
        }
        row.dom = await frame.locator("body").evaluate(async body => {
          await document.fonts.ready;
          const controls = [...body.querySelectorAll("button,[role=tab],[role=checkbox],[role=radio]")];
          const first = controls.find(element => element.getBoundingClientRect().width > 0) || body.querySelector("#col-root > *");
          const style = first && getComputedStyle(first);
          return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
            style: style && { color: style.color, backgroundColor: style.backgroundColor, borderRadius: style.borderRadius, fontFamily: style.fontFamily, fontSize: style.fontSize },
            failedImages: [...body.querySelectorAll("img")].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src) };
        });
        if (row.dom.scrollWidth > row.dom.width + 1) throw new Error(`Preview overflows horizontally: ${row.dom.scrollWidth} > ${row.dom.width}`);
        if (errors.length) throw new Error(errors.join("; "));
        row.pass = true;
      } catch (error) {
        row.pass = false;
        row.failure = error.message;
        row.failedDom = await page.frameLocator('iframe[data-col-preview]').locator("body").evaluate(body => body.innerHTML.replace(/<script[\s\S]*?<\/script>/g, "").slice(0, 12000)).catch(() => "unavailable");
        await page.screenshot({ path: `${output}/${profile}-${id.replaceAll("/", "-").replaceAll(" ", "-")}.png` }).catch(() => {});
      }
      results.push(row);
      console.log(profile, id, row.pass ? "PASS" : "FAIL", row.failure?.slice(0, 200) || "");
      await writeFile(`${output}/results.json`, JSON.stringify({ browser: browser.version(), results }, null, 2));
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); server.close(); }
console.log(JSON.stringify({ total: results.length, passed: results.filter(row => row.pass).length }));
if (results.some(row => !row.pass)) process.exitCode = 1;
