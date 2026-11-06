import { createServer, type IncomingHttpHeaders } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import handler from "./handler.ts";

/**
 * Plain Node adapter for the MCP fetch handler. Start it with `bun start`
 * inside mcp-app or `node mcp-app/server.ts` from the root; data and preview
 * media resolve from the module paths, not the working directory. Its runtime
 * packages must be installed in a directory above `lib/` (the repository root
 * locally, `/app` in the image), because `lib/` resolves them from its parents.
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
  const controller = new AbortController();
  const abort = () => controller.abort();
  const onClose = () => {
    if (!res.writableFinished) abort();
  };
  req.once("aborted", abort);
  res.once("close", onClose);
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
      signal: controller.signal,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req) as ReadableStream,
      // @ts-expect-error Node's Request requires duplex for streamed bodies.
      duplex: "half",
    });
    const response = await handler.fetch(request);
    if (controller.signal.aborted) {
      await response.body?.cancel();
      return;
    }
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      await pipeline(Readable.fromWeb(response.body as import("node:stream/web").ReadableStream), res, { signal: controller.signal });
    } else {
      res.end();
    }
  } catch (error) {
    if (controller.signal.aborted || res.destroyed) return;
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : new Error("MCP stream failed"));
      return;
    }
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(error instanceof Error ? error.message : "Internal error");
  } finally {
    req.off("aborted", abort);
    res.off("close", onClose);
  }
});

server.listen(port, () => {
  const address = server.address();
  console.log(`col-mcp listening on http://localhost:${typeof address === "object" && address ? address.port : port}`);
});

// In a container Node runs as PID 1, which ignores SIGTERM unless handled, so
// without this every redeploy waits for the host's kill timeout.
let stopping = false;
/** Finish subscriptions gracefully, with a deadline for unresponsive connections. */
function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => {
    server.closeAllConnections();
    process.exit(1);
  }, 5_000);
  deadline.unref();
  server.close(() => {
    clearTimeout(deadline);
    process.exit(0);
  });
  void handler.close().catch(error => console.error("MCP shutdown failed", error));
}
for (const signal of ["SIGTERM", "SIGINT"] as const) process.once(signal, shutdown);
