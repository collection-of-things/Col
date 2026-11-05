import { createMcpHandler } from "@modelcontextprotocol/server";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { createColMcpServer } from "../lib/mcp-server.ts";
import { isMcpOriginAllowed } from "../lib/mcp-origin.ts";

/**
 * Col's MCP endpoint as a standalone fetch handler: one read-only Streamable
 * HTTP route over the same catalogue data the website renders. The website's
 * `app/routes/api/mcp.ts` proxies `/api/mcp` here because the verified preview payload this endpoint
 * serves is far larger than a Cloudflare Worker can hold.
 *
 * Stateless by construction — every request is answered by a fresh server
 * instance. The handler owns active subscription streams until cancellation
 * or shutdown, even though there is no persistent session state.
 */
const handler = createMcpHandler(() =>
  createColMcpServer({
    libraries,
    componentIndex,
    details: libraryDetails,
    corpus: libraryCorpus,
    compatibility,
  }),
);

export default {
  close: () => handler.close(),
  async fetch(request: Request): Promise<Response> {
    if (!isMcpOriginAllowed(request.headers.get("origin"), process.env.COL_MCP_ALLOWED_ORIGINS)) {
      return new Response("Forbidden Origin", { status: 403 });
    }
    return handler.fetch(request);
  },
};
