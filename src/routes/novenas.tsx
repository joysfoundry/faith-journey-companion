import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/prayer/store";
import { newId, resolveNovenaDay, todayISO } from "@/lib/prayer/compiler";

export const Route = createFileRoute("/novenas")({
  head: () => ({
    meta: [
      { title: "Novenas — Prayer Companion" },
      {
        name: "description",
        content:
          "Start a novena with your own intention and dates. Each day's prayer session is generated from one reusable template.",
      },
      { property: "og:title", content: "Novenas — Prayer Companion" },
      {
        property: "og:description",
        content: "Configurable duration, phases, and rotating mysteries — no hard-coded nine days.",
      },
    ],
  }),
  component: NovenasPage,
});

function NovenasPage() {
  const { db, addIntention, addNovenaInstance, deleteNovenaInstance, startSession } = useApp();
  const navigate = useNavigate();
  const today = todayISO();
  const novenaTemplates = db.templates.filter((t) => t.kind === "novena");

  const [templateId, setTemplateId] = useState(novenaTemplates[0]?.id ?? "");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [intention, setIntention] = useState("");

  const create = () => {
    const template = db.templates.find((t) => t.id === templateId);
    if (!template || !name.trim()) {
      toast.error("Name your novena first.");
      return;
    }
    const intentionId = intention.trim() ? newId("intention") : undefined;
    if (intentionId) {
      addIntention({
        id: intentionId,
        title: intention.trim(),
        created_at: new Date().toISOString(),
      });
    }
    addNovenaInstance({
      id: newId("novena"),
      template_id: template.id,
      name: name.trim(),
      start_date: startDate,
      created_at: new Date().toISOString(),
      ...(intentionId ? { intention_id: intentionId } : {}),
    });
    setName("");
    setIntention("");
    toast.success("Novena started");
  };

  return (
    <AppShell title="Novenas" subtitle="One template, one session per day." back={{ to: "/more", label: "More" }}>
      <div className="space-y-4">
        <section className="soft-card space-y-3 p-4">
          <p className="eyebrow">Start a novena</p>
          <div>
            <Label htmlFor="tpl">Novena</Label>
            <select
              id="tpl"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1 h-12 w-full rounded-md border border-input bg-card px-3"
            >
              {novenaTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.novena?.duration_days ?? 9} days
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="nname">Name</Label>
            <Input
              id="nname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="54-Day Rosary Novena for Mom"
              className="mt-1 h-12"
            />
          </div>
          <div>
            <Label htmlFor="start">Start date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 h-12"
            />
          </div>
          <div>
            <Label htmlFor="intent">Intention</Label>
            <Input
              id="intent"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Mom's health"
              className="mt-1 h-12"
            />
          </div>
          <Button className="h-12 w-full" onClick={create}>
            Start novena
          </Button>
        </section>

        {db.novena_instances.map((instance) => {
          const template = db.templates.find((t) => t.id === instance.template_id);
          if (!template) return null;
          const res = resolveNovenaDay(template, instance, today);
          const intentionText = db.intentions.find((i) => i.id === instance.intention_id)?.title;
          return (
            <section key={instance.id} className="soft-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{instance.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.name} · started {instance.start_date}
                  </p>
                  {intentionText ? (
                    <p className="text-sm text-muted-foreground">For: {intentionText}</p>
                  ) : null}
                  <p className="mt-2 text-sm">
                    {res.out_of_range
                      ? "Outside the novena dates"
                      : `Day ${res.day} of ${template.novena?.duration_days} · ${res.phase?.name ?? ""}`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete novena"
                  onClick={() => deleteNovenaInstance(instance.id)}
                  className="p-2 text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Button
                className="mt-3 h-12 w-full"
                disabled={res.out_of_range}
                onClick={() => {
                  const session = startSession(template.id, {
                    date: today,
                    novena_instance_id: instance.id,
                    progress_mode: "scroll",
                  });
                  if (session)
                    navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
                }}
              >
                Pray day {res.day}
              </Button>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
