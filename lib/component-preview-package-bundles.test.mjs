import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@babel/parser";
import { transformPreviewPackageImports } from "./component-preview-package-bundles.ts";
import packageBundles from "../data/component-previews/package-bundles.json" with { type: "json" };
import supplementalBundles from "../data/component-previews/package-bundles-supplemental.json" with { type: "json" };
import supplementalLock from "../data/component-previews/vendor/package-bundles-supplemental-lock.json" with { type: "json" };
import recoveryBundles from "../data/component-previews/package-bundles-react-recovery.json" with { type: "json" };
import recoveryLock from "../data/component-previews/vendor/package-bundles-react-recovery-lock.json" with { type: "json" };
import cultRadixBundles from "../data/component-previews/package-bundles-cult-radix.json" with { type: "json" };
import cultRadixLock from "../data/component-previews/vendor/package-bundles-cult-radix-lock.json" with { type: "json" };
import upstreamNotices from "../data/component-previews/vendor/package-license-notices.json" with { type: "json" };
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const imports = code => parse(code, { sourceType: "module", plugins: ["jsx"] }).program.body.filter(node => node.type === "ImportDeclaration").map(node => node.source.value);

test("official package fallback shares React and preserves unrelated imports", () => {
  const code = 'import { Button as ActualButton } from "@headlessui/react@2.2.10"; import * as Headless from "@headlessui/react@2.2.10"; import { useState } from "react"; export default ActualButton;';
  const result = transformPreviewPackageImports(code);
  assert.deepEqual(imports(result).sort(), ["react", "react", "react-dom"]);
  assert.match(result, /const ActualButton = __colOfficialPackage0\["Button"\]/);
  assert.match(result, /const Headless = __colOfficialPackage0/);
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.equal(transformPreviewPackageImports(result), result);
});

test("Web Awesome default wrapper imports select the actual bundled wrapper", () => {
  const result = transformPreviewPackageImports('import Button from "@awesome.me/webawesome@3.14.0/dist/react/button/index.js"; export default Button;');
  assert.deepEqual(imports(result), ["react"]);
  assert.match(result, /const Button = __colOfficialPackage0\["WaButton"\]/);
});

test("Web Awesome icon helpers and wrappers share the same genuine registry", () => {
  const result = transformPreviewPackageImports('import Dialog from "@awesome.me/webawesome@3.14.0/dist/react/dialog/index.js"; import { getIconLibrary, registerIconLibrary } from "@awesome.me/webawesome@3.14.0/dist/components/icon/library.js"; export { Dialog, getIconLibrary, registerIconLibrary };');
  assert.deepEqual(imports(result), ["react"]);
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.match(result, /const getIconLibrary = __colOfficialPackage0\["getIconLibrary"\]/);
  assert.match(result, /const registerIconLibrary = __colOfficialPackage0\["registerIconLibrary"\]/);
});

