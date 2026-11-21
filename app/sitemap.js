import { SITE, PAGES } from "../lib/site";
import { TOOLS } from "../lib/tools";
import { GUIDES, GUIDES_UPDATED } from "../lib/guides";

export const dynamic = "force-static";

// Tool routes come from lib/tools.js, info pages from lib/site.js and articles from lib/guides.js
// (paths end in "/"). The vault is intentionally excluded (noindex).
export default function sitemap() {
  return [
    ...TOOLS.map((t) => ({
      url: SITE.url + t.path,
      changeFrequency: "monthly",
      priority: t.path === "/" ? 1 : 0.8,
    })),
    ...GUIDES.map((g) => ({
      url: `${SITE.url}/guides/${g.slug}/`,
      lastModified: GUIDES_UPDATED,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
    ...PAGES.map((p) => ({
      url: SITE.url + p.path,
      changeFrequency: "yearly",
      priority: 0.5,
    })),
  ];
}
