import { describe, it, expect } from "vitest";
import {
  generatePassword,
  randomInt,
  poolSize,
  entropyBits,
  strengthLabel,
  CHARSETS,
} from "./password";

describe("randomInt", () => {
  it("stays within range", () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
  });
  it("is roughly uniform", () => {
    const counts = new Array(5).fill(0);
    const N = 50000;
    for (let i = 0; i < N; i++) counts[randomInt(5)]++;
    for (const c of counts) expect(Math.abs(c - N / 5)).toBeLessThan(N * 0.02);
  });
  it("rejects bad input", () => {
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(1.5)).toThrow();
  });
});

describe("generatePassword", () => {
  it("has the requested length", () => {
    expect(generatePassword({ length: 8 })).toHaveLength(8);
    expect(generatePassword({ length: 128 })).toHaveLength(128);
  });
  it("includes every enabled set", () => {
    for (let i = 0; i < 200; i++) {
      const p = generatePassword({
        length: 8,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
      });
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[0-9]/);
      expect([...p].some((c) => CHARSETS.symbols.includes(c))).toBe(true);
    }
  });
  it("only uses enabled sets", () => {
    const p = generatePassword({ length: 64, lowercase: false, numbers: true });
    expect(p).toMatch(/^[0-9]+$/);
  });
  it("excludes ambiguous characters", () => {
    for (let i = 0; i < 100; i++) {
      const p = generatePassword({
        length: 64,
        uppercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });
      expect(p).not.toMatch(/[0O1lI|`'"]/);
    }
  });
  it("validates input", () => {
    expect(() => generatePassword({ length: 4 })).toThrow(RangeError);
    expect(() => generatePassword({ length: 200 })).toThrow(RangeError);
    expect(() => generatePassword({ lowercase: false })).toThrow();
  });
  it("accepts numeric strings for length", () => {
    expect(generatePassword({ length: "12" })).toHaveLength(12);
  });
  it("produces different outputs", () => {
    const set = new Set(Array.from({ length: 50 }, () => generatePassword({ length: 16 })));
    expect(set.size).toBe(50);
  });
});

describe("entropy", () => {
  it("computes pool size and bits", () => {
    expect(poolSize({ lowercase: true, numbers: true })).toBe(36);
    expect(entropyBits(10, 32)).toBeCloseTo(50);
    expect(entropyBits(10, 1)).toBe(0);
  });
  it("labels strength", () => {
    expect(strengthLabel(30).label).toBe("Weak");
    expect(strengthLabel(100).label).toBe("Very strong");
  });
});
