import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/site";
import { uncachedPageHeaders, validateQuerySearch } from "@/lib/directory-query";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";

export const Route = createFileRoute("/libraries/")({
  validateSearch: validateQuerySearch,
  headers: () => uncachedPageHeaders,
  head: () => pageHead(
    "/libraries",
    "UI Libraries for React, Tailwind CSS and More | Col",
    "Browse UI libraries by stack, category, and use case. Find documented components, save a shortlist locally, and open official documentation.",
  ),
  component: LibrariesPage,
});

/** Static shell, so the hero search's handoff can prefetch it whole; the explorer reads ?q= itself. */
function LibrariesPage() {
  return <DirectoryExplorer />;
}
