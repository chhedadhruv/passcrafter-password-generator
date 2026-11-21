"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { SITE } from "../lib/site";
import { TOOLS } from "../lib/tools";
import ThemeToggle from "./ThemeToggle";
import ToolIcon from "./ToolIcon";

const LINKS = [
  { href: "/faq/", label: "FAQ" },
  { href: "/about/", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef(null);

  // Close menus on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  // Close the tools dropdown on outside click or Escape.
  useEffect(() => {
    if (!toolsOpen) return;
    const onClick = (e) => toolsRef.current && !toolsRef.current.contains(e.target) && setToolsOpen(false);
    const onKey = (e) => e.key === "Escape" && setToolsOpen(false);
    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsOpen]);

  const linkClass = (href) =>
    `text-sm font-bold hover:text-text ${pathname === href ? "text-text" : "text-text-secondary"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo192.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="font-heading text-lg font-bold tracking-tight">{SITE.name}</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          <li ref={toolsRef} className="relative">
            <button
              type="button"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 text-sm font-bold text-text-secondary hover:text-text"
            >
              Tools
              <ChevronDown size={15} aria-hidden="true" className={`transition ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-card border border-border bg-surface p-3 shadow-card">
                <ul className="grid grid-cols-2 gap-1">
                  {TOOLS.map((t) => (
                    <li key={t.path}>
                      <Link
                        href={t.path}
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-surface-muted"
                      >
                        <ToolIcon path={t.path} size={18} />
                        <span>
                          <span className="block text-sm font-bold">{t.name}</span>
                          <span className="block text-xs text-text-secondary">{t.blurb}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
          <li>
            <Link href="/vault/" className={linkClass("/vault/")}>
              Vault
            </Link>
          </li>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/vault/" className="btn-primary hidden sm:inline-flex">
            Open vault
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-bg px-4 pb-4 md:hidden">
          <p className="pb-1 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-primary-text">Tools</p>
          <ul>
            {TOOLS.map((t) => (
              <li key={t.path}>
                <Link href={t.path} className="flex items-center gap-3 py-2.5 font-bold">
                  <ToolIcon path={t.path} size={18} />
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-2 border-t border-border pt-2">
            {[{ href: "/vault/", label: "Vault" }, ...LINKS].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-2.5 font-bold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
