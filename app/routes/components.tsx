import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/site";
import { uncachedPageHeaders, validateQuerySearch } from "@/lib/directory-query";
import { ComponentsExplorer } from "@/components/ComponentsExplorer";

export const Route = createFileRoute("/components")({
  validateSearch: validateQuerySearch,
  headers: () => uncachedPageHeaders,
  head: () => pageHead(
    "/components",
    "Search UI Components | Col",
    "Search UI components by name or alias across libraries, then select a match to view its official demo and documentation beside the results.",
  ),
  component: ComponentsPage,
});

function ComponentsPage() {
  const { q = "" } = Route.useSearch();
  return <ComponentsExplorer initialQuery={q} />;
}
