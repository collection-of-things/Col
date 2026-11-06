export const siteUrl = "https://usecol.com";

export const socialImage = "/col-social-preview-v5.jpg";

export const staticRoutes = ["/", "/libraries", "/components", "/integrations", "/mcp", "/mcp/agents", "/docs", "/docs/agents", "/docs/find-a-library", "/docs/request-a-library", "/docs/report-issues", "/docs/pull-requests", "/contributors", "/sponsors"] as const;

/**
 * Public pages rendered by the Worker on every request, because they read the
 * query string or live GitHub data. Every other page is prerendered at build
 * time and served as a static asset (see vite.config.ts).
 */
export const requestRenderedRoutes = ["/", "/libraries", "/components", "/integrations", "/contributors"] as const;

/** Internal path for a library detail page. */
export const libraryPath = (slug: string) => `/libraries/${slug}`;

/** Internal path for an integration detail page. */
export const integrationPath = (slug: string) => `/integrations/${slug}`;

/** Absolute URL for a site path; the homepage is the bare origin, as canonical URLs have always been. */
export const absoluteUrl = (path: string) => (path === "/" ? siteUrl : new URL(path, siteUrl).toString());

const socialImageAlt = "Col: UI libraries. All in one place.";

/** Shared Open Graph image tags; route heads repeat them so every page declares its own card. */
const socialImageMeta = [
  { property: "og:image", content: absoluteUrl(socialImage) },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:alt", content: socialImageAlt },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:site", content: "@Screeendev" },
  { name: "twitter:image", content: absoluteUrl(socialImage) },
  { name: "twitter:image:alt", content: socialImageAlt },
];

/** Root defaults, inherited by pages without their own identity (the placeholder and 404 pages). */
export const siteHead = {
  meta: [
    { title: "Col | UI Library Directory" },
    { name: "description", content: "Discover UI libraries by framework, category, and use case. Search documented components and visit official project sources." },
    { name: "keywords", content: "ui libraries,component library,react components,tailwind,design system,frontend" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Col" },
    { property: "og:type", content: "website" },
    ...socialImageMeta,
  ],
};

/**
 * A route's `head`: page identity and sharing metadata, using the same canonical
 * URL on every platform. Tags with the root's names replace the defaults.
 */
export function pageHead(path: string, title: string, description: string) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Col" },
      { property: "og:type", content: "website" },
      ...socialImageMeta,
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
