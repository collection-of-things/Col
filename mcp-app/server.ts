import { createServer, type IncomingHttpHeaders } from "node:http";
import { Readable } from "node:stream";
import handler from "./handler.ts";

/**
 * Plain Node adapter for the MCP fetch handler. Run from the repository root
 * (`npm start` inside mcp-app, or `node mcp-app/server.ts` from the root) so
 * the catalogue data and preview media resolve next to `lib/` and `data/`.
 *
 * Routes:
 * - `GET /health` returns 200 once the catalogue has loaded (the server only
 *   listens after the data imports finish). Point a host's healthcheck here.
 * - Everything else goes to the MCP handler (clients use `POST /api/mcp`).
 *
 * Environment:
 * - PORT (default 8787)
 * - COL_MCP_ALLOWED_ORIGINS — comma-separated extra trusted browser origins,
 *   same meaning as on the website.
 */
const port = Number(process.env.PORT ?? 8787);

/** Copies Node's request headers into fetch `Headers`, keeping repeated values. */
function toFetchHeaders(source: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(source)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  return headers;
}

const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }
    const request = new Request(url, {
      method: req.method,
      headers: toFetchHeaders(req.headers),
      body: req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req) as ReadableStream,
      // @ts-expect-error Node's Request requires duplex for streamed bodies.
      duplex: "half",
    });
    const response = await handler.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(error instanceof Error ? error.message : "Internal error");
  }
});

server.listen(port, () => {
  console.log(`col-mcp listening on http://localhost:${port}`);
});

// In a container Node runs as PID 1, which ignores SIGTERM unless handled, so
// without this every redeploy waits for the host's kill timeout.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    server.closeIdleConnections();
  });
}
