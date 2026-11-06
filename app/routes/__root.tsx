import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, ScriptOnce } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import geistMonoLatin from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import nunitoLatin from "@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url";
import { siteHead } from "@/lib/site";
import { AppFrame } from "@/components/AppFrame";
import { NotFound } from "@/components/NotFound";
import { SiteNotice } from "@/components/SiteNotice";
import appCss from "../globals.css?url";

/** Applies the saved or system theme before first paint. */
const themeScript = `try{const t=localStorage.getItem('col:theme');const l=t==='light'||(!t&&matchMedia('(prefers-color-scheme: light)').matches);document.documentElement.classList.toggle('light',l);document.documentElement.classList.toggle('dark',!l)}catch{}`;

/** Self-hosted fonts the first paint uses, preloaded like next/font did. */
const fontPreloads = [nunitoLatin, geistMonoLatin].map((href) => ({ rel: "preload", href, as: "font", type: "font/woff2", crossOrigin: "anonymous" as const }));

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...siteHead.meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      ...fontPreloads,
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
  notFoundComponent: NotFound,
});

/** The document every page shares, including 404s: the app frame, the site notice, and analytics. */
function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeScript}</ScriptOnce>
        <HeadContent />
      </head>
      <body className="min-h-screen font-sans">
        <AppFrame>{children}</AppFrame>
        <SiteNotice />
        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  );
}
