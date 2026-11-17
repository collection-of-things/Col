import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "@/hooks/use-pathname";
import { Link } from "@/components/Link";
import { Menu, X } from "lucide-react";
import { BrandLink, RepoStars, useRepoStars } from "./SiteChrome";
import { Icons, type IconComponent } from "./MaskIcon";
import { ThemeToggle } from "./ThemeToggle";
import packageJson from "../package.json";

/** Every top-level route. This bar is the only site navigation, at every width. */
export const siteLinks = [
  ["Home", "/", Icons.home],
  ["Libraries", "/libraries", Icons.libraries],
  ["Components", "/components", Icons.componentLibrary],
  ["Integrations", "/integrations", Icons.integrations],
  ["MCP", "/mcp", Icons.integrations],
  ["Docs", "/docs", Icons.docs],
  ["Contributors", "/contributors", Icons.contributors],
  ["Sponsors", "/sponsors", Icons.sponsors],
] as const satisfies readonly (readonly [string, string, IconComponent])[];

/** Whether a nav link's section contains the current route. */
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The flat top bar every route shares: brand and version, the site links with an
 * underlined active link, repo stars, and the theme toggle. Narrower screens fold
 * the links into a menu panel.
 */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const stars = useRepoStars();
  const linksRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // The active-link underline is one shared bar that slides between links.
  // It measures the active link's box (inset by its side padding so the bar
  // matches the text width) into CSS vars the bar transforms with. Until the
  // first measurement lands, a ::after on the link itself is the fallback.
  useLayoutEffect(() => {
    const nav = linksRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    let cancelled = false;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!active) {
        delete indicator.dataset.active;
        return;
      }
      // Below the desktop breakpoint the links are display:none and measure 0;
      // wait for a real box so the bar never arms at width 0 and grows in later.
      if (active.offsetWidth === 0) return;
      const style = getComputedStyle(active);
      const padLeft = parseFloat(style.paddingLeft);
      const padRight = parseFloat(style.paddingRight);
      indicator.style.setProperty("--x", `${active.offsetLeft + padLeft}px`);
      indicator.style.setProperty("--w", `${Math.max(active.offsetWidth - padLeft - padRight, 0)}`);
      indicator.dataset.active = "";
      // The shared element now owns the bar; retire the ::after fallback.
      nav.dataset.indicator = "";
      // The first real measurement arms the transition. Flush styles first so
      // the bar lands in place instead of sliding in from scaleX(0).
      if (indicator.dataset.ready === undefined) {
        void indicator.offsetWidth;
        indicator.dataset.ready = "";
      }
    };

    measure();
    void document.fonts.ready.then(() => { if (!cancelled) measure(); });
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => { cancelled = true; observer.disconnect(); };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <header className="topbar" data-menu={menuOpen || undefined} data-home={pathname === "/" || undefined}>
      <div className="topbar-glass">
        <div className="topbar-brand">
          <BrandLink />
          <span className="topbar-version cap" title={`Col v${packageJson.version}`}>v{packageJson.version}</span>
        </div>

        <nav aria-label="Site" className="topbar-links" ref={linksRef}>
          {siteLinks.map(([label, href]) => (
            <Link key={href} to={href} className="topbar-link" aria-current={isActive(pathname, href) ? "page" : undefined}>
              <span className="cap">{label}</span>
            </Link>
          ))}
          <span ref={indicatorRef} className="topbar-indicator" aria-hidden />
        </nav>

        <div className="topbar-actions">
          <RepoStars stars={stars} className="site-header-repo topbar-repo" />
          <ThemeToggle />
          <button
            type="button"
            className="topbar-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="topbar-menu-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="topbar-menu-panel" aria-label="Site menu" className="topbar-panel">
          {siteLinks.map(([label, href, Icon]) => (
            <Link key={href} to={href} className="topbar-panel-link" onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, href) ? "page" : undefined}>
              <Icon className="nav-icon" />
              <span className="cap">{label}</span>
            </Link>
          ))}
          <p className="topbar-panel-meta cap">Col v{packageJson.version}</p>
        </nav>
      )}
    </header>
  );
}
