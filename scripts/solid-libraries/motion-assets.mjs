import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex");
const existing = JSON.parse(await readFile("data/component-previews/assets.json", "utf8")).assets;
for (const slug of ["nikala-ui", "magicui-solid", "mystic-ui"]) {
  const directory = `data/solid-libraries/${slug}`;
  const upstream = JSON.parse(await readFile(`${directory}/upstream.json`, "utf8"));
  const examples = JSON.parse(await readFile(`${directory}/examples.json`, "utf8")).examples;
  const urls = [...new Set(examples.flatMap(example=>example.remoteUrls??[]))].filter(url=>/images\.unsplash\.com|avatars\.githubusercontent\.com|github\.com\/[^/]+\.png|startup-template-sage|cdn\.magicui\.design|videos\.pexels\.com/.test(url));
  const gaps = [];
  for (const url of urls.filter(url=>!upstream.assets[url])) {
    if (existing[url]) {
      const asset = existing[url];
      const bytes = Buffer.from(asset.base64,"base64");
      if (hash(bytes)!==asset.sha256) throw new Error(`Shared original asset hash mismatch: ${url}`);
      upstream.assets[url] = {dataUrl:`data:${asset.mediaType};base64,${asset.base64}`,mediaType:asset.mediaType,integrity:asset.sha256,downloadUrl:asset.downloadUrl,resolvedUrl:asset.resolvedUrl,attribution:asset.attribution};
      continue;
    }
    const response = await fetch(url,{signal:AbortSignal.timeout(30_000)});
    const size = Number(response.headers.get("content-length"));
    if (!response.ok || size>1_000_000 || url.includes("videos.pexels.com")) { await response.body?.cancel(); gaps.push({url,status:response.status,bytes:size,reason:"Requires bounded media preparation before embedding"});continue; }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length>1_000_000) throw new Error(`Unexpected large media: ${url}`);
    const mediaType=response.headers.get("content-type")?.split(";")[0];
    if(!mediaType?.startsWith("image/"))throw new Error(`Unexpected original asset MIME: ${url}`);
    const attribution = url.includes("images.unsplash.com") ? {name:"Original Unsplash demo photograph",license:"Unsplash License",url:"https://unsplash.com/license"} : {name:"Original image linked by the upstream Solid demo",license:"External demo image; no separate asset license asserted",url};
    upstream.assets[url] = {dataUrl:`data:${mediaType};base64,${bytes.toString("base64")}`,mediaType,integrity:hash(bytes),downloadUrl:url,resolvedUrl:response.url,attribution};
  }
  await writeFile(`${directory}/upstream.json`,JSON.stringify(upstream,null,2)+"\n");
  await writeFile(`${directory}/asset-gaps.json`,JSON.stringify({checkedAt:new Date().toISOString(),gaps},null,2)+"\n");
  console.log(slug,`${Object.keys(upstream.assets).length} original assets`,JSON.stringify(gaps));
}
