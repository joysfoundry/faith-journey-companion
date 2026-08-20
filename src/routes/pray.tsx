import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, Play, Plus, Save, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/prayer/store";
import {
  generatePrayerSession,
  listenSources,
  newId,
  resolveNovenaDay,
  templateOutline,
  todayISO,
} from "@/lib/prayer/compiler";
import type {
  MysteryPresentation,
  ProgressMode,
  Recurrence,
  SessionContext,
  SessionPlan,
} from "@/lib/prayer/types";

export const Route = createFileRoute("/pray")({
  head: () => ({
    meta: [
      { title: "Begin Prayer — Faith Journey" },
      {
        name: "description",
        content:
          "Assemble a prayer or devotion session — set the mysteries, how you listen, and when to pray it — then save or begin.",
      },
      { property: "og:title", content: "Begin Prayer — Faith Journey" },
      {
        property: "og:description",
        content: "Devotions expand into complete sessions — no counting, no page flipping.",
      },
    ],
  }),
  component: PrayPage,
});

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: "Once",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
};

function PrayPage() {
  const { db, startSession, deleteSession, saveSessionPlan, deleteSessionPlan } = useApp();
  const navigate = useNavigate();
  const today = todayISO();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [dateVal, setDateVal] = useState(today);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [templateId, setTemplateId] = useState(db.templates[0]?.id ?? "");
  const [progressMode, setProgressMode] = useState<ProgressMode>("scroll");
  const [mysterySet, setMysterySet] = useState("auto");
  const [presentation, setPresentation] = useState<MysteryPresentation | "template">("template");
  const [listenIndex, setListenIndex] = useState("");
  const [novenaInstanceId, setNovenaInstanceId] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const template = db.templates.find((t) => t.id === templateId) ?? db.templates[0];
  const isNovena = template?.kind === "novena";
  const novenaInstances = db.novena_instances.filter((n) => n.template_id === templateId);
  const sources = template ? listenSources(db, template) : [];
  const chosenSource = sources[Number(listenIndex)];

  const buildContext = (): Partial<SessionContext> => ({
    progress_mode: progressMode,
    ...(mysterySet !== "auto" ? { mystery_set_id: mysterySet } : {}),
    ...(presentation !== "template" ? { mystery_presentation: presentation } : {}),
    ...(isNovena && novenaInstanceId ? { novena_instance_id: novenaInstanceId } : {}),
    ...(chosenSource ? { listen_source: chosenSource, audio_enabled: true } : {}),
  });

  const previewItems = useMemo(() => {
    if (!previewOpen || !template) return [];
    return generatePrayerSession(db, template, { date: today, ...buildContext() }).items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, template, mysterySet, presentation, novenaInstanceId, listenIndex, progressMode]);

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    setListenIndex("");
    setMysterySet("auto");
    setPresentation("template");
    setNovenaInstanceId("");
    setPreviewOpen(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setPurpose("");
    setDateVal(today);
    setRecurrence("none");
    pickTemplate(db.templates[0]?.id ?? "");
  };

  const loadPlan = (plan: SessionPlan) => {
    const tpl = db.templates.find((t) => t.id === plan.template_id);
    setEditingId(plan.id);
    setPurpose(plan.purpose ?? "");
    setDateVal(plan.date ?? today);
    setRecurrence(plan.recurrence);
    setTemplateId(plan.template_id);
    setProgressMode(plan.context.progress_mode ?? "scroll");
    setMysterySet(plan.context.mystery_set_id ?? "auto");
    setPresentation(plan.context.mystery_presentation ?? "template");
    setNovenaInstanceId(plan.context.novena_instance_id ?? "");
    const srcs = tpl ? listenSources(db, tpl) : [];
    const idx = srcs.findIndex((s) => s.url === plan.context.listen_source?.url);
    setListenIndex(idx >= 0 ? String(idx) : "");
    setPreviewOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = () => {
    if (!template) return;
    const plan: SessionPlan = {
      id: editingId ?? newId("plan"),
      template_id: template.id,
      ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      ...(dateVal ? { date: dateVal } : {}),
      recurrence,
      context: buildContext(),
      created_at:
        (editingId && db.session_plans.find((p) => p.id === editingId)?.created_at) ||
        new Date().toISOString(),
    };
    saveSessionPlan(plan);
    resetForm();
  };

  const beginContext = (ctx: Partial<SessionContext>, tId: string) => {
    const session = startSession(tId, { date: today, ...ctx });
    if (session) navigate({ to: "/session/$sessionId", params: { sessionId: session.id } });
  };

  const plans = [...db.session_plans].sort(
    (a, b) =>
      (a.date ?? "9999-99-99").localeCompare(b.date ?? "9999-99-99") ||
      a.created_at.localeCompare(b.created_at),
  );
  const openSessions = db.sessions.filter((s) => !s.completed_at);

  return (
    <AppShell title="Pray" subtitle="Assemble your devotion or prayer session.">
      <div className="space-y-4">
        {editingId ? (
          <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2 text-sm">
            <span className="font-medium">Editing a saved session</span>
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-muted-foreground">
              <Plus className="size-4" /> New
            </button>
          </div>
        ) : null}

        <div className="soft-card space-y-3 p-4">
          <div>
            <Label htmlFor="purpose">Purpose (optional)</Label>
            <Input
              id="purpose"
              value={purpose}
              placeholder="e.g. Monthly Family Rosary"
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="template">What would you like to pray?</Label>
            <select
              id="template"
              value={template?.id ?? ""}
              onChange={(e) => pickTemplate(e.target.value)}
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
        </div>

        <div className="soft-card grid grid-cols-2 gap-3 p-4">
          <div>
            <Label htmlFor="date">Date to pray</Label>
            <Input
              id="date"
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="recurrence">Recurrence</Label>
            <select
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3"
            >
              {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
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
                <option value="auto">Today&apos;s mysteries</option>
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
                <option value="template">As saved in the devotion</option>
                <option value="title_only">Title only</option>
                <option value="title_and_description">Title and description</option>
                <option value="choose_during_session">Ask me during the session</option>
              </select>
            </div>
          </div>
        ) : null}

        <div className="soft-card space-y-3 p-4">
          <div>
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
          <div>
            <Label htmlFor="listen">How do you want to listen?</Label>
            <select
              id="listen"
              value={listenIndex}
              onChange={(e) => setListenIndex(e.target.value)}
              disabled={sources.length === 0}
              className="mt-2 h-12 w-full rounded-md border border-input bg-card px-3 disabled:opacity-60"
            >
              <option value="">Read silently — no audio</option>
              {sources.map((s, i) => (
                <option key={s.url} value={String(i)}>
                  {s.label} ({s.kind})
                </option>
              ))}
            </select>
            {sources.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No audio or video attached to this devotion yet. Add media or an audio/video link in
                the devotion builder.
              </p>
            ) : null}
          </div>
        </div>

        {previewOpen ? (
          <div className="soft-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">Preview — {previewItems.length} steps</p>
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewOpen(false)}
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ol className="max-h-80 space-y-1 overflow-y-auto text-sm">
              {previewItems.map((it, i) => (
                <li key={it.id} className="flex gap-2">
                  <span className="w-6 shrink-0 text-right text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span>
                    {it.title}
                    {it.repetition_total && it.repetition_total > 1 ? (
                      <span className="text-muted-foreground">
                        {" "}
                        ({it.repetition_index}/{it.repetition_total})
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Action row: preview · save */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="h-12 flex-1"
            onClick={() => setPreviewOpen((o) => !o)}
            disabled={!template}
          >
            <Eye className="size-5" /> Preview
          </Button>
          <Button className="h-12 flex-1" onClick={save} disabled={!template}>
            <Save className="size-5" /> {editingId ? "Update session" : "Save session"}
          </Button>
        </div>

        {plans.length > 0 ? (
          <section>
            <p className="eyebrow mt-6 mb-2">Saved sessions</p>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {plans.map((plan) => {
                const tpl = db.templates.find((t) => t.id === plan.template_id);
                const title = plan.purpose || tpl?.name || "Session";
                const dateLabel = plan.date
                  ? new Date(`${plan.date}T00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Any time";
                const sub = [
                  plan.purpose ? tpl?.name : null,
                  plan.recurrence !== "none" ? RECURRENCE_LABEL[plan.recurrence] : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={plan.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="w-12 shrink-0 text-xs font-semibold text-primary tabular-nums">
                      {dateLabel}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">{title}</p>
                      {sub ? (
                        <p className="truncate text-xs text-muted-foreground">{sub}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Edit session"
                        className="p-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => loadPlan(plan)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete session"
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSessionPlan(plan.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Begin session"
                        className="p-1.5 text-primary hover:opacity-80"
                        onClick={() => beginContext(plan.context, plan.template_id)}
                      >
                        <Play className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

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
