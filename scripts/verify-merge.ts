/**
 * Deterministic checks for the PRD gap-merge. Runs the real seed through the
 * real compiler — no browser, no localStorage.
 *   npx tsx scripts/verify-merge.ts
 */
import { createSeedDatabase } from "../src/lib/prayer/seed";
import { generatePrayerSession, sessionProgress } from "../src/lib/prayer/compiler";

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

// 54-day novena still resolves (novena rules + phases)
const novena = compile("tpl-54-novena", { novena_instance_id: "none" });
out.push(`54-Day Novena: ${novena.items.length} items compiled`);

console.log("\n=== fjc PRD gap-merge verification ===");
out.forEach((l) => console.log("• " + l));
const ok = link && opts.length === 2 && defaults.length === 1 && hailMarys === 53;
console.log(ok ? "\nPASS" : "\n(review above)");
