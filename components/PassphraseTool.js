"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  parseWordlist,
  generatePassphrase,
  passphraseEntropy,
  MIN_WORDS,
  MAX_WORDS,
} from "../lib/passphrase";
import CopyButton from "./CopyButton";

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: " ", label: "Space" },
  { value: ".", label: "Period (.)" },
  { value: "_", label: "Underscore (_)" },
  { value: "", label: "None" },
];

export default function PassphraseTool() {
  const [wordlist, setWordlist] = useState(null);
  const [error, setError] = useState("");
  const [opts, setOpts] = useState({ words: 5, separator: "-", capitalize: false, includeNumber: false });
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    fetch("/wordlists/eff_large_wordlist.txt")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((t) => setWordlist(parseWordlist(t)))
      .catch(() => setError("Couldn't load the wordlist. Check your connection and reload."));
  }, []);

  const regenerate = useCallback(() => {
    if (wordlist) setPhrase(generatePassphrase(wordlist, opts));
  }, [wordlist, opts]);

  useEffect(regenerate, [regenerate]);

  const bits = wordlist ? passphraseEntropy(wordlist.length, opts) : 0;

  return (
    <section className="card p-5 sm:p-6" aria-label="Passphrase generator">
      {error && <p role="alert" className="mb-3 text-danger">{error}</p>}
      <div className="mb-2 min-h-[4.5rem] break-words rounded-xl border border-border bg-bg p-4 font-mono text-xl leading-snug sm:text-2xl">
        {phrase || (error ? "" : "Loading…")}
      </div>
      <p className="tabular mb-5 text-sm font-bold text-text-secondary">≈ {Math.round(bits)} bits of entropy</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <CopyButton text={phrase} className="flex-1 sm:flex-none" />
        <button type="button" onClick={regenerate} className="btn-outline flex-1 sm:flex-none">
          <RefreshCw size={16} aria-hidden="true" />
          Regenerate
        </button>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="words" className="font-bold">
            Words
          </label>
          <output htmlFor="words" className="tabular rounded-full bg-surface-muted px-3 py-0.5 text-sm font-bold text-primary-text">
            {opts.words}
          </output>
        </div>
        <input
          id="words"
          type="range"
          min={MIN_WORDS}
          max={MAX_WORDS}
          value={opts.words}
          onChange={(e) => setOpts({ ...opts, words: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="sep" className="mb-2 block font-bold">
          Separator
        </label>
        <select
          id="sep"
          className="field"
          value={opts.separator}
          onChange={(e) => setOpts({ ...opts, separator: e.target.value })}
        >
          {SEPARATORS.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { key: "capitalize", label: "Capitalize words" },
          { key: "includeNumber", label: "Add a number" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
              opts[key] ? "border-primary bg-primary/10" : "border-border bg-bg"
            }`}
          >
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={() => setOpts({ ...opts, [key]: !opts[key] })}
              className="check"
            />
            {label}
          </label>
        ))}
      </div>
    </section>
  );
}
