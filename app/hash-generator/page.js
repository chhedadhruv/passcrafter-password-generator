import Link from "next/link";
import ToolPage from "../../components/ToolPage";
import HashTool from "../../components/HashTool";

const PATH = "/hash-generator/";
const TITLE = "SHA Hash Generator";
const DESC =
  "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text instantly. Computed in your browser with the Web Crypto API; your text is never uploaded.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | PassCrafter`, description: DESC, url: PATH },
};

const faqs = [
  {
    q: "Is my text sent to a server?",
    a: "No. Hashes are computed locally with your browser's built-in Web Crypto API.",
  },
  {
    q: "Which algorithm should I use?",
    a: "SHA-256 is a good default for checksums and integrity checks. SHA-1 is broken for security purposes and is provided only for compatibility and legacy checks.",
  },
  {
    q: "Can I use SHA-256 to store passwords?",
    a: "No. Plain SHA hashes are fast, which helps attackers. Store passwords with a slow, salted algorithm such as Argon2, bcrypt or scrypt.",
  },
  {
    q: "Why no MD5?",
    a: "MD5 is cryptographically broken and not supported by the browser's Web Crypto API, so we leave it out rather than ship a custom implementation.",
  },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name={TITLE}
      intro="Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text as you type."
      faqs={faqs}
      about={
        <>
          <h2>What is a hash?</h2>
          <p>
            A hash function turns any input into a fixed-length fingerprint. The same input always
            gives the same output, a tiny change gives a completely different one, and the original
            text cannot be recovered from the hash. That makes hashes useful for verifying that
            files or messages have not changed.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Verifying downloads against a published checksum.</li>
            <li>Detecting whether data has changed.</li>
            <li>Creating stable identifiers from text.</li>
          </ul>
          <h2>What hashing is not</h2>
          <p>
            Hashing is not encryption, and fast hashes alone are not suitable for storing
            passwords. For breach lookups, the{" "}
            <Link href="/breach-checker/">breach checker</Link> uses SHA-1 only as a privacy-
            preserving lookup key. To make a strong password, use the{" "}
            <Link href="/">password generator</Link>.
          </p>
        </>
      }
    >
      <HashTool />
    </ToolPage>
  );
}
