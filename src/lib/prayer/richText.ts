/**
 * Markdown-lite emphasis for reflection bodies (ACTS-156).
 *
 * A reflection's `body` stays a plain `string` — the marks live *inside* the
 * text as `**bold**`, `*italic*` and `<u>underline</u>`. That was a deliberate
 * choice over a rich-text (HTML) field: no data-shape change, no `STORAGE_KEY`
 * bump, and the share/follow codec (ACTS-94) and the shared draft (ACTS-136)
 * carry formatted text without knowing anything about it.
 *
 * `<u>` is used for underline because markdown has no underline of its own and
 * `__x__` already means *bold* in CommonMark — a marker we'd have to unpick if
 * the app ever adopts a real markdown renderer. Note this module never produces
 * an HTML string: `tokenizeMarks` returns plain text segments plus flags, which
 * the renderer puts into React text nodes, so a body containing `<script>` is
 * displayed, never interpreted.
 *
 * The guiding rule is that **nothing a person writes may silently change
 * meaning**. Prose is full of stray asterisks, so an unmatched or ambiguous
 * marker is always left literal rather than guessed at.
 */

/** The three emphases the reflection toolbar can apply. */
export type Mark = "bold" | "italic" | "underline";

/** A run of text sharing the same emphasis. */
export interface MarkToken {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

type Flags = { bold: boolean; italic: boolean; underline: boolean };

const NO_MARKS: Flags = { bold: false, italic: false, underline: false };

/** The delimiters the toolbar writes, per mark. */
const MARK_DELIMITERS: Record<Mark, { open: string; close: string }> = {
  bold: { open: "**", close: "**" },
  italic: { open: "*", close: "*" },
  underline: { open: "<u>", close: "</u>" },
};

const U_OPEN = "<u>";
const U_CLOSE = "</u>";

/**
 * What a run of N asterisks means. Runs are matched by their *exact* length, so
 * `**` never reads as two italics and `*` never eats half of a `**`. Four or
 * more has no meaning and stays literal — which is what an abandoned empty pair
 * (`****`, from clicking **B** and typing nothing) looks like.
 */
const ASTERISK_RUN_MARKS: Record<number, Mark[]> = {
  1: ["italic"],
  2: ["bold"],
  3: ["bold", "italic"],
};

/** Length of the run of `*` starting at `i` (0 when there is none). */
function asteriskRun(text: string, i: number): number {
  let n = 0;
  while (text[i + n] === "*") n += 1;
  return n;
}

function isSpace(ch: string | undefined): boolean {
  return ch === undefined || /\s/.test(ch);
}

/**
 * Finds the matching closing run of exactly `n` asterisks at or after `from`.
 * A closer must sit tight against the word it ends (CommonMark's flanking rule),
 * which is what keeps "2 * 3 and 4 * 5" from turning into italics.
 */
function findAsteriskClose(text: string, from: number, n: number): number {
  let j = from;
  while (j < text.length) {
    if (text[j] === "*") {
      const run = asteriskRun(text, j);
      if (run === n && j > from && !isSpace(text[j - 1])) return j;
      j += run; // skip the whole run — never re-test inside it
      continue;
    }
    j += 1;
  }
  return -1;
}

/**
 * Splits `text` into styled runs. Unmatched or ambiguous markers are left as
 * literal characters, so a lone `*` in "3 * 4" or an unclosed `**` survives
 * exactly as typed.
 */
export function tokenizeMarks(text: string): MarkToken[] {
  return merge(scan(text, NO_MARKS));
}

function scan(text: string, flags: Flags): MarkToken[] {
  const out: MarkToken[] = [];
  let literal = "";

  const flush = () => {
    if (literal) {
      out.push({ text: literal, ...flags });
      literal = "";
    }
  };

  let i = 0;
  while (i < text.length) {
    if (text[i] === "*") {
      const run = asteriskRun(text, i);
      const marks = ASTERISK_RUN_MARKS[run];
      // An opener must be followed by real content, and can't re-open a mark
      // that is already active — in `*a*b*` the second `*` closes, it doesn't
      // start a nested italic.
      if (marks && !isSpace(text[i + run]) && marks.every((m) => !flags[m])) {
        const close = findAsteriskClose(text, i + run, run);
        if (close !== -1) {
          flush();
          const inner = { ...flags };
          for (const m of marks) inner[m] = true;
          out.push(...scan(text.slice(i + run, close), inner));
          i = close + run;
          continue;
        }
      }
      literal += "*".repeat(run);
      i += run;
      continue;
    }

    if (!flags.underline && text.startsWith(U_OPEN, i)) {
      const end = text.indexOf(U_CLOSE, i + U_OPEN.length);
      if (end !== -1) {
        flush();
        // An empty `<u></u>` styles nothing; emit no run for it.
        out.push(...scan(text.slice(i + U_OPEN.length, end), { ...flags, underline: true }));
        i = end + U_CLOSE.length;
        continue;
      }
    }

    literal += text[i] ?? "";
    i += 1;
  }
  flush();
  return out;
}

/** Collapses neighbouring runs that carry identical emphasis. */
function merge(tokens: MarkToken[]): MarkToken[] {
  const out: MarkToken[] = [];
  for (const token of tokens) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.bold === token.bold &&
      prev.italic === token.italic &&
      prev.underline === token.underline
    ) {
      prev.text += token.text;
    } else {
      out.push({ ...token });
    }
  }
  return out;
}

