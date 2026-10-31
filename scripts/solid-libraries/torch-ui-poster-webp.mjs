// Reproduce the disclosed poster frame from Col's verified Spring excerpt.
// Usage: node scripts/solid-libraries/torch-ui-poster-webp.mjs excerpt.mp4 output.webp
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) throw new Error("Supply the verified excerpt and output path");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
if (hash(await readFile(sourcePath)) !== "0d3b8c7006aaa128d2404e69382c5adf8634d3e02d694647351d508fab8c31ee") throw new Error("Spring excerpt hash mismatch");
const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", "5", "-i", sourcePath, "-frames:v", "1", "-c:v", "libwebp", "-quality", "90", "-compression_level", "6", "-f", "webp", "pipe:1"], { maxBuffer: 1_000_000, windowsHide: true });
if (result.status !== 0) throw new Error(`Poster extraction failed: ${result.stderr}`);
if (hash(result.stdout) !== "37a7521ecfd9f231dddc79d841b0149ed4d1a5c1364ede50d98bf4ada862aaca") throw new Error("Poster frame hash mismatch");
await writeFile(outputPath, result.stdout);
console.log(`Verified poster frame: ${result.stdout.length} bytes.`);
