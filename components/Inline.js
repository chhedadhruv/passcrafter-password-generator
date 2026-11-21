import Link from "next/link";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders a string, turning [text](/path/) into links. */
export default function Inline({ text }) {
  const parts = [];
  let last = 0;
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={m.index} href={m[2]}>
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
