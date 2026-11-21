// Pure, framework-free password generation using the Web Crypto API.
// Works in browsers, extensions, and Node 19+ (globalThis.crypto).

export const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.<>?",
};

const AMBIGUOUS = /[0O1lI|`'"]/g;

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 128;

/** Uniform random integer in [0, max) using rejection sampling (no modulo bias). */
export function randomInt(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) {
    throw new RangeError("max must be an integer in (0, 2^32]");
  }
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  let n;
  do {
    globalThis.crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return n % max;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a password.
 * options: { length, lowercase, uppercase, numbers, symbols, excludeAmbiguous }
 * Guarantees at least one character from every enabled set.
 */
export function generatePassword(options = {}) {
  const {
    length = 16,
    lowercase = true,
    uppercase = false,
    numbers = false,
    symbols = false,
    excludeAmbiguous = false,
  } = options;

  const len = Number(length);
  if (!Number.isInteger(len) || len < MIN_LENGTH || len > MAX_LENGTH) {
    throw new RangeError(`length must be an integer from ${MIN_LENGTH} to ${MAX_LENGTH}`);
  }

  const enabled = { lowercase, uppercase, numbers, symbols };
  const sets = Object.entries(enabled)
    .filter(([, on]) => on)
    .map(([name]) => {
      const chars = CHARSETS[name];
      return excludeAmbiguous ? chars.replace(AMBIGUOUS, "") : chars;
    });

  if (sets.length === 0) {
    throw new Error("Select at least one character set");
  }

  const pool = sets.join("");
  const chars = sets.map((set) => set[randomInt(set.length)]);
  while (chars.length < len) {
    chars.push(pool[randomInt(pool.length)]);
  }
  return shuffle(chars).join("");
}

/** Size of the character pool for the given options (for entropy estimates). */
export function poolSize(options = {}) {
  const { lowercase, uppercase, numbers, symbols, excludeAmbiguous } = options;
  const enabled = { lowercase, uppercase, numbers, symbols };
  return Object.entries(enabled)
    .filter(([, on]) => on)
    .map(([name]) => {
      const chars = CHARSETS[name];
      return (excludeAmbiguous ? chars.replace(AMBIGUOUS, "") : chars).length;
    })
    .reduce((a, b) => a + b, 0);
}

/** Entropy in bits of a random password of `length` drawn from a pool of `size`. */
export function entropyBits(length, size) {
  return size > 1 ? length * Math.log2(size) : 0;
}

export function strengthLabel(bits) {
  if (bits < 40) return { label: "Weak", level: 1 };
  if (bits < 60) return { label: "Fair", level: 2 };
  if (bits < 80) return { label: "Strong", level: 3 };
  return { label: "Very strong", level: 4 };
}
