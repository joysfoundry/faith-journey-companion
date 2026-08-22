/* Spot-checks the liturgical calendar against known 2025/2026 dates. */
import { getLiturgicalDay } from "../src/lib/liturgical/calendar";

interface Case {
  date: string;
  expectTitle?: string;
  expectContains?: string;
  expectFerialContains?: string;
  expectOptional?: string;
  note: string;
}

const cases: Case[] = [
  // Movable — 2026: Easter Apr 5, Ash Wed Feb 18, Pentecost May 24, Advent1 Nov 29.
  {
    date: "2026-04-05",
    expectTitle: "Easter Sunday of the Resurrection of the Lord",
    note: "Easter 2026",
  },
  { date: "2026-02-18", expectTitle: "Ash Wednesday", note: "Ash Wednesday 2026" },
  { date: "2026-05-24", expectTitle: "Pentecost Sunday", note: "Pentecost 2026" },
  {
    date: "2026-05-17",
    expectTitle: "The Ascension of the Lord",
    note: "Ascension (US, transferred) 2026",
  },
  { date: "2026-11-29", expectTitle: "First Sunday of Advent", note: "Advent 1, 2026" },
  { date: "2026-12-25", expectTitle: "The Nativity of the Lord (Christmas)", note: "Christmas" },
  { date: "2026-05-31", expectTitle: "The Most Holy Trinity", note: "Trinity Sunday" },
  { date: "2026-11-22", expectContains: "King of the Universe", note: "Christ the King 2026" },
  { date: "2026-06-07", expectContains: "Corpus Christi", note: "Corpus Christi (US) 2026" },
  // Ordinary Time numbering
  {
    date: "2026-01-19",
    expectFerialContains: "Second Week in Ordinary Time",
    note: "Mon after 2nd Sun OT — wait, check",
  },
  { date: "2026-08-23", expectContains: "Ordinary Time", note: "OT Sunday late Aug 2026" },
  // Sanctoral — saints & popes
  { date: "2026-08-21", expectTitle: "Saint Pius X, Pope", note: "St Pius X memorial" },
  { date: "2026-08-22", expectTitle: "The Queenship of the Blessed Virgin Mary", note: "today" },
  { date: "2026-08-04", expectTitle: "Saint John Vianney, Priest", note: "handoff example" },
  {
    date: "2026-10-22",
    expectFerialContains: "Ordinary Time",
    expectOptional: "Saint John Paul II, Pope",
    note: "JP2 optional memorial under weekday",
  },
  { date: "2026-06-29", expectTitle: "Saints Peter and Paul, Apostles", note: "solemnity" },
  {
    date: "2026-08-15",
    expectTitle: "The Assumption of the Blessed Virgin Mary",
    note: "Assumption solemnity",
  },
  { date: "2026-08-06", expectTitle: "The Transfiguration of the Lord", note: "feast of the Lord" },
  {
    date: "2026-01-01",
    expectTitle: "The Blessed Virgin Mary, the Mother of God",
    note: "Jan 1 solemnity",
  },
];

let pass = 0;
let fail = 0;
for (const c of cases) {
  const day = getLiturgicalDay(c.date);
  const problems: string[] = [];
  if (c.expectTitle && day.title !== c.expectTitle)
    problems.push(`title="${day.title}" expected "${c.expectTitle}"`);
  if (c.expectContains && !day.title.includes(c.expectContains))
    problems.push(`title="${day.title}" should contain "${c.expectContains}"`);
  if (c.expectFerialContains && !day.ferialTitle.includes(c.expectFerialContains))
    problems.push(`ferial="${day.ferialTitle}" should contain "${c.expectFerialContains}"`);
  if (c.expectOptional && !day.optionalMemorials.includes(c.expectOptional))
    problems.push(
      `optional=[${day.optionalMemorials.join("; ")}] should include "${c.expectOptional}"`,
    );
  if (problems.length) {
    fail++;
    console.log(`✗ ${c.date} (${c.note})`);
    for (const p of problems) console.log(`    ${p}`);
  } else {
    pass++;
    const extra = day.rankLabel ? ` [${day.rankLabel}]` : "";
    console.log(`✓ ${c.date}  ${day.title}${extra}`);
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
