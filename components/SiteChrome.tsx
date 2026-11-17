import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/Image";
import { Link } from "@/components/Link";
import { usePathname } from "@/hooks/use-pathname";
import { Search, Star, X } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { libraries } from "@/data/libraries";
import { componentIndex } from "@/data/components";
import { integrations, integrationTypes } from "@/data/integrations";
import { createDirectorySearch } from "@/lib/directory";
import { createIntegrationSearch } from "@/lib/integration-directory";
import { repo } from "@/lib/repo";
import styles from "./SiteSearch.module.css";

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const searchDirectory = createDirectorySearch(libraries, componentIndex);
const searchIntegrations = createIntegrationSearch(integrations);

/** Directories whose search row field (FilterBar) filters the results in place, with its placeholder and label. */
export const IN_PLACE_SEARCH: Partial<Record<string, { placeholder: string; label: string }>> = {
  "/libraries": { placeholder: "Search libraries", label: "Search libraries or components" },
  "/integrations": { placeholder: "Search integrations", label: "Search MCP servers and connectors" },
};

let starsRequest: Promise<number | null> | null = null;

/** GitHub star count for the repo, fetched once per page load through `/api/stars` and shared by every caller. */
export function useRepoStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    starsRequest ??= fetch("/api/stars")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { stars?: unknown } | null) => (typeof body?.stars === "number" ? body.stars : null))
      .catch(() => null);
    starsRequest.then((count) => { if (active) setStars(count); });
    return () => { active = false; };
  }, []);
  return stars;
}

/** The Col mark and wordmark, linking home. */
export function BrandLink({ className = "" }: { className?: string }) {
  return (
    <a href="/" aria-label="Col, Collection of Libraries" className={`site-brand ${className}`}>
      <Image src="/brand/col-mark.svg" alt="" width={20} height={20} className="site-brand-mark" priority />
      <span className="site-brand-name cap">Col</span>
    </a>
  );
}

/** Link to the repo on GitHub with its star count. */
export function RepoStars({ stars, className = "" }: { stars: number | null; className?: string }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`site-repo ${className}`}
      aria-label={`Col on GitHub${stars === null ? "" : `, ${stars} stars`}`}
      title="Col on GitHub"
    >
      <GitHubLogoIcon width={15} height={15} aria-hidden="true" />
      {/* No placeholder dash while the count loads (or if it fails): the logo alone stands for the link. */}
      {stars !== null && (
        <span className="site-repo-count">
          <Star className="site-repo-star" aria-hidden="true" />
          <span className="cap">{compactNumber.format(stars)}</span>
        </span>
      )}
    </a>
  );
}

/**
 * The large glass filtering field every directory shares (Libraries,
 * Integrations, Components), bound to whatever query its caller owns. Empty, it
 * shows the `/` shortcut; with a query, a clear button that Esc also triggers.
 */
export function SearchField({ value, onChange, placeholder, label, className = "" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <form role="search" className={`directory-hero-search ${className}`} onSubmit={(event) => event.preventDefault()}>
      <Search className="directory-hero-search-icon" aria-hidden />
      <input
        data-directory-search=""
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (value) onChange("");
            else event.currentTarget.blur();
          }
        }}
        placeholder={`${placeholder}…`}
        aria-label={label}
        aria-description="Press slash to focus search"
        aria-keyshortcuts="/"
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button type="button" className="directory-hero-search-clear" onClick={() => onChange("")} aria-label="Clear search">
          <X aria-hidden /><kbd>Esc</kbd>
        </button>
      ) : (
        <kbd className="directory-hero-search-key" aria-hidden>/</kbd>
      )}
    </form>
  );
}

/**
 * Site search with a quick-results dropdown covering libraries and
 * integrations. The docs pages render it; directories have their own
 * in-place SearchField instead.
 */
export function SiteSearch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  const trimmed = query.trim();
  const results = trimmed
    ? searchDirectory({ query, category: null, stacks: [], useCases: [], sort: "curated" }).slice(0, 5)
    : [];
  const integrationResults = trimmed
    ? searchIntegrations({ query, type: null, client: null, publisher: null }).slice(0, 2)
    : [];
  // "View all" opens the directory that has matches, preferring libraries.
  const allResultsPath = results.length === 0 && integrationResults.length > 0 ? "/integrations" : "/libraries";

  return (
    <form
      role="search"
      className={`site-search ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed) window.location.assign(`${allResultsPath}?q=${encodeURIComponent(trimmed)}`);
      }}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Search aria-hidden="true" />
      <input
        ref={inputRef}
        data-site-search=""
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
        placeholder="Search"
        aria-label="Search libraries, components, and integrations"
        aria-description="Press slash to focus search"
        aria-keyshortcuts="/"
      />
      <kbd className={styles.shortcut} aria-hidden="true">/</kbd>
      {open && trimmed && (
        <div className="site-search-results" aria-label="Search results">
          {results.length || integrationResults.length ? (
            <ul>
              {results.map(({ library, components }) => (
                <li key={library.slug}>
                  <Link to="/libraries/$slug" params={{ slug: library.slug }} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <span>{library.name}</span>
                    <small>{components[0]?.name ?? library.category}</small>
                  </Link>
                </li>
              ))}
              {integrationResults.map((integration) => (
                <li key={integration.slug}>
                  <Link to="/integrations/$slug" params={{ slug: integration.slug }} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <span>{integration.name}</span>
                    <small>{integrationTypes(integration).join(" · ")}</small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p>No matches</p>}
          <button type="submit">View all results</button>
        </div>
      )}
    </form>
  );
}
