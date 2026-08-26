import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/prayer/store";
import { ordinal } from "@/components/prayer/DevotionItemsEditor";
import { recurrenceLabel, songSegmentLabel } from "@/lib/prayer/compiler";
import type { PrayerHour, TemplateItem } from "@/lib/prayer/types";

export const Route = createFileRoute("/devotion/$devotionId")({
  head: () => ({
    meta: [
      { title: "Devotion — Faith Journey" },
      {
        name: "description",
        content:
          "A full summary of a devotion — every prayer laid out, with its schedule and source.",
      },
      { property: "og:title", content: "Devotion — Faith Journey" },
      { property: "og:description", content: "Every prayer in the devotion, in order, printable." },
    ],
  }),
  component: DevotionPage,
});

const HOUR_LABEL: Record<PrayerHour, string> = {
  office_of_readings: "Office of Readings",
  lauds: "Morning Prayer (Lauds)",
  daytime: "Daytime Prayer",
  vespers: "Evening Prayer (Vespers)",
  compline: "Night Prayer (Compline)",
};

function DevotionPage() {
  const { devotionId } = Route.useParams();
  const { db, ready, duplicateTemplate, deleteTemplate } = useApp();
  const navigate = useNavigate();

  const template = db.templates.find((t) => t.id === devotionId);
  const items = useMemo(
    () =>
      db.template_items
        .filter((i) => i.template_id === devotionId)
        .sort((a, b) => a.position - b.position),
    [db.template_items, devotionId],
  );

  // Which step indices are expanded. Collapse/expand all flips the whole set.
  const [open, setOpen] = useState<Set<number>>(new Set());
  const collapsible = items.filter((i) => i.kind !== "heading").length;

  if (!ready) {
    return (
      <AppShell title="Devotion" back={{ to: "/prayers", label: "Prayers" }}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }
  if (!template) {
    return (
      <AppShell title="Devotion" back={{ to: "/prayers", label: "Prayers" }}>
        <p className="text-sm text-muted-foreground">This devotion isn&apos;t in your library.</p>
      </AppShell>
    );
  }

  const source = template.source_id
    ? db.sources.find((s) => s.id === template.source_id)
    : undefined;
  // The devotion's default audio — the linked media on the devotion itself.
  const audioLinks = (template.media ?? []).filter((m) => m.source === "link");
  const schedule = [
    template.default_recurrence ? recurrenceLabel(template.default_recurrence) : null,
    template.default_start_time ?? null,
    template.default_hour ? HOUR_LABEL[template.default_hour] : null,
  ].filter(Boolean);
  const mystery =
    template.mystery_count > 0
      ? `${template.mystery_count} mysteries · ${
          template.fixed_mystery_set_id
            ? (db.mystery_sets.find((s) => s.id === template.fixed_mystery_set_id)?.name ??
              "fixed set")
            : "by day"
        }`
      : null;

  const allOpen = () => setOpen(new Set(items.map((_, i) => i)));
  const allClosed = () => setOpen(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // Devotion-level actions live in the ⋯ menu, matching Sessions/Prayers.
  const pageMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Devotion actions"
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <MoreVertical className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            navigate({ to: "/template/$templateId", params: { templateId: template.id } })
          }
        >
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const id = duplicateTemplate(template.id);
            if (id) {
              toast.success("Saved a copy — edit it here.");
              navigate({ to: "/template/$templateId", params: { templateId: id } });
            }
          }}
        >
          <Copy className="size-4" /> Save as (copy)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (!window.confirm(`Delete devotion “${template.name}”?`)) return;
            deleteTemplate(template.id);
            toast.success("Devotion deleted");
            navigate({ to: "/prayers" });
          }}
        >
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell title={template.name} back={{ to: "/prayers", label: "Prayers" }} action={pageMenu}>
      <div className="space-y-4">
        {template.description ? (
          <p className="text-sm text-muted-foreground">{template.description}</p>
        ) : null}

        {schedule.length || mystery || source ? (
          <div className="flex flex-wrap gap-1.5">
            {schedule.map((s) => (
              <span
                key={s}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {mystery ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                {mystery}
              </span>
            ) : null}
            {source ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                Source: {source.name}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={allOpen}
            disabled={open.size >= collapsible}
            aria-label="Expand all"
            title="Expand all"
          >
            <ChevronsUpDown className="size-4" aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={allClosed}
            disabled={open.size === 0}
            aria-label="Collapse all"
            title="Collapse all"
          >
            <ChevronsDownUp className="size-4" aria-hidden />
          </Button>
        </div>

        <ol className="space-y-2">
          {items.map((item, i) => (
            <DevotionStep
              key={item.id}
              item={item}
              index={i}
              open={open.has(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </ol>

        {audioLinks.length ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Audio</p>
            <ul className="mt-1 space-y-1">
              {audioLinks.map((m) => (
                <li key={m.id}>
                  {m.label ? (
                    <span className="text-sm text-muted-foreground">{m.label}: </span>
                  ) : null}
                  <ExtLink href={m.url} className="break-all text-sm text-primary underline">
                    {m.url}
                  </ExtLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {source && (source.url || source.file_reference) ? (
          <section className="soft-card p-4">
            <p className="eyebrow">Source</p>
            <p className="mt-1 text-sm">{source.name}</p>
            {source.url ? (
              <ExtLink
                className="mt-1 block break-all text-sm text-primary underline"
                href={source.url}
              >
                {source.url}
              </ExtLink>
            ) : null}
            {source.file_reference ? (
              <p className="mt-1 break-all text-sm text-muted-foreground">
                File: {source.file_reference}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

/** One collapsible step. Headings render as plain section dividers. */
function DevotionStep({
  item,
  index,
  open,
  onToggle,
}: {
  item: TemplateItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { db } = useApp();

  if (item.kind === "heading") {
    return (
      <li className="pt-3">
        <p className="eyebrow">{item.label ?? "Section"}</p>
      </li>
    );
  }

  // Title + expandable body per step kind. The prayer's own source isn't shown
  // here — only the devotion's source (top of page) matters for the summary.
  let title = item.label ?? item.kind;
  let detail: string | undefined;
  let body: string | undefined;
  let urls: string[] = [];

  if (item.kind === "prayer") {
    const prayer = db.prayers.find((p) => p.id === item.prayer_id);
    title = prayer?.title ?? "Prayer";
    if (item.repetition_count > 1) detail = `× ${item.repetition_count}`;
    body = db.prayer_versions.find((v) => v.id === prayer?.default_version_id)?.body;
  } else if (item.kind === "song") {
    const prayer = db.prayers.find((p) => p.id === item.prayer_id);
    title = prayer?.title ?? "Song";
    const version =
      db.prayer_versions.find(
        (v) => v.id === (item.prayer_version_id ?? prayer?.default_version_id),
      ) ?? db.prayer_versions.find((v) => v.prayer_id === item.prayer_id);
    const segments = version?.segments ?? [];
    const chosen =
      item.song_segments && item.song_segments.length
        ? item.song_segments
            .map((o) => segments.find((s) => s.ordinal === o))
            .filter((s): s is NonNullable<typeof s> => !!s)
        : [];
    if (chosen.length) {
      detail = chosen.map((s) => s.label ?? songSegmentLabel(s)).join(" · ");
      body = chosen.map((s) => s.body).join("\n\n");
    } else {
      if (segments.length) detail = "Whole song";
      body = version?.body;
    }
  } else if (item.kind === "mystery_placeholder") {
    title = `Announce the ${ordinal(item.mystery_ordinal ?? 1)} mystery`;
    body = "Announced and meditated when you pray — depends on the day's mysteries.";
  } else if (item.kind === "scripture") {
    title = item.reference ?? "Scripture";
    body = item.body;
  } else if (item.kind === "external_link") {
    title = item.label ?? "Pray along";
    urls = (item.external_options ?? []).map((o) => o.url);
  } else {
    body = item.body;
  }

  return (
    <li className="soft-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{title}</span>
          {detail ? <span className="ml-1 text-sm text-muted-foreground">{detail}</span> : null}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border/60 px-5 py-3">
          {body ? (
            <p className="prayer-text whitespace-pre-line text-sm text-muted-foreground">{body}</p>
          ) : null}
          {urls.length ? (
            <ul className="space-y-1">
              {urls.map((u) => (
                <li key={u}>
                  <ExtLink href={u} className="block break-all text-sm text-primary underline">
                    {u}
                  </ExtLink>
                </li>
              ))}
            </ul>
          ) : null}
          {!body && !urls.length ? (
            <p className="text-sm text-muted-foreground">No additional text.</p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
