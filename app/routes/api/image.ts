import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { env } from "cloudflare:workers";
import { IMAGE_MAX_AGE, parseImageRequest, type ImageRequest } from "@/lib/image";

const responseHeaders = {
  "Cache-Control": `public, max-age=${IMAGE_MAX_AGE}, must-revalidate`,
  "Content-Security-Policy": "script-src 'none'; frame-src 'none'; sandbox;",
  "X-Content-Type-Options": "nosniff",
};

/**
 * The original bytes, from the Worker's static assets or GitHub's avatar host.
 * Redirects are not followed (Workers do not support `redirect: "error"`), so
 * one answers as a failed, non-200 source.
 */
function loadSource({ source }: ImageRequest, requestUrl: URL) {
  return source.kind === "local"
    ? env.ASSETS.fetch(new URL(source.path, requestUrl.origin))
    : fetch(source.url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
}

/** Resizes to WebP without upscaling. */
async function optimize(body: ReadableStream<Uint8Array>, { width, quality }: ImageRequest) {
  const result = await env.IMAGES.input(body).transform({ width, fit: "scale-down" }).output({ format: "image/webp", quality });
  return new Response(result.image(), { headers: { ...responseHeaders, "Content-Type": result.contentType() } });
}

/**
 * The site's image optimizer: `<Image>` requests a width from the allowed list
 * and gets a cached WebP. Only files in `public/` and contributor avatars are
 * accepted, so the endpoint cannot be used as an open proxy.
 */
export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      ANY: methodNotAllowed("GET, HEAD"),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const image = parseImageRequest(url.searchParams);
        if (!image) return new Response(null, { status: 400 });

        const cache = await caches.open("col-images");
        const cached = await cache.match(request);
        if (cached) return cached;

        const source = await loadSource(image, url).catch((error: unknown) => {
          console.error("Image source failed", error);
          return null;
        });
        if (source?.status !== 200 || !source.body) return new Response(null, { status: source?.status === 404 ? 404 : 502 });
        const response = await optimize(source.body, image).catch((error: unknown) => {
          console.error("Image transform failed", error);
          return null;
        });
        if (!response) return new Response(null, { status: 502 });
        await cache.put(request, response.clone());
        return response;
      },
    },
  },
});
