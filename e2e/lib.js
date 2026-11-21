// Shared helpers for the browser (end-to-end) suites.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright-core");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = path.join(__dirname, "artifacts");

// Local browsers, in order of preference. Branded Chrome 137+ ignores --load-extension, which the
// extension suite needs, so Chromium-based browsers that still allow it come first.
const CANDIDATES = [
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
];

/**
 * Which browser to drive. E2E_BROWSER overrides. In CI (CI=true) use the Chromium that Playwright
 * installs (`npx playwright-core install chromium`); locally use an installed browser if there is one,
 * and otherwise fall back to Playwright's own.
 */
function browserPath() {
  if (process.env.E2E_BROWSER) return process.env.E2E_BROWSER;
  if (process.env.CI) return undefined;
  return CANDIDATES.find((p) => fs.existsSync(p));
}

function launch(options = {}) {
  return chromium.launch({ executablePath: browserPath(), headless: true, ...options });
}

function launchPersistent(userDataDir, options = {}) {
  return chromium.launchPersistentContext(userDataDir, { executablePath: browserPath(), ...options });
}

/** A fresh temp directory for files a suite downloads or generates. */
function tempDir(prefix = "pc-e2e-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Collects pass/fail results for one suite and prints them as they happen. */
function createReporter() {
  const results = [];
  function check(name, ok, detail = "") {
    const pass = !!ok;
    results.push({ name, pass });
    const text = typeof detail === "string" ? detail : JSON.stringify(detail);
    console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${pass ? "" : text ? "  -> " + text : ""}`);
  }
  const counts = () => ({ total: results.length, failed: results.filter((r) => !r.pass).length });
  return { check, counts };
}

module.exports = { ROOT, ARTIFACTS, browserPath, launch, launchPersistent, tempDir, createReporter };
