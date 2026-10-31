import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const sourcePath="data/solid-libraries/magicui-solid/upstream.json";
const manifestFile="data/component-previews/solid/magicui-solid/assets.json";
const upstream=JSON.parse(await readFile(sourcePath,"utf8"));
const existing=JSON.parse(await readFile(manifestFile,"utf8").catch(()=>'{"assets":{}}'));
const examples=JSON.parse(await readFile("data/solid-libraries/magicui-solid/examples.json","utf8")).examples;
const lensUrl=Object.keys(upstream.assets).find(url=>url.includes("photo-1736606355698"));
const pixelUrl="https://axuj.github.io/magicui-solid/pixel-image-demo.jpg";
const lensSource=".scratch/solid-library-69/solid-motion/media/lens-original.jpg";
await mkdir(".scratch/solid-library-69/solid-motion/media",{recursive:true});
let original=await readFile(lensSource).catch(()=>undefined);
const sourceAsset=upstream.assets[lensUrl];
if(!original){
  if(sourceAsset.dataUrl)original=Buffer.from(sourceAsset.dataUrl.split(",")[1],"base64");
  else{const response=await fetch(sourceAsset.downloadUrl);if(!response.ok)throw new Error(String(response.status));original=Buffer.from(await response.arrayBuffer());}
  await writeFile(lensSource,original);
}
if(hash(original)!==(sourceAsset.original?.sha256??sourceAsset.integrity))throw new Error("Captured Lens source bytes changed");
const output=".scratch/solid-library-69/solid-motion/media/lens-1600.webp";
const conversion=spawnSync("ffmpeg",["-y","-hide_banner","-loglevel","error","-i",lensSource,"-vf","scale=1600:-2","-c:v","libwebp","-quality","80",output],{stdio:"inherit",windowsHide:true});
if(conversion.status!==0)throw new Error("Lens WebP conversion failed");
const lens=await readFile(output);
const manifest={assets:{},components:{}};
for(const [id,url] of [["magicui-solid/Lens",lensUrl],["magicui-solid/Pixel Image",pixelUrl]]){
  const item=upstream.assets[url];
  const bytes=id.endsWith("/Lens")?lens:Buffer.from(item.dataUrl?.split(",")[1]??existing.assets[url].base64,"base64");
  const {dataUrl:_dataUrl,manifestFile:_manifestFile,integrity:_integrity,...metadata}=item;
  const asset={url,...metadata,sha256:hash(bytes),mediaType:"image/webp",bytes:bytes.length,base64:bytes.toString("base64")};
  if(id.endsWith("/Lens")){
    asset.original={sha256:hash(original),bytes:original.length};
    asset.transformation="Lossy WebP derivative of the exact Unsplash photo, resized from 2071 pixels wide to 1600 pixels wide at quality 80 to satisfy Col's media policy. The original image, framing and lens interaction are retained.";
  }
  manifest.assets[url]=asset;
  const example=examples.find(example=>example.id===id);
  manifest.components[id]={source:upstream.files[example.componentSource].url,revision:upstream.revision,assets:[url]};
  const {base64:_base64,sha256,...sourceMetadata}=asset;
  upstream.assets[url]={...sourceMetadata,integrity:sha256,manifestFile};
}
for(const [file,value] of [[sourcePath,upstream],[manifestFile,manifest]]){await writeFile(file+".tmp",JSON.stringify(value,null,2)+"\n");await rename(file+".tmp",file);}
console.log(JSON.stringify(Object.entries(manifest.assets).map(([url,asset])=>({url,original:asset.original,delivered:{bytes:asset.bytes,sha256:asset.sha256}}))));
