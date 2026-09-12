import { type KeyboardEvent, useState } from "react";

import { Input } from "@/components/ui/input";
import { bookSuggestions, normalizeReference } from "@/lib/bible/apps";

/** The leading book portion of a citation: an optional 1/2/3 numeral + letters
 * (interior spaces allowed, e.g. "Song of Songs"), before any chapter digit. */
const BOOK_PART = /^((?:[123]\s)?[A-Za-z][A-Za-z ]*)/;

/**
 * A scripture-citation input that suggests **books** as you type the book name
 * (ACTS-194), version-aware, then leaves you to add `chapter:verse`. Choosing a
 * suggestion inserts the **canonical full book name** (never an abbreviation or a
 * typo), and on blur the whole reference is normalized to canonical form — so the
 * same passage lands the same citation everywhere, keeping the ACTS-191
 * one-quote-per-passage dedup and the by-book grouping consistent.
 *
 * Free text is never blocked: an unrecognized book saves exactly as typed. The
 * suggestion list mirrors the chosen version's canon (deuterocanon for Catholic
 * translations only); `version` is a translation id or a "know-bible-…" version
 * book id (resolved here).
 */
export function ScriptureCitationInput({
  value,
  onChange,
  version,
  placeholder,
  className,
  wrapperClassName,
  ariaLabel,
  onKeyDown,
}: {
  value: string;
  onChange: (ref: string) => void;
  version?: string | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  /** Extra classes on the positioning wrapper (e.g. `flex-1` inside a flex row). */
  wrapperClassName?: string | undefined;
  ariaLabel?: string | undefined;
  /** Runs only for keys the suggestion list didn't consume (e.g. Enter-to-save). */
  onKeyDown?: ((e: KeyboardEvent<HTMLInputElement>) => void) | undefined;
}) {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);

  // A "know-bible-<id>" source id names its translation; a bare id is used as-is.
  const translationId = version?.startsWith("know-bible-")
    ? version.slice("know-bible-".length).toUpperCase()
    : version;

  const leading = value.match(BOOK_PART);
  const bookPart = leading?.[1] ?? "";
  // Suggest only while the book itself is being typed — once a chapter digit
  // follows the book, the reader has moved on to chapter:verse.
  const typingBook = bookPart.length > 0 && !/\d/.test(value.slice(bookPart.length));
  const suggestions = typingBook ? bookSuggestions(bookPart, { version: translationId }) : [];

  const accept = (name: string) => {
    const matched = leading?.[1] ?? "";
    const rest = value.slice(matched.length).trimStart();
    onChange(rest ? `${name} ${rest}` : `${name} `);
    setHighlight(0);
  };

  const commit = () => {
    const normalized = normalizeReference(value);
    if (normalized !== value.trim()) onChange(normalized);
  };

  return (
    <div className={`relative ${wrapperClassName ?? ""}`}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlight(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (focused && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
              return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              const pick = suggestions[Math.min(highlight, suggestions.length - 1)];
              if (pick) accept(pick);
              return;
            }
            if (e.key === "Escape") {
              setFocused(false);
              return;
            }
          }
          onKeyDown?.(e);
        }}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      {focused && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {suggestions.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                // mousedown fires before the input's blur, so the pick registers
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  accept(name);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-baseline px-3 py-1.5 text-left text-sm ${
                  i === Math.min(highlight, suggestions.length - 1)
                    ? "bg-accent text-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="min-w-0 truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
