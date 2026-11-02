import { readFile, writeFile, rename } from "node:fs/promises";
import { parse } from "@babel/parser";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { motionComponentDependencies } from "./motion-source-graph.mjs";
import { matchesPreviewIntegrity, previewIntegrity } from "./motion-preview-integrity.mjs";

const readJson=async path=>JSON.parse(await readFile(path,"utf8"));
const walk=(node,visit)=>{if(!node||typeof node!=="object")return;if(Array.isArray(node)){node.forEach(item=>walk(item,visit));return;}visit(node);for(const [key,value] of Object.entries(node))if(!["loc","comments","tokens"].includes(key))walk(value,visit);};
const syntax=code=>parse(code,{sourceType:"module",plugins:["typescript","jsx"]});
const names=node=>{const set=new Set();walk(node,item=>{if(["Identifier","JSXIdentifier"].includes(item.type))set.add(item.name);});return set;};
const executable=/\b(?:npx|bunx)\s|\b(?:npm|pnpm|yarn|bun)\s+(?:install|add|create|dlx|exec|i)\b/i;
const initialComponents={"nikala-ui":["Button","Toggle Group","Timeline"],"magicui-solid":["Marquee","Ripple Button","Shimmer Button"],"mystic-ui":["Marquee","Orbiting Circles","Ripple"]};

/** Keep complete live-demo declarations, omitting documentation-only string fixtures. */
function readableDemo(code,exportName){
  const nodes=syntax(code).program.body;
  const root=nodes.find(node=>exportName==="default"?node.type==="ExportDefaultDeclaration":node.type==="ExportNamedDeclaration"&&(node.declaration?.id?.name===exportName||node.declaration?.declarations?.some(item=>item.id.name===exportName)));
  if(!root)return;
  const selected=new Set([root]);
  const used=names(root);
  let changed=true;
  while(changed){changed=false;for(const node of nodes){
    if(selected.has(node)||node.type==="ImportDeclaration")continue;
    const declaration=node.declaration??node;
    const defined=declaration.id?[declaration.id.name]:(declaration.declarations??[]).map(item=>item.id.name);
    if(defined.some(name=>used.has(name))){selected.add(node);for(const name of names(node))used.add(name);changed=true;}
  }}
  const imports=nodes.filter(node=>node.type==="ImportDeclaration").flatMap(node=>{
    const specifiers=node.specifiers.filter(item=>used.has(item.local.name));
    if(!specifiers.length)return [];
    const normal=specifiers.filter(item=>item.type==="ImportSpecifier").map(item=>`${item.importKind==="type"?"type ":""}${item.imported.name}${item.imported.name===item.local.name?"":` as ${item.local.name}`}`);
    const parts=specifiers.filter(item=>item.type!=="ImportSpecifier").map(item=>item.type==="ImportDefaultSpecifier"?item.local.name:`* as ${item.local.name}`);
    if(normal.length)parts.push(`{ ${normal.join(", ")} }`);
    return [`import ${node.importKind==="type"?"type ":""}${parts.join(", ")} from ${JSON.stringify(node.source.value)};`];
  });
  const result=[...imports,...nodes.filter(node=>selected.has(node)).map(node=>code.slice(node.start,node.end))].join("\n\n");
  return result.length<=16000&&!executable.test(result)?result:undefined;
}

function apiEvidence(code){
  const nodes=syntax(code).program.body;
  const definitions=nodes.flatMap(node=>{const declaration=node.declaration??node;return ["TSInterfaceDeclaration","TSTypeAliasDeclaration"].includes(declaration.type)&&/Props|Options/.test(declaration.id.name)?[code.slice(declaration.start,declaration.end)]:[];});
  const chosen=[];let length=0;
  for(const definition of definitions)if(length+definition.length<7000&&!executable.test(definition)){chosen.push(definition);length+=definition.length;}
  return chosen.join("\n\n");
}

