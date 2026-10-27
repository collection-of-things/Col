import { parse } from "@babel/parser";
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { join } from "node:path";
import assetSnapshot from "../data/component-previews/assets.json" with { type: "json" };
import mediaSnapshot from "../data/component-previews/media.json" with { type: "json" };

type Asset = {
  url: string; downloadUrl: string; resolvedUrl: string; sha256: string;
  mediaType: string; bytes: number; base64: string;
  attribution: { name: string; license: string; url: string };
};
type ComponentAssets = { source: string; revision: string; assets: string[]; templates?: { source: string; assets: string[] }[] };
const assets: Readonly<Record<string, Asset>> = assetSnapshot.assets;
const components: Readonly<Record<string, ComponentAssets>> = assetSnapshot.components;
type MediaAsset = Omit<Asset, "base64"> & { file: string; chunks: string[] };
const mediaAssets: Readonly<Record<string, MediaAsset>> = mediaSnapshot.assets;
const mediaComponents: Readonly<Record<string, { assets: string[] }>> = mediaSnapshot.components;
export type PreviewMediaDescriptor = { uri: string; bytes: number; mediaType: string; chunks: string[]; chunkSize: number };

/** Expose compact provenance separately from the original bytes in the preview. */
export function componentPreviewAssets(id: string) {
  const component = Object.hasOwn(components, id) ? components[id] : undefined;
  const inline = component?.assets.map(url => {
    const { base64: _base64, ...provenance } = assets[url];
    return provenance;
  }) ?? [];
  const media = Object.hasOwn(mediaComponents, id) ? mediaComponents[id].assets.map(url => {
    const { file: _file, chunks: _chunks, ...provenance } = mediaAssets[url];
    return provenance;
  }) : [];
  return [...inline, ...media];
}

/** Resource descriptors are small; original bytes never enter the source payload. */
export function componentPreviewMedia(id: string): Record<string, PreviewMediaDescriptor> {
  if (!Object.hasOwn(mediaComponents, id)) return {};
  return Object.fromEntries(mediaComponents[id].assets.map(url => {
    const asset = mediaAssets[url];
    return [asset.sha256, { uri: `col://preview-media/${asset.sha256}`, bytes: asset.bytes, mediaType: asset.mediaType, chunks: asset.chunks, chunkSize: mediaSnapshot.chunkSize }];
  }));
}

/** Serve only a bounded chunk of a manifest-pinned original; never arbitrary paths or URLs. */
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

/** Relocate exact upstream image literals to pinned original bytes. No image is
 * generated, decoded/re-encoded, or fetched by the client. Unlisted URLs remain
 * untouched and subject to the existing host CSP and visible error reporting. */
export function transformPreviewAssets(id: string, code: string): string {
  const component = Object.hasOwn(components, id) ? components[id] : undefined;
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
