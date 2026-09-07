#!/usr/bin/env bash
# scripts/published.sh — ACTS-170
#
# Show which stories and commits have been RELEASED to production vs not.
#
# "Released" == shipped to production via the Lovable **PUBLISH** action.
# Pushing to origin/main does NOT release — Lovable only serves production
# after you hit Publish. Git has no record of that click, so we track it with
# a movable `prod` tag that you bump when you Publish:
#
#     scripts/published.sh mark            # move `prod` -> HEAD (after Publish)
#     scripts/published.sh mark <sha>      # set `prod` to a specific commit
#
# A commit that is on HEAD but not an ancestor of `prod` is UNRELEASED — it's
# on main, waiting for the next Publish (e.g. ACTS-108 today).
#
# Visibility (live vs. behind a feature flag) has no infra in this codebase,
# so it is DECLARED per story in frontmatter:
#     visibility: unreleased | flagged | live
#     flag: <name>          # optional, when visibility: flagged
#
# Phase 2 (future): named release/version tags. The --ref seam already lets you
# compare against any ref, e.g.  scripts/published.sh --ref v0.3.0
#
# Usage:
#   scripts/published.sh [--ref <ref>] [--all] [ACTS-NN]
#   scripts/published.sh mark [<sha>]
#   scripts/published.sh -h | --help
set -euo pipefail

REF="prod"
SHOW_ALL=0
STORY_FILTER=""

usage() { sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; }

cd "$(git rev-parse --show-toplevel)"

# --- mark subcommand: record a production release ---------------------------
if [ "${1:-}" = "mark" ]; then
  target="${2:-HEAD}"
  sha=$(git rev-parse --verify -q "${target}^{commit}") || {
    echo "error: '$target' is not a commit" >&2; exit 1; }
  old=""
  git rev-parse --verify -q prod^{commit} >/dev/null && old=$(git rev-parse --short prod)
  git tag -f prod "$sha" >/dev/null
  new=$(git rev-parse --short prod)
  if [ -n "$old" ]; then
    echo "prod: ${old} -> ${new}  \"$(git log -1 --format='%s' prod)\""
  else
    echo "prod set -> ${new}  \"$(git log -1 --format='%s' prod)\""
  fi
  echo "Local tag only. To share it (Lovable/other clones): git push -f origin prod"
  exit 0
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --ref)     REF="${2:?--ref needs a value}"; shift ;;
    --all)     SHOW_ALL=1 ;;
    -h|--help) usage; exit 0 ;;
    ACTS-*)    STORY_FILTER="$1" ;;
    *) echo "unknown arg: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

# --- no production marker yet -----------------------------------------------
if ! git rev-parse --verify -q "${REF}^{commit}" >/dev/null; then
  cat >&2 <<EOF
