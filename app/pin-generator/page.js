import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import PinTool from "../../components/PinTool";

const PATH = "/pin-generator/";
const TITLE = "Random PIN Generator";
const DESC =
  "Generate random 4 to 12 digit PINs that avoid obvious patterns like 1111 and 1234. Uses secure randomness and runs entirely in your browser.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "How secure is a 4-digit PIN?",
    a: "There are only 10,000 possible 4-digit PINs, so it is safe only where the system locks you out after a few wrong attempts, such as a bank card or phone. Prefer 6 or more digits where you can.",
  },
  {
    q: "Why avoid repeated and sequential PINs?",
    a: "PINs like 0000, 1111 and 1234 are the first ones anyone tries. Excluding them removes the easiest guesses without meaningfully shrinking the pool.",
  },
  {
    q: "Are these PINs really random?",
    a: "Yes. Each digit is chosen with your browser's cryptographically secure random number generator using unbiased sampling.",
  },
  {
    q: "Should I use a PIN as a password?",
    a: "No. PINs have very little entropy. For online accounts use a long password or passphrase instead.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="Create a random numeric PIN for a phone, card, lock or app, without predictable patterns."
      faqs={faqs}
      about={
        <>
          <h2>Choosing a good PIN</h2>
          <p>
            People pick surprisingly predictable PINs: birthdays, repeated digits and keypad
            patterns make up a large share of real-world choices. A random PIN avoids all of that.
            Each extra digit multiplies the number of possibilities by ten, so six digits gives one
            million combinations and eight gives one hundred million.
          </p>
          <h2>PIN safety tips</h2>
          <ul>
            <li>Never reuse a PIN across your phone, bank card and other devices.</li>
            <li>Avoid dates, phone numbers and anything someone could guess about you.</li>
            <li>Cover the keypad when entering it in public.</li>
            <li>
              For online accounts, use a long password from the <Link href="/">password generator</Link>{" "}
              instead of a PIN.
            </li>
          </ul>
          <p>
            Need an account name to go with it? Try the{" "}
            <Link href="/username-generator/">username generator</Link>.
          </p>
        </>
      }
    >
      <PinTool />
    </ToolPage>
  );
}
