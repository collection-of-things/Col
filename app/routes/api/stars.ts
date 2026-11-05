import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { getStarCount } from "@/lib/git-cafe";

/** Same-origin star count, refreshed every five minutes; null when GitHub is unavailable. */
export const Route = createFileRoute("/api/stars")({
  server: {
    handlers: {
      ANY: methodNotAllowed("GET, HEAD"),
      GET: async () => Response.json({ stars: await getStarCount() }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=31535700" } }),
    },
  },
});
