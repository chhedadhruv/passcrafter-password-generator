import { Clock, KeyRound, Lock, ServerOff } from "lucide-react";
import VaultApp from "../../components/VaultApp";
import { Container, Eyebrow, PageHero } from "../../components/ui";

export const metadata = {
  title: "Encrypted Password Vault",
  description: "A private, encrypted password vault that lives in your browser.",
  alternates: { canonical: "/vault/" },
  // Personal tool with no useful public content: keep it out of search results.
  robots: { index: false, follow: false },
};

const POINTS = [
  {
    icon: KeyRound,
    title: "Your key, your device",
    body: "Your master password is never stored. It is stretched with PBKDF2 (600,000 rounds) into an encryption key that stays in memory only.",
  },
  {
    icon: Lock,
    title: "Encrypted entry by entry",
    body: "Each entry is sealed with AES-256-GCM. Only ciphertext is saved in your browser's IndexedDB.",
  },
  {
    icon: Clock,
    title: "Locks itself",
    body: "The vault locks after 5 minutes of inactivity, and copied passwords are cleared from the clipboard after 30 seconds.",
  },
  {
    icon: ServerOff,
    title: "No account, no sync",
    body: "Nothing is uploaded. Clearing site data deletes the vault, so download an encrypted backup to keep a copy or move to another browser.",
  },
];

export default function VaultPage() {
  return (
    <>
      <PageHero
        eyebrow="Private · Encrypted · Local"
        title="Encrypted Password Vault"
        lead="Save passwords encrypted with a key derived from your master password. Everything stays in this browser: no account, no server, no sync."
      />
      <Container className="pb-6">
        <VaultApp />
      </Container>

      <Container className="py-16">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mb-8 text-3xl">Built so only you can read it.</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-primary-text">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-text-secondary">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm text-text-secondary">
          A vault can&apos;t protect you from malware or a malicious browser extension on your own device,
          which may be able to read what you type or reveal on screen. Keep your device and browser up to
          date.
        </p>
      </Container>
    </>
  );
}
