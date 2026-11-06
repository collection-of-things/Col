"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
const HANDOFF_MS = 900;
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
  });
  return searcherPromise;
}

/**
 * Hero library search. The first keystroke lifts the field to the top of the
 * stage, the hero copy and tiles blur away (see `html[data-hero-search]` in
 * HomePage.module.css), and a sheet of library cards rises from below the
 * fold. Once that has played, a view transition hands off to /libraries: the
 * field morphs into the directory's search and the sheet into its results,
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
  const latestQuery = useRef(query);
  latestQuery.current = query;

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
    router.prefetch("/libraries");
  };

  // After the lift, hand off to the directory with the query (and anything typed since) carried over.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const query = latestQuery.current;
      if (!query.trim()) return;
      const root = document.documentElement;
      const navigate = async () => {
        directoryQuery.set(query);
        router.push(`/libraries?q=${encodeURIComponent(query.trim())}`, { scroll: false });
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
          if (!field) return;
          const typed = latestQuery.current;
          if (typed !== query) {
            directoryQuery.set(typed);
            window.history.replaceState(window.history.state, "", `/libraries?q=${encodeURIComponent(typed.trim())}`);
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
      // The top bar is hidden on the hero and slides in with the lift; it keeps its layout box, so measure that.
      const bar = document.querySelector<HTMLElement>(".topbar")?.getBoundingClientRect();
      const top = Math.max(bar?.bottom ?? stageRect.top, 0) + (window.innerWidth > 640 ? LIFT_GAP_WIDE : LIFT_GAP_NARROW);
      // On the hero the card fills the screen; as the search opens it slides down to make room for the bar.
      // That slide moves the field too, so take it off the lift (once it has played, the rect already includes it).
      const panel = element.closest<HTMLElement>(".app-frame-panel");
      const drop = panel && root.dataset.heroSearch !== "open" ? parseFloat(getComputedStyle(panel).getPropertyValue("--home-drop")) || 0 : 0;
      element.style.setProperty("--lift", `${Math.round(top - rect.top - drop)}px`);
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
          data-hero-sheet=""
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
