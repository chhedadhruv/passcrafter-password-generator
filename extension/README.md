# PassCrafter Chrome extension

A Manifest V3 popup with the PassCrafter password generator and encrypted vault. It reuses the
website's code: the generator and vault components in `../components` and the framework-free modules
in `../lib`, so there is a single implementation of the randomness and the cryptography.

## Build and load

```bash
yarn install
yarn build:extension          # outputs extension/dist
```

1. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose `extension/dist`.

To produce the zip for the Chrome Web Store: `yarn package:extension` creates
`extension/passcrafter-extension.zip`.

## What it does

- **Generate**: same generator as the website (length 8-128, character types, strength meter).
- **Vault**: AES-256-GCM entries with a PBKDF2-SHA256 (600,000 iterations) key from your master
  password. Add, edit, search, reveal and copy. Encrypted backup and CSV import/export.
- **Save to vault** from the generator opens the add form with the password filled in.

## Privacy and permissions

- Permissions: `clipboardWrite` only. No host permissions, no content scripts, no background page,
  no remote code (CSP: `script-src 'self'; object-src 'self'`).
- The popup makes no network requests. There is no breach checker in the extension.
- The vault lives in the extension's own IndexedDB, separate from the website's vault (browsers
  isolate storage per origin). Move entries between them with an encrypted backup file.

## Behaviour to know about

- **The vault locks when the popup closes.** The key lives only in memory, so you re-enter the master
  password each time you open the popup.
- **No clipboard auto-clear.** A popup's timers stop when it closes, so unlike the website the
  extension can't promise to clear the clipboard after 30 seconds. It tells you to clear it yourself.
- **File pickers.** Some browsers close a popup when a file picker opens. Use **Open in tab** (top of
  the popup) to import a backup or CSV.
- A forgotten master password can't be recovered.

## Publishing checklist (Chrome Web Store)

- [ ] Developer account and one-time registration fee
- [ ] `yarn package:extension` and upload the zip
- [ ] Listing text, 1280×800 screenshots, 440×280 promo tile, 128px icon (`public/icons/icon-128.png`)
- [ ] Privacy policy URL: `https://passcrafter.dhruvchheda.com/privacy/` (the policy should mention
      the extension before submission)
- [ ] Single-purpose statement: "Generate strong passwords and store them in an encrypted local vault."
- [ ] Permission justification: `clipboardWrite` lets the Copy buttons write to the clipboard.
