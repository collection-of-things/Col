"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import Link from "next/link";
import type { SearchResult } from "@/lib/directory";
import { LibraryCard } from "./LibraryCard";
import styles from "./HomePage.module.css";

const SAVED_LIBRARIES_KEY = "col:saved-libraries";
/** Gap (px) between the top of the hero stage and the lifted search bar. */
const LIFT_TOP = 56;
const MAX_RESULTS = 24;

type Searcher = (query: string) => SearchResult[];

/**
 * The registry and component index are large, so the searcher loads the first
 * time the field is focused instead of shipping with the homepage.
 */
let searcherPromise: Promise<Searcher> | null = null;
function loadSearcher(): Promise<Searcher> {
  searcherPromise ??= Promise.all([
    import("@/lib/directory"),
    import("@/data/libraries"),
    import("@/data/components"),
  ]).then(([{ createDirectorySearch }, { libraries }, { componentIndex }]) => {
    const search = createDirectorySearch(libraries, componentIndex);
    return (query: string) => search({ query, category: null, stacks: [], useCases: [], sort: "curated" });
  });
  return searcherPromise;
}

/**
 * Hero library search. The first keystroke lifts the field to the top of the
 * stage, the hero copy and tiles blur away (see `html[data-hero-search]` in
 * HomePage.module.css), and a sheet of library cards rises from below the
 * fold. Clearing the field or pressing Escape puts the hero back.
 */
export function HeroSearch() {
  const field = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searcher, setSearcher] = useState<Searcher | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [frame, setFrame] = useState<{ left: number; right: number; top: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const open = query.trim().length > 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(SAVED_LIBRARIES_KEY) ?? "[]");
      if (Array.isArray(stored)) setSaved(new Set(stored.filter((slug): slug is string => typeof slug === "string")));
    } catch {
      localStorage.removeItem(SAVED_LIBRARIES_KEY);
    }
  }, []);

  const warm = () => {
    if (!searcher) void loadSearcher().then((search) => setSearcher(() => search));
  };

  // Lift the field by exactly the distance to the top of the stage, and line the sheet up with the stage's edges.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const element = field.current;
    if (!open || !element) {
      delete root.dataset.heroSearch;
      element?.style.removeProperty("--lift");
      return;
    }
    const measure = () => {
      element.style.removeProperty("--lift");
      const stage = element.closest<HTMLElement>("[data-scene]") ?? document.body;
      const stageRect = stage.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const top = Math.max(stageRect.top, 0) + LIFT_TOP;
      element.style.setProperty("--lift", `${Math.round(top - rect.top)}px`);
      setFrame({ left: stageRect.left, right: window.innerWidth - stageRect.right, top: top + rect.height + 28 });
    };
    if (root.dataset.heroSearch !== "open") measure();
    root.dataset.heroSearch = "open";
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => () => { delete document.documentElement.dataset.heroSearch; }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuery("");
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const results = open && searcher ? searcher(query) : [];

  const toggleSaved = (slug: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(SAVED_LIBRARIES_KEY, JSON.stringify([...next]));
      } catch {
        // Keep the selection for this session when storage is unavailable.
      }
      return next;
    });
  };

  return (
    <>
      <div ref={field} className={styles.search} data-open={open || undefined}>
        <Search className={styles.searchIcon} aria-hidden />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={warm}
          onPointerEnter={warm}
          placeholder="Search 100+ libraries…"
          aria-label="Search libraries"
          aria-controls="hero-search-results"
          autoComplete="off"
          spellCheck={false}
        />
        {open && (
          <button type="button" className={styles.searchClear} onClick={() => { setQuery(""); input.current?.focus(); }} aria-label="Clear search">
            <X aria-hidden />
            <kbd>esc</kbd>
          </button>
        )}
      </div>
      {mounted && createPortal(
        <section
          id="hero-search-results"
          className={styles.searchSheet}
          data-open={open || undefined}
          aria-hidden={!open}
          aria-label="Library results"
          style={frame ? ({ "--sheet-left": `${frame.left}px`, "--sheet-right": `${frame.right}px`, "--sheet-top": `${frame.top}px` } as CSSProperties) : undefined}
        >
          <header className={styles.searchSheetBar}>
            <h2>
              Libraries
              <span aria-live="polite">{searcher ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”` : "Searching…"}</span>
            </h2>
            <Link href="/libraries" className={styles.searchSheetAll} tabIndex={open ? undefined : -1}>Open the directory</Link>
          </header>
          <div className={styles.searchSheetScroll}>
            {searcher && results.length === 0 ? (
              <p className={styles.searchEmpty}>Nothing matches that search.</p>
            ) : (
              <div className={styles.searchGrid}>
                {results.slice(0, MAX_RESULTS).map(({ library, components }, index) => (
                  <div key={library.slug} className={styles.searchCell} style={{ "--i": Math.min(index, 11) } as CSSProperties}>
                    <LibraryCard layout="grid" library={library} matches={components} saved={saved.has(library.slug)} onToggleSaved={() => toggleSaved(library.slug)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>,
        document.body,
      )}
    </>
  );
}
