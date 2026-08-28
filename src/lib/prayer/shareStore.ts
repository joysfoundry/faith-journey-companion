/**
 * Backend for short, titled follow-along links (ACTS-94).
 *
 * A share is stored in Supabase (`public.shared_sessions`) keyed by a short,
 * human-readable slug (date + prayer title + a random suffix), e.g.
 *   aug-28-litany-of-humility-7k2p
 * The stored `payload` is the SAME lz-string-compressed SharePayload the fragment
 * link uses, so the guest view decodes it identically — the backend just trades a
 * ~10 KB URL for a tiny one.
 *
 * Access is public by design (anon insert + select) so a guest with no account can
 * create and hand off a link. See the migration for the RLS policies.
 */
import { supabase } from "@/integrations/supabase/client";

import { decodeShare, encodeShare, type SharePayload } from "./share";

const SLUG_TITLE_WORDS = 6;
// Unambiguous alphabet for the random suffix (no 0/o/1/l).
const SUFFIX_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, SLUG_TITLE_WORDS)
    .join("-")
    .replace(/-+/g, "-");
}

/** "2026-08-28" → "aug-28" (falls back to empty on a bad date). */
function monthDaySlug(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase()
    .replace(",", "")
    .replace(/\s+/g, "-");
}

function randomSuffix(n = 4): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return s;
}

/** A titled, unique-enough slug for a share, e.g. aug-28-litany-of-humility-7k2p. */
function buildSlug(payload: SharePayload): string {
  const date = monthDaySlug(payload.cover.date);
  const title = slugifyTitle(payload.cover.title || "prayer");
  return [date, title, randomSuffix()].filter(Boolean).join("-");
}

/**
 * Save a share and return its slug. Retries on the (rare) slug collision. Throws if
 * the store is unreachable / not set up — callers fall back to a fragment link.
 */
export async function createShare(payload: SharePayload): Promise<string> {
  const compressed = encodeShare(payload);
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = buildSlug(payload);
    const { error } = await supabase.from("shared_sessions").insert({ slug, payload: compressed });
    if (!error) return slug;
    // 23505 = unique_violation → try a fresh suffix; anything else is fatal.
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not create a share link (slug collisions)");
}

/** Fetch a share by slug and decode it. Returns null when missing/garbled. */
export async function fetchShare(slug: string): Promise<SharePayload | null> {
  const { data, error } = await supabase
    .from("shared_sessions")
    .select("payload")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return decodeShare(data.payload);
}
