/**
 * Deterministic checks for the journey export builder (ACTS-157).
 *   npx tsx scripts/verify-journey-export.ts
 *
 * Runs the real builder over a hand-built fixture Database — no browser, no
 * localStorage, no clipboard.
 */
// Pinned before any Date is constructed: the builder files entries by the
// user's LOCAL calendar day, so these assertions are only meaningful in a known
// timezone. Pacific is negative-offset, which is where UTC slicing goes wrong.
process.env["TZ"] = "America/Los_Angeles";

import {
  ALL_TIME,
  DEFAULT_INSIGHT_PROMPT,
  buildJourneyExport,
  isSeeded,
  journeyDateBounds,
  sinceLastExport,
} from "../src/lib/prayer/journeyExport";
import { SEED_EPOCH, createSeedDatabase } from "../src/lib/prayer/seed";
import type {
  Database,
  Intention,
  KnowledgeItem,
  MassExperience,
  PrayerSession,
  Reflection,
} from "../src/lib/prayer/types";

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

const TODAY = "2026-06-30";

const reflections: Reflection[] = [
  {
    id: "r-mar",
    title: "Trusting again",
    body: "I keep coming back to **trust**.",
    mode: "written",
    links: [{ target_type: "learning", target_id: "k-book" }],
    themes: ["trust", "surrender"],
    photo_count: 2,
    created_at: "2026-03-15T09:00:00-0700",
  },
  {
    id: "r-jan",
    body: "No title, no themes.",
    mode: "written",
    links: [],
    photo_count: 0,
    created_at: "2026-01-01T06:30:00-0700",
  },
  {
    id: "r-jun",
    title: "Quiet",
    body: "Sitting with the passage.",
    mode: "spoken",
    links: [
      { target_type: "passage", target_id: "p1", label: "Isaiah 43", excerpt: "Do not fear." },
    ],
    photo_count: 0,
    created_at: "2026-06-30T20:00:00-0700",
  },
];

const sessions: PrayerSession[] = [
  {
    id: "s-1",
    template_id: "tpl-rosary",
    title: "Holy Rosary · Joyful",
    context: {} as PrayerSession["context"],
    created_at: "2026-02-02T07:00:00-0700",
    completed_at: "2026-02-02T07:20:00-0700",
    cursor: 0,
  },
  {
    id: "s-2",
    template_id: "tpl-rosary",
    title: "Daily Rosary",
    context: {} as PrayerSession["context"],
    created_at: "2026-05-05T07:00:00-0700",
    cursor: 0,
    external_app: "Hallow",
  },
];

const intentions: Intention[] = [
  {
    id: "i-1",
    title: "For Mom's health",
    body: "Surgery on the 12th.",
    created_at: "2026-04-10T12:00:00-0700",
  },
];

const masses: MassExperience[] = [
  // Attended in February, typed up in June — must file under February.
  {
    id: "m-1",
    date: "2026-02-14",
    church: "St. Anne",
    celebrant: "Fr. Luis",
    notes: "Homily on the prodigal son.",
    created_at: "2026-06-01T10:00:00-0700",
  },
];

const knowledge: KnowledgeItem[] = [
  // Saved in December, started in January — must file under its start_date.
  {
    id: "k-book",
    title: "Abandonment to Divine Providence",
    category: "book",
    creator: "Jean-Pierre de Caussade",
    status: "in_progress",
    start_date: "2026-01-20",
    notes: "Slow going, worth it.",
    tags: ["trust"],
    created_at: "2025-12-01T10:00:00-0700",
  },
  {
    id: "k-quote",
    title: "",
    category: "quote",
    body: "Blessed is the crisis that made you grow.",
    creator: "St. Padre Pio",
    status: "not_started",
    created_at: "2026-02-20T10:00:00-0700",
  },
];

const seed = createSeedDatabase();
const db: Database = {
  ...seed,
  reflections,
  sessions,
  intentions,
  mass_experiences: masses,
  knowledge_items: knowledge,
  voices: [],
};

