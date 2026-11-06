/**
 * The Worker environment that server routes read through `cloudflare:workers`.
 * Bindings mirror wrangler.jsonc; the MCP variables are set in the Cloudflare
 * dashboard and kept across deploys by `keep_vars`. Update both together.
 *
 * The binding types are the subset the routes call, written against the DOM
 * stream and Response types the rest of the app compiles with.
 */
/** The data center's cache, which Workers expose beside named caches. */
interface CacheStorage {
  readonly default: Cache;
}

declare module "cloudflare:workers" {
  /** Keeps the Worker running until the promise settles, after the response is sent. */
  export function waitUntil(promise: Promise<unknown>): void;

  /** Cloudflare Images: resize and re-encode an image stream. */
  interface ImagesBinding {
    input(stream: ReadableStream<Uint8Array>): ImageTransformer;
  }

  interface ImageTransformer {
    transform(transform: { width: number; fit: "scale-down" }): ImageTransformer;
    output(options: { format: "image/webp"; quality: number }): Promise<{ image(): ReadableStream<Uint8Array>; contentType(): string }>;
  }

  export const env: import("../lib/mcp-proxy.ts").McpProxyEnv & {
    /** The static assets: prerendered pages, the client build and `public/`. */
    ASSETS: { fetch(input: URL | Request): Promise<Response> };
    IMAGES: ImagesBinding;
    /** The running Worker version; keys the edge cache per deploy. */
    CF_VERSION_METADATA: { id: string };
  };
}
