import Link from "next/link";
import { Accordion, Container, Eyebrow, PageHero } from "../../components/ui";
import { SITE } from "../../lib/site";

export const metadata = {
  title: "FAQ",
  description:
    "Answers about PassCrafter: how passwords are generated, whether it's safe, how the encrypted vault works, and what happens to your data.",
  alternates: { canonical: "/faq/" },
};

const GROUPS = [
  {
    title: "Passwords",
    items: [
      {
        q: "How are the passwords generated?",
        a: "In your browser, using crypto.getRandomValues from the Web Crypto API with unbiased (rejection) sampling. Every character is equally likely, and each character type you enable is guaranteed to appear at least once.",
      },
      {
        q: "How long should a password be?",
        a: "At least 16 random characters for important accounts. Length matters more than complexity, because every extra character multiplies the work for an attacker.",
      },
      {
        q: "Passphrase or password?",
        a: "Both are strong if random. A passphrase of five or six random words is easier to remember and type, which makes it ideal for a master password. Use random character passwords for everything a password manager remembers for you.",
      },
      {
        q: "How accurate is the strength meter?",
        a: "It is an estimate based on length, character types and common patterns, assuming an offline attacker making 10 billion guesses per second. Real-world strength also depends on whether a password has leaked or is reused.",
      },
    ],
  },
  {
    title: "Privacy and safety",
    items: [
      {
        q: "Do you see or store my passwords?",
        a: "No. Generation, strength checks, hashing and the vault all run locally. There are no accounts and no servers that receive your passwords.",
      },
      {
        q: "How does the breach checker keep my password private?",
        a: "Your browser hashes the password with SHA-1 and sends only the first five characters of the hash to the Have I Been Pwned API. The matching happens in your browser, so the password and full hash never leave your device.",
      },
      {
        q: "Does PassCrafter work offline?",
        a: "Yes. After your first visit, the generators, strength checker, hash tool and vault work without a connection, and you can install the site as an app from your browser. The breach checker is the exception because it has to look up the Have I Been Pwned database online.",
      },
      {
        q: "Does PassCrafter use cookies or analytics?",
        a: "No. The only thing saved in your browser besides the vault is your light or dark theme preference. See the privacy policy for details.",
      },
    ],
  },
  {
    title: "The encrypted vault",
    items: [
      {
        q: "How is the vault encrypted?",
        a: "Entries are encrypted with AES-256-GCM using a key derived from your master password with PBKDF2-SHA256 (600,000 iterations). The key is held in memory only and dropped when the vault locks.",
      },
      {
        q: "What if I forget my master password?",
        a: "It can't be recovered. The data is encrypted with a key that only your password can produce and we never have it. You can erase the vault and start over, or restore from an encrypted backup into a new vault.",
      },
      {
        q: "Can I use my vault on another device?",
        a: "There is no cloud sync by design. Download an encrypted backup and import it on the other device. You'll need the master password the backup was made with.",
      },
      {
        q: "Can I import passwords from Chrome or another manager?",
        a: "Yes. The vault imports CSV exports from Chrome, Bitwarden and 1Password. CSV files hold passwords in plain text, so delete them once you've imported.",
      },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GROUPS.flatMap((g) => g.items).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        lead="How PassCrafter works, what it does with your data, and how to get the most out of it."
      />
      <Container className="pb-8">
        <div className="max-w-3xl space-y-12">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <Eyebrow>{g.title}</Eyebrow>
              <Accordion items={g.items} />
            </section>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-text-secondary">
          Still stuck? Email{" "}
          <a href={`mailto:${SITE.email}`} className="font-bold text-primary-text underline">
            {SITE.email}
          </a>{" "}
          or read the <Link href="/privacy/" className="font-bold text-primary-text underline">privacy policy</Link>.
        </p>
      </Container>
    </>
  );
}