const empty: Database = {
  ...seed,
  reflections: [],
  sessions: [],
  intentions: [],
  mass_experiences: [],
  knowledge_items: [],
};

// 8pm Pacific on 2026-03-14, stored as the following UTC day.
const evening: Reflection = {
  id: "r-evening",
  title: "Late",
  body: "Written after dark.",
  mode: "written",
  links: [],
  photo_count: 0,
  created_at: "2026-03-15T03:00:00.000Z",
};

const all = buildJourneyExport(db, { today: TODAY });

// ── Bounds + range label ───────────────────────────────────────────────────
check(
  "earliest day is the book's start_date, not its created_at",
  journeyDateBounds(db).first,
  "2026-01-01",
);
check("latest day is the newest reflection", journeyDateBounds(db).last, "2026-06-30");
check(
  "all-time range label spans first entry → today",
  all.rangeLabel,
  `Everything — 2026-01-01 to ${TODAY}`,
);
check(
  "custom range label is the window itself",
  buildJourneyExport(db, { today: TODAY, range: { from: "2026-02-01", to: "2026-04-30" } })
    .rangeLabel,
  "2026-02-01 to 2026-04-30",
);

// ── Counts + range filtering ───────────────────────────────────────────────
check("all-time counts every layer", all.counts, {
  reflections: 3,
  sessions: 2,
  intentions: 1,
  masses: 1,
  knowledge: 2,
  total: 9,
});

const feb = buildJourneyExport(db, {
  today: TODAY,
  range: { from: "2026-02-01", to: "2026-02-28" },
});
check("a one-month window keeps only that month", feb.counts, {
  reflections: 0,
  sessions: 1,
  intentions: 0,
  masses: 1,
  knowledge: 1,
  total: 3,
});

// Boundaries are inclusive on BOTH ends — a range ending on the day of an entry keeps it.
const onFrom = buildJourneyExport(db, {
  today: TODAY,
  range: { from: "2026-03-15", to: "2026-03-15" },
});
check("`from` boundary is inclusive", onFrom.counts.reflections, 1);
const onTo = buildJourneyExport(db, {
  today: TODAY,
  range: { from: "2026-01-01", to: "2026-01-01" },
});
check("`to` boundary is inclusive", onTo.counts.reflections, 1);
const justOutside = buildJourneyExport(db, {
  today: TODAY,
  range: { from: "2026-03-16", to: "2026-03-16" },
});
check("a day past the entry excludes it", justOutside.counts.reflections, 0);

// Open-ended windows.
check(
  "`from` only runs to the end",
  buildJourneyExport(db, { today: TODAY, range: { from: "2026-05-01", to: null } }).counts.total,
  2,
);
check(
  "`to` only runs from the beginning",
  buildJourneyExport(db, { today: TODAY, range: { from: null, to: "2026-01-31" } }).counts.total,
  2,
);

