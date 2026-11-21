"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { estimateStrength } from "../lib/strength";

const BAR = ["bg-border", "bg-danger", "bg-orange-500", "bg-amber-500", "bg-success", "bg-primary"];

export default function StrengthTool() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const r = estimateStrength(pw);

  return (
    <section className="card p-5 sm:p-6" aria-label="Password strength checker">
      <label htmlFor="pw" className="mb-2 block font-bold">
        Password to check
      </label>
      <div className="mb-5 flex gap-2">
        <input
          id="pw"
          className="field font-mono"
          type={show ? "text" : "password"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          placeholder="Type or paste a password"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="btn-outline px-3.5"
        >
          {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="mb-3 flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${i <= r.level ? BAR[r.level] : "bg-border"}`}
          />
        ))}
      </div>

      <div role="status" aria-live="polite">
        <p className="font-heading text-2xl font-bold">{r.label}</p>
        {pw && (
          <>
            <p className="mt-1 text-text-secondary">
              <span className="tabular">≈ {Math.round(r.bits)} bits</span> · an offline attacker at 10
              billion guesses per second would need about <strong className="text-text">{r.crackTime}</strong>.
            </p>
            {r.warnings.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                {r.warnings.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <p className="mt-5 text-sm text-text-secondary">
        Checked locally in your browser. Nothing you type is sent anywhere.
      </p>
    </section>
  );
}
