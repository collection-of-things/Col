import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/site";
import { uncachedPageHeaders, validateQuerySearch } from "@/lib/directory-query";
import { IntegrationsExplorer } from "@/components/IntegrationsExplorer";

export const Route = createFileRoute("/integrations/")({
  validateSearch: validateQuerySearch,
  headers: () => uncachedPageHeaders,
  head: () => pageHead(
    "/integrations",
    "MCP Servers and Connectors for UI Libraries | Col",
    "MCP servers and connectors for UI libraries and design tools. Filter by client, then copy setup for Claude Code, Cursor, VS Code, or Codex.",
  ),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { q = "" } = Route.useSearch();
  return <IntegrationsExplorer initialQuery={q} />;
}