No \`${REF}\` tag yet — can't tell what's released.

Nothing is marked as released to production. Set the current production point
(the commit you last Published in Lovable), then re-run:

    scripts/published.sh mark <sha>     # the last-Published commit
    scripts/published.sh mark           # or HEAD, if HEAD is what's live

From then on, run \`mark\` each time you hit Publish in Lovable.
EOF
  exit 3
fi

REF_SHA=$(git rev-parse --short "$REF")
REF_SUBJ=$(git log -1 --format='%s' "$REF")

UNREL_FILE="$(mktemp)"; LOG_FILE="$(mktemp)"
trap 'rm -f "$UNREL_FILE" "$LOG_FILE"' EXIT
git rev-list HEAD "^$REF" > "$UNREL_FILE"        # on HEAD, not in prod = unreleased
git log HEAD --format='%H%x09%s' > "$LOG_FILE"
UNREL_TOTAL=$(grep -c . "$UNREL_FILE" || true)

is_unreleased() { grep -qxF "$1" "$UNREL_FILE"; }
commits_for()   { grep -E "${1}([^0-9]|$)" "$LOG_FILE" || true; }  # ACTS-10 ≠ ACTS-108
# Read a frontmatter field; strip the key, any inline "# comment", and whitespace.
field() {
  grep -m1 "^${2}:" "stories/${1}.md" 2>/dev/null \
    | sed -e "s/^${2}:[[:space:]]*//" -e 's/[[:space:]]*#.*$//' -e 's/[[:space:]]*$//' \
    | tr -d '\r' || true
}

echo "Release status — released = shipped to production via Lovable PUBLISH"
echo "Production: ${REF} @ ${REF_SHA} \"${REF_SUBJ}\""
echo

# --- headline: unreleased commits (on main, awaiting Publish) ---------------
echo "■ Unreleased commits — on HEAD, not yet Published (${UNREL_TOTAL})"
if [ "$UNREL_TOTAL" -eq 0 ]; then
  echo "  ✓ HEAD is fully released — nothing waiting for Publish."
else
  while IFS=$'\t' read -r sha subj; do
    is_unreleased "$sha" && printf '  %s  %s\n' "$(git rev-parse --short "$sha")" "$subj"
  done < <(awk '{a[NR]=$0} END{for(i=NR;i>0;i--) print a[i]}' "$LOG_FILE")
fi
echo

# --- per-story rollup -------------------------------------------------------
if [ -n "$STORY_FILTER" ]; then
  STORY_IDS="$STORY_FILTER"
else
  STORY_IDS=$(ls stories/ 2>/dev/null | grep -E '^ACTS-[0-9]+\.md$' | sed 's/\.md$//' | sort -t- -k2,2n)
fi

n_rel=0; n_unrel=0; n_flag=0; n_none=0
UNREL_LINES=""; FLAG_LINES=""; REL_LINES=""; NONE_LINES=""

for id in $STORY_IDS; do
  st=$(field "$id" status); [ -z "$st" ] && st="?"
  vis=$(field "$id" visibility)
  flag=$(field "$id" flag)
  total=0; unrel=0
  while IFS=$'\t' read -r sha _; do
    [ -z "$sha" ] && continue
    total=$((total+1)); is_unreleased "$sha" && unrel=$((unrel+1))
  done < <(commits_for "$id")

  if [ "$total" -eq 0 ]; then
    n_none=$((n_none+1))
    NONE_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  no commits yet"$'\n'
  elif [ "$unrel" -gt 0 ]; then
    n_unrel=$((n_unrel+1))
    note="unreleased"; [ "$unrel" -lt "$total" ] && note="partially released ($unrel/$total pending)"
    UNREL_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  ${note}"$'\n'
  elif [ "$vis" = "flagged" ]; then
    n_flag=$((n_flag+1))
    FLAG_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  released · behind flag${flag:+ ($flag)}"$'\n'
  else
    n_rel=$((n_rel+1))
    label="released"; [ "$vis" = "live" ] && label="released · live"
    REL_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  ${label}"$'\n'
  fi
done

echo "■ Stories NOT released (${n_unrel})"
[ -n "$UNREL_LINES" ] && printf '%s' "$UNREL_LINES" || echo "  ✓ none"
echo
echo "■ Released, behind a feature flag (${n_flag})"
[ -n "$FLAG_LINES" ] && printf '%s' "$FLAG_LINES" || echo "  (none declared)"
echo

if [ -n "$STORY_FILTER" ] || [ "$SHOW_ALL" -eq 1 ]; then
  echo "■ Released & live (${n_rel})"
  [ -n "$REL_LINES" ] && printf '%s' "$REL_LINES" || echo "  (none)"
  echo
  echo "■ No commits yet (${n_none})"
  [ -n "$NONE_LINES" ] && printf '%s' "$NONE_LINES" || echo "  (none)"
  echo
fi

echo "Summary: ${n_rel} released · ${n_unrel} unreleased · ${n_flag} flagged · ${n_none} not started"
if [ "$SHOW_ALL" -eq 0 ] && [ -z "$STORY_FILTER" ]; then
  echo "(--all also lists released & not-started stories)"
fi
exit 0