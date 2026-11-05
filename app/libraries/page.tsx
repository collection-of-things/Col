import { pageMetadata } from "@/lib/site";
import { DirectoryExplorer } from "@/components/DirectoryExplorer";

export const metadata = pageMetadata(
  "/libraries",
  "UI Libraries for React, Tailwind CSS and More | Col",
  "Browse UI libraries by stack, category, and use case. Find documented components, save a shortlist locally, and open official documentation.",
);

/** Static, so the hero search's handoff can prefetch it whole; the explorer reads ?q= itself. */
export default function LibrariesPage() {
  return <DirectoryExplorer />;
}
