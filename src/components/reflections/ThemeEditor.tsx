import { Plus, Tag, X } from "lucide-react";
import { useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { displayTheme, normalizeTheme } from "@/lib/prayer/themes";

/**
 * Optional theme tagging for a reflection (ACTS-135). Writing stays zero-effort —
 * this whole control can be ignored. Applied themes show as removable chips; a
 * small input adds one (Enter / comma), autocompleting from prior tags; and
 * non-AI `suggestions` appear as dismissible "+ theme" chips you can tap to add.
 */
export function ThemeEditor({
  value,
  onChange,
  suggestions = [],
  historyThemes = [],
}: {
  value: string[];
  onChange: (themes: string[]) => void;
  /** Suggested themes (already normalized, already excluding applied). */
  suggestions?: string[];
  /** Prior themes for the autocomplete datalist (normalized). */
  historyThemes?: string[];
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  function add(raw: string) {
    const theme = normalizeTheme(raw);
    if (!theme) return;
    if (!value.includes(theme)) onChange([...value, theme]);
    setDraft("");
  }

  function remove(theme: string) {
    onChange(value.filter((t) => t !== theme));
  }

  const datalist = historyThemes.filter((t) => !value.includes(t));

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((theme) => (
          <Badge key={theme} variant="secondary" className="gap-1 pr-1.5 font-normal">
            <Tag className="size-3" aria-hidden />
            {displayTheme(theme)}
            <button
              type="button"
              onClick={() => remove(theme)}
              className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Remove ${displayTheme(theme)}`}
            >
              <X className="size-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length > 0) {
              remove(value[value.length - 1]!);
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          list={listId}
          placeholder={value.length === 0 ? "Add a theme (optional)" : "Add another…"}
          aria-label="Add a theme"
          className="h-7 w-40 flex-1 border-0 px-1 text-sm shadow-none focus-visible:ring-0"
        />
        <datalist id={listId}>
          {datalist.map((t) => (
            <option key={t} value={displayTheme(t)} />
          ))}
        </datalist>
      </div>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Suggested
          </span>
          {suggestions.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => add(theme)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              aria-label={`Add suggested theme ${displayTheme(theme)}`}
            >
              <Plus className="size-3" aria-hidden />
              {displayTheme(theme)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
