import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mic,
  NotebookPen,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveBibleHomeUrl } from "@/lib/bible/apps";
import { todaysWord } from "@/domain/placeholderData";
import { newId, todayISO } from "@/lib/prayer/compiler";
import {
  SECTION_LABEL,
  byStatusThenRecent,
  isScriptureProgram,
  knowledgeSubtitle,
  primaryUrl,
} from "@/lib/prayer/knowledge";
import { getLiturgicalDay, type LiturgicalDay } from "@/lib/liturgical/calendar";
import { useApp } from "@/lib/prayer/store";

/** Icon-only row action. Visible label omitted; kept for a11y + tooltip. */
function RowIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

/**
 * Word: today's Mass readings, the optional "heard at Mass" capture, and any
 * Bible-reading programs. Reading programs are Knowledge `program` items flagged
 * `reads_scripture` — still managed in the Knowledge library, but surfaced here
 * because they belong with the Word. Renders flat rows inside the Word card.
 */
export function WordSection({ onReflect }: { onReflect: (linkId: string) => void }) {
  const { db, addMassExperience } = useApp();
  // The reader's Bible (YouVersion by default) — linked as "Online Bible".
  const bibleHomeUrl = resolveBibleHomeUrl(db.settings);
  const readingPrograms = db.knowledge_items
    .filter((i) => isScriptureProgram(i) && i.status !== "finished")
    .sort(byStatusThenRecent);
  // Computed client-side (todayISO uses the local clock) to avoid an SSR/timezone
  // hydration mismatch — falls back to "Daily Readings" until it resolves.
  const [litDay, setLitDay] = useState<LiturgicalDay | null>(null);
  useEffect(() => setLitDay(getLiturgicalDay(todayISO())), []);
  const isNamedCelebration = litDay ? litDay.title !== litDay.ferialTitle : false;
  const [massOpen, setMassOpen] = useState(false);
  const [church, setChurch] = useState("");
  const [celebrant, setCelebrant] = useState("");
  const [transcript, setTranscript] = useState("");
  const [massSaved, setMassSaved] = useState(false);

  function saveMass() {
    if (!church.trim() && !celebrant.trim() && !transcript.trim()) return;
    addMassExperience({
      id: newId("mass"),
      date: todayISO(),
      church: church.trim() || undefined,
      celebrant: celebrant.trim() || undefined,
      transcript: transcript.trim() || undefined,
      transcript_status: transcript.trim() ? "ready" : "none",
      created_at: new Date().toISOString(),
    });
    setChurch("");
    setCelebrant("");
    setTranscript("");
    setMassSaved(true);
  }

  return (
    <div className="divide-y divide-border/60">
      {/* Daily readings — the liturgical day is computed from the date
          (src/lib/liturgical/calendar.ts): the seasonal day plus the saint,
          feast, or solemnity that governs it. The title links to today's
          readings (USCCB auto-shows the correct day). */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="eyebrow block text-primary">Daily Readings</span>
            <ExtLink
              href={todaysWord.readingsUrl}
              className="inline-flex items-start gap-1 font-display text-base leading-snug text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {litDay ? litDay.title : "Today's readings"}
              <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
            </ExtLink>
            {litDay && isNamedCelebration ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {`${litDay.rankLabel} · ${litDay.ferialTitle}`}
              </p>
            ) : null}
            {litDay && litDay.optionalMemorials.length > 0 ? (
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">
                Also today: {litDay.optionalMemorials.join(" · ")}
              </p>
            ) : null}
          </div>
          <RowIcon
            label="Write a reflection about today's readings"
            onClick={() => onReflect(todaysWord.id)}
          >
            <NotebookPen className="size-4" aria-hidden />
          </RowIcon>
        </div>

        {/* Open the reader's own Bible (from Settings; YouVersion by default). */}
        {bibleHomeUrl ? (
          <ExtLink
            href={bibleHomeUrl}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <BookOpen className="size-3.5" aria-hidden />
            Online Bible
            <ExternalLink className="size-3 text-muted-foreground/70" aria-hidden />
          </ExtLink>
        ) : null}

        <Collapsible open={massOpen} onOpenChange={setMassOpen} className="mt-3">
          <CollapsibleTrigger className="flex w-full items-center gap-1.5 border-t border-border/60 pt-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground">
            Mass (if applicable)
            <ChevronDown
              className={`size-3.5 shrink-0 transition-transform ${massOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2.5 pt-3">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="mass-church" className="text-xs text-muted-foreground">
                  Church
                </Label>
                <Input
                  id="mass-church"
                  className="h-9"
                  placeholder="Where did you attend?"
                  value={church}
                  onChange={(e) => {
                    setChurch(e.target.value);
                    setMassSaved(false);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mass-priest" className="text-xs text-muted-foreground">
                  Celebrant
                </Label>
                <Input
                  id="mass-priest"
                  className="h-9"
                  placeholder="Who celebrated?"
                  value={celebrant}
                  onChange={(e) => {
                    setCelebrant(e.target.value);
                    setMassSaved(false);
                  }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mass-transcript" className="text-xs text-muted-foreground">
                Homily transcript
              </Label>
              <Textarea
                id="mass-transcript"
                placeholder="Paste or type the homily transcript…"
                rows={3}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setMassSaved(false);
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled
                title="Audio capture lands with the Cloud phase"
              >
                <Mic className="size-4" aria-hidden />
                Homily audio
              </Button>
              <Button
                size="sm"
                className="ml-auto"
                onClick={saveMass}
                disabled={!church.trim() && !celebrant.trim() && !transcript.trim()}
              >
                {massSaved ? "Saved" : "Save Mass"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Notes on the homily go in a reflection. Audio capture attaches later — nothing is
              recorded now.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Bible-reading programs (Knowledge `program` items flagged reads_scripture). */}
      {readingPrograms.length > 0 ? (
        <div className="px-5 pb-4 pt-3">
          <div className="mb-0.5 flex items-center justify-between gap-3">
            <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Programs</h3>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Add a reading program"
              title="Add a reading program"
              asChild
            >
              <Link to="/formation" search={{ add: true }}>
                <Plus className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <ul className="space-y-3">
            {readingPrograms.map((program) => (
              <li key={program.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {primaryUrl(program) ? (
                    <ExtLink
                      href={primaryUrl(program)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      {program.title}
                      <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
                    </ExtLink>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{program.title}</p>
                  )}
                  <p className="truncate text-sm text-muted-foreground">
                    {knowledgeSubtitle(program, db.voices)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <RowIcon
                    label={`Write a reflection about ${program.title}`}
                    onClick={() => onReflect(program.id)}
                  >
                    <NotebookPen className="size-4" aria-hidden />
                  </RowIcon>
                  <Link
                    to="/formation"
                    aria-label={`Open ${program.title} in ${SECTION_LABEL}`}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
