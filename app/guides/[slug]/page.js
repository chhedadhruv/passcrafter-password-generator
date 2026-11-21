import Link from "next/link";
import { notFound } from "next/navigation";
import Inline from "../../../components/Inline";
import ToolIcon from "../../../components/ToolIcon";
import { Container, Eyebrow, PageHero, Prose } from "../../../components/ui";
import { GUIDES, GUIDES_UPDATED, getGuide } from "../../../lib/guides";
import { SITE } from "../../../lib/site";
import { TOOLS } from "../../../lib/tools";

// With `output: "export"` every guide is prerendered from this list; any other slug is a 404.
// (Don't set `dynamicParams = false` here: Next 14's dev server rejects that with export.)
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  const path = `/guides/${guide.slug}/`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: { type: "article", title: `${guide.title} | PassCrafter`, description: guide.description, url: path },
  };
}

export default function GuidePage({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const url = `${SITE.url}/guides/${guide.slug}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: GUIDES_UPDATED,
        dateModified: GUIDES_UPDATED,
        author: { "@type": "Person", name: SITE.author },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: SITE.url + "/guides/" },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };

  const tools = TOOLS.filter((t) => guide.tools.includes(t.path));
  const more = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Guide" title={guide.title} lead={guide.intro} />

      <Container className="pb-8">
        <article className="max-w-3xl">
          <p className="mb-6 text-sm text-text-secondary">
            By {SITE.author} · Updated {new Date(GUIDES_UPDATED).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <Prose>
            {guide.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.body.map((b, i) =>
                  typeof b === "string" ? (
                    <p key={i} className="mt-4">
                      <Inline text={b} />
                    </p>
                  ) : (
                    <ul key={i} className="mt-4 space-y-1.5">
                      {b.ul.map((li, j) => (
                        <li key={j}>
                          <Inline text={li} />
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </section>
            ))}
          </Prose>
        </article>
      </Container>

      <Container className="py-12">
        <Eyebrow>Try it</Eyebrow>
        <h2 className="mb-6 text-3xl">Tools for this guide</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {tools.map((t) => (
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
      </Container>

      <Container className="pb-8">
        <Eyebrow>Keep reading</Eyebrow>
        <h2 className="mb-6 text-3xl">More guides</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {more.map((g) => (
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
    </>
  );
}
