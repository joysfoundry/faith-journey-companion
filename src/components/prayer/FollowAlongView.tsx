/**
 * Presentational guest "follow-along" view (ACTS-94) — the cover + every prayer,
 * read-only, plus a re-share/hand-off action. Shared by both guest routes:
 *   - `/follow#<payload>`  (self-contained fragment link)
 *   - `/follow/$shareId`   (short titled link, fetched from the backend)
 *
 * Pure presentation: no store, no auth, no completion. `slug`, when present, lets
 * the re-share reuse the same short link instead of minting a new one.
 */
import { Share2 } from "lucide-react";

import { ItemView } from "@/components/prayer/ItemView";
import { ShareDialog } from "@/components/prayer/ShareDialog";
import { Button } from "@/components/ui/button";
import type { SharePayload } from "@/lib/prayer/share";

/** yyyy-mm-dd → a friendly local date; falls back to the raw string if unparseable. */
function formatCoverDate(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Centered container for the loading / empty / invalid states. */
export function FollowAlongMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">{children}</div>
    </main>
  );
}

export function FollowAlongView({
  payload,
  slug,
}: {
  payload: SharePayload;
  slug?: string | undefined;
}) {
  const { cover, items } = payload;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-5 py-10">
        {/* Cover */}
        <header className="mb-10 text-center">
          <p className="eyebrow">Follow along</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{cover.title}</h1>
          <p className="mt-2 text-sm font-medium text-primary">{formatCoverDate(cover.date)}</p>
          {cover.purpose ? (
            <p className="mt-3 text-base text-muted-foreground">{cover.purpose}</p>
          ) : null}
          {cover.info ? (
            <p className="mx-auto mt-4 max-w-prose whitespace-pre-line text-sm text-muted-foreground">
              {cover.info}
            </p>
          ) : null}
          <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">
            {items.length} steps · in order
          </p>
          <div className="mt-5">
            <ShareDialog
              payload={payload}
              existingSlug={slug}
              trigger={
                <Button variant="outline" size="sm">
                  <Share2 className="mr-1.5 size-4" /> Share / hand off
                </Button>
              }
            />
          </div>
        </header>

        {/* Prayers — read-only, no completion, no interaction. */}
        <div className="space-y-5">
          {items.map((item, i) => (
            <article key={i} className="rounded-2xl border border-border bg-card px-5 py-6">
              <ItemView item={item} showMeditation />
            </article>
          ))}
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Shared from Oravia · read-only
        </footer>
      </div>
    </main>
  );
}
