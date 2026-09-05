/**
 * Deterministic checks for the PRD gap-merge. Runs the real seed through the
 * real compiler — no browser, no localStorage.
 *   npx tsx scripts/verify-merge.ts
 */
import { createSeedDatabase } from "../src/lib/prayer/seed";
import { generatePrayerSession, sessionProgress, newId } from "../src/lib/prayer/compiler";
import { mutations } from "../src/lib/prayer/store";

const db = createSeedDatabase();
const out: string[] = [];

function compile(templateId: string, ctx = {}) {
  const t = db.templates.find((x) => x.id === templateId)!;
  return generatePrayerSession(db, t, ctx);
}

// Rosary still compiles correctly (regression guard)
const rosary = compile("tpl-rosary");
const hailMarys = rosary.items.filter((i) => i.kind === "prayer" && /Hail Mary/.test(i.title)).length;
out.push(`Rosary: ${rosary.items.length} items, ${hailMarys} Hail Marys, progress ${sessionProgress(rosary.items).total} prayable`);

// External Link: Pray with the Pope
const pope = compile("tpl-pray-with-pope");
const link = pope.items.find((i) => i.kind === "external_link");
const opts = (link?.configuration as { external_options?: { label: string; url: string; is_default?: boolean }[] })?.external_options ?? [];
const defaults = opts.filter((o) => o.is_default);
out.push(
  `Pray with the Pope: ${pope.items.length} item(s), external_link=${!!link}, options=${opts.length}, exactly-one-default=${defaults.length === 1}, progress=${sessionProgress(pope.items).total}`,
);

// Chaplet of St. Michael: 9 choirs, each Our Father + 3 Hail Marys, via generic kinds
const chaplet = compile("tpl-chaplet-michael");
const salutationCustoms = chaplet.items.filter((i) => i.kind === "prayer" && /Salutation — Choir of/.test(i.title)).length;
const chapletHailMarys = chaplet.items.filter((i) => i.kind === "prayer" && i.title === "Hail Mary").length;
out.push(`Chaplet of St. Michael: ${chaplet.items.length} items, ${salutationCustoms} choir salutations, ${chapletHailMarys} Hail Marys (expect 27)`);

// Scriptural Rosary: distinct Scripture before EACH Hail Mary
const scr = compile("tpl-scriptural-rosary");
const scriptureItems = scr.items.filter((i) => i.kind === "scripture");
let eachScriptureThenHailMary = true;
scr.items.forEach((it, idx) => {
  if (it.kind === "scripture") {
    const next = scr.items[idx + 1];
    if (!next || next.kind !== "prayer" || next.title !== "Hail Mary") eachScriptureThenHailMary = false;
  }
});
const distinctRefs = new Set(scriptureItems.map((i) => `${i.reference}|${i.body}`)).size;
out.push(
  `Scriptural Rosary: ${scr.items.length} items, ${scriptureItems.length} Scripture passages (${distinctRefs} distinct), each-followed-by-HailMary=${eachScriptureThenHailMary}`,
);

// Fixed mystery set: a rosary pinned to Luminous compiles Luminous mysteries
const rosaryT = db.templates.find((t) => t.id === "tpl-rosary")!;
const pinned = { ...rosaryT, fixed_mystery_set_id: "set-luminous" };
const pinnedSession = generatePrayerSession(db, pinned, {});
const mysteryTitles = pinnedSession.items.filter((i) => i.kind === "mystery").map((i) => i.title);
const allLuminous = mysteryTitles.length === 5 && mysteryTitles.every((t) => /Baptism|Cana|Kingdom|Transfig|Eucharist/.test(t));
out.push(`Fixed mystery set (Luminous): mysteries=[${mysteryTitles.join(", ")}] allLuminous=${allLuminous}`);

// 54-day novena still resolves (novena rules + phases)
const novena = compile("tpl-54-novena", { novena_instance_id: "none" });
out.push(`54-Day Novena: ${novena.items.length} items compiled`);

// Journey layer: Reflection / Knowledge / Mass persist through store reducers
let j = db;
j = mutations.addReflection(j, {
  id: newId("reflection"),
  title: "After the Rosary",
  body: "The Annunciation stayed with me.",
  mode: "written",
  links: [{ target_type: "prayer_session", target_id: "sess-1", label: "Daily Rosary" }],
  photo_count: 0,
  created_at: new Date().toISOString(),
});
j = mutations.addKnowledgeItem(j, {
  id: "know-x",
  title: "Test book",
  category: "book",
  status: "not_started",
  created_at: new Date().toISOString(),
});
j = mutations.setKnowledgeStatus(j, "know-x", "finished");
j = mutations.addMassExperience(j, {
  id: newId("mass"),
  date: "2026-08-19",
  church: "St. Mary",
  celebrant: "Fr. A",
  transcript_status: "none",
  created_at: new Date().toISOString(),
});
const seededKnowledge = createSeedDatabase().knowledge_items.length;
out.push(
  `Journey layer: reflections=${j.reflections.length} (link ${j.reflections[0]?.links[0]?.target_type}), ` +
    `knowledge=${j.knowledge_items.length} (seeded ${seededKnowledge}, know-x=${j.knowledge_items.find((k) => k.id === "know-x")?.status}), ` +
    `mass=${j.mass_experiences.length}`,
);

console.log("\n=== fjc PRD gap-merge verification ===");
out.forEach((l) => console.log("• " + l));
const ok = link && opts.length === 2 && defaults.length === 1 && hailMarys === 53;
console.log(ok ? "\nPASS" : "\n(review above)");
