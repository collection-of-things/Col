import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { verifyMp3Frames, verifyMp4Container } from "./preview-asset-integrity.mjs";

const root = new URL("../", import.meta.url);
const output = new URL("data/component-previews/media.json", root);
const directory = new URL("data/component-previews/media/", root);
const entries = JSON.parse(await readFile(new URL("data/component-previews/extra.json", root), "utf8")).entries;
const targets = {
  "cult-ui/Bg Media": ["https://openaicomproductionae4b.blob.core.windows.net/production-twill-01/c74791d0-75d2-48e6-acae-96d13bc97c56/paper-planes.mp4"],
  "kibo-ui/Video Player": ["https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"],
  "elevenlabs-ui/Audio Player": ["00", "01", "04", "05", "07", "08", "09"].map(track => `https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/${track}.mp3`),
};
const capture = process.argv.includes("--capture-missing-media");
const previous = await readFile(output, "utf8").then(JSON.parse).catch(error => {
  if (error.code !== "ENOENT") throw error;
  return { assets: {} };
});
const chunkSize = 1_500_000;
const result = { chunkSize, components: {}, assets: {} };
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
await mkdir(directory, { recursive: true });
for (const [id, urls] of Object.entries(targets)) {
  const recipe = entries[id];
  result.components[id] = { revision: recipe.source.revision, integrity: recipe.source.integrity, assets: urls };
  for (const url of urls) {
    if (!recipe.code.includes(JSON.stringify(url))) throw new Error(`Original media reference changed: ${id}`);
    const old = previous.assets[url];
    let asset, bytes;
    if (old) {
      if (old.url !== url || old.downloadUrl !== url) throw new Error(`Media source identity changed: ${url}`);
      if (old.file !== `${old.sha256}.${url.endsWith(".mp4") ? "mp4" : "mp3"}` || !/^[a-f0-9]{64}$/.test(old.sha256)) throw new Error("Invalid media snapshot path");
      asset = old;
      bytes = await readFile(new URL(old.file, directory));
      if (bytes.length !== old.bytes || hash(bytes) !== old.sha256) throw new Error(`Media integrity mismatch: ${url}`);
    } else {
      if (!capture) throw new Error(`Unrecorded media; capture explicitly: ${url}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok) throw new Error(`Media HTTP ${response.status}: ${url}`);
      if (Number(response.headers.get("content-length")) > 75_000_000) throw new Error("Media exceeds 75 MB");
      const chunks = [];
      let length = 0;
      for await (const chunk of response.body) {
        length += chunk.length;
        if (length > 75_000_000) throw new Error("Media exceeds 75 MB");
        chunks.push(chunk);
      }
      bytes = Buffer.concat(chunks);
      const sha256 = hash(bytes);
      const mediaType = response.headers.get("content-type")?.split(";")[0];
      const extension = url.endsWith(".mp4") ? "mp4" : "mp3";
      asset = { url, downloadUrl: url, resolvedUrl: response.url, sha256, bytes: bytes.length, mediaType, file: `${sha256}.${extension}`, attribution: { name: "Original upstream demo media", license: "Upstream-linked media; no separate asset license asserted", url: recipe.source.url } };
    }
    if (bytes.length > 75_000_000) throw new Error("Media exceeds 75 MB");
    if (asset.mediaType === "video/mp4") verifyMp4Container(bytes);
    else if (asset.mediaType === "audio/mpeg") verifyMp3Frames(bytes);
    else throw new Error(`Unsupported media type: ${asset.mediaType}`);
    if (!old) await writeFile(new URL(asset.file, directory), bytes, { flag: "wx" });
    const chunks = [];
    for (let offset = 0; offset < bytes.length; offset += chunkSize) chunks.push(hash(bytes.subarray(offset, offset + chunkSize)));
    result.assets[url] = { ...asset, chunks };
    console.log(`${id}: ${bytes.length} original bytes verified`);
  }
}
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
