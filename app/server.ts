import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { env, waitUntil } from "cloudflare:workers";
import { withEdgeCache } from "@/lib/edge-cache";

/**
 * The Worker entry: TanStack Start's default handler behind the edge cache
 * (see lib/edge-cache.ts). The dev server skips the cache so edits show at once.
 */
export default createServerEntry({
  fetch: (request, options) => import.meta.env.DEV
    ? handler.fetch(request, options)
    : withEdgeCache(request, () => handler.fetch(request, options), { cache: caches.default, version: env.CF_VERSION_METADATA.id, defer: waitUntil }),
});
