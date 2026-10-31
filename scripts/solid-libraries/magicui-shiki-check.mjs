import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";
import assert from "node:assert/strict";

const dir=resolve(".scratch/solid-library-69/solid-motion/build/magicui-solid");
const require=createRequire(resolve(dir,"package.json"));
const load=name=>import(pathToFileURL(require.resolve(name)).href);
const original=await load("shiki");
const fine=await import(pathToFileURL(resolve(dir,"source/shiki-demo.mjs")).href);
const transformer=await load("@shikijs/transformers");
const upstream=JSON.parse(await readFile("data/solid-libraries/magicui-solid/upstream.json","utf8"));
const source=upstream.files["src/demos/CodeComparisonDemo.tsx"];
const ast=parse(source.content,{sourceType:"module",plugins:["typescript","jsx"]});
const codes=ast.program.body.filter(node=>node.type==="VariableDeclaration").flatMap(node=>node.declarations).filter(node=>["beforeCode","afterCode"].includes(node.id.name)).map(node=>({name:node.id.name,code:node.init.quasis.map(part=>part.value.cooked).join("")}));
const results=[];
for(const themeName of ["github-dark","github-light"]){
  const theme=(await load(`@shikijs/themes/${themeName}`)).default;
  for(const {name,code} of codes){
    const options=()=>({lang:"typescript",theme,transformers:[transformer.transformerNotationHighlight({matchAlgorithm:"v3"}),transformer.transformerNotationDiff({matchAlgorithm:"v3"}),transformer.transformerNotationFocus({matchAlgorithm:"v3"})]});
    const expected=await original.codeToHtml(code,options());
    const actual=await fine.codeToHtml(code,options());
    assert.equal(actual,expected,`${themeName}/${name} must preserve exact highlighted HTML`);
    results.push({theme:themeName,example:name,byteIdentical:true,bytes:Buffer.byteLength(actual),sha256:createHash("sha256").update(actual).digest("hex")});
  }
}
await writeFile("data/solid-libraries/magicui-solid/shiki-verification.json",JSON.stringify({checkedAt:new Date().toISOString(),source:{url:source.url,integrity:source.integrity},method:"Byte-for-byte HTML comparison of the default Shiki bundle and official fine-grained Shiki API, using the actual CodeComparison demo, original TypeScript grammar, GitHub themes and notation transformers.",results},null,2)+"\n");
console.log(JSON.stringify(results));
