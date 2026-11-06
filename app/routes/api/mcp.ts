import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { env } from "cloudflare:workers";
import { proxyMcp } from "@/lib/mcp-proxy";

/**
 * Col's MCP endpoint is served by the standalone service in `mcp-app/`:
 * its verified preview payload exceeds what a Cloudflare Worker can hold, so
 * the site proxies here instead of bundling it. `COL_MCP_ORIGIN` points at
 * that service (e.g. `http://localhost:8787` in development). Both variables
 * are read per request from the Worker's runtime environment.
 */
export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      ANY: methodNotAllowed("POST"),
      POST: ({ request }) => proxyMcp(request, env),
    },
  },
});
