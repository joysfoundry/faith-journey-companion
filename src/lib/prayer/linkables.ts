import { todaysWord, type LinkableItem } from "@/domain/placeholderData";
import { defaultContext, planTitle, resolveMysterySet, todayISO } from "@/lib/prayer/compiler";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import type { Database } from "@/lib/prayer/types";

export interface BuildLinkablesOpts {
  /**
   * Client-computed liturgical-day label for the daily readings (e.g. "Saint
   * Gregory the Great…"). Computed by the caller because `getLiturgicalDay` is
   * client-only; falls back to the generic "Daily Readings" when absent.
   */
  dailyReadingLabel?: string | null | undefined;
}

/**
 * The single source of truth for the reflection "Link an item" picker, shared by
 * the Home and `/reflections` composers so the two can never drift out of parity
 * (ACTS-136). Every source a reflection can be tagged with, grouped for the
 * picker: prayer sessions and the plans behind them, today's readings, the
 * knowledge library, and captured Masses.
 *
 * Pure over `db`. Ids resolve through `resolveInspiration`; an id it can't resolve
 * degrades gracefully to the snapshot `label`, so a comprehensive list is safe.
 */
export function buildReflectionLinkables(
  db: Database,
  opts: BuildLinkablesOpts = {},
): LinkableItem[] {
  const items: LinkableItem[] = [];
  const seen = new Set<string>();
  const push = (item: LinkableItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  // Prayer & devotion — the pinned daily devotion first (taggable even before
  // it's prayed; its id matches the daily row's Reflect icon), so the group is
  // never empty on a fresh install.
  const daily =
    (db.settings?.daily_template_id
      ? db.templates.find((t) => t.id === db.settings?.daily_template_id)
      : undefined) ??
    db.templates.find((t) => t.id === "tpl-rosary") ??
    db.templates[0];
  if (daily) {
    const isRosary = (daily.mystery_count ?? 0) > 0;
    const setName = isRosary
      ? (db.mystery_sets.find(
          (s) => s.id === resolveMysterySet(db, defaultContext({ date: todayISO() })),
        )?.name ?? "Mysteries")
      : undefined;
    push({
      id: daily.id,
      label: setName ? `${daily.name} · ${setName}` : daily.name,
      group: "Prayer & devotion",
    });
  }

  // Then every session (newest first), labeled by the plan behind it when there
  // is one, else its own title. Then any plan that has no session yet, so a
  // devotion you've scheduled but not prayed is still taggable.
  //
  // Lectio Divina sessions are excluded (ACTS-138): a Lectio *is* a container of
  // journaling (its per-movement Reflections), not an inspiration you'd tag a
  // separate note with — listing it here just clutters the picker (and surfaces
  // abandoned empty sittings). Lectio sittings live in the Journal instead
  // (ACTS-140).
  const isLectio = (templateId: string) => templateId === LECTIO_TEMPLATE_ID;
  const sessions = [...db.sessions].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  );
  const plannedWithSession = new Set(sessions.map((s) => s.plan_id).filter(Boolean) as string[]);
  for (const s of sessions) {
    if (isLectio(s.template_id)) continue;
    const plan = s.plan_id ? db.session_plans.find((p) => p.id === s.plan_id) : undefined;
    const label = plan ? planTitle(db, plan) : s.title?.trim() || "Prayer session";
    push({ id: s.id, label, group: "Prayer & devotion" });
  }
  for (const plan of db.session_plans) {
    if (plannedWithSession.has(plan.id) || isLectio(plan.template_id)) continue;
    push({ id: plan.id, label: planTitle(db, plan), group: "Prayer & devotion" });
  }

  // Word — today's readings, named by the liturgical day when the caller resolved it.
  push({
    id: todaysWord.id,
    label: opts.dailyReadingLabel?.trim() || "Daily Readings",
    group: "Word",
  });

  // Knowledge — the whole library.
  for (const k of db.knowledge_items) {
    push({ id: k.id, label: k.title, group: "Knowledge" });
  }

  // Mass — Masses/homilies captured on Home, newest first.
  const masses = [...db.mass_experiences].sort((a, b) =>
    (b.date ?? b.created_at ?? "").localeCompare(a.date ?? a.created_at ?? ""),
  );
  for (const m of masses) {
    const who = m.church?.trim() || m.celebrant?.trim() || "Mass";
    const label = m.date ? `${who} · ${m.date}` : who;
    push({ id: m.id, label, group: "Mass" });
  }

  return items;
}
