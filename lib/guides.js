// Guide content. Body items are either a string (paragraph) or { ul: [strings] }.
// Strings support inline links written as [text](/path/).
export const GUIDES_UPDATED = "2026-11-21";

export const GUIDES = [
  {
    slug: "how-to-create-a-strong-password",
    title: "How to Create a Strong Password",
    description:
      "What actually makes a password strong, why length beats complexity, and a simple routine for creating, checking and storing passwords you never have to memorize.",
    intro:
      "A strong password is one an attacker can't guess or brute-force in any realistic time. The good news: you don't need tricks. You need length, randomness and a different password for every account.",
    tools: ["/", "/password-strength-checker/", "/passphrase-generator/", "/breach-checker/"],
    sections: [
      {
        h: "Length beats complexity",
        body: [
          "Every extra character multiplies the number of guesses an attacker needs. A random 16-character password is vastly harder to crack than a clever 8-character one with symbols swapped in. Current security guidance, including NIST's, favours length over composition rules like 'must contain a symbol', and discourages forced periodic changes.",
          "As a rule of thumb, use at least 16 random characters for anything important, and 20 or more for your email and your password manager, because those unlock everything else.",
        ],
      },
      {
        h: "Let a generator choose it",
        body: [
          "People are predictable. We pick names, dates, keyboard patterns and words with a capital letter at the start and a number at the end, and attackers build their guess lists around exactly those habits. A generator has no habits.",
          "Use the [password generator](/) to create a random one. It uses your browser's secure random number generator and never sends the result anywhere. If a site rejects symbols, make the password longer instead.",
        ],
      },
      {
        h: "Use a different password for every account",
        body: [
          "When a site is breached, attackers try the leaked email and password on other services. This is called credential stuffing, and it works because so many people reuse passwords. One unique password per account means a breach stays contained to one site.",
        ],
      },
      {
        h: "Use a passphrase for the few you must remember",
        body: [
          "You can't memorize dozens of random strings, and you shouldn't try. Keep them in a password manager and remember only one strong master password. A random passphrase of five or six words is far easier to remember and type than random characters. Try the [passphrase generator](/passphrase-generator/) and read [passphrase vs password](/guides/passphrase-vs-password/).",
        ],
      },
      {
        h: "Check it, then store it",
        body: [
          "Run a password through the [strength checker](/password-strength-checker/) to see an entropy estimate, and the [breach checker](/breach-checker/) to see whether it already appears in known leaks. Both run privately in your browser. Then save it in a password manager, such as the [encrypted vault](/vault/), so you never type it from memory or reuse it.",
        ],
      },
      {
        h: "Add two-factor authentication",
        body: [
          "Even a perfect password can be phished. Two-factor authentication adds a second proof, such as an authenticator app or a hardware key, so a stolen password alone isn't enough. Turn it on for email, banking and anything that holds money or personal data.",
        ],
      },
      {
        h: "Common mistakes to avoid",
        body: [
          {
            ul: [
              "Using personal details: names, birthdays, pet names, phone numbers.",
              "Predictable substitutions such as 'P@ssw0rd'. Attackers try these first.",
              "Adding a number or symbol to the end of a reused password.",
              "Saving passwords in a plain text file, notes app or email draft.",
              "Typing your password into a link from an email. Go to the site yourself.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "passphrase-vs-password",
    title: "Passphrase vs Password: Which Is Better?",
    description:
      "Compare random passwords and passphrases by strength, memorability and where each fits. Includes the maths for how many words you need.",
    intro:
      "Both can be very strong. The difference is how easy they are for a human to remember and type. Here is when to use each, and how to choose the right length.",
    tools: ["/passphrase-generator/", "/", "/password-strength-checker/"],
    sections: [
      {
        h: "What is the difference?",
        body: [
          "A password is a string of characters, ideally random, such as 'vK9#mQ2$xL7!pR4@'. A passphrase is several random words, such as 'cabbage-pulse-gutter-fabric-lunar'. Both are strong only if the characters or words are chosen at random.",
        ],
      },
      {
        h: "How strong is each?",
        body: [
          "Strength is measured in bits of entropy, and each bit doubles the guesses needed. Entropy is length times the log base 2 of the pool size. Some examples:",
          {
            ul: [
              "8 random characters from all 94 printable symbols: about 52 bits.",
              "12 random characters from the same set: about 79 bits.",
              "16 random characters: about 105 bits.",
              "5 random words from the 7,776-word EFF list: about 65 bits.",
              "6 words: about 78 bits. 7 words: about 90 bits.",
            ],
          },
          "To put that in time: at an assumed 10 billion guesses per second against a fast hash, 65 bits takes roughly 40 years on average, 78 bits takes hundreds of thousands of years, and 90 bits takes billions of years. Sites that store passwords with slow hashes make attacks much slower still.",
        ],
      },
      {
        h: "When to use a passphrase",
        body: [
          "Use a passphrase for the few secrets you have to remember and type: your password manager's master password, your device login, your disk encryption. Six random words is a strong choice and can be recalled with a little repetition.",
        ],
      },
      {
        h: "When to use a random password",
        body: [
          "Use random characters for everything a password manager remembers for you. You never type them, so memorability doesn't matter and compact length is a plus: 20 random characters is about 131 bits.",
        ],
      },
      {
        h: "Passphrase mistakes",
        body: [
          {
            ul: [
              "Choosing the words yourself. Lyrics, quotes and favourite phrases are in attackers' lists. Let a generator pick.",
              "Using too few words. Three or four words is too weak for important accounts.",
              "Swapping letters for symbols (a to @). It adds almost no strength. Add a word instead.",
              "Reusing the same passphrase on several sites.",
            ],
          },
          "Generate one with the [passphrase generator](/passphrase-generator/), or a character password with the [password generator](/). You can see the numbers for either in the [strength checker](/password-strength-checker/).",
        ],
      },
    ],
  },
  {
    slug: "how-password-managers-work",
    title: "How Password Managers Work",
    description:
      "A plain-language look at master passwords, key derivation and encrypted vaults, plus the real trade-offs and how a local vault compares.",
    intro:
      "A password manager lets you use a long, unique password for every account while remembering only one. It works by locking all your passwords in an encrypted vault that only your master password can open.",
    tools: ["/", "/passphrase-generator/"],
    sections: [
      {
        h: "The problem they solve",
        body: [
          "Strong security asks for a different random password on every site. No one can memorize that. A manager remembers the passwords so you don't have to, and fills them in when needed.",
        ],
      },
      {
        h: "The master password and the key",
        body: [
          "Your master password isn't used directly to encrypt anything. It is run through a key derivation function, such as PBKDF2 or Argon2, which deliberately takes a noticeable amount of computation. This turns a guessable human password into a strong encryption key and makes each guess by an attacker expensive.",
          "The result is a key used with an authenticated cipher such as AES-256-GCM. Without the master password there is no feasible way to derive the key, and so no way to read the vault.",
        ],
      },
      {
        h: "The encrypted vault",
        body: [
          "The vault holds your entries: site, username, password and notes. It is stored only in encrypted form. Well-designed managers are 'zero knowledge': the company storing your vault never has your master password or key, so a server breach exposes ciphertext, not your passwords.",
        ],
      },
      {
        h: "Autofill and phishing",
        body: [
          "Managers that autofill match the site's real domain before filling a password. A look-alike phishing page has a different domain, so nothing is filled. That alone stops many phishing attacks that fool people.",
        ],
      },
      {
        h: "Trade-offs to know about",
        body: [
          {
            ul: [
              "The master password is a single point of failure. Make it a strong passphrase and never reuse it.",
              "If you forget it, a zero-knowledge vault can't be recovered by anyone. Keep a secure recovery method or backup.",
              "Malware on your device can capture what you type or see. A manager can't protect an already-compromised computer.",
              "Syncing across devices adds convenience and some exposure. It depends on the provider's design.",
            ],
          },
        ],
      },
      {
        h: "Where the PassCrafter vault fits",
        body: [
          "The [PassCrafter vault](/vault/) uses the same building blocks: PBKDF2 key derivation, AES-256-GCM encryption and a master password. It is deliberately small and local: no account, no sync, no autofill. Everything stays in your browser, and you move data with an encrypted backup file.",
          "That makes it a good fit for people who want a private place to keep generated passwords without trusting a service. If you need cross-device sync, browser autofill, sharing or breach monitoring, a dedicated, audited password manager does more.",
        ],
      },
      {
        h: "How to choose a manager",
        body: [
          {
            ul: [
              "Zero-knowledge design with strong key derivation.",
              "Independent security audits and a clear incident history.",
              "Easy export, so you are never locked in.",
              "Two-factor authentication for the vault itself.",
              "A recovery option you understand.",
            ],
          },
          "Whichever you pick, protect it with a long passphrase from the [passphrase generator](/passphrase-generator/).",
        ],
      },
    ],
  },
  {
    slug: "what-to-do-after-a-data-breach",
    title: "What to Do After a Data Breach",
    description:
      "A step-by-step checklist for when your password or personal data appears in a breach: what to change first, what to watch for, and how to prevent a repeat.",
    intro:
      "Finding out your details were in a data breach is stressful, but the response is mostly mechanical. Work through these steps in order, starting with the accounts that matter most.",
    tools: ["/breach-checker/", "/", "/password-strength-checker/"],
    sections: [
      {
        h: "1. Confirm what was exposed",
        body: [
          "Read the notice from the company, and check which data was taken: email, passwords, payment details, addresses. Use the [breach checker](/breach-checker/) to see whether a specific password appears in known leaks. It only sends the first five characters of a hash, never the password.",
        ],
      },
      {
        h: "2. Change the password, here and everywhere you reused it",
        body: [
          "Change the breached account's password first. Then change it on every other account that used the same or a similar password, starting with email, banking and anything that can reset other accounts. Create each new one with the [password generator](/) so every account gets a unique, random password.",
        ],
      },
      {
        h: "3. Secure your email first",
        body: [
          "Your email can reset almost every other account. Give it a long, unique passphrase and turn on two-factor authentication before anything else.",
        ],
      },
      {
        h: "4. Turn on two-factor authentication",
        body: [
          "Prefer an authenticator app or a hardware security key over SMS codes where possible. Even if a password leaks again, attackers can't log in without the second factor.",
        ],
      },
      {
        h: "5. Watch for follow-up scams",
        body: [
          "Breached data is often used for phishing that mentions real details to look convincing. Don't click links in unexpected emails or texts about the breach. Go to the company's site directly, and be suspicious of anyone who says they need your password or a code.",
        ],
      },
      {
        h: "6. Protect your finances if payment or ID data was exposed",
        body: [
          "If card numbers were taken, contact your bank or card issuer for a replacement. If identity details such as national ID numbers were exposed, look into fraud alerts or credit freezes where your country offers them, and review your statements and credit reports regularly.",
        ],
      },
      {
        h: "7. Make the next breach less painful",
        body: [
          {
            ul: [
              "Use a unique password per account, kept in a password manager.",
              "Delete accounts you no longer use.",
              "Share as little personal data as a service requires.",
              "Revisit old passwords with the [strength checker](/password-strength-checker/).",
            ],
          },
          "For how a manager keeps all those passwords safe, read [how password managers work](/guides/how-password-managers-work/).",
        ],
      },
    ],
  },
  {
    slug: "password-entropy-explained",
    title: "Password Entropy Explained",
    description:
      "What 'bits of entropy' means, how to calculate it, why human-chosen passwords are weaker than they look, and how to read a strength estimate.",
    intro:
      "Entropy is the standard way to measure how unpredictable a password is. It tells you how many guesses an attacker would need, and it explains why length and randomness matter so much.",
    tools: ["/password-strength-checker/", "/", "/passphrase-generator/"],
    sections: [
      {
        h: "What entropy measures",
        body: [
          "Entropy is measured in bits. A password with N bits of entropy is one of 2^N equally likely possibilities, so an attacker needs on average 2^(N-1) guesses to find it. Each additional bit doubles the work.",
        ],
      },
      {
        h: "How to calculate it",
        body: [
          "For a password chosen uniformly at random: entropy = length × log2(pool size). The pool is the number of different characters the password could use.",
          {
            ul: [
              "Lowercase only (26): about 4.7 bits per character.",
              "Lowercase, uppercase and digits (62): about 5.95 bits per character.",
              "All printable symbols (94): about 6.55 bits per character.",
            ],
          },
          "So 12 random characters from 94 gives about 79 bits, while 12 random lowercase letters gives only about 56 bits. For passphrases, each word from a 7,776-word list adds about 12.9 bits.",
        ],
      },
      {
        h: "Why 'random' is the key word",
        body: [
          "The formula only applies if each character really is chosen at random. A human-chosen password like 'Summer2024!' looks like it uses four character types, but attackers guess patterns like a word, a year and a symbol first, so its true strength is far lower than the formula suggests. That's why generated passwords matter.",
        ],
      },
      {
        h: "How much entropy is enough?",
        body: [
          {
            ul: [
              "Under 40 bits: weak. Can be cracked quickly with modern hardware.",
              "40 to 60 bits: fair. Fine only for low-value accounts with rate-limited logins.",
              "60 to 80 bits: strong for most accounts.",
              "80 bits or more: very strong, suitable for your email and password manager.",
            ],
          },
        ],
      },
      {
        h: "Reading a strength estimate",
        body: [
          "The [strength checker](/password-strength-checker/) estimates entropy from length and character types, then subtracts for repeated runs, sequences and very common passwords. Crack-time figures assume an offline attacker making 10 billion guesses per second against a fast hash. They're a useful comparison, not a promise: real systems vary, and a leaked password is weak however long it is.",
          "To get a high score without effort, generate a password with the [password generator](/) or a passphrase with the [passphrase generator](/passphrase-generator/).",
        ],
      },
    ],
  },
];

export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);

/** Guides that list the given tool path in their `tools`. */
export const guidesForTool = (path) => GUIDES.filter((g) => g.tools.includes(path));
