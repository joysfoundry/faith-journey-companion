import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Copy, Download, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/prayer/compiler";
import {
  ALL_TIME,
  DEFAULT_INSIGHT_PROMPT,
  buildJourneyExport,
  journeyDateBounds,
  sinceLastExport,
  type ExportRange,
} from "@/lib/prayer/journeyExport";
import { useApp } from "@/lib/prayer/store";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export your journey — Oravia" },
      {
        name: "description",
        content:
          "Export your reflections, prayers, intentions and reading as one file you can paste into ChatGPT or Claude to look for patterns.",
      },
      { property: "og:title", content: "Export your journey — Oravia" },
      {
        property: "og:description",
        content: "One file, with the prompt already written, for looking back over your journey.",
      },
    ],
  }),
  component: ExportPage,
});

/** Rough, friendly size — people read words, not characters. */
function approxWords(characters: number): number {
  return Math.round(characters / 5.5);
}

/**
 * ACTS-157 — Export your journey.
 *
 * Builds one Markdown document (reflections, prayers prayed, intentions, Mass
 * notes, reading) with the insight prompt written into the top, for the user to
 * paste into ChatGPT or Claude. Everything happens on the device; the file only
 * leaves if the user takes it somewhere, which the page says out loud.
 *
 * Deliberately not ACTS-113 — no AI runs here.
 */
type Mode = "since" | "all" | "range";

