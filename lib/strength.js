// Heuristic password strength estimator. It is an estimate, not a guarantee:
// it starts from character-pool entropy and subtracts for common weaknesses.

const COMMON = new Set([
  "password", "123456", "12345678", "123456789", "qwerty", "abc123", "letmein",
  "111111", "iloveyou", "admin", "welcome", "monkey", "dragon", "football",
  "baseball", "master", "sunshine", "princess", "login", "passw0rd", "shadow",
  "trustno1", "000000", "qwertyuiop", "1q2w3e4r", "password1", "zaq12wsx",
]);

// 10 billion guesses/second: an offline attack against a fast unsalted hash on a GPU rig.
const GUESSES_PER_SECOND = 1e10;

function poolOf(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  return pool;
}

/** Number of characters that belong to a repeated run (aaa) or a sequence (abc, 321). */
function patternChars(pw) {
  let n = 0;
  for (let i = 2; i < pw.length; i++) {
    const a = pw.charCodeAt(i - 2);
    const b = pw.charCodeAt(i - 1);
    const c = pw.charCodeAt(i);
    const repeat = a === b && b === c;
    const seq = (b - a === 1 && c - b === 1) || (b - a === -1 && c - b === -1);
    if (repeat || seq) n++;
  }
  return n;
}

export function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds > 1e18) return "centuries beyond counting";
  if (seconds < 1) return "instantly";
  const units = [
    ["year", 31557600],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const v = Math.floor(seconds / size);
      if (name === "year" && v >= 1e9) return "billions of years";
      if (name === "year" && v >= 1e6) return `${Math.floor(v / 1e6)} million years`;
      if (name === "year" && v >= 1e3) return `${Math.floor(v / 1e3).toLocaleString("en-US")} thousand years`;
      return `${v} ${name}${v === 1 ? "" : "s"}`;
    }
  }
  return "instantly";
}

export function estimateStrength(pw) {
  if (!pw) return { bits: 0, level: 0, label: "Enter a password", crackTime: "", warnings: [] };

  const warnings = [];
  const lower = pw.toLowerCase();
  let bits;

  if (COMMON.has(lower)) {
    bits = 5;
    warnings.push("This is one of the most commonly used passwords.");
  } else {
    const pool = poolOf(pw);
    const patterned = patternChars(pw);
    const effectiveLen = Math.max(1, pw.length - patterned);
    bits = effectiveLen * Math.log2(Math.max(pool, 2));
    if (patterned > 0) warnings.push("Contains repeated or sequential characters.");
    if (pw.length < 12) warnings.push("Shorter than 12 characters.");
    if (/^[a-zA-Z]+$/.test(pw)) warnings.push("Only letters; add numbers or symbols, or make it longer.");
    if (/^[0-9]+$/.test(pw)) warnings.push("Only digits.");
    if (new Set(pw).size < pw.length / 2) warnings.push("Many repeated characters.");
  }

  const crackSeconds = 2 ** bits / 2 / GUESSES_PER_SECOND; // average case: half the space
  let level, label;
  if (bits < 28) [level, label] = [1, "Very weak"];
  else if (bits < 40) [level, label] = [2, "Weak"];
  else if (bits < 60) [level, label] = [3, "Fair"];
  else if (bits < 80) [level, label] = [4, "Strong"];
  else [level, label] = [5, "Very strong"];

  return { bits, level, label, crackTime: formatDuration(crackSeconds), warnings };
}
