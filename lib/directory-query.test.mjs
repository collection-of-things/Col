import assert from "node:assert/strict";
import test from "node:test";
import { parseSearch, stringifySearch } from "./directory-query.ts";

test("search values stay text and special property names round-trip as own keys", () => {
  const input = "?q=123&constructor=a&constructor=b&toString=x&__proto__=a&__proto__=b";
  const search = parseSearch(input);
  assert.equal(search.q, "123");
  assert.deepEqual(search.constructor, ["a", "b"]);
  assert.equal(search.toString, "x");
  assert.deepEqual(search.__proto__, ["a", "b"]);
  assert.equal(Object.getPrototypeOf(search), Object.prototype);
  for (const key of ["constructor", "toString", "__proto__"]) assert.ok(Object.hasOwn(search, key));
  assert.equal(stringifySearch(search), input);
});
