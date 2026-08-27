import type { SessionItem } from "./types";

/**
 * How the Guide tab decides which steps show their full text (expanded) vs. a
 * single summary line (collapsed). The mode drives auto-expansion as you pray;
 * a per-step manual override always wins over the mode (see {@link isStepExpanded}).
 *
 *  - `follow` — only the current step is expanded; advancing collapses the one
 *    behind you (exactly one open — the focus). This is the default.
 *  - `trail`  — the current step *and* everything already completed stay expanded;
 *    upcoming steps stay collapsed until you reach them (grows as you go).
 *  - `all`    — every step expanded, including upcoming ones.
 *  - `none`   — every step collapsed to its single line.
 */
export type GuideExpandMode = "follow" | "trail" | "all" | "none";

export const GUIDE_EXPAND_DEFAULT: GuideExpandMode = "follow";

export const GUIDE_EXPAND_OPTIONS: { value: GuideExpandMode; label: string }[] = [
  { value: "follow", label: "Expand current only" },
  { value: "trail", label: "Expand as you go" },
  { value: "all", label: "Expand all" },
  { value: "none", label: "Keep collapsed" },
];

/**
 * The expansion the mode alone dictates for one step, before any manual override.
 * Pure and derived only from the step, the current step, and the mode — so
 * "collapse behind you" needs no stored per-step state.
 */
export function modeExpands(
  mode: GuideExpandMode,
  item: SessionItem,
  currentId: string | null,
): boolean {
  switch (mode) {
    case "all":
      return true;
    case "none":
      return false;
    case "follow":
      return item.id === currentId;
    case "trail":
      return item.id === currentId || item.completion_status === "complete";
  }
}

/**
 * Effective expanded state for one step: the user's manual override if they set
 * one, otherwise whatever the mode dictates. Switching modes is expected to
 * clear overrides so the fresh mode drives every step again.
 */
export function isStepExpanded(
  mode: GuideExpandMode,
  item: SessionItem,
  currentId: string | null,
  overrides: Record<string, boolean>,
): boolean {
  const override = overrides[item.id];
  return override === undefined ? modeExpands(mode, item, currentId) : override;
}
