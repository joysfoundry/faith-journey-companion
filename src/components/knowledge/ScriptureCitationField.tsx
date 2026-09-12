import { type KeyboardEvent, useMemo, useState } from "react";
import { X } from "lucide-react";

import { ScriptureCitationInput } from "@/components/knowledge/ScriptureCitationInput";
import { inferReference } from "@/lib/bible/apps";

/**
 * The scripture-citation input (ACTS-194 typeahead) plus a save-time **nudge**
 * (ACTS-196): when the citation is left blank on a passage that has body text, we
 * read the passage and, inline beneath the field, either **recommend** a citation
 * we can confidently infer (one-tap accept), offer the **candidate books** to
 * choose from when the text names more than one (a cross-reference), or simply
 * **prompt** to add one when nothing is parseable. It never blocks: the reader can
 * accept, pick, type their own, or dismiss and save without a citation — and a
 * dismissal sticks for the rest of the editing session (no nag on every keystroke).
 *
 * Anything accepted flows through the same `onChange` as typing, so the ACTS-194
 * normalize-on-save keeps it grouping and deduping cleanly.
 */
export function ScriptureCitationField({
  value,
  onChange,
  body,
  version,
  placeholder,
  className,
  wrapperClassName,
  ariaLabel,
  onKeyDown,
}: {
  value: string;
  onChange: (ref: string) => void;
  /** The passage text we read a citation out of when the field is blank. */
  body: string | undefined;
  version?: string | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  wrapperClassName?: string | undefined;
  ariaLabel?: string | undefined;
  onKeyDown?: ((e: KeyboardEvent<HTMLInputElement>) => void) | undefined;
}) {
  const [dismissed, setDismissed] = useState(false);
  const inferred = useMemo(() => inferReference(body), [body]);

  const blank = value.trim() === "";
  const hasPassage = (body ?? "").trim().length > 0;
  const showNudge = blank && hasPassage && !dismissed;

  return (
    <div className={wrapperClassName}>
      <ScriptureCitationInput
        value={value}
        onChange={onChange}
        version={version}
        placeholder={placeholder}
        className={className}
        ariaLabel={ariaLabel}
        onKeyDown={onKeyDown}
      />
      {showNudge ? (
        <div className="mt-1.5 flex items-start gap-2 text-xs text-muted-foreground">
          <div className="min-w-0 flex-1">
            {inferred.kind === "confident" ? (
              <span className="flex flex-wrap items-center gap-1.5">
                <span>Looks like</span>
                <button
                  type="button"
                  onClick={() => onChange(inferred.ref)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 font-medium text-foreground hover:bg-accent"
                >
                  {inferred.ref}
                </button>
                <span>— add it so this files under its book?</span>
              </span>
            ) : inferred.kind === "ambiguous" ? (
              <span className="flex flex-wrap items-center gap-1.5">
                <span>Which passage is this?</span>
                {inferred.candidates.map((ref) => (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => onChange(ref)}
                    className="rounded-md border border-border bg-background px-2 py-0.5 font-medium text-foreground hover:bg-accent"
                  >
                    {ref}
                  </button>
                ))}
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">
                Add a citation so this files under its book — or save without one.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss citation suggestion"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
