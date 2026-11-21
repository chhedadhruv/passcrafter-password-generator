import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import StrengthTool from "../../components/StrengthTool";

const PATH = "/password-strength-checker/";
const TITLE = "Password Strength Checker";
const DESC =
  "Check how strong your password is and how long it would take to crack. Private by design: the check runs in your browser and nothing you type is sent anywhere.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "Is it safe to type my real password here?",
    a: "The check runs entirely in your browser and nothing is transmitted, but as a habit it is wiser to test a similar password rather than one you currently use.",
  },
  {
    q: "How is the crack time calculated?",
    a: "We estimate entropy from the character types and length, subtract for repeated or sequential characters, then assume an offline attacker making 10 billion guesses per second against a fast hash. Real attackers vary, and slow hashes such as bcrypt or Argon2 make attacks far slower.",
  },
  {
    q: "Why does a long password of simple words rate lower than a random one?",
    a: "Length helps, but predictable patterns and common words reduce the real entropy. Random characters or randomly chosen words are strongest.",
  },
  {
    q: "Does a high score mean my password is safe?",
    a: "Not on its own. A strong password that has leaked in a breach, or is reused across sites, is still unsafe. Use the breach checker and a unique password for every account.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="See an estimate of your password's strength and how long an attacker might need to crack it."
      faqs={faqs}
      about={
        <>
          <h2>How password strength works</h2>
          <p>
            Strength is measured in bits of entropy: each bit doubles the number of guesses an
            attacker needs. A password's entropy depends on how many different characters it could
            contain, how long it is, and, most importantly, how it was chosen. A password generated
            randomly is much stronger than a human-chosen one of the same length.
          </p>
          <h2>What this checker looks at</h2>
          <ul>
            <li>Length and which character types are used (lowercase, uppercase, digits, symbols).</li>
            <li>Repeated runs (aaa) and sequences (abc, 321) that shrink the real search space.</li>
            <li>Membership in a short list of the most common passwords.</li>
          </ul>
          <p>
            It is an estimate, not a guarantee. It cannot know whether a password has leaked
            elsewhere, so pair it with the <Link href="/breach-checker/">breach checker</Link>.
          </p>
          <h2>Making a stronger password</h2>
          <p>
            Aim for at least 16 random characters, or five to six random words. You can create
            either with the <Link href="/">password generator</Link> or the{" "}
            <Link href="/passphrase-generator/">passphrase generator</Link>, then store it in a
            password manager so you never have to memorize it.
          </p>
        </>
      }
    >
      <StrengthTool />
    </ToolPage>
  );
}
