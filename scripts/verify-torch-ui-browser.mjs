// Opt-in check: set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE to local installations.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { brotliDecompressSync } from 'node:zlib';
const require=createRequire(import.meta.url);
if(!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw new Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE');
const {chromium,expect}=require(process.env.PLAYWRIGHT_MODULE+'/test');
const baseline=JSON.parse(await readFile('data/component-previews/solid/torch-ui.json','utf8'));
const packed=JSON.parse(await readFile('data/component-previews/solid/torch-ui-expanded-packed.json','utf8'));
if(packed.encoding!=='br')throw new Error('Unexpected TorchUI expansion encoding');
const expanded=JSON.parse(brotliDecompressSync(Buffer.from(packed.data,'base64')));
const artifact={...expanded,entries:{...baseline.entries,...expanded.entries}};
const originalAssets=JSON.parse(await readFile('data/component-previews/solid/torch-ui/assets.json','utf8'));
const movie=JSON.parse(await readFile('data/component-previews/solid/torch-ui/media.json','utf8'));
const videoAsset=Object.values(movie.assets)[0];
const videoBytes=await readFile(`data/component-previews/media/${videoAsset.file}`);
const checks={
  'Dark Mode Toggle':async f=>{const html=f.locator('html'),before=await html.evaluate(e=>e.classList.contains('dark'));await f.getByRole('button').first().click();await expect.poll(()=>html.evaluate(e=>e.classList.contains('dark'))).toBe(!before)},
  Checkbox:async f=>{await f.getByText('Unchecked',{exact:true}).click();await expect(f.locator('input[type=checkbox]').nth(1)).toBeChecked()},
  Tabs:async f=>{const x=f.getByRole('tab',{name:'Party'});await x.click();await expect(x).toHaveAttribute('aria-selected','true')},
  'Dropdown Menu':async f=>{await f.getByRole('button',{name:'Actions'}).first().click();await expect(f.getByRole('menuitem',{name:'Inspect'})).toBeVisible()},
  Toast:async f=>{await f.getByRole('button',{name:'Success'}).click();await expect(f.getByText('Quest completed')).toBeVisible()},
  'Filter Builder':async f=>{await f.getByRole('button',{name:'Add condition'}).click();await expect(f.getByText('Operator',{exact:true})).toBeVisible()},
  'View Customizer':async f=>{const x=f.getByLabel('View name');await x.fill('Saved members');await expect(x).toHaveValue('Saved members')},
  'Comment Thread':async f=>{await f.getByPlaceholder('Add a comment…').fill('Great work');await f.getByRole('button',{name:'Post comment'}).click();await expect(f.getByText('Great work')).toBeVisible()},
  'Register Form':async f=>{await f.getByPlaceholder('Choose a strong password').fill('StrongPass1!');await expect(f.getByText('Very Strong')).toBeVisible()},
  Skeleton:async f=>{await f.getByRole('button',{name:'Load it'}).click();await expect(f.getByText('Content...')).toBeVisible();await expect(f.getByText('GS',{exact:true})).toBeVisible();await expect(f.locator('img')).toHaveCount(0)},
  'User Card':async f=>{await expect(f.getByText('LS',{exact:true})).toBeVisible();await f.getByRole('button',{name:'Follow',exact:true}).click();await expect(f.getByRole('button',{name:'Following'})).toBeVisible();await expect(f.locator('img')).toHaveCount(0)},
  Image:async f=>{const img=f.getByAltText('Sample landscape');await expect(img).toBeVisible();await expect.poll(()=>img.evaluate(e=>e.naturalWidth)).toBe(600)},
  Video:async f=>{const video=f.locator('video');await expect(video).toBeVisible();await expect.poll(()=>video.evaluate(e=>e.readyState),{timeout:15000}).toBeGreaterThan(1);await video.evaluate(async e=>{e.muted=true;await e.play()});await expect.poll(()=>video.evaluate(e=>e.currentTime)).toBeGreaterThan(0);await video.evaluate(e=>e.pause())},
};
const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),name=url.searchParams.get('name'),id=`torch-ui/${name}`,entry=artifact.entries[id];
  if(url.pathname==='/video.mp4'){
    const start=Number(req.headers.range?.match(/bytes=(\d+)-/)?.[1]??0);
    res.writeHead(req.headers.range?206:200,{'Content-Type':'video/mp4','Access-Control-Allow-Origin':'*','Accept-Ranges':'bytes','Content-Length':videoBytes.length-start,...(req.headers.range?{'Content-Range':`bytes ${start}-${videoBytes.length-1}/${videoBytes.length}`}:{})});res.end(videoBytes.subarray(start));return;
  }
  if(!entry){res.writeHead(404).end();return}
  const group=entry.group&&artifact.groups[entry.group],css=group?artifact.styles[group.style]:entry.css;
  let code=group?.code??entry.code;
  for(const assetUrl of originalAssets.components[id]?.assets??[]){const item=originalAssets.assets[assetUrl];code=code.replaceAll(assetUrl,`data:${item.mediaType};base64,${item.base64}`)}
  if(id==='torch-ui/Video')code=code.replaceAll(videoAsset.url,`http://127.0.0.1:${server.address().port}/video.mp4`);
  if(url.pathname==='/module.js'){res.writeHead(200,{'Content-Type':'text/javascript','Access-Control-Allow-Origin':'*'});res.end(`const PREVIEW_COMPONENT = ${JSON.stringify(id)};\n${code}`);return}
  const inner=`<!doctype html><html class="${url.searchParams.get('theme')==='dark'?'dark':''}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script type="module">import mount from ${JSON.stringify(`http://127.0.0.1:${server.address().port}/module.js?name=${encodeURIComponent(name)}`)};try{window.dispose=mount(document.getElementById('root'));document.body.dataset.mounted='yes'}catch(e){document.body.dataset.error=e.message;throw e}</script></body></html>`;
  res.writeHead(200,{'Content-Type':'text/html'});res.end(`<iframe title="preview" sandbox="allow-scripts allow-forms" style="border:0;width:100%;height:900px" srcdoc="${inner.replaceAll('&','&amp;').replaceAll('"','&quot;')}"></iframe>`)
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true});
const results=[],names=process.env.COL_TORCH_NAMES?.split('|')??Object.keys(artifact.entries).map(id=>id.slice('torch-ui/'.length));
try{for(const theme of ['light','dark'])for(const name of names){const page=await browser.newPage({viewport:{width:1000,height:1000},colorScheme:theme}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(6000);await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());const row={name,theme,errors};
  try{await page.goto(`http://127.0.0.1:${server.address().port}/?name=${encodeURIComponent(name)}&theme=${theme}`,{waitUntil:'domcontentloaded'});const f=page.frameLocator('iframe');await expect(f.locator('body')).toHaveAttribute('data-mounted','yes',{timeout:20000});await expect(f.locator('#root > *').first()).toBeVisible();if(checks[name])await checks[name](f);if(['Bar Chart','Line Chart','Pie Chart','Sparkline','Other charts'].includes(name)){const c=f.locator('canvas').first();await expect(c).toBeVisible();const s=await c.evaluate(e=>({width:e.width,height:e.height}));if(!s.width||!s.height)throw new Error('Chart has no drawable area')};await f.locator('body').evaluate(()=>window.dispose());await expect(f.locator('#root > *')).toHaveCount(0);if(errors.length)throw new Error(errors.join('; '));row.pass=true}
  catch(e){row.pass=false;row.failure=e.message;row.dom=await page.frameLocator('iframe').locator('body').innerText().catch(()=>'')}
  results.push(row);console.log(theme,name,row.pass?'PASS':'FAIL',row.failure?.slice(0,160)??'');await page.close();
}}finally{await browser.close();server.close()}
if(process.env.COL_TORCH_RESULTS)await writeFile(process.env.COL_TORCH_RESULTS,JSON.stringify(results,null,2));console.log(JSON.stringify({total:results.length,passed:results.filter(row=>row.pass).length}));if(results.some(row=>!row.pass))process.exitCode=1;
