import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { OnlineBibleLink, WordSection } from "@/components/home/WordSection";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/prayer/compiler";
import { LECTIO_TEMPLATE_ID } from "@/lib/prayer/seed";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/word")({
  head: () => ({
    meta: [
      { title: "Word — Oravia" },
      {
        name: "description",
        content:
          "Today's Mass readings, the Mass you attended, and the reading programs you follow.",
      },
      { property: "og:title", content: "Word — Oravia" },
      {
        property: "og:description",
        content: "Daily Mass readings, homily capture, and your reading programs.",
      },
    ],
  }),
  component: WordPage,
});

/**
 * Lectio Divina entry on the Word page (ACTS-191). Reuses the seeded 4-movement
 * Lectio session — the same guided block reached from the reflection composer —
 * so the reader can begin a prayerful reading of a passage they choose right from
 * the Word. One tap starts a fresh session; the passage is chosen in-session and
 * pinned at the top for reference across the movements.
 */
function LectioEntry() {
  const { startSession } = useApp();
  const navigate = useNavigate();

  function startLectio() {
    const session = startSession(LECTIO_TEMPLATE_ID, {
      date: todayISO(),
      progress_mode: "scroll",
    });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  }

  return (
    <div className="soft-card space-y-3 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight">Lectio Divina</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A slow, prayerful reading of Scripture in four movements — read, reflect, respond,
            rest. Choose a passage and let it speak.
          </p>
        </div>
      </div>
      <Button className="w-full" onClick={startLectio}>
        Begin Lectio Divina
      </Button>
    </div>
  );
}

function WordPage() {
  const navigate = useNavigate();

  return (
    <AppShell
      title="Word"
      subtitle="Today's readings and your reading programs"
      action={<OnlineBibleLink />}
    >
      <div className="space-y-6">
        <WordSection onReflect={() => navigate({ to: "/reflections" })} />
        <LectioEntry />
      </div>
    </AppShell>
  );
}
