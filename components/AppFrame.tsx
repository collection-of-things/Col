import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "@/hooks/use-pathname";
import { Header } from "./Header";

type SidebarMode = "narrow" | "wide";

/** Directories with a filter panel and an in-place search in the sidebar. */
const DIRECTORY_PATHS = new Set(["/libraries", "/integrations"]);

/** Directory routes get the wide content layout; every other route the narrow one. */
function sidebarModeFor(pathname: string): SidebarMode {
  return DIRECTORY_PATHS.has(pathname) ? "wide" : "narrow";
}

/**
 * The one layout every route shares: the flat top bar (brand, navigation,
 * repo stars, theme) over the content card. There is no sidebar; directory
 * filters open in a sheet from the directory's toolbar.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = sidebarModeFor(pathname);
  const panelRef = useRef<HTMLElement>(null);

  // The content card is the scroll container, so reset it on navigation the way
  // the browser would reset the window.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const slash = event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
      const command = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k";
      if (!slash && !command) return;
      // Focus whichever search field is on screen, preferring a page's own
      // directory field over the global one.
      const visible = [...document.querySelectorAll<HTMLInputElement>("[data-directory-search], [data-hero-search-input], [data-site-search]")]
        .filter((input) => input.offsetParent !== null);
      const field = visible.find((input) => input.hasAttribute("data-directory-search"))
        ?? visible.find((input) => input.hasAttribute("data-hero-search-input"))
        ?? visible[0];
      if (!field) return;
      event.preventDefault();
      field.focus();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="app-frame library-page-shell" data-directory={mode === "wide" || undefined} data-home={pathname === "/" || undefined}>
      <Header />
      <main ref={panelRef} className="app-frame-panel">
        {children}
      </main>
    </div>
  );
}
