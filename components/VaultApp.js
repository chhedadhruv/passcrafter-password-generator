"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Lock, Plus, Search, ShieldAlert, Upload } from "lucide-react";
import { indexedDbStorage } from "../lib/vault/storage";
import { createVault, unlockVault, vaultExists, MIN_MASTER_LENGTH } from "../lib/vault/vault";
import { MAX_CSV_BYTES, csvToEntries, entriesToCsv, parseCsv } from "../lib/vault/csv";
import { estimateStrength } from "../lib/strength";
import { generatePassword } from "../lib/password";
import { PENDING_KEY } from "../lib/vault/handoff";

const IDLE_LOCK_MS = 5 * 60 * 1000;
const CLIPBOARD_CLEAR_MS = 30 * 1000;

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

function ErrorText({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mb-3 text-sm font-bold text-danger">
      {children}
    </p>
  );
}

// consumeSignal: increment to tell an already-unlocked vault to pick up a password stashed by
//   the generator (used by the extension popup, where both live on one page).
// autoClearClipboard: set false where timers can't be trusted to run (a popup closes).
export default function VaultApp({ consumeSignal = 0, autoClearClipboard = true } = {}) {
  const storageRef = useRef(null);
  const sessionRef = useRef(null);
  const clipboardToken = useRef(0);

  const [phase, setPhase] = useState("loading"); // loading | unsupported | create | locked | ready
  const [entries, setEntries] = useState([]);
  const [failed, setFailed] = useState(0);
  const [editing, setEditing] = useState(null); // null | "new" | entry
  const [prefill, setPrefill] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        storageRef.current = indexedDbStorage();
        setPhase((await vaultExists(storageRef.current)) ? "locked" : "create");
      } catch {
        setPhase("unsupported");
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    const list = await sessionRef.current.list();
    setEntries(list);
    setFailed(sessionRef.current.failed);
  }, []);

  const lock = useCallback((message = "") => {
    sessionRef.current?.lock();
    sessionRef.current = null;
    setEntries([]);
    setEditing(null);
    setPrefill("");
    setNotice(message);
    setPhase("locked");
  }, []);

  // A password handed over from the generator ("Save to vault") opens the add form.
  function consumePending() {
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_KEY);
        setPrefill(pending);
        setEditing("new");
      }
    } catch {}
  }

  async function enter(session) {
    sessionRef.current = session;
    await refresh();
    setNotice("");
    setPhase("ready");
    consumePending();
  }

  useEffect(() => {
    if (phase === "ready" && consumeSignal > 0) consumePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumeSignal]);

  // Auto-lock after inactivity.
  useEffect(() => {
    if (phase !== "ready") return;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => lock("Locked after 5 minutes of inactivity."), IDLE_LOCK_MS);
    };
    const events = ["pointerdown", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [phase, lock]);

  async function copyPassword(text) {
    try {
      await navigator.clipboard.writeText(text);
      if (!autoClearClipboard) {
        setNotice("Copied. Clear your clipboard when you're done.");
        return;
      }
      const token = ++clipboardToken.current;
      setNotice("Copied. The clipboard will be cleared in 30 seconds.");
      setTimeout(() => {
        if (clipboardToken.current === token) navigator.clipboard.writeText("").catch(() => {});
      }, CLIPBOARD_CLEAR_MS);
    } catch {
      setNotice("Couldn't access the clipboard.");
    }
  }

  if (phase === "loading") return <p className="text-text-secondary">Loading…</p>;
  if (phase === "unsupported") {
    return (
      <p role="alert" className="card p-5 text-danger">
        This browser can&apos;t store a vault (IndexedDB is unavailable, which can happen in private
        windows). Try a normal window.
      </p>
    );
  }
  if (phase === "create") {
    return <CreateForm onCreate={async (pw) => enter(await createVault(storageRef.current, pw))} />;
  }
  if (phase === "locked") {
    return (
      <UnlockForm
        notice={notice}
        onUnlock={async (pw) => enter(await unlockVault(storageRef.current, pw))}
        onErase={async () => {
          await storageRef.current.clear();
          setNotice("");
          setPhase("create");
        }}
      />
    );
  }

  const q = query.trim().toLowerCase();
  const shown = q
    ? entries.filter((e) => [e.label, e.site, e.username].some((v) => v?.toLowerCase().includes(q)))
    : entries;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setPrefill("");
            setEditing("new");
          }}
        >
          <Plus size={16} aria-hidden="true" />
          Add entry
        </button>
        <button type="button" className="btn-outline" onClick={() => lock()}>
          <Lock size={16} aria-hidden="true" />
          Lock now
        </button>
        <div className="relative min-w-[12rem] flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            className="field pl-10"
            type="search"
            placeholder="Search label, site or username"
            aria-label="Search entries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <p role="status" aria-live="polite" className="mb-3 min-h-[1.25rem] text-sm text-text-secondary">
        {notice}
      </p>
      {failed > 0 && (
        <p role="alert" className="mb-3 text-sm font-bold text-danger">
          {failed} stored {failed === 1 ? "entry" : "entries"} couldn&apos;t be decrypted and{" "}
          {failed === 1 ? "is" : "are"} hidden.
        </p>
      )}

      {editing && (
        <EntryForm
          key={editing === "new" ? "new" : editing.id}
          entry={editing === "new" ? { password: prefill } : editing}
          isNew={editing === "new"}
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            if (editing === "new") await sessionRef.current.add(data);
            else await sessionRef.current.update(editing.id, data);
            setEditing(null);
            setPrefill("");
            await refresh();
          }}
        />
      )}

      {entries.length === 0 && !editing && (
        <div className="card p-8 text-center text-text-secondary">
          Your vault is empty. Add an entry, or import passwords below.
        </div>
      )}

      <ul className="space-y-3">
        {shown.map((e) => (
          <EntryRow
            key={e.id}
            entry={e}
            onCopy={() => copyPassword(e.password)}
            onEdit={() => setEditing(e)}
            onDelete={async () => {
              await sessionRef.current.remove(e.id);
              await refresh();
            }}
          />
        ))}
      </ul>
      {q && shown.length === 0 && entries.length > 0 && <p className="text-text-secondary">No matches.</p>}

      <DataTools
        entries={entries}
        onImported={async (msg) => {
          await refresh();
          setNotice(msg);
        }}
        session={() => sessionRef.current}
      />
    </div>
  );
}

