"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { generatePin, MIN_PIN, MAX_PIN } from "../lib/pin";
import CopyButton from "./CopyButton";

export default function PinTool() {
  const [length, setLength] = useState(6);
  const [avoidWeak, setAvoidWeak] = useState(true);
  const [pin, setPin] = useState("");

  const regenerate = useCallback(() => setPin(generatePin(length, { avoidWeak })), [length, avoidWeak]);
  useEffect(regenerate, [regenerate]);

  return (
    <section className="card p-5 sm:p-6" aria-label="PIN generator">
      <div className="mb-5 rounded-xl border border-border bg-bg p-5 text-center font-mono text-4xl tracking-[0.3em] sm:text-5xl">
        {pin}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <CopyButton text={pin} className="flex-1 sm:flex-none" />
        <button type="button" onClick={regenerate} className="btn-outline flex-1 sm:flex-none">
          <RefreshCw size={16} aria-hidden="true" />
          Regenerate
        </button>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="pin-len" className="font-bold">
            Digits
          </label>
          <output htmlFor="pin-len" className="tabular rounded-full bg-surface-muted px-3 py-0.5 text-sm font-bold text-primary-text">
            {length}
          </output>
        </div>
        <input
          id="pin-len"
          type="range"
          min={MIN_PIN}
          max={MAX_PIN}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
      <label
        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
          avoidWeak ? "border-primary bg-primary/10" : "border-border bg-bg"
        }`}
      >
        <input type="checkbox" checked={avoidWeak} onChange={() => setAvoidWeak(!avoidWeak)} className="check" />
        Avoid repeated and sequential PINs (1111, 1234)
      </label>
    </section>
  );
}
