export const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hex digest of a UTF-8 string using the Web Crypto API. */
export async function hashText(algorithm, text) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`Unsupported algorithm: ${algorithm}`);
  const data = new TextEncoder().encode(text);
  return toHex(await globalThis.crypto.subtle.digest(algorithm, data));
}
