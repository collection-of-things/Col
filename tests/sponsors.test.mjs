import assert from "node:assert/strict";
import test from "node:test";
import { sponsors } from "../data/sponsors.ts";
import { page } from "./site.mjs";
const text = (html) => html.replace(/<!--.*?-->/gs, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("every sponsor is credited with its mark and tier on the sponsors page and in the hero", async () => {
  const sponsorsPage = await page("/sponsors");
  const hero = await page("/");
  assert.equal(text(sponsorsPage).includes("No sponsors yet"), sponsors.length === 0, "the empty state must only show while there are no sponsors");
  for (const { name, url, tier, logo } of sponsors) {
    assert.ok(sponsorsPage.includes(`href="${url}"`), `The sponsors page is missing ${name}`);
    assert.ok(text(sponsorsPage).includes(`${name}`) && sponsorsPage.includes(`>${tier}</span>`), `The sponsors page does not credit ${name} as ${tier}`);
    assert.ok(sponsorsPage.includes(encodeURIComponent(logo)), `The sponsors page is missing the ${name} mark`);
    assert.ok(text(hero).includes(`Sponsored by ${name} · ${tier}`), `The hero does not credit ${name} as ${tier}`);
    assert.ok(hero.includes(encodeURIComponent(logo)), `The hero is missing the ${name} mark`);
  }
});
