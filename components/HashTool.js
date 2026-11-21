"use client";
import { useEffect, useState } from "react";
import { ALGORITHMS, hashText } from "../lib/hash";
import CopyButton from "./CopyButton";

export default function HashTool() {
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(ALGORITHMS.map(async (a) => [a, await hashText(a, text)])).then((pairs) => {
      if (!cancelled) setHashes(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <section className="card p-5 sm:p-6" aria-label="Hash generator">
      <label htmlFor="hash-input" className="mb-2 block font-bold">
        Text to hash
      </label>
      <textarea
        id="hash-input"
        className="field mb-6 min-h-[7rem] font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder="Type or paste text"
      />
      <div className="space-y-4">
        {ALGORITHMS.map((a) => (
          <div key={a}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-bold text-text-secondary">{a}</span>
              <CopyButton text={hashes[a] || ""} variant="outline" className="btn-sm" />
            </div>
            <code className="block min-h-[2.5rem] break-all rounded-xl border border-border bg-bg p-2.5 font-mono text-xs sm:text-sm">
              {hashes[a] || ""}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}
