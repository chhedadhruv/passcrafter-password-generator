import { SITE, PAGES } from "../lib/site";
import { TOOLS } from "../lib/tools";

export const dynamic = "force-static";

// Tool routes come from lib/tools.js and info pages from lib/site.js (paths end in "/").
// The vault is intentionally excluded (noindex).
export default function sitemap() {
  return [
    ...TOOLS.map((t) => ({
      url: SITE.url + t.path,
      changeFrequency: "monthly",
      priority: t.path === "/" ? 1 : 0.8,
    })),
    ...PAGES.map((p) => ({
      url: SITE.url + p.path,
      changeFrequency: "yearly",
      priority: 0.5,
    })),
  ];
}
