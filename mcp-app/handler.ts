import { createMcpHandler } from "@modelcontextprotocol/server";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { createColMcpServer } from "../lib/mcp-server.ts";
import { isMcpOriginAllowed } from "../lib/mcp-origin.ts";
import { dashboardPath, serveDashboard } from "./dashboard.ts";
import { createUsageStore, isUsageEvent, libraryFromToolCall, type UsageEvent, type UsageSource, type UsageStore } from "./usage.ts";

/**
 * Col's MCP endpoint as a standalone fetch handler: one read-only Streamable
 * HTTP route over the same catalogue data the website renders. The website's
 * `app/routes/api/mcp.ts` proxies `/api/mcp` here because the verified preview payload this endpoint
 * serves is far larger than a Cloudflare Worker can hold.
 *
 * Stateless by construction — every request is answered by a fresh server
 * instance. The handler owns active subscription streams until cancellation
 * or shutdown, even though there is no persistent session state.
 *
 * Library usage counting is on when `COL_USAGE_DB` names a SQLite file (on a
 * persistent volume in production). `/usage` then accepts directory events
 * from the website and serves the ranking, both behind `COL_USAGE_TOKEN`, and
 * `/dashboard` shows the same counts in a browser after signing in with it.
 */
const usage = process.env.COL_USAGE_DB ? createUsageStore(process.env.COL_USAGE_DB) : null;
const librarySlugs = new Set(libraries.map((library) => library.slug));
const libraryNames = new Map(libraries.map((library) => [library.slug, library.name]));

/** Counts one use of a catalogue library; never lets counting fail a request. */
function recordUse(store: UsageStore | null, library: string, source: UsageSource, event: UsageEvent) {
  if (!store || !librarySlugs.has(library)) return;
  try {
    store.record(library, source, event);
  } catch (error) {
    console.error("Library usage was not recorded", error);
  }
}

const handler = createMcpHandler(() =>
  createColMcpServer({
    libraries,
    componentIndex,
    details: libraryDetails,
    corpus: libraryCorpus,
    compatibility,
  }, {
    onToolCall(name, args) {
      const library = libraryFromToolCall(name, args);
      if (library && isUsageEvent("mcp", name)) recordUse(usage, library, "mcp", name);
    },
  }),
);

/**
 * `POST /usage` with `{ library, event }` counts a website event;
 * `GET /usage?days=7,30` returns libraries ranked per window.
 */
async function serveUsage(request: Request, store: UsageStore | null): Promise<Response> {
  const token = process.env.COL_USAGE_TOKEN;
  if (!store || !token) return new Response("Usage tracking is not configured", { status: 404 });
  if (request.headers.get("authorization") !== `Bearer ${token}`) return new Response("Unauthorized", { status: 401 });

  if (request.method === "POST") {
    const body: unknown = await request.json().catch(() => null);
    const { library, event } = (body && typeof body === "object" ? body : {}) as { library?: unknown; event?: unknown };
    if (typeof library !== "string" || !librarySlugs.has(library) || !isUsageEvent("web", event)) {
      return new Response("Expected a known library slug and a web event", { status: 400 });
    }
    recordUse(store, library, "web", event);
    return new Response(null, { status: 204 });
  }
  if (request.method === "GET") {
    const param = new URL(request.url).searchParams.get("days") ?? "7,30";
    const windows = param.split(",").map(Number);
    if (!windows.every((days) => Number.isInteger(days) && days >= 1 && days <= 366)) {
      return new Response("days must be whole numbers from 1 to 366, e.g. 7,30", { status: 400 });
    }
    const ranking = Object.fromEntries(windows.map((days) => [`${days}d`, store.ranking(days)]));
    return Response.json({ generatedAt: new Date().toISOString(), ranking });
  }
  return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
}

export default {
  close: async () => {
    await handler.close();
    usage?.close();
  },
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/usage") return serveUsage(request, usage);
    if (pathname === dashboardPath || pathname.startsWith(`${dashboardPath}/`)) {
      return serveDashboard(request, { store: usage, token: process.env.COL_USAGE_TOKEN, libraryNames });
    }
    if (!isMcpOriginAllowed(request.headers.get("origin"), process.env.COL_MCP_ALLOWED_ORIGINS)) {
      return new Response("Forbidden Origin", { status: 403 });
    }
    return handler.fetch(request);
  },
};
