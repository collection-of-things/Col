import { readFile } from "node:fs/promises";

const registry = "https://registry.npmjs.org";

/** Strip the trailing commas and comments Bun writes in its text lockfile.
 * The scan is string-aware, so package names and URLs pass through untouched. */
function parseLockfile(text) {
  let output = "";
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inString) {
      output += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }
    if (char === "/" && text[index + 1] === "/") {
      while (index < text.length && text[index] !== "\n") index++;
      output += "\n";
      continue;
    }
    if (char === ",") {
      let next = index + 1;
      while (next < text.length && /\s/.test(text[next])) next++;
      if (text[next] === "}" || text[next] === "]") continue;
    }
    output += char;
  }
  return JSON.parse(output);
}

/** Split a Bun dependency key into package names.
 * Bun nests a dependency under its dependent package name, so "a/b" means b is
 * installed beneath a and "@scope/a/b" chains a scoped name with a plain one. */
function keySegments(key) {
  const segments = [];
  const parts = key.split("/");
  for (let index = 0; index < parts.length; index++) {
    if (parts[index].startsWith("@")) segments.push(`${parts[index]}/${parts[++index]}`);
    else segments.push(parts[index]);
  }
  return segments;
}

/** Read a Bun text lockfile as the npm-lock install-path map the integrity
 * checks expect. Bun records a registry integrity hash per package but neither
 * the download URL nor the install path, so both are derived from the key:
 * the URL follows npm's tarball layout and the path follows Bun's nesting. */
export async function readLockedPackages(lockPath) {
  const lock = parseLockfile(await readFile(lockPath, "utf8"));
  if (![2, 3].includes(lock.lockfileVersion)) throw new Error(`Unsupported Bun lockfile version: ${lock.lockfileVersion}`);
  const packages = {};
  for (const [key, entry] of Object.entries(lock.packages)) {
    if (!Array.isArray(entry)) continue;
    const [identifier, resolution, , integrity] = entry;
    // Anything but an official registry tarball ("") has no verifiable archive.
    if (resolution !== "") throw new Error(`Locked dependency is not an npm registry tarball: ${key}`);
    // An alias installs one package under another name ("string-width-cjs" holds
    // string-width), so the path comes from the key and the archive from the name.
    const split = identifier.indexOf("@", identifier.startsWith("@") ? 1 : 0);
    if (split < 1) throw new Error(`Locked dependency has no version: ${key}`);
    const name = identifier.slice(0, split);
    const version = identifier.slice(split + 1);
    const tarballName = name.slice(name.lastIndexOf("/") + 1);
    packages[keySegments(key).map(segment => `node_modules/${segment}`).join("/")] = {
      version,
      resolved: `${registry}/${name}/-/${tarballName}-${version}.tgz`,
      integrity,
    };
  }
  return packages;
}
