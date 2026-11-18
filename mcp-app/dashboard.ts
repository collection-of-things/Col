import { createHmac, timingSafeEqual } from "node:crypto";
import type { DailyUsage, LibraryRank, UsageStore } from "./usage.ts";

/**
 * The private usage dashboard at `GET /dashboard`: the same counts as
 * `GET /usage`, rendered as a page. Signing in with `COL_USAGE_TOKEN` sets an
 * HttpOnly cookie holding its issue time and an HMAC of that time keyed by
 * the token (never the token itself). Sessions expire after 30 days on the
 * server too, and rotating the token signs every browser out.
 */
export type DashboardOptions = {
  store: UsageStore | null;
  token: string | undefined;
  /** Display names keyed by library slug; unknown slugs show the slug. */
  libraryNames: ReadonlyMap<string, string>;
  now?: Date;
};

export const dashboardPath = "/dashboard";
export const dashboardWindows = [7, 30, 90] as const;
type DashboardWindow = (typeof dashboardWindows)[number];

const cookieName = "col_usage_session";
const libraryUrl = (slug: string) => `https://usecol.com/libraries/${encodeURIComponent(slug)}`;

const sessionDays = 30;
const signature = (token: string, issuedAt: number) =>
  createHmac("sha256", token).update(`col-usage-dashboard:${issuedAt}`).digest("hex");

/** A session cookie value: `<issued at, ms>.<signature>`. */
const createSession = (token: string, now: Date) => `${now.getTime()}.${signature(token, now.getTime())}`;

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** True when the request carries an unexpired session signed with `token`. */
function hasSession(request: Request, token: string, now: Date): boolean {
  const [issued, signed] = cookie(request, cookieName)?.split(".") ?? [];
  const issuedAt = Number(issued);
  if (!signed || !Number.isSafeInteger(issuedAt)) return false;
  const age = now.getTime() - issuedAt;
  return age >= 0 && age < sessionDays * 86_400_000 && sameSecret(signed, signature(token, issuedAt));
}

