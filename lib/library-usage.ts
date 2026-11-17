import type { McpProxyEnv } from "./mcp-proxy.ts";

/** Directory events the website counts per library. Keep in step with `usageEvents.web` in `mcp-app/usage.ts`. */
export const webUsageEvents = ["view", "outbound"] as const;
export type WebUsageEvent = (typeof webUsageEvents)[number];

export type LibraryUsageEnv = Pick<McpProxyEnv, "COL_MCP_ORIGIN"> & {
  /** Shared secret for the MCP service's `/usage` route. */
  COL_USAGE_TOKEN?: string;
};

/**
 * Serves the site's `POST /api/usage`: the browser beacons `{ library, event }`
 * and this forwards exactly those two fields to the MCP service, which keeps
 * the daily counts. Nothing else from the request (IP, cookies, user agent)
 * is passed on. Responds 204 whether or not counting is configured.
 */
export async function forwardLibraryUsage(request: Request, env: LibraryUsageEnv, send: typeof fetch = fetch): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const { library, event } = (body && typeof body === "object" ? body : {}) as { library?: unknown; event?: unknown };
  if (typeof library !== "string" || !/^[a-z0-9-]{1,100}$/.test(library) || !webUsageEvents.includes(event as WebUsageEvent)) {
    return new Response(null, { status: 400 });
  }
  if (env.COL_MCP_ORIGIN && env.COL_USAGE_TOKEN) {
    await send(new URL("/usage", env.COL_MCP_ORIGIN), {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.COL_USAGE_TOKEN}` },
      body: JSON.stringify({ library, event }),
    }).catch(() => undefined);
  }
  return new Response(null, { status: 204 });
}
