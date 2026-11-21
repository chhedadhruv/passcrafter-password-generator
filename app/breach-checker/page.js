import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import BreachTool from "../../components/BreachTool";

const PATH = "/breach-checker/";
const TITLE = "Password Breach Checker";
const DESC =
  "Find out whether a password has appeared in a known data breach. Uses the Have I Been Pwned k-anonymity API, so your password never leaves your browser.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "Does this send my password to a server?",
    a: "No. Your browser computes a SHA-1 hash of the password and sends only the first five characters of that hash to the Have I Been Pwned range API. The service returns every matching hash suffix, and the comparison happens in your browser.",
  },
  {
    q: "What does it mean if my password was found?",
    a: "It appeared in a data set from a past breach, so attackers already have it in their guess lists. Stop using it everywhere and replace it with a unique generated password.",
  },
  {
    q: "What if it is not found?",
    a: "It was not in the data Have I Been Pwned has collected, which is good but not proof of safety. A weak password can still be guessed, so check its strength as well.",
  },
  {
    q: "Is the Have I Been Pwned database trustworthy?",
    a: "It is a widely used, free service run by security researcher Troy Hunt. The k-anonymity design means you do not have to trust it with your actual password.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="Check whether a password has been exposed in a data breach, without revealing it."
      faqs={faqs}
      about={
        <>
          <h2>How the private check works</h2>
          <p>
            Checking a password against a breach database normally means handing the password to
            someone else. This tool avoids that with a technique called k-anonymity. Your browser
            hashes the password with SHA-1, keeps the hash on your device, and sends only its first
            five characters. The API replies with the hundreds of hash endings that share that
            prefix, and your browser looks for yours in the list. Because many passwords share each
            prefix, the service cannot tell which one you asked about.
          </p>
          <h2>Why breached passwords matter</h2>
          <p>
            Attackers take passwords from breaches and try them against other sites, a tactic known
            as credential stuffing. If a password you use has been exposed, any account that shares
            it is at risk, even if that site was never hacked itself.
          </p>
          <h2>What to do next</h2>
          <ul>
            <li>Change any exposed password everywhere you used it.</li>
            <li>
              Generate a new one with the <Link href="/">password generator</Link> and use a unique
              password per account.
            </li>
            <li>Turn on two-factor authentication where you can.</li>
            <li>
              Review your choices with the <Link href="/password-strength-checker/">strength checker</Link>.
            </li>
          </ul>
        </>
      }
    >
      <BreachTool />
    </ToolPage>
  );
}
