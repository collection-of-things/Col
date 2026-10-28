import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Run from any directory: node scripts/generate-brand-assets.mjs.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const path = (name) => fileURLToPath(new URL(`../${name}`, import.meta.url));
const mark = await readFile(path("public/brand/col-mark.svg"), "utf8");
const black = mark.replace('fill="#fff"', 'fill="#000"');
await writeFile(path("public/brand/col-mark-black.svg"), black);

// The SVG is the source of truth; PNG exports are for external uses and home screens.
for (const [name, source] of [["white", mark], ["black", black]]) {
  const output = path(`public/brand/col-mark-${name}.png`);
  await sharp(Buffer.from(source)).resize(1024, 1024).png().toFile(output);
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.width, 1024);
  assert.ok(metadata.hasAlpha);
}

// Opaque black icons stay legible in both browser themes. Home screens need more inset.
// A corner radius gives the README tile app-icon corners on light pages.
const icon = (inset, radius = 0) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128"${radius ? ` rx="${radius}"` : ""} fill="#000"/><g transform="translate(${inset} ${inset}) scale(${(128 - inset * 2) / 128})">${mark.match(/<path[\s\S]*<\/svg>/)[0].replace("</svg>", "").replaceAll("<path ", '<path fill="#fff" ')}</g></svg>`);
await writeFile(path("app/icon.svg"), icon(4));
await sharp(icon(12)).resize(180, 180).png().toFile(path("app/apple-icon.png"));

// README logo: git.cafe ignores <picture> color-scheme sources, so one tile must read on light and dark pages.
await sharp(icon(24, 28)).resize(256, 256).png().toFile(path("public/brand/col-readme-icon.png"));

// ICO directory with real 16, 32 and 48 px PNG entries; no additional dependency.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(icon(4)).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, png] of images.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
const ico = Buffer.concat([directory, ...images]);
await writeFile(path("app/favicon.ico"), ico);
assert.equal(ico.length, offset);
assert.equal(ico.readUInt16LE(4), 3);
assert.equal((await sharp(path("app/apple-icon.png")).metadata()).width, 180);
assert.equal((await sharp(path("public/brand/col-readme-icon.png")).metadata()).width, 256);
console.log("Generated and verified vector marks, 1024px PNGs, SVG/ICO favicons, Apple icon, and README icon.");
