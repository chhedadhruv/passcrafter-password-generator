"use client";
import { useCallback, useEffect, useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import {
  generatePassword,
  poolSize,
  entropyBits,
  strengthLabel,
  MIN_LENGTH,
  MAX_LENGTH,
} from "../lib/password";
import { stashPendingPassword } from "../lib/vault/handoff";
import CopyButton from "./CopyButton";

const OPTIONS = [
  { key: "lowercase", label: "Lowercase", hint: "a–z" },
  { key: "uppercase", label: "Uppercase", hint: "A–Z" },
  { key: "numbers", label: "Numbers", hint: "0–9" },
  { key: "symbols", label: "Symbols", hint: "!@#$" },
];

const LEVEL_COLOR = ["", "bg-danger", "bg-amber-500", "bg-success", "bg-primary"];

// `onSaveToVault(password)` lets a host (the Chrome extension popup) handle "Save to vault"
// itself. Without it, the password is handed to the /vault/ page.
export default function PasswordGenerator({ onSaveToVault } = {}) {
  const [opts, setOpts] = useState({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const regenerate = useCallback(() => {
    setPassword(generatePassword(opts));
  }, [opts]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  function toggle(key) {
    const next = { ...opts, [key]: !opts[key] };
    // Always keep at least one character set enabled.
    if (!next.lowercase && !next.uppercase && !next.numbers && !next.symbols) {
      setStatus("At least one character type must stay selected.");
      return;
    }
    setStatus("");
    setOpts(next);
  }

  function saveToVault() {
    if (stashPendingPassword(password)) {
      if (onSaveToVault) onSaveToVault(password);
      else window.location.assign("/vault/");
    } else {
      setStatus("Couldn't hand the password to the vault. Copy it and add it there instead.");
    }
  }

  const bits = entropyBits(opts.length, poolSize(opts));
  const { label, level } = strengthLabel(bits);

  return (
    <section className="card p-5 sm:p-6" aria-label="Password generator">
      <div
        className="mb-3 min-h-[4.5rem] break-all rounded-xl border border-border bg-bg p-4 font-mono text-xl leading-snug sm:text-2xl"
        data-testid="password"
      >
        {password}
      </div>

      <div className="mb-5 flex items-center gap-3 text-sm">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= level ? LEVEL_COLOR[level] : "bg-border"}`}
            />
          ))}
        </div>
        <span className="tabular whitespace-nowrap font-bold text-text-secondary">
          {label} · {Math.round(bits)} bits
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <CopyButton text={password} className="flex-1 sm:flex-none" />
        <button type="button" onClick={regenerate} className="btn-outline flex-1 sm:flex-none">
          <RefreshCw size={16} aria-hidden="true" />
          Regenerate
        </button>
        <button type="button" onClick={saveToVault} className="btn-outline flex-1 sm:flex-none">
          <Lock size={16} aria-hidden="true" />
          Save to vault
        </button>
      </div>

      <p role="status" aria-live="polite" className="mb-2 min-h-[1.25rem] text-sm text-text-secondary">
        {status}
      </p>

      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="length" className="font-bold">
            Length
          </label>
          <output htmlFor="length" className="tabular rounded-full bg-surface-muted px-3 py-0.5 text-sm font-bold text-primary-text">
            {opts.length}
          </output>
        </div>
        <input
          id="length"
          type="range"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          value={opts.length}
          onChange={(e) => setOpts({ ...opts, length: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <fieldset>
        <legend className="mb-2 font-bold">Characters</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OPTIONS.map(({ key, label, hint }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                opts[key] ? "border-primary bg-primary/10" : "border-border bg-bg"
              }`}
            >
              <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)} className="check" />
              <span>
                <span className="block font-bold">{label}</span>
                <span className="block font-mono text-xs text-text-secondary">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={opts.excludeAmbiguous}
            onChange={() => toggle("excludeAmbiguous")}
            className="check"
          />
          Avoid look-alike characters (0 O 1 l I)
        </label>
      </fieldset>
    </section>
  );
}
