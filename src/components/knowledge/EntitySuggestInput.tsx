import { useState } from "react";

import { Input } from "@/components/ui/input";

export type Suggestion = { id: string; name: string; sublabel?: string | undefined };

/**
 * A text input that autocompletes against entities already in the app — a Vessel,
 * a book, any content — so a typed name resolves to an existing thing instead of a
 * free-text copy (the app is about connecting threads; see the design memory). As
 * you type it suggests matching entities; **Tab / Enter / click** accepts the
 * highlighted one (arrows move it, Esc dismisses). Accepting fills the name and, via
 * `onSelect`, lets the caller link to that entity's id.
 *
 * The caller passes the full candidate list; filtering (substring match, excluding an
 * exact match so the list clears once a full name is typed) happens here.
 */
export function EntitySuggestInput({
  value,
  onChange,
  entities,
  onSelect,
  placeholder,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (name: string) => void;
  entities: Suggestion[];
  onSelect?: ((entity: Suggestion) => void) | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
}) {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const query = value.trim().toLowerCase();
  const suggestions = query
    ? entities
        .filter((e) => {
          const n = e.name.trim().toLowerCase();
          return n && n.includes(query) && n !== query;
        })
        .slice(0, 6)
    : [];

  const accept = (e: Suggestion) => {
    onChange(e.name);
    onSelect?.(e);
    setHighlight(0);
    setFocused(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlight(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (!focused || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            const pick = suggestions[Math.min(highlight, suggestions.length - 1)];
            if (pick) accept(pick);
          } else if (e.key === "Escape") {
            setFocused(false);
          }
        }}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      {focused && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {suggestions.map((e, i) => (
            <li key={e.id}>
              <button
                type="button"
                // mousedown fires before the input's blur, so the pick registers
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  accept(e);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left text-sm ${
                  i === Math.min(highlight, suggestions.length - 1)
                    ? "bg-accent text-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="min-w-0 truncate">{e.name}</span>
                {e.sublabel ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{e.sublabel}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
