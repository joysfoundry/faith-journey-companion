import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/prayer/store";
import { DEFAULT_MYSTERY_BODY, mysteriesForSet } from "@/lib/prayer/compiler";
import type { MysteryContent, Source } from "@/lib/prayer/types";

export const Route = createFileRoute("/mystery-version/$bodyKey")({
  head: () => ({
    meta: [
      { title: "Mystery version — Oravia" },
      { name: "description", content: "Author a version of the rosary mysteries." },
    ],
  }),
  component: MysteryVersionEditor,
});

/** One mystery's fields within the version being edited. */
interface Entry {
  contentId?: string;
  scripture_ref: string;
  scripture_text: string;
  body: string;
  fruit: string;
}

const blankEntry = (): Entry => ({
  scripture_ref: "",
  scripture_text: "",
  body: "",
  fruit: "",
});

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "version"
  );
}

// Gate on `ready` so the inner form's useState initializers read the loaded
// database (localStorage hydrates after first render), not the seed — otherwise
// a runtime-created version opens blank.
function MysteryVersionEditor() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <AppShell title="Mystery version">
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }
  return <VersionForm />;
}

function VersionForm() {
  const { bodyKey } = Route.useParams();
  const navigate = useNavigate();
  const { db, upsertSource, upsertMysteryContent, deleteMysteryBody } = useApp();
  const isNew = bodyKey === "new";

  const sets = useMemo(
    () => [...db.mystery_sets].sort((a, b) => a.position - b.position),
    [db.mystery_sets],
  );

  // The version's existing source (any content in the body carries it).
  const existingSource = useMemo(() => {
    if (isNew) return undefined;
    const c = db.mystery_contents.find(
      (x) => (x.body_key ?? DEFAULT_MYSTERY_BODY) === bodyKey && x.source_id,
    );
    return c?.source_id ? db.sources.find((s) => s.id === c.source_id) : undefined;
  }, [db.mystery_contents, db.sources, bodyKey, isNew]);

  const existingLabel = useMemo(
    () =>
      isNew
        ? ""
        : (db.mystery_contents.find((x) => (x.body_key ?? DEFAULT_MYSTERY_BODY) === bodyKey)
            ?.label ?? ""),
    [db.mystery_contents, bodyKey, isNew],
  );

  const [name, setName] = useState(existingSource?.name ?? existingLabel);
  const [url, setUrl] = useState(existingSource?.url ?? "");
  const [attribution, setAttribution] = useState(existingSource?.attribution ?? "");

  // Seed the per-mystery fields from any existing content in this body.
  const [entries, setEntries] = useState<Record<string, Entry>>(() => {
    const out: Record<string, Entry> = {};
    if (!isNew) {
      for (const set of db.mystery_sets) {
        for (const m of mysteriesForSet(db, set.id)) {
          const rows = db.mystery_contents.filter(
            (c) => c.mystery_id === m.id && (c.body_key ?? DEFAULT_MYSTERY_BODY) === bodyKey,
          );
          const row =
            rows.find((r) => r.variant === "full_meditation") ??
            rows.find((r) => r.variant === "scripture") ??
            rows[0];
          if (row) {
            out[m.id] = {
              contentId: row.id,
              scripture_ref: row.scripture_ref ?? "",
              scripture_text: row.scripture_text ?? "",
              body: row.body ?? "",
              fruit: row.fruit ?? "",
            };
          }
        }
      }
    }
    return out;
  });

  const entryFor = (id: string): Entry => entries[id] ?? blankEntry();
  const setField = (id: string, field: keyof Entry, value: string) =>
    setEntries((prev) => ({ ...prev, [id]: { ...entryFor(id), [field]: value } }));

  const save = () => {
    if (!name.trim()) {
      toast.error("Give the version a name (its source).");
      return;
    }
    // Reflection is the built-in fallback — don't let it be renamed to a new key.
    const key = isNew ? slugify(name) : bodyKey;
    if (isNew && db.mystery_contents.some((c) => (c.body_key ?? DEFAULT_MYSTERY_BODY) === key)) {
      toast.error("A version with that name already exists.");
      return;
    }

    const sourceId = existingSource?.id ?? `src-${key}`;
    const source: Source = {
      id: sourceId,
      source_type: url.trim() ? "web" : "written",
      name: name.trim(),
      created_at: existingSource?.created_at ?? new Date().toISOString(),
      ...(url.trim() ? { url: url.trim() } : {}),
      ...(attribution.trim() ? { attribution: attribution.trim() } : {}),
    };
    upsertSource(source);

    let saved = 0;
    for (const set of db.mystery_sets) {
      for (const m of mysteriesForSet(db, set.id)) {
        const e = entries[m.id];
        if (!e) continue;
        const hasContent =
          e.scripture_text.trim() || e.body.trim() || e.scripture_ref.trim() || e.fruit.trim();
        if (!hasContent) continue;
        const content: MysteryContent = {
          id: e.contentId ?? `${m.id}-${key}`,
          mystery_id: m.id,
          // Scripture-only entries read as "scripture"; anything with a
          // description is a meditation. body holds only the description.
          variant: e.scripture_text.trim() && !e.body.trim() ? "scripture" : "full_meditation",
          body_key: key,
          label: name.trim(),
          body: e.body.trim(),
          ...(e.scripture_ref.trim() ? { scripture_ref: e.scripture_ref.trim() } : {}),
          ...(e.scripture_text.trim() ? { scripture_text: e.scripture_text.trim() } : {}),
          ...(e.fruit.trim() ? { fruit: e.fruit.trim() } : {}),
          source_id: sourceId,
        };
        upsertMysteryContent(content);
        saved += 1;
      }
    }
    toast.success(`Saved “${name.trim()}” — ${saved} ${saved === 1 ? "mystery" : "mysteries"}.`);
    navigate({ to: "/prayers" });
  };

  const remove = () => {
    if (isNew) return;
    if (bodyKey === DEFAULT_MYSTERY_BODY) {
      toast.error("The Reflection version is the built-in fallback and can’t be deleted.");
      return;
    }
    deleteMysteryBody(bodyKey);
    toast.success("Version deleted.");
    navigate({ to: "/prayers" });
  };

  return (
    <AppShell
      title={isNew ? "New mystery version" : name || "Mystery version"}
      subtitle="One body of every mystery — Scripture, meditation, and fruit."
    >
      <div className="space-y-5">
        <div className="soft-card space-y-3 p-4">
          <p className="eyebrow">Version</p>
          <div>
            <Label htmlFor="vname" className="text-xs text-muted-foreground">
              Name (its source)
            </Label>
            <Input
              id="vname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. USCCB — Scripture, or Caro Family Meditation"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="vurl" className="text-xs text-muted-foreground">
              Source URL (optional)
            </Label>
            <Input
              id="vurl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="vattr" className="text-xs text-muted-foreground">
              Attribution — author / publisher / book (optional)
            </Label>
            <Input
              id="vattr"
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="e.g. Ascension Press"
              className="mt-1 h-11"
            />
          </div>
        </div>

        {sets.map((set) => (
          <div key={set.id} className="space-y-3">
            <p className="eyebrow">{set.name}</p>
            {mysteriesForSet(db, set.id).map((m, idx) => {
              const e = entryFor(m.id);
              return (
                <div key={m.id} className="soft-card space-y-3 p-4">
                  <p className="font-medium">
                    {idx + 1}. {m.title}
                  </p>
                  <div>
                    <Label className="text-xs text-muted-foreground">Scripture reference</Label>
                    <Input
                      value={e.scripture_ref}
                      onChange={(ev) => setField(m.id, "scripture_ref", ev.target.value)}
                      placeholder="e.g. Luke 1:26-27"
                      className="mt-1 h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Scripture text</Label>
                    <Textarea
                      value={e.scripture_text}
                      onChange={(ev) => setField(m.id, "scripture_text", ev.target.value)}
                      placeholder="The exact Bible passage (optional)"
                      className="mt-1 min-h-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description / meditation
                    </Label>
                    <Textarea
                      value={e.body}
                      onChange={(ev) => setField(m.id, "body", ev.target.value)}
                      placeholder="A reflection describing the mystery (optional; separate from the Scripture)"
                      className="mt-1 min-h-24"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fruit of the mystery</Label>
                    <Input
                      value={e.fruit}
                      onChange={(ev) => setField(m.id, "fruit", ev.target.value)}
                      placeholder="e.g. Humility"
                      className="mt-1 h-11"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={save} className="h-12 flex-1">
            Save version
          </Button>
          <Button variant="secondary" asChild className="h-12">
            <Link to="/prayers">Cancel</Link>
          </Button>
        </div>
        {!isNew && bodyKey !== DEFAULT_MYSTERY_BODY ? (
          <Button variant="ghost" onClick={remove} className="w-full text-destructive">
            <Trash2 className="size-4" /> Delete this version
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}
