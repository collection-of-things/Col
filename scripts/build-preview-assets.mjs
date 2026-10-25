import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { verifyPreviewAsset } from "./preview-asset-integrity.mjs";
import { findOriginalFlagTemplate } from "./preview-asset-sources.mjs";

const root = new URL("../", import.meta.url);
const output = new URL("data/component-previews/assets.json", root);
const shadcn = JSON.parse(await readFile(new URL("data/component-previews/shadcn.json", root), "utf8"));
const extra = JSON.parse(await readFile(new URL("data/component-previews/extra.json", root), "utf8"));
const recipes = { ...shadcn.entries, ...extra.entries };
const targets = {
  "shadcn-ui/Sidebar": ["/avatars/shadcn.jpg"],
  "shadcn-ui/Avatar": ["https://github.com/shadcn.png", "https://github.com/evilrabbit.png", "https://github.com/maxleiter.png"],
  "shadcn-ui/Attachment": [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80",
  ],
  "shadcn-ui/Message": ["/avatars/10.png", "/avatars/02.png"],
  "kibo-ui/Avatar Stack": ["https://github.com/haydenbleasel.png", "https://github.com/shadcn.png", "https://github.com/leerob.png", "https://github.com/serafimcloud.png"],
  "elevenlabs-ui/Orb": ["https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png"],
  "reui/Data Grid": [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1620075225255-8c2051b6c015?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1542595913-85d69b0edbaf?w=96&h=96&dpr=2&q=80",
  ],
};
const flagCountries = ["us", "gb", "ca", "au", "de", "my", "es", "jp", "fr", "it"];
const flagTemplate = findOriginalFlagTemplate(recipes["reui/Data Grid"].code).source;
const flagUrls = flagCountries.map(country => `https://flagcdn.com/${country}.svg`);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const refresh = process.argv.includes("--refresh-assets");
const previous = await readFile(output, "utf8").then(JSON.parse).catch(error => {
  if (error.code !== "ENOENT") throw error;
  return { assets: {} };
});
const result = { version: 1, components: {}, assets: {}, licenses: { "shadcn-ui/ui": shadcn.licenses["shadcn-ui/ui"] } };

for (const [id, urls] of Object.entries(targets)) {
  const recipe = recipes[id];
  const templates = id === "reui/Data Grid" ? [{ source: flagTemplate, assets: flagUrls }] : [];
  if (templates.length && (!recipe.code.includes(flagTemplate) || !recipe.code.includes(`flag:${JSON.stringify(flagCountries)}`))) throw new Error("Original Data Grid flag template or sample countries changed");
  result.components[id] = { source: recipe.source.url, revision: recipe.source.revision, assets: [...urls, ...templates.flatMap(template => template.assets)], ...(templates.length ? { templates } : {}) };
  for (const url of result.components[id].assets) {
    if (!flagUrls.includes(url) && !recipe.code.includes(JSON.stringify(url))) throw new Error(`Original asset reference missing from ${id}: ${url}`);
    if (result.assets[url]) continue;
    const old = previous.assets[url];
    const repositoryAsset = url.startsWith("/");
    const downloadUrl = repositoryAsset
      ? `https://raw.githubusercontent.com/shadcn-ui/ui/${recipe.source.revision}/apps/v4/public${url}`
      : url;
    if (old && !refresh) {
      if (old.url !== url || old.downloadUrl !== downloadUrl) throw new Error(`Asset source changed; explicitly capture with --refresh-assets: ${url}`);
      result.assets[url] = verifyPreviewAsset(old);
      continue;
    }
    if (!refresh) throw new Error(`Unrecorded image; explicitly capture with --refresh-assets: ${url}`);
    const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(30_000), headers: { Accept: "image/png,image/jpeg,image/svg+xml" } });
    if (!response.ok) throw new Error(`Asset HTTP ${response.status}: ${downloadUrl}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 2_000_000) throw new Error(`Asset exceeds 2 MB: ${downloadUrl}`);
    const sha256 = hash(bytes);
    if (old && repositoryAsset && old.downloadUrl === downloadUrl && old.sha256 !== sha256) throw new Error(`Immutable repository asset changed: ${downloadUrl}`);
    result.assets[url] = verifyPreviewAsset({
      url, downloadUrl, resolvedUrl: response.url, sha256,
      mediaType: response.headers.get("content-type")?.split(";")[0], bytes: bytes.length,
      base64: bytes.toString("base64"),
      attribution: repositoryAsset
        ? { name: "shadcn/ui repository asset", license: "MIT", url: result.licenses["shadcn-ui/ui"].url }
        : url.startsWith("https://images.unsplash.com/")
          ? { name: "Original Unsplash demo photograph", license: "Unsplash License", url: "https://unsplash.com/license" }
          : url.startsWith("https://flagcdn.com/")
            ? { name: "Original Flagpedia flag artwork (Wikimedia Commons source)", license: "Flagpedia free image CDN; see source terms", url: "https://flagpedia.net/download/api" }
            : url.startsWith("https://storage.googleapis.com/eleven-public-cdn/")
              ? { name: "Original ElevenLabs Orb perlin noise texture", license: "Upstream-linked image; no separate asset license asserted", url: recipe.source.url }
              : { name: "Original GitHub profile image linked by the upstream demo", license: "External profile image; no separate license asserted", url },
    });
  }
}
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(`${Object.keys(result.assets).length} original image assets verified for ${Object.keys(result.components).length} previews: ${fileURLToPath(output)}`);
