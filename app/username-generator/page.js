import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import UsernameTool from "../../components/UsernameTool";

const PATH = "/username-generator/";
const TITLE = "Random Username Generator";
const DESC =
  "Generate readable random usernames in camelCase, snake_case or lowercase, with optional digits. Free, private and generated in your browser.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "Are the usernames unique?",
    a: "They are random combinations of an adjective, a noun and optional digits, so duplicates are unlikely but possible. Availability on any given site still has to be checked there.",
  },
  {
    q: "Why use a random username?",
    a: "A username unrelated to your real name or other accounts makes it harder to link your profiles together and reduces targeted guessing and phishing.",
  },
  {
    q: "Is a username a secret?",
    a: "No. Usernames are usually visible to others, so protect the account with a strong, unique password and two-factor authentication.",
  },
  {
    q: "Are the names generated on a server?",
    a: "No. Everything happens in your browser with secure randomness, and nothing is stored or sent.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="Get readable, memorable random usernames for new accounts, games and handles."
      faqs={faqs}
      about={
        <>
          <h2>Why generate a username?</h2>
          <p>
            Reusing the same handle everywhere makes it easy to connect your accounts and find
            personal details about you. A fresh username for each service keeps your identities
            separate, and avoiding your real name or birth year stops attackers from guessing it.
          </p>
          <h2>How the names are built</h2>
          <p>
            Each name pairs a random adjective with a random noun, then adds up to four random
            digits if you want them. Choose camelCase, snake_case or plain lowercase to match the
            rules of the site you are signing up for. Press &quot;Generate more&quot; for another set.
          </p>
          <h2>Pair it with a strong password</h2>
          <ul>
            <li>
              Create a unique password with the <Link href="/">password generator</Link> or a
              memorable one with the <Link href="/passphrase-generator/">passphrase generator</Link>.
            </li>
            <li>Store both in a password manager.</li>
            <li>Turn on two-factor authentication where it is offered.</li>
          </ul>
        </>
      }
    >
      <UsernameTool />
    </ToolPage>
  );
}
