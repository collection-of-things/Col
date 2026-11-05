import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { integrations } from "./data/integrations.ts";
import { libraries } from "./data/libraries.ts";
import { integrationPath, libraryPath, requestRenderedRoutes, staticRoutes } from "./lib/site.ts";

const requestRendered = new Set<string>(requestRenderedRoutes);

/**
 * Pages and discovery files rendered once at build time and served as static
 * assets. Pages that read the query string or live GitHub data stay on the Worker.
 */
const prerendered = [
  ...staticRoutes.filter((path) => !requestRendered.has(path)),
  "/Alexandria",
  ...libraries.map(({ slug }) => libraryPath(slug)),
  ...integrations.map(({ slug }) => integrationPath(slug)),
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
];

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // The same local URL the site has always used.
  server: { port: 3000 },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      srcDirectory: "app",
      prerender: {
        enabled: true,
        // `/docs` becomes docs.html, which Workers assets serve at `/docs` without a trailing-slash redirect.
        autoSubfolderIndex: false,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: prerendered.map((path) => ({ path })),
    }),
    viteReact(),
    tailwindcss(),
  ],
});
