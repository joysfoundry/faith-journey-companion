import { X } from "lucide-react";

import { EntitySuggestInput } from "@/components/knowledge/EntitySuggestInput";
import { VOICE_LABEL_SINGULAR } from "@/lib/prayer/knowledge";

/**
 * A provenance "Source" field that connects two ways (ACTS-186): it autocompletes
 * against **Source names you've used before** (so the same publisher isn't retyped
 * differently) *and* against your **Vessels**, so accepting one LINKS the source to
 * that publisher (e.g. USCCB the organization) via `attribution_voice_id`.
 *
 * Suggestion ids are prefixed by {@link sourceAttributionSuggestions}: `voice:<id>`
 * sets the link; `src:<name>` is name-only. Editing the text clears any link so the
 * shown name and the link can't drift apart. When linked, a small chip shows which
 * Vessel it points to with an unlink control.
 */
export function SourceAttributionInput({
  name,
  onNameChange,
  voiceId,
  onVoiceIdChange,
  entities,
  placeholder,
  className,
  id,
  ariaLabel,
}: {
  name: string;
  onNameChange: (name: string) => void;
  voiceId: string;
  onVoiceIdChange: (id: string) => void;
  entities: { id: string; name: string; sublabel?: string | undefined }[];
  placeholder?: string | undefined;
  className?: string | undefined;
  id?: string | undefined;
  ariaLabel?: string | undefined;
}) {
  return (
    <div className="space-y-1">
      <EntitySuggestInput
        value={name}
        onChange={(v) => {
          onNameChange(v);
          // Typing after a link would let the name drift from the Vessel; clear it.
          if (voiceId) onVoiceIdChange("");
        }}
        entities={entities}
        onSelect={(e) => {
          if (e.id.startsWith("voice:")) {
            onVoiceIdChange(e.id.slice("voice:".length));
            onNameChange(e.name);
          } else {
            onNameChange(e.name);
            onVoiceIdChange("");
          }
        }}
        placeholder={placeholder}
        className={className}
        ariaLabel={ariaLabel}
      />
      {voiceId ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Linked to this {VOICE_LABEL_SINGULAR}
          <button
            type="button"
            onClick={() => onVoiceIdChange("")}
            aria-label={`Unlink ${VOICE_LABEL_SINGULAR}`}
            className="inline-flex items-center hover:text-foreground"
          >
            <X className="size-3" aria-hidden />
          </button>
        </p>
      ) : null}
    </div>
  );
}
