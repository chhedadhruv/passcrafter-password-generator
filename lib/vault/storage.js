// Storage adapters. Both hold only ciphertext and non-secret KDF parameters.
// Interface: getMeta(), setMeta(meta), getAll(), put(record), remove(id), clear()

/** In-memory adapter, used by tests. */
export function memoryStorage() {
  let meta = null;
  const records = new Map();
  return {
    async getMeta() {
      return meta;
    },
    async setMeta(m) {
      meta = m;
    },
    async getAll() {
      return [...records.values()];
    },
    async put(r) {
      records.set(r.id, r);
    },
    async remove(id) {
      records.delete(id);
    },
    async clear() {
      meta = null;
      records.clear();
    },
  };
}

const DB_NAME = "passcrafter-vault";
const META = "meta";
const ENTRIES = "entries";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore(META);
      db.createObjectStore(ENTRIES, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** IndexedDB adapter for the browser. */
export function indexedDbStorage() {
  const dbPromise = openDb();
  return {
    async getMeta() {
      return (await run(await dbPromise, META, "readonly", (s) => s.get("meta"))) || null;
    },
    async setMeta(m) {
      await run(await dbPromise, META, "readwrite", (s) => s.put(m, "meta"));
    },
    async getAll() {
      return run(await dbPromise, ENTRIES, "readonly", (s) => s.getAll());
    },
    async put(r) {
      await run(await dbPromise, ENTRIES, "readwrite", (s) => s.put(r));
    },
    async remove(id) {
      await run(await dbPromise, ENTRIES, "readwrite", (s) => s.delete(id));
    },
    async clear() {
      const db = await dbPromise;
      await run(db, META, "readwrite", (s) => s.clear());
      await run(db, ENTRIES, "readwrite", (s) => s.clear());
    },
  };
}
