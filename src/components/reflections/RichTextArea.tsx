/**
 * The reflection writing field (ACTS-156): a textarea plus an optional
 * bold / italic / underline toolbar, shared by every place a reflection body is
 * written — the Home + `/reflections` composer, the journal entry's edit view,
 * and the in-session Lectio journaling card.
 *
 * Formatting is markdown-lite written into the text itself (see
 * `lib/prayer/richText.ts`), so this stays an ordinary controlled `<textarea>`
 * over a plain string: no contentEditable, no HTML, nothing new to persist.
 *
 * The controls live along the *inside* bottom edge of the field rather than in a
 * bar above it — small and quiet, so the page still reads as somewhere to write
 * rather than a word processor. They can be hidden entirely, which leaves only
 * the toggle; the preference lives in `settings` (not `localStorage`) so it is
 * one choice across every writing surface and travels with the rest of the local
 * database. Hiding never takes the feature away: ⌘/Ctrl+B/I/U keep working.
 */
import { Bold, Italic, Type, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applyMark, markForKey, type Mark } from "@/lib/prayer/richText";
import { useApp } from "@/lib/prayer/store";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  /** Labels the field for screen readers where no visible label sits beside it. */
  ariaLabel?: string;
}

const MARK_BUTTONS: { mark: Mark; label: string; hint: string; icon: typeof Bold }[] = [
  { mark: "bold", label: "Bold", hint: "Bold (⌘/Ctrl+B)", icon: Bold },
  { mark: "italic", label: "Italic", hint: "Italic (⌘/Ctrl+I)", icon: Italic },
  { mark: "underline", label: "Underline", hint: "Underline (⌘/Ctrl+U)", icon: Underline },
];

export function RichTextArea({ value, onChange, placeholder, rows, className, ariaLabel }: Props) {
  const { db, updateSettings } = useApp();
  const hidden = db.settings.reflection_toolbar_hidden === true;
  const ref = useRef<HTMLTextAreaElement>(null);

  // Applying a mark rewrites the whole value, which would otherwise drop the
  // caret at the end. We stash where the selection belongs and restore it after
  // React has committed the new text to the DOM.
  const [pendingSelection, setPendingSelection] = useState<[number, number] | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!pendingSelection || !el) return;
    el.focus();
    el.setSelectionRange(pendingSelection[0], pendingSelection[1]);
    setPendingSelection(null);
  }, [pendingSelection]);

  function toggleMark(mark: Mark) {
    const el = ref.current;
    if (!el) return;
    const next = applyMark(
      { value, selectionStart: el.selectionStart, selectionEnd: el.selectionEnd },
      mark,
    );
    onChange(next.value);
    setPendingSelection([next.selectionStart, next.selectionEnd]);
  }

  return (
    <div className={className}>
      {/* The controls sit *inside* the field, along its bottom edge, so writing
          isn't fenced in by a separate bar of chrome. The strip itself ignores
          pointer events — only the buttons take clicks — so tapping the blank
          stretch beside them still puts the caret in the text. */}
      <div className="relative">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
            const mark = markForKey(e.key);
            if (!mark) return;
            e.preventDefault();
            toggleMark(mark);
          }}
          placeholder={placeholder}
          rows={rows}
          // Room for the strip, so a long entry never runs underneath it.
          className="pb-9"
          aria-label={ariaLabel}
        />
        <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex items-center gap-0.5">
          {!hidden &&
            MARK_BUTTONS.map(({ mark, label, hint, icon: Icon }) => (
              <Button
                key={mark}
                type="button"
                size="icon"
                variant="ghost"
                className="pointer-events-auto size-7 text-muted-foreground hover:text-foreground"
                // The field loses focus (and with it the selection) on mousedown
                // unless we stop it — the click handler needs that selection.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleMark(mark)}
                aria-label={label}
                title={hint}
              >
                <Icon className="size-3.5" aria-hidden />
              </Button>
            ))}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`pointer-events-auto ml-auto size-7 ${hidden ? "text-muted-foreground/50" : "text-muted-foreground"} hover:text-foreground`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateSettings({ reflection_toolbar_hidden: !hidden })}
            aria-pressed={!hidden}
            aria-label={hidden ? "Show formatting options" : "Hide formatting options"}
            title={hidden ? "Show formatting options" : "Hide formatting options"}
          >
            <Type className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
