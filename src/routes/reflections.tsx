import { createFileRoute } from "@tanstack/react-router";

import { ReflectionComposer } from "@/components/home/ReflectionComposer";
import { AppShell } from "@/components/layout/PageShell";
import {
  learnItems,
  readingPrograms,
  todaysReflections,
  todaysWord,
  type LinkableItem,
} from "@/domain/placeholderData";
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
        content: "Your journal — the connecting tissue across prayer, Word, and formation.",
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

  const linkables: LinkableItem[] = [
    { id: rosary?.id ?? "rosary", label: `Daily Rosary · ${setName}`, group: "Prayer & devotion" },
    { id: todaysWord.id, label: todaysWord.liturgicalTitle, group: "Word" },
    ...readingPrograms.map((p) => ({ id: p.id, label: p.title, group: "Word" })),
    ...learnItems.map((l) => ({ id: l.id, label: l.title, group: "Formation" })),
  ];

  return (
    <AppShell title="Reflection" subtitle="Write freely and link what inspired it">
      <ReflectionComposer linkables={linkables} entries={todaysReflections} />
    </AppShell>
  );
}