test("Sonner's actual stylesheet stays in its component bundle", () => {
  const result = transformPreviewPackageImports('import { Toaster } from "sonner@2.0.0"; import "sonner@2.0.0/dist/styles.css"; export default Toaster;');
  assert.ok(imports(result).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.ok(packageBundles["sonner@2.0.0"].source.files.some(file => file.path.endsWith("/sonner/dist/styles.css")));
});

test("fallback never redirects another version or invents a missing export", () => {
  const other = 'import { Button } from "@headlessui/react@2.2.9"; export default Button;';
  assert.equal(transformPreviewPackageImports(other), other);
  assert.throws(() => transformPreviewPackageImports('import { ImaginaryWidget } from "@headlessui/react@2.2.10";'), /does not export ImaginaryWidget/);
});

test("Motion 12.23.12 preview imports use the authentic package with shared React", () => {
  const code = 'import { AnimatePresence, motion, useMotionTemplate } from "motion@12.23.12/react"; export { AnimatePresence, motion, useMotionTemplate };';
  const result = transformPreviewPackageImports(code);
  assert.ok(imports(result).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.match(result, /const AnimatePresence = __colOfficialPackage0/);
  assert.match(result, /const useMotionTemplate = __colOfficialPackage0/);
  assert.throws(() => transformPreviewPackageImports('import { ImaginaryMotion } from "motion@12.23.12/react";'), /does not export ImaginaryMotion/);
});

test("Radix Label 2.1.7 retains its official namespace and shared React", () => {
  const code = 'import * as Label from "@radix-ui/react-label@2.1.7"; export default Label.Root;';
  const result = transformPreviewPackageImports(code);
  assert.ok(imports(result).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.match(result, /const Label = __colOfficialPackage0\["Subpath\d+_Namespace"\]/);
});

test("affected Cult UI previews share their pinned Radix dependency graph", () => {
  const code = 'import { Slot } from "radix-ui@1.4.3"; import * as Accordion from "@radix-ui/react-accordion@1.2.12"; import * as Label from "@radix-ui/react-label@2.1.7"; export { Slot, Accordion, Label };';
  const result = transformPreviewPackageImports(code, "cult-ui/Bg Animated Fractal Grid");
  assert.ok(imports(result).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.ok(imports(transformPreviewPackageImports(code, "other/Example")).includes("radix-ui@1.4.3"));
});

test("Cult UI recovery keeps authenticated Radix code and the original stylesheet", async () => {
  const bundle = cultRadixBundles["radix-ui@1.4.3"];
  const lock = await readFile(new URL("../data/component-previews/vendor/package-bundles-cult-radix-lock.json", import.meta.url));
  const hash = value => createHash("sha256").update(value).digest("hex");
  assert.equal(bundle.source.integrity, `sha256:${hash(bundle.code)}`);
  assert.equal(bundle.lockfileSha256, hash(lock));
  assert.equal(bundle.source.npmIntegrity, cultRadixLock.packages["node_modules/radix-ui"].integrity);
  assert.equal(bundle.components.length, 10);
  assert.equal(new Set(bundle.components).size, 10);
  assert.deepEqual(bundle.externals, ["react", "react-dom", "react/jsx-runtime"]);
  assert.deepEqual(bundle.warnings, []);
  for (const pkg of bundle.emittedPackages) assert.ok(bundle.licenses.some(notice => notice.package === pkg.package && notice.version === pkg.version && notice.text.trim()));
  for (const notice of bundle.licenses) assert.ok(bundle.code.includes(notice.text), `Missing ${notice.package} notice in the delivered code`);
  const { default: previews } = await import("../data/component-previews/extra.json", { with: { type: "json" } });
  const { createComponentPreview } = await import("./component-preview.ts");
  for (const id of bundle.components) {
    const entry = previews.entries[id];
    assert.ok(entry, id);
    const source = parse(entry.code, { sourceType: "module" });
    const radixImports = source.program.body.filter(node => node.type === "ImportDeclaration" && /^(?:@radix-ui\/|radix-ui@)/.test(node.source.value));
    const remaining = imports(transformPreviewPackageImports(entry.code, id));
    for (const statement of radixImports) {
      assert.ok(Object.hasOwn(bundle.importMappings, statement.source.value), `${id}: missing mapping for ${statement.source.value}`);
      assert.ok(!remaining.includes(statement.source.value), `${id}: still imports ${statement.source.value} from the CDN`);
      for (const specifier of statement.specifiers) {
        const name = specifier.type === "ImportNamespaceSpecifier" ? "*" : specifier.type === "ImportDefaultSpecifier" ? "default" : specifier.imported.name ?? specifier.imported.value;
        assert.ok(bundle.exports.includes(bundle.importMappings[statement.source.value][name]), `${id}: missing ${statement.source.value} ${name}`);
      }
    }
    for (const theme of ["light", "dark"]) {
      const preview = createComponentPreview({ id, theme }, "https://cult-ui.com/");
      assert.equal(preview.available, true, id);
      assert.ok(preview.code.includes(JSON.stringify(`@layer col-preview-defaults { body { background: ${theme === "dark" ? "#000" : "#fff"}; } }\n${previews.styles[entry.styleKey]}`)), `${id}: original stylesheet changed`);
    }
  }
});

test("Motion fallback pins and authenticates its official dependency graph and licenses", async () => {
  const bundle = recoveryBundles["motion@12.23.12"];
  const hash = value => createHash("sha256").update(value).digest("hex");
  const lock = await readFile(new URL("../data/component-previews/vendor/package-bundles-react-recovery-lock.json", import.meta.url));
  assert.equal(bundle.source.integrity, `sha256:${hash(bundle.code)}`);
  assert.equal(bundle.lockfileSha256, hash(lock));
  assert.equal(bundle.source.npmIntegrity, recoveryLock.packages["node_modules/motion"].integrity);
  assert.deepEqual(bundle.externals, ["react", "react/jsx-runtime"]);
  for (const [name, version] of Object.entries({ motion: "12.23.12", "framer-motion": "12.23.12", "motion-dom": "12.23.12", "motion-utils": "12.23.6", react: "19.3.0" })) {
    assert.equal(recoveryLock.packages[`node_modules/${name}`].version, version);
  }
  for (const pkg of bundle.emittedPackages) assert.ok(bundle.licenses.some(notice => notice.package === pkg.package && notice.version === pkg.version && notice.text.trim()));
  for (const notice of bundle.licenses) assert.ok(bundle.code.includes(notice.text), `Motion: missing ${notice.package} notice in the delivered code`);
  const label = recoveryBundles["@radix-ui/react-label@2.1.7"];
  assert.equal(label.source.integrity, `sha256:${hash(label.code)}`);
  assert.equal(label.lockfileSha256, hash(lock));
  assert.equal(label.source.npmIntegrity, recoveryLock.packages["node_modules/@radix-ui/react-label"].integrity);
  for (const pkg of label.emittedPackages) assert.ok(label.licenses.some(notice => notice.package === pkg.package && notice.version === pkg.version && notice.text.trim()));
  for (const notice of label.licenses) assert.ok(label.code.includes(notice.text), `Radix Label: missing ${notice.package} notice in the delivered code`);
  const { default: previews } = await import("../data/component-previews/extra.json", { with: { type: "json" } });
  for (const [id, preview] of Object.entries(previews.entries).filter(([, preview]) => preview.code.includes("motion@12.23.12/react"))) {
    const source = parse(preview.code, { sourceType: "module", plugins: ["jsx", "typescript"] });
    for (const statement of source.program.body.filter(node => node.type === "ImportDeclaration" && node.source.value === "motion@12.23.12/react")) {
      for (const specifier of statement.specifiers) assert.ok(bundle.exports.includes(bundle.importMappings[statement.source.value][specifier.imported?.name ?? specifier.imported?.value]), `${id}: missing official Motion export`);
    }
  }
  assert.deepEqual(bundle.warnings, []);
});

test("bundle loader names cannot collide with source declarations", () => {
  const result = transformPreviewPackageImports('import { Button } from "@headlessui/react@2.2.10"; const __colOfficialPackage0 = 1; export default Button;');
  assert.doesNotThrow(() => parse(result, { sourceType: "module" }));
  assert.match(result, /const Button = __colOfficialPackage_0/);
});

test("official bundles avoid the renderer's nullish and optional-chain rewrite", () => {
  for (const [name, bundle] of Object.entries({ ...packageBundles, ...supplementalBundles, ...recoveryBundles, ...cultRadixBundles })) {
    const pending = [parse(bundle.code, { sourceType: "script" })];
    while (pending.length) {
      const value = pending.pop();
      if (!value || typeof value !== "object") continue;
      assert.ok(value.type !== "OptionalCallExpression" && value.type !== "OptionalMemberExpression" && !(value.type === "LogicalExpression" && value.operator === "??"), `${name} must be downleveled before the client compiler`);
      pending.push(...Object.values(value));
    }
  }
});

test("supplemental dependency graph has exact pins and authenticated source metadata", async () => {
  const digest = value => createHash("sha256").update(value).digest("hex");
  const lockBytes = await readFile(new URL("../data/component-previews/vendor/package-bundles-supplemental-lock.json", import.meta.url));
  for (const [name, bundle] of Object.entries(supplementalBundles)) {
    assert.equal(bundle.source.integrity, "sha256:" + digest(bundle.code), name);
    assert.equal(bundle.lockfileSha256, digest(lockBytes), name);
    assert.ok(bundle.source.npmIntegrity.startsWith("sha512-"), name);
    assert.ok(bundle.source.files.length > 0, name);
    assert.deepEqual(bundle.warnings, [], name);
  }
  for (const [name, version] of Object.entries({ "@react-three/drei": "10.7.6", "@react-three/fiber": "9.3.0", three: "0.180.0", "@base-ui/react": "1.5.0", react: "19.3.0", "react-dom": "19.3.0" })) {
    assert.ok(Object.entries(supplementalLock.packages).some(([path, pkg]) => (pkg.name ?? path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length)) === name && pkg.version === version), `${name}@${version} must remain exactly pinned`);
  }
  assert.ok(Object.entries(supplementalLock.packages).every(([path, entry]) => !path || Boolean(entry.integrity && entry.resolved)));
});

test("every emitted supplemental package retains its actual license notice", () => {
  for (const [name, bundle] of Object.entries(supplementalBundles)) {
    assert.ok(bundle.emittedPackages.length > 0, name);
    for (const pkg of bundle.emittedPackages) {
      assert.ok(bundle.licenses.some(notice => notice.package === pkg.package && notice.version === pkg.version && notice.text.trim()), `${name}: missing ${pkg.package}@${pkg.version} notice`);
    }
    for (const notice of bundle.licenses.filter(notice => notice.source)) {
      const upstream = upstreamNotices[`${notice.package}@${notice.version}`];
      assert.equal(notice.text, upstream.text);
      assert.equal(notice.source.url, upstream.url);
      assert.equal(notice.source.integrity, "sha256:" + createHash("sha256").update(notice.text).digest("hex"));
      assert.match(notice.source.url, /\/\w{40}\/(?:license(?:[-.][^/]*)?|README\.md|package\.json)$/i);
      assert.ok(bundle.code.includes(notice.text), `${name}: upstream notice must survive in the rendered module`);
    }
  }
});

test("Streamdown keeps original KaTeX font bytes inside its authenticated graph", () => {
  const bundle = supplementalBundles["streamdown@1.6.10"];
  assert.ok(bundle, "the real Streamdown dependency must be bundled");
  const assignment = parse(bundle.code, { sourceType: "script" }).program.body.find(node => node.type === "ExpressionStatement" && node.expression.type === "AssignmentExpression" && node.expression.left.type === "MemberExpression" && node.expression.left.object.name === "colPackageStyles" && node.expression.left.property.name === "textContent");
  assert.equal(assignment?.expression.right.type, "StringLiteral");
  const css = assignment.expression.right.value;
  const fonts = [...css.matchAll(/url\(["']?data:[^,;]+;base64,([\w+/=]+)["']?\)/g)];
  assert.ok(fonts.length > 0, "KaTeX fonts must remain embedded");
  const sourceHashes = new Set(bundle.source.files.filter(file => /\.(?:woff2?|ttf)$/.test(file.path)).map(file => file.sha256));
  for (const [, bytes] of fonts) assert.ok(sourceHashes.has(createHash("sha256").update(Buffer.from(bytes, "base64")).digest("hex")), "embedded fonts must match authenticated original files");
  assert.match(bundle.code, /document\.head\.prepend\(colPackageStyles\)/, "application styles must keep precedence");
});


test("Base UI subpaths and Three providers retain one shared official package graph", () => {
  const base = transformPreviewPackageImports('import { Button } from "@base-ui/react@1.5.0/button"; import { Select } from "@base-ui/react@1.5.0/select"; export { Button, Select };');
  assert.ok(imports(base).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.equal((base.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  const three = transformPreviewPackageImports('import { useTexture } from "@react-three/drei@10.7.6"; import { Canvas, useThree } from "@react-three/fiber@9.3.0"; import * as THREE from "three@0.180.0"; export { useTexture, Canvas, useThree, THREE };');
  assert.ok(imports(three).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.equal((three.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.match(three, /const THREE = __colOfficialPackage0\["Subpath\d+_Namespace"\]/);
});

test("React Aria collection components share their exact official root graph", () => {
  const result = transformPreviewPackageImports('import { Breadcrumbs, Breadcrumb, Link } from "react-aria-components@1.22.1"; export { Breadcrumbs, Breadcrumb, Link };');
  assert.ok(imports(result).every(name => /^react(?:-dom)?(?:\/|$)/.test(name)));
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  for (const name of ["Breadcrumbs", "Breadcrumb", "Link"]) assert.match(result, new RegExp(`const ${name} = __colOfficialPackage0`));
});

test("late browser failures resolve exact package versions without changing shared graphs", () => {
  const required = ["@date-fns/tz@1.5.0", "react-day-picker@9.11.0", "@shikijs/transformers@2.5.0", "react-icons@5.5.0/si", "fuse.js@7.1.0", "react-dropzone@14.3.8", "tippy.js@6.3.7", "@dnd-kit/modifiers@9.0.0", "@uidotdev/usehooks@2.4.1", "lodash.throttle@4.1.1", "lodash.groupby@4.6.0", "poline@0.7.0", "cobe@2.0.1", "three@0.168.0", "react-player@2.16.0/youtube"];
  for (const specifier of required) {
    const bundle = Object.values(supplementalBundles).find(value => value.importMappings?.[specifier]);
    assert.ok(bundle, `${specifier} must use its authenticated official bundle`);
  }
  for (const [name, versions] of [["three", ["0.168.0", "0.180.0"]], ["@shikijs/transformers", ["2.5.0", "3.13.0"]]]) {
    for (const version of versions) assert.ok(Object.entries(supplementalLock.packages).some(([path, pkg]) => (pkg.name ?? path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length)) === name && pkg.version === version), `${name}@${version} must not be overwritten by another graph`);
  }
  for (const [name, version] of [["three", "0.168.0"], ["@shikijs/transformers", "2.5.0"], ["cobe", "0.6.4"], ["cobe", "2.0.1"]]) assert.ok(supplementalBundles[`${name}@${version}`].emittedPackages.some(pkg => pkg.package === name && pkg.version === version), `${name}@${version} must emit its own implementation`);
  const dnd = supplementalBundles["@dnd-kit/core@6.3.1"];
  for (const specifier of ["@dnd-kit/core@6.3.1", "@dnd-kit/modifiers@9.0.0", "@dnd-kit/sortable@10.0.0", "@dnd-kit/utilities@3.2.2"]) assert.ok(dnd.importMappings[specifier], `${specifier} must share the DnD context`);
});

test("remaining failed previews have complete static dependency closures", async () => {
  const { default: previews } = await import("../data/component-previews/extra.json", { with: { type: "json" } });
  for (const id of ["intent-ui/Button", "intent-ui/Combo Box", "intent-ui/Dialog", "intent-ui/Table", "intent-ui/Date Picker", "reui/File Upload", "reui/Data Grid", "reui/Tree", "elevenlabs-ui/Orb", "elevenlabs-ui/Audio Player", "elevenlabs-ui/Conversation"]) {
    const result = transformPreviewPackageImports(previews.entries[id].code);
    const unresolved = imports(result).filter(name => !/^react(?:-dom)?(?:\/|$)/.test(name));
    assert.deepEqual(unresolved, [], id + " must not rely on CDN package compilation");
  }
});

test("ReUI's original icon registry resolves the actual icons required by its demos", async () => {
  const { default: previews } = await import("../data/component-previews/extra.json", { with: { type: "json" } });
  const lucide = supplementalBundles["lucide-react@1.17.0"];
  for (const icon of ["CircleUserRoundIcon", "ChevronDownIcon", "CheckIcon", "ChevronUpIcon", "ChevronLeftIcon", "ChevronRightIcon", "PlusIcon"]) {
    const actualExport = lucide.importMappings["lucide-react@1.17.0"][icon];
    assert.ok(actualExport && lucide.exports.includes(actualExport), icon);
  }
  for (const id of ["reui/File Upload", "reui/Data Grid"]) {
    const entry = previews.entries[id];
    assert.ok(entry.source.files.some(file => file.url.endsWith("/registry/icons/__lucide__.ts") && file.sha256 === "b1735dd781b9ae6dd12c92a3268035253137071aee0a84a8a3b4273851ed460c"));
    assert.doesNotMatch(entry.code, /Module not found in bundle/);
    assert.ok(entry.gaps.some(gap => gap.includes("alternative icon-library customizer is unavailable")));
  }
});
