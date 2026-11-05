import { createFileRoute, notFound } from "@tanstack/react-router";
import { IntegrationDetail } from "@/components/IntegrationDetail";
import { integrations } from "@/data/integrations";
import { libraryBySlug } from "@/data/libraries";
import { integrationPath, pageHead } from "@/lib/site";

/** Every catalog slug is prerendered; any other slug is a 404. */
export const Route = createFileRoute("/integrations/$slug")({
  loader: ({ params }) => {
    const integration = integrations.find((entry) => entry.slug === params.slug);
    if (!integration) throw notFound();
    // libraryBySlug throws on a stale slug, so a broken link fails the prerender.
    return { integration, library: integration.library ? libraryBySlug(integration.library) : undefined };
  },
  head: ({ loaderData }) => loaderData ? pageHead(integrationPath(loaderData.integration.slug), `${loaderData.integration.name} | Col`, loaderData.integration.description) : {},
  component: IntegrationPage,
});

function IntegrationPage() {
  const { integration, library } = Route.useLoaderData();
  return <IntegrationDetail integration={integration} library={library} />;
}
