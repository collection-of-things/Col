import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { createFaviconHandler } from "@/lib/favicon";

const favicon = createFaviconHandler();

/** Library logos, fetched server-side so visitors never contact Google. */
export const Route = createFileRoute("/api/favicon")({
  server: {
    handlers: {
      ANY: methodNotAllowed("GET, HEAD"),
      GET: ({ request }) => favicon(request.url),
    },
  },
});
