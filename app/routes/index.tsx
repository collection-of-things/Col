import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRoadmap } from "@/lib/roadmap";
import { pageHead, siteUrl } from "@/lib/site";
import { HeroBackdrop, HeroCopy } from "@/components/HomeHero";
import { HomeStory } from "@/components/HomeStory";
import { RoadmapSection } from "@/components/RoadmapSection";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsInsideSection } from "@/components/WhatsInsideSection";
import styles from "@/components/HomePage.module.css";

/** The roadmap from GitHub issues, edge-cached for five minutes (see lib/roadmap.ts). */
const loadRoadmap = createServerFn({ method: "GET" }).handler(() => getRoadmap());

export const Route = createFileRoute("/")({
  loader: () => loadRoadmap(),
  // The roadmap refreshes every five minutes, so shared caches may keep the page that long.
  headers: () => ({ "Cache-Control": "public, s-maxage=300, stale-while-revalidate=31535700" }),
  head: () => pageHead(
    "/",
    "Col | UI Library Directory",
    "Discover UI libraries by framework, category, and use case. Search documented components, compare setup options, and visit official project sources.",
  ),
  component: Home,
});

/** The homepage plays as one pinned screen: hero, then details, then the roadmap with the footer (see HomeStory). */
function Home() {
  const roadmap = Route.useLoaderData();
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Col",
        url: `${siteUrl}/`,
        description: "A community-maintained directory for discovering UI libraries by category, stack, and use case.",
      }).replace(/</g, "\\u003c") }} />
      <HomeStory
        backdrop={<HeroBackdrop />}
        scenes={[
          { id: "hero", content: <HeroCopy /> },
          { id: "details", content: <WhatsInsideSection /> },
          { id: "roadmap", content: <><RoadmapSection roadmap={roadmap} /><SiteFooter /></> },
        ]}
      />
    </div>
  );
}
