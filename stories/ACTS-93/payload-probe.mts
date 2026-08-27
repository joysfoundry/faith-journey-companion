/** ACTS-93 spike (temporary — deleted after run). Measures shared payload size. */
import { deflateRawSync } from "node:zlib";
import { createSeedDatabase } from "../../src/lib/prayer/seed.ts";
import { generatePrayerSession, planTitle } from "../../src/lib/prayer/compiler.ts";
import type { Database, PrayerTemplate, SessionItem } from "../../src/lib/prayer/types.ts";

const db: Database = createSeedDatabase();

type ShareItem = Pick<
  SessionItem,
  "kind" | "title" | "body" | "reference" | "repetition_index" | "repetition_total" | "configuration"
>;
const toShareItems = (items: SessionItem[]): ShareItem[] =>
  items.map((i) => ({
    kind: i.kind,
    title: i.title,
    ...(i.body ? { body: i.body } : {}),
    ...(i.reference ? { reference: i.reference } : {}),
    ...(i.repetition_index ? { repetition_index: i.repetition_index } : {}),
    ...(i.repetition_total ? { repetition_total: i.repetition_total } : {}),
    ...(i.configuration ? { configuration: i.configuration } : {}),
  }));

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function measure(label: string, tpl: PrayerTemplate) {
  const { session, items } = generatePrayerSession(db, tpl, {});
  const payload = {
    v: 1,
    cover: {
      title: session.title,
      date: session.context.date,
      purpose: planTitle(db, { id: "x", template_id: tpl.id, items: [] } as any),
      info: "Welcome! Follow along with tonight's family rosary.",
    },
    items: toShareItems(items),
  };
  const json = JSON.stringify(payload);
  const jsonBytes = Buffer.byteLength(json, "utf8");
  const deflated = deflateRawSync(Buffer.from(json, "utf8"), { level: 9 });
  const fragment = b64url(deflated);
  const QR_RELIABLE = 1200, QR_MAX = 2953;
  console.log(`\n=== ${label} ===`);
  console.log(`steps:            ${items.length}`);
  console.log(`raw JSON:         ${jsonBytes.toLocaleString()} bytes`);
  console.log(`deflate:          ${deflated.length.toLocaleString()} bytes  (${((deflated.length / jsonBytes) * 100).toFixed(1)}% of raw)`);
  console.log(`fragment (b64url): ${fragment.length.toLocaleString()} chars`);
  console.log(`QR reliable (<${QR_RELIABLE}): ${fragment.length < QR_RELIABLE ? "YES" : "no"}   |  QR max (<${QR_MAX}): ${fragment.length < QR_MAX ? "yes" : "NO"}  |  link: always OK`);
}

const byId = (id: string) => db.templates.find((t) => t.id === id)!;
for (const [label, id] of [
  ["Full Rosary (5 decades)", "tpl-rosary"],
  ["Caro Family Rosary", "tpl-caro-rosary"],
  ["Scriptural Rosary (Luminous)", "tpl-scriptural-rosary"],
  ["Chaplet of St Michael", "tpl-chaplet-michael"],
  ["Litany of Humility", "tpl-litany-humility"],
  ["Pray with the Pope", "tpl-pray-with-pope"],
] as const) {
  const t = byId(id);
  if (t) measure(label, t);
}
