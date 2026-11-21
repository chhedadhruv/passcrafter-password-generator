# PassCrafter - Free Secure Password Generator

**PassCrafter** generates strong random passwords entirely in your browser using the Web Crypto API (`crypto.getRandomValues`). Nothing is sent to or stored on a server.

## Features

- **Length 8-128** with a slider
- **Character sets**: lowercase, uppercase, numbers, symbols, plus an option to avoid look-alike characters (`0 O 1 l I`)
- **Guaranteed coverage**: every enabled set appears at least once
- **Strength meter** based on entropy (bits)
- **Copy to clipboard** with inline, screen-reader friendly feedback
- **Light/dark theme**, saved per browser

### More tools

Passphrase generator (EFF wordlist), password strength checker, breach checker (Have I Been Pwned k-anonymity: only a 5-character hash prefix leaves the browser), PIN generator, username generator, and SHA hash generator. Each has its own page with metadata, FAQ and JSON-LD.

### Encrypted vault (`/vault`)

- Local only: entries live in your browser's IndexedDB. No account, no server.
- AES-256-GCM per entry; key derived from your master password with PBKDF2-SHA256 (600,000 iterations), held in memory only
- Auto-locks after 5 minutes idle; copied passwords are cleared from the clipboard after 30 seconds
- Change reminders (opt-in, off by default): see how old each password is, set a default period (3, 6 or 12 months) and override it per entry; due passwords get a badge and a banner. Logic lives in `lib/vault/rotation.js`.
- Encrypted JSON backup export/import (merges by entry, keeps the newer)
- CSV import/export compatible with Chrome, Bitwarden and 1Password. CSV export is plain text and warns first. Spreadsheet formula injection is guarded in text columns; the password column is written exactly as stored.
- A forgotten master password cannot be recovered.

See the roadmap below for what is coming next.

## Development

```bash
yarn install
yarn dev      # http://localhost:3000
yarn test     # unit tests (vitest)
yarn build    # static export to ./out
yarn build:extension    # Chrome extension popup to ./extension/dist
```

Don't run `yarn build` or install packages while `yarn dev` is running: they share the `.next`
folder and can corrupt its cache (symptom: pages return 500 and look unstyled). Stop the dev server,
or delete `.next`, first.

### Tests

```bash
yarn test          # unit tests for lib/ (vitest)
yarn test:all      # unit tests, builds, then the browser suites below
yarn test:e2e      # browser suites only; needs `yarn build` and `yarn build:extension` first
node e2e/run.js site reminders    # run chosen suites (site, offline, reminders, extension)
```

The browser suites (`e2e/`) drive a real Chromium against the built site (served from `out/`) and
the built extension (`extension/dist`): the generator and every tool, the full vault flow including
encryption at rest and backup/CSV round trips, change reminders (with a simulated clock), offline
mode, and the extension loaded as a real unpacked extension.

- An installed Chromium-based browser is used automatically. Set `E2E_BROWSER` to choose one. Branded
  Google Chrome 137+ ignores `--load-extension`, so for the extension suite use Chromium or Brave.
- With no browser installed, run `npx playwright-core install chromium` once.
- Screenshots and other artifacts are written to `e2e/artifacts/` (ignored by git).
- The breach checker test calls the live Have I Been Pwned API; it also passes on the app's clear
  error message, so a network failure won't fail the run.
- `.github/workflows/ci.yml` runs all of this on pushes to `main` and on pull requests.

### Offline

The site registers a service worker in production builds that caches every page and asset after the
first visit. Everything works offline except the breach checker, which needs the network.

## Tech

- **Next.js 14** (App Router, static export) for per-page metadata, sitemap and prerendered HTML
- **Tailwind CSS 3**
- **Vitest** for unit tests
- Hosted on **Vercel**

## Roadmap

1. ✅ Next.js migration, crypto-secure generator, sitemap/robots, valid JSON-LD
2. ✅ More tools: passphrase generator, strength checker, PIN, username, hash, breach checker
3. ✅ Encrypted local vault with encrypted-backup and CSV import/export
4. ✅ Chrome extension (Manifest V3), see [`extension/`](extension/README.md)
5. ✅ Guides (`/guides/`) and PWA/offline support (service worker in `public/sw.js`)
6. Deployment on Vercel, Web Store submission, Lighthouse pass, OG share image

## Contact

For questions or feedback, email [me@dhruvchheda.com](mailto:me@dhruvchheda.com).
