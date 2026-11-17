import type { ReactNode } from "react";
import { DocsPageNavigation, DocsSidebar, DocsToc, DocsTransition } from "./DocsSidebar";
import { SiteSearch } from "./SiteChrome";

/** Shared reading layout for the general docs and MCP guides. */
export function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-layout">
      {/* The top bar has no search, so docs pages get a compact site search of their own here. */}
      <div className="docs-search"><SiteSearch className="site-header-search docs-search-field" /></div>
      <aside className="docs-layout-nav"><DocsSidebar /></aside>
      <div className="docs-layout-main">
        <DocsTransition>
          {children}
          <DocsPageNavigation />
        </DocsTransition>
      </div>
      <aside className="docs-layout-toc"><DocsToc /></aside>
    </div>
  );
}
