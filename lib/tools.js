// Single source of truth for tool routes: used by the nav, sitemap, home page and "related tools".
export const TOOLS = [
  { path: "/", name: "Password Generator", blurb: "Random passwords with custom length and character sets." },
  { path: "/passphrase-generator/", name: "Passphrase Generator", blurb: "Memorable multi-word passphrases from the EFF wordlist." },
  { path: "/password-strength-checker/", name: "Strength Checker", blurb: "Estimate how long a password would take to crack." },
  { path: "/breach-checker/", name: "Breach Checker", blurb: "See if a password appeared in a known data breach, privately." },
  { path: "/pin-generator/", name: "PIN Generator", blurb: "Random numeric PINs that avoid obvious patterns." },
  { path: "/username-generator/", name: "Username Generator", blurb: "Readable random usernames in several styles." },
  { path: "/hash-generator/", name: "Hash Generator", blurb: "SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text." },
];
