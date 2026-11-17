import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Link } from "@/components/Link";
import { useRouter } from "@tanstack/react-router";
import { directoryQuery } from "@/lib/directory-query";
import type { SearchResult } from "@/lib/directory";
import { LibraryCard } from "./LibraryCard";
import styles from "./HomePage.module.css";

const SAVED_LIBRARIES_KEY = "col:saved-libraries";
/** Gap (px) between the top bar and the lifted search bar: the same gap the directory search row uses, so the handoff only has to fade. */
const LIFT_GAP_WIDE = 28;
const LIFT_GAP_NARROW = 16;
const MAX_RESULTS = 24;
/** How long the lift and the rising sheet play before the page hands off to the directory. */
const HANDOFF_MS = 800;
/** Longest the view transition waits for the directory before letting the page paint again. */
const HANDOFF_WAIT_MS = 1200;

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> } };

/** Resolves with the directory's search field once the directory has rendered (or null after 4s). */
function waitForDirectoryField(): Promise<HTMLInputElement | null> {
  const started = performance.now();
  return new Promise((resolve) => {
    const check = () => {
      const field = window.location.pathname === "/libraries" ? document.querySelector<HTMLInputElement>(".directory-hero-search input") : null;
      if (field) resolve(field);
      else if (performance.now() - started > 4000) resolve(null);
      else requestAnimationFrame(check);
    };
    check();
  });
}

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
  }).catch((error: unknown) => {
    // Forget the failed load so the next attempt fetches the chunks again.
    searcherPromise = null;
    throw error;
  });
  return searcherPromise;
}

