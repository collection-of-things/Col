import { readFile, writeFile, mkdir, rename, copyFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { brotliCompressSync, brotliDecompressSync, constants } from "node:zlib";
import { resolve, dirname } from "node:path";
import { parse } from "@babel/parser";
import { buildSolidPreview } from "../solid-preview-build.mjs";
import { sha256, tailwind4, recordCssBuild } from "./source-build.mjs";
import { resolveNpmCli } from "../preview-package-archive.mjs";
import { containedPath, dynamicAssetUrls, motionAssetTransport } from "./motion-build-inputs.mjs";

const readJson = async path => {const value=JSON.parse(await readFile(path,"utf8"));return value.encoding==="br"?JSON.parse(brotliDecompressSync(Buffer.from(value.data,"base64"))):value;};
async function writeArtifact(path, text) {
  if (path.endsWith(".json")) JSON.parse(text);
  if (text.includes("\0")) throw new Error(`Refusing NUL bytes in ${path}`);
  await writeFile(path+".tmp", text);
  await rename(path+".tmp", path);
}
const aliasesFor = (slug, root) => slug === "nikala-ui" ? {
  "@/components/ui": resolve(root, "packages/core/src/registry/components/ui"),
  "@/providers": resolve(root, "packages/core/src/registry/providers"),
  "@/hooks/use-package-manager": resolve(root, "apps/web/src/hooks/use-package-manager.ts"),
  "@/lib/cli-formatter": resolve(root, "apps/web/src/lib/cli-formatter.ts"),
  "@/hooks": resolve(root, "packages/hooks/src"), "@nikala-ui/hooks": resolve(root, "packages/hooks/src/index.ts"), "@/lib": resolve(root, "packages/core/src/lib"),
} : slug === "magicui-solid" ? { "@": resolve(root, "src"), "~": resolve(root, "src") } : { "@": resolve(root, "components/tailwind/src") };

export async function openMotionBuild(slug) {
  if(!["nikala-ui","magicui-solid","mystic-ui"].includes(slug))throw new Error(`Unknown motion library: ${slug}`);
  const started = Date.now();
  const dataDir = resolve("data/solid-libraries", slug);
  const resolveDir = resolve(".scratch/solid-library-69/solid-motion/build", slug);
  const sourceRoot = resolve(resolveDir, "source");
  const upstream = await readJson(resolve(dataDir, "upstream.json"));
  const baseline=await readJson(resolve(dataDir,"baseline.json"));
  if(resolve(baseline.artifactFile)!==resolve(`data/component-previews/solid/${slug}.json`)||sha256(await readFile(baseline.artifactFile))!==baseline.artifactIntegrity||sha256(await readFile(resolve(dataDir,"baseline-package-lock.json")))!==baseline.lockIntegrity)throw new Error(`Retained baseline integrity mismatch: ${slug}`);
  for(const asset of Object.values(upstream.assets))if(asset.dataUrlFile)asset.dataUrl=await readFile(containedPath(dataDir,asset.dataUrlFile),"utf8");
  for(const asset of Object.values(upstream.assets))if(asset.resourceFile){const bytes=await readFile(containedPath(resolve("data/component-previews/media"),resolve(asset.resourceFile)));if(bytes.length!==asset.bytes||sha256(bytes)!==asset.integrity)throw new Error("Media resource integrity mismatch");}
  for(const [url,asset] of Object.entries(upstream.assets))if(asset.manifestFile){const root=asset.manifestFile==="data/component-previews/assets.json"?resolve("data/component-previews"):resolve(`data/component-previews/solid/${slug}`);const recorded=(await readJson(containedPath(root,resolve(asset.manifestFile)))).assets[url];const bytes=Buffer.from(recorded.base64,"base64");if(bytes.length!==asset.bytes||sha256(bytes)!==asset.integrity)throw new Error("Shared asset integrity mismatch");}
  const manifest = await readJson(resolve(dataDir, "examples.json"));
  for(const example of manifest.examples)if(example.module)containedPath(sourceRoot,example.module);
  const lockBytes = await readFile(resolve(dataDir, "package-lock.json"));
  const installed=await access(resolve(resolveDir,"node_modules/solid-js/package.json")).then(()=>true,()=>false);
  if(!installed){
    await mkdir(resolveDir,{recursive:true});
    for(const file of ["package.json","package-lock.json"])await copyFile(resolve(dataDir,file),resolve(resolveDir,file));
    const result=spawnSync(process.execPath,[resolveNpmCli(),"ci","--ignore-scripts","--no-audit","--no-fund","--prefer-offline"],{cwd:resolveDir,stdio:"inherit",windowsHide:true});
    if(result.error||result.status!==0)throw new Error(`Locked isolated install failed: ${slug}`);
  }
  if (sha256(await readFile(resolve(resolveDir, "package-lock.json"))) !== sha256(lockBytes)) throw new Error(`Isolated dependency lock differs: ${slug}`);
  const previous = await readJson(resolve(dataDir, "build.json"));
  for (const [url,asset] of Object.entries(upstream.assets)) if (!asset.blocked&&!asset.resourceFile&&!asset.manifestFile&&sha256(Buffer.from(asset.dataUrl.split(",")[1],"base64")) !== asset.integrity) throw new Error(`Original asset bytes changed: ${url}`);
  const dynamicUrls = new Set(Object.entries(upstream.assets).filter(([,asset])=>asset.resourceFile||asset.manifestFile).map(([url])=>url));
  const inlineAssets = (value,filename) => {
    for(const template of upstream.assetTemplates??[])if(template.directUrl){const asset=upstream.assets[template.directUrl];value=value.replaceAll(template.source,asset.manifestFile?`window.String(${JSON.stringify(template.directUrl)})`:JSON.stringify(asset.dataUrl));}
    if(slug==="magicui-solid")value=value.replaceAll("import.meta.env.BASE_URL",JSON.stringify("/magicui-solid/"));
    for (const [url,asset] of Object.entries(upstream.assets)) if(!asset.blocked&&!asset.resourceFile&&!asset.manifestFile)value=value.replaceAll(url,asset.dataUrl);
    for (const template of (upstream.assetTemplates??[]).filter(template=>!template.directUrl)) {
      const mapping=Object.fromEntries(template.urls.map(url=>[url,upstream.assets[url].dataUrl]));
      value=value.replaceAll(template.source,`((url) => (${JSON.stringify(mapping)})[url] ?? url)(${template.source})`);
    }
    return dynamicAssetUrls(value,filename,dynamicUrls);
  };
  // Reuse the authenticated CSS tool installation without another disk-heavy npm ci.
  for (const input of installed?previous.cssBuild.inputs.filter(input => input.path.startsWith("node_modules/")):[]) {
    if (sha256(await readFile(containedPath(resolve(resolveDir,"node_modules"),resolve(resolveDir,input.path)))) !== input.integrity) throw new Error(`CSS compiler changed since authenticated build: ${input.path}`);
  }
  for (const [path, file] of Object.entries(upstream.files)) {
    if (sha256(file.content) !== file.integrity) throw new Error(`Source integrity mismatch: ${path}`);
    const destination = containedPath(sourceRoot, path);
    const content = inlineAssets(file.content,path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
  for (const example of manifest.examples.filter(example => example.module?.startsWith("demos/"))) {
    const destination = containedPath(sourceRoot, example.module);
    const content = inlineAssets(await readFile(containedPath(dataDir, example.module), "utf8"),example.module);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
  const build = { slug, dataDir, resolveDir, sourceRoot, upstream, manifest, previous, baseline, require: createRequire(resolve(resolveDir, "package.json")), lock: JSON.parse(lockBytes), lockIntegrity: sha256(lockBytes), aliases: aliasesFor(slug,sourceRoot), cssAuthentication: installed?"Reused CSS compiler files verified against prior clean-install SHA-256 records; browser runtime inputs authenticated against the committed lock":"Fresh isolated npm ci --ignore-scripts against the committed lock authenticates CSS tools and runtime packages" };
  if (build.lock.packages["node_modules/lucide-solid"]) {
    const imports = new Set();
    for (const file of Object.values(upstream.files).filter(file=>/\.[jt]sx?$/.test(file.url))) {
      const ast = parse(file.content,{sourceType:"module",plugins:["typescript","jsx"]});
      for (const node of ast.program.body) if (node.type==="ImportDeclaration" && node.source.value==="lucide-solid" && node.importKind!=="type") for(const specifier of node.specifiers) if(specifier.type==="ImportSpecifier"&&specifier.importKind!=="type") imports.add(specifier.imported.name);
    }
    const packageRoot = resolve(resolveDir,"node_modules/lucide-solid/dist/esm");
    const barrel = await readFile(resolve(packageRoot,"lucide-solid.mjs"),"utf8");
    const ast = parse(barrel,{sourceType:"module"});
    const lines=[];
    for(const name of imports) {
      const node=ast.program.body.find(node=>node.type==="ExportNamedDeclaration"&&node.source&&node.specifiers.some(specifier=>specifier.exported.name===name));
      if(!node)throw new Error(`No official Lucide export ${name}`);
      const specifier=node.specifiers.find(specifier=>specifier.exported.name===name);
      lines.push(`export { ${specifier.local.name} as ${name} } from ${JSON.stringify(resolve(packageRoot,node.source.value).replaceAll("\\","/"))};`);
    }
    const filename=resolve(sourceRoot,"lucide-preview.ts");
    await writeFile(filename,lines.join("\n")+"\n");
    build.aliases["lucide-solid"]=filename;
  }
  if(slug === "magicui-solid") {
    // Shiki's official fine-grained API retains the demo's exact grammar/themes
    // without shipping every language in its 9.8 MB default browser bundle.
    const filename=resolve(sourceRoot,"shiki-demo.mjs");
    await writeFile(filename,'import { createBundledHighlighter, createSingletonShorthands, guessEmbeddedLanguages } from "@shikijs/core";\nimport { createOnigurumaEngine } from "@shikijs/engine-oniguruma";\nconst createHighlighter=createBundledHighlighter({langs:{typescript:()=>import("@shikijs/langs/typescript")},themes:{"github-dark":()=>import("@shikijs/themes/github-dark"),"github-light":()=>import("@shikijs/themes/github-light")},engine:()=>createOnigurumaEngine(import("@shikijs/engine-oniguruma/wasm-inlined"))});\nexport const {codeToHtml}=createSingletonShorthands(createHighlighter,{guessEmbeddedLanguages});\n');
    build.aliases.shiki=filename;
  }
  console.log(`${slug}: authenticated existing CSS tools and restored sources in ${Date.now()-started} ms`);
  return build;
}

async function stylesheet(build) {
  if (build.slug === "nikala-ui") return tailwind4(build, `${build.upstream.files["apps/web/src/app.css"].content.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);')}\n@source "./source/packages/core/src/registry/components/ui";\n@source "./source/packages/core/src/registry/providers";\n@source "./source/demos";`);
  if (build.slug === "mystic-ui") {
    const extend = { animation: {}, keyframes: {} };
    const content = [];
    for (const example of build.manifest.examples.filter(example => !example.gap)) {
      const registry = JSON.parse(build.upstream.files[`packages/registry/tailwind/${example.slug}.json`].content);
      Object.assign(extend.animation, registry.config?.theme?.extend?.animation);
      Object.assign(extend.keyframes, registry.config?.theme?.extend?.keyframes);
      for (const path of [example.componentSource, example.module]) content.push({ raw: build.upstream.files[path]?.content ?? await readFile(resolve(build.dataDir, path), "utf8"), extension: "tsx" });
    }
    const result = await build.require("postcss")([build.require("tailwindcss")({ darkMode: "class", content, theme: { extend }, plugins: [] })]).process(build.upstream.files["components/tailwind/.storybook/tailwind.css"].content, { from: undefined });
    await recordCssBuild(build, result.css, [resolve(build.resolveDir, "node_modules/tailwindcss/lib/css/preflight.css")]);
    return result.css;
  }
  const postcss = build.require("postcss");
  const theme = build.upstream.files["theme-black/styles/theme.css"].content;
  const base = postcss.parse(build.upstream.files["theme-black/styles/base.css"].content);
  const baseTheme = postcss.atRule({ name: "layer", params: "black" });
  base.walkRules(rule => { if (rule.selector === ":root") baseTheme.append(rule.clone()); });
  const site = postcss.parse(build.upstream.files["docs/common.css"].content);
  const typography = postcss.root();
  site.walkRules(rule => {
    if (rule.selector.split(",").includes(":root") && rule.nodes.some(node => node.prop === "--sl-line-height")) typography.append(rule.clone());
    if (rule.selector === "body" && rule.nodes.some(node => node.prop === "font-family" && node.value === "var(--__sl-font)")) typography.append(rule.clone());
  });
  let fonts = [...build.upstream.files["docs/ripple-button.html"].content.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).find(css => css.includes("--font-geist:"));
  for (const [url, asset] of Object.entries(build.upstream.assets)) if (asset.mediaType === "font/woff2") fonts = fonts.replaceAll(new URL(url).pathname, asset.dataUrl);
  const original = build.upstream.files["src/styles/global.css"].content.replace("@import 'tailwindcss/utilities.css' layer(utilities);", "@import 'tailwindcss/utilities.css' layer(utilities) source(none);");
  return tailwind4(build, `${original}\n${fonts}\n${theme}\n${baseTheme}\n@layer starlight{${typography}}\n@source "./source/src/registry";\n@source "./source/src/demos";\n@source "./source/src/components/ui";`);
}

export async function expandMotionLibrary(slug) {
  const build = await openMotionBuild(slug);
  const seedArtifact = await readJson(`data/component-previews/solid/${slug}.json`);
  const oldExpansion=await readJson(`data/component-previews/solid/${slug}/expanded.json`).catch(()=>({entries:{},groups:{}}));
  const oldArtifact={...seedArtifact,...oldExpansion,entries:{...seedArtifact.entries,...oldExpansion.entries}};
  const unavailable=await readJson(resolve(build.dataDir,"unavailable.json")).catch(()=>({}));
  const runtimeLimitations=await readJson(resolve(build.dataDir,"runtime-limitations.json")).catch(()=>({}));
  const groupFilter=process.env.PREVIEW_GROUP;
  if(groupFilter&&slug==="magicui-solid")for(const key of Object.keys(build.previous.groups??{}))oldArtifact.groups[key]=await readJson(`data/component-previews/solid/magicui-solid/${key}.json`);
  const css = await stylesheet(build);
  console.log(`${slug}: original stylesheet compiled (${Buffer.byteLength(css)} bytes)`);
  build.cssBuild.verification = build.cssAuthentication;
  const artifact = { entries: Object.fromEntries(Object.entries(oldArtifact.entries).filter(([,entry])=>groupFilter||entry.code)), styles: { main: css }, groups: groupFilter?oldArtifact.groups:{}, sources: Object.values(build.upstream.files).map(({url,integrity})=>({url,integrity})), notices: [...oldArtifact.notices] };
  artifact.unavailable=Object.fromEntries(Object.entries(unavailable).map(([id,reason])=>{
    const example=build.manifest.examples.find(example=>example.id===id),source=build.upstream.files[example.componentSource];
    return [id,{reason,source:{url:source.url,revision:build.upstream.revision,integrity:source.integrity},gaps:[reason]}];
  }));
  for(const id of Object.keys(unavailable))delete artifact.entries[id];
  const records = { revision: build.upstream.revision, baseline:{artifactIntegrity:build.baseline.artifactIntegrity,lockIntegrity:build.baseline.lockIntegrity}, cssBuild: build.cssBuild, records: build.baseline.records, styles: { main: { integrity: sha256(css) } }, groups: groupFilter?build.previous.groups:{}, inputs: groupFilter?build.previous.inputs:{}, packages: groupFilter?build.previous.packages:{}, ...(slug==="magicui-solid"?{environment:{"import.meta.env.BASE_URL":"/magicui-solid/",evidence:[build.upstream.files["astro.config.mjs"].url,build.upstream.files[".github/workflows/deploy.yml"].url]}}:{}) };
  records.assetTransport=motionAssetTransport(build.upstream);
  for(const [url,asset] of Object.entries(build.upstream.assets)) {
    if(asset.blocked)continue;
    const notice=Object.values(build.upstream.files).find(file=>file.url===asset.attribution.url);
    if(notice&&!artifact.notices.some(item=>item.url===notice.url))artifact.notices.push({url:notice.url,text:notice.content});
    const authoredNotice={url,text:`${asset.attribution.name}. ${asset.attribution.license}. Attribution: ${asset.attribution.url}.${asset.transformation?` ${asset.transformation}`:""}${asset.licenseNotice?`\n\n${asset.licenseNotice}`:""}`};
    const previousNotice=artifact.notices.findIndex(item=>item.url===url);
    if(previousNotice<0)artifact.notices.push(authoredNotice);else artifact.notices[previousNotice]=authoredNotice;
  }
  const sourceUrls = new Set(Object.values(build.upstream.files).map(file=>file.url));
  const sourceNotices = artifact.notices.filter(notice => sourceUrls.has(notice.url) || notice.url.includes("/tailwindcss/-/") || build.upstream.assets[notice.url]?.licenseNotice);
  const banner = "/*!\n" + sourceNotices.map(notice=>`${notice.url}\n${notice.text}`).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
  const attempts = [];
  async function group(examples, key) {
    const imports = examples.map((example, index) => `import ${example.exportName === "default" ? `Demo${index}` : `{ ${example.exportName} as Demo${index} }`} from ${JSON.stringify("./" + example.module)};`).join("\n");
    const mapping = examples.map((example,index)=>`${JSON.stringify(example.id)}: Demo${index}`).join(",");
    const entry = resolve(build.sourceRoot, `${key}.mount.tsx`);
    const theme = slug === "magicui-solid" ? 'document.documentElement.dataset.theme=document.documentElement.classList.contains("dark")?"dark":"light";' : "";
    await writeFile(entry, `import { render } from "solid-js/web";\n${imports}\nconst demos = {${mapping}};\nexport default function mount(target) { ${theme} const Demo = demos[PREVIEW_COMPONENT]; if (!Demo) throw new Error("Unknown original demo"); return render(() => <Demo />, target); }\n`);
    try {
      let compiled;
      for(let attempt=0;attempt<3;attempt++)try{compiled=await buildSolidPreview({ entry, resolveDir: build.resolveDir, sourceRoot: build.sourceRoot, aliases: build.aliases });break;}catch(error){if(attempt===2||!error.message.includes("fetch failed"))throw error;}
      const code = banner + compiled.code;
      if (Buffer.byteLength(code) > 4_500_000) throw new Error(`Original closed module exceeds the 5 MB file budget (${Buffer.byteLength(code)} bytes)`);
      artifact.groups[key] = { code, style: "main" };
      records.groups[key] = { codeIntegrity: sha256(code), cssIntegrity: sha256(css), lockIntegrity: compiled.lockIntegrity, inputs: compiled.inputs.map(input=>input.path), packages: Object.keys(compiled.packages) };
      for (const input of compiled.inputs) records.inputs[input.path] = input.sha256;
      Object.assign(records.packages, compiled.packages);
      for (const notice of compiled.notices) if (!artifact.notices.some(existing=>existing.url===notice.url)) artifact.notices.push({url:notice.url,text:notice.text});
      for (const example of examples) {
        const source = build.upstream.files[example.componentSource];
        const assets = Object.entries(build.upstream.assets).filter(([url,asset]) => !asset.blocked&&!asset.resourceFile&&!asset.manifestFile&&(css.includes(asset.dataUrl) || example.remoteUrls.includes(url) || build.upstream.assetTemplates?.some(template=>template.module===example.module&&template.urls.includes(url))) && (code.includes(asset.dataUrl)||css.includes(asset.dataUrl))).map(([url,asset])=>({url,downloadUrl:asset.downloadUrl,resolvedUrl:asset.resolvedUrl,sha256:asset.integrity,mediaType:asset.mediaType,bytes:Buffer.from(asset.dataUrl.split(",")[1],"base64").length,attribution:asset.attribution,...(asset.original?{original:asset.original,transformation:asset.transformation}:{})}));
        artifact.entries[example.id] = { group: key, package: slug, version: build.upstream.revision, runtimeVersion: "1.9.17", exportName: example.id === "magicui-solid/Tweet Card" ? "MagicTweet" : example.exportName, source: {url:source.url,revision:build.upstream.revision,integrity:source.integrity}, assets, gaps: [ ...(example.adaptation ? [example.adaptation] : []), ...(slug === "mystic-ui" ? ["Original Tailwind 3 source; the documentation website embeds Panda stories. Original theme-token and reduced-motion omissions are retained."] : []), ...(slug === "magicui-solid" ? ["The pinned upstream README declares MIT licensing, but its linked LICENSE file is absent."] : []), ...assets.filter(asset=>asset.transformation).map(asset=>asset.transformation), ...(example.id==="nikala-ui/Sidebar"?["The original sidebar renders and toggles, but its unconditional cookie write raises a sandbox SecurityError. Open state updates before that error; persistence is unavailable in the MCP iframe."]:[]) ] };
        attempts.push({ id: example.id, group: key, compiled: true });
        artifact.entries[example.id].gaps.push(...Object.entries(build.upstream.assets).filter(([url,asset])=>asset.blocked&&example.remoteUrls.includes(url)).map(([url,asset])=>`${asset.blocked} Original URL remains blocked: ${url}`));
        artifact.entries[example.id].gaps.push(...(runtimeLimitations[example.id]??[]));
      }
      console.log(`${slug}/${key}: ${examples.length} demos; ${Buffer.byteLength(code)} JS bytes`);
    } catch (error) {
      if(/fetch failed|Cannot locate npm/.test(error.message))throw error;
      if (examples.length > 1) { const middle = Math.ceil(examples.length / 2); await group(examples.slice(0,middle), key+"a"); await group(examples.slice(middle), key+"b"); }
      else { attempts.push({ id: examples[0].id, compiled: false, reason: error.message.slice(0,2000) }); console.log(`${examples[0].id}: ${error.message.slice(0,300)}`); }
    }
  }
  const selected = build.manifest.examples.filter(example=>!example.gap && !unavailable[example.id] && !oldArtifact.entries[example.id]?.code);
  const partitions = new Map();
  for(const example of selected) {
    const key = example.id === "magicui-solid/Tweet Card" ? "tweet" : example.packages.some(name=>name.startsWith("@tiptap/")) ? "editor" : example.packages.includes("shiki") ? "highlight" : example.remoteUrls.some(url=>/\.webm|\.mp4/.test(url)) ? "media" : "components";
    if(!partitions.has(key))partitions.set(key,[]);
    partitions.get(key).push(example);
  }
  for(const [key,examples] of partitions)if(!groupFilter||groupFilter===key)await group(examples,key);
  for (const [url, asset] of Object.entries(build.upstream.assets)) artifact.sources.push({url,integrity:asset.integrity});
  {
    const groupDir = resolve("data/component-previews/solid",slug);
    await mkdir(groupDir,{recursive:true});
    const imports=[];
    const mapping=[];
    for(const [index,[name,value]] of (slug==="magicui-solid"?Object.entries(artifact.groups):[]).entries()) {
      const content=JSON.stringify(value)+"\n";
      const text=name==="highlight"?JSON.stringify({encoding:"br",data:brotliCompressSync(Buffer.from(content),{params:{[constants.BROTLI_PARAM_QUALITY]:11}}).toString("base64")})+"\n":content;
      if(Buffer.byteLength(text)>5_000_000)throw new Error(`Preview group exceeds file limit: ${name}`);
      await writeArtifact(resolve(groupDir,`${name}.json`),text);
      records.groups[name].output={encoding:name==="highlight"?"br":"json",fileIntegrity:sha256(text),contentIntegrity:sha256(content)};
      imports.push(name==="highlight"?`import group${index}Packed from "./${name}.json" with { type: "json" };\nimport { decodePackedJson } from "../packed.ts";\nconst group${index}=decodePackedJson<{code:string;style:string}>(group${index}Packed);`:`import group${index} from "./${name}.json" with { type: "json" };`);
      mapping.push(`${JSON.stringify(name)}: group${index}`);
    }
    const expansionImport=slug==="nikala-ui"?'import expandedPacked from "./expanded.json" with { type: "json" };\nimport { decodeSolidPreviewArtifact } from "../packed.ts";\nconst expanded=decodeSolidPreviewArtifact(expandedPacked);':'import expanded from "./expanded.json" with { type: "json" };';
    await writeArtifact(resolve(groupDir,"index.ts"),`import seed from "../${slug}.json" with { type: "json" };\n${expansionImport}\n${imports.join("\n")}\nexport default { ...expanded, entries: { ...seed.entries, ...expanded.entries }, groups: { ...expanded.groups, ${mapping.join(", ")} }, sources: [...new Map([...seed.sources, ...(expanded.sources??[])].map(item => [item.url, item])).values()], notices: [...new Map([...seed.notices, ...(expanded.notices??[])].map(item => [item.url, item])).values()] };\n`);
    if(slug==="magicui-solid")artifact.groups = {};
  }
  for(const id of Object.keys(seedArtifact.entries))delete artifact.entries[id];
  const encoded = JSON.stringify(artifact)+"\n";
  const packed=slug==="nikala-ui"?JSON.stringify({encoding:"br",data:brotliCompressSync(Buffer.from(encoded),{params:{[constants.BROTLI_PARAM_QUALITY]:11}}).toString("base64")})+"\n":encoded;
  records.output={encoding:slug==="nikala-ui"?"br":"json",contentIntegrity:sha256(encoded),fileIntegrity:sha256(packed)};
  await writeArtifact(`data/component-previews/solid/${slug}/expanded.json`, packed);
  await writeArtifact(resolve(build.dataDir,"build.json"),JSON.stringify(records,null,2)+"\n");
  const previousAttempts = groupFilter ? (await readJson(resolve(build.dataDir,"compilation.json")).catch(()=>({attempts:[]}))).attempts : [];
  const rebuilt = new Set(attempts.map(attempt => attempt.id));
  await writeArtifact(resolve(build.dataDir,"compilation.json"),JSON.stringify({checkedAt:new Date().toISOString(),attempts:[...previousAttempts.filter(attempt => !rebuilt.has(attempt.id)), ...attempts]},null,2)+"\n");
  console.log(`${slug}: ${Object.keys(artifact.entries).length} total entries, ${Buffer.byteLength(encoded)} artifact bytes`);
}
