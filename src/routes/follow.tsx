/**
 * Guest "follow-along" view (ACTS-94) — a public, read-only page for people
 * **without the app**. The whole session rides in the URL fragment
 * (`/follow#<payload>`), so this page needs no store, no auth, and no network: it
 * decodes the fragment on the client and renders the cover + every prayer in order.
 *
 * Self-paced: no completion, no "current step", no Finish. Because the link is
 * fully self-contained and identity-free, whoever holds it can also re-share it
 * (the Share action is added in Phase 4) — leadership hands off with the link.
 *
 * The fragment is client-only (never sent to a server), so decoding happens after
 * mount; the first paint is a neutral loading state to avoid a hydration mismatch.
 */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";

import { ItemView } from "@/components/prayer/ItemView";
import { ShareDialog } from "@/components/prayer/ShareDialog";
import { Button } from "@/components/ui/button";
import { decodeShare, type SharePayload } from "@/lib/prayer/share";

export const Route = createFileRoute("/follow")({
  head: () => ({
    meta: [
      { title: "Follow along — Faith Journey" },
      {
        name: "description",
        content: "Follow along with a shared prayer session — every prayer, in order.",
      },
      { property: "og:title", content: "Follow along — Faith Journey" },
      {
        property: "og:description",
        content: "A shared prayer session to pray along with — no app needed.",
      },
    ],
  }),
  component: FollowAlong,
});

type DecodeState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ready"; payload: SharePayload };

/** Read + decode the URL fragment on the client only; re-read if the hash changes. */
function useSharedSession(): DecodeState {
  const [state, setState] = useState<DecodeState>({ status: "loading" });
  useEffect(() => {
    const read = () => {
      // Strip the leading '#'. Everything after it is the compressed payload.
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) {
        setState({ status: "empty" });
        return;
      }
      const payload = decodeShare(raw);
      setState(payload ? { status: "ready", payload } : { status: "invalid" });
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return state;
}

/** yyyy-mm-dd → a friendly local date; falls back to the raw string if unparseable. */
function formatDate(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function FollowAlong() {
  const state = useSharedSession();

  if (state.status === "loading") {
    return <Centered>Loading the prayers…</Centered>;
  }
  if (state.status === "empty") {
    return (
      <Centered>
        <h1 className="font-display text-2xl">Nothing to follow yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page opens a shared prayer session. Ask the host to send you the full link.
        </p>
      </Centered>
    );
  }
  if (state.status === "invalid") {
    return (
      <Centered>
        <h1 className="font-display text-2xl">This link looks incomplete</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The prayers couldn't be read from this link — it may have been cut off. Ask the host to
          reshare the whole link.
        </p>
      </Centered>
    );
  }

  const { cover, items } = state.payload;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-5 py-10">
        {/* Cover */}
        <header className="mb-10 text-center">
          <p className="eyebrow">Follow along</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{cover.title}</h1>
          <p className="mt-2 text-sm font-medium text-primary">{formatDate(cover.date)}</p>
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
              payload={state.payload}
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
          Shared from Faith Journey · read-only
        </footer>
      </div>
    </main>
  );
}

/** A simple centered container for the loading/empty/invalid states. */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">{children}</div>
    </main>
  );
}
