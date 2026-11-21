import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-text">{children}</p>
  );
}

export function PageHero({ eyebrow, title, lead }) {
  return (
    <Container className="pb-8 pt-14 sm:pt-20">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      {lead && <p className="mt-5 max-w-2xl text-lg text-text-secondary">{lead}</p>}
    </Container>
  );
}

/** Long-form copy: styles headings, links, lists and strong text. */
export function Prose({ children, className = "" }) {
  return (
    <div
      className={`space-y-4 text-base leading-relaxed text-text-secondary [&_a]:font-bold [&_a]:text-primary-text [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-text [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:text-text [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text ${className}`}
    >
      {children}
    </div>
  );
}

/** Native <details> accordion: no JavaScript, fully crawlable. */
export function Accordion({ items }) {
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {items.map((it) => (
        <details key={it.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
            {it.q}
            <span aria-hidden="true" className="text-xl text-primary-text transition group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-3 text-text-secondary">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

export function TextLink({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold text-primary-text hover:underline">
      {children} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
