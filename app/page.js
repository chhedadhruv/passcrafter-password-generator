import Link from "next/link";
import { Code2, Cpu, EyeOff, Lock, ShieldCheck, WifiOff, UserX } from "lucide-react";
import PasswordGenerator from "../components/PasswordGenerator";
import ToolIcon from "../components/ToolIcon";
import { Accordion, Container, Eyebrow, Prose, TextLink } from "../components/ui";
import { SITE } from "../lib/site";
import { TOOLS } from "../lib/tools";

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

const faqs = [
  {
    q: "Are the passwords generated here safe to use?",
    a: "Yes. Passwords are created in your browser with the Web Crypto API (crypto.getRandomValues), the same secure source browsers use for encryption keys. They are never sent to or stored on a server.",
  },
  {
    q: "How long should my password be?",
    a: "Use at least 16 characters for important accounts. Length matters more than complexity: every extra character multiplies the work an attacker needs.",
  },
  {
    q: "Should I include symbols?",
    a: "Symbols widen the pool of possible characters, which adds strength per character. If a site rejects them, make the password longer instead.",
  },
  {
    q: "Why not reuse one strong password?",
    a: "If one site is breached, attackers try the same password on your other accounts. Use a unique password for every account and keep them in a password manager.",
  },
];

const TRUST = [
  {
    icon: Cpu,
    title: "Cryptographically secure",
    body: "Characters come from your browser's secure random generator, with unbiased sampling, so every option is equally likely.",
  },
  {
    icon: EyeOff,
    title: "Nothing leaves your device",
    body: "Generation, strength checks and your vault all run locally. We never see, send or store your passwords.",
  },
  {
    icon: Code2,
    title: "Open source",
    body: "The code is public, so you can read exactly how every password and every encrypted vault entry is made.",
    href: SITE.repo,
    cta: "View the source",
  },
];

const STEPS = [
  { n: "1", title: "Pick your settings", body: "Choose a length and which character types to include. Strength updates as you go." },
  { n: "2", title: "Generate locally", body: "A new password is made instantly in your browser. Regenerate until you like it." },
  { n: "3", title: "Copy or save it", body: "Copy it, or send it straight to your encrypted vault with one click." },
];

export default function Home() {
  const toolCards = TOOLS.filter((t) => t.path !== "/");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${SITE.name} Password Generator`,
        url: SITE.url + "/",
        description: SITE.description,
        applicationCategory: "SecurityApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="overflow-hidden">
        <Container className="grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1fr_1fr] lg:pt-20">
          <div className="min-w-0">
            <Eyebrow>Free · Private · Open source</Eyebrow>
            <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              A random password generator that never leaves your browser.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-secondary">
              Create strong, unique passwords in a click. Everything is generated on your device with
              cryptographically secure randomness, so nobody else ever sees them.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "Secure randomness" },
                { icon: WifiOff, label: "Works offline" },
                { icon: UserX, label: "No account needed" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="chip">
                  <Icon size={14} aria-hidden="true" className="text-primary-text" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div id="generator" className="relative min-w-0 scroll-mt-24">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 -bottom-6 top-10 -z-10 rounded-full bg-primary/25 blur-3xl"
            />
            <PasswordGenerator />
          </div>
        </Container>
      </section>

      {/* Trust */}
      <section>
        <Container className="py-14">
          <div className="grid gap-5 md:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, body, href, cta }) => (
              <div key={title} className="card p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-primary-text">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h2 className="text-xl">{title}</h2>
                <p className="mt-2 text-text-secondary">{body}</p>
                {href && (
                  <a href={href} className="mt-3 inline-block font-bold text-primary-text hover:underline">
                    {cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tools */}
      <section className="bg-surface/60">
        <Container className="py-20">
          <Eyebrow>The toolkit</Eyebrow>
          <h2 className="max-w-2xl text-3xl sm:text-4xl">More than a generator.</h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Everything you need to create, check and keep your passwords safe, all free and all running
            in your browser.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {toolCards.map((t) => (
              <li key={t.path}>
                <Link
                  href={t.path}
                  className="card flex h-full flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <ToolIcon path={t.path} />
                  <span>
                    <span className="block font-heading text-xl font-bold">{t.name}</span>
                    <span className="mt-1.5 block text-text-secondary">{t.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/vault/"
                className="flex h-full flex-col gap-4 rounded-card bg-primary p-6 text-on-primary shadow-glow transition hover:-translate-y-0.5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-on-primary/15">
                  <Lock size={22} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-xl font-bold">Encrypted Vault</span>
                  <span className="mt-1.5 block opacity-90">
                    Save passwords locally, encrypted with AES-256. No account required.
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section>
        <Container className="py-20">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-2xl text-3xl sm:text-4xl">From zero to a strong password in seconds.</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="tabular font-heading text-4xl font-bold text-primary-text">{s.n}</span>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-2 text-text-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Explainer (SEO copy) */}
      <section className="bg-surface/60">
        <Container className="grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Password basics</Eyebrow>
            <h2 className="text-3xl sm:text-4xl">What makes a password strong?</h2>
          </div>
          <Prose>
            <p>
              Strength comes from unpredictability and length. A password made of random characters
              cannot be guessed from patterns, names or dictionary words, and each additional character
              multiplies the number of guesses an attacker needs. The meter on the generator shows an
              entropy estimate in bits: aim for 80 or more for accounts that matter.
            </p>
            <h3>How this generator works</h3>
            <p>
              Characters are chosen with your browser&apos;s cryptographically secure random number
              generator, using unbiased sampling so every character is equally likely. Each character type
              you enable is guaranteed to appear at least once, and the result is shuffled. Nothing leaves
              your device.
            </p>
            <h3>Good habits</h3>
            <ul>
              <li>Use a different password for every account.</li>
              <li>Store them in a password manager so you only remember one strong master passphrase.</li>
              <li>
                Want something you can remember? Try the{" "}
                <Link href="/passphrase-generator/">passphrase generator</Link>.
              </li>
              <li>
                Wondering about an old password? Use the <Link href="/breach-checker/">breach checker</Link>{" "}
                and <Link href="/password-strength-checker/">strength checker</Link>.
              </li>
              <li>
                Learn more in our <Link href="/guides/">password security guides</Link>.
              </li>
            </ul>
          </Prose>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-20">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mb-8 text-3xl sm:text-4xl">Common questions</h2>
          <div className="max-w-3xl">
            <Accordion items={faqs} />
          </div>
          <div className="mt-6">
            <TextLink href="/faq/">Read all FAQs</TextLink>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="pb-4 text-center">
          <div className="card mx-auto max-w-3xl p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl">Make your next password a strong one.</h2>
            <p className="mx-auto mt-4 max-w-xl text-text-secondary">
              Generate it here, keep it in your private vault, and never reuse it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#generator" className="btn-primary">
                Generate a password
              </a>
              <Link href="/vault/" className="btn-outline">
                Open the vault
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
