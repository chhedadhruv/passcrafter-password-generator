import { describe, it, expect } from "vitest";
import { memoryStorage } from "./storage";
import { createVault, unlockVault, vaultExists, VaultError } from "./vault";
import { decryptJSON, deriveKey, encryptJSON, fromB64, toB64 } from "./crypto";
import { parseCsv, csvToEntries, entriesToCsv } from "./csv";

const ITER = { iterations: 1000 }; // fast for tests; the default (600k) is used in the app
const MASTER = "correct horse battery";

const sample = {
  label: "GitHub",
  site: "https://github.com",
  username: "dhruv",
  password: "s3cr3t!Pass",
  notes: "work",
};

async function fresh() {
  const storage = memoryStorage();
  const session = await createVault(storage, MASTER, ITER);
  return { storage, session };
}

describe("crypto", () => {
  it("round-trips and rejects wrong key / tampering / wrong aad", async () => {
    const salt = new Uint8Array(16);
    const key = await deriveKey("pw-one-pw-one", salt, 1000);
    const other = await deriveKey("pw-two-pw-two", salt, 1000);
    const box = await encryptJSON(key, { a: 1 }, "id1");
    expect(await decryptJSON(key, box, "id1")).toEqual({ a: 1 });
    await expect(decryptJSON(other, box, "id1")).rejects.toThrow();
    await expect(decryptJSON(key, box, "id2")).rejects.toThrow();
    const bytes = fromB64(box.ct);
    bytes[0] ^= 1;
    await expect(decryptJSON(key, { iv: box.iv, ct: toB64(bytes) }, "id1")).rejects.toThrow();
  });
  it("uses a fresh IV every time", async () => {
    const key = await deriveKey("pw-one-pw-one", new Uint8Array(16), 1000);
    const ivs = new Set();
    for (let i = 0; i < 50; i++) ivs.add((await encryptJSON(key, {}, "x")).iv);
    expect(ivs.size).toBe(50);
  });
  it("rejects out-of-range iteration counts", async () => {
    await expect(deriveKey("x", new Uint8Array(16), 10)).rejects.toThrow(RangeError);
    await expect(deriveKey("x", new Uint8Array(16), 1e9)).rejects.toThrow(RangeError);
  });
});

describe("vault", () => {
  it("creates, adds, lists, updates and removes", async () => {
    const { session } = await fresh();
    const e = await session.add(sample);
    expect((await session.list())[0]).toMatchObject(sample);
    await session.update(e.id, { password: "newer-password" });
    expect((await session.list())[0].password).toBe("newer-password");
    await session.remove(e.id);
    expect(await session.list()).toHaveLength(0);
  });

  it("stores no plaintext", async () => {
    const { storage, session } = await fresh();
    await session.add(sample);
    const dump = JSON.stringify([await storage.getMeta(), await storage.getAll()]);
    for (const v of Object.values(sample)) expect(dump).not.toContain(v);
    expect(dump).not.toContain(MASTER);
  });

  it("unlocks with the right password and rejects the wrong one", async () => {
    const { storage, session } = await fresh();
    await session.add(sample);
    const again = await unlockVault(storage, MASTER);
    expect(await again.list()).toHaveLength(1);
    await expect(unlockVault(storage, "wrong password!!")).rejects.toMatchObject({ code: "WRONG_PASSWORD" });
  });

  it("locks", async () => {
    const { session } = await fresh();
    session.lock();
    expect(session.locked).toBe(true);
    await expect(session.list()).rejects.toMatchObject({ code: "LOCKED" });
    await expect(session.add(sample)).rejects.toMatchObject({ code: "LOCKED" });
  });

  it("enforces master length and single vault", async () => {
    const storage = memoryStorage();
    await expect(createVault(storage, "short", ITER)).rejects.toMatchObject({ code: "WEAK_MASTER" });
    await createVault(storage, MASTER, ITER);
    expect(await vaultExists(storage)).toBe(true);
    await expect(createVault(storage, MASTER, ITER)).rejects.toMatchObject({ code: "EXISTS" });
  });

  it("rejects empty entries", async () => {
    const { session } = await fresh();
    await expect(session.add({})).rejects.toBeInstanceOf(VaultError);
  });

  it("skips records that fail to decrypt instead of failing the list", async () => {
    const { storage, session } = await fresh();
    await session.add(sample);
    const [r] = await storage.getAll();
    await storage.put({ ...r, id: "bad", ct: r.ct }); // ciphertext bound to a different id
    expect(await session.list()).toHaveLength(1);
    expect(session.failed).toBe(1);
  });

  it("detects swapped ciphertexts between ids", async () => {
    const { storage, session } = await fresh();
    const a = await session.add(sample);
    const b = await session.add({ ...sample, label: "Other" });
    const all = await storage.getAll();
    const ra = all.find((r) => r.id === a.id);
    const rb = all.find((r) => r.id === b.id);
    await storage.put({ id: a.id, iv: rb.iv, ct: rb.ct });
    const list = await session.list();
    expect(list.map((e) => e.id)).toEqual([b.id]);
    expect(session.failed).toBe(1);
    expect(ra).toBeDefined();
  });
});