/** True when `text` contains anything the parser might style. */
export function hasMarks(text: string): boolean {
  return text.includes("*") || text.includes(U_OPEN);
}

/** Strips the marks, leaving the words — for previews, counts and search. */
export function stripMarks(text: string): string {
  return tokenizeMarks(text)
    .map((t) => t.text)
    .join("");
}

export interface Selection {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Toggles `mark` over the current selection of a textarea's value, returning the
 * new value and where the selection should sit afterwards.
 *
 * - An already-wrapped selection is **unwrapped**, so the toolbar button is a
 *   true toggle rather than a one-way `****` accumulator.
 * - An empty selection inserts the pair and places the caret between the
 *   delimiters, ready to type into.
 * - Leading/trailing whitespace is left outside the marks: wrapping `"word "`
 *   yields `"**word** "`, never `"**word **"` — which, by the flanking rule
 *   above, wouldn't render at all.
 */
export function applyMark(selection: Selection, mark: Mark): Selection {
  const delim = MARK_DELIMITERS[mark];
  const { value } = selection;
  const start = Math.min(selection.selectionStart, selection.selectionEnd);
  const end = Math.max(selection.selectionStart, selection.selectionEnd);
  const raw = value.slice(start, end);

  // Keep surrounding whitespace out of the marked run.
  const leading = raw.length - raw.trimStart().length;
  const trailing = raw.length - raw.trimEnd().length;
  const from = start + leading;
  const to = end - trailing;
  const inner = value.slice(from, to);

  // Unwrap when the marks sit just inside the selection (`|**word**|`)…
  if (
    inner.startsWith(delim.open) &&
    inner.endsWith(delim.close) &&
    inner.length > delim.open.length + delim.close.length
  ) {
    const stripped = inner.slice(delim.open.length, inner.length - delim.close.length);
    return {
      value: value.slice(0, from) + stripped + value.slice(to),
      selectionStart: from,
      selectionEnd: from + stripped.length,
    };
  }

  // …or just outside it (`**|word|**`), which is what a second click sees, since
  // wrapping leaves the selection around the words themselves.
  const before = value.slice(Math.max(0, from - delim.open.length), from);
  const after = value.slice(to, to + delim.close.length);
  if (before === delim.open && after === delim.close) {
    const outerFrom = from - delim.open.length;
    return {
      value: value.slice(0, outerFrom) + inner + value.slice(to + delim.close.length),
      selectionStart: outerFrom,
      selectionEnd: outerFrom + inner.length,
    };
  }

  // Empty selection — drop in an empty pair and sit the caret inside it.
  if (inner.length === 0) {
    const caret = start + delim.open.length;
    return {
      value: value.slice(0, start) + delim.open + delim.close + value.slice(start),
      selectionStart: caret,
      selectionEnd: caret,
    };
  }

  const wrapped = delim.open + inner + delim.close;
  return {
    value: value.slice(0, from) + wrapped + value.slice(to),
    selectionStart: from + delim.open.length,
    selectionEnd: from + delim.open.length + inner.length,
  };
}

/** Maps a keyboard event's key to the mark it applies (⌘/Ctrl + B / I / U). */
export function markForKey(key: string): Mark | null {
  switch (key.toLowerCase()) {
    case "b":
      return "bold";
    case "i":
      return "italic";
    case "u":
      return "underline";
    default:
      return null;
  }
}
