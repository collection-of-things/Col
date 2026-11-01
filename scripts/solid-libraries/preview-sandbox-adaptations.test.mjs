import assert from "node:assert/strict";
import test from "node:test";
import { guardSidebarCookieWrite } from "./preview-sandbox-adaptations.mjs";

test("sidebar cookie writes keep working and suppress only sandbox SecurityError", () => {
  const source = 'function save(value) {\n  document.cookie = `sidebar=${value}`;\n}';
  const patched = guardSidebarCookieWrite(source, "fixture");
  const make = document => new Function("document", "DOMException", `${patched}\nreturn save;`)(document, DOMException);
  const writable = {};
  make(writable)("open");
  assert.equal(writable.cookie, "sidebar=open");
  assert.doesNotThrow(() => make({ set cookie(_) { throw new DOMException("blocked", "SecurityError"); } })("open"));
  assert.throws(() => make({ set cookie(_) { throw new TypeError("broken"); } })("open"), /broken/);
  assert.throws(() => guardSidebarCookieWrite("no cookie", "fixture"), /Sidebar cookie write changed/);
  assert.throws(() => guardSidebarCookieWrite(`${source}\ndocument.cookie = "again";`, "fixture"), /Sidebar cookie write changed/);
});
