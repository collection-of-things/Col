import { parse } from "@babel/parser";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import assetSnapshot from "../data/component-previews/assets.json" with { type: "json" };
import mediaSnapshot from "../data/component-previews/media.json" with { type: "json" };
import torchAssets from "../data/component-previews/solid/torch-ui/assets.json" with { type: "json" };
import torchMedia from "../data/component-previews/solid/torch-ui/media.json" with { type: "json" };
import magicMedia from "../data/component-previews/solid/magicui-solid/resource-media.json" with { type: "json" };
import magicAssets from "../data/component-previews/solid/magicui-solid/assets.json" with { type: "json" };
import magicSharedAssets from "../data/component-previews/solid/magicui-solid/shared-assets.json" with { type: "json" };

type Asset = {
  url: string; downloadUrl: string; resolvedUrl: string; sha256: string;
  mediaType: string; bytes: number; base64: string;
  attribution: { name: string; license: string; url: string };
  licenseUrl?: string;
  original?: { sha256: string; bytes: number }; transformation?: string;
};
type ComponentAssets = { source: string; revision: string; assets: string[]; templates?: { source: string; assets: string[] }[] };
type AssetSnapshot = { assets: Readonly<Record<string, Asset>>; components: Readonly<Record<string, ComponentAssets>> };
const assetSnapshots: readonly AssetSnapshot[] = [assetSnapshot, torchAssets, magicAssets];
const assetsFor = (id: string): AssetSnapshot | undefined => {
  const snapshot = assetSnapshots.find(item => Object.hasOwn(item.components, id));
  if (snapshot || !Object.hasOwn(magicSharedAssets.components, id)) return snapshot;
  const assets = Object.fromEntries(Object.entries(magicSharedAssets.assets).map(([url, reference]) => {
    const original = Object.hasOwn(assetSnapshot.assets, url) ? (assetSnapshot.assets as Readonly<Record<string, Asset>>)[url] : undefined;
    if (!original || original.sha256 !== reference.sha256 || createHash("sha256").update(Buffer.from(original.base64, "base64")).digest("hex") !== reference.sha256) throw new Error(`Shared preview asset integrity mismatch: ${url}`);
    return [url, { ...original, attribution: reference.attribution }];
  }));
  return { assets, components: magicSharedAssets.components };
};
type MediaAsset = Omit<Asset, "base64"> & { file: string; chunks: string[] };
const mediaAssets: Readonly<Record<string, MediaAsset>> = { ...mediaSnapshot.assets, ...torchMedia.assets, ...magicMedia.assets };
const mediaComponents: Readonly<Record<string, { assets: string[] }>> = { ...mediaSnapshot.components, ...torchMedia.components, ...magicMedia.components };
if (torchMedia.chunkSize !== mediaSnapshot.chunkSize || magicMedia.chunkSize !== mediaSnapshot.chunkSize) throw new Error("Preview media snapshots must use the same chunk size");
export type PreviewMediaDescriptor = { uri: string; bytes: number; mediaType: string; chunks: string[]; chunkSize: number };
const INLINE_MEDIA_LIMIT = 2_000_000;

/** Small verified media can also be carried by the standalone HTML fragment. */
export function canInlinePreviewMedia(id: string): boolean {
  const component = Object.hasOwn(mediaComponents, id) ? mediaComponents[id] : undefined;
  return !component || component.assets.reduce((total, url) => total + mediaAssets[url].bytes, 0) <= INLINE_MEDIA_LIMIT;
}

export function inlinePreviewMedia(id: string): Record<string, string> {
  const component = Object.hasOwn(mediaComponents, id) ? mediaComponents[id] : undefined;
  if (!component || !canInlinePreviewMedia(id)) return {};
  return Object.fromEntries(component.assets.map(url => {
    const asset = mediaAssets[url];
    const extension = asset.mediaType === "video/mp4" ? "mp4" : asset.mediaType === "audio/mpeg" ? "mp3" : undefined;
    if (!extension || !/^[a-f0-9]{64}$/.test(asset.sha256) || asset.file !== `${asset.sha256}.${extension}` || asset.bytes <= 0) throw new Error("Invalid verified media snapshot");
    const path = join(process.cwd(), "data/component-previews/media", asset.file);
    if (statSync(path).size !== asset.bytes) throw new Error("Media integrity mismatch");
    const bytes = readFileSync(path);
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error("Media integrity mismatch");
    return [asset.sha256, `data:${asset.mediaType};base64,${bytes.toString("base64")}`];
  }));
}

