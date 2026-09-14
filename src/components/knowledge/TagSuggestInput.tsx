import { useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * A comma-separated tag input that autocompletes against the tags already used
 * across the app, so the tag vocabulary stays connected instead of fragmenting
 * into near-duplicates ("praying" vs "prayers"). The value stays a plain
 * comma-separated string (callers keep their existing string[] parsing); this
 * only suggests known tags for the token you're currently typing — the text
 * after the last comma. **Tab / Enter / click** completes the current token to
 * the highlighted tag and starts the next one (arrows move, Esc dismisses).
 *
 * Part of the ACTS-186 connected-entity sweep. Tags are still stored as loose
 * strings (no Tag entity yet — that is ACTS-203); this is the consistency layer.
 */
export function TagSuggestInput({
  value,
  onChange,
  onBlur,
  suggestions,
  placeholder,
  className,
  id,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  onBlur?: (() => void) | undefined;
  suggestions: string[];
  placeholder?: string | undefined;
  className?: string | undefined;
  id?: string | undefined;
  ariaLabel?: string | undefined;
}) {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);

  // The token being typed is the text after the last comma; earlier tokens are
  // "already chosen" and excluded from the suggestion list.
  const lastComma = value.lastIndexOf(",");
  const currentToken = value.slice(lastComma + 1).trim().toLowerCase();
  const chosen = new Set(
    value
      .slice(0, lastComma + 1)
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  );

  const matches = currentToken
    ? suggestions
        .filter((t) => {
          const n = t.trim().toLowerCase();
          return n && n.includes(currentToken) && n !== currentToken && !chosen.has(n);
        })
        .slice(0, 6)
    : [];

  const accept = (tag: string) => {
    const prefix = lastComma >= 0 ? value.slice(0, lastComma + 1) + " " : "";
    onChange(`${prefix}${tag}, `);
    setHighlight(0);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlight(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (!focused || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            const pick = matches[Math.min(highlight, matches.length - 1)];
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
      {focused && matches.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {matches.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  accept(t);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                  i === Math.min(highlight, matches.length - 1)
                    ? "bg-accent text-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="text-muted-foreground">#</span>
                <span className="min-w-0 truncate">{t}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
