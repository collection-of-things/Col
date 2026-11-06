// HTTP access to the built site that tests/site-server.mjs serves.
import assert from "node:assert/strict";

/** Base URL of the local Worker; set by the global setup that `bun run test` runs. */
export function siteUrl() {
  const url = process.env.COL_SITE_URL;
  if (!url) throw new Error("Run page tests with --test-global-setup=tests/site-server.mjs (bun run test does)");
  return url;
}

export const request = (path, init) => fetch(new URL(path, siteUrl()), { redirect: "manual", ...init });

const pages = new Map();

/** The body of a page that must answer 200, fetched once per test file. */
export function page(path) {
  if (!pages.has(path)) {
    pages.set(path, request(path).then(async (response) => {
      assert.equal(response.status, 200, `${path} answered ${response.status}`);
      return response.text();
    }));
  }
  return pages.get(path);
}
