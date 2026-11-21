// Site suite: generator, every tool page, theme, and the full vault flow (create, add, encrypt-at-rest,
// lock/unlock, backup, CSV, generator-to-vault handoff, erase and restore).
const fs = require("fs");
const path = require("path");
const { launch, tempDir } = require("../lib");

const MASTER = "correct horse battery";
const SECOND = "second master passw0rd";
const SECRET_PW = "Sup3r-S3cret!pass";

async function run({ baseUrl, check }) {
  const dir = tempDir();
  const browser = await launch();
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

    // ---------- generator ----------
    await page.goto(baseUrl + "/");
    await page.waitForSelector('[data-testid="password"]');
    let pw = await page.textContent('[data-testid="password"]');
    check("generator shows a password of default length 16", pw.length === 16, pw);
    await page.evaluate(() => {
      const el = document.getElementById("length");
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      set.call(el, "40");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    pw = await page.textContent('[data-testid="password"]');
    check("slider changes length to 40", pw.length === 40, String(pw.length));
    await page.click('label:has-text("Symbols") input');
    pw = await page.textContent('[data-testid="password"]');
    check("symbols toggle still yields valid length", pw.length === 40);

    // theme toggle
    await page.click('button[aria-label="Switch to dark theme"]');
    check("theme toggle sets data-theme=dark", (await page.getAttribute("html", "data-theme")) === "dark");
    await page.reload();
    check("theme persists across reload", (await page.getAttribute("html", "data-theme")) === "dark");

    // ---------- other tools ----------
    await page.goto(baseUrl + "/passphrase-generator/");
    await page
      .waitForFunction(() => /[a-z]+-[a-z]+/.test(document.querySelector("section .font-mono")?.textContent || ""), null, { timeout: 8000 })
      .catch(() => {});
    const phrase = await page.textContent("section .font-mono");
    check("passphrase loads wordlist and shows 5 words", phrase.split("-").length === 5, phrase);

    await page.goto(baseUrl + "/pin-generator/");
    const pin = (await page.textContent("section .font-mono")).trim();
    check("PIN is 6 digits", /^\d{6}$/.test(pin), pin);

    await page.goto(baseUrl + "/username-generator/");
    check("usernames list shows 6 items", (await page.locator("section ul li").count()) === 6);

    await page.goto(baseUrl + "/hash-generator/");
    await page.fill("#hash-input", "abc");
    await page.waitForFunction(() => document.body.textContent.includes("ba7816bf8f01cfea"), null, { timeout: 5000 }).catch(() => {});
    check("hash page computes SHA-256('abc')", (await page.textContent("body")).includes("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));

    await page.goto(baseUrl + "/password-strength-checker/");
    await page.fill("#pw", "password");
    check("strength checker flags 'password'", (await page.textContent('[role="status"]')).includes("Very weak"));
    await page.fill("#pw", "vK9#mQ2$xL7!pR4@wT8&");
    check("strength checker rates random string very strong", (await page.textContent('[role="status"]')).includes("Very strong"));

    // Uses the live Have I Been Pwned API: pass on a result or on the app's clear error message.
    await page.goto(baseUrl + "/breach-checker/");
    await page.fill("#breach-pw", "password");
    await page.click('button:has-text("Check password")');
    await page.waitForFunction(() => /Found in|Not found|lookup failed/.test(document.body.textContent), null, { timeout: 15000 }).catch(() => {});
    const breachText = await page.textContent("body");
    check(
      "breach checker: 'password' reports found (live HIBP) or shows a clear error",
      /Found in [\d,]+ known breaches/.test(breachText) || /lookup failed/.test(breachText),
      breachText.slice(0, 80)
    );

    // ---------- vault ----------
    await page.goto(baseUrl + "/vault/");
    await page.waitForSelector("text=Create your vault");
    check("fresh vault shows create form", true);

    await page.fill("#m1", "short");
    check("create disabled for short master", await page.isDisabled('button:has-text("Create vault")'));
    await page.fill("#m1", MASTER);
    await page.fill("#m2", MASTER + "x");
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Create vault")');
    check("mismatched confirm is rejected", await page.isVisible("text=don't match"));
    await page.fill("#m2", MASTER);
    await page.click('button:has-text("Create vault")');
    await page.waitForSelector('button:has-text("Add entry")', { timeout: 15000 });
    check("vault created and unlocked", true);

    await page.click('button:has-text("Add entry")');
    await page.fill("#f-label", "GitHub");
    await page.fill("#f-site", "https://github.com");
    await page.fill("#f-user", "dhruv-test");
    await page.fill("#f-pass", SECRET_PW);
    await page.fill("#f-notes", "my secret note");
    await page.click('form button[type="submit"]:has-text("Save")');
    await page.waitForSelector("ul.space-y-3 >> text=GitHub");
    check("entry added and listed", await page.isVisible("ul.space-y-3 >> text=GitHub"));

    // raw IndexedDB must contain no plaintext
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
    const leaks = [SECRET_PW, "GitHub", "github.com", "dhruv-test", "my secret note", MASTER].filter((s) => dump.includes(s));
    check("IndexedDB contains no plaintext", leaks.length === 0, "leaked: " + leaks.join(", "));
    check("IndexedDB has 1 encrypted record", JSON.parse(dump).entries.length === 1);

    // reveal / search
    await page.click('button:has-text("Reveal")');
    check("reveal shows password", await page.isVisible(`text=${SECRET_PW}`));
    await page.fill('input[type="search"]', "zzzz");
    check("search filters to no matches", await page.isVisible("text=No matches"));
    await page.fill('input[type="search"]', "git");
    check("search finds entry", await page.isVisible("li >> text=GitHub"));
    await page.fill('input[type="search"]', "");

    // edit
    await page.click('button:has-text("Edit")');
    await page.fill("#f-user", "dhruv-edited");
    await page.click('form button[type="submit"]:has-text("Save")');
    await page.waitForSelector("text=dhruv-edited");
    check("edit persists", true);

    // downloads
    const [dl1] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Download encrypted backup")')]);
    const backupPath = path.join(dir, "backup.json");
    await dl1.saveAs(backupPath);
    const backupText = fs.readFileSync(backupPath, "utf8");
    check("backup file is encrypted (no plaintext)", ![SECRET_PW, "github.com", "dhruv-edited", MASTER].some((s) => backupText.includes(s)));
    check("backup has expected format", JSON.parse(backupText).format === "passcrafter-vault");

    await page.click('button:has-text("Export CSV")');
    check("CSV export shows plaintext warning", await page.isVisible("text=plain text"));
    const [dl2] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Download plain-text CSV")')]);
    const csvPath = path.join(dir, "export.csv");
    await dl2.saveAs(csvPath);
    const csv = fs.readFileSync(csvPath, "utf8");
    check("CSV contains header and password", csv.startsWith("name,url,username,password,note") && csv.includes(SECRET_PW), csv);

    // lock / unlock / wrong password
    await page.click('button:has-text("Lock now")');
    await page.waitForSelector("text=Unlock your vault");
    check("lock hides entries", !(await page.isVisible("main >> text=GitHub")));
    await page.fill("#unlock", "totally wrong pass");
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("text=Incorrect master password");
    check("wrong master password rejected", true);
    await page.fill("#unlock", MASTER);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("li >> text=GitHub");
    check("correct master password unlocks", true);

    // reload persistence
    await page.reload();
    await page.waitForSelector("text=Unlock your vault");
    await page.fill("#unlock", MASTER);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("li >> text=GitHub");
    check("vault persists across reload", true);

    // generator -> vault handoff
    await page.goto(baseUrl + "/");
    await page.waitForSelector('[data-testid="password"]');
    const generated = await page.textContent('[data-testid="password"]');
    await page.click('button:has-text("Save to vault")');
    await page.waitForURL("**/vault/");
    await page.waitForSelector("text=Unlock your vault");
    await page.fill("#unlock", MASTER);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("#f-pass");
    check("Save to vault pre-fills the generated password", (await page.inputValue("#f-pass")) === generated);
    const leftover = await page.evaluate(() => sessionStorage.getItem("passcrafter:pending-password"));
    check("pending password removed from sessionStorage after use", leftover === null);
    check("password was not put in the URL", !page.url().includes(generated));

    // erase and restore from backup into a new vault with a different master
    await page.click('button:has-text("Cancel")');
    await page.click('button:has-text("Lock now")');
    await page.click("text=Forgot your master password?");
    await page.check("text=Permanently erase all data in this vault");
    await page.click('button:has-text("Erase vault")');
    await page.waitForSelector("text=Create your vault");
    check("erase vault returns to create form", true);
    await page.fill("#m1", SECOND);
    await page.fill("#m2", SECOND);
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Create vault")');
    await page.waitForSelector("text=Your vault is empty");
    check("new vault starts empty", true);

    await page.setInputFiles('input[type="file"]', backupPath);
    await page.waitForSelector("#bk-pw");
    await page.fill("#bk-pw", "not the right one");
    await page.click('button:has-text("Import backup")');
    await page.waitForSelector("text=Wrong master password for that backup");
    check("backup import rejects wrong password", true);
    await page.fill("#bk-pw", MASTER);
    await page.click('button:has-text("Import backup")');
    await page.waitForSelector("li >> text=GitHub");
    check("backup restored into new vault with a different master", true);

    // CSV import: one duplicate row, one row with an awkward password
    const csvIn = path.join(dir, "in.csv");
    fs.writeFileSync(
      csvIn,
      "name,url,username,password,note\r\nGitHub,https://github.com,dhruv-edited," + SECRET_PW + ',my secret note\r\nBank,https://bank.example,me,"-pa""ss,word",line1\r\n'
    );
    await page.setInputFiles('input[type="file"]', csvIn);
    await page.waitForSelector("text=Import these entries");
    check("CSV preview shows row count", await page.isVisible("text=Found"));
    await page.click('button:has-text("Import these entries")');
    await page.waitForSelector("text=/Imported \\d+ /");
    const note = await page.textContent('[role="status"]');
    check("CSV import adds 1 and skips the duplicate", /Imported 1 entry; skipped 1/.test(note), note);
    const count = await page.locator("ul.space-y-3 > li").count();
    check("vault now has exactly 2 entries (GitHub not duplicated)", count === 2, String(count));
    await page.locator("li", { hasText: "Bank" }).locator('button:has-text("Reveal")').click();
    check("awkward CSV password imported intact", await page.isVisible('text=-pa"ss,word'));

    const bad = path.join(dir, "bad.csv");
    fs.writeFileSync(bad, "a,b\n1,2\n");
    await page.setInputFiles('input[type="file"]', bad);
    await page.waitForSelector("text=No password column");
    check("CSV without a password column gives a clear error", true);

    check("no console/page errors during the run", consoleErrors.length === 0, consoleErrors.join(" | "));
  } finally {
    await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { run };
