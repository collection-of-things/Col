import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/site";
import { SponsorsSection } from "@/components/SponsorsSection";

export const Route = createFileRoute("/sponsors")({
  head: () => pageHead(
    "/sponsors",
    "Sponsors | Col",
    "Support Col and help keep the UI library directory free and maintained.",
  ),
  component: SponsorsPage,
});

function SponsorsPage() {
  return <SponsorsSection />;
}
