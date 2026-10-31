import { createHash } from "node:crypto";
import { transformPreviewAssets } from "../../lib/component-preview-assets.ts";

export function previewIntegrity(artifact, id) {
  const entry = Object.hasOwn(artifact.entries, id) ? artifact.entries[id] : undefined;
  if (!entry) return undefined;
  const group = entry.group ? artifact.groups[entry.group] : undefined;
  const code = transformPreviewAssets(id, entry.code ?? `const PREVIEW_COMPONENT=${JSON.stringify(id)};\n${group.code}`);
  const css = entry.css ?? artifact.styles[group.style];
  const sha256 = value => createHash("sha256").update(value).digest("hex");
  return { codeIntegrity: sha256(code), cssIntegrity: sha256(css) };
}

export function matchesPreviewIntegrity(result, integrity) {
  return Boolean(integrity && result.codeIntegrity === integrity.codeIntegrity && result.cssIntegrity === integrity.cssIntegrity);
}
