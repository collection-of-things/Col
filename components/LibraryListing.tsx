import { useEffect, useRef, type ReactNode } from "react";
import { track } from "@vercel/analytics";

/** Adds one view or outbound click to Col's own per-library usage counts (`/api/usage`). */
function countLibraryUse(library: string, event: "view" | "outbound") {
  navigator.sendBeacon?.("/api/usage", JSON.stringify({ library, event }));
}

/** Count one official-site conversion per listing view, including keyboard and middle clicks. */
export function LibraryListing({ slug, children }: { slug: string; children: ReactNode }) {
  const view = useRef<{ slug: string; converted: boolean } | null>(null);
  useEffect(() => {
    if (view.current?.slug === slug) return;
    view.current = { slug, converted: false };
    track("library_listing_view", { slug });
    countLibraryUse(slug, "view");
  }, [slug]);

  const recordOutbound = (target: EventTarget | null) => {
    if (!(target instanceof Element) || !view.current || view.current.converted) return;
    const destination = target.closest("a[data-library-outbound]")?.getAttribute("data-library-outbound");
    if (destination !== "website" && destination !== "docs") return;
    view.current.converted = true;
    track("library_outbound", { slug, destination });
    countLibraryUse(slug, "outbound");
  };

  return <article className="ld" onClickCapture={(event) => recordOutbound(event.target)} onAuxClickCapture={(event) => {
    if (event.button === 1) recordOutbound(event.target);
  }}>{children}</article>;
}
