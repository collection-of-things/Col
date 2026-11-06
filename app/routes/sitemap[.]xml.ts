import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { integrations } from "@/data/integrations";
import { libraries } from "@/data/libraries";
import { integrationPath, libraryPath, siteUrl, staticRoutes } from "@/lib/site";

/** Every public page. No lastmod: build time is not content modification time. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      ANY: methodNotAllowed("GET, HEAD"),
      GET: () => {
        const urls = [
          ...staticRoutes,
          ...libraries.map(({ slug }) => libraryPath(slug)),
          ...integrations.map(({ slug }) => integrationPath(slug)),
        ].map((route) => `<url>\n<loc>${new URL(route, siteUrl)}</loc>\n</url>`);
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
        return new Response(body, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