function ExportPage() {
  const { db, updateSettings } = useApp();
  const bounds = useMemo(() => journeyDateBounds(db), [db]);
  const today = todayISO();

  // Only offered once something has actually been exported.
  const since = sinceLastExport(db.settings.last_export_at);

  // Repeat visits are the common case, so the catch-up window leads when there
  // is one; a first-time visitor has nothing to catch up on and gets Everything.
  const [mode, setMode] = useState<Mode>(since ? "since" : "all");
  const [from, setFrom] = useState(bounds.first ?? "");
  const [to, setTo] = useState(today);
  const [prompt, setPrompt] = useState(DEFAULT_INSIGHT_PROMPT);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const backwards = mode === "range" && Boolean(from) && Boolean(to) && from > to;

  /**
   * Stamped only when the document actually leaves this screen — copied or
   * downloaded. Opening the page, changing the range or editing the prompt must
   * never move the marker, or "since last export" would skip entries the user
   * never received.
   */
  const stampExport = () => updateSettings({ last_export_at: new Date().toISOString() });

  // A stale mode can't survive: if "since" is selected and the stamp somehow
  // isn't there, fall back to Everything rather than exporting an empty window.
  const effectiveMode: Mode = mode === "since" && !since ? "all" : mode;

  const range: ExportRange = useMemo(() => {
    if (effectiveMode === "since") return since ?? ALL_TIME;
    if (effectiveMode === "all") return ALL_TIME;
    return { from: from || null, to: to || null };
  }, [effectiveMode, since, from, to]);

  const result = useMemo(
    () => buildJourneyExport(db, { range, prompt, today }),
    [db, range, prompt, today],
  );

  const nothingToExport = result.counts.total === 0;
  const disabled = backwards || nothingToExport;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.markdown);
      stampExport();
      setCopied(true);
      toast.success("Copied — paste it into ChatGPT or Claude");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy — download the file instead");
    }
  };

  const download = () => {
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    stampExport();
    toast.success(`Saved ${result.filename}`);
  };

  const modeButton = (value: Mode, label: string, hint: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={effectiveMode === value}
      className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
        effectiveMode === value
          ? "border-primary/60 bg-primary/10 text-foreground"
          : "border-border/60 text-muted-foreground hover:bg-foreground/5"
      }`}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="block text-xs text-muted-foreground">{hint}</span>
    </button>
  );

  return (
    <AppShell
      title="Export your journey"
      subtitle="One file you can paste into ChatGPT or Claude to look for patterns."
    >
      <div className="space-y-6">
        {/* ------------------------------- What ------------------------------- */}
        <section className="soft-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-muted-foreground" aria-hidden />
            <p className="eyebrow">What this does</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Oravia gathers your reflections, the prayers and devotions you prayed, the intentions
            you carried, your Mass notes and what you were reading into a single document — with the
            instructions already written at the top. Paste it into ChatGPT or Claude and ask it what
            it notices. Oravia doesn&rsquo;t interpret your journey for you; it just hands you
            everything you wrote, in one piece.
          </p>
        </section>

        {/* ------------------------------- Range ------------------------------- */}
        <section className="soft-card p-4">
          <p className="eyebrow">How far back</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {since
              ? modeButton("since", "Since last export", `${since.from} to today — what's new`)
              : null}
            {modeButton(
              "all",
              "Everything",
              bounds.first ? `${bounds.first} to today` : "Your whole journey",
            )}
            {modeButton("range", "Date range", "Pick a start and an end")}
          </div>

          {effectiveMode === "since" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Counting from the whole day you last exported, so nothing written later that day slips
              through — a few entries may repeat.
            </p>
          ) : null}

          {effectiveMode === "range" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="export-from">From</Label>
                <Input
                  id="export-from"
                  type="date"
                  className="h-11"
                  value={from}
                  max={today}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="export-to">To</Label>
                <Input
                  id="export-to"
                  type="date"
                  className="h-11"
                  value={to}
                  max={today}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {backwards ? (
            <p className="mt-3 text-sm text-destructive">The start date is after the end date.</p>
          ) : null}
        </section>

        {/* ------------------------------ Prompt ------------------------------- */}
        <section className="soft-card p-4">
          <button
            type="button"
            onClick={() => setPromptOpen((v) => !v)}
            aria-expanded={promptOpen}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span>
              <span className="eyebrow block">The prompt</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                The file opens with instructions for the AI — including that it must never claim to
                speak for God or tell you what to decide. You can change the wording.
              </span>
            </span>
            <ChevronDown
              className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                promptOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>

          {promptOpen ? (
            <div className="mt-3 space-y-2">
              <Textarea
                aria-label="Prompt written into the exported file"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-64 font-mono text-xs leading-relaxed"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrompt(DEFAULT_INSIGHT_PROMPT)}
                disabled={prompt === DEFAULT_INSIGHT_PROMPT}
              >
                <RotateCcw className="size-4" /> Reset to the default
              </Button>
            </div>
          ) : null}
        </section>

        {/* ------------------------------ Summary ------------------------------ */}
        <section className="soft-card p-4">
          <p className="eyebrow">What you&rsquo;ll get</p>
          <p className="mt-2 text-sm text-muted-foreground">{result.rangeLabel}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
            {(
              [
                ["Reflections", result.counts.reflections],
                ["Prayers prayed", result.counts.sessions],
                ["Intentions", result.counts.intentions],
                ["Masses", result.counts.masses],
                ["Reading", result.counts.knowledge],
              ] as const
            ).map(([label, n]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium text-foreground">{n}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            About {approxWords(result.characters).toLocaleString()} words.
          </p>
          {result.oversized ? (
            <p className="mt-2 text-sm text-foreground">
              That&rsquo;s a long file — some chats won&rsquo;t take it all in one paste. Narrowing
              the dates will help.
            </p>
          ) : null}
          {nothingToExport ? (
            <p className="mt-2 text-sm text-muted-foreground">
              There&rsquo;s nothing recorded in this period yet.
            </p>
          ) : null}
        </section>

        {/* ------------------------------ Privacy ------------------------------ */}
        <section className="soft-card p-4">
          <p className="eyebrow">Before you paste it anywhere</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This file is built here on your device, and Oravia never sends it anywhere. But it holds
            your own words about your prayer, your family and whatever you were carrying — so the
            moment you paste it into ChatGPT, Claude or anything else, it goes to that
            company&rsquo;s servers under their terms, not ours. Only you can decide whether
            that&rsquo;s the right trade for what you get back.
          </p>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={copy} disabled={disabled} className="h-11 flex-1">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
          <Button onClick={download} disabled={disabled} variant="outline" className="h-11 flex-1">
            <Download className="size-4" /> Download the file
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
