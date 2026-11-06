/**
 * Cloudflare does not cache what a Worker returns, so `s-maxage` on a page or
 * API response does nothing by itself. Vercel's CDN honored it; this restores
 * that by storing those responses in the data center's cache.
 *
 * `app/server.ts` wraps every request in `withEdgeCache`. Prerendered pages and
 * static files never reach the Worker, and responses that are private, set
 * cookies, or lack `s-maxage` pass through untouched. Entries are keyed by the
 * deployed version, because a deploy does not purge the cache and an older
 * page would load scripts the new deploy no longer serves.
 */

/** The Cache API surface used here, so tests can pass an in-memory cache. */
export type EdgeCache = Pick<Cache, "match" | "put">;

/** Seconds a shared cache may keep the response, or 0 when it must not be stored. */
export function sharedMaxAge(response: Response): number {
  if (response.status !== 200 || response.headers.has("set-cookie") || response.headers.get("vary")?.trim() === "*") return 0;
  const directives = (response.headers.get("cache-control") ?? "").toLowerCase().split(",").map((directive) => directive.trim());
  if (!directives.includes("public") || directives.some((directive) => ["private", "no-store", "no-cache"].includes(directive))) return 0;
  const seconds = Number(directives.find((directive) => directive.startsWith("s-maxage="))?.slice("s-maxage=".length));
  return Number.isInteger(seconds) && seconds > 0 ? seconds : 0;
}

/**
 * Answers a GET from the cache, or renders it and stores a copy when the
 * response allows. `defer` keeps the Worker alive while the copy is written,
 * so the visitor's response is not held back.
 */
export async function withEdgeCache(
  request: Request,
  render: () => Promise<Response> | Response,
  { cache, version, defer }: { cache: EdgeCache; version: string; defer: (task: Promise<unknown>) => void },
): Promise<Response> {
  if (request.method !== "GET") return render();
  const url = new URL(request.url);
  url.searchParams.set("__version", version);
  const key = url.toString();
  const cached = await cache.match(key);
  if (cached) return cached;
  const response = await render();
  if (sharedMaxAge(response) > 0) defer(cache.put(key, response.clone()).catch((error: unknown) => console.error("Edge cache write failed", error)));
  return response;
}
