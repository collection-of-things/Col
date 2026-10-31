import { readFile, writeFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import { createHash } from "node:crypto";

const path="data/solid-libraries/magicui-solid/upstream.json";
const upstream=JSON.parse(await readFile(path,"utf8"));
const existing=JSON.parse(await readFile("data/component-previews/assets.json","utf8")).assets;
const module="src/demos/IconCloudDemo.tsx";
const ast=parse(upstream.files[module].content,{sourceType:"module",plugins:["typescript","jsx"]});
const slugs=ast.program.body.find(node=>node.type==="VariableDeclaration"&&node.declarations[0].id.name==="slugs").declarations[0].init.elements.map(node=>node.value);
const source='`https://cdn.simpleicons.org/${slug}/${slug}`';
const urls=slugs.map(slug=>`https://cdn.simpleicons.org/${slug}/${slug}`);
let license=upstream.files["licenses/simple-icons-CC0.md"];
if(!license){
  const response=await fetch("https://api.github.com/repos/simple-icons/simple-icons/commits/develop",{headers:{"User-Agent":"Col-source-verification"}});
  if(!response.ok)throw new Error(`Cannot pin Simple Icons notice: ${response.status}`);
  const revision=(await response.json()).sha;
  const url=`https://raw.githubusercontent.com/simple-icons/simple-icons/${revision}/LICENSE.md`;
  const fetched=await fetch(url);
  if(!fetched.ok)throw new Error(`Cannot read Simple Icons notice: ${fetched.status}`);
  const content=await fetched.text();
  if(!content.includes("CC0 1.0 Universal"))throw new Error("Unexpected Simple Icons license");
  license={url,content,integrity:createHash("sha256").update(content).digest("hex")};
  upstream.files["licenses/simple-icons-CC0.md"]=license;
}
for(const url of urls.filter(url=>!upstream.assets[url])) {
  const known=existing[url];
  const response=known?undefined:await fetch(url,{signal:AbortSignal.timeout(30_000)});
  if(response&&!response.ok)throw new Error(`${response.status} ${url}`);
  const bytes=known?Buffer.from(known.base64,"base64"):Buffer.from(await response.arrayBuffer());
  const integrity=createHash("sha256").update(bytes).digest("hex");
  if(known&&integrity!==known.sha256)throw new Error(`Original icon mismatch: ${url}`);
  upstream.assets[url]={dataUrl:`data:image/svg+xml;base64,${bytes.toString("base64")}`,mediaType:"image/svg+xml",integrity,downloadUrl:known?.downloadUrl??url,resolvedUrl:known?.resolvedUrl??response.url,attribution:known?.attribution??{name:"Original Simple Icons artwork used by MagicUI Solid's Icon Cloud",license:"Upstream-linked artwork; no separate asset license asserted",url:upstream.files[module].url}};
}
for(const url of urls)upstream.assets[url].attribution={name:"Simple Icons artwork linked by the original Icon Cloud demo",license:"CC0-1.0; trademark rights are not granted",url:license.url};
upstream.assetTemplates=[...(upstream.assetTemplates??[]).filter(template=>template.module!==module),{module,source,urls}];
await writeFile(path,JSON.stringify(upstream,null,2)+"\n");
console.log(`${urls.length} actual upstream Icon Cloud SVG assets captured; ${Buffer.byteLength(JSON.stringify(upstream))} snapshot bytes`);
