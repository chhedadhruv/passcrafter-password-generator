// Web Crypto primitives for the vault. Framework-free so the Chrome extension can reuse it.
// Key derivation: PBKDF2-SHA256. Encryption: AES-256-GCM with a fresh random 96-bit IV per record.

export const DEFAULT_ITERATIONS = 600_000; // OWASP guidance for PBKDF2-HMAC-SHA256
export const MIN_ITERATIONS = 1_000; // lower bound only so tests/imports can't pass 0
export const MAX_ITERATIONS = 5_000_000; // stops a hostile backup from freezing the tab

const subtle = () => globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

export function toB64(bytes) {
  let s = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

export function fromB64(str) {
  const s = atob(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function randomBytes(n) {
  return globalThis.crypto.getRandomValues(new Uint8Array(n));
}

export function checkIterations(iterations) {
  if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) {
    throw new RangeError("Invalid key-derivation iteration count");
  }
}

/** Derive a non-extractable AES-GCM key from the master password. */
export async function deriveKey(password, salt, iterations) {
  checkIterations(iterations);
  const material = await subtle().importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable: JS can use the key but never read its bytes
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a JSON-serializable value. `aad` (additional authenticated data) binds the
 * ciphertext to its record id so records can't be swapped between ids undetected.
 */
export async function encryptJSON(key, value, aad) {
  const iv = randomBytes(12);
  const ct = await subtle().encrypt(
    { name: "AES-GCM", iv, additionalData: enc.encode(aad) },
    key,
    enc.encode(JSON.stringify(value))
  );
  return { iv: toB64(iv), ct: toB64(ct) };
}

/** Throws if the key is wrong or the data/aad was tampered with. */
export async function decryptJSON(key, { iv, ct }, aad) {
  const plain = await subtle().decrypt(
    { name: "AES-GCM", iv: fromB64(iv), additionalData: enc.encode(aad) },
    key,
    fromB64(ct)
  );
  return JSON.parse(dec.decode(plain));
}
