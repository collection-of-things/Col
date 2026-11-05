import assert from "node:assert/strict";
import test from "node:test";
import { imageSet, parseImageRequest, parseImageSource } from "./image.ts";

test("image optimizer accepts only local raster files and the expected GitHub avatar URLs", () => {
  assert.deepEqual(parseImageSource("https://avatars.githubusercontent.com/u/208310261?v=4")?.kind, "remote");
  assert.deepEqual(parseImageSource("/hero-logos/shadcn-glow.png"), { kind: "local", path: "/hero-logos/shadcn-glow.png" });
  for (const url of [
    "https://avatars.githubusercontent.com:444/u/208310261?v=4",
    "https://avatars.githubusercontent.com/u/208310261?v=4&size=1",
    "https://avatars.githubusercontent.com/u/208310261",
    "https://www.google.com/s2/favicons?domain=example.com&sz=128",
    "//avatars.githubusercontent.com/u/1?v=4",
    "/docs.html",
    "/brand/col-mark.svg",
    "/hero-logos/../../secret.png",
  ]) assert.equal(parseImageSource(url), null, url);
});

test("image requests must use an allowed width, the default quality, and no extra parameters", () => {
  const params = (query) => new URLSearchParams(query);
  assert.equal(parseImageRequest(params("url=%2Fsponsors%2Freact-bits.png&w=256&q=75"))?.width, 256);
  for (const query of ["url=%2Fsponsors%2Freact-bits.png&w=250&q=75", "url=%2Fsponsors%2Freact-bits.png&w=256&q=100", "url=%2Fsponsors%2Freact-bits.png&w=256&q=75&x=1", "w=256&q=75"]) {
    assert.equal(parseImageRequest(params(query)), null, query);
  }
});

test("srcsets match next/image: 1x/2x for fixed widths, viewport widths for sizes", () => {
  assert.equal(imageSet({ src: "/a.png", width: 72 }).srcSet, "/api/image?url=%2Fa.png&w=96&q=75 1x, /api/image?url=%2Fa.png&w=256&q=75 2x");
  const responsive = imageSet({ src: "/a.png", width: 320, sizes: "20vw" });
  assert.ok(responsive.srcSet.startsWith("/api/image?url=%2Fa.png&w=128&q=75 128w, "));
  assert.equal(responsive.src, "/api/image?url=%2Fa.png&w=3840&q=75");
});
