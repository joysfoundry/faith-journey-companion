/* Spot-checks the reflection markdown-lite parser + toolbar helper (ACTS-156). */
import { applyMark, stripMarks, tokenizeMarks, type Mark } from "../src/lib/prayer/richText";

let pass = 0;
let fail = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
    console.log(`✓ ${name}`);
  } else {
    fail++;
    console.log(`✗ ${name}\n    actual   ${a}\n    expected ${e}`);
  }
}

/** Compact view of a token list: "text" plus the active marks, e.g. `hi[b]`. */
function shape(text: string): string[] {
  return tokenizeMarks(text).map((t) => {
    const marks = [t.bold ? "b" : "", t.italic ? "i" : "", t.underline ? "u" : ""].join("");
    return marks ? `${t.text}[${marks}]` : t.text;
  });
}

// ── Parsing ────────────────────────────────────────────────────────────────
check("plain text is one unstyled run", shape("Lord, hear my prayer."), ["Lord, hear my prayer."]);
check("bold", shape("be **still**"), ["be ", "still[b]"]);
check("italic", shape("be *still*"), ["be ", "still[i]"]);
check("underline", shape("be <u>still</u>"), ["be ", "still[u]"]);
check("bold wins over italic on `**`", shape("**a**"), ["a[b]"]);
check("bold inside italic nests", shape("*a **b** c*"), ["a [i]", "b[bi]", " c[i]"]);
check("underline inside bold nests", shape("**a <u>b</u>**"), ["a [b]", "b[bu]"]);
check("three marks at once", shape("***<u>x</u>***"), ["x[biu]"]);
check("mark mid-word", shape("un**bel**ievable"), ["un", "bel[b]", "ievable"]);
check("adjacent same-mark runs merge", shape("<u>a</u><u>b</u>"), ["ab[u]"]);

// Nothing a person types may silently vanish.
check("unclosed bold stays literal", shape("**not closed"), ["**not closed"]);
check("unclosed italic stays literal", shape("3 * 4 = 12"), ["3 * 4 = 12"]);
check("unclosed underline stays literal", shape("<u>oops"), ["<u>oops"]);
check("abandoned empty pair stays literal", shape("a****b"), ["a****b"]);
check("empty underline pair emits nothing", shape("a<u></u>b"), ["ab"]);
check("arithmetic is not italics", shape("2 * 3 and 4 * 5"), ["2 * 3 and 4 * 5"]);
check("a marker needing a space closer stays literal", shape("*a *"), ["*a *"]);
check("footnote asterisk survives", shape("see below*"), ["see below*"]);

// The renderer puts these in React text nodes; the parser must not treat any
// other tag as markup.
check("html is not markup", shape("<script>alert(1)</script>"), ["<script>alert(1)</script>"]);
check("stray angle brackets survive", shape("a < b > c"), ["a < b > c"]);
check("newlines are preserved", shape("one\ntwo"), ["one\ntwo"]);

check(
  "stripMarks removes delimiters",
  stripMarks("**bold** and *soft* and <u>under</u>"),
  "bold and soft and under",
);
check("stripMarks leaves plain text identical", stripMarks("nothing to strip"), "nothing to strip");

// ── Toolbar / selection helper ─────────────────────────────────────────────
function apply(value: string, start: number, end: number, mark: Mark) {
  const r = applyMark({ value, selectionStart: start, selectionEnd: end }, mark);
  return [r.value, r.selectionStart, r.selectionEnd];
}

check("wraps a selection", apply("be still", 3, 8, "bold"), ["be **still**", 5, 10]);
check("wraps with italic", apply("be still", 3, 8, "italic"), ["be *still*", 4, 9]);
check("wraps with underline", apply("be still", 3, 8, "underline"), ["be <u>still</u>", 6, 11]);
check("empty selection inserts a pair, caret inside", apply("be ", 3, 3, "bold"), [
  "be ****",
  5,
  5,
]);
check("reversed selection is normalised", apply("be still", 8, 3, "bold"), ["be **still**", 5, 10]);
check("whitespace stays outside the marks", apply("be still ", 3, 9, "bold"), [
  "be **still** ",
  5,
  10,
]);
check("unwraps when the marks are inside the selection", apply("be **still**", 3, 12, "bold"), [
  "be still",
  3,
  8,
]);
check("unwraps when the marks hug the selection", apply("be **still**", 5, 10, "bold"), [
  "be still",
  3,
  8,
]);
check(
  "unwrap is exactly the inverse of wrap",
  apply(...(apply("be still", 3, 8, "bold") as [string, number, number]), "bold"),
  ["be still", 3, 8],
);
check("wrapping a whole empty-ish value", apply("", 0, 0, "italic"), ["**", 1, 1]);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
