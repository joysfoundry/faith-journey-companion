import { ChevronDown, ExternalLink, Mic, NotebookPen, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readingPrograms, todaysWord, type ReadingProgram } from "@/domain/placeholderData";
import { newId, todayISO } from "@/lib/prayer/compiler";
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
 * Word: today's Mass readings plus the reading programs you follow. Renders as
 * flat rows meant to sit inside the Home "Word" SectionCard (no card of its own).
 */
export function WordSection({ onReflect }: { onReflect: (linkId: string) => void }) {
  const { addMassExperience } = useApp();
  const [massOpen, setMassOpen] = useState(false);
  const [programs, setPrograms] = useState<ReadingProgram[]>(readingPrograms);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
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

  function addProgram() {
    if (!title.trim()) return;
    setPrograms((prev) => [
      ...prev,
      {
        id: `program-${prev.length + 1}`,
        title: title.trim(),
        detail: "Added by you",
        url: url.trim(),
      },
    ]);
    setTitle("");
    setUrl("");
    setAdding(false);
  }

  return (
    <div className="divide-y divide-border/60">
      {/* Daily readings — the liturgical day name varies daily and isn't
          computed here, so the title itself links out to today's readings
          (USCCB auto-shows the correct day). */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a
              href={todaysWord.readingsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-display text-lg text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Daily Readings
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {todaysWord.readings.join(" · ")}
            </p>
          </div>
          <RowIcon
            label="Write a reflection about today's readings"
            onClick={() => onReflect(todaysWord.id)}
          >
            <NotebookPen className="size-4" aria-hidden />
          </RowIcon>
        </div>

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

      {/* Reading programs */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Programs</h3>
          <RowIcon
            label={adding ? "Cancel adding a program" : "Add a reading program"}
            onClick={() => setAdding((v) => !v)}
          >
            {adding ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
          </RowIcon>
        </div>

        {adding ? (
          <div className="mt-3 space-y-2.5 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="space-y-1">
              <Label htmlFor="program-title" className="text-xs text-muted-foreground">
                Title
              </Label>
              <Input
                id="program-title"
                className="h-9"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bible in a Year"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="program-url" className="text-xs text-muted-foreground">
                Source (URL)
              </Label>
              <Input
                id="program-url"
                className="h-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <Button size="sm" onClick={addProgram}>
              Save program
            </Button>
          </div>
        ) : null}

        <ul className="mt-3 space-y-3">
          {programs.map((program) => (
            <li key={program.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {program.url ? (
                  <a
                    href={program.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {program.title}
                    <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
                  </a>
                ) : (
                  <p className="font-medium text-foreground">{program.title}</p>
                )}
                <p className="truncate text-sm text-muted-foreground">{program.detail}</p>
              </div>
              <RowIcon
                label={`Write a reflection about ${program.title}`}
                onClick={() => onReflect(program.id)}
              >
                <NotebookPen className="size-4" aria-hidden />
              </RowIcon>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
