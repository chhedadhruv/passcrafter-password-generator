// Extension suite: loads extension/dist as a real unpacked extension and drives the popup, checking
// the generator, vault, handoff, encryption at rest, locking, manifest permissions and CSP.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { ROOT, launchPersistent, tempDir } = require("../lib");

const MASTER = "correct horse battery";

// Chrome derives an unpacked extension's ID from its absolute path: SHA-256, first 16 bytes as hex,
// with each hex digit mapped to a-p.
const extensionId = (dist) =>
  crypto
    .createHash("sha256")
    .update(dist)
    .digest("hex")
    .slice(0, 32)
    .replace(/./g, (c) => String.fromCharCode(97 + parseInt(c, 16)));

async function run({ check, artifacts }) {
  const dist = fs.realpathSync(path.join(ROOT, "extension", "dist"));
  const userDir = tempDir("pc-ext-");
  const id = extensionId(dist);
  const url = `chrome-extension://${id}/popup.html`;

  // Extensions need a headful-capable browser; "--headless=new" keeps it invisible.
  const context = await launchPersistent(userDir, {
    headless: false,
    viewport: { width: 420, height: 640 },
    args: ["--headless=new", `--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
  });

  try {
    const errors = [];
    let page = await context.newPage();
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

    try {
      await page.goto(url, { timeout: 8000 });
    } catch (e) {
      check(
        "extension loads in this browser",
        false,
        `could not open ${url} (${e.message.split("\n")[0]}). Branded Chrome 137+ ignores --load-extension; use Chromium or Brave via E2E_BROWSER.`
      );
      return;
    }

    await page.waitForSelector('[data-testid="password"]', { timeout: 8000 });
    check("popup loads as a real extension page", page.url().startsWith("chrome-extension://"));
    let pw = await page.textContent('[data-testid="password"]');
    check("generator works in popup (16 chars)", pw.length === 16, pw);
    await page.screenshot({ path: path.join(artifacts, "extension-generate.png") });

    await page.click('button:has-text("Regenerate")');
    check("regenerate produces a new password", (await page.textContent('[data-testid="password"]')) !== pw);
    pw = await page.textContent('[data-testid="password"]');

    // Save to vault -> vault tab -> create vault -> add form prefilled
    await page.click('button:has-text("Save to vault")');
    await page.waitForSelector("text=Create your vault");
    check("Save to vault switches to the Vault tab", await page.isVisible("text=Create your vault"));
    await page.fill("#m1", MASTER);
    await page.fill("#m2", MASTER);
    await page.check('#panel-vault input[type="checkbox"]');
    await page.click('button:has-text("Create vault")');
    await page.waitForSelector("#f-pass", { timeout: 15000 });
    check("generated password pre-fills the add form after creating the vault", (await page.inputValue("#f-pass")) === pw);
    await page.fill("#f-label", "Example");
    await page.fill("#f-user", "me@example.com");
    await page.click('#panel-vault button[type="submit"]');
    await page.waitForSelector("ul.space-y-3 >> text=Example");
    check("entry saved in the extension vault", true);
    check(
      "change-reminder settings are available in the popup",
      (await page.isVisible("#rotate-default")) && (await page.inputValue("#rotate-default")) === "0"
    );
    check("new entry shows its password age in the popup", (await page.textContent("ul.space-y-3")).includes("Password changed today"));
    await page.screenshot({ path: path.join(artifacts, "extension-vault.png") });

    // copy notice for the extension (no promise of a clipboard timer)
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: `chrome-extension://${id}` }).catch(() => {});
    await page.click('button:has-text("Copy password")');
    await page.waitForTimeout(300);
    const notice = await page.textContent('#panel-vault [role="status"]');
    check("copy notice does not promise a clipboard timer", /Copied/.test(notice) && !/30 seconds/.test(notice), notice);

    // Save from the generator while the vault is already unlocked
    await page.click('[role="tab"]:has-text("Generate")');
    const pw2 = await page.textContent('[data-testid="password"]');
    await page.click('button:has-text("Save to vault")');
    await page.waitForSelector("#f-pass");
    check("unlocked vault picks up a second saved password", (await page.inputValue("#f-pass")) === pw2);
    await page.click('button:has-text("Cancel")');

    // IndexedDB belongs to the extension origin and holds no plaintext
    const dump = await page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open("passcrafter-vault");
          req.onsuccess = () => {
            const db = req.result;
            const out = {};
            const tx = db.transaction(["meta", "entries"], "readonly");
            tx.objectStore("meta").getAll().onsuccess = (e) => (out.meta = e.target.result);
            tx.objectStore("entries").getAll().onsuccess = (e) => (out.entries = e.target.result);
            tx.oncomplete = () => resolve(JSON.stringify(out));
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        })
    );
    check("extension IndexedDB has no plaintext", ![pw, "Example", "me@example.com", MASTER].some((s) => dump.includes(s)));

    // "Closing" the popup locks the vault: reopen it
    await page.close();
    page = await context.newPage();
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    await page.goto(url);
    await page.click('[role="tab"]:has-text("Vault")');
    await page.waitForSelector("text=Unlock your vault");
    check("reopening the popup requires the master password", true);
    await page.fill("#unlock", "totally wrong pass");
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("text=Incorrect master password");
    check("wrong master password rejected", true);
    await page.fill("#unlock", MASTER);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("ul.space-y-3 >> text=Example");
    check("entry persists after reopening and unlocking", true);

    // manifest sanity
    const manifest = JSON.parse(fs.readFileSync(path.join(dist, "manifest.json"), "utf8"));
    check(
      "manifest requests only clipboardWrite and no host permissions",
      JSON.stringify(manifest.permissions) === '["clipboardWrite"]' && !manifest.host_permissions && !manifest.content_scripts
    );
    check("manifest CSP forbids remote and inline script", manifest.content_security_policy.extension_pages === "script-src 'self'; object-src 'self'");

    // dist must not reference remote code
    const bundle = fs
      .readdirSync(path.join(dist, "assets"))
      .filter((f) => f.endsWith(".js"))
      .map((f) => fs.readFileSync(path.join(dist, "assets", f), "utf8"))
      .join("\n");
    const html = fs.readFileSync(path.join(dist, "popup.html"), "utf8");
    check("popup.html loads only local scripts and styles", !/(src|href)="https?:/.test(html));
    check("no network fetch to third parties in the bundle", !/api\.pwnedpasswords|fonts\.googleapis/.test(bundle));

    check("no console or page errors (incl. CSP violations)", errors.length === 0, errors.join(" | "));
  } finally {
    await context.close();
    fs.rmSync(userDir, { recursive: true, force: true });
  }
}

module.exports = { run };
