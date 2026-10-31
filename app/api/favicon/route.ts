import { createFaviconHandler } from "@/lib/favicon";

const favicon = createFaviconHandler();

export function GET(request: Request) {
  return favicon(request.url);
}
