import {
  DEFAULT_ITERATIONS,
  checkIterations,
  decryptJSON,
  deriveKey,
  deriveKeyBytes,
  encryptJSON,
  fromB64,
  importKeyBytes,
  randomBytes,
  toB64,
} from "./crypto";

export const BACKUP_FORMAT = "passcrafter-vault";
export const BACKUP_VERSION = 1;
export const MIN_MASTER_LENGTH = 10;

const CHECK_AAD = "passcrafter:check";
// `apps` (comma-separated Android package names) lets mobile autofill remember which app uses an entry.
// The website ignores it but preserves it through edits and backups.
const LIMITS = { label: 200, site: 2000, username: 500, password: 1000, notes: 10000, apps: 2000 };
const MAX_ROTATE_DAYS = 3650;

export class VaultError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // WRONG_PASSWORD | LOCKED | EXISTS | WEAK_MASTER | INVALID | NOT_FOUND
  }
}

/** Coerce arbitrary input into a clean entry; throws INVALID if there is nothing useful. */
export function normalizeEntry(input) {
  const out = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    const v = input?.[field];
    out[field] = typeof v === "string" ? v.slice(0, max) : "";
  }
  if (!out.label.trim() && !out.site.trim() && !out.password) {
    throw new VaultError("INVALID", "An entry needs a label, a site or a password.");
  }
  // Optional change-reminder fields, omitted when absent so old entries and backups stay valid.
  // passwordChangedAt: when the password last changed (ms). rotateDays: reminder period in days;
  // absent = use the client's default, 0 = never remind for this entry.
  if (Number.isFinite(input?.passwordChangedAt) && input.passwordChangedAt >= 0) {
    out.passwordChangedAt = input.passwordChangedAt;
  }
  if (Number.isInteger(input?.rotateDays) && input.rotateDays >= 0 && input.rotateDays <= MAX_ROTATE_DAYS) {
    out.rotateDays = input.rotateDays;
  }
  return out;
}

export async function vaultExists(storage) {
  return (await storage.getMeta()) !== null;
}

export async function createVault(storage, masterPassword, { iterations = DEFAULT_ITERATIONS } = {}) {
  if (await vaultExists(storage)) throw new VaultError("EXISTS", "A vault already exists.");
  if (typeof masterPassword !== "string" || masterPassword.length < MIN_MASTER_LENGTH) {
    throw new VaultError("WEAK_MASTER", `Master password must be at least ${MIN_MASTER_LENGTH} characters.`);
  }
  checkIterations(iterations);
  const salt = randomBytes(16);
  const key = await deriveKey(masterPassword, salt, iterations);
  const check = await encryptJSON(key, { ok: true }, CHECK_AAD);
  await storage.setMeta({
    version: BACKUP_VERSION,
    kdf: { name: "PBKDF2-SHA256", salt: toB64(salt), iterations },
    check,
  });
  return makeSession(storage, key);
}

function assertMeta(meta) {
  if (!meta?.kdf || meta.kdf.name !== "PBKDF2-SHA256" || !meta.check) {
    throw new VaultError("INVALID", "Unrecognised vault data.");
  }
}

async function verifyKey(meta, key) {
  try {
    await decryptJSON(key, meta.check, CHECK_AAD);
  } catch {
    throw new VaultError("WRONG_PASSWORD", "Incorrect master password.");
  }
  return key;
}

async function keyFromMeta(meta, masterPassword) {
  assertMeta(meta);
  const key = await deriveKey(masterPassword, fromB64(meta.kdf.salt), meta.kdf.iterations);
  return verifyKey(meta, key);
}

/**
 * Derive the vault's raw key bytes from the master password (verified against the vault's check
 * value). For hosts that store the key in OS secure storage to enable biometric unlock/autofill.
 */
export async function deriveVaultKeyBytes(storage, masterPassword) {
  const meta = await storage.getMeta();
  if (!meta) throw new VaultError("NOT_FOUND", "No vault exists yet.");
  assertMeta(meta);
  const bytes = await deriveKeyBytes(masterPassword, fromB64(meta.kdf.salt), meta.kdf.iterations);
  await verifyKey(meta, await importKeyBytes(bytes));
  return bytes;
}

/** Unlock with previously derived key bytes (e.g. released by a biometric prompt). */
export async function unlockVaultWithKeyBytes(storage, keyBytes) {
  const meta = await storage.getMeta();
  if (!meta) throw new VaultError("NOT_FOUND", "No vault exists yet.");
  assertMeta(meta);
  return makeSession(storage, await verifyKey(meta, await importKeyBytes(keyBytes)));
}

