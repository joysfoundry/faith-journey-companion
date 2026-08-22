import type { KnowledgeCategory, KnowledgeItem, KnowledgeStatus } from "./types";

/** Human labels for a single item's category (used in rows, the Add picker). */
export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  book: "Book",
  article: "Article",
  video: "Video",
  podcast: "Podcast",
  post: "Post",
  program: "Program",
  resource: "Resource",
};

/** The categories offered in the Add form, in menu order. */
export const CATEGORY_OPTIONS: KnowledgeCategory[] = [
  "book",
  "article",
  "video",
  "podcast",
  "post",
  "program",
  "resource",
];

/**
 * Home-page / Library grouping. Several item categories collapse into one
 * display group ("Media" gathers video/podcast/article/post). Order here is the
 * display order of the groups.
 */
export type KnowledgeGroup = "program" | "book" | "media" | "resource";

export const GROUP_LABELS: Record<KnowledgeGroup, string> = {
  program: "Programs",
  book: "Books",
  media: "Media",
  resource: "Resources",
};

export const GROUP_ORDER: KnowledgeGroup[] = ["program", "book", "media", "resource"];

/** Which display group an item belongs to. */
export function groupOf(category: KnowledgeCategory): KnowledgeGroup {
  if (category === "program") return "program";
  if (category === "book") return "book";
  if (category === "resource") return "resource";
  return "media"; // video | podcast | article | post
}

/** Resources are ongoing tools — they never carry a meaningful status. */
export function isCompletable(category: KnowledgeCategory): boolean {
  return category !== "resource";
}

/**
 * A Bible-reading program. These display under the Home "Word" section instead
 * of the Knowledge → Programs group (still a `program` in the Library).
 */
export function isScriptureProgram(item: KnowledgeItem): boolean {
  return item.category === "program" && !!item.reads_scripture;
}

/** Best-guess default for the "reads through Scripture" toggle when adding a program. */
export function detectScriptureProgram(url?: string, title?: string, source?: string): boolean {
  const hay = `${url ?? ""} ${title ?? ""} ${source ?? ""}`.toLowerCase();
  if (/reading-plans?/.test(hay) && hay.includes("bible.com")) return true;
  return /\bbible\b|\bscripture\b|\bgospel\b|\bnew testament\b|\bold testament\b/.test(hay);
}

/** Sort key so in-progress floats above not-started above finished. */
const STATUS_RANK: Record<KnowledgeStatus, number> = {
  in_progress: 0,
  not_started: 1,
  finished: 2,
};

/** Order a list: in-progress first, then not-started, then finished; newest within. */
export function byStatusThenRecent(a: KnowledgeItem, b: KnowledgeItem): number {
  const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (s !== 0) return s;
  return (b.created_at ?? "").localeCompare(a.created_at ?? "");
}

/** Status labels for the stepper / filters. */
export const STATUS_STEPS: { key: KnowledgeStatus; label: string }[] = [
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "finished", label: "Finished" },
];

/**
 * Heuristic auto-categorization from a URL and/or title — no AI. Returns a
 * best-guess category the user can override. URL host/path wins; a bare title
 * with no URL is assumed to be a book.
 */
export function detectCategory(url?: string, _title?: string): KnowledgeCategory {
  const raw = (url ?? "").trim().toLowerCase();
  if (!raw) return "book"; // title-only entries are usually books

  let host = "";
  let path = "";
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    host = u.hostname.replace(/^www\./, "");
    path = u.pathname;
  } catch {
    host = raw;
  }

  // Known ongoing tools / apps / reference sites → resource.
  const RESOURCE_HOSTS = [
    "hallow.com",
    "usccb.org",
    "vatican.va",
    "magnificat.com",
    "laudate",
    "ewtn.com",
    "catholic.com",
  ];
  if (RESOURCE_HOSTS.some((h) => host.includes(h))) return "resource";

  // Bible apps: a reading *plan* is a program; the app root is a resource.
  if (host.includes("bible.com") || host.includes("youversion")) {
    return /reading-plans?/.test(path) ? "program" : "resource";
  }
  if (host.includes("ascensionpress.com") || /reading-plans?|\/plan(s)?\//.test(path)) {
    return "program";
  }

  // Media hosts.
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "video";
  if (host.includes("vimeo.com")) return "video";
  if (host.includes("podcasts.apple.com") || host.includes("open.spotify.com")) return "podcast";
  if (
    host.includes("instagram.com") ||
    host.includes("x.com") ||
    host.includes("twitter.com") ||
    host.includes("facebook.com") ||
    host.includes("tiktok.com")
  ) {
    return "post";
  }

  // A bare domain root (no real path) is more likely a tool than an article.
  if (path === "" || path === "/") return "resource";

  return "article";
}

/** Pretty one-line detail for a Knowledge row. */
export function knowledgeSubtitle(item: KnowledgeItem): string {
  return [CATEGORY_LABELS[item.category], item.creator, item.source].filter(Boolean).join(" · ");
}
