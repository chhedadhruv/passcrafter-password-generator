import { SITE } from "../lib/site";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/vault/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