export async function unlockVault(storage, masterPassword) {
  const meta = await storage.getMeta();
  if (!meta) throw new VaultError("NOT_FOUND", "No vault exists yet.");
  return makeSession(storage, await keyFromMeta(meta, masterPassword));
}

function makeSession(storage, initialKey) {
  let key = initialKey;
  const requireKey = () => {
    if (!key) throw new VaultError("LOCKED", "Vault is locked.");
    return key;
  };

  const session = {
    failed: 0, // records that could not be decrypted during the last list()

    get locked() {
      return key === null;
    },

    /** Drop the key reference. After this every operation throws LOCKED. */
    lock() {
      key = null;
    },

    async list() {
      const k = requireKey();
      const records = await storage.getAll();
      const entries = [];
      let failed = 0;
      for (const r of records) {
        try {
          entries.push({ id: r.id, ...(await decryptJSON(k, r, r.id)) });
        } catch {
          failed++;
        }
      }
      session.failed = failed;
      return entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    },

    async add(input, { id = globalThis.crypto.randomUUID(), createdAt, updatedAt } = {}) {
      const k = requireKey();
      const now = Date.now();
      const entry = { ...normalizeEntry(input), createdAt: createdAt ?? now, updatedAt: updatedAt ?? now };
      // A new entry's password is as old as the entry (imports/backups keep their own value).
      if (entry.passwordChangedAt === undefined) entry.passwordChangedAt = entry.createdAt;
      await storage.put({ id, ...(await encryptJSON(k, entry, id)) });
      return { id, ...entry };
    },

    async update(id, patch) {
      const k = requireKey();
      const record = (await storage.getAll()).find((r) => r.id === id);
      if (!record) throw new VaultError("NOT_FOUND", "Entry not found.");
      const current = await decryptJSON(k, record, id);
      const now = Date.now();
      // Built from the merge alone (not spread over `current`) so a field cleared in the patch,
      // such as rotateDays: undefined, is really cleared.
      const entry = {
        ...normalizeEntry({ ...current, ...patch }),
        createdAt: current.createdAt,
        updatedAt: now,
      };
      // Changing the password restarts its age; editing notes, labels or the reminder does not.
      if (entry.password !== current.password && !("passwordChangedAt" in patch)) {
        entry.passwordChangedAt = now;
      }
      await storage.put({ id, ...(await encryptJSON(k, entry, id)) });
      return { id, ...entry };
    },

    async remove(id) {
      requireKey();
      await storage.remove(id);
    },

    /** Add entries from another source (e.g. CSV), skipping exact duplicates. */
    async importEntries(inputs) {
      const existing = await session.list();
      const seen = new Set(existing.map(dupKey));
      let added = 0;
      let skipped = 0;
      for (const input of inputs) {
        let clean;
        try {
          clean = normalizeEntry(input);
        } catch {
          skipped++;
          continue;
        }
        if (seen.has(dupKey(clean))) {
          skipped++;
          continue;
        }
        seen.add(dupKey(clean));
        await session.add(clean);
        added++;
      }
      return { added, skipped };
    },

    /** The encrypted backup: KDF params + ciphertext only, safe to store anywhere. */
    async exportBackup() {
      requireKey();
      const meta = await storage.getMeta();
      return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        kdf: meta.kdf,
        check: meta.check,
        records: await storage.getAll(),
      };
    },

    /** Merge an encrypted backup (protected by `backupPassword`) into this vault. */
    async importBackup(backup, backupPassword) {
      requireKey();
      if (
        backup?.format !== BACKUP_FORMAT ||
        backup.version !== BACKUP_VERSION ||
        !Array.isArray(backup.records)
      ) {
        throw new VaultError("INVALID", "This is not a PassCrafter backup file.");
      }
      const backupKey = await keyFromMeta(backup, backupPassword);
      const existing = new Map((await session.list()).map((e) => [e.id, e]));
      let added = 0;
      let updated = 0;
      let skipped = 0;
      for (const r of backup.records) {
        let entry;
        try {
          if (typeof r.id !== "string") throw new Error();
          entry = await decryptJSON(backupKey, r, r.id);
          entry = { ...normalizeEntry(entry), createdAt: entry.createdAt, updatedAt: entry.updatedAt };
        } catch {
          skipped++;
          continue;
        }
        const have = existing.get(r.id);
        if (!have) {
          await session.add(entry, { id: r.id, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
          added++;
        } else if ((entry.updatedAt || 0) > (have.updatedAt || 0)) {
          await session.add(entry, { id: r.id, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
          updated++;
        } else {
          skipped++;
        }
      }
      return { added, updated, skipped };
    },
  };
  return session;
}

const dupKey = (e) => JSON.stringify([e.site, e.username, e.password]);
