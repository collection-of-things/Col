import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex");
const projects = {
  "nikala-ui": { repo: "nikala-ui/ui", prefixes: ["packages/core/src/", "packages/hooks/src/", "apps/web/src/routes/docs/components/", "apps/web/src/components/docs/", "apps/web/src/lib/", "apps/web/src/hooks/", "apps/web/src/config/"] },
  "magicui-solid": { repo: "axuj/magicui-solid", prefixes: ["src/registry/", "src/demos/", "src/components/ui/", "src/lib/", "src/hooks/", "src/styles/", "src/content/docs/docs/components/"] },
  "mystic-ui": { repo: "TheComputerM/mystic-ui", prefixes: ["components/tailwind/src/", "packages/registry/tailwind/", "website/src/content/docs/"] },
};
async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { "User-Agent": "Col-source-verification" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return { url, resolvedUrl: response.url, integrity: hash(bytes), content: new TextDecoder("utf-8", { fatal: true }).decode(bytes), status: response.status };
}
async function parallel(items, run, concurrency = 5) {
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => { while (cursor < items.length) await run(items[cursor++]); }));
}
for (const slug of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(projects)) {
  const project = projects[slug];
  const directory = `data/solid-libraries/${slug}`;
  const upstream = JSON.parse(await readFile(`${directory}/upstream.json`, "utf8"));
  const coverage = JSON.parse(await readFile(`${directory}/coverage.json`, "utf8"));
  const tree = JSON.parse((await download(`https://api.github.com/repos/${project.repo}/git/trees/${upstream.revision}?recursive=1`)).content);
  if (tree.truncated) throw new Error(`Truncated upstream tree: ${slug}`);
  const paths = tree.tree.filter(item => item.type === "blob" && project.prefixes.some(prefix => item.path.startsWith(prefix)) && /\.(?:tsx?|jsx?|mdx?|css|json)$/.test(item.path)).map(item => item.path);
  let count = 0;
  await parallel(paths.filter(path => !upstream.files[path]), async path => {
    const file = await download(`https://raw.githubusercontent.com/${project.repo}/${upstream.revision}/${path}`);
    upstream.files[path] = { url: file.url, integrity: file.integrity, content: file.content };
    if (++count % 40 === 0) console.log(`${slug}: ${count} source files fetched`);
  });
  const checks = [];
  await parallel(coverage.documentationInventory, async item => {
    try {
      const page = await download(item.url);
      const title = page.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'") ?? page.content.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
      checks.push({ name: item.name, url: item.url, status: page.status, resolvedUrl: page.resolvedUrl, title, integrity: page.integrity });
    } catch (error) { checks.push({ name: item.name, url: item.url, error: error.message }); }
  });
  const checkedAt = new Date().toISOString();
  upstream.checkedAt = checkedAt;
  await writeFile(`${directory}/upstream.json`, JSON.stringify(upstream, null, 2) + "\n");
  await writeFile(`${directory}/page-verification.json`, JSON.stringify({ checkedAt, sourceRevision: upstream.revision, entries: checks.sort((a, b) => a.name.localeCompare(b.name)) }, null, 2) + "\n");
  console.log(`${slug}: ${Object.keys(upstream.files).length} source files; ${checks.filter(check => check.status === 200).length}/${checks.length} official pages return 200; ${Buffer.byteLength(JSON.stringify(upstream))} snapshot bytes`);
}
