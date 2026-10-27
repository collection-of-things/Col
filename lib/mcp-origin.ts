import { siteUrl } from "./site.ts";

/** Non-browser clients omit Origin; browser clients must use an explicitly trusted origin. */
export function isMcpOriginAllowed(origin: string | null, trustedOrigins = ""): boolean {
  if (origin === null) return true;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin || /[,*]/.test(origin)) return false;
    return origin === siteUrl || trustedOrigins.split(",").some((trusted) => trusted.trim() === origin);
  } catch {
    return false;
  }
}
