import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/prayer/store";
import {
  defaultContext,
  resolveMysterySet,
  resolveNovenaDay,
  templateOutline,
  todayISO,
} from "@/lib/prayer/compiler";
import type { MysteryPresentation, ProgressMode } from "@/lib/prayer/types";

export const Route = createFileRoute("/pray")({
  head: () => ({
    meta: [
      { title: "Begin Prayer — Faith Journey" },
      {
        name: "description",
        content:
          "Choose a template, set the mysteries and progress mode, then begin a fully prepared prayer session.",
      },
      { property: "og:title", content: "Begin Prayer — Faith Journey" },
      {
        property: "og:description",
        content: "Templates expand into complete sessions — no counting, no page flipping.",
      },
    ],
  }),
  component: PrayPage,
});

function PrayPage() {
  const { db, startSession, deleteSession } = useApp();
  const navigate = useNavigate();
  const today = todayISO();

  const [templateId, setTemplateId] = useState(db.templates[0]?.id ?? "");
  const [progressMode, setProgressMode] = useState<ProgressMode>("scroll");
  const [mysterySet, setMysterySet] = useState("auto");
  const [presentation, setPresentation] = useState<MysteryPresentation | "template">("template");
  const [novenaInstanceId, setNovenaInstanceId] = useState("");

  const template = db.templates.find((t) => t.id === templateId) ?? db.templates[0];
  const autoSetId = resolveMysterySet(db, defaultContext({ date: today }));
  const autoSetName = db.mystery_sets.find((s) => s.id === autoSetId)?.name;
  const isNovena = template?.kind === "novena";
  const novenaInstances = db.novena_instances.filter((n) => n.template_id === templateId);

  const begin = () => {
    if (!template) return;
    const session = startSession(template.id, {
      date: today,
      progress_mode: progressMode,
      ...(mysterySet !== "auto" ? { mystery_set_id: mysterySet } : {}),
      ...(presentation !== "template" ? { mystery_presentation: presentation } : {}),
      ...(isNovena && novenaInstanceId ? { novena_instance_id: novenaInstanceId } : {}),
    });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  };

  const openSessions = db.sessions.filter((s) => !s.completed_at);

  return (
    <AppShell title="Pray" subtitle="Everything is assembled before you begin.">
      <div className="space-y-4">
        <div className="soft-card p-4">
          <Label htmlFor="template">What would you like to pray?</Label>
          <select
            id="template"
            value={template?.id ?? ""}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
          >
            {db.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {template ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {templateOutline(db, template)
                .slice(0, 6)
                .map((o) => `${o.label}${o.detail ? ` ${o.detail}` : ""}`)
                .join(" · ")}
              {" …"}
            </p>
          ) : null}
        </div>

        {isNovena ? (
          <div className="soft-card p-4">
            <Label htmlFor="novena">Novena</Label>
            <select
              id="novena"
              value={novenaInstanceId}
              onChange={(e) => setNovenaInstanceId(e.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
            >
              <option value="">Not tracking a novena</option>
              {novenaInstances.map((n) => {
                const res = template ? resolveNovenaDay(template, n, today) : undefined;
                return (
                  <option key={n.id} value={n.id}>
                    {n.name}
                    {res ? ` — Day ${res.day}${res.phase ? ` (${res.phase.name})` : ""}` : ""}
                  </option>
                );
              })}
            </select>
            <Link to="/novenas" className="mt-2 inline-block text-sm underline">
              Manage novenas
            </Link>
          </div>
        ) : null}

        {template && template.mystery_count > 0 ? (
          <div className="soft-card space-y-3 p-4">
            <div>
              <Label htmlFor="mysteries">Mysteries</Label>
              <select
                id="mysteries"
                value={mysterySet}
                onChange={(e) => setMysterySet(e.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
              >
                <option value="auto">Today&apos;s mysteries ({autoSetName})</option>
                {db.mystery_sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="presentation">Mystery descriptions</Label>
              <select
                id="presentation"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value as MysteryPresentation | "template")}
                className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
              >
                <option value="template">As saved in the template</option>
                <option value="title_only">Title only</option>
                <option value="title_and_description">Title and description</option>
                <option value="choose_during_session">Ask me during the session</option>
              </select>
            </div>
          </div>
        ) : null}

        <div className="soft-card p-4">
          <Label htmlFor="progress">Progress</Label>
          <select
            id="progress"
            value={progressMode}
            onChange={(e) => setProgressMode(e.target.value as ProgressMode)}
            className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
          >
            <option value="scroll">Scroll only — no tracking</option>
            <option value="manual_done">Mark each prayer Done</option>
          </select>
        </div>

        <Button className="h-14 w-full text-base" onClick={begin}>
          <Sparkles className="size-5" /> Begin Prayer
        </Button>

        {openSessions.length > 0 ? (
          <section>
            <p className="eyebrow mt-6 mb-2">In progress</p>
            <ul className="space-y-2">
              {openSessions.map((s) => (
                <li key={s.id} className="soft-card flex items-center">
                  <Link
                    to="/session/$sessionId"
                    params={{ sessionId: s.id }}
                    className="flex-1 p-4"
                  >
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete session"
                    className="px-4 py-5 text-muted-foreground"
                    onClick={() => deleteSession(s.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
