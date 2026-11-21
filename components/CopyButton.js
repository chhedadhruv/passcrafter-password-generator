"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "Copy", className = "", variant = "primary" }) {
  const [status, setStatus] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        disabled={!text}
        className={`${variant === "outline" ? "btn-outline" : "btn-primary"} ${className}`}
      >
        {status === "Copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {status === "Copied" ? "Copied" : label}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status}
      </span>
    </>
  );
}
