import { hashText } from "./hash";

const RANGE_API = "https://api.pwnedpasswords.com/range/";

/** Parse the "SUFFIX:COUNT" lines returned by the range API into a Map. */
export function parseRange(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const [suffix, count] = line.trim().split(":");
    if (suffix && count !== undefined) map.set(suffix.toUpperCase(), Number(count));
  }
  return map;
}

/**
 * k-anonymity check against Have I Been Pwned. Only the first 5 characters of the
 * SHA-1 hash leave the browser; the full password and hash never do.
 * Returns the number of times the password appears in known breaches (0 = not found).
 */
export async function pwnedCount(password, fetchImpl = fetch) {
  const hash = (await hashText("SHA-1", password)).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetchImpl(RANGE_API + prefix, { headers: { "Add-Padding": "true" } });
  if (!res.ok) throw new Error(`Breach lookup failed (${res.status})`);
  const range = parseRange(await res.text());
  return range.get(suffix) || 0;
}
