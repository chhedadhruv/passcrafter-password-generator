"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { generateUsername } from "../lib/username";
import CopyButton from "./CopyButton";

const STYLES = [
  { value: "camel", label: "camelCase (swiftOtter42)" },
  { value: "snake", label: "snake_case (swift_otter_42)" },
  { value: "lower", label: "lowercase (swiftotter42)" },
];

export default function UsernameTool() {
  const [style, setStyle] = useState("camel");
  const [digits, setDigits] = useState(2);
  const [names, setNames] = useState([]);

  const regenerate = useCallback(
    () => setNames(Array.from({ length: 6 }, () => generateUsername({ style, digits }))),
    [style, digits]
  );
  useEffect(regenerate, [regenerate]);

  return (
    <section className="card p-5 sm:p-6" aria-label="Username generator">
      <ul className="mb-4 space-y-2">
        {names.map((n, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg py-2 pl-4 pr-2 font-mono"
          >
            <span className="break-all">{n}</span>
            <CopyButton text={n} variant="outline" className="btn-sm shrink-0" />
          </li>
        ))}
      </ul>
      <button type="button" onClick={regenerate} className="btn-outline mb-6">
        <RefreshCw size={16} aria-hidden="true" />
        Generate more
      </button>

      <div className="mb-5">
        <label htmlFor="style" className="mb-2 block font-bold">
          Style
        </label>
        <select id="style" className="field" value={style} onChange={(e) => setStyle(e.target.value)}>
          {STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="digits" className="font-bold">
            Trailing digits
          </label>
          <output htmlFor="digits" className="tabular rounded-full bg-surface-muted px-3 py-0.5 text-sm font-bold text-primary-text">
            {digits}
          </output>
        </div>
        <input
          id="digits"
          type="range"
          min={0}
          max={4}
          value={digits}
          onChange={(e) => setDigits(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </section>
  );
}