/** Expose compact provenance separately from the original bytes in the preview. */
export function componentPreviewAssets(id: string) {
  const snapshot = assetsFor(id);
  const inline = snapshot?.components[id].assets.map(url => {
    const { base64: _base64, ...provenance } = snapshot.assets[url];
    return provenance;
  }) ?? [];
  const media = Object.hasOwn(mediaComponents, id) ? mediaComponents[id].assets.map(url => {
    const { file: _file, chunks: _chunks, ...provenance } = mediaAssets[url];
    return provenance;
  }) : [];
  return [...inline, ...media];
}

/** Resource descriptors are small; media bytes never enter the source payload. */
export function componentPreviewMedia(id: string): Record<string, PreviewMediaDescriptor> {
  if (!Object.hasOwn(mediaComponents, id)) return {};
  return Object.fromEntries(mediaComponents[id].assets.map(url => {
    const asset = mediaAssets[url];
    return [asset.sha256, { uri: `col://preview-media/${asset.sha256}`, bytes: asset.bytes, mediaType: asset.mediaType, chunks: asset.chunks, chunkSize: mediaSnapshot.chunkSize }];
  }));
}

/** Serve only a bounded chunk of manifest-pinned media; never arbitrary paths or URLs. */
export async function readPreviewMediaChunk(sha256: string, part: string): Promise<string> {
  const asset = Object.values(mediaAssets).find(item => item.sha256 === sha256);
  const index = Number(part), size = mediaSnapshot.chunkSize;
  if (!asset || !/^[a-f0-9]{64}$/.test(sha256) || !/^(0|[1-9][0-9]*)$/.test(part) || !Number.isSafeInteger(index) || index >= asset.chunks.length || size !== 1_500_000 || asset.bytes > 75_000_000) throw new Error("Unknown original media chunk");
  const extension = asset.mediaType === "video/mp4" ? "mp4" : asset.mediaType === "audio/mpeg" ? "mp3" : undefined;
  if (!extension || asset.file !== `${sha256}.${extension}`) throw new Error("Invalid verified media snapshot");
  const file = await open(join(process.cwd(), "data/component-previews/media", asset.file), "r");
  try {
    if ((await file.stat()).size !== asset.bytes) throw new Error("Media integrity mismatch");
    const bytes = Buffer.alloc(Math.min(size, asset.bytes - index * size));
    let offset = 0;
    while (offset < bytes.length) {
      const read = await file.read(bytes, offset, bytes.length - offset, index * size + offset);
      if (!read.bytesRead) throw new Error("Truncated original media chunk");
      offset += read.bytesRead;
    }
    if (createHash("sha256").update(bytes).digest("hex") !== asset.chunks[index]) throw new Error("Media integrity mismatch");
    return bytes.toString("base64");
  } finally { await file.close(); }
}

/** Relocate listed upstream asset literals to pinned bytes. Unlisted URLs remain
 * untouched and subject to the existing host CSP and visible error reporting. */
export function transformPreviewAssets(id: string, code: string): string {
  const snapshot = assetsFor(id);
  const component = snapshot?.components[id];
  const assets = snapshot?.assets ?? {};
  const media = Object.hasOwn(mediaComponents, id) ? mediaComponents[id] : undefined;
  if (!component && !media) return code;
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const replacements: { start: number; end: number; value: string }[] = [];
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if ("type" in value && value.type === "TemplateLiteral" && "start" in value && typeof value.start === "number" && "end" in value && typeof value.end === "number") {
      const original = code.slice(value.start, value.end);
      const template = component?.templates?.find(item => item.source === original);
      if (template) {
        const mapping = Object.fromEntries(template.assets.map(url => [url, `data:${assets[url].mediaType};base64,${assets[url].base64}`]));
        replacements.push({ start: value.start, end: value.end, value: `((url) => (${JSON.stringify(mapping)}[url] ?? url))(${original})` });
        return;
      }
    }
    if ("type" in value && value.type === "StringLiteral" && "value" in value && typeof value.value === "string" && media?.assets.includes(value.value)) {
      if (!("start" in value && typeof value.start === "number" && "end" in value && typeof value.end === "number")) throw new Error("Preview media literal has no source location.");
      replacements.push({ start: value.start, end: value.end, value: `document.getElementById(${JSON.stringify(`col-media-${mediaAssets[value.value].sha256}`)}).textContent` });
      return;
    }
    if ("type" in value && value.type === "StringLiteral" && "value" in value && typeof value.value === "string" && component?.assets.includes(value.value)) {
      if (!("start" in value && typeof value.start === "number" && "end" in value && typeof value.end === "number")) throw new Error("Preview asset literal has no source location.");
      const asset = assets[value.value];
      replacements.push({ start: value.start, end: value.end, value: JSON.stringify(`data:${asset.mediaType};base64,${asset.base64}`) });
      return;
    }
    Object.values(value).forEach(visit);
  }
  visit(ast.program);
  let result = code;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  return result;
}