function cookie(request: Request, name: string): string | null {
  for (const part of request.headers.get("cookie")?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator > 0 && part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return null;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

const count = (value: number | undefined) => (value ?? 0).toLocaleString("en-US");

/** Private pages: never cached, indexed, framed or allowed to load anything external. */
const pageHeaders = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
  "referrer-policy": "no-referrer",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

const styles = `
  :root { color-scheme: light dark; --bg: #fff; --text: #111; --muted: #555; --line: #e5e5e5; --web: #2563eb; --mcp: #d97706; }
  @media (prefers-color-scheme: dark) { :root { --bg: #000; --text: #fff; --muted: #a3a3a3; --line: #262626; --web: #60a5fa; --mcp: #fbbf24; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 960px; margin: 0 auto; padding: 32px 20px 48px; }
  h1 { font-size: 22px; margin: 0; }
  h2 { font-size: 15px; margin: 32px 0 12px; }
  a { color: inherit; }
  header { display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: baseline; justify-content: space-between; }
  nav { display: flex; gap: 16px; color: var(--muted); }
  nav strong { color: var(--text); }
  .totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 28px; }
  .totals dt { color: var(--muted); font-size: 13px; }
  .totals dd { margin: 0; font-size: 28px; font-variant-numeric: tabular-nums; }
  .chart { display: flex; align-items: flex-end; gap: 2px; height: 140px; border-bottom: 1px solid var(--line); }
  .day { flex: 1; display: flex; flex-direction: column-reverse; min-width: 0; height: 100%; }
  .day span { display: block; }
  .web { background: var(--web); }
  .mcp { background: var(--mcp); }
  .axis, .legend { display: flex; justify-content: space-between; color: var(--muted); font-size: 13px; margin-top: 6px; }
  .legend { justify-content: flex-start; gap: 16px; }
  .legend i { display: inline-block; width: 10px; height: 10px; margin-right: 6px; }
  .table { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--line); text-align: right; white-space: nowrap; }
  th { color: var(--muted); font-weight: 500; font-size: 13px; }
  th:first-child, td:first-child { text-align: left; padding-left: 0; }
  p.muted { color: var(--muted); }
  form { display: flex; flex-direction: column; gap: 12px; max-width: 360px; margin-top: 24px; }
  input { font: inherit; padding: 8px 10px; color: var(--text); background: var(--bg); border: 1px solid var(--muted); border-radius: 4px; }
  button { font: inherit; padding: 8px 14px; color: var(--bg); background: var(--text); border: 0; border-radius: 4px; cursor: pointer; align-self: flex-start; }
  footer { margin-top: 32px; color: var(--muted); font-size: 13px; }
  form.inline { display: inline; margin: 0; }
  form.inline button { padding: 0; color: inherit; background: none; font-size: inherit; text-decoration: underline; }
`;

const page = (title: string, body: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${styles}</style></head><body><main>${body}</main></body></html>`;

export function renderSignIn(error?: string): string {
  return page("Col usage", `<h1>Col usage</h1>
    <form method="post" action="${dashboardPath}">
      <label for="token">Usage token</label>
      <input id="token" name="token" type="password" autocomplete="current-password" required autofocus>
      ${error ? `<p class="muted" role="alert">${escapeHtml(error)}</p>` : ""}
      <button type="submit">Sign in</button>
    </form>`);
}

function renderChart(daily: DailyUsage[]): string {
  const peak = Math.max(0, ...daily.map((total) => total.web + total.mcp));
  const bar = (value: number, kind: "web" | "mcp") => value ? `<span class="${kind}" style="height:${(value / peak) * 100}%"></span>` : "";
  const days = daily.map((total) => {
    const label = `${total.day}: ${count(total.web)} site, ${count(total.mcp)} MCP`;
    return `<div class="day" role="listitem" aria-label="${label}" title="${label}">${bar(total.web, "web")}${bar(total.mcp, "mcp")}</div>`;
  }).join("");
  return `<div class="chart" role="list" aria-label="Uses per day">${days}</div>
    <div class="axis"><span>${daily[0]?.day ?? ""}</span><span>Peak ${count(peak)} a day</span><span>${daily.at(-1)?.day ?? ""}</span></div>
    <div class="legend"><span><i class="web"></i>Site</span><span><i class="mcp"></i>MCP</span></div>`;
}

function renderTable(ranking: LibraryRank[], names: ReadonlyMap<string, string>): string {
  if (ranking.length === 0) return `<p class="muted">No uses recorded in this window.</p>`;
  const rows = ranking.map((rank) => `<tr>
    <td><a href="${libraryUrl(rank.library)}">${escapeHtml(names.get(rank.library) ?? rank.library)}</a></td>
    <td>${count(rank.total)}</td><td>${count(rank.events.view)}</td><td>${count(rank.events.outbound)}</td>
    <td>${count(rank.events.get_library)}</td><td>${count(rank.events.get_component)}</td><td>${count(rank.events.render_component)}</td>
  </tr>`).join("");
  return `<div class="table"><table>
    <thead><tr><th scope="col">Library</th><th scope="col">Total</th><th scope="col">Page views</th><th scope="col">Link clicks</th><th scope="col">get_library</th><th scope="col">get_component</th><th scope="col">render_component</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

export function renderDashboard(store: UsageStore, days: DashboardWindow, names: ReadonlyMap<string, string>, now = new Date()): string {
  const ranking = store.ranking(days, now);
  const sum = (pick: (rank: LibraryRank) => number | undefined) => ranking.reduce((total, rank) => total + (pick(rank) ?? 0), 0);
  const nav = dashboardWindows.map((window) =>
    window === days ? `<strong aria-current="page">${window} days</strong>` : `<a href="${dashboardPath}?days=${window}">${window} days</a>`).join("");
  return page("Col usage", `<header><h1>Col usage</h1><nav aria-label="Window">${nav}</nav></header>
    <dl class="totals">
      <div><dt>Total uses</dt><dd>${count(sum((rank) => rank.total))}</dd></div>
      <div><dt>Page views</dt><dd>${count(sum((rank) => rank.events.view))}</dd></div>
      <div><dt>Link clicks</dt><dd>${count(sum((rank) => rank.events.outbound))}</dd></div>
      <div><dt>MCP calls</dt><dd>${count(sum((rank) => rank.mcp))}</dd></div>
      <div><dt>Libraries used</dt><dd>${count(ranking.length)}</dd></div>
    </dl>
    <h2>Per day</h2>${renderChart(store.daily(days, now))}
    <h2>Libraries</h2>${renderTable(ranking, names)}
    <footer>Updated ${now.toISOString().slice(0, 16).replace("T", " ")} UTC · days in UTC · <form class="inline" method="post" action="${dashboardPath}/sign-out"><button type="submit">Sign out</button></form></footer>`);
}

const maxSignInBytes = 4096;

/** Reads at most `limit` bytes of the body, or null when it is longer. */
async function readSmallBody(request: Request, limit: number): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const html = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers: { ...pageHeaders, ...headers } });

const sessionCookie = (value: string, maxAge: number) =>
  `${cookieName}=${value}; Path=${dashboardPath}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

/**
 * Serves `/dashboard` (page or sign-in form), `POST /dashboard` (sign in with
 * the token as form field `token`) and `POST /dashboard/sign-out`. Returns 404 when
 * usage tracking is not configured, like `/usage`.
 */
export async function serveDashboard(request: Request, { store, token, libraryNames, now = new Date() }: DashboardOptions): Promise<Response> {
  if (!store || !token) return new Response("Usage tracking is not configured", { status: 404 });
  const url = new URL(request.url);
  const redirect = (location: string, setCookie?: string) =>
    new Response(null, { status: 303, headers: { location, "cache-control": "no-store", ...(setCookie ? { "set-cookie": setCookie } : {}) } });

  // Only a same-site POST carries the SameSite=Strict cookie, so other sites cannot sign anyone out.
  if (url.pathname === `${dashboardPath}/sign-out`) {
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    if (!hasSession(request, token, now)) return redirect(dashboardPath);
    return redirect(dashboardPath, sessionCookie("", 0));
  }
  if (url.pathname !== dashboardPath) return new Response("Not found", { status: 404 });

  if (request.method === "POST") {
    const body = await readSmallBody(request, maxSignInBytes);
    if (body === null) return new Response("Request body too large", { status: 413 });
    const form = new URLSearchParams(body);
    const submitted = form.get("token");
    if (typeof submitted !== "string" || !sameSecret(submitted, token)) return html(renderSignIn("That token is not right."), 401);
    return redirect(dashboardPath, sessionCookie(createSession(token, now), sessionDays * 86_400));
  }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });

  if (!hasSession(request, token, now)) return html(renderSignIn());
  const requested = Number(url.searchParams.get("days") ?? 7);
  const days = dashboardWindows.find((window) => window === requested) ?? 7;
  return html(renderDashboard(store, days, libraryNames, now));
}
