import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

// npm supplies its actual entry point under npm test; direct Node invocations
// also support the standard Windows, global Unix, and distribution layouts.
export function resolveNpmCli() {
  const executableDirectory = dirname(process.execPath);
  const candidates = [process.env.npm_execpath,
    resolve(executableDirectory, "node_modules/npm/bin/npm-cli.js"),
    resolve(executableDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
    resolve(executableDirectory, "../share/nodejs/npm/bin/npm-cli.js")];
  const entry = candidates.find(path => path && existsSync(path));
  if (!entry) throw new Error("Cannot locate npm's CLI; run this command through npm");
  return realpathSync(entry);
}

export function authenticateArchive(bytes, integrity) {
  const selected = integrity.split(/\s+/).find(value => value.startsWith("sha512-")) ?? integrity.split(/\s+/)[0];
  const [algorithm, expected] = selected.split("-");
  if (!["sha512", "sha256", "sha1"].includes(algorithm) || !expected) throw new Error("Unsupported locked archive integrity");
  if (createHash(algorithm).update(bytes).digest("base64") !== expected) throw new Error("Tarball integrity mismatch");
  return { algorithm, digest: Buffer.from(expected, "base64").toString("hex") };
}

function inside(root, path) {
  const child = relative(root, path);
  return child !== ".." && !child.startsWith("../") && !child.startsWith("..\\") && !isAbsolute(child);
}

function rejectLinks(root, path, checkedDirectories = new Set()) {
  let current = resolve(root);
  for (const segment of relative(root, path).split(/[\\/]/).filter(Boolean)) {
    current = resolve(current, segment);
    if (checkedDirectories.has(current)) continue;
    if (existsSync(current)) {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error(`Archive path follows a symlink: ${current}`);
      if (stat.isDirectory()) checkedDirectories.add(current);
    }
  }
}

/** Restore only selected bytes from a fully authenticated npm archive. Existing
 * files are compared byte-for-byte; an unselected stale file is never verified. */
export function restoreArchive({ bytes, integrity, installRoot, packagePath, Parser, allowFile, verifiedFiles, expectedHashes = new Map(), restoreFile = () => true }) {
  authenticateArchive(bytes, integrity);
  const target = resolve(installRoot, packagePath);
  if (!packagePath.startsWith("node_modules/") || !inside(installRoot, target)) throw new Error("Package escaped install root");
  rejectLinks(installRoot, target);
  mkdirSync(target, { recursive: true });
  const realTarget = realpathSync(target);
  const checkedDirectories = new Set([target]);
  if (!inside(realpathSync(installRoot), realTarget)) throw new Error("Package symlink escaped install root");
  const parser = new Parser({ strict: true, filter: (name, entry) => {
    const local = name.replace(/^[^/]+\//, "");
    if (!local || local === name) return false;
    if (local.split(/[\\/]/).includes("..") || isAbsolute(local) || ["SymbolicLink", "Link"].includes(entry.type)) throw new Error(`Unsafe archive entry: ${name}`);
    if (!["File", "OldFile"].includes(entry.type)) return false;
    return allowFile(local, `${packagePath}/${local}`);
  }, onReadEntry: entry => {
    const local = entry.path.replace(/^[^/]+\//, "");
    const filename = resolve(target, local);
    if (!inside(target, filename)) throw new Error(`Archive file escaped package root: ${entry.path}`);
    const chunks = [];
    entry.on("data", chunk => chunks.push(chunk));
    entry.on("end", () => {
      const content = Buffer.concat(chunks);
      expectedHashes.set(`${packagePath}/${local}`, createHash("sha256").update(content).digest("hex"));
      if (!restoreFile(local)) return;
      rejectLinks(target, filename, checkedDirectories);
      mkdirSync(dirname(filename), { recursive: true });
      if (!inside(realTarget, realpathSync(dirname(filename))) || (existsSync(filename) && lstatSync(filename).isSymbolicLink())) throw new Error(`Archive file follows a symlink: ${entry.path}`);
      if (!existsSync(filename) || !readFileSync(filename).equals(content)) writeFileSync(filename, content);
      verifiedFiles.add(`${packagePath}/${local}`);
    });
    entry.resume();
  } });
  parser.on("error", error => { throw error; });
  parser.end(gunzipSync(bytes));
}

export function authenticateRuntimeFile(bytes, sourcePath, expectedHashes) {
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (expectedHashes.get(sourcePath) !== digest) throw new Error(`Bundle used an unverified cached file: ${sourcePath}`);
  return digest;
}

export function readVerifiedMetadata(filename, sourcePath, expectedHashes) {
  if (!expectedHashes.has(sourcePath)) return undefined;
  const bytes = readFileSync(filename);
  authenticateRuntimeFile(bytes, sourcePath, expectedHashes);
  return bytes.toString("utf8");
}
