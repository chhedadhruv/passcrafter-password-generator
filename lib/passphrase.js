import { randomInt } from "./password";

/** Parse the EFF dice-format list ("11111<TAB>abacus") into an array of words. */
export function parseWordlist(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length === 2 && /^[1-6]{5}$/.test(parts[0]))
    .map((parts) => parts[1]);
}

export const MIN_WORDS = 3;
export const MAX_WORDS = 12;

/**
 * options: { words, separator, capitalize, includeNumber }
 * Returns the passphrase string.
 */
export function generatePassphrase(wordlist, options = {}) {
  const { words = 5, separator = "-", capitalize = false, includeNumber = false } = options;
  if (!Array.isArray(wordlist) || wordlist.length < 2) {
    throw new Error("A wordlist is required");
  }
  if (!Number.isInteger(words) || words < MIN_WORDS || words > MAX_WORDS) {
    throw new RangeError(`words must be an integer from ${MIN_WORDS} to ${MAX_WORDS}`);
  }

  const picked = Array.from({ length: words }, () => {
    const w = wordlist[randomInt(wordlist.length)];
    return capitalize ? w[0].toUpperCase() + w.slice(1) : w;
  });

  if (includeNumber) {
    // Append a digit to a random word so the number's position isn't predictable.
    const i = randomInt(words);
    picked[i] += String(randomInt(10));
  }
  return picked.join(separator);
}

/** Entropy in bits: each word is uniform over the list; the digit adds log2(10 * words). */
export function passphraseEntropy(listSize, options = {}) {
  const { words = 5, includeNumber = false } = options;
  let bits = words * Math.log2(listSize);
  if (includeNumber) bits += Math.log2(10 * words);
  return bits;
}
