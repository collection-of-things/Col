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
async function optimize(bytes: ArrayBuffer, { width, quality }: ImageRequest) {
  const result = await env.IMAGES.input(new Blob([bytes]).stream()).transform({ width, fit: "scale-down" }).output({ format: "image/webp", quality });
  return new Response(result.image(), { headers: { ...responseHeaders, "Content-Type": result.contentType() } });
}

const rasterType = /^image\/(?:png|jpeg|webp|gif|avif)$/;

/**
 * The source bytes unchanged, for when Cloudflare Images cannot transform
 * them, so pages show the full-size image instead of a broken one. Only the
 * raster types the endpoint accepts are passed through. The response is not
 * stored in the cache and expires quickly, so resized images return once the
 * transform recovers.
 */
function original(bytes: ArrayBuffer, contentType: string | null) {
  const type = contentType?.split(";")[0].trim().toLowerCase();
  if (!type || !rasterType.test(type)) return null;
  return new Response(bytes, { headers: { ...responseHeaders, "Cache-Control": "public, max-age=300", "Content-Type": type } });
}

/**
 * The site's image optimizer: `<Image>` requests a width from the allowed list
 * and gets a cached WebP, or the original file when the transform fails. Only
 * files in `public/` and contributor avatars are accepted, so the endpoint
 * cannot be used as an open proxy.
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
        const bytes = await source.arrayBuffer();
        const response = await optimize(bytes, image).catch((error: unknown) => {
          console.error("Image transform failed", error);
          return null;
        });
        if (!response) return original(bytes, source.headers.get("Content-Type")) ?? new Response(null, { status: 502 });
        await cache.put(request, response.clone());
        return response;
      },
    },
  },
});
