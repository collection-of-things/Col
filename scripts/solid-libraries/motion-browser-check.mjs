import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { componentPreviewMedia, readPreviewMediaChunk, transformPreviewAssets } from "../../lib/component-preview-assets.ts";
import { resolvePreviewMedia, previewMediaHtml } from "../../lib/preview-widget.ts";
import { matchesPreviewIntegrity, previewIntegrity } from "./motion-preview-integrity.mjs";

const require=createRequire(import.meta.url);
const modulePath=process.env.PLAYWRIGHT_MODULE??"playwright";
const {chromium}=require(modulePath);
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??process.env.CHROME_EXECUTABLE_PATH;
const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true});
const results=[];
async function interact(frame,id) {
  const actions=[];
  const first=selector=>frame.locator(selector).filter({visible:true}).first();
  if(id==="nikala-ui/Combobox"){
    const input=first('input[role="combobox"]');await input.fill("France");
    const option=frame.getByRole("option").filter({hasText:"France"}).first();await option.click();
    const value=await input.inputValue();if(value!=="France")throw new Error("Combobox did not select the original France option");
    return [{action:"filter-and-select",value}];
  }
  if(id.endsWith("/Context Menu")){await first("#app > *").click({button:"right"});actions.push({action:"context-menu",menus:await frame.locator('[role="menu"]').count()});await frame.locator("body").press("Escape");}
  if(/\/(?:Tooltip|Hover Card)$/.test(id)){const trigger=first("button,a");if(await trigger.count()){await trigger.hover();await frame.waitForTimeout(650);actions.push({action:"hover",floating:await frame.locator('[role="tooltip"],[data-expanded]').count()});}}
  const tab=first('[role="tab"][aria-selected="false"]');
  if(await tab.count()){await tab.click();actions.push({action:"select-tab",selected:await tab.getAttribute("aria-selected")});}
  const toggle=first('[role="checkbox"], [role="switch"], input[type="checkbox"]');
  if(await toggle.count()&&await toggle.isEnabled()){
    const before=await toggle.evaluate(node=>node.getAttribute("aria-checked")??String(node.checked));await toggle.click();
    const after=await toggle.evaluate(node=>node.getAttribute("aria-checked")??String(node.checked));actions.push({action:"toggle",before,after});
  }
  const input=first('input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]):not([type="hidden"]):not([readonly]),textarea:not([readonly])');
  if(await input.count()&&await input.isEditable()){const type=await input.getAttribute("type");if(!["number","date","time","color"].includes(type)){await input.fill(type==="email"?"preview@example.test":"Preview check");actions.push({action:"edit-input",value:await input.inputValue()});}}
  const slider=first('[role="slider"]');
  if(await slider.count()){await slider.focus();const before=await slider.getAttribute("aria-valuenow");await slider.press("ArrowRight");actions.push({action:"slider-keyboard",before,after:await slider.getAttribute("aria-valuenow")});}
  const expanded=first('button[aria-expanded], [role="combobox"][aria-expanded]');
  if(await expanded.count()&&await expanded.isEnabled()){const before=await expanded.getAttribute("aria-expanded");await expanded.click();await frame.waitForTimeout(80);actions.push({action:"expand-control",before,after:await expanded.getAttribute("aria-expanded"),popups:await frame.locator('[role="dialog"],[role="menu"],[role="listbox"]').count()});await expanded.press("Escape").catch(()=>{});}
  if(!actions.length){const button=first("button:not([disabled])");if(await button.count()){const label=(await button.textContent())?.trim().slice(0,80);await button.focus();await button.press("Enter");await frame.waitForTimeout(100);actions.push({action:"button-keyboard",label,dialogs:await frame.locator('[role="dialog"],[role="alertdialog"],[role="status"]').count()});await frame.locator("body").press("Escape").catch(()=>{});}}
  const scrolling=await frame.evaluate(()=>{const node=[...document.querySelectorAll('#app *')].find(node=>node.scrollHeight>node.clientHeight+20&&/auto|scroll/.test(getComputedStyle(node).overflowY));if(!node)return;const before=node.scrollTop;node.scrollTop=80;return{before,after:node.scrollTop};});
  if(scrolling)actions.push({action:"scroll-content",...scrolling});
  await frame.locator("body").hover({position:{x:300,y:150}}).catch(()=>{});
  return actions;
}

