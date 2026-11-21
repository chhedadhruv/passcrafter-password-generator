import Image from "next/image";
import Link from "next/link";
import { SITE, SOCIAL, PAGES } from "../lib/site";
import { TOOLS } from "../lib/tools";

const COLUMNS = [
  { title: "Tools", links: TOOLS.slice(0, 4).map((t) => ({ href: t.path, label: t.name })) },
  {
    title: "More tools",
    links: [...TOOLS.slice(4).map((t) => ({ href: t.path, label: t.name })), { href: "/vault/", label: "Encrypted Vault" }],
  },
  { title: "PassCrafter", links: PAGES.map((p) => ({ href: p.path, label: p.name })) },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/logo192.png" alt="" width={32} height={32} className="rounded-lg" />
            <span className="font-heading text-lg font-bold tracking-tight">{SITE.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-text-secondary">
            Strong passwords and security tools that run entirely in your browser. No accounts, no tracking.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { href: `mailto:${SITE.email}`, label: "Email" },
              { href: SITE.repo, label: "Source" },
              { href: SOCIAL.github, label: "GitHub" },
              { href: SOCIAL.linkedin, label: "LinkedIn" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm font-bold text-text-secondary hover:text-text"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h2 className="mb-3 font-sans text-sm font-bold tracking-normal text-text">{c.title}</h2>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-text-secondary hover:text-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-text-secondary">
        &copy; {new Date().getFullYear()} {SITE.name}. Made by {SITE.author}.
      </div>
    </footer>
  );
}
