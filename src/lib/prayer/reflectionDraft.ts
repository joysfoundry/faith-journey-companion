import type { ReflectionLink } from "@/lib/prayer/types";

/**
 * The in-progress reflection the user is composing but has not saved yet. It is
 * ephemeral working state — a compose buffer — deliberately kept OUT of the
 * `Database` so it never leaks into anything that serializes the store (share
 * links, exports) and needs no STORAGE_KEY bump. Both `ReflectionComposer`
 * instances (Home and `/reflections`) read and write this one draft, so a
 * half-written entry survives moving between the two pages.
 */
export interface ReflectionDraft {
  title: string;
  body: string;
  mode: "written" | "open_dialogue";
  themes: string[];
  /** Entity linkable ids currently selected in the picker. */
  linked: string[];
  /** Non-entity sources attached directly: pasted passages and web links. */
  manualLinks: ReflectionLink[];
  updated_at: string;
}

/** Versioned so the shape can evolve without colliding with an old buffer. */
export const REFLECTION_DRAFT_KEY = "prayer-companion-reflection-draft-v1";

/** True when the draft holds anything worth persisting or resuming. */
export function hasDraftContent(d: {
  title?: string;
  body?: string;
  themes?: string[];
  linked?: string[];
  manualLinks?: ReflectionLink[];
}): boolean {
  return Boolean(
    d.title?.trim() ||
    d.body?.trim() ||
    (d.themes && d.themes.length > 0) ||
    (d.linked && d.linked.length > 0) ||
    (d.manualLinks && d.manualLinks.length > 0),
  );
}

export function loadReflectionDraft(): ReflectionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REFLECTION_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReflectionDraft>;
    const draft: ReflectionDraft = {
      title: typeof parsed.title === "string" ? parsed.title : "",
      body: typeof parsed.body === "string" ? parsed.body : "",
      mode: parsed.mode === "open_dialogue" ? "open_dialogue" : "written",
      themes: Array.isArray(parsed.themes)
        ? parsed.themes.filter((t) => typeof t === "string")
        : [],
      linked: Array.isArray(parsed.linked)
        ? parsed.linked.filter((t) => typeof t === "string")
        : [],
      manualLinks: Array.isArray(parsed.manualLinks) ? parsed.manualLinks : [],
      updated_at:
        typeof parsed.updated_at === "string" ? parsed.updated_at : new Date().toISOString(),
    };
    // A buffer that decayed to empty is no draft at all — drop it.
    return hasDraftContent(draft) ? draft : null;
  } catch {
    return null;
  }
}

/** Persist the draft, or clear it when it has decayed to empty. */
export function saveReflectionDraft(draft: Omit<ReflectionDraft, "updated_at">): void {
  if (typeof window === "undefined") return;
  if (!hasDraftContent(draft)) {
    clearReflectionDraft();
    return;
  }
  try {
    window.localStorage.setItem(
      REFLECTION_DRAFT_KEY,
      JSON.stringify({ ...draft, updated_at: new Date().toISOString() }),
    );
  } catch {
    // Storage full or unavailable — a lost draft is preferable to a thrown render.
  }
}

export function clearReflectionDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REFLECTION_DRAFT_KEY);
  } catch {
    // ignore
  }
}
