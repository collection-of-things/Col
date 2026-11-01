import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { patchTorchPreview } from "./torch-preview-patches.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cache = resolve(process.argv[2] ?? resolve(root, "node_modules/.cache/solid-previews/torch-ui"));
const library = resolve(root, "data/solid-libraries/torch-ui");
const source = resolve(library, "upstream/src/components/navigation/DropdownMenu.tsx");
const fixture = resolve(library, "upstream/src/components/navigation/col-dropdown-type-fixture.tsx");
const original = readFileSync(source, "utf8");
const provenance = JSON.parse(readFileSync(resolve(library, "provenance.json"), "utf8"));
const recorded = provenance.sources.find(item => item.path === "upstream/src/components/navigation/DropdownMenu.tsx");
if (!recorded || createHash("sha256").update(original).digest("hex") !== recorded.integrity) throw new Error("TorchUI trigger source does not match its provenance");

const files = new Map([
  [source, patchTorchPreview("DropdownMenu.tsx", original)],
  [fixture, `import type { Component, JSX } from "solid-js";
import { DropdownMenu, DropdownMenuTrigger } from "./DropdownMenu";
import { Button as TorchButton } from "../actions/Button";
declare global { interface ImportMeta { readonly env: { readonly DEV: boolean } } }
declare const Button: Component<{ variant?: "primary" | "secondary"; size?: "sm" | "md"; children?: JSX.Element }>;
const direct = <DropdownMenuTrigger as={Button} variant="secondary" size="sm">Actions</DropdownMenuTrigger>;
const compound = <DropdownMenu.Trigger as={Button} variant="secondary" size="sm">Actions</DropdownMenu.Trigger>;
const realButton = <DropdownMenu.Trigger as={TorchButton} variant="secondary" size="sm">Actions</DropdownMenu.Trigger>;
// @ts-expect-error Invalid custom component variants must be rejected.
const invalid = <DropdownMenuTrigger as={Button} variant="invalid">Actions</DropdownMenuTrigger>;
void [direct, compound, realButton, invalid];`],
]);
const options = {
  strict: true, noEmit: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.Preserve, jsxImportSource: "solid-js", baseUrl: cache,
  paths: { "*": ["node_modules/*"], "@kobalte/core/*": ["node_modules/@kobalte/core/dist/*/index.d.ts"] },
};
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host), fileExists = host.fileExists.bind(host);
host.readFile = path => files.get(resolve(path)) ?? readFile(path);
host.fileExists = path => files.has(resolve(path)) || fileExists(path);
const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([source, fixture], options, host));
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => root, getCanonicalFileName: path => path, getNewLine: () => "\n" }));
  process.exitCode = 1;
} else console.log("TorchUI polymorphic trigger typecheck passed");
