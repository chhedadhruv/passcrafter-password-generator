import Link from "next/link";
import { Code2, Gift, Lock, Scale } from "lucide-react";
import { Container, Eyebrow, PageHero, Prose, TextLink } from "../../components/ui";
import { SITE } from "../../lib/site";

export const metadata = {
  title: "About",
  description:
    "PassCrafter is a free, open-source toolkit for creating, checking and storing passwords, built on one rule: your secrets stay on your device.",
  alternates: { canonical: "/about/" },
};

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Local first",
    body: "Everything runs in your browser. We don't have accounts, so we have nothing of yours to lose or leak.",
  },
  {
    icon: Code2,
    title: "Open source",
    body: "You shouldn't have to trust a password tool on faith. The code is public so anyone can check how it works.",
  },
  {
    icon: Gift,
    title: "Free and calm",
    body: "No sign-up walls, no ads, no tracking. Just tools that do one job well.",
  },
  {
    icon: Scale,
    title: "Honest about limits",
    body: "Strength estimates are estimates, a vault can't beat malware on your device, and a forgotten master password can't be recovered. We say so plainly.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Password tools you don't have to trust blindly."
        lead="PassCrafter started as a simple password generator and grew into a small toolkit built on one rule: your secrets stay on your device."
      />

      <Container className="pb-8">
        <Prose className="max-w-3xl">
          <p>
            Most online password tools ask you to trust them. PassCrafter takes the opposite approach: it
            does the work in your browser, using the secure random number generator built into it, so
            there is nothing to trust and nothing to send. The tools cover the full life of a password:
            making a strong one, checking how strong it is, finding out whether it has leaked, and
            keeping it somewhere safe.
          </p>
          <p>
            PassCrafter is made by {SITE.author}, a developer who also builds{" "}
            <a href="https://trackaexpense.dhruvchheda.com">TrackaExpense</a>, an expense tracker and bill
            splitter.
          </p>
        </Prose>
      </Container>

      <Container className="py-12">
        <Eyebrow>What guides it</Eyebrow>
        <h2 className="mb-8 text-3xl">Principles</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-primary-text">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-text-secondary">{body}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pb-8">
        <div className="card max-w-3xl p-8">
          <h2 className="text-2xl">Get involved</h2>
          <p className="mt-3 text-text-secondary">
            Found a bug, have an idea, or want to review the code? Open an issue on{" "}
            <a href={SITE.repo} className="font-bold text-primary-text underline">
              GitHub
            </a>{" "}
            or email{" "}
            <a href={`mailto:${SITE.email}`} className="font-bold text-primary-text underline">
              {SITE.email}
            </a>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <TextLink href="/">Try the generator</TextLink>
            <TextLink href="/privacy/">Read the privacy policy</TextLink>
          </div>
        </div>
      </Container>
    </>
  );
}
