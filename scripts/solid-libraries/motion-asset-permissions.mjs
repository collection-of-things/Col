import { readFile, writeFile, rename } from "node:fs/promises";

let ocean;
for(const slug of ["nikala-ui","magicui-solid"]){
  const dir=`data/solid-libraries/${slug}`;
  const upstream=JSON.parse(await readFile(`${dir}/upstream.json`,"utf8"));
  if(slug==="magicui-solid")ocean=upstream.assets["https://cdn.magicui.design/ocean-small.webm"];
  for(const asset of Object.values(upstream.assets))if(/no separate (?:asset )?license asserted|no separate asset license asserted/.test(asset.attribution.license)){
    asset.blocked="Redistribution permission for this original externally hosted demo media was not verified; its bytes are not bundled.";
    delete asset.dataUrl;
  }
  const text=JSON.stringify(upstream,null,2)+"\n";
  await writeFile(`${dir}/upstream.json.tmp`,text);await rename(`${dir}/upstream.json.tmp`,`${dir}/upstream.json`);
  const gaps=Object.entries(upstream.assets).filter(([,asset])=>asset.blocked).map(([url,asset])=>({url,reason:asset.blocked,source:asset.attribution.url}));
  await writeFile(`${dir}/asset-gaps.json`,JSON.stringify({checkedAt:new Date().toISOString(),gaps},null,2)+"\n");
}
const unavailableFile="data/solid-libraries/magicui-solid/unavailable.json";
const unavailable=JSON.parse(await readFile(unavailableFile,"utf8").catch(()=>"{}"));
if(!ocean)throw new Error("Missing original Video Text asset");
if(ocean.blocked)unavailable["magicui-solid/Video Text"]=`The genuine Video Text example requires its original ocean WebM. ${ocean.blocked} Official example: https://axuj.github.io/magicui-solid/docs/components/video-text/`;
else {
  const permission=JSON.parse(await readFile("data/solid-libraries/magicui-solid/ocean-permission.json","utf8"));
  if(ocean.manifestFile!=="data/component-previews/assets.json"||ocean.integrity!==permission.sha256||permission.permission.source!=="https://blog.codepen.io/legal/terms-of-service/")throw new Error("Unverified Video Text asset or permission");
  delete unavailable["magicui-solid/Video Text"];
}
await writeFile(unavailableFile,JSON.stringify(unavailable,null,2)+"\n");
