import { createHash } from "node:crypto";

const sidePanelSourceHash = "a82fa6a78d6191f2458c982da314b5a299f983e5be19b27cecff1520da29df65";
const sidePanelVideo = 'url:"https://youtu.be/ta6m_l3lZvQ?si=1CPubGeqxLVG0i2L"';
const lazyPlayerImport = 'from"react-player@2.16.0/lazy"';

/** This pinned demo uses one fixed YouTube URL. Select ReactPlayer's documented
 * provider-only entry without copying or changing either component implementation.
 * A source update must be reviewed again before this restriction can be reused. */
export function adaptPreviewSourceImports(id: string, code: string): string {
  if (id !== "cult-ui/Side Panel") return code;
  if (createHash("sha256").update(code).digest("hex") !== sidePanelSourceHash
    || code.split(lazyPlayerImport).length !== 2
    || code.split(sidePanelVideo).length !== 2) {
    throw new Error("Side Panel's YouTube-only adapter requires its reviewed, unchanged source and fixed video URL.");
  }
  return code.replace(lazyPlayerImport, 'from"react-player@2.16.0/youtube"');
}
