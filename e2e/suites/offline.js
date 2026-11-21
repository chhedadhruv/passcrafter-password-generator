// Offline suite: the service worker caches the site on one online visit, and the tools keep working
// without a connection (except the breach checker, which must fail with a clear message).
const { launch } = require("../lib");

async function run({ baseUrl, check }) {
  const browser = await launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(baseUrl + "/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Wait for precaching to finish (the install event populates the cache).
    await page
      .waitForFunction(
        async () => {
          const keys = await caches.keys();
          if (!keys.length) return false;
          const reqs = await (await caches.open(keys[0])).keys();
          return reqs.length > 40;
        },
        null,
        { timeout: 20000 }
      )
      .catch(() => {});
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys();
      const reqs = await (await caches.open(keys[0])).keys();
      return reqs.map((r) => new URL(r.url).pathname);
    });
    check(
      "service worker registered and controlling",
      (await page.evaluate(() => !!navigator.serviceWorker.controller)) || context.serviceWorkers().length > 0
    );
    check(
      "cache holds all tool pages",
      ["/", "/passphrase-generator/", "/pin-generator/", "/hash-generator/", "/vault/", "/faq/", "/privacy/"].every((p) => cached.includes(p)),
      cached.filter((p) => !p.includes("_next")).join(", ")
    );
    check("cache holds the wordlist", cached.includes("/wordlists/eff_large_wordlist.txt"));
    check(
      "cache holds hashed JS and font assets",
      cached.some((p) => p.endsWith(".js") && p.includes("_next/static")) && cached.some((p) => p.endsWith(".woff2")),
      `${cached.length} entries`
    );

    // Reload once so the page is definitely controlled, then go offline.
    await page.reload();
    await context.setOffline(true);

    await page.goto(baseUrl + "/passphrase-generator/");
    await page
      .waitForFunction(() => /[a-z]+-[a-z]+-[a-z]+/.test(document.querySelector("section .font-mono")?.textContent || ""), null, { timeout: 8000 })
      .catch(() => {});
    const phrase = await page.textContent("section .font-mono");
    check("offline: passphrase page loads and generates (wordlist from cache)", phrase.split("-").length === 5, phrase);

    await page.goto(baseUrl + "/pin-generator/");
    check("offline: PIN page works", /^\d{6}$/.test((await page.textContent("section .font-mono")).trim()));

    await page.goto(baseUrl + "/");
    await page.waitForSelector('[data-testid="password"]');
    check("offline: home page generator works", (await page.textContent('[data-testid="password"]')).length === 16);

    // client-side navigation offline
    await page.click('nav[aria-label="Main"] >> text=Tools');
    await page.click('nav[aria-label="Main"] >> text=Hash Generator');
    await page.waitForSelector("#hash-input", { timeout: 8000 });
    await page.fill("#hash-input", "abc");
    await page.waitForFunction(() => document.body.textContent.includes("ba7816bf"), null, { timeout: 5000 }).catch(() => {});
    check("offline: client-side navigation to hash tool works", (await page.textContent("body")).includes("ba7816bf8f01cfea"));

    await page.goto(baseUrl + "/vault/");
    // The form appears once IndexedDB has been checked, so wait for it rather than sampling instantly.
    const vaultForm = await page
      .waitForSelector("text=/Create your vault|Unlock your vault/", { timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    check("offline: vault page loads", vaultForm);

    // breach checker degrades gracefully offline
    await page.goto(baseUrl + "/breach-checker/");
    await page.fill("#breach-pw", "password");
    await page.click('button:has-text("Check password")');
    await page.waitForSelector("text=lookup failed", { timeout: 10000 }).catch(() => {});
    check("offline: breach checker shows a clear error", await page.isVisible("text=lookup failed"));

    // an uncached route gives the offline message instead of a browser error
    const res = await page.goto(baseUrl + "/never-visited/").catch(() => null);
    check(
      "offline: unknown route returns friendly 503 text",
      res && res.status() === 503 && (await page.textContent("body")).includes("offline"),
      res ? String(res.status()) : "no response"
    );

    check("no uncaught page errors", errors.length === 0, errors.join(" | "));
  } finally {
    await browser.close();
  }
}

module.exports = { run };
