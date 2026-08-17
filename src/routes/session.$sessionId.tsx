import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/prayer/store";
import { ordinalWord, sessionProgress } from "@/lib/prayer/compiler";
import type { SessionItem } from "@/lib/prayer/types";

export const Route = createFileRoute("/session/$sessionId")({
  head: () => ({
    meta: [
      { title: "Prayer Mode — Prayer Companion" },
      {
        name: "description",
        content:
          "A distraction-free follow-along prayer session: every prayer, in order, with your place kept.",
      },
      { property: "og:title", content: "Prayer Mode — Prayer Companion" },
      {
        property: "og:description",
        content: "Follow the full text of every prayer without searching or counting.",
      },
    ],
  }),
  component: PrayerMode,
});

function useKeepAwake(enabled: boolean) {
  const sentinel = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    if (enabled && nav.wakeLock) {
      nav.wakeLock
        .request("screen")
        .then((s) => {
          if (cancelled) void s.release();
          else sentinel.current = s;
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
      void sentinel.current?.release().catch(() => undefined);
      sentinel.current = null;
    };
  }, [enabled]);
}

function PrayerMode() {
  const { sessionId } = Route.useParams();
  const { db, ready, setCursor, toggleItemDone, finishSession } = useApp();
  const navigate = useNavigate();

  const session = db.sessions.find((s) => s.id === sessionId);
  const items = useMemo(
    () =>
      db.session_items
        .filter((i) => i.session_id === sessionId)
        .sort((a, b) => a.position - b.position),
    [db.session_items, sessionId],
  );

  const [keepAwake, setKeepAwake] = useState(true);
  const [showMeditation, setShowMeditation] = useState(false);
  useKeepAwake(keepAwake);

  const cursor = Math.min(session?.cursor ?? 0, Math.max(0, items.length - 1));
  const item = items[cursor];
  const progress = sessionProgress(items);
  const manual = session?.context.progress_mode === "manual_done";

  useEffect(() => {
    setShowMeditation(false);
  }, [cursor]);

  if (!ready || !session) {
    return (
      <AppShell title="Prayer session" back={{ to: "/pray", label: "Pray" }}>
        <p className="text-sm text-muted-foreground">Preparing your session…</p>
      </AppShell>
    );
  }

  if (session.context.progress_mode === "scroll") {
    return (
      <ScrollSession
        title={session.title}
        items={items}
        onFinish={() => {
          finishSession(session.id);
          navigate({ to: "/" });
        }}
      />
    );
  }

  const go = (delta: number) => {
    const next = Math.min(Math.max(cursor + delta, 0), items.length - 1);
    setCursor(session.id, next);
  };

  const presentation = session.context.mystery_presentation;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto w-full max-w-lg px-5 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <X className="size-4" /> Close
          </Link>
          <p className="text-sm text-muted-foreground tabular-nums">
            {progress.done} / {progress.total}
          </p>
        </div>
        <Progress
          value={progress.total ? (progress.done / progress.total) * 100 : 0}
          className="mt-3 h-1"
        />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-8">
        {item ? <ItemView item={item} showMeditation={showMeditation} /> : null}

        {item?.kind === "mystery" && presentation === "choose_during_session" ? (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-12" onClick={() => setShowMeditation(true)}>
              Read meditation
            </Button>
            <Button className="h-12" onClick={() => go(1)}>
              Begin decade
            </Button>
          </div>
        ) : null}
      </main>

      <footer className="sticky bottom-0 border-t border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto w-full max-w-lg px-5 py-4">
          {manual && item ? (
            <Button
              className="mb-3 h-14 w-full text-base"
              variant={item.completion_status === "complete" ? "secondary" : "default"}
              onClick={() => {
                toggleItemDone(item.id);
                if (item.completion_status !== "complete" && cursor < items.length - 1) go(1);
              }}
            >
              <Check className="size-5" />
              {item.completion_status === "complete" ? "Marked done" : "Done"}
            </Button>
          ) : null}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="h-12 flex-1"
              onClick={() => go(-1)}
              disabled={cursor === 0}
            >
              <ChevronLeft className="size-5" /> Previous
            </Button>
            {cursor < items.length - 1 ? (
              <Button variant="secondary" className="h-12 flex-1" onClick={() => go(1)}>
                Next <ChevronRight className="size-5" />
              </Button>
            ) : (
              <Button
                className="h-12 flex-1"
                onClick={() => {
                  finishSession(session.id);
                  navigate({ to: "/" });
                }}
              >
                Finish
              </Button>
            )}
          </div>
          <label className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={keepAwake}
              onChange={(e) => setKeepAwake(e.target.checked)}
            />
            Keep screen awake
          </label>
        </div>
      </footer>
    </div>
  );
}

function ItemView({ item, showMeditation }: { item: SessionItem; showMeditation: boolean }) {
  if (item.kind === "mystery") {
    const config = (item.configuration ?? {}) as { heading?: string; presentation?: string };
    const showBody =
      item.body && (config.presentation !== "choose_during_session" || showMeditation);
    return (
      <div className="text-center">
        <p className="eyebrow">
          {config.heading ?? `${ordinalWord(item.mystery_ordinal ?? 1)} Mystery`}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2>
        {showBody ? (
          <p className="prayer-text mt-6 text-left text-[1.25rem] text-muted-foreground">
            {item.body}
          </p>
        ) : null}
      </div>
    );
  }

  if (item.kind === "intention") {
    return (
      <div className="text-center">
        <p className="eyebrow">Intention</p>
        <h2 className="mt-3 font-display text-3xl">{item.title}</h2>
        {item.body ? <p className="prayer-text mt-4">{item.body}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center font-display text-3xl leading-tight">{item.title}</h2>
      {item.repetition_total ? (
        <p className="mt-2 text-center text-base tracking-wide text-muted-foreground tabular-nums">
          {item.repetition_index} of {item.repetition_total}
        </p>
      ) : null}
      <p className="prayer-text mt-8">{item.body}</p>
    </div>
  );
}

function ScrollSession({
  title,
  items,
  onFinish,
}: {
  title: string;
  items: SessionItem[];
  onFinish: () => void;
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <X className="size-4" /> Close
          </Link>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </header>
      <div className="mx-auto max-w-lg space-y-14 px-6 py-10">
        {items.map((item) => (
          <section key={item.id}>
            <ItemView item={item} showMeditation />
          </section>
        ))}
        <Button className="h-14 w-full text-base" onClick={onFinish}>
          Finish session
        </Button>
      </div>
    </div>
  );
}