// ── Ordering ───────────────────────────────────────────────────────────────
const reflectionHeadings = all.markdown.match(/^### 2026-\d\d-\d\d — .*$/gm) ?? [];
check("reflections and Masses run oldest → newest", reflectionHeadings, [
  "### 2026-01-01 — Untitled",
  "### 2026-03-15 — Trusting again",
  "### 2026-06-30 — Quiet",
  "### 2026-02-14 — St. Anne",
  "### 2026-01-20 — Abandonment to Divine Providence",
  "### 2026-02-20 — Quote",
]);

// ⚠️ `quoteBody` falls back to `title` for legacy safety, which printed every
// book's own title back as a quotation until this was guarded by `isQuote`.
check(
  "a book's title is not echoed back as a quotation",
  all.markdown.includes("> Abandonment to Divine Providence"),
  false,
);
check(
  "a real quote carries its text",
  all.markdown.includes("> Blessed is the crisis that made you grow."),
  true,
);
check(
  "a quote is not headed by a snippet of itself",
  all.markdown.includes("### 2026-02-20 — Blessed is the crisis"),
  false,
);

// ── Content ────────────────────────────────────────────────────────────────
check(
  "the prompt appears exactly once",
  all.markdown.split(DEFAULT_INSIGHT_PROMPT.trim()).length - 1,
  1,
);
check(
  "a custom prompt replaces the default entirely",
  (() => {
    const md = buildJourneyExport(db, { today: TODAY, prompt: "Look only at Lent." }).markdown;
    return [md.includes("Look only at Lent."), md.includes(DEFAULT_INSIGHT_PROMPT.trim())];
  })(),
  [true, false],
);
check(
  "the prompt forbids speaking for God",
  DEFAULT_INSIGHT_PROMPT.includes("Do not tell me what God is saying to me"),
  true,
);
check(
  "a link resolves to the item's title, not its id",
  all.markdown.includes("Written after: Abandonment to Divine Providence"),
  true,
);
check("no raw target ids leak into the document", all.markdown.includes("k-book"), false);
check("themes are listed", all.markdown.includes("Themes: trust, surrender"), true);
check("a themeless entry says nothing about themes", all.markdown.includes("Themes: \n"), false);
check(
  "markdown-lite marks pass through untouched (ACTS-156)",
  all.markdown.includes("I keep coming back to **trust**."),
  true,
);
check(
  "photos are named, not silently dropped",
  all.markdown.includes("2 photos (not included"),
  true,
);
check("a pasted passage is carried as a quote", all.markdown.includes("> Do not fear."), true);
check(
  "an external session says where it was prayed",
  all.markdown.includes("prayed in Hallow"),
  true,
);
check("an unfinished session is marked", all.markdown.includes("not finished"), true);
check(
  "a Mass files under the day it was attended",
  all.markdown.includes("### 2026-02-14 — St. Anne"),
  true,
);
check(
  "the dating rule is stated in the document",
  all.markdown.includes("saved to the library"),
  true,
);

// ── Empty ──────────────────────────────────────────────────────────────────
const none = buildJourneyExport(empty, { today: TODAY, range: ALL_TIME });
check("an empty store still produces a valid document", none.counts.total, 0);
check(
  "an empty store says so plainly",
  none.markdown.includes("There is nothing recorded in this period."),
  true,
);
check(
  "an empty store still carries the prompt",
  none.markdown.includes(DEFAULT_INSIGHT_PROMPT.trim()),
  true,
);
const emptyWindow = buildJourneyExport(db, {
  today: TODAY,
  range: { from: "2025-01-01", to: "2025-01-31" },
});
check("a range with nothing in it is handled", emptyWindow.counts.total, 0);

// ── Pre-installed library items are not the user's own history ────────────
// ⚠️ Every seeded row carries SEED_EPOCH. Counting them made a brand-new user's
// journey appear to begin on the app's install stamp (2023-12-31 locally),
// years before anything they actually did.
check("the seed epoch is recognised", isSeeded(SEED_EPOCH), true);
check("a real timestamp is not", isSeeded("2026-03-15T03:00:00.000Z"), false);
check("an absent timestamp is not", isSeeded(undefined), false);
check(
  "a store holding only the seeded library has no user history to anchor to",
  journeyDateBounds(seed),
  { first: null, last: null },
);
check(
  "one real entry anchors the label, seeded rows notwithstanding",
  journeyDateBounds({ ...seed, reflections: [evening] }),
  { first: "2026-03-14", last: "2026-03-14" },
);
// Kept in the file, but never presented as something the user chose.
check(
  "a seeded library item is flagged in the document",
  buildJourneyExport(seed, { today: TODAY }).markdown.includes("came with the app, not chosen"),
  true,
);
check(
  "a pre-installed item is headed by name alone — its only date is the install stamp",
  buildJourneyExport(seed, { today: TODAY }).markdown.includes(
    "### Introduction to the Devout Life",
  ),
  true,
);
check(
  "and carries no install date as a heading",
  /### \d{4}-\d\d-\d\d — Introduction to the Devout Life/.test(
    buildJourneyExport(seed, { today: TODAY }).markdown,
  ),
  false,
);
check(
  "the user's own saved item keeps its date",
  buildJourneyExport(db, { today: TODAY }).markdown.includes(
    "### 2026-01-20 — Abandonment to Divine Providence",
  ),
  true,
);
check(
  "the user's own saved item is not flagged",
  buildJourneyExport(db, { today: TODAY }).markdown.includes(
    "Book · by Jean-Pierre de Caussade · In progress · started 2026-01-20",
  ),
  true,
);

