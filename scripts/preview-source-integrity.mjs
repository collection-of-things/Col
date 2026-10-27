import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const hash = (content) => createHash("sha256").update(content).digest("hex");

/** Recover the reviewed pins from generated provenance, including older manifests. */
export function collectSourcePins(manifest) {
  const pins = { ...manifest.sourcePins };
  const add = ({ url, sha256 }) => {
    if (!url || !sha256) return;
    if (pins[url] && pins[url] !== sha256) throw new Error(`Conflicting committed source hashes: ${url}`);
    pins[url] = sha256;
  };
  for (const entry of Object.values(manifest.entries ?? {})) for (const file of entry.source.files) add(file);
  for (const files of Object.values(manifest.styleSources ?? {})) for (const file of files) add(file);
  for (const license of Object.values(manifest.licenses ?? {})) add({ url: license.url, sha256: hash(license.text) });
  return pins;
}

/** A cache is an optimization, never a new source of provenance. New URLs require
 * an explicit refresh; existing immutable URLs cannot silently change, even then. */
export function createVerifiedSourceReader({ cache, pins, refresh = false, fetchSource = fetch }) {
  const recordedPins = { ...pins };
  const pending = new Map();
  const failures = [];
  function verify(url, content) {
    const actual = hash(content);
    if (pins[url] && pins[url] !== actual) throw new Error(`Source integrity mismatch: ${url}`);
    if (!pins[url] && !refresh) throw new Error(`Unreviewed source URL; rerun with --refresh-source-pins: ${url}`);
    recordedPins[url] = actual;
    return content;
  }
  async function read(url) {
    if (!pending.has(url)) pending.set(url, (async () => {
      if (!pins[url] && !refresh) return verify(url, "");
      const path = resolve(cache, hash(url) + ".txt");
      // An unknown cached file must never become the initial integrity pin.
      if (pins[url]) {
        const cached = await readFile(path, "utf8").catch(error => {
          if (error.code !== "ENOENT") throw error;
        });
        if (cached !== undefined) return verify(url, cached);
      }
      const response = await fetchSource(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${url}`);
      const content = verify(url, await response.text());
      await mkdir(cache, { recursive: true });
      await writeFile(path, content);
      return content;
    })().catch(error => {
      if (/integrity mismatch|Unreviewed source URL/.test(error.message)) failures.push(error);
      throw error;
    }));
    return pending.get(url);
  }
  return { read, verify, pins: recordedPins, hasPin: url => Boolean(pins[url]), refresh,
    assertValid() { if (failures.length) throw failures[0]; } };
}
