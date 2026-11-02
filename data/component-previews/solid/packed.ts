import { brotliDecompressSync } from "node:zlib";
import { createHash } from "node:crypto";
import type { SolidPreviewArtifact } from "./index.ts";

type PackedJson = { encoding: string; data: string; assetReferences?: { url: string; sha256: string }[] };
type PackedAssets = Readonly<Record<string, { dataUrl: string; sha256: string; bytes: number }>>;

/** Restore generated preview JSON without changing its verified contents. */
export function decodePackedJson<T>(packed: PackedJson, assets: PackedAssets = {}): T {
  if (packed.encoding !== "br") throw new Error("Unsupported Solid preview artifact encoding");
  let json = brotliDecompressSync(Buffer.from(packed.data, "base64")).toString("utf8");
  for (const reference of packed.assetReferences ?? []) {
    const asset = Object.hasOwn(assets, reference.url) ? assets[reference.url] : undefined;
    const data = asset?.dataUrl.match(/^data:[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,([A-Za-z0-9+/]+={0,2})$/i)?.[1];
    if (!asset || !data || asset.sha256 !== reference.sha256 || !/^[a-f0-9]{64}$/.test(reference.sha256)) throw new Error("Invalid packed Solid preview asset");
    const bytes = Buffer.from(data, "base64");
    if (bytes.length !== asset.bytes || bytes.toString("base64") !== data || createHash("sha256").update(bytes).digest("hex") !== reference.sha256) throw new Error("Packed Solid preview asset integrity mismatch");
    const marker = `__COL_ORIGINAL_ASSET_${reference.sha256}__`;
    if (!json.includes(marker)) throw new Error("Packed Solid preview asset marker is missing");
    json = json.replaceAll(marker, asset.dataUrl);
  }
  if (/__COL_ORIGINAL_ASSET_[a-f0-9]{64}__/.test(json)) throw new Error("Packed Solid preview asset was not supplied");
  return JSON.parse(json) as T;
}

export function decodeSolidPreviewArtifact(packed: PackedJson, assets?: PackedAssets): SolidPreviewArtifact {
  return decodePackedJson<SolidPreviewArtifact>(packed, assets);
}