describe("encrypted backup", () => {
  it("round-trips between two vaults with different master passwords", async () => {
    const { session: a } = await fresh();
    await a.add(sample);
    await a.add({ ...sample, label: "Two", password: "p2-password" });
    const backup = JSON.parse(JSON.stringify(await a.exportBackup()));

    const b = await createVault(memoryStorage(), "another master pw", ITER);
    const res = await b.importBackup(backup, MASTER);
    expect(res).toEqual({ added: 2, updated: 0, skipped: 0 });
    expect((await b.list()).map((e) => e.label).sort()).toEqual(["GitHub", "Two"]);
  });

  it("rejects the wrong backup password and non-backup files", async () => {
    const { session } = await fresh();
    await session.add(sample);
    const backup = await session.exportBackup();
    const b = await createVault(memoryStorage(), "another master pw", ITER);
    await expect(b.importBackup(backup, "wrong password!!")).rejects.toMatchObject({ code: "WRONG_PASSWORD" });
    await expect(b.importBackup({ hello: 1 }, MASTER)).rejects.toMatchObject({ code: "INVALID" });
  });

  it("merges by id, keeping the newer entry, and is idempotent", async () => {
    const { session } = await fresh();
    const e = await session.add(sample);
    const backup = JSON.parse(JSON.stringify(await session.exportBackup()));
    expect(await session.importBackup(backup, MASTER)).toEqual({ added: 0, updated: 0, skipped: 1 });
    await session.update(e.id, { notes: "edited later" });
    expect((await session.importBackup(backup, MASTER)).skipped).toBe(1);
    expect((await session.list())[0].notes).toBe("edited later");
  });

  it("rejects hostile iteration counts in a backup", async () => {
    const { session } = await fresh();
    const backup = JSON.parse(JSON.stringify(await session.exportBackup()));
    backup.kdf.iterations = 4_000_000_000;
    await expect(session.importBackup(backup, MASTER)).rejects.toThrow(RangeError);
  });
});

describe("csv", () => {
  it("parses quotes, commas, newlines, CRLF and BOM", () => {
    const rows = parseCsv('﻿name,note\r\n"a, b","line1\nline2 ""q"""\r\nc,d\r\n');
    expect(rows).toEqual([
      ["name", "note"],
      ["a, b", 'line1\nline2 "q"'],
      ["c", "d"],
    ]);
  });

  it("maps Chrome, Bitwarden and 1Password headers", () => {
    const chrome = csvToEntries(parseCsv("name,url,username,password,note\nGH,https://gh,u,p1,n1"));
    expect(chrome.entries[0]).toEqual({ label: "GH", site: "https://gh", username: "u", password: "p1", notes: "n1" });

    const bw = csvToEntries(
      parseCsv(
        "folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password,login_totp\n,,login,BW,note,,0,https://bw,bu,bp,"
      )
    );
    expect(bw.entries[0]).toMatchObject({ label: "BW", site: "https://bw", username: "bu", password: "bp", notes: "note" });

    const op = csvToEntries(parseCsv("Title,Url,Username,Password,Notes\nOP,https://op,ou,op1,on"));
    expect(op.entries[0]).toMatchObject({ label: "OP", password: "op1" });
  });

  it("reports a clear error without a password column", () => {
    expect(csvToEntries(parseCsv("a,b\n1,2")).error).toMatch(/password column/);
    expect(csvToEntries(parseCsv("name,password")).error).toMatch(/no data/);
  });

  it("guards formula injection in text columns but never alters passwords", () => {
    const csv = entriesToCsv([
      { label: "=HYPERLINK(1)", site: "+x", username: "@u", password: "-p=ss+word@", notes: "ok" },
    ]);
    const lines = csv.trim().split("\r\n");
    expect(lines[1]).toBe("'=HYPERLINK(1),'+x,'@u,-p=ss+word@,ok");
  });

  it("round-trips through export and import, including awkward characters", () => {
    const original = [
      { label: "=weird", site: "https://a.com", username: "u,1", password: '-p"w\nd', notes: "multi\nline" },
      { label: "Plain", site: "", username: "", password: "x", notes: "" },
    ];
    const { entries } = csvToEntries(parseCsv(entriesToCsv(original)));
    expect(entries).toEqual(original);
  });
});

describe("csv into vault", () => {
  it("imports entries and skips exact duplicates", async () => {
    const { session } = await fresh();
    await session.add(sample);
    const { entries } = csvToEntries(
      parseCsv("name,url,username,password,note\nGitHub,https://github.com,dhruv,s3cr3t!Pass,work\nNew,https://n.com,me,pw1,")
    );
    expect(await session.importEntries(entries)).toEqual({ added: 1, skipped: 1 });
    expect(await session.list()).toHaveLength(2);
  });
});
