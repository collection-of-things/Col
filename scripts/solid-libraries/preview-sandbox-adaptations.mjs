/** Keep the sidebar usable when an opaque preview frame rejects cookie writes. */
export function guardSidebarCookieWrite(source, identity) {
  const matches = [...source.matchAll(/^([\t ]*)document\.cookie = [^\r\n]+$/gm)];
  if (matches.length !== 1) throw new Error(`Sidebar cookie write changed: ${identity}`);
  const [original, indent] = matches[0];
  return source.replace(original, `${indent}try { ${original.trim()} } catch (error) { if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error; }`);
}
