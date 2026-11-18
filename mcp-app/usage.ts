import { DatabaseSync } from "node:sqlite";

/**
 * Library usage counts for answering "which libraries are popular". Only daily
 * aggregates are stored — (day, library slug, source, event) and a count — so
 * nothing about the caller, their query, or their project is kept.
 *
 * The MCP service records its own tool calls; the website forwards directory
 * views and outbound clicks to `POST /usage`. `GET /usage` returns the ranking.
 */
export type UsageSource = "mcp" | "web";

/** MCP tools that act on one library, plus the directory events the site sends. */
export const usageEvents = {
  mcp: ["get_library", "get_component", "render_component"],
  web: ["view", "outbound"],
} as const satisfies Record<UsageSource, readonly string[]>;

export type UsageEvent = (typeof usageEvents)[UsageSource][number];

export type LibraryRank = { library: string; total: number; mcp: number; web: number; events: Partial<Record<UsageEvent, number>> };

/** One day's uses across every library, split by source. */
export type DailyUsage = { day: string; mcp: number; web: number };

export function isUsageEvent<S extends UsageSource>(source: S, event: unknown): event is (typeof usageEvents)[S][number] {
  return (usageEvents[source] as readonly unknown[]).includes(event);
}

/**
 * The library slug a successful MCP tool call used, or null for tools that
 * span the catalogue (searches). Component ids are `<library-slug>/<name>`.
 */
export function libraryFromToolCall(tool: string, args: unknown): string | null {
  if (!isUsageEvent("mcp", tool) || !args || typeof args !== "object") return null;
  const value = tool === "get_library" ? (args as { slug?: unknown }).slug : (args as { id?: unknown }).id;
  if (typeof value !== "string") return null;
  if (tool === "get_library") return value || null;
  const separator = value.indexOf("/");
  return separator > 0 ? value.slice(0, separator) : null;
}

const day = (date: Date) => date.toISOString().slice(0, 10);

/** Opens (or creates) the counts database. Pass `:memory:` in tests. */
export function createUsageStore(path: string) {
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE IF NOT EXISTS library_usage (
    day TEXT NOT NULL, library TEXT NOT NULL, source TEXT NOT NULL, event TEXT NOT NULL, count INTEGER NOT NULL,
    PRIMARY KEY (day, library, source, event)
  )`);
  const increment = db.prepare(`INSERT INTO library_usage VALUES (?, ?, ?, ?, 1)
    ON CONFLICT (day, library, source, event) DO UPDATE SET count = count + 1`);
  const since = db.prepare(`SELECT library, source, event, SUM(count) AS count FROM library_usage
    WHERE day >= ? AND day <= ? GROUP BY library, source, event`);
  const perDay = db.prepare(`SELECT day, source, SUM(count) AS count FROM library_usage
    WHERE day >= ? AND day <= ? GROUP BY day, source`);
  const windowStart = (days: number, now: Date) => new Date(now.getTime() - (days - 1) * 86_400_000);

  return {
    record(library: string, source: UsageSource, event: UsageEvent, now = new Date()) {
      increment.run(day(now), library, source, event);
    },

    /** Libraries ranked by total uses over the last `days` days, today included. */
    ranking(days: number, now = new Date()): LibraryRank[] {
      const ranks = new Map<string, LibraryRank>();
      for (const row of since.all(day(windowStart(days, now)), day(now)) as { library: string; source: UsageSource; event: UsageEvent; count: number }[]) {
        const rank = ranks.get(row.library) ?? { library: row.library, total: 0, mcp: 0, web: 0, events: {} };
        rank.total += row.count;
        rank[row.source] += row.count;
        rank.events[row.event] = (rank.events[row.event] ?? 0) + row.count;
        ranks.set(row.library, rank);
      }
      return [...ranks.values()].sort((a, b) => b.total - a.total || a.library.localeCompare(b.library));
    },

    /** Totals for each of the last `days` days, oldest first, with empty days as zeros. */
    daily(days: number, now = new Date()): DailyUsage[] {
      const start = windowStart(days, now);
      const totals = Array.from({ length: days }, (_, offset): DailyUsage => ({
        day: day(new Date(start.getTime() + offset * 86_400_000)), mcp: 0, web: 0,
      }));
      const byDay = new Map(totals.map((total) => [total.day, total]));
      for (const row of perDay.all(day(start), day(now)) as { day: string; source: UsageSource; count: number }[]) {
        const total = byDay.get(row.day);
        if (total) total[row.source] += row.count;
      }
      return totals;
    },

    close: () => db.close(),
  };
}

export type UsageStore = ReturnType<typeof createUsageStore>;
