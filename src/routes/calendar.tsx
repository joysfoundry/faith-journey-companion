import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/prayer/store";
import { defaultContext, resolveMysterySet, resolveNovenaDay, todayISO } from "@/lib/prayer/compiler";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Prayer Calendar — Prayer Companion" },
      {
        name: "description",
        content: "See the mysteries for any date, your novena days, and the sessions you have prayed.",
      },
      { property: "og:title", content: "Prayer Calendar — Prayer Companion" },
      {
        property: "og:description",
        content: "Date-based mystery selection and novena day tracking at a glance.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { db, startSession } = useApp();
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());

  const setId = resolveMysterySet(db, defaultContext({ date }));
  const set = db.mystery_sets.find((s) => s.id === setId);
  const mysteries = db.mysteries
    .filter((m) => m.mystery_set_id === setId)
    .sort((a, b) => a.position - b.position);

  const completed = db.sessions.filter((s) => s.completed_at);

  return (
    <AppShell title="Calendar" subtitle="Mysteries, novena days, and what you have prayed.">
      <div className="space-y-4">
        <div className="soft-card p-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12"
            aria-label="Choose a date"
          />
          <p className="eyebrow mt-4">Mysteries for this date</p>
          <p className="font-display text-2xl">{set?.name}</p>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            {mysteries.map((m, i) => (
              <li key={m.id}>
                {i + 1}. {m.title}
              </li>
            ))}
          </ol>
          <Button
            className="mt-4 h-12 w-full"
            onClick={() => {
              const session = startSession("tpl-rosary", {
                date,
                progress_mode: "scroll",
                ...(setId ? { mystery_set_id: setId } : {}),
              });
              if (session)
                navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
            }}
          >
            Pray these mysteries
          </Button>
        </div>

        {db.novena_instances.length > 0 ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Novena days</p>
            <ul className="mt-2 space-y-2 text-sm">
              {db.novena_instances.map((instance) => {
                const template = db.templates.find((t) => t.id === instance.template_id);
                if (!template) return null;
                const res = resolveNovenaDay(template, instance, date);
                return (
                  <li key={instance.id}>
                    <span className="font-medium">{instance.name}</span> —{" "}
                    {res.out_of_range
                      ? "not in range"
                      : `Day ${res.day}${res.phase ? ` · ${res.phase.name}` : ""}`}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="soft-card p-4">
          <p className="eyebrow">Prayed</p>
          {completed.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing recorded yet. Sessions you finish will appear here.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {completed.slice(0, 20).map((s) => (
                <li key={s.id} className="flex justify-between gap-3">
                  <span>{s.title}</span>
                  <span className="text-muted-foreground">
                    {new Date(s.completed_at!).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
