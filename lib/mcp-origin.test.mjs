import assert from "node:assert/strict";
import test from "node:test";
import { isMcpOriginAllowed } from "./mcp-origin.ts";

test("MCP accepts non-browser requests and the canonical service origin", () => {
  assert.equal(isMcpOriginAllowed(null), true);
  assert.equal(isMcpOriginAllowed("https://usecol.com"), true);
  assert.equal(isMcpOriginAllowed("https://untrusted.example"), false);
  assert.equal(isMcpOriginAllowed("http://localhost:3000"), false);
});

test("MCP trusts only exact configured origins and fails closed on malformed configuration", () => {
  const trusted = "https://client.example, http://localhost:3000,https://preview.example:8443";
  for (const origin of ["https://client.example", "http://localhost:3000", "https://preview.example:8443"]) {
    assert.equal(isMcpOriginAllowed(origin, trusted), true, origin);
  }
  for (const origin of ["https://client.example.evil", "https://client.example:8443", "http://localhost:3001"]) {
    assert.equal(isMcpOriginAllowed(origin, trusted), false, origin);
  }
  for (const origin of ["", "null", "not-an-origin", "https://client.example/", "https://client.example/path", "https://client.example?query", "https://client.example#hash", "https://user:pass@client.example", "https://*.example", "file://", "https://client.example https://usecol.com", "https://client.example,https://usecol.com"]) {
    assert.equal(isMcpOriginAllowed(origin, origin), false, origin);
  }
  assert.equal(isMcpOriginAllowed("https://untrusted.example", "*"), false);
  assert.equal(isMcpOriginAllowed("https://usecol.com", "not-an-origin"), true);
});
