import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { env } from "cloudflare:workers";
import { forwardLibraryUsage } from "@/lib/library-usage";

/** Counts a library directory view or outbound click; see `lib/library-usage.ts`. */
export const Route = createFileRoute("/api/usage")({
  server: {
    handlers: {
      ANY: methodNotAllowed("POST"),
      POST: ({ request }) => forwardLibraryUsage(request, env),
    },
  },
});
