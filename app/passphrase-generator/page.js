import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import PassphraseTool from "../../components/PassphraseTool";

const PATH = "/passphrase-generator/";
const TITLE = "Passphrase Generator";
const DESC =
  "Generate secure, memorable passphrases from the EFF large wordlist. Choose 3 to 12 words, pick a separator, and see the entropy. Runs entirely in your browser.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "How many words should my passphrase have?",
    a: "Five words from the 7,776-word EFF list give about 64 bits of entropy, which is strong for most accounts. Use six or more for important accounts such as email or your password manager.",
  },
  {
    q: "Is a passphrase stronger than a normal password?",
    a: "Per character, no, but per unit of effort to remember, usually yes. A random five-word passphrase has about as much entropy as a random 11-character password drawn from letters, numbers and symbols, and it is far easier to type and remember.",
  },
  {
    q: "Should I swap letters for symbols, like a to @?",
    a: "No. Attackers already try those substitutions, so they add very little strength. Add another word instead.",
  },
  {
    q: "Where does the wordlist come from?",
    a: "It is the EFF large wordlist, 7,776 common words chosen to be easy to spell and hard to confuse. It is served from this site, and words are picked with your browser's cryptographically secure random number generator.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="Create memorable multi-word passphrases that are strong, easy to type and easy to remember."
      faqs={faqs}
      about={
        <>
          <h2>What is a passphrase?</h2>
          <p>
            A passphrase is a password made of several random words, such as{" "}
            <em>cabbage-pulse-gutter-fabric-lunar</em>. Because the words are chosen at random from
            a large list, the strength comes from how many words you use and how big the list is,
            not from clever tricks like capital letters or symbol swaps.
          </p>
          <h2>How strong is it?</h2>
          <p>
            Each word picked uniformly from the 7,776-word EFF list adds about 12.9 bits of
            entropy. Five words give roughly 64 bits, six give about 78, and seven give about 90.
            The meter above shows the exact figure for your settings, including the small boost from
            adding a number.
          </p>
          <h2>Tips for using passphrases</h2>
          <ul>
            <li>Let the generator choose the words. Phrases people pick themselves are far more guessable.</li>
            <li>Use a different passphrase for every account, and keep them in a password manager.</li>
            <li>Use a passphrase as the master password for your manager, since you have to remember that one.</li>
            <li>
              Need a traditional character-based password instead? Try the{" "}
              <Link href="/">random password generator</Link>, or test an existing one with the{" "}
              <Link href="/password-strength-checker/">strength checker</Link>.
            </li>
          </ul>
        </>
      }
    >
      <PassphraseTool />
    </ToolPage>
  );
}
