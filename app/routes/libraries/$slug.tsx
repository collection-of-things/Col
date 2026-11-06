import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LibraryDetail } from "@/components/LibraryDetail";
import { integrationsForLibrary } from "@/data/integrations";
import { libraries } from "@/data/libraries";
import { libraryDetails } from "@/data/library-details";
import { relatedLibraries } from "@/lib/related-libraries";
import { libraryPath, pageHead } from "@/lib/site";

/** Everything a library page shows. The details catalog stays on the server. */
const loadLibraryPage = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => {
    const library = libraries.find((entry) => entry.slug === slug);
    const details = libraryDetails[slug];
    if (!library || !details) throw notFound();
    return { library, details, related: relatedLibraries(library, libraries), integrations: integrationsForLibrary(slug) };
  });

/** Every catalog slug is prerendered; any other slug is a 404. */
export const Route = createFileRoute("/libraries/$slug")({
  loader: ({ params }) => loadLibraryPage({ data: params.slug }),
  head: ({ loaderData }) => loaderData ? pageHead(libraryPath(loaderData.library.slug), `${loaderData.library.name} | Col`, loaderData.library.description) : {},
  component: LibraryPage,
});

function LibraryPage() {
  const { library, details, related, integrations } = Route.useLoaderData();
  return <LibraryDetail library={library} details={details} related={related} integrations={integrations} />;
}