/**
 * Hero library search. The first keystroke lifts the field to the top of the
 * stage, the hero copy and tiles fade away (see `html[data-hero-search]` in
 * HomePage.module.css), and library entries rise into place below it. Once
 * that has played, a view transition hands off to /libraries: the field
 * morphs into the directory's search and the entries into its results,
 * with the query and caret carried over. Escape or clearing the field before
 * the handoff puts the hero back.
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
  const router = useRouter();
  const [loadFailed, setLoadFailed] = useState(false);
  // The newest query, including keys buffered during the handoff. Synced from state only while no handoff is under way.
  const latestQuery = useRef(query);
  const handingOff = useRef(false);
  useEffect(() => {
    if (!handingOff.current) latestQuery.current = query;
  }, [query]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Storage can be blocked outright, or hold malformed JSON; either way keep saved libraries in memory for this session.
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(SAVED_LIBRARIES_KEY);
    } catch {
      return;
    }
    try {
      const stored: unknown = JSON.parse(raw ?? "[]");
      if (Array.isArray(stored)) setSaved(new Set(stored.filter((slug): slug is string => typeof slug === "string")));
    } catch {
      // Malformed value: ignore it; the next save overwrites it.
    }
  }, []);

  const warm = () => {
    if (searcher) return void router.preloadRoute({ to: "/libraries" });
    setLoadFailed(false);
    loadSearcher().then((search) => setSearcher(() => search), () => setLoadFailed(true));
    void router.preloadRoute({ to: "/libraries" });
  };

  // After the lift, hand off to the directory with the query (and anything typed since) carried over.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const query = latestQuery.current;
      if (!query.trim()) return;
      const root = document.documentElement;
      const navigate = async () => {
        handingOff.current = true;
        directoryQuery.set(query);
        void router.navigate({ to: "/libraries", search: { q: query.trim() }, resetScroll: false });
        // Never hold the page frozen on a slow network: release the transition after HANDOFF_WAIT_MS, and finish the focus whenever the directory lands.
        // Keys pressed while the hero field is gone and the directory's isn't focused yet still count.
        const buffer = (event: KeyboardEvent) => {
          if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return;
          if (event.key.length === 1) latestQuery.current += event.key;
          else if (event.key === "Backspace") latestQuery.current = latestQuery.current.slice(0, -1);
          else return;
          event.preventDefault();
        };
        window.addEventListener("keydown", buffer, true);
        const ready = waitForDirectoryField();
        void ready.then((field) => {
          window.removeEventListener("keydown", buffer, true);
          handingOff.current = false;
          if (!field) return;
          const typed = latestQuery.current;
          if (typed !== query) {
            directoryQuery.set(typed);
            void router.navigate({ to: "/libraries", search: { q: typed.trim() }, replace: true, resetScroll: false });
          }
          field.focus({ preventScroll: true });
          field.setSelectionRange(typed.length, typed.length);
        });
        await Promise.race([ready, new Promise((resolve) => window.setTimeout(resolve, HANDOFF_WAIT_MS))]);
      };
      const start = (document as ViewTransitionDocument).startViewTransition;
      if (!start || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void navigate();
        return;
      }
      root.dataset.searchHandoff = "";
      start.call(document, navigate).finished.finally(() => { delete root.dataset.searchHandoff; });
    }, HANDOFF_MS);
    return () => window.clearTimeout(timer);
  }, [open, router]);

  // Lift the field by exactly the distance to the top of the stage, and line the results up with the stage's edges.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const element = field.current;
    if (!open || !element) {
      delete root.dataset.heroSearch;
      element?.style.removeProperty("--lift");
      return;
    }
    const measure = () => {
      // Read the field's resting position. Once it has lifted (a resize), turn its transition off for the read,
      // or removing --lift starts a transition and the rect still reports the lifted spot.
      const lifted = root.dataset.heroSearch === "open";
      if (lifted) element.style.transition = "none";
      element.style.removeProperty("--lift");
      const stage = element.closest<HTMLElement>("[data-scene]") ?? document.body;
      const stageRect = stage.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      // The top bar is hidden on the hero and slides in with the lift; it keeps its layout box, so measure that.
      const bar = document.querySelector<HTMLElement>(".topbar")?.getBoundingClientRect();
      // Same breakpoint as the directory search row's padding (760px in globals.css).
      const top = Math.max(bar?.bottom ?? stageRect.top, 0) + (window.innerWidth > 760 ? LIFT_GAP_WIDE : LIFT_GAP_NARROW);
      // On the hero the card fills the screen; as the search opens it slides down to make room for the bar.
      // That slide moves the field too, so take off whatever of it is still to come: the card ends right under the
      // top bar's box, and once it has slid the rect already includes it.
      const panel = element.closest<HTMLElement>(".app-frame[data-home] .app-frame-panel");
      const header = document.querySelector<HTMLElement>(".topbar");
      const drop = panel && header ? Math.max(0, header.offsetHeight - panel.getBoundingClientRect().top) : 0;
      element.style.setProperty("--lift", `${Math.round(top - rect.top - drop)}px`);
      if (lifted) {
        void element.offsetHeight;
        element.style.removeProperty("transition");
      }
      setFrame({ left: stageRect.left, right: window.innerWidth - stageRect.right, top: top + rect.height + 28 });
    };
    if (root.dataset.heroSearch !== "open") measure();
    root.dataset.heroSearch = "open";
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => () => { delete document.documentElement.dataset.heroSearch; }, []);

  // While results are up, the faded hero links and tiles behind them leave the tab order (pointer-events alone doesn't).
  useEffect(() => {
    const hidden = [...document.querySelectorAll<HTMLElement>("[data-hero-inert]")];
    hidden.forEach((element) => { element.inert = open; });
    return () => hidden.forEach((element) => { element.inert = false; });
  }, [open]);

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
      <div ref={field} className={styles.search} data-open={open || undefined} data-hero-field="">
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
          data-hero-search-input=""
          aria-description="Press slash to focus search"
          aria-keyshortcuts="/"
          aria-controls="hero-search-results"
          autoComplete="off"
          spellCheck={false}
        />
        {open ? (
          <button type="button" className={styles.searchClear} onClick={() => { setQuery(""); input.current?.focus(); }} aria-label="Clear search">
            <X aria-hidden />
            <kbd>Esc</kbd>
          </button>
        ) : (
          <kbd className={styles.searchKey} aria-hidden>/</kbd>
        )}
      </div>
      {mounted && createPortal(
        <section
          id="hero-search-results"
          className={styles.searchResults}
          data-hero-results=""
          data-open={open || undefined}
          aria-hidden={!open}
          aria-label="Library results"
          style={frame ? ({ "--results-left": `${frame.left}px`, "--results-right": `${frame.right}px`, "--results-top": `${frame.top}px` } as CSSProperties) : undefined}
        >
          <header className={styles.searchResultsBar}>
            <h2>
              Libraries
              <span aria-live="polite">
                {searcher ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”` : loadFailed ? "Search didn’t load." : "Searching…"}
              </span>
            </h2>
            {loadFailed && !searcher && (
              <button type="button" className={styles.searchResultsAll} onClick={warm}>Try again</button>
            )}
            <Link to="/libraries" className={styles.searchResultsAll} tabIndex={open ? undefined : -1}>Open the directory</Link>
          </header>
          <div className={styles.searchResultsScroll}>
            {searcher && results.length === 0 ? (
              <p className={styles.searchEmpty}>Nothing matches that search.</p>
            ) : (
              <div className={styles.searchGrid}>
                {results.slice(0, MAX_RESULTS).map(({ library, components }, index) => (
                  <div key={library.slug} className={styles.searchCell} style={{ "--i": Math.min(index, 15) } as CSSProperties}>
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
