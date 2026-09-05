/**
 * Renders a reflection body's markdown-lite emphasis (ACTS-156) — `**bold**`,
 * `*italic*`, `<u>underline</u>` — wherever a body is read.
 *
 * The parsed runs become React *text nodes*, never an HTML string, so there is
 * no `dangerouslySetInnerHTML` and nothing to sanitize: a body containing
 * `<script>` renders as the characters the person typed. Plain, unformatted
 * reflections (every entry written before this shipped) tokenize to a single
 * run and render exactly as they did before.
 */
import { tokenizeMarks } from "@/lib/prayer/richText";

export function FormattedText({ text }: { text: string }) {
  const tokens = tokenizeMarks(text);
  return (
    <>
      {tokens.map((token, i) => {
        // Runs are positional and the whole list re-renders together; there is
        // no stable id to key on, and no reordering for an index key to break.
        const key = `${i}-${token.text}`;
        let node: React.ReactNode = token.text;
        if (token.bold) node = <strong className="font-semibold">{node}</strong>;
        if (token.italic) node = <em>{node}</em>;
        if (token.underline) node = <u>{node}</u>;
        return <span key={key}>{node}</span>;
      })}
    </>
  );
}
