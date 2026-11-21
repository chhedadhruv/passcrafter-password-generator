import Link from "next/link";
import { Container, PageHero, Prose } from "../../components/ui";
import { SITE } from "../../lib/site";

export const metadata = {
  title: "Privacy Policy",
  description:
    "PassCrafter runs in your browser. We don't have accounts, cookies or analytics, and your passwords never leave your device.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="The short version: PassCrafter is built so we never receive your passwords or personal data."
      />
      <Container className="pb-8">
        <Prose className="max-w-3xl">
          <p>
            <strong>Last updated:</strong> 21 November 2026
          </p>

          <h2>What stays on your device</h2>
          <ul>
            <li>
              <strong>Generated passwords, passphrases, PINs and usernames</strong> are created in your
              browser using the Web Crypto API. They are never sent to us or anyone else.
            </li>
            <li>
              <strong>The strength checker and hash generator</strong> process what you type locally.
            </li>
            <li>
              <strong>The encrypted vault</strong> stores entries in your browser&apos;s IndexedDB, encrypted
              with a key derived from your master password. Your master password and the encryption key are
              never stored or transmitted. We can&apos;t read your vault and can&apos;t recover it if you forget
              the master password.
            </li>
            <li>
              <strong>Your preferences</strong> (light or dark theme, and the default period for
              password-change reminders) are saved in your browser&apos;s local storage. Reminders are off
              unless you turn them on. A reminder setting you choose for an individual entry, and the date
              each password last changed, are stored inside that entry, so they are encrypted with the
              rest of it and included in your encrypted backups.
            </li>
          </ul>

          <h2>The one network request your data can trigger</h2>
          <p>
            The <Link href="/breach-checker/">breach checker</Link> asks the{" "}
            <a href="https://haveibeenpwned.com/API/v3#PwnedPasswords">Have I Been Pwned Pwned Passwords API</a>{" "}
            whether a password appears in known breaches. Your browser hashes the password with SHA-1 and
            sends only the <strong>first five characters</strong> of that hash. The service returns every
            hash ending that shares the prefix and your browser does the matching. Your password and the
            full hash never leave your device. As with any web request, the service can see your IP address
            and browser details; see their privacy policy for how they handle that.
          </p>

          <h2>The browser extension</h2>
          <p>
            The PassCrafter browser extension works the same way as the website. It generates passwords and
            keeps an encrypted vault entirely on your device, in the extension&apos;s own local storage. It
            requests only the permission to write to your clipboard, has no access to the pages you visit,
            and makes no network requests. Its vault is separate from the website&apos;s vault, and your master
            password is never stored or transmitted.
          </p>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>No accounts or sign-ups.</li>
            <li>No cookies.</li>
            <li>No analytics, advertising or tracking scripts.</li>
            <li>No third-party fonts or scripts loaded from other sites. Fonts and the passphrase wordlist are served from this site.</li>
          </ul>

          <h2>Hosting</h2>
          <p>
            This site is hosted on Vercel. Like any web host, it may keep standard server logs (such as IP
            address, user agent and the pages requested) for operating and securing the service. We do not
            use these logs to identify or profile visitors.
          </p>

          <h2>Your responsibilities</h2>
          <p>
            Because everything is local, keeping your data safe also depends on your device. Keep your
            browser up to date and avoid installing untrusted browser extensions or software. Download
            encrypted backups of your vault, since clearing browser data deletes it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we change how PassCrafter handles data, for example by adding a feature that uses a server,
            we will update this page and the date above before the change goes live.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </Prose>
      </Container>
    </>
  );
}
