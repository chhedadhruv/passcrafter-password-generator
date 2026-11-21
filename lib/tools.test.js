import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseWordlist, generatePassphrase, passphraseEntropy } from "./passphrase";
import { generatePin } from "./pin";
import { generateUsername } from "./username";
import { estimateStrength, formatDuration } from "./strength";
import { hashText } from "./hash";
import { parseRange, pwnedCount } from "./breach";

const wordlist = parseWordlist(readFileSync("public/wordlists/eff_large_wordlist.txt", "utf8"));

describe("passphrase", () => {
  it("parses the EFF list", () => {
    expect(wordlist).toHaveLength(7776);
    expect(wordlist[0]).toBe("abacus");
  });
  it("generates the requested number of words", () => {
    const p = generatePassphrase(wordlist, { words: 6, separator: " " });
    expect(p.split(" ")).toHaveLength(6);
    expect(p.split(" ").every((w) => wordlist.includes(w))).toBe(true);
  });
  it("capitalizes and adds a digit", () => {
    const p = generatePassphrase(wordlist, { words: 4, capitalize: true, includeNumber: true });
    expect(p).toMatch(/^[A-Z]/);
    expect(p).toMatch(/\d/);
  });
  it("validates and computes entropy", () => {
    expect(() => generatePassphrase(wordlist, { words: 1 })).toThrow(RangeError);
    expect(passphraseEntropy(7776, { words: 5 })).toBeCloseTo(64.6, 1);
  });
});

describe("pin", () => {
  it("has the right length and digits only", () => {
    for (let i = 0; i < 200; i++) expect(generatePin(6)).toMatch(/^\d{6}$/);
  });
  it("avoids weak PINs by default", () => {
    for (let i = 0; i < 3000; i++) {
      const pin = generatePin(4);
      expect(pin).not.toMatch(/^(\d)\1+$/);
      expect(["1234", "4321", "2345", "3456", "7890", "0123"]).not.toContain(pin);
    }
  });
  it("validates length", () => {
    expect(() => generatePin(3)).toThrow(RangeError);
  });
});

describe("username", () => {
  it("matches each style", () => {
    expect(generateUsername({ style: "camel", digits: 2 })).toMatch(/^[a-z]+[A-Z][a-z]+\d{2}$/);
    expect(generateUsername({ style: "snake", digits: 2 })).toMatch(/^[a-z]+_[a-z]+_\d{2}$/);
    expect(generateUsername({ style: "lower", digits: 0 })).toMatch(/^[a-z]+$/);
  });
  it("rejects bad options", () => {
    expect(() => generateUsername({ style: "x" })).toThrow();
    expect(() => generateUsername({ digits: 9 })).toThrow(RangeError);
  });
});

describe("strength", () => {
  it("flags common passwords", () => {
    const r = estimateStrength("Password");
    expect(r.level).toBe(1);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("penalizes sequences and repeats", () => {
    expect(estimateStrength("abcdefgh1234").bits).toBeLessThan(estimateStrength("kqzvmxwpt7y2").bits);
    expect(estimateStrength("aaaaaaaaaaaa").level).toBeLessThanOrEqual(2);
  });
  it("rates long random strings highly", () => {
    expect(estimateStrength("vK9#mQ2$xL7!pR4@wT8&").level).toBe(5);
  });
  it("handles empty input and formats durations", () => {
    expect(estimateStrength("").level).toBe(0);
    expect(formatDuration(0.2)).toBe("instantly");
    expect(formatDuration(90)).toBe("1 minute");
  });
});

describe("hash", () => {
  it("matches known digests", async () => {
    expect(await hashText("SHA-256", "abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(await hashText("SHA-1", "abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });
  it("rejects unsupported algorithms", async () => {
    await expect(hashText("MD5", "x")).rejects.toThrow();
  });
});

describe("breach", () => {
  it("parses range responses", () => {
    const m = parseRange("ABC:3\r\nDEF:0\r\n");
    expect(m.get("ABC")).toBe(3);
    expect(m.get("DEF")).toBe(0);
  });
  it("sends only a 5-char prefix and finds the suffix", async () => {
    // SHA-1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    let requested;
    const fake = async (url) => {
      requested = url;
      return { ok: true, text: async () => "1E4C9B93F3F0682250B6CF8331B7EE68FD8:12345\r\nAAAA:1" };
    };
    expect(await pwnedCount("password", fake)).toBe(12345);
    expect(requested).toBe("https://api.pwnedpasswords.com/range/5BAA6");
  });
  it("returns 0 when not found and throws on HTTP errors", async () => {
    expect(await pwnedCount("x", async () => ({ ok: true, text: async () => "ZZZ:1" }))).toBe(0);
    await expect(pwnedCount("x", async () => ({ ok: false, status: 503 }))).rejects.toThrow();
  });
});
