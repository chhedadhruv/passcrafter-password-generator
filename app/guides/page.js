import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, PageHero } from "../../components/ui";
import { GUIDES } from "../../lib/guides";

export const metadata = {
  title: "Password Security Guides",
  description:
    "Plain-language guides on creating strong passwords, passphrases, password managers, entropy and what to do after a data breach.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Guides"
        title="Password security, explained"
        lead="Short, practical guides to help you create, check and protect your passwords."
      />
      <Container className="pb-8">
        <ul className="grid gap-5 md:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}/`}
                className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <h2 className="text-xl">{g.title}</h2>
                <p className="mt-2 flex-1 text-text-secondary">{g.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-bold text-primary-text">
                  Read guide <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
