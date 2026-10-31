import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { brotliDecompressSync } from "node:zlib";
import { matchesPreviewIntegrity, previewIntegrity } from "./motion-preview-integrity.mjs";

const sizes={"nikala-ui":78,"magicui-solid":76,"mystic-ui":27};
const readJson=async path=>JSON.parse(await readFile(path,"utf8"));
const readArtifact=async slug=>(await import(pathToFileURL(resolve(`data/component-previews/solid/${slug}/index.ts`)).href)).default;
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const command=/\b(?:npx|bunx)\s|\b(?:npm|pnpm|yarn|bun)\s+(?:install|add|create|dlx|exec|i)\b/i;
function runtimeImports(code){
  const found=[];
  const walk=node=>{if(!node||typeof node!=="object")return;if(Array.isArray(node)){node.forEach(walk);return;}if(node.type==="ImportDeclaration"||node.type==="ImportExpression"||(node.type==="CallExpression"&&node.callee.type==="Import"))found.push(node.type);for(const [key,value] of Object.entries(node))if(!["loc","comments","tokens"].includes(key))walk(value);};
  walk(parse(code,{sourceType:"module"}));return found;
}

for(const [slug,count] of Object.entries(sizes)){
  const dir=`data/solid-libraries/${slug}`;
  test(`${slug}: every documented component has verified source, lookup evidence and a preview outcome`,async()=>{
    const [catalog,corpus,coverage,pages,upstream,artifact]=await Promise.all([readJson(`${dir}/catalog.json`),readJson(`${dir}/corpus.json`),readJson(`${dir}/coverage.json`),readJson(`${dir}/page-verification.json`),readJson(`${dir}/upstream.json`),readArtifact(slug)]);
    const baseline=await readJson(`${dir}/baseline.json`);
    assert.equal(hash(await readFile(baseline.artifactFile)),baseline.artifactIntegrity);
    assert.equal(hash(await readFile(`${dir}/baseline-package-lock.json`)),baseline.lockIntegrity);
    assert.equal(catalog.components.length,count);
    assert.equal(coverage.documentationInventory.length,count);
    assert.equal(new Set(catalog.components.map(component=>component.name)).size,count);
    for(const component of catalog.components){
      const id=`${slug}/${component.name}`;
      assert.equal(pages.entries.find(page=>page.url===component.url)?.status,200,id);
      const snapshots=corpus.snapshots.filter(snapshot=>snapshot.componentId===id);
      assert.equal(snapshots.length,1,id);
      assert.equal(snapshots[0].sourceRevision,upstream.revision);
      assert.ok(snapshots[0].sources.length>=1,id);
      assert.ok(!command.test(snapshots[0].content),`No executable installation command: ${id}`);
      assert.ok(artifact.entries[id]||artifact.unavailable?.[id],id);
    }
    for(const snapshot of corpus.snapshots)assert.ok(!command.test(snapshot.content),snapshot.title);
    for(const [path,source] of Object.entries(upstream.files))assert.equal(hash(source.content),source.integrity,path);
    for(const [url,asset] of Object.entries(upstream.assets)){
      if(asset.blocked){assert.equal(asset.dataUrl,undefined,url);continue;}
      const manifest=asset.manifestFile?await readJson(asset.manifestFile):undefined;
      const bytes=asset.resourceFile?await readFile(asset.resourceFile):Buffer.from(manifest?manifest.assets[url].base64:asset.dataUrl.split(",")[1],"base64");
      assert.equal(hash(bytes),asset.integrity,url);
      if(manifest){assert.equal(manifest.assets[url].sha256,asset.integrity,url);assert.equal(bytes.length,asset.bytes,url);assert.equal(asset.dataUrl,undefined,url);}
      assert.ok(!/no separate.*license asserted/.test(asset.attribution.license),url);
    }
  });
  test(`${slug}: grouped preview output matches its build records and every emitted preview has both theme checks`,async()=>{
    const artifact=await readArtifact(slug);
    const build=await readJson(`${dir}/build.json`);
    const encoded=await readFile(`data/component-previews/solid/${slug}/expanded.json`);
    const packed=JSON.parse(encoded);
    assert.equal(hash(encoded),build.output.fileIntegrity);
    assert.equal(hash(packed.encoding==="br"?brotliDecompressSync(Buffer.from(packed.data,"base64")):encoded),build.output.contentIntegrity);
    const browser=await readJson(`${dir}/browser-verification.json`);
    for(const [key,group] of Object.entries(artifact.groups)){
      if(build.groups[key].output){const file=await readFile(`data/component-previews/solid/${slug}/${key}.json`);const raw=JSON.parse(file);assert.equal(hash(file),build.groups[key].output.fileIntegrity,key);assert.equal(hash(raw.encoding==="br"?brotliDecompressSync(Buffer.from(raw.data,"base64")):file),build.groups[key].output.contentIntegrity,key);}
      assert.equal(hash(group.code),build.groups[key].codeIntegrity,key);
      assert.equal(hash(artifact.styles[group.style]),build.groups[key].cssIntegrity,key);
      assert.ok(group.code.includes("PREVIEW_COMPONENT"),key);
      assert.deepEqual(runtimeImports(group.code),[],`Closed browser module: ${key}`);
    }
    for(const [id,entry] of Object.entries(artifact.entries)){
      assert.equal(entry.source.revision,build.revision,id);
      const checks=browser.results.filter(result=>result.id===id);
      assert.deepEqual(checks.map(check=>check.theme).sort(),["dark","light"],id);
      assert.ok(checks.every(check=>check.passed),`${id}: ${checks.filter(check=>!check.passed).map(check=>check.failure).join("; ")}`);
      const integrity=previewIntegrity(artifact,id);
      assert.ok(checks.every(check=>matchesPreviewIntegrity(check,integrity)),`${id}: browser evidence is for different code or styles`);
    }
  });
}

test("motion library data has no interrupted writes and stays under the per-file cap",async()=>{
  const roots=Object.keys(sizes).flatMap(slug=>[`data/solid-libraries/${slug}`,`data/component-previews/solid/${slug}`]);
  const paths=Object.keys(sizes).map(slug=>`data/component-previews/solid/${slug}.json`);
  for(const dir of roots)for(const path of await readdir(dir,{recursive:true})){const full=`${dir}/${path}`;if((await stat(full)).isFile())paths.push(full);}
  for(const path of paths){const bytes=await readFile(path);assert.ok(bytes.length<5_000_000,path);assert.ok(!bytes.includes(0),path);if(path.endsWith(".json"))JSON.parse(bytes.toString());}
});
