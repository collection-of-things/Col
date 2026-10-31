import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createCatalogueTools } from "../../lib/mcp-tools.ts";
import { libraries } from "../../data/libraries.ts";
import { componentIndex } from "../../data/components.ts";
import { libraryDetails } from "../../data/library-details/index.ts";
import { libraryCorpus } from "../../data/library-corpus/index.ts";
import { compatibility } from "../../data/compatibility.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? process.env.CHROME_EXECUTABLE_PATH;
const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
try {
  for (const name of ["Lens", "Pixel Image", "Backlight"]) for (const theme of ["light", "dark"]) {
    const id = `magicui-solid/${name}`;
    const row = { id, theme, transport: "actual render_component standalone HTML", errors: [], compilerRequests: [], externalRequests: [], passed: false };
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, colorScheme: theme });
    page.setDefaultTimeout(15000);
    page.on("pageerror", error => row.errors.push(error.message));
    await page.route("**/*", async route => {
      const url = route.request().url();
      if (/^https:\/\/esm\.sh\/(?:@babel\/parser@7\.28\.5|es-module-lexer@3\.0\.2)(?:\/|$)/.test(url)) {
        row.compilerRequests.push(url); await route.continue();
      } else { row.externalRequests.push(url); await route.abort(); }
    });
    try {
      const response = tools.invoke("render_component", { id, theme, format: "html" });
      if (response.isError || response.structuredContent.status !== "html") throw new Error("Standalone preview was not available");
      row.responseBytes = Buffer.byteLength(JSON.stringify(response));
      row.codeIntegrity = createHash("sha256").update(response.structuredContent.preview.code).digest("hex");
      await page.setContent(response.structuredContent.html);
      const frame = page.frameLocator("iframe[data-col-preview]");
      await frame.locator("#col-root > *:visible").first().waitFor();
      await frame.locator("#col-status").waitFor({ state: "hidden" });
      if (name === "Lens") {
        const region = frame.getByRole("region", { name: "Zoom Area" });
        await region.focus();
        await region.hover({ position: { x: 150, y: 120 } });
        await frame.locator('[style*="mask-image"]').first().waitFor();
        await page.waitForTimeout(250);
        row.lens = await region.evaluate(element => ({ images: element.querySelectorAll("img").length, mask: element.querySelector('[style*="mask-image"]').style.maskImage, zoom: element.querySelector('[style*="scale("]').style.transform }));
        if (row.lens.images < 2 || row.lens.zoom !== "scale(2)") throw new Error("Original zoom lens did not appear");
        await region.press("Escape");
        await frame.locator('[style*="mask-image"]').waitFor({ state: "detached" });
      }
      row.images = await frame.locator("#col-root").evaluate(async root => Promise.all([...root.querySelectorAll("img[src]")].map(async image => {
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight, deliveredWebP: image.src.startsWith("data:image/webp;base64,") };
      })));
      if (name !== "Backlight" && (!row.images.length || row.images.some(image => !image.width || !image.deliveredWebP))) throw new Error("Verified WebP image did not load");
      if (name === "Backlight") {
        const video = frame.locator("video");
        await video.evaluate(async element => { await element.play(); });
        const before = await video.evaluate(element => element.currentTime);
        await page.waitForTimeout(700);
        row.video = await video.evaluate(element => ({ readyState: element.readyState, currentTime: element.currentTime, paused: element.paused, duration: element.duration, width: element.videoWidth, height: element.videoHeight }));
        if (row.video.readyState < 2 || row.video.paused || row.video.currentTime === before) throw new Error("Standalone Backlight video did not advance");
      }
      if (row.errors.length || row.externalRequests.length) throw new Error("Unexpected browser errors or network access");
      row.passed = true;
    } catch (error) { row.failure = error.message; }
    results.push(row);
    console.log(row.passed ? "PASS" : "FAIL", id, theme, row.failure ?? "");
    await page.close();
  }
} finally { await browser.close(); }
await writeFile("data/solid-libraries/magicui-solid/media-browser-verification.json", JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + "\n");
if (results.some(row => !row.passed)) process.exitCode = 1;
