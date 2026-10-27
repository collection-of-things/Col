import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";
import { resolveReuiIconRegistry } from "./preview-reui-icons.mjs";

test("ReUI's default registry resolves through the virtual namespace instead of an empty glob", async () => {
  const source = 'export const load = libraryName => import(`./__${libraryName}__`);';
  const result = await build({ stdin: { contents: resolveReuiIconRegistry(source), loader: "js" }, bundle: true, write: false, format: "esm", plugins: [{ name: "verified-registry", setup(builder) {
    builder.onResolve({ filter: /^\.\/__lucide__$/ }, () => ({ path: "lucide-react@1.17.0", external: true }));
  } }] });
  assert.deepEqual(result.warnings, []);
  const code = result.outputFiles[0].text;
  assert.match(code, /import\("lucide-react@1\.17\.0"\)/);
  assert.doesNotMatch(code, /__glob|Module not found in bundle/);
  const module = await import("data:text/javascript," + encodeURIComponent(code));
  await assert.rejects(module.load("tabler"), /alternative icon-library customizer is unavailable/);
});

test("unreviewed dynamic icon-loader changes fail closed", () => {
  assert.throws(() => resolveReuiIconRegistry('import("./__lucide__")'), /reviewed ReUI icon-loader import changed/);
  assert.throws(() => resolveReuiIconRegistry('import(`./__${libraryName}__`); import(`./__${libraryName}__`);'), /reviewed ReUI icon-loader import changed/);
});
