// On-device checks that the shared ../lib code behaves identically under Hermes + quick-crypto.
// Run from the (dev-only) self-test screen; results are also logged for adb/logcat.
import { hashText } from '@lib/hash';
import { generatePassword } from '@lib/password';
import { estimateStrength } from '@lib/strength';
import { decryptJSON, deriveKey, encryptJSON, fromB64, toB64 } from '@lib/vault/crypto';
import { csvToEntries, entriesToCsv, parseCsv } from '@lib/vault/csv';
import { memoryStorage } from '@lib/vault/storage';
import { createVault, unlockVault } from '@lib/vault/vault';

export type TestResult = { name: string; ok: boolean; detail: string; ms: number };

const FAST = { iterations: 1000 };

async function rejects(fn: () => Promise<unknown>) {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

const tests: [string, () => Promise<string | void>][] = [
  [
    'WebCrypto surface present',
    async () => {
      const c = globalThis.crypto as any;
      for (const k of ['subtle', 'getRandomValues', 'randomUUID']) {
        if (!c?.[k]) throw new Error(`crypto.${k} missing`);
      }
    },
  ],
  [
    'TextEncoder/TextDecoder and atob/btoa',
    async () => {
      const bytes = new TextEncoder().encode('héllo ✓');
      if (new TextDecoder().decode(bytes) !== 'héllo ✓') throw new Error('text round trip failed');
      if (atob(btoa('abc')) !== 'abc') throw new Error('base64 round trip failed');
      if (toB64(fromB64('AAEC')) !== 'AAEC') throw new Error('toB64/fromB64 mismatch');
    },
  ],
  [
    'SHA-256 known digest',
    async () => {
      const d = await hashText('SHA-256', 'abc');
      if (d !== 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad') throw new Error(d);
    },
  ],
  [
    'AES-GCM round trip with AAD; rejects wrong key, wrong AAD, tampering',
    async () => {
      const salt = new Uint8Array(16);
      const key = await deriveKey('pw-one-pw-one', salt, 1000);
      const other = await deriveKey('pw-two-pw-two', salt, 1000);
      const box = await encryptJSON(key, { a: 1 }, 'id1');
      const back = await decryptJSON(key, box, 'id1');
      if (back.a !== 1) throw new Error('round trip mismatch');
      if (!(await rejects(() => decryptJSON(other, box, 'id1')))) throw new Error('wrong key accepted');
      if (!(await rejects(() => decryptJSON(key, box, 'id2')))) throw new Error('wrong AAD accepted');
      const bytes = fromB64(box.ct);
      bytes[0] ^= 1;
      if (!(await rejects(() => decryptJSON(key, { iv: box.iv, ct: toB64(bytes) }, 'id1')))) {
        throw new Error('tampered ciphertext accepted');
      }
    },
  ],
  [
    'Key is non-extractable',
    async () => {
      const key = await deriveKey('pw-one-pw-one', new Uint8Array(16), 1000);
      if ((key as any).extractable !== false) throw new Error('key is extractable');
    },
  ],
  [
    'PBKDF2 at the production 600,000 iterations',
    async () => {
      const t = Date.now();
      await deriveKey('correct horse battery', new Uint8Array(16), 600_000);
      return `${Date.now() - t} ms`;
    },
  ],
  [
    'Vault: create, add, lock, unlock, wrong password',
    async () => {
      const storage = memoryStorage();
      const s = await createVault(storage, 'correct horse battery', FAST);
      await s.add({ label: 'GitHub', site: 'https://github.com', username: 'me', password: 'p@ss-w0rd', notes: 'n' });
      s.lock();
      if (!(await rejects(() => s.list()))) throw new Error('locked vault still lists');
      if (!(await rejects(() => unlockVault(storage, 'wrong password!!')))) throw new Error('wrong password accepted');
      const again = await unlockVault(storage, 'correct horse battery');
      const list = await again.list();
      if (list.length !== 1 || list[0].password !== 'p@ss-w0rd') throw new Error('entry not restored');
      const dump = JSON.stringify([await storage.getMeta(), await storage.getAll()]);
      if (dump.includes('p@ss-w0rd') || dump.includes('GitHub')) throw new Error('plaintext found in storage');
    },
  ],
  [
    'Vault: encrypted backup round trip across vaults',
    async () => {
      const a = await createVault(memoryStorage(), 'correct horse battery', FAST);
      await a.add({ label: 'One', password: 'pw-one' });
      await a.add({ label: 'Two', password: 'pw-two' });
      const backup = JSON.parse(JSON.stringify(await a.exportBackup()));
      const b = await createVault(memoryStorage(), 'another master pw', FAST);
      const res = await b.importBackup(backup, 'correct horse battery');
      if (res.added !== 2) throw new Error(JSON.stringify(res));
    },
  ],
  [
    'CSV import/export round trip',
    async () => {
      const original = [
        { label: '=weird', site: 'https://a.com', username: 'u,1', password: '-p"w\nd', notes: 'multi\nline' },
      ];
      const { entries } = csvToEntries(parseCsv(entriesToCsv(original)));
      if (JSON.stringify(entries) !== JSON.stringify(original)) throw new Error(JSON.stringify(entries));
    },
  ],
  [
    'Generator and strength estimator',
    async () => {
      const p = generatePassword({ length: 20, lowercase: true, uppercase: true, numbers: true, symbols: true });
      if (p.length !== 20) throw new Error('bad length');
      if (estimateStrength(p).level < 4) throw new Error('weak rating for random password');
      if (estimateStrength('password').level !== 1) throw new Error('common password not flagged');
    },
  ],
];

export async function runSelfTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const [name, fn] of tests) {
    const t = Date.now();
    try {
      const detail = (await fn()) ?? '';
      results.push({ name, ok: true, detail: String(detail), ms: Date.now() - t });
    } catch (e) {
      results.push({ name, ok: false, detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t });
    }
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`SELFTEST_RESULT ${JSON.stringify({ passed: results.length - failed, failed, results })}`);
  return results;
}