try {
  for(const slug of process.argv.slice(2)){
    const artifact=(await import(pathToFileURL(resolve(`data/component-previews/solid/${slug}/index.ts`)).href)).default;
    const examples=JSON.parse(await readFile(`data/solid-libraries/${slug}/examples.json`,"utf8")).examples;
    const previousVerification=JSON.parse(await readFile(`data/solid-libraries/${slug}/browser-verification.json`,"utf8").catch(()=>'{"results":[]}'));
    const previous=previousVerification.results;
    const failed=new Set(previous.filter(result=>!result.passed).map(result=>result.id));
    for(const [id,entry] of Object.entries(artifact.entries)){
      if(process.env.ONLY&&!id.includes(process.env.ONLY))continue;
      if(process.env.RETRY_FAILED&&failed.size&&!failed.has(id))continue;
      for(const theme of ["light","dark"]){
        const result={id,theme,url:examples.find(example=>example.id===id)?.url,passed:false,errors:[],consoleErrors:[],blockedRequests:[]};
        const page=await browser.newPage({viewport:{width:900,height:900},colorScheme:theme});
        page.on("pageerror",error=>result.errors.push(error.message));
        page.on("console",message=>{if(message.type()==="error")result.consoleErrors.push(message.text());});
        page.on("dialog",async dialog=>{result.dialog=dialog.message();await dialog.dismiss();});
        await page.route("**/*",async route=>{result.blockedRequests.push(route.request().url());await route.abort();});
        try {
          const group=entry.group?artifact.groups[entry.group]:undefined;
          const css=entry.css??artifact.styles[group.style];
          const code=transformPreviewAssets(id,entry.code??`const PREVIEW_COMPONENT=${JSON.stringify(id)};\n${group.code}`);
          result.codeIntegrity=createHash("sha256").update(code).digest("hex");
          result.cssIntegrity=createHash("sha256").update(css).digest("hex");
          const media=await resolvePreviewMedia(componentPreviewMedia(id),uri=>readPreviewMediaChunk(...uri.slice("col://preview-media/".length).split("/")),()=>true);
          const document=`<!doctype html><html class="${theme}" style="color-scheme:${theme}"><head><style>@layer col-preview-defaults{html{font-family:system-ui,sans-serif;color:light-dark(#000,#fff);line-height:1.5}body{background:transparent;color:inherit;font:inherit}}${css}</style></head><body><div id="app" style="width:100%;min-height:400px;display:flex;align-items:center;justify-content:center"></div><script>window.__errors=[];addEventListener('error',e=>window.__errors.push(e.message));addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));(async()=>{try{const blob=URL.createObjectURL(new Blob([${JSON.stringify(code).replaceAll("<","\\u003c")}],{type:'text/javascript'}));const module=await import(blob);URL.revokeObjectURL(blob);window.dispose=module.default(document.getElementById('app'));window.__ready=true;}catch(error){window.__errors.push(String(error));window.__ready=true;}})();</script></body></html>`;
          await page.setContent(`<html style="background:${theme==="dark"?"#000":"#fff"}"><body style="margin:0"><iframe title="Original component" sandbox="allow-scripts allow-forms" style="width:900px;height:900px;border:0"></iframe></body></html>`);
          await page.locator("iframe").evaluate((iframe,html)=>{iframe.srcdoc=html;},document.replace("</head>",previewMediaHtml(media)+"</head>"));
          const frame=await page.locator("iframe").contentFrame();
          // FrameLocator does not expose evaluate; resolve the one sandbox frame.
          const child=page.frames().find(candidate=>candidate!==page.mainFrame());
          await child.waitForFunction(()=>window.__ready,{},{timeout:45000});
          await child.waitForTimeout(350);
          const count=await child.locator("#app *").count();
          if(!count){result.errors.push(...await child.evaluate(()=>window.__errors));throw new Error(`The genuine demo produced no DOM: ${result.errors.join("; ")}`);}
          result.before=await child.evaluate(()=>({text:document.getElementById("app").textContent.trim().slice(0,240),elements:document.querySelectorAll("#app *").length,font:getComputedStyle(document.body).fontFamily,animations:document.getAnimations().slice(0,15).map(animation=>({name:animation.animationName??"web-animation",duration:animation.effect?.getTiming().duration})),htmlTheme:document.documentElement.className,dataTheme:document.documentElement.dataset.theme}));
          result.media=await child.evaluate(async()=>{
            const images=[...document.querySelectorAll('img[src]')].filter(image=>getComputedStyle(image).display!=="none");
            await Promise.all(images.map(image=>Promise.race([image.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2500))])));
            const svgImages=await Promise.all([...document.querySelectorAll('image[href]')].map(async node=>{const src=node.getAttribute("href"),image=new Image();image.src=src;await image.decode().catch(()=>{});return{loaded:image.complete&&image.naturalWidth>0,alt:"SVG image",src:src.startsWith("data:")?src.slice(0,30):src};}));
            return{images:[...images.map(image=>({loaded:image.complete&&image.naturalWidth>0,alt:image.alt,src:image.src.startsWith("data:")?image.src.slice(0,30):image.src})),...svgImages],videos:[...document.querySelectorAll("video")].map(video=>({readyState:video.readyState,time:video.currentTime,paused:video.paused,source:video.currentSrc.slice(0,30)}))};
          });
          result.actions=await interact(child,id);
          await child.waitForTimeout(250);
          result.after=await child.evaluate(()=>({text:document.getElementById("app").textContent.trim().slice(0,240),animations:document.getAnimations().length,videos:[...document.querySelectorAll("video")].map(video=>({readyState:video.readyState,time:video.currentTime,paused:video.paused})),htmlTheme:document.documentElement.className,dataTheme:document.documentElement.dataset.theme}));
          if(id==="magicui-solid/Theme Toggler"&&result.before.dataTheme===result.after.dataTheme)throw new Error("Controlled Theme Toggler did not change the original theme attribute");
          result.errors.push(...await child.evaluate(()=>window.__errors));
          if(result.media.videos.length) {
            result.videoPlayback=result.after.videos.map((video,index)=>({readyState:video.readyState,advanced:video.time>result.media.videos[index].time,paused:video.paused}));
            if(result.videoPlayback.some(video=>video.readyState<2||!video.advanced||video.paused))throw new Error("The original video did not play and advance in the sandbox");
          }
          const disclosed=url=>entry.gaps?.some(gap=>gap.includes(url));
          result.expectedBlockedAssets=result.blockedRequests.filter(disclosed);
          if(result.media.images.some(image=>!image.loaded&&!disclosed(image.src)))throw new Error("An original visible image did not decode");
          if(id==="nikala-ui/Sidebar") {
            result.expectedLimitations=result.errors.filter(error=>error.includes("cookie")&&error.includes("sandbox"));
            result.errors=result.errors.filter(error=>!result.expectedLimitations.includes(error));
            result.sidebarState=await child.locator('[data-state="collapsed"]').count();
            if(!result.sidebarState)throw new Error("Sidebar did not update its state before the expected cookie exception");
          }
          if(result.errors.length)throw new Error("Original demo raised browser errors");
          if(result.consoleErrors.some(error=>!/(?:Failed to load resource|net::ERR_FAILED)/.test(error)))throw new Error("Original demo logged a browser error");
          if(result.blockedRequests.some(url=>!disclosed(url)))throw new Error("Original demo requested an external resource not captured or disclosed in its artifact");
          await child.evaluate(()=>window.dispose());
          if(await child.locator("#app *").count())throw new Error("Disposal left component DOM mounted");
          result.passed=true;
        }catch(error){result.failure=error.message;}
        results.push(result);console.log(result.passed?"PASS":"FAIL",id,theme,result.failure??"");
        await page.close();
      }
    }
    const current=results.filter(result=>result.id.startsWith(slug+"/"));
    const integrity=new Map();
    const currentIntegrity=id=>{if(!integrity.has(id))integrity.set(id,previewIntegrity(artifact,id));return integrity.get(id);};
    const merged=[...previous.filter(old=>!current.some(result=>result.id===old.id&&result.theme===old.theme)&&matchesPreviewIntegrity(old,currentIntegrity(old.id))),...current];
    const unavailableEvidence=[...(previousVerification.unavailableEvidence??[]),...previous.filter(old=>!artifact.entries[old.id])].filter(old=>!artifact.entries[old.id]);
    await writeFile(`data/solid-libraries/${slug}/browser-verification.json`,JSON.stringify({checkedAt:new Date().toISOString(),sandbox:"allow-scripts allow-forms",viewport:{width:900,height:900},results:merged,unavailableEvidence},null,2)+"\n");
  }
}finally{await browser.close();}
console.log(JSON.stringify({passed:results.filter(result=>result.passed).length,total:results.length}));
if(results.some(result=>!result.passed))process.exitCode=1;
