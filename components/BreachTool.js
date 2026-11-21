"use client";
import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { pwnedCount } from "../lib/breach";

export default function BreachTool() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState({ phase: "idle" });

  async function check(e) {
    e.preventDefault();
    if (!pw) return;
    setState({ phase: "loading" });
    try {
      setState({ phase: "done", count: await pwnedCount(pw) });
    } catch {
      setState({ phase: "error" });
    }
  }

  return (
    <section className="card p-5 sm:p-6" aria-label="Password breach checker">
      <form onSubmit={check}>
        <label htmlFor="breach-pw" className="mb-2 block font-bold">
          Password to check
        </label>
        <div className="mb-4 flex gap-2">
          <input
            id="breach-pw"
            className="field font-mono"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setState({ phase: "idle" });
            }}
            autoComplete="off"
            spellCheck={false}
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
        <button type="submit" disabled={!pw || state.phase === "loading"} className="btn-primary">
          {state.phase === "loading" ? "Checking…" : "Check password"}
        </button>
      </form>

      <div role="status" aria-live="polite" className="mt-5">
        {state.phase === "done" && state.count > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4">
            <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={22} aria-hidden="true" />
            <p className="font-bold text-danger">
              Found in {state.count.toLocaleString("en-US")} known breaches. Don&apos;t use this password
              anywhere.
            </p>
          </div>
        )}
        {state.phase === "done" && state.count === 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
            <ShieldCheck className="mt-0.5 shrink-0 text-success" size={22} aria-hidden="true" />
            <p className="font-bold text-success">
              Not found in known breaches. That doesn&apos;t guarantee it&apos;s strong, so check its
              strength too.
            </p>
          </div>
        )}
        {state.phase === "error" && (
          <p role="alert" className="text-danger">
            The breach lookup failed. Check your connection and try again.
          </p>
        )}
      </div>

      <p className="mt-5 text-sm text-text-secondary">
        Your password is hashed in your browser. Only the first 5 characters of that hash are sent to the
        Have I Been Pwned range API, never the password itself.
      </p>
    </section>
  );
}
