import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { verifyPreviewAsset } from "./preview-asset-integrity.mjs";
import { findOriginalFlagTemplate, findOriginalPicsumTemplate, findOriginalPravatarTemplate, findOriginalUrlTemplate } from "./preview-asset-sources.mjs";

const root = new URL("../", import.meta.url);
const output = new URL("data/component-previews/assets.json", root);
const shadcn = JSON.parse(await readFile(new URL("data/component-previews/shadcn.json", root), "utf8"));
const extra = JSON.parse(await readFile(new URL("data/component-previews/extra.json", root), "utf8"));
const recipes = { ...shadcn.entries, ...extra.entries };
const targets = {
  "shadcn-ui/Sidebar": ["/avatars/shadcn.jpg"],
  "shadcn-ui/Avatar": ["https://github.com/shadcn.png", "https://github.com/evilrabbit.png", "https://github.com/maxleiter.png"],
  "shadcn-ui/Attachment": [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80",
  ],
  "shadcn-ui/Message": ["/avatars/10.png", "/avatars/02.png"],
  "kibo-ui/Avatar Stack": ["https://github.com/haydenbleasel.png", "https://github.com/shadcn.png", "https://github.com/leerob.png", "https://github.com/serafimcloud.png"],
  "kibo-ui/Stories": [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  ],
  "elevenlabs-ui/Orb": ["https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png"],
  "magic-ui/Avatar Circles": [
    "https://avatars.githubusercontent.com/u/16860528",
    "https://avatars.githubusercontent.com/u/20110627",
    "https://avatars.githubusercontent.com/u/106103625",
    "https://avatars.githubusercontent.com/u/59228569",
    "https://avatars.githubusercontent.com/u/59442788",
    "https://avatars.githubusercontent.com/u/89768406",
  ],
  "magic-ui/Backlight": ["https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
  "magic-ui/Blur Fade": [],
  "magic-ui/Lens": ["https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
  "magic-ui/Marquee": ["https://avatar.vercel.sh/jack", "https://avatar.vercel.sh/jill", "https://avatar.vercel.sh/john", "https://avatar.vercel.sh/jane", "https://avatar.vercel.sh/jenny", "https://avatar.vercel.sh/james"],
  "magic-ui/Pixel Image": ["/pixel-image-demo.jpg"],
  "magic-ui/Video Text": ["https://cdn.magicui.design/ocean-small.webm"],
  "cult-ui/Collab Toolbar": ["https://i.pravatar.cc/100?img=12", "https://i.pravatar.cc/100?img=32", "https://i.pravatar.cc/100?img=68"],
  "cult-ui/Illustration Comment Bubble": [],
  "cult-ui/Mac Screen": ["/component-frames/apple-computer-img.png", "https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif"],
  "cult-ui/Minimal Card": ["/basic-img.png"],
  "cult-ui/Shift Card": ["/basic-img.png"],
  "cult-ui/Terminal Animation": ["/component-images/terminal-animation/terminal-animation-bg-2.png"],
  "tween-ui/Flip Card": ["https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=640&h=480&fit=crop"],
  "tween-ui/Integration Hub": [
    "https://cdn.simpleicons.org/telegram/26A5E4",
    "https://cdn.simpleicons.org/google/4285F4",
    "https://cdn.simpleicons.org/notion/000000",
    "https://cdn.simpleicons.org/notion/ffffff",
    "https://cdn.simpleicons.org/reddit/FF4500",
    "https://cdn.simpleicons.org/stripe/635BFF",
    "https://cdn.simpleicons.org/zoom/2D8CFF",
  ],
  "reui/Kanban": [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80",
  ],
  "reui/Data Grid": [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1620075225255-8c2051b6c015?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?w=96&h=96&dpr=2&q=80",
    "https://images.unsplash.com/photo-1542595913-85d69b0edbaf?w=96&h=96&dpr=2&q=80",
  ],
};
Object.assign(targets, {
  "intent-ui/Combo Box": [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=10"
  ],
  "elevenlabs-ui/Conversation": [
    "https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png"
  ],
  "magic-ui/Hero Video Dialog": [
    "https://startup-template-sage.vercel.app/hero-light.png",
    "https://startup-template-sage.vercel.app/hero-dark.png"
  ],
  "kibo-ui/Pill": [
    "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
    "https://pbs.twimg.com/profile_images/1862717563311968256/xfgt1L9l_400x400.jpg"
  ],
  "cult-ui/Dock": [
    "https://products.ls.graphics/mesh-gradients/images/03.-Snowy-Mint_1-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/04.-Hopbush_1-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/06.-Wisteria-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/09.-Light-Sky-Blue-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/12.-Tumbleweed-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/15.-Perfume_1-p-130x130q80.jpeg",
    "https://products.ls.graphics/mesh-gradients/images/36.-Pale-Chestnut-p-130x130q80.jpeg"
  ],
  "cult-ui/Expandable": [
    "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6505/6505727_rd.jpg;maxHeight=640;maxWidth=550;format=webp"
  ],
  "cult-ui/Fluted Glass": [
    "https://paper.design/flowers.webp",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80&fm=webp",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80&fm=webp",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&q=80&fm=webp",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&q=80&fm=webp"
  ],
  "cult-ui/Hero Heatmap": [
    "/cult-icon.svg",
    "https://shaders.paper.design/images/logos/diamond.svg"
  ],
  "cult-ui/Hero Liquid Metal": [
    "/cult-icon.svg",
    "https://shaders.paper.design/images/logos/diamond.svg"
  ],
  "cult-ui/Bg Image Texture": [
    "/textures/fabric-of-squares.png",
    "/textures/grid-noise.png",
    "/textures/inflicted.png",
    "/textures/debut-light.png",
    "/textures/groovepaper.png"
  ],
  "cult-ui/Youtube Video Player": [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop&crop=center"
  ],
  "elevenlabs-ui/Audio Player": [
    "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/02.mp3",
    "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/03.mp3",
    "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/06.mp3"
  ],
  "kibo-ui/Reel": [
    "https://wajxiz6qhqyqkm0o.public.blob.vercel-storage.com/grok-imagine-1.mp4",
    "https://wajxiz6qhqyqkm0o.public.blob.vercel-storage.com/grok-imagine-2.mp4",
    "https://wajxiz6qhqyqkm0o.public.blob.vercel-storage.com/grok-imagine-3.mp4"
  ],
  "magic-ui/Icon Cloud": [],
  "magic-ui/Dotted Map": [],
  "kibo-ui/Marquee": [],
  "cult-ui/Three D Carousel": []
});
const additionalTemplates = {
  "magic-ui/Icon Cloud": {
    "parts": [
      "https://cdn.simpleicons.org/",
      "/",
      ""
    ],
    "samples": [
      "typescript",
      "javascript",
      "dart",
      "java",
      "react",
      "flutter",
      "android",
      "html5",
      "css3",
      "nodedotjs",
      "express",
      "nextdotjs",
      "prisma",
      "amazonaws",
      "postgresql",
      "firebase",
      "nginx",
      "vercel",
      "testinglibrary",
      "jest",
      "cypress",
      "docker",
      "git",
      "jira",
      "github",
      "gitlab",
      "visualstudiocode",
      "androidstudio",
      "sonarqube",
      "figma"
    ],
    "assets": [
      "https://cdn.simpleicons.org/typescript/typescript",
      "https://cdn.simpleicons.org/javascript/javascript",
      "https://cdn.simpleicons.org/dart/dart",
      "https://cdn.simpleicons.org/react/react",
      "https://cdn.simpleicons.org/flutter/flutter",
      "https://cdn.simpleicons.org/android/android",
      "https://cdn.simpleicons.org/html5/html5",
      "https://cdn.simpleicons.org/nodedotjs/nodedotjs",
      "https://cdn.simpleicons.org/express/express",
      "https://cdn.simpleicons.org/nextdotjs/nextdotjs",
      "https://cdn.simpleicons.org/prisma/prisma",
      "https://cdn.simpleicons.org/postgresql/postgresql",
      "https://cdn.simpleicons.org/firebase/firebase",
      "https://cdn.simpleicons.org/nginx/nginx",
      "https://cdn.simpleicons.org/vercel/vercel",
      "https://cdn.simpleicons.org/testinglibrary/testinglibrary",
      "https://cdn.simpleicons.org/jest/jest",
      "https://cdn.simpleicons.org/cypress/cypress",
      "https://cdn.simpleicons.org/docker/docker",
      "https://cdn.simpleicons.org/git/git",
      "https://cdn.simpleicons.org/jira/jira",
      "https://cdn.simpleicons.org/github/github",
      "https://cdn.simpleicons.org/gitlab/gitlab",
      "https://cdn.simpleicons.org/androidstudio/androidstudio",
      "https://cdn.simpleicons.org/figma/figma"
    ]
  },
  "magic-ui/Dotted Map": {
    "parts": [
      "https://flagcdn.com/w80/",
      ".webp"
    ],
    "samples": [
      "kr",
      "us"
    ],
    "assets": [
      "https://flagcdn.com/w80/kr.webp",
      "https://flagcdn.com/w80/us.webp"
    ]
  },
  "kibo-ui/Marquee": {
    "parts": [
      "https://placehold.co/128x128?random=",
      ""
    ],
    "samples": [],
    "guard": "new Array(10)",
    "assets": [
      "https://placehold.co/128x128?random=0",
      "https://placehold.co/128x128?random=1",
      "https://placehold.co/128x128?random=2",
      "https://placehold.co/128x128?random=3",
      "https://placehold.co/128x128?random=4",
      "https://placehold.co/128x128?random=5",
      "https://placehold.co/128x128?random=6",
      "https://placehold.co/128x128?random=7",
      "https://placehold.co/128x128?random=8",
      "https://placehold.co/128x128?random=9"
    ]
  },
  "cult-ui/Three D Carousel": {
    "parts": [
      "https://picsum.photos/200/300?",
      ""
    ],
    "samples": [
      "night",
      "city",
      "sky",
      "sunset",
      "sunrise",
      "winter",
      "skyscraper",
      "building",
      "cityscape",
      "architecture",
      "street",
      "lights",
      "downtown",
      "bridge"
    ],
    "assets": [
      "https://picsum.photos/200/300?night",
      "https://picsum.photos/200/300?city",
      "https://picsum.photos/200/300?sky",
      "https://picsum.photos/200/300?sunset",
      "https://picsum.photos/200/300?sunrise",
      "https://picsum.photos/200/300?winter",
      "https://picsum.photos/200/300?skyscraper",
      "https://picsum.photos/200/300?building",
      "https://picsum.photos/200/300?cityscape",
      "https://picsum.photos/200/300?architecture",
      "https://picsum.photos/200/300?street",
      "https://picsum.photos/200/300?lights",
      "https://picsum.photos/200/300?downtown",
      "https://picsum.photos/200/300?bridge"
    ]
  },
  "cult-ui/Youtube Video Player": {
    "parts": [
      "https://i.ytimg.com/vi/",
      "/hqdefault.jpg"
    ],
    "samples": [
      "kJQP7kiw5Fk",
      "9bZkp7q19f0",
      "fJ9rUzIMcZQ",
      "L_jWHffIx5E",
      "hTWKbfoikeg",
      "djV11Xbc914",
      "ZbZSe6N_BXs",
      "2yJgwwDcgV8",
      "oHg5SJYRHA0",
      "y6120QOlsfU",
      "dQw4w9WgXcQ"
    ],
    "assets": [
      "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
      "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
      "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
      "https://i.ytimg.com/vi/L_jWHffIx5E/hqdefault.jpg",
      "https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg",
      "https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg",
      "https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg",
      "https://i.ytimg.com/vi/2yJgwwDcgV8/hqdefault.jpg",
      "https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg",
      "https://i.ytimg.com/vi/y6120QOlsfU/hqdefault.jpg",
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    ]
  }
};

const flagCountries = ["us", "gb", "ca", "au", "de", "my", "es", "jp", "fr", "it"];
const flagTemplate = findOriginalFlagTemplate(recipes["reui/Data Grid"].code).source;
const flagUrls = flagCountries.map(country => `https://flagcdn.com/${country}.svg`);
const photoTemplate = findOriginalPicsumTemplate(recipes["magic-ui/Blur Fade"].code).source;
const photoUrls = Array.from({ length: 9 }, (_, index) => `https://picsum.photos/seed/${index + 1}/${index % 2 === 0 ? "800/600" : "600/800"}`);
const avatarTemplate = findOriginalPravatarTemplate(recipes["cult-ui/Illustration Comment Bubble"].code).source;
const avatarUrls = ["https://i.pravatar.cc/48?img=13"];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const refresh = process.argv.includes("--refresh-assets");
const captureMissing = process.argv.includes("--capture-missing-assets");
const previous = await readFile(output, "utf8").then(JSON.parse).catch(error => {
  if (error.code !== "ENOENT") throw error;
  return { assets: {} };
});
const result = { version: 1, components: {}, assets: {}, licenses: { "shadcn-ui/ui": shadcn.licenses["shadcn-ui/ui"], "magicuidesign/magicui": extra.licenses["magicuidesign/magicui"], "nolly-studio/cult-ui": extra.licenses["nolly-studio/cult-ui"] } };

for (const [id, urls] of Object.entries(targets)) {
  const recipe = recipes[id];
  let templates = id === "reui/Data Grid" ? [{ source: flagTemplate, assets: flagUrls }]
    : id === "magic-ui/Blur Fade" ? [{ source: photoTemplate, assets: photoUrls }]
    : id === "cult-ui/Illustration Comment Bubble" ? [{ source: avatarTemplate, assets: avatarUrls }] : [];
  if (additionalTemplates[id]) {
    const config = additionalTemplates[id];
    if (config.samples.some(sample => !recipe.code.includes(JSON.stringify(sample))) || config.guard && !recipe.code.includes(config.guard)) throw new Error(`Original asset sample changed: ${id}`);
    templates = [{ source: findOriginalUrlTemplate(recipe.code, config.parts).source, assets: config.assets }];
  }
  if (id === "reui/Data Grid" && (!recipe.code.includes(flagTemplate) || !recipe.code.includes(`flag:${JSON.stringify(flagCountries)}`))) throw new Error("Original Data Grid flag template or sample countries changed");
  result.components[id] = { source: recipe.source.url, revision: recipe.source.revision, assets: [...urls, ...templates.flatMap(template => template.assets)], ...(templates.length ? { templates } : {}) };
  for (const url of result.components[id].assets) {
    if (!templates.some(template => template.assets.includes(url)) && !recipe.code.includes(JSON.stringify(url))) throw new Error(`Original asset reference missing from ${id}: ${url}`);
    if (result.assets[url]) continue;
    const old = previous.assets[url];
    const repositoryAsset = url.startsWith("/");
    const repository = id.startsWith("magic-ui/") ? "magicuidesign/magicui" : id.startsWith("cult-ui/") ? "nolly-studio/cult-ui" : "shadcn-ui/ui";
    const publicPath = repository === "shadcn-ui/ui" ? "apps/v4/public" : "apps/www/public";
    const downloadUrl = repositoryAsset
      ? `https://raw.githubusercontent.com/${repository}/${recipe.source.revision}/${publicPath}${url}`
      : url;
    if (old && !refresh) {
      if (old.url !== url || old.downloadUrl !== downloadUrl) throw new Error(`Asset source changed; explicitly capture with --refresh-assets: ${url}`);
      result.assets[url] = verifyPreviewAsset(old);
      continue;
    }
    if (!refresh && !captureMissing) throw new Error(`Unrecorded image; explicitly capture with --capture-missing-assets: ${url}`);
    const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(30_000), headers: { Accept: "image/png,image/jpeg,image/svg+xml,image/gif,image/webp,video/webm,video/mp4,audio/mpeg" } });
    if (!response.ok) throw new Error(`Asset HTTP ${response.status}: ${downloadUrl}`);
    const chunks = [];
    let received = 0;
    for await (const chunk of response.body ?? []) {
      received += chunk.byteLength;
      // Enforce the limit on decoded bytes while reading, so a small compressed
      // response cannot inflate past it before the check runs.
      if (received > 2_000_000) throw new Error(`Asset exceeds 2 MB: ${downloadUrl}`);
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    const sha256 = hash(bytes);
    if (old && repositoryAsset && old.downloadUrl === downloadUrl && old.sha256 !== sha256) throw new Error(`Immutable repository asset changed: ${downloadUrl}`);
    result.assets[url] = verifyPreviewAsset({
      url, downloadUrl, resolvedUrl: response.url, sha256,
      mediaType: response.headers.get("content-type")?.split(";")[0], bytes: bytes.length,
      base64: bytes.toString("base64"),
      attribution: repositoryAsset
        ? repository === "shadcn-ui/ui"
          ? { name: "shadcn/ui repository asset", license: "MIT", url: result.licenses[repository].url }
          : { name: `Original ${repository === "magicuidesign/magicui" ? "Magic UI" : "Cult UI"} repository image`, license: "Upstream MIT repository; no separate image license asserted", url: result.licenses[repository].url }
        : url.startsWith("https://images.unsplash.com/")
          ? { name: "Original Unsplash demo photograph", license: "Unsplash License", url: "https://unsplash.com/license" }
          : url.startsWith("https://plus.unsplash.com/")
            ? { name: "Original Unsplash+ image linked by the upstream demo", license: "Upstream-linked image; no separate asset license asserted", url: recipe.source.url }
          : url.startsWith("https://picsum.photos/")
            ? { name: "Original Lorem Picsum demo photograph", license: "Unsplash License (Lorem Picsum image source)", url: "https://picsum.photos/" }
          : url.startsWith("https://avatar.vercel.sh/")
            ? { name: "Original Vercel avatar linked by the upstream demo", license: "Upstream-linked image; no separate asset license asserted", url: recipe.source.url }
          : url.startsWith("https://cdn.magicui.design/")
            ? { name: "Original Magic UI demo media", license: "Upstream-linked media; no separate asset license asserted", url: recipe.source.url }
          : url.startsWith("https://i.pravatar.cc/")
            ? { name: "Original Pravatar demo photograph", license: "Upstream-linked image; no separate asset license asserted", url: recipe.source.url }
          : url.startsWith("https://media.giphy.com/")
            ? { name: "Original Giphy animation linked by the upstream demo", license: "Upstream-linked animation; no separate asset license asserted", url: recipe.source.url }
          : url.startsWith("https://flagcdn.com/")
            ? { name: "Original Flagpedia flag artwork (Wikimedia Commons source)", license: "Flagpedia free image CDN; see source terms", url: "https://flagpedia.net/download/api" }
            : url.startsWith("https://storage.googleapis.com/eleven-public-cdn/")
              ? { name: "Original ElevenLabs demo media", license: "Upstream-linked media; no separate asset license asserted", url: recipe.source.url }
              : url.startsWith("https://github.com/") || url.startsWith("https://avatars.githubusercontent.com/")
                ? { name: "Original GitHub profile image linked by the upstream demo", license: "External profile image; no separate license asserted", url }
                : { name: "Original upstream demo media", license: "Upstream-linked asset; no separate asset license asserted", url: recipe.source.url },
    });
  }
}
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(`${Object.keys(result.assets).length} original media assets verified for ${Object.keys(result.components).length} previews: ${fileURLToPath(output)}`);
