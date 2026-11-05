import { useSyncExternalStore } from "react";

/**
 * The directory's search text. It lives outside React state so the sidebar
 * search (part of the app frame) and the directory results can share it.
 */
let query = "";
const listeners = new Set<() => void>();

export const directoryQuery = {
  get: () => query,
  set(next: string) {
    if (next === query) return;
    query = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useDirectoryQuery() {
  return useSyncExternalStore(directoryQuery.subscribe, directoryQuery.get, () => "");
}

/** Focus whichever directory search field is on screen (sidebar on desktop, top bar on mobile). */
export function focusDirectorySearch() {
  const field = [...document.querySelectorAll<HTMLInputElement>("[data-directory-search]")].find((input) => input.offsetParent !== null);
  field?.focus();
  return Boolean(field);
}

/**
 * Search params for pages that start from a `?q=` query. The router merges
 * validated params over the raw ones, so `q` is always set, to undefined when
 * it is not a non-empty string.
 */
export function validateQuerySearch(search: Record<string, unknown>): { q?: string } {
  return { q: typeof search.q === "string" && search.q !== "" ? search.q : undefined };
}

/** Reads a query string the way `URLSearchParams` does: every value stays text, and repeated keys become a list. */
export function parseSearch(searchStr: string): Record<string, string | string[]> {
  const search = new Map<string, string | string[]>();
  for (const [key, value] of new URLSearchParams(searchStr)) {
    const previous = search.get(key);
    search.set(key, previous === undefined ? value : [...(Array.isArray(previous) ? previous : [previous]), value]);
  }
  return Object.fromEntries(search);
}

/** Writes search params back as a plain query string, skipping undefined values. */
export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    for (const item of Array.isArray(value) ? value : [value]) if (item !== undefined) params.append(key, String(item));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Cache headers for pages rendered per request from the query string, as Next.js sent for dynamic pages. */
export const uncachedPageHeaders = { "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate" };
