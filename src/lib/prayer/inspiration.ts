import type { Database, ReflectionLink } from "./types";

/**
 * The inspiration behind a reflection, resolved for display. Entity links resolve
 * their content from the store by `target_id`; a pasted `passage` carries its own
 * snapshot in the link's `excerpt`.
 *
 * The app never stores scripture text (Bible content is deep-linked out, not
 * embedded), so `text` is only ever a quote body or a pasted passage — an entity
 * reading resolves to a reference card (`label` + `detail` + optional `href`), not
 * its full text.
 */
export interface ResolvedInspiration {
  /** The link this was resolved from (target_type + target_id). */
  link: ReflectionLink;
  /** Heading — the name of the source. */
  label: string;
  /** Attribution / context line (creator, liturgical day, "Prayer session"…). */
  detail?: string;
  /** Full text to render verbatim: a pasted passage or a quote body. */
  text?: string;
  /** Open-out URL where the source lives elsewhere (a knowledge link). */
  href?: string;
}

/** Best label we can fall back to when nothing better resolves. */
function fallbackLabel(link: ReflectionLink): string {
  return link.label?.trim() || "Linked source";
}

/**
 * Resolve one reflection link into displayable inspiration. Pure over `db` — for a
 * `passage` it reads the link's own `excerpt`; for entities it looks up the store.
 * Never throws: an unresolvable id degrades to the stored `label`.
 */
export function resolveInspiration(link: ReflectionLink, db: Database): ResolvedInspiration {
  switch (link.target_type) {
    case "passage":
      return {
        link,
        label: link.label?.trim() || "Passage",
        detail: "Pasted passage",
        ...(link.excerpt?.trim() ? { text: link.excerpt.trim() } : {}),
      };

    case "learning": {
      const item = db.knowledge_items.find((k) => k.id === link.target_id);
      if (!item) return { link, label: fallbackLabel(link) };
      const voice = item.voice_id ? db.voices.find((v) => v.id === item.voice_id)?.name : undefined;
      const detail = voice ?? item.creator ?? item.source;
      const href = (item.links ?? []).find((l) => l.favorite)?.url ?? item.links?.[0]?.url;
      return {
        link,
        label: item.title || fallbackLabel(link),
        ...(detail ? { detail } : {}),
        ...(item.body?.trim() ? { text: item.body.trim() } : {}),
        ...(href ? { href } : {}),
      };
    }

    case "prayer_session": {
      const session = db.sessions.find((s) => s.id === link.target_id);
      return {
        link,
        label: session?.title || fallbackLabel(link),
        detail: session?.external_app ? `Prayed in ${session.external_app}` : "Prayer session",
      };
    }

    case "mass": {
      const mass = db.mass_experiences.find((m) => m.id === link.target_id);
      if (!mass) return { link, label: fallbackLabel(link), detail: "Mass" };
      const detail = [mass.church, mass.date].filter(Boolean).join(" · ") || "Mass";
      return {
        link,
        label: mass.church || "Mass",
        detail,
        ...(mass.notes?.trim() ? { text: mass.notes.trim() } : {}),
      };
    }

    case "daily_reading":
      // The reading text itself is never stored (deep-linked out); show a reference.
      return { link, label: link.label?.trim() || "Daily Readings", detail: "Today's Word" };

    case "mystery":
      return { link, label: link.label?.trim() || "Mystery", detail: "Rosary mystery" };

    case "session_item":
      return { link, label: fallbackLabel(link), detail: "Part of a session" };

    case "intention":
    default:
      return {
        link,
        label: fallbackLabel(link),
        ...(link.excerpt?.trim() ? { text: link.excerpt.trim() } : {}),
      };
  }
}

/** Resolve every link on a reflection, in stored order. */
export function resolveInspirations(links: ReflectionLink[], db: Database): ResolvedInspiration[] {
  return links.map((link) => resolveInspiration(link, db));
}