export async function updateMotionCatalog(slug){
  const dir=`data/solid-libraries/${slug}`;
  const [catalog,corpus,coverage,manifest,upstream,pages,artifact,browser]=await Promise.all([
    readJson(`${dir}/catalog.json`),readJson(`${dir}/corpus.json`),readJson(`${dir}/coverage.json`),readJson(`${dir}/examples.json`),readJson(`${dir}/upstream.json`),readJson(`${dir}/page-verification.json`),import(pathToFileURL(resolve(`data/component-previews/solid/${slug}/index.ts`)).href+`?checked=${Date.now()}`).then(module=>module.default),readJson(`${dir}/browser-verification.json`).catch(()=>({results:[]})),
  ]);
  const snapshots=corpus.snapshots.filter(snapshot=>!snapshot.componentId).map(snapshot=>({...snapshot,content:snapshot.content.replace("Col's three previews","Col's previews")}));
  const previous=new Map(catalog.components.map(component=>[component.name,component]));
  const dependencyEvidence={checkedAt:pages.checkedAt,revision:upstream.revision,method:"Public dependencies combine pinned component requirements with selected-demo imports. Component and demo-only requirements retain separate provenance; Solid JSX requires the recorded Solid runtime. Unknown local references remain explicit.",entries:{}};
  catalog.components=[];
  for(const example of manifest.examples){
    const page=pages.entries.find(page=>page.url===example.url);
    if(page?.status!==200)throw new Error(`Component URL has not been verified: ${example.url}`);
    const doc=upstream.files[example.docsSource]?.content??"";
    const rawDescription=doc.match(/^description:\s*(.+)$/m)?.[1]??doc.match(/description="([^"]+)"/)?.[1]??example.description;
    const description=rawDescription.replace(/^['"]|['"]$/g,"").trim();
    const dependency=motionComponentDependencies(slug,example,upstream,manifest.examples);
    dependency.componentDependencies=[...dependency.dependencies];
    dependency.exampleDependencies=example.packages.filter(name=>!dependency.dependencies.includes(name));
    dependency.dependencies=[...new Set([...dependency.dependencies,...dependency.exampleDependencies])].sort();
    const demoFile=upstream.files[example.module];
    const demoBytes=demoFile?.content??await readFile(`${dir}/${example.module}`,"utf8");
    const sample=example.id==="magicui-solid/Tweet Card";
    const officialDemo=sample?upstream.files["src/demos/TweetCardDemo.tsx"]:undefined;
    dependency.exampleSource={path:example.module,...(sample?{documentedExample:{url:officialDemo.url,integrity:officialDemo.integrity}}:{url:(demoFile??upstream.files[example.docsSource]).url}),integrity:createHash("sha256").update(demoBytes).digest("hex"),kind:demoFile?"original-source":sample?"authored-sample":"authored-extraction-of-pinned-documentation",sourcePaths:example.sourcePaths};
    dependencyEvidence.entries[example.id]=dependency;
    const demoRequirements=dependency.exampleDependencies.length?`The documented example additionally imports ${dependency.exampleDependencies.map(name=>`\`${name}\``).join(", ")}; these are demo requirements, separate from the component dependency graph.`:"";
    const component={...previous.get(example.name),name:example.name,url:example.url,summary:description,verifiedAt:pages.checkedAt.slice(0,10),dependencies:dependency.dependencies,registryDependencies:dependency.registryDependencies};
    if(slug==="mystic-ui")component.variants={Tailwind:example.url,Panda:example.url.replace("/tailwind/","/panda/")};
    catalog.components.push(component);
    const prior=corpus.snapshots.find(snapshot=>snapshot.componentId===example.id);
    if(prior&&initialComponents[slug].includes(example.name)){snapshots.push({...prior,content:[prior.content.replace(/\n\nThe documented example additionally imports[^\n]+$/,""),demoRequirements].filter(Boolean).join("\n\n")});continue;}
    const source=upstream.files[example.componentSource];
    if(!source)throw new Error(`No component evidence for ${example.id}`);
    const demoSource=upstream.files[example.module];
    const code=demoSource?.content??await readFile(`${dir}/${example.module}`,"utf8");
    const demo=readableDemo(code,example.exportName);
    const api=apiEvidence(source.content);
    const gaps=artifact.entries[example.id]?.gaps??artifact.unavailable?.[example.id]?.gaps??[];
    const exampleLabel=example.id==="magicui-solid/Tweet Card"?"Col's preview composition with sample content":`Original documented Solid example${example.module.startsWith("demos/")?" extracted from its live documentation preview":""}`;
    const content=[description,`Official component guide: ${example.url}. Component source: ${source.url}.`,api?`Source-pinned component props:\n\`\`\`ts\n${api}\n\`\`\``:"",demo?`${exampleLabel}:\n\`\`\`tsx\n${demo}\n\`\`\``:`The full official example is available in the source-pinned documentation. Keep its imports, composition and matching original CSS together: ${(demoSource??upstream.files[example.docsSource]).url}.`,demoRequirements,example.adaptation??"",`Pinned revision: ${upstream.revision}. Browser compilation uses SolidJS 1.9.17 and babel-preset-solid 1.9.16.`,...gaps.filter(gap=>gap!==example.adaptation)].filter(Boolean).join("\n\n");
    if(executable.test(content))throw new Error(`Installation command escaped the corpus boundary: ${example.id}`);
    const sources=[source,demoSource,...(example.id==="magicui-solid/Tweet Card"?[upstream.files["src/demos/TweetCardDemo.tsx"]]:[]),upstream.files[example.docsSource]].filter(Boolean).map(({url,integrity})=>({url,integrity}));
    snapshots.push({componentId:example.id,title:example.name,url:example.url,fetchedAt:pages.checkedAt,sourceRevision:upstream.revision,content,sources:[...new Map(sources.map(source=>[source.url,source])).values()]});
  }
  corpus.snapshots=snapshots;
  coverage.checkedAt=pages.checkedAt;
  coverage.selectedComponents=manifest.examples.map(example=>example.name);
  coverage.documentationInventory=manifest.examples.map(example=>{
    const entry=artifact.entries[example.id],unavailable=artifact.unavailable?.[example.id];
    const integrity=previewIntegrity(artifact,example.id);
    const checks=browser.results.filter(result=>result.id===example.id&&result.passed&&matchesPreviewIntegrity(result,integrity));
    return {name:example.name,url:example.url,preview:entry?"supported":"unavailable",documentation:"source-snapshot",urlVerification:"http-200",sourceRevision:upstream.revision,checkedAt:pages.checkedAt,browserVerification:unavailable?"not-applicable":["light","dark"].every(theme=>checks.some(check=>check.theme===theme))?"light-and-dark-passed":"pending",...(entry?.gaps?.length?{gaps:entry.gaps}:{}),...(unavailable?{reason:unavailable.reason}:{})};
  });
  coverage.summary=`All ${manifest.examples.length} official component pages were checked individually. ${Object.keys(artifact.entries).length} authentic previews are emitted; browser-verification.json records both themes and disclosed upstream limitations.`;
  coverage.notes="Every listed official component URL was individually HTTP-checked and matched to its pinned component/demo source. Preview status and browser evidence are separate from source coverage."+(slug==="mystic-ui"?" The website renders Panda stories on both variant pages; these previews compile the separate original Tailwind implementation.":"");
  for(const [file,value] of Object.entries({"catalog.json":catalog,"corpus.json":corpus,"coverage.json":coverage,"dependencies.json":dependencyEvidence})){
    const text=JSON.stringify(value,null,2)+"\n";await writeFile(`${dir}/${file}.tmp`,text);await rename(`${dir}/${file}.tmp`,`${dir}/${file}`);
  }
  console.log(`${slug}: ${catalog.components.length} indexed components and ${snapshots.length} scoped snapshots`);
}

if(process.argv[1]?.endsWith("motion-catalog.mjs"))for(const slug of process.argv.slice(2))await updateMotionCatalog(slug);
