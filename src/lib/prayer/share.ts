/**
 * Guest "follow-along" share codec (ACTS-94).
 *
 * Turns a compiled prayer session into a self-contained, URL-fragment-safe string
 * so a guest **without the app** can open a read-only view — and hand the same
 * link on to anyone else. The payload carries the fully-expanded prayer steps and
 * a cover; it is **identity-free** (no sender/user), so whoever holds the link can
 * lead and re-share.
 *
 * No React, no store, no network. Pure encode/decode — the same input always
 * produces the same fragment.
 *
 * Delivery: `/follow#<fragment>`. The fragment stays client-side (never sent to a
 * server), which keeps it private and dodges server URL-length limits. See the
 * ACTS-93 size probe (`stories/ACTS-93/payload-probe.mts`): a full rosary is
 * ~3 KB — fine for a tap-to-open link everywhere; QR only fits short sessions.
 *
 * Compatibility: `SHARE_VERSION` is a **validation gate only**. A payload from a
 * different version is rejected (the guest is asked to reshare) — we deliberately
 * do NOT keep old links working when the shape changes.
 */
// lz-string ships CommonJS with no ESM/exports map, so import the default object
// and destructure — the only form that works under both Vite and a plain Node run.
import LZString from "lz-string";

import type { PrayerSession, SessionItem, SessionItemKind } from "./types";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

/** Bump when the payload shape changes. Old links stop decoding — by design. */
export const SHARE_VERSION = 1 as const;

/**
 * Conservative fragment-length (chars) budget below which the *full* share URL is
 * short enough to encode as a QR that scans reliably off a phone screen. lz-string's
 * output is mixed-case, forcing QR **byte mode** (lower capacity than alphanumeric),
 * so this stays well under the theoretical max. It's a cheap pre-filter — Phase 4's
 * QR encoder is the real authority on whether a given URL fits. Measured with
 * lz-string (not the ACTS-93 deflate proxy): a full rosary (~10 KB) is link-only; a
 * short litany/chaplet is borderline; single prayers fit comfortably.
 */
export const QR_FRAGMENT_LIMIT = 1200;

/** The cover shown atop the shared view. Free-text only — never an identity. */
export interface ShareCover {
  /** The session name — from `session.title` (already reflects the purpose when set). */
  title: string;
  /** yyyy-mm-dd, from the session context. */
  date: string;
  /** Optional intention/purpose line the sharer adds at share time. */
  purpose?: string | undefined;
  /** Optional welcome/context blurb the sharer adds at share time. */
  info?: string | undefined;
}

/** Sharer-authored cover text, captured at share time (not persisted on the session). */
export interface ShareCoverInput {
  purpose?: string | undefined;
  info?: string | undefined;
}

/** The guest-rendered subset of a SessionItem — exactly what `ItemView` reads. */
export interface ShareItem {
  kind: SessionItemKind;
  title: string;
  body?: string | undefined;
  reference?: string | undefined;
  repetition_index?: number | undefined;
  repetition_total?: number | undefined;
  mystery_ordinal?: number | undefined;
  configuration?: Record<string, unknown> | undefined;
}

export interface SharePayload {
  v: typeof SHARE_VERSION;
  cover: ShareCover;
  items: ShareItem[];
}

/** Drop keys whose value is undefined so they don't bloat the JSON/fragment. */
function compact<T extends object>(obj: T): T {
  const out = {} as T;
  for (const k of Object.keys(obj) as (keyof T)[]) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** Keep only the fields the guest view renders — nothing session-local or identifying. */
export function toShareItem(item: SessionItem): ShareItem {
  return compact<ShareItem>({
    kind: item.kind,
    title: item.title,
    body: item.body,
    reference: item.reference,
    repetition_index: item.repetition_index,
    repetition_total: item.repetition_total,
    mystery_ordinal: item.mystery_ordinal,
    configuration: item.configuration,
  });
}

/**
 * Build the shareable payload from a compiled session + its items. `title` and
 * `date` come from the session; `purpose`/`info` are the sharer's optional cover
 * text, captured at share time (not persisted on the session).
 */
export function buildSharePayload(
  session: PrayerSession,
  items: SessionItem[],
  cover: ShareCoverInput = {},
): SharePayload {
  const clean = (s?: string) => (s?.trim() ? s.trim() : undefined);
  return {
    v: SHARE_VERSION,
    cover: compact<ShareCover>({
      title: session.title,
      date: session.context.date,
      purpose: clean(cover.purpose),
      info: clean(cover.info),
    }),
    items: items.map(toShareItem),
  };
}

/** Serialize a payload to a URL-fragment-safe string. */
export function encodeShare(payload: SharePayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

/**
 * Decode a fragment back to a payload. Returns `null` for anything we can't trust
 * — empty, garbled, wrong version, or wrong shape — so callers render a friendly
 * "ask the host to reshare" state instead of crashing.
 */
export function decodeShare(fragment: string | null | undefined): SharePayload | null {
  if (!fragment) return null;
  let json: string | null;
  try {
    json = decompressFromEncodedURIComponent(fragment);
  } catch {
    return null;
  }
  if (!json) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  return isValidPayload(parsed) ? parsed : null;
}

/** Structural + version check. Deliberately strict — a bad link should read as bad. */
function isValidPayload(value: unknown): value is SharePayload {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  if (p["v"] !== SHARE_VERSION) return false;
  if (typeof p["cover"] !== "object" || p["cover"] === null) return false;
  const cover = p["cover"] as Record<string, unknown>;
  if (typeof cover["title"] !== "string" || typeof cover["date"] !== "string") return false;
  if (!Array.isArray(p["items"])) return false;
  return (p["items"] as unknown[]).every(
    (it) =>
      typeof it === "object" &&
      it !== null &&
      typeof (it as Record<string, unknown>)["kind"] === "string" &&
      typeof (it as Record<string, unknown>)["title"] === "string",
  );
}

/**
 * Estimated fragment length (chars) for a payload — lets the Share UI choose QR vs.
 * link-only without double-encoding. It's the true encoder, so the estimate is exact.
 */
export function estimateFragmentLength(payload: SharePayload): number {
  return encodeShare(payload).length;
}

/** Whether a payload's fragment is short enough to render as a scannable QR code. */
export function fitsQrCode(payload: SharePayload): boolean {
  return estimateFragmentLength(payload) <= QR_FRAGMENT_LIMIT;
}