function CreateForm({ onCreate }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const s = estimateStrength(pw);

  async function submit(e) {
    e.preventDefault();
    if (pw !== confirm) return setError("The passwords don't match.");
    if (!ack) return setError("Please confirm you understand the master password can't be recovered.");
    setBusy(true);
    setError("");
    try {
      await onCreate(pw);
    } catch (err) {
      setError(err.message || "Couldn't create the vault.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-xl p-5 sm:p-6">
      <h2 className="mb-2 text-2xl">Create your vault</h2>
      <p className="mb-5 text-text-secondary">
        Choose a master password. Your entries are encrypted with a key derived from it, and everything
        stays in this browser.
      </p>
      <label htmlFor="m1" className="mb-2 block font-bold">
        Master password (at least {MIN_MASTER_LENGTH} characters)
      </label>
      <input id="m1" type="password" className="field mb-1" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
      {pw && (
        <p className="mb-3 text-sm text-text-secondary">
          Strength: <strong className="text-text">{s.label}</strong>. Tip: a 6-word passphrase from the{" "}
          <a href="/passphrase-generator/" className="font-bold text-primary-text underline">
            passphrase generator
          </a>{" "}
          works well.
        </p>
      )}
      <label htmlFor="m2" className="mb-2 mt-4 block font-bold">
        Confirm master password
      </label>
      <input id="m2" type="password" className="field mb-5" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg p-3 text-sm">
        <input type="checkbox" className="check mt-0.5" checked={ack} onChange={() => setAck(!ack)} />
        <span>
          I understand that if I forget this master password, my vault <strong>cannot be recovered</strong>,
          and that it exists only in this browser on this device.
        </span>
      </label>
      <ErrorText>{error}</ErrorText>
      <button type="submit" disabled={busy || pw.length < MIN_MASTER_LENGTH} className="btn-primary">
        {busy ? "Creating…" : "Create vault"}
      </button>
    </form>
  );
}

function UnlockForm({ onUnlock, onErase, notice }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [sure, setSure] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onUnlock(pw);
    } catch (err) {
      setError(err.code === "WRONG_PASSWORD" ? "Incorrect master password." : err.message || "Couldn't unlock.");
      setBusy(false);
    }
  }

  return (
    <div className="card max-w-xl p-5 sm:p-6">
      <form onSubmit={submit}>
        <h2 className="mb-2 text-2xl">Unlock your vault</h2>
        {notice && (
          <p role="status" className="mb-3 text-text-secondary">
            {notice}
          </p>
        )}
        <label htmlFor="unlock" className="mb-2 mt-3 block font-bold">
          Master password
        </label>
        <input id="unlock" type="password" className="field mb-4" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus />
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy || !pw} className="btn-primary">
          {busy ? "Unlocking…" : "Unlock"}
        </button>
      </form>

      <div className="mt-6 border-t border-border pt-4 text-sm text-text-secondary">
        {!erasing ? (
          <button type="button" className="font-bold underline" onClick={() => setErasing(true)}>
            Forgot your master password?
          </button>
        ) : (
          <div>
            <p className="mb-3">
              There is no recovery: the data is encrypted with a key only your password can produce. You
              can erase this vault and start over (or import an encrypted backup into a new one).
            </p>
            <label className="mb-3 flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="check" checked={sure} onChange={() => setSure(!sure)} />
              Permanently erase all data in this vault
            </label>
            <button type="button" disabled={!sure} onClick={onErase} className="btn-danger btn-sm">
              Erase vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryForm({ entry, isNew, onSave, onCancel }) {
  const [f, setF] = useState({
    label: entry.label || "",
    site: entry.site || "",
    username: entry.username || "",
    password: entry.password || "",
    notes: entry.notes || "",
  });
  const [show, setShow] = useState(isNew);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const s = estimateStrength(f.password);

  async function submit(e) {
    e.preventDefault();
    try {
      await onSave(f);
    } catch (err) {
      setError(err.message || "Couldn't save.");
    }
  }

  return (
    <form onSubmit={submit} className="card mb-5 p-5 sm:p-6">
      <h2 className="mb-4 text-2xl">{isNew ? "Add entry" : "Edit entry"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-label" className="mb-2 block font-bold">Label</label>
          <input id="f-label" className="field" value={f.label} onChange={set("label")} />
        </div>
        <div>
          <label htmlFor="f-site" className="mb-2 block font-bold">Site</label>
          <input id="f-site" className="field" value={f.site} onChange={set("site")} placeholder="https://" />
        </div>
        <div>
          <label htmlFor="f-user" className="mb-2 block font-bold">Username</label>
          <input id="f-user" className="field" value={f.username} onChange={set("username")} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="f-pass" className="mb-2 block font-bold">Password</label>
          <div className="flex gap-2">
            <input id="f-pass" className="field font-mono" type={show ? "text" : "password"} value={f.password} onChange={set("password")} autoComplete="off" spellCheck={false} />
            <button type="button" className="btn-outline" aria-pressed={show} onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
            <button
              type="button"
              className="font-bold text-primary-text underline"
              onClick={() => setF({ ...f, password: generatePassword({ length: 20, lowercase: true, uppercase: true, numbers: true, symbols: true }) })}
            >
              Generate strong password
            </button>
            {f.password && <span>· {s.label}</span>}
          </div>
        </div>
      </div>
      <label htmlFor="f-notes" className="mb-2 mt-4 block font-bold">Notes</label>
      <textarea id="f-notes" className="field mb-5 min-h-[5rem]" value={f.notes} onChange={set("notes")} />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function EntryRow({ entry, onCopy, onEdit, onDelete }) {
  const [reveal, setReveal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const title = entry.label || entry.site || "(untitled)";
  return (
    <li className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-heading text-lg font-bold">{title}</p>
          {entry.site && entry.label && <p className="break-all text-sm text-text-secondary">{entry.site}</p>}
          {entry.username && <p className="break-all text-sm text-text-secondary">{entry.username}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline btn-sm" aria-pressed={reveal} onClick={() => setReveal(!reveal)}>
            {reveal ? "Hide" : "Reveal"}
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={onCopy}>
            Copy password
          </button>
          <button type="button" className="btn-outline btn-sm" onClick={onEdit}>
            Edit
          </button>
          {!confirming ? (
            <button type="button" className="btn-outline btn-sm" onClick={() => setConfirming(true)}>
              Delete
            </button>
          ) : (
            <>
              <button type="button" className="btn-danger btn-sm" onClick={onDelete}>
                Confirm delete
              </button>
              <button type="button" className="btn-outline btn-sm" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </>
          )}
        </div>
      </div>
      {reveal && (
        <p className="mt-3 break-all rounded-xl border border-border bg-bg p-3 font-mono text-sm">{entry.password}</p>
      )}
      {reveal && entry.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{entry.notes}</p>}
    </li>
  );
}

function DataTools({ entries, session, onImported }) {
  const [panel, setPanel] = useState(null); // null | { type: "csv-export" } | { type: "csv-import", entries } | { type: "backup-import", backup }
  const [error, setError] = useState("");
  const [backupPw, setBackupPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function exportBackup() {
    setError("");
    try {
      const backup = await session().exportBackup();
      download(`passcrafter-backup-${today()}.json`, JSON.stringify(backup, null, 2), "application/json");
    } catch {
      setError("Couldn't create the backup.");
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBackupPw("");
    if (file.size > MAX_CSV_BYTES) return setError("That file is too large (5 MB maximum).");
    const text = await file.text();
    if (/\.json$/i.test(file.name) || text.trimStart().startsWith("{")) {
      try {
        const backup = JSON.parse(text);
        if (backup?.format !== "passcrafter-vault") throw new Error();
        setPanel({ type: "backup-import", backup });
      } catch {
        setError("That isn't a valid PassCrafter backup file.");
      }
    } else {
      const { entries: parsed, error: csvError } = csvToEntries(parseCsv(text));
      if (csvError) return setError(csvError);
      setPanel({ type: "csv-import", entries: parsed });
    }
  }

  async function confirmCsvImport() {
    setBusy(true);
    try {
      const r = await session().importEntries(panel.entries);
      setPanel(null);
      await onImported(`Imported ${r.added} ${r.added === 1 ? "entry" : "entries"}; skipped ${r.skipped} (duplicates or empty rows).`);
    } catch {
      setError("Import failed.");
    }
    setBusy(false);
  }

  async function confirmBackupImport(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await session().importBackup(panel.backup, backupPw);
      setPanel(null);
      setBackupPw("");
      await onImported(`Backup imported: ${r.added} added, ${r.updated} updated, ${r.skipped} unchanged.`);
    } catch (err) {
      setError(err.code === "WRONG_PASSWORD" ? "Wrong master password for that backup." : err.message || "Import failed.");
    }
    setBusy(false);
  }

  return (
    <section className="card mt-10 p-5 sm:p-6" aria-label="Backup, import and export">
      <h2 className="mb-2 text-2xl">Backup, import and export</h2>
      <p className="mb-5 text-sm text-text-secondary">
        Your vault exists only in this browser. Download an encrypted backup regularly: clearing site data
        would otherwise delete it.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={exportBackup}>
          <Download size={16} aria-hidden="true" />
          Download encrypted backup
        </button>
        <label className="btn-outline cursor-pointer">
          <Upload size={16} aria-hidden="true" />
          Import backup or CSV
          <input type="file" accept=".json,.csv,text/csv,application/json" className="sr-only" onChange={onFile} />
        </label>
        <button type="button" className="btn-outline" disabled={entries.length === 0} onClick={() => setPanel({ type: "csv-export" })}>
          Export CSV…
        </button>
      </div>

      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>

      {panel?.type === "csv-export" && (
        <div className="mt-2 rounded-xl border border-danger/50 bg-danger/10 p-4">
          <p className="mb-3 flex items-start gap-2">
            <ShieldAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
            <span>
              <strong>Warning:</strong> a CSV file contains your passwords in <strong>plain text</strong>.
              Anyone who gets the file can read them. Delete it as soon as you have imported it elsewhere.
              The encrypted backup is the safer option.
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn bg-danger text-white hover:opacity-90"
              onClick={() => {
                download(`passcrafter-export-${today()}.csv`, entriesToCsv(entries), "text/csv");
                setPanel(null);
              }}
            >
              Download plain-text CSV
            </button>
            <button type="button" className="btn-outline" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel?.type === "csv-import" && (
        <div className="mt-2 rounded-xl border border-border bg-bg p-4">
          <p className="mb-2">
            Found <strong>{panel.entries.length}</strong> row{panel.entries.length === 1 ? "" : "s"}. Preview:
          </p>
          <ul className="mb-4 list-disc pl-5 text-sm text-text-secondary">
            {panel.entries.slice(0, 5).map((e, i) => (
              <li key={i} className="break-all">{e.label || e.site || "(untitled)"} {e.username && `· ${e.username}`}</li>
            ))}
            {panel.entries.length > 5 && <li>…and {panel.entries.length - 5} more</li>}
          </ul>
          <div className="flex gap-2">
            <button type="button" disabled={busy} className="btn-primary" onClick={confirmCsvImport}>
              {busy ? "Importing…" : "Import these entries"}
            </button>
            <button type="button" className="btn-outline" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel?.type === "backup-import" && (
        <form onSubmit={confirmBackupImport} className="mt-2 rounded-xl border border-border bg-bg p-4">
          <label htmlFor="bk-pw" className="mb-2 block font-bold">
            Master password the backup was made with
          </label>
          <input id="bk-pw" type="password" className="field mb-4" value={backupPw} onChange={(e) => setBackupPw(e.target.value)} autoComplete="off" autoFocus />
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !backupPw} className="btn-primary">
              {busy ? "Decrypting…" : "Import backup"}
            </button>
            <button type="button" className="btn-outline" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
