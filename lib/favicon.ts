import { libraries } from "../data/libraries.ts";
import { connectorPaths, integrations } from "../data/integrations.ts";

const domains = new Set([
  ...libraries.map((library) => library.url),
  ...integrations.flatMap((integration) => [
    integration.provider.url,
    ...connectorPaths(integration).map((connector) => connector.url),
  ]),
].map((url) => new URL(url).hostname.replace(/^www\./, "")));

const MAX_BYTES = 128 * 1024;
const CACHE_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 60 * 1000;
const imageTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);
type Icon = { bytes: Uint8Array<ArrayBuffer>; type: string };
type Entry = { nextAttempt: number; expires: number; icon?: Icon; pending?: Promise<Icon | null> };

/** The catalog bounds both the accepted domains and the per-instance cache and fetch rate. */
export function createFaviconHandler(request: typeof fetch = fetch, now: () => number = Date.now) {
  const entries = new Map<string, Entry>();

  async function load(domain: string): Promise<Icon | null> {
    try {
      const url = new URL("https://www.google.com/s2/favicons");
      url.search = new URLSearchParams({ domain, sz: "128" }).toString();
      const response = await request(url, { redirect: "error", signal: AbortSignal.timeout(5000) });
      const type = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
      if (!response.ok || !imageTypes.has(type) || Number(response.headers.get("content-length")) > MAX_BYTES || !response.body) return null;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
      if (!size) return null;
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return { bytes, type };
    } catch {
      return null;
    }
  }

  return async (requestUrl: string): Promise<Response> => {
    const url = new URL(requestUrl);
    const domain = url.searchParams.get("domain");
    if (!domain || !domains.has(domain) || url.search !== `?domain=${domain}`) {
      return new Response(null, { status: 400 });
    }

    let entry = entries.get(domain);
    const time = now();
    if (!entry) {
      entry = { nextAttempt: 0, expires: 0 };
      entries.set(domain, entry);
    }
    if (!entry.icon || entry.expires <= time) {
      if (!entry.pending) {
        if (entry.nextAttempt > time) return new Response(null, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.nextAttempt - time) / 1000)) } });
        entry.nextAttempt = time + RETRY_MS;
        entry.pending = load(domain);
      }
      const icon = await entry.pending;
      entry.pending = undefined;
      if (!icon) return new Response(null, { status: 502 });
      entry.icon = icon;
      entry.expires = now() + CACHE_MS;
    }
    return new Response(entry.icon.bytes, {
      headers: { "Content-Type": entry.icon.type, "Cache-Control": "public, max-age=86400, s-maxage=86400", "X-Content-Type-Options": "nosniff" },
    });
  };
}