// ── Local calendar day (⚠️ the store writes created_at in UTC) ─────────────
// 8pm Pacific on 2026-03-14 is stored as 2026-03-15T03:00Z. Slicing the ISO
// string would file it under the 15th — a day later than every date the app
// shows the user, and a day outside a range they picked ending on the 14th.
const eveningDb: Database = { ...empty, reflections: [evening] };
check(
  "an evening entry files under the local day, not the UTC one",
  buildJourneyExport(eveningDb, {
    today: TODAY,
    range: { from: "2026-03-14", to: "2026-03-14" },
  }).counts.reflections,
  1,
);
check(
  "and is NOT caught by the following UTC day",
  buildJourneyExport(eveningDb, {
    today: TODAY,
    range: { from: "2026-03-15", to: "2026-03-15" },
  }).counts.reflections,
  0,
);
check(
  "a plain calendar date is used as written, never re-parsed as UTC midnight",
  buildJourneyExport(
    {
      ...empty,
      mass_experiences: [{ id: "m-x", date: "2026-04-01", created_at: "2026-04-05T10:00:00.000Z" }],
    },
    { today: TODAY, range: { from: "2026-04-01", to: "2026-04-01" } },
  ).counts.masses,
  1,
);

// ── Since last export ──────────────────────────────────────────────────────
check(
  "never exported = no window, which is what hides the option",
  sinceLastExport(undefined),
  null,
);
check("an empty stamp is treated as never exported", sinceLastExport(""), null);
check(
  "the window opens on the DAY of the last export, open-ended at the near end",
  sinceLastExport("2026-03-15T14:22:09.000Z"),
  { from: "2026-03-15", to: null },
);
// ⚠️ An evening export stamps the NEXT UTC day. Slicing it would open the
// window in the future and silently drop everything written that evening.
check(
  "an evening export does not open the window in the future",
  sinceLastExport("2026-03-15T03:00:00.000Z"),
  { from: "2026-03-14", to: null },
);
// ⚠️ The overlap is the point: exporting on the 15th then journaling that night
// must not lose the entry, so the same-day entry is re-sent rather than dropped.
check(
  "an entry written after an export on the same day is still caught",
  buildJourneyExport(db, {
    today: TODAY,
    range: sinceLastExport("2026-03-15T08:00:00-0700") ?? ALL_TIME,
  }).counts.reflections,
  2,
);
check(
  "the catch-up window excludes everything before that day",
  buildJourneyExport(db, {
    today: TODAY,
    range: sinceLastExport("2026-03-15T08:00:00-0700") ?? ALL_TIME,
  }).counts.intentions,
  1,
);
// A same-day re-export narrows to today alone — here, the one reflection
// written on TODAY (and nothing from the months before it).
check(
  "re-exporting today narrows to today alone",
  buildJourneyExport(db, {
    today: TODAY,
    range: sinceLastExport(`${TODAY}T09:00:00-0700`) ?? ALL_TIME,
  }).counts,
  { reflections: 1, sessions: 0, intentions: 0, masses: 0, knowledge: 0, total: 1 },
);

// ── Filename + size ────────────────────────────────────────────────────────
check(
  "all-time filename is stamped with the export date",
  all.filename,
  `oravia-journey-${TODAY}.md`,
);
check(
  "a windowed filename carries the window",
  feb.filename,
  "oravia-journey-2026-02-01-to-2026-02-28.md",
);
check("a small export is not flagged oversized", all.oversized, false);
check("characters matches the document length", all.characters, all.markdown.length);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
