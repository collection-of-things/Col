/**
 * Responsive image URLs for `/api/image`, which resizes local images and
 * contributor avatars with Cloudflare Images. Widths, quality and srcset
 * selection follow Next.js' image defaults, so pages request the same sizes
 * they did before the move to TanStack Start.
 */

const imageSizes = [32, 48, 64, 96, 128, 256, 384];
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/** Every width the endpoint accepts, smallest first. */
export const imageWidths: readonly number[] = [...imageSizes, ...deviceSizes];

export const IMAGE_QUALITY = 75;

/** How long browsers keep a resized image, matching Next.js' four-hour default. */
export const IMAGE_MAX_AGE = 14_400;

const localImage = /^\/(?!\/)[\w./-]+\.(?:png|jpe?g|webp|gif|avif)$/i;

/** A source the endpoint may resize: a file under `public/`, or a GitHub avatar. */
export type ImageSource = { kind: "local"; path: string } | { kind: "remote"; url: URL };

/** Accepts local raster files and `https://avatars.githubusercontent.com/u/<id>?v=4` exactly. */
export function parseImageSource(src: string): ImageSource | null {
  if (src.startsWith("/")) {
    return localImage.test(src) && !src.split("/").includes("..") ? { kind: "local", path: src } : null;
  }
  try {
    const url = new URL(src);
    const avatar = url.protocol === "https:" && url.hostname === "avatars.githubusercontent.com" && url.port === ""
      && /^\/u\/\d+$/.test(url.pathname) && url.search === "?v=4" && url.username === "" && url.password === "";
    return avatar ? { kind: "remote", url } : null;
  } catch {
    return null;
  }
}

export type ImageRequest = { source: ImageSource; width: number; quality: number };

/** Parses `/api/image?url=…&w=…&q=…`, rejecting anything the pages would not request. */
export function parseImageRequest(params: URLSearchParams): ImageRequest | null {
  const src = params.get("url");
  const width = Number(params.get("w"));
  const quality = Number(params.get("q"));
  if (!src || !imageWidths.includes(width) || quality !== IMAGE_QUALITY || [...params.keys()].length !== 3) return null;
  const source = parseImageSource(src);
  return source && { source, width, quality };
}

export const imageUrl = (src: string, width: number) => `/api/image?url=${encodeURIComponent(src)}&w=${width}&q=${IMAGE_QUALITY}`;

/**
 * `src` and `srcset` for an image: 1x/2x candidates for a fixed-width image,
 * or every width covering the smallest viewport share named in `sizes`.
 */
export function imageSet({ src, width, sizes }: { src: string; width: number; sizes?: string }) {
  const largest = imageWidths[imageWidths.length - 1];
  if (sizes) {
    const shares = [...sizes.matchAll(/(^|\s)(1?\d?\d)vw/g)].map(([, , percent]) => Number(percent) / 100);
    const minimum = shares.length ? deviceSizes[0] * Math.min(...shares) : 0;
    const widths = imageWidths.filter((candidate) => candidate >= minimum);
    return { src: imageUrl(src, widths[widths.length - 1]), srcSet: widths.map((candidate) => `${imageUrl(src, candidate)} ${candidate}w`).join(", ") };
  }
  const widths = [...new Set([width, width * 2].map((target) => imageWidths.find((candidate) => candidate >= target) ?? largest))];
  return { src: imageUrl(src, widths[widths.length - 1]), srcSet: widths.map((candidate, index) => `${imageUrl(src, candidate)} ${index + 1}x`).join(", ") };
}
