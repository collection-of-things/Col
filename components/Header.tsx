"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLink, IN_PLACE_SEARCH, RepoStars, SiteSearch, useRepoStars } from "./SiteChrome";
import { Icons, type IconComponent } from "./MaskIcon";
import { ThemeToggle } from "./ThemeToggle";
import packageJson from "../package.json";

/** Every top-level route. This bar is the only site navigation, at every width. */
export const siteLinks: readonly (readonly [string, string, IconComponent])[] = [
  ["Home", "/", Icons.home],
  ["Libraries", "/libraries", Icons.libraries],
  ["Components", "/components", Icons.componentLibrary],
  ["Integrations", "/integrations", Icons.integrations],
  ["MCP", "/mcp", Icons.integrations],
  ["Docs", "/docs", Icons.docs],
  ["Contributors", "/contributors", Icons.contributors],
  ["Sponsors", "/sponsors", Icons.sponsors],
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The floating glass top bar every route shares: brand and version, the site
 * links with an active pill, search (in place on the directories), repo stars,
 * and the theme toggle. Narrower screens fold the links into a menu panel.
 */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const stars = useRepoStars();

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

        <nav aria-label="Site" className="topbar-links">
          {siteLinks.map(([label, href]) => (
            <Link key={href} href={href} className="topbar-link" aria-current={isActive(pathname, href) ? "page" : undefined}>
              <span className="cap">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="topbar-actions">
          {/* Home and the directories carry their own large search; the bar's would only repeat it. */}
          {pathname !== "/" && !IN_PLACE_SEARCH[pathname] && <SiteSearch className="site-header-search topbar-search" />}
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
            <Link key={href} href={href} className="topbar-panel-link" aria-current={isActive(pathname, href) ? "page" : undefined}>
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
