/* PassCrafter service worker: makes the tools work offline.
 *
 * - Install: caches every route listed in /sitemap.xml (plus /vault/) and the hashed
 *   JS/CSS/font assets those pages reference, so the site works offline after one visit.
 * - Static assets: cache-first.  Pages and everything else: network-first, falling back to cache.
 * - Cross-origin requests (e.g. the Have I Been Pwned lookup) are never touched.
 * - Only GET responses of this site's static files are stored. Vault data lives in IndexedDB
 *   and is never handled here.
 */
const CACHE = "passcrafter-v1";
const CORE_PAGES = ["/", "/vault/"];
const CORE_FILES = ["/wordlists/eff_large_wordlist.txt", "/manifest.json", "/icon.svg", "/favicon.ico", "/logo192.png"];
const ASSET_RE = /\/_next\/static\/[^"'\s\\)<>]+/g;
const NAV_TIMEOUT_MS = 4000;

async function sitemapPaths() {
  try {
    const res = await fetch("/sitemap.xml", { cache: "no-cache" });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  } catch {
    return [];
  }
}

async function precache() {
  const cache = await caches.open(CACHE);
  const pages = [...new Set([...CORE_PAGES, ...(await sitemapPaths())])];
  const assets = new Set(CORE_FILES);

  await Promise.allSettled(
    pages.map(async (path) => {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) return;
      const html = await res.clone().text();
      await cache.put(path, res);
      for (const a of html.match(ASSET_RE) || []) assets.add(a);
    })
  );

  await Promise.allSettled(
    [...assets].map(async (a) => {
      if (!(await cache.match(a))) await cache.add(a);
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

const isImmutable = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/wordlists/") ||
  /\.(png|ico|svg|woff2?)$/.test(url.pathname);

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, { timeout = 0 } = {}) {
  const cache = await caches.open(CACHE);
  try {
    const fetched = fetch(request);
    const res = timeout
      ? await Promise.race([
          fetched,
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout)),
        ])
      : await fetched;
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") {
      return new Response("You're offline and this page hasn't been saved yet. Reconnect and try again.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, { timeout: NAV_TIMEOUT_MS }));
  } else if (isImmutable(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
