import Link from "next/link";
import { SITE } from "../lib/site";
import { TOOLS } from "../lib/tools";
import { guidesForTool } from "../lib/guides";
import ToolIcon from "./ToolIcon";
import { Accordion, Container, Eyebrow, PageHero, Prose } from "./ui";

/**
 * Shared layout for every tool page: hero, the interactive tool, explainer content,
 * FAQ, related tools, and JSON-LD (WebApplication + FAQPage + BreadcrumbList).
 */
export default function ToolPage({ path, name, intro, faqs = [], children, about }) {
  const url = SITE.url + path;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name,
        url,
        description: intro,
        applicationCategory: "SecurityApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero eyebrow="Free tool · runs in your browser" title={name} lead={intro} />

      <Container className="pb-6">
        <div className="max-w-3xl">{children}</div>
      </Container>

      {about && (
        <Container className="py-12">
          <Prose className="max-w-3xl">{about}</Prose>
        </Container>
      )}

      {faqs.length > 0 && (
        <section className="bg-surface/60">
          <Container className="py-16">
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="faq" className="mb-8 text-3xl">
              Frequently asked questions
            </h2>
            <div className="max-w-3xl">
              <Accordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} />
            </div>
          </Container>
        </section>
      )}

      {guidesForTool(path).length > 0 && (
        <Container className="pt-16">
          <Eyebrow>Learn more</Eyebrow>
          <h2 className="mb-8 text-3xl">Related guides</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {guidesForTool(path).map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}/`}
                  className="card block h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="block font-heading text-lg font-bold">{g.title}</span>
                  <span className="mt-1 block text-sm text-text-secondary">{g.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="py-16">
        <nav aria-label="Related tools">
          <Eyebrow>Keep going</Eyebrow>
          <h2 className="mb-8 text-3xl">More security tools</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((t) => t.path !== path).map((t) => (
              <li key={t.path}>
                <Link
                  href={t.path}
                  className="card flex h-full items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <ToolIcon path={t.path} />
                  <span>
                    <span className="block font-heading text-lg font-bold">{t.name}</span>
                    <span className="mt-1 block text-sm text-text-secondary">{t.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
