import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { resolveNpmCli } from "../preview-package-archive.mjs";

const choices = {
  "nikala-ui": { packageFile: "apps/web/package.json", overrides: {} },
  "magicui-solid": { packageFile: "package.json", overrides: {} },
  "mystic-ui": { packageFile: "components/tailwind/package.json", overrides: {} },
};
for (const slug of process.argv.slice(2)) {
  const directory = `data/solid-libraries/${slug}`;
  const upstream = JSON.parse(await readFile(`${directory}/upstream.json`, "utf8"));
  const examples = JSON.parse(await readFile(`${directory}/examples.json`, "utf8")).examples;
  const source = JSON.parse(upstream.files[choices[slug].packageFile].content);
  const current = JSON.parse(await readFile(`${directory}/package.json`, "utf8"));
  const requested = [...new Set(examples.flatMap(example => example.packages ?? []))].filter(name => !current.dependencies[name] && name !== "styled-system");
  const specs = requested.map(name => {
    const range = choices[slug].overrides[name] ?? source.dependencies?.[name] ?? source.devDependencies?.[name];
    if (!/^\^?\d+\.\d+\.\d+/.test(range ?? "")) throw new Error(`No reviewed upstream version for ${slug}/${name}: ${range}`);
    return `${name}@${range.replace(/^\^/, "")}`;
  });
  if (!specs.length) continue;
  const workspace = resolve(".scratch/solid-library-69/solid-motion/build", slug);
  const result = spawnSync(process.execPath, [resolveNpmCli(), "install", "--save-exact", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline", ...specs], { cwd: workspace, stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Installing reviewed demo dependencies failed for ${slug}`);
  for (const filename of ["package.json", "package-lock.json"]) await writeFile(`${directory}/${filename}`, await readFile(resolve(workspace, filename)));
  console.log(`${slug}: added only required demo dependencies: ${specs.join(", ")}`);
}
