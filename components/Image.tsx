import type { ComponentProps } from "react";
import { imageSet } from "@/lib/image";

type ImageProps = Omit<ComponentProps<"img">, "src" | "srcSet" | "width" | "height"> & {
  src: string;
  width: number;
  height: number;
  /** Serve the file as-is: SVGs, and endpoints that already return a sized icon. */
  unoptimized?: boolean;
  /** Load first, for the image that paints the page's first view. */
  priority?: boolean;
};

/**
 * An `<img>` with fixed dimensions that loads a resized WebP from `/api/image`.
 * Lazy by default. SVGs are always served unchanged.
 */
export function Image({ src, width, height, sizes, unoptimized, priority, loading, style, ...props }: ImageProps) {
  const sources = unoptimized || src.endsWith(".svg") ? { src } : imageSet({ src, width, sizes });
  return (
    <img
      {...props}
      {...sources}
      sizes={sizes}
      width={width}
      height={height}
      loading={priority ? "eager" : (loading ?? "lazy")}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ color: "transparent", ...style }}
    />
  );
}
