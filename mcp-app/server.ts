import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./handler.ts";

/**
 * Plain Node adapter for the MCP fetch handler. Run from the repository root
 * (`npm start` inside mcp-app, or `node mcp-app/server.ts` from the root) so
 * the catalogue data and preview media resolve next to `lib/` and `data/`.
 *
 * Environment:
 * - PORT (default 8787)
 * - COL_MCP_ALLOWED_ORIGINS — comma-separated extra trusted browser origins,
 *   same meaning as on the website.
 */
const port = Number(process.env.PORT ?? 8787);

const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
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
