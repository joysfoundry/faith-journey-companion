import { createFileRoute } from "@tanstack/react-router";

import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { AppShell } from "@/components/layout/PageShell";
import { readingPrograms, todaysWord, type LinkableItem } from "@/domain/placeholderData";
import { defaultContext, resolveMysterySet, todayISO } from "@/lib/prayer/compiler";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/reflections")({
  head: () => ({
    meta: [
      { title: "Reflection — Faith Journey" },
      {
        name: "description",
        content:
          "Write reflections and link them to the prayer, reading, Mass, or book that prompted them.",
      },
      { property: "og:title", content: "Reflection — Faith Journey" },
      {
        property: "og:description",
        content: "Your journal — the connecting tissue across prayer, Word, and learning.",
      },
    ],
  }),
  component: ReflectionsPage,
});

function ReflectionsPage() {
  const { db } = useApp();
  const today = todayISO();
  const setId = resolveMysterySet(db, defaultContext({ date: today }));
  const setName = db.mystery_sets.find((s) => s.id === setId)?.name ?? "Mysteries";
  const rosary = db.templates.find((t) => t.id === "tpl-rosary") ?? db.templates[0];

  const recentSessions = [...db.sessions]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 5)
    .map((s) => ({ id: s.id, label: s.title, group: "Prayer & devotion" }));

  const linkables: LinkableItem[] = [
    ...recentSessions,
    { id: rosary?.id ?? "rosary", label: `Daily Rosary · ${setName}`, group: "Prayer & devotion" },
    { id: todaysWord.id, label: todaysWord.liturgicalTitle, group: "Word" },
    ...readingPrograms.map((p) => ({ id: p.id, label: p.title, group: "Word" })),
    ...db.learning_items.map((l) => ({ id: l.id, label: l.title, group: "Learn" })),
  ];

  return (
    <AppShell title="Reflection" subtitle="Write freely and link what inspired it">
      <ReflectionComposer linkables={linkables} />
    </AppShell>
  );
}
