#!/usr/bin/env node
// Runs the browser suites against the built site (out/) and the built extension (extension/dist).
//
//   yarn build && yarn build:extension && yarn test:e2e          # everything
//   node e2e/run.js site reminders                                # chosen suites
//
// Browser: an installed Chromium-based browser is used automatically; set E2E_BROWSER to choose one,
// or in CI run `npx playwright-core install --with-deps chromium` first.
const fs = require("fs");
const path = require("path");
const { ARTIFACTS, ROOT, browserPath, createReporter } = require("./lib");
const { start } = require("./server");

const SUITES = {
  site: require("./suites/site"),
  offline: require("./suites/offline"),
  reminders: require("./suites/reminders"),
  extension: require("./suites/extension"),
};

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(2);
}

async function main() {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((n) => !SUITES[n]);
  if (unknown.length) fail(`Unknown suite: ${unknown.join(", ")}. Available: ${Object.keys(SUITES).join(", ")}`);
  const names = requested.length ? requested : Object.keys(SUITES);

  const needsSite = names.some((n) => n !== "extension");
  if (needsSite && !fs.existsSync(path.join(ROOT, "out", "index.html"))) {
    fail("The site isn't built. Run `yarn build` first (it writes out/).");
  }
  if (names.includes("extension") && !fs.existsSync(path.join(ROOT, "extension", "dist", "manifest.json"))) {
    fail("The extension isn't built. Run `yarn build:extension` first.");
  }

  fs.mkdirSync(ARTIFACTS, { recursive: true });
  console.log(`Browser: ${browserPath() || "Playwright's bundled Chromium"}`);

  const server = needsSite ? await start(path.join(ROOT, "out")) : null;
  const summary = [];

  try {
    for (const name of names) {
      console.log(`\n== ${name} ==`);
      const reporter = createReporter();
      try {
        await SUITES[name].run({ baseUrl: server && server.url, check: reporter.check, artifacts: ARTIFACTS });
      } catch (err) {
        reporter.check("suite ran to completion", false, String(err && err.stack ? err.stack : err).split("\n").slice(0, 6).join("\n"));
      }
      summary.push({ name, ...reporter.counts() });
    }
  } finally {
    if (server) await server.close();
  }

  console.log("\n== summary ==");
  let anyFailed = false;
  for (const { name, total, failed } of summary) {
    if (failed) anyFailed = true;
    console.log(`  ${failed ? "FAIL" : "ok  "}  ${name.padEnd(10)} ${total - failed}/${total} passed`);
  }
  process.exit(anyFailed ? 1 : 0);
}

main();
