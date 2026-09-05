/**
 * Renders one compiled `SessionItem` as prayer text — the shared presentation used
 * by both the running Prayer Mode (`/session/$sessionId`) and the read-only guest
 * "follow-along" view (`/follow`, ACTS-94). Pure presentation: no store, no
 * completion, no interaction of its own. `showMeditation` reveals a mystery's text
 * that would otherwise wait for a tap in "choose during session".
 */
import { FormattedText } from "@/components/reflections/FormattedText";
import { ExternalLink as ExtLink } from "@/components/ui/external-link";
import { ordinalWord } from "@/lib/prayer/compiler";
import type { SessionItem } from "@/lib/prayer/types";

/**
 * The subset of a `SessionItem` this component actually renders. A full
 * `SessionItem` satisfies it (Prayer Mode), and so does a `ShareItem` decoded from
 * a guest link (`/follow`) — neither needs the session-local completion/id fields.
 */
export type ItemViewData = Pick<
  SessionItem,
  | "kind"
  | "title"
  | "body"
  | "reference"
  | "repetition_index"
  | "repetition_total"
  | "mystery_ordinal"
  | "configuration"
>;

function decadeOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? "th";
  return `${n}${suffix} decade`;
}

function DecadeTag({ decade }: { decade: number | undefined }) {
  if (!decade) return null;
  return <p className="text-right text-sm font-medium text-primary">{decadeOrdinal(decade)}</p>;
}

export function ItemView({
  item,
  showMeditation,
}: {
  item: ItemViewData;
  showMeditation: boolean;
}) {
  const decade = (item.configuration as { decade?: number } | undefined)?.decade;
  if (item.kind === "mystery") {
    const config = (item.configuration ?? {}) as {
      heading?: string;
      presentation?: string;
      fruit?: string;
      scripture_text?: string;
    };
    // Reveal the text unless we're waiting for the tap in "choose during session".
    const showText = config.presentation !== "choose_during_session" || showMeditation;
    return (
      <div className="text-center">
        <DecadeTag decade={decade} />
        <p className="eyebrow">
          {config.heading ?? `${ordinalWord(item.mystery_ordinal ?? 1)} Mystery`}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2>
        {showText && config.scripture_text ? (
          <>
            <p className="prayer-text mt-6 text-left text-[1.25rem] text-muted-foreground">
              {config.scripture_text}
            </p>
            {item.reference ? (
              <p className="mt-2 text-right text-sm italic text-muted-foreground">
                — {item.reference}
              </p>
            ) : null}
          </>
        ) : null}
        {showText && item.body ? (
          <p className="prayer-text mt-4 text-left text-[1.25rem] text-muted-foreground">
            {item.body}
          </p>
        ) : null}
        {config.fruit ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Fruit of the mystery:</span>{" "}
            {config.fruit}
          </p>
        ) : null}
      </div>
    );
  }

  if (item.kind === "intention" || item.kind === "petition" || item.kind === "meditation") {
    const eyebrow =
      item.kind === "petition"
        ? "Petition"
        : item.kind === "meditation"
          ? "Meditation"
          : "Intention";
    return (
      <div className="text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl">{item.title}</h2>
        {item.body ? <p className="prayer-text mt-4 text-left">{item.body}</p> : null}
      </div>
    );
  }

  if (item.kind === "scripture") {
    return (
      <div>
        {item.reference ? (
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary">
            {item.reference}
          </p>
        ) : (
          <p className="eyebrow text-center">Scripture</p>
        )}
        {item.body?.trim() ? (
          <p className="prayer-text mt-6 text-[1.35rem] leading-relaxed">{item.body}</p>
        ) : (
          <p className="mt-4 text-center text-sm italic text-muted-foreground">
            Read this passage slowly from your Bible.
          </p>
        )}
      </div>
    );
  }

  if (item.kind === "reflection") {
    const response = (item.configuration as { response?: string } | undefined)?.response?.trim();
    return (
      <div>
        <p className="eyebrow text-center">{item.title}</p>
        {item.body?.trim() ? (
          <p className="prayer-text mt-4 text-center text-muted-foreground">{item.body}</p>
        ) : null}
        {response ? (
          <p className="prayer-text mt-6 whitespace-pre-wrap border-l-2 border-primary/40 pl-4 text-left">
            <FormattedText text={response} />
          </p>
        ) : null}
      </div>
    );
  }

  if (item.kind === "external_link") {
    const config = (item.configuration ?? {}) as {
      external_options?: { label: string; url: string; is_default?: boolean }[];
    };
    const options = config.external_options ?? [];
    return (
      <div className="text-center">
        <p className="eyebrow">Pray along</p>
        <h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2>
        {item.body ? <p className="prayer-text mt-4 text-muted-foreground">{item.body}</p> : null}
        <div className="mt-8 space-y-3 text-left">
          {options.map((o) => (
            <ExtLink
              key={o.url}
              href={o.url}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium transition hover:border-primary"
            >
              <span className="pr-3">{o.label}</span>
              {o.is_default ? (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  Default
                </span>
              ) : null}
            </ExtLink>
          ))}
        </div>
      </div>
    );
  }

  if (item.kind === "song") {
    const labels =
      (item.configuration as { segment_labels?: string[] } | undefined)?.segment_labels ?? [];
    return (
      <div>
        <DecadeTag decade={decade} />
        <p className="eyebrow text-center">
          {labels.length ? `Song · ${labels.join(" · ")}` : "Song"}
        </p>
        <h2 className="mt-2 text-center font-display text-3xl leading-tight">{item.title}</h2>
        <p className="prayer-text mt-8">{item.body}</p>
      </div>
    );
  }

  return (
    <div>
      <DecadeTag decade={decade} />
      <h2 className="text-center font-display text-3xl leading-tight">{item.title}</h2>
      {item.repetition_total ? (
        <p className="mt-2 text-center text-base tracking-wide text-muted-foreground tabular-nums">
          {item.repetition_index} of {item.repetition_total}
        </p>
      ) : null}
      <p className="prayer-text mt-8">{item.body}</p>
    </div>
  );
}
