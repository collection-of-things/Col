import assert from "node:assert/strict";
import { test } from "node:test";
import { serveDashboard } from "../mcp-app/dashboard.ts";
import { createUsageStore } from "../mcp-app/usage.ts";

const now = new Date("2026-11-17T12:00:00Z");
const origin = "https://col.example";
const libraryNames = new Map([["shadcn-ui", "shadcn/ui"], ["magicui", "Magic <UI>"]]);

function setup() {
  const store = createUsageStore(":memory:");
  store.record("shadcn-ui", "web", "view", now);
  store.record("shadcn-ui", "mcp", "get_component", now);
  store.record("magicui", "web", "outbound", now);
  store.record("magicui", "web", "view", new Date(now.getTime() - 20 * 86_400_000));
  const serve = (path, init, at = now) => serveDashboard(new Request(`${origin}${path}`, init), { store, token: "secret", libraryNames, now: at });
  const signIn = (token, fields = {}) => serve("/dashboard", { method: "POST", body: new URLSearchParams({ token, ...fields }) });
  return { store, serve, signIn };
}

test("the dashboard shows nothing until signed in with the usage token", async () => {
  const { serve, signIn, store } = setup();
  const anonymous = await serve("/dashboard");
  assert.equal(anonymous.status, 200);
  const signInPage = await anonymous.text();
  assert.match(signInPage, /name="token"/);
  assert.doesNotMatch(signInPage, /shadcn/);

  const wrong = await signIn("nope");
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get("set-cookie"), null);

  const forged = await serve("/dashboard", { headers: { cookie: "col_usage_session=secret" } });
  assert.doesNotMatch(await forged.text(), /shadcn/);
  assert.equal((await signIn("x".repeat(5000))).status, 413);
  assert.equal((await serveDashboard(new Request(`${origin}/dashboard`), { store: null, token: "secret", libraryNames })).status, 404);
  store.close();
});

test("signing in sets a session cookie that opens the ranking", async () => {
  const { serve, signIn, store } = setup();
  const signedIn = await signIn("secret");
  assert.equal(signedIn.status, 303);
  const setCookie = signedIn.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly; Secure; SameSite=Strict/);
  assert.equal((await signIn("secret", { days: "30" })).headers.get("location"), "/dashboard?days=30");
  assert.doesNotMatch(setCookie, /=secret;/);
  const cookie = setCookie.split(";")[0];

  const week = await serve("/dashboard", { headers: { cookie } });
  assert.equal(week.headers.get("cache-control"), "no-store");
  const html = await week.text();
  assert.match(html, />shadcn\/ui</);
  assert.match(html, /Magic &lt;UI&gt;/);
  assert.match(html, /<dt>Total uses<\/dt><dd>3<\/dd>/);

  const month = await (await serve("/dashboard?days=30", { headers: { cookie } })).text();
  assert.match(month, /<dt>Total uses<\/dt><dd>4<\/dd>/);

  const expired = await serve("/dashboard", { headers: { cookie } }, new Date(now.getTime() + 31 * 86_400_000));
  assert.doesNotMatch(await expired.text(), /shadcn/);

  assert.equal((await serve("/dashboard/sign-out", { method: "POST" })).headers.get("set-cookie"), null);
  const signedOut = await serve("/dashboard/sign-out", { method: "POST", headers: { cookie } });
  assert.match(signedOut.headers.get("set-cookie"), /col_usage_session=; .*Max-Age=0/);
  store.close();
});
