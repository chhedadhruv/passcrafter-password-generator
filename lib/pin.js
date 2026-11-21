import { randomInt } from "./password";

export const MIN_PIN = 4;
export const MAX_PIN = 12;

function isWeak(pin) {
  if (/^(\d)\1+$/.test(pin)) return true; // 1111
  const d = [...pin].map(Number);
  // Differences are taken modulo 10 so runs that wrap past 9/0 (7890, 3210) count too.
  const step = (d[1] - d[0] + 10) % 10;
  if ((step === 1 || step === 9) && d.every((v, i) => i === 0 || (v - d[i - 1] + 10) % 10 === step)) {
    return true; // 1234, 9876, 7890
  }
  return false;
}

/** Random numeric PIN. With avoidWeak, repeated and sequential PINs are rejected. */
export function generatePin(length = 6, { avoidWeak = true } = {}) {
  if (!Number.isInteger(length) || length < MIN_PIN || length > MAX_PIN) {
    throw new RangeError(`length must be an integer from ${MIN_PIN} to ${MAX_PIN}`);
  }
  for (;;) {
    let pin = "";
    for (let i = 0; i < length; i++) pin += randomInt(10);
    if (!avoidWeak || !isWeak(pin)) return pin;
  }
}
