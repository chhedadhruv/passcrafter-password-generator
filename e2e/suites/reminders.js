// Reminders suite: change-password reminders in the vault. Time is simulated by skewing Date.now()
// in the page (window.__skew), so badges and the banner can be checked at 80, 100 and 200 days.
const fs = require("fs");
const path = require("path");
const { launch, tempDir } = require("../lib");

const MASTER = "correct horse battery";
const DAY = 86400000;

async function run({ baseUrl, check, artifacts }) {
  const dir = tempDir();
  const browser = await launch();
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    // Controllable clock: window.__skew (ms) is added to Date.now().
    await context.addInitScript(() => {
      const real = Date.now.bind(Date);
      window.__skew = Number(sessionStorage.getItem("skew") || 0);
      Date.now = () => real() + window.__skew;
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    const rows = () => page.locator("ul.space-y-3 > li");
    const row = (name) => rows().filter({ hasText: name });
    const skewDays = async (days) => {
      await page.evaluate((ms) => {
        window.__skew = ms;
        sessionStorage.setItem("skew", String(ms));
      }, days * DAY);
      // Any state change re-renders the list with the new "now".
      await page.fill('input[type="search"]', "x");
      await page.fill('input[type="search"]', "");
    };
    const addEntry = async ({ label, password, rotate }) => {
      await page.click('button:has-text("Add entry")');
      await page.fill("#f-label", label);
      await page.fill("#f-pass", password);
      if (rotate !== undefined) await page.selectOption("#f-rotate", rotate);
      await page.click('form button[type="submit"]:has-text("Save")');
      await row(label).waitFor();
    };
    const editEntry = async (name, fn) => {
      await row(name).locator('button:has-text("Edit")').click();
      await fn();
      await page.click('form button[type="submit"]:has-text("Save")');
      await page.waitForSelector("#f-label", { state: "detached" });
    };

    // ---- set up a vault ----
    await page.goto(baseUrl + "/vault/");
    await page.waitForSelector("text=Create your vault");
    await page.fill("#m1", MASTER);
    await page.fill("#m2", MASTER);
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Create vault")');
    await page.waitForSelector('button:has-text("Add entry")', { timeout: 15000 });

    // default is off
    check("default period starts as Never (off)", (await page.inputValue("#rotate-default")) === "0");
    await page.click('button:has-text("Add entry")');
    check("entry form defaults to 'Use default (Off)'", (await page.textContent('#f-rotate option[value=""]')).includes("Use default (Off)"));
    await page.click('button:has-text("Cancel")');

    // ---- entries ----
    await addEntry({ label: "Bank", password: "bank-pass-1", rotate: "90" });
    await addEntry({ label: "Mail", password: "mail-pass-1" });
    await addEntry({ label: "Legacy", password: "legacy-pass-1", rotate: "0" });

    check("fresh entry shows 'changed today'", (await row("Bank").textContent()).includes("Password changed today"));
    check("per-entry period shown on the row", (await row("Bank").textContent()).includes("reminder every 3 months"));
    check(
      "no badge or banner for fresh passwords",
      !(await page.isVisible("text=due for a change")) && !(await row("Bank").textContent()).includes("Change")
    );

    // ---- time passes ----
    await skewDays(80);
    check("80 days: Bank (3 months) shows 'Change in 10 days'", (await row("Bank").textContent()).includes("Change in 10 days"));
    check("80 days: no banner yet", !(await page.isVisible("text=due for a change")));
    check("80 days: row says changed 2 months ago", (await row("Bank").textContent()).includes("Password changed 2 months ago"));

    await skewDays(100);
    check("100 days: banner counts 1 password due", await page.isVisible("text=1 password is due for a change"));
    check("100 days: Bank badge shows overdue", (await row("Bank").textContent()).includes("Change due · 10 days overdue"));
    check("entries without a period (default off) get no badge", !(await row("Mail").textContent()).includes("Change"));

    await page.setViewportSize({ width: 900, height: 1500 });
    await page.screenshot({ path: path.join(artifacts, "reminders.png"), fullPage: true });

    // filter
    await page.click('button:has-text("Show only these")');
    check("'Show only these' filters to due entries", (await rows().count()) === 1 && (await row("Bank").count()) === 1);
    await page.click('button:has-text("Show all")');
    check("'Show all' restores the list", (await rows().count()) === 3);

    // ---- global default ----
    await page.selectOption("#rotate-default", "180");
    await skewDays(100);
    check("default 6 months: Mail shows a reminder period", (await row("Mail").textContent()).includes("reminder every 6 months"));
    check("default 6 months: Mail not due at 100 days", !(await row("Mail").textContent()).includes("Change due"));
    check("'Never' entry ignores the default", !(await row("Legacy").textContent()).includes("reminder every"));
    await skewDays(200);
    check("200 days: Mail is due via the default", (await row("Mail").textContent()).includes("Change due"));
    check("200 days: 'Never' entry stays quiet", !(await row("Legacy").textContent()).includes("Change"));
    check("200 days: banner counts Bank and Mail", await page.isVisible("text=2 passwords are due for a change"));

    // persists across reload
    await page.reload();
    await page.waitForSelector("text=Unlock your vault");
    await page.fill("#unlock", MASTER);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector("ul.space-y-3 >> text=Bank");
    check("default period persists across reload", (await page.inputValue("#rotate-default")) === "180");
    check("per-entry period persists across reload", (await row("Bank").textContent()).includes("reminder every 3 months"));
    check("due state is still computed after reload", await page.isVisible("text=2 passwords are due for a change"));

    // ---- what resets the age ----
    await editEntry("Bank", async () => {
      await page.fill("#f-notes", "just a note");
    });
    check("editing notes does NOT reset the age", (await row("Bank").textContent()).includes("Change due"));
    await editEntry("Bank", async () => {
      await page.fill("#f-pass", "bank-pass-2-new");
    });
    check("changing the password resets the age", (await row("Bank").textContent()).includes("Password changed today"));
    check("reset password is no longer due", !(await row("Bank").textContent()).includes("Change due"));
    check("banner drops to 1 after the reset", await page.isVisible("text=1 password is due for a change"));

    // clearing a per-entry override returns to the default
    await editEntry("Bank", async () => {
      await page.selectOption("#f-rotate", "");
    });
    check("clearing the override follows the default (6 months)", (await row("Bank").textContent()).includes("reminder every 6 months"));

    // Give Bank an override that differs from the browser default (6 months) so the backup check below
    // can only pass if the entry's own setting is carried in the backup.
    await editEntry("Bank", async () => {
      await page.selectOption("#f-rotate", "90");
    });

    // ---- data safety ----
    const dump = await page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open("passcrafter-vault");
          req.onsuccess = () => {
            const tx = req.result.transaction(["meta", "entries"], "readonly");
            const out = {};
            tx.objectStore("meta").getAll().onsuccess = (e) => (out.meta = e.target.result);
            tx.objectStore("entries").getAll().onsuccess = (e) => (out.entries = e.target.result);
            tx.oncomplete = () => resolve(JSON.stringify(out));
            tx.onerror = () => reject(tx.error);
          };
        })
    );
    check("reminder fields are encrypted too (no plaintext keys in IndexedDB)", !/rotateDays|passwordChangedAt|bank-pass|Bank/.test(dump));

    // The backup carries the per-entry settings: export, import into a fresh vault, compare.
    const [download] = await Promise.all([page.waitForEvent("download"), page.click('button:has-text("Download encrypted backup")')]);
    const backupPath = path.join(dir, "reminders-backup.json");
    await download.saveAs(backupPath);
    await page.evaluate(() => indexedDB.deleteDatabase("passcrafter-vault"));
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(baseUrl + "/vault/");
    await page.waitForSelector("text=Create your vault");
    await page.fill("#m1", "second master passw0rd");
    await page.fill("#m2", "second master passw0rd");
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Create vault")');
    await page.waitForSelector('button:has-text("Add entry")', { timeout: 15000 });
    await page.setInputFiles('input[type="file"]', backupPath);
    await page.fill("#bk-pw", MASTER);
    await page.click('button:has-text("Import backup")');
    await page.waitForSelector("ul.space-y-3 >> text=Legacy");
    check("backup keeps the per-entry 'never' setting", !(await row("Legacy").textContent()).includes("reminder every"));
    check(
      "backup keeps the per-entry period (3 months, not the 6-month default)",
      (await row("Bank").textContent()).includes("reminder every 3 months"),
      await row("Bank").textContent()
    );
    check(
      "backup keeps when the password last changed (Bank was reset 'today')",
      (await row("Bank").textContent()).includes("Password changed today"),
      await row("Bank").textContent()
    );

    check("no page errors", errors.length === 0, errors.join(" | "));
  } finally {
    await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { run };
