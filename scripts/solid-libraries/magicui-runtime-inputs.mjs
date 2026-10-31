import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const file="data/solid-libraries/magicui-solid/upstream.json";
const upstream=JSON.parse(await readFile(file,"utf8"));
const sourceUrl=`https://raw.githubusercontent.com/axuj/magicui-solid/${upstream.revision}/public/pixel-image-demo.jpg`;
const sourceFile=".scratch/solid-library-69/solid-motion/media/pixel-image-demo.jpg";
await mkdir(".scratch/solid-library-69/solid-motion/media",{recursive:true});
let original=await readFile(sourceFile).catch(()=>undefined);
if(!original){const response=await fetch(sourceUrl);if(!response.ok)throw new Error(String(response.status));original=Buffer.from(await response.arrayBuffer());await writeFile(sourceFile,original);}
if(createHash("sha1").update(`blob ${original.length}\0`).update(original).digest("hex")!=="5c177e3ea87fe9a1be8dad8c2b4288b4ce9dddab")throw new Error("Pixel Image source Git blob mismatch");
const convertedFile=".scratch/solid-library-69/solid-motion/media/pixel-image-demo.webp";
const converted=spawnSync("ffmpeg",["-y","-hide_banner","-loglevel","error","-i",sourceFile,"-vf","scale=800:800","-c:v","libwebp","-quality","80",convertedFile],{stdio:"inherit",windowsHide:true});
if(converted.status!==0)throw new Error("Pixel Image conversion failed");
const bytes=await readFile(convertedFile);
const url="https://axuj.github.io/magicui-solid/pixel-image-demo.jpg";
upstream.assets[url]={dataUrl:`data:image/webp;base64,${bytes.toString("base64")}`,mediaType:"image/webp",integrity:hash(bytes),downloadUrl:sourceUrl,resolvedUrl:sourceUrl,attribution:{name:"MagicUI Solid Pixel Image demo photograph",license:"MIT (upstream README declaration; linked LICENSE file absent)",url:upstream.files["README.md"].url},original:{sha256:hash(original),bytes:original.length},transformation:"Lossy WebP derivative of the exact repository image: 1920×1920 JPEG resized to 800×800 with quality 80. The original photograph, framing and component animation are retained."};
const templates=[{module:"src/demos/PixelImageDemo.tsx",source:'`${import.meta.env.BASE_URL}pixel-image-demo.jpg`',urls:[url],directUrl:url}];
const flags=["kr","us"].map(country=>`https://flagcdn.com/w80/${country}.webp`);
for(const url of flags){
  if(upstream.assets[url])continue;
  const response=await fetch(url);if(!response.ok)throw new Error(`Original flag fetch failed: ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  upstream.assets[url]={dataUrl:`data:image/webp;base64,${bytes.toString("base64")}`,mediaType:"image/webp",integrity:hash(bytes),downloadUrl:url,resolvedUrl:response.url,attribution:{name:"Flagpedia country flag artwork",license:"Public domain (Flagpedia Terms of Use)",url:"https://flagpedia.net/terms"}};
}
templates.push({module:"src/demos/DottedMapDemo.tsx",source:'`https://flagcdn.com/w80/${countryCode}.webp`',urls:flags});
upstream.assetTemplates=[...(upstream.assetTemplates??[]).filter(template=>!templates.some(item=>item.module===template.module)),...templates];
await writeFile(file+".tmp",JSON.stringify(upstream,null,2)+"\n");await rename(file+".tmp",file);
const unavailableFile="data/solid-libraries/magicui-solid/unavailable.json";
const unavailable=JSON.parse(await readFile(unavailableFile,"utf8"));
delete unavailable["magicui-solid/Tweet Card"];
await writeFile(unavailableFile,JSON.stringify(unavailable,null,2)+"\n");
const limitationsFile="data/solid-libraries/magicui-solid/runtime-limitations.json";
const limitations=JSON.parse(await readFile(limitationsFile,"utf8"));
limitations["magicui-solid/Hero Video Dialog"]=["The original dialog opens and closes, but its YouTube embed requires external network access and is blocked in the sandbox: https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"];
await writeFile(limitationsFile,JSON.stringify(limitations,null,2)+"\n");
console.log(JSON.stringify({pixelImage:{originalBytes:original.length,deliveredBytes:bytes.length,originalSha256:hash(original),deliveredSha256:hash(bytes)},flags:flags.length}));
// Store the verified Lens/Pixel payloads once, preserving the final delivery layout.
await import("./magicui-image-assets.mjs");
