import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Image } from "@/components/Image";
import { getContributors } from "@/lib/contributors";
import { repo } from "@/lib/repo";
import { pageHead } from "@/lib/site";

/** Merged pull request authors from GitHub, edge-cached for an hour (see lib/contributors.ts). */
const loadContributors = createServerFn({ method: "GET" }).handler(() => getContributors());

export const Route = createFileRoute("/contributors")({
  loader: () => loadContributors(),
  // Contributors refresh hourly, so shared caches may keep the page that long.
  headers: () => ({ "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=31532400" }),
  head: () => pageHead(
    "/contributors",
    "Contributors | Col",
    "See the people maintaining Col and learn how to contribute libraries, verified components, and fixes.",
  ),
  component: ContributorsPage,
});

const number = new Intl.NumberFormat("en");

/** Staggered entrance order, capped so long lists do not trail on. */
const reveal = (index: number) => ({ "--i": Math.min(index, 12) }) as CSSProperties;

function ContributorsPage() {
  const contributors = Route.useLoaderData();

  return (
    <div className="cb">
      <header className="cb-head ld-reveal" style={reveal(0)}>
        <div>
          <h1>Contributors</h1>
          <p className="cb-lead">The people keeping Col useful, accurate, and open.</p>
        </div>
        <div className="cb-head-side">
          {contributors.length > 0 && (
            <p className="cb-contributor-count">
              <strong>{number.format(contributors.length)}</strong> {contributors.length === 1 ? "contributor" : "contributors"}
            </p>
          )}
          <a href={repo.pulls} target="_blank" rel="noopener noreferrer" className="ld-button">
            <span className="cap">View on GitHub</span>
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      </header>

      {contributors.length ? (
        <ul className="cb-grid">
          {contributors.map((contributor, index) => (
            <li key={contributor.key} className="ld-reveal" style={reveal(index + 1)}>
              <a href={contributor.url} target="_blank" rel="noopener noreferrer" className="cb-card">
                <span className="cb-media">
                  {contributor.avatarUrl ? (
                    <Image src={contributor.avatarUrl} alt="" width={72} height={72} loading={index < 12 ? "eager" : "lazy"} className="cb-avatar" />
                  ) : <span className="cb-avatar" aria-hidden />}
                  <ArrowUpRight className="cb-open" aria-hidden />
                </span>
                <span className="cb-body">
                  <span className="cb-name">{contributor.name}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="cb-empty ld-reveal" style={reveal(1)}>
          <p className="cb-empty-title">Contributors could not be loaded right now.</p>
          <p>GitHub did not answer. Every merged pull request is listed there.</p>
          <a href={repo.pulls} target="_blank" rel="noopener noreferrer" className="ld-button">
            <span className="cap">Open pull requests</span>
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      )}

      <section className="cb-join ld-reveal" style={reveal(3)} aria-labelledby="cb-join-title">
        <div>
          <h2 id="cb-join-title">Want to see your name here?</h2>
          <p>Add a library, verify components, or fix something that bugs you. Every merged pull request counts.</p>
        </div>
        <div className="cb-join-actions">
          <a href="/docs/pull-requests" className="ld-button ld-button-primary">
            <span className="cap">How to contribute</span>
            <ArrowRight aria-hidden />
          </a>
          <a href={repo.issues} target="_blank" rel="noopener noreferrer" className="ld-button">
            <span className="cap">Open issues</span>
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
