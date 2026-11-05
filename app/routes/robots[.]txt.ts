import { createFileRoute } from "@tanstack/react-router";
import { methodNotAllowed } from "@/lib/http";
import { siteUrl } from "@/lib/site";

const crawlers = [["*"], ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]];

/** Crawler rules: everyone may crawl everything, AI crawlers named explicitly. */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      ANY: methodNotAllowed("GET, HEAD"),
      GET: () => {
        const rules = crawlers.map((agents) => [...agents.map((agent) => `User-Agent: ${agent}`), "Allow: /"].join("\n"));
        const body = `${rules.join("\n\n")}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
        return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
