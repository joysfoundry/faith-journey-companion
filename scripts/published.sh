#!/usr/bin/env bash
# scripts/published.sh — ACTS-170
#
# Show where each story / commit sits on the path to users:
#
#   committed (local)  →  on a remote branch (not merged)  →  on main
#   (pushed; Lovable preview / staging)  →  Published to production (Lovable PUBLISH)
#
# Two axes, kept separate on purpose:
#   • Source-control / deploy location — the pipeline above (git-derived).
#   • Release to users — DEPLOY ≠ RELEASE: code can be deployed to production
#     yet gated behind a feature flag (a "dark launch"), so it's live in prod
#     but users can't see it.
#
# "Published" (production) has no git trace — Lovable's PUBLISH leaves none — so
# we track it with a movable `prod` tag you bump when you Publish:
#     scripts/published.sh mark            # move `prod` -> HEAD (after Publish)
#     scripts/published.sh mark <sha>      # set `prod` to a specific commit
#
# There's no per-feature flag infra in this codebase, so a deployed-but-not-
# released feature is DECLARED per story in frontmatter:
#     visibility: unreleased | flagged | live
#     flag: <name>          # optional, when visibility: flagged
#
# Phase 2 (future): named version/release tags. --ref already accepts any ref:
#     scripts/published.sh --ref v0.3.0
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
No \`${REF}\` tag yet — can't tell what's Published.

Nothing is marked as Published to production. Set the current production point
(the commit you last Published in Lovable), then re-run:

    scripts/published.sh mark <sha>     # the last-Published commit
    scripts/published.sh mark           # or HEAD, if HEAD is what's live

From then on, run \`mark\` each time you hit Publish in Lovable.
EOF
  exit 3
fi

REF_SHA=$(git rev-parse --short "$REF")
REF_SUBJ=$(git log -1 --format='%s' "$REF")

# main ref: prefer origin/main (what's actually pushed); else local main/HEAD.
if git rev-parse --verify -q origin/main^{commit} >/dev/null; then
  MAIN_REF="origin/main"; HAVE_ORIGIN=1
else
  MAIN_REF="HEAD"; HAVE_ORIGIN=0
fi

# Remote feature branches (origin/*, excluding HEAD and main).
BRANCHES=$(git for-each-ref --format='%(refname)' refs/remotes/origin 2>/dev/null \
           | grep -vE '/(HEAD|main)$' || true)

# --- membership sets (rev-list, tested with grep) ---------------------------
PROD_FILE="$(mktemp)"; MAIN_FILE="$(mktemp)"; LOCAL_FILE="$(mktemp)"
BR_FILE="$(mktemp)";   LOG_FILE="$(mktemp)"
trap 'rm -f "$PROD_FILE" "$MAIN_FILE" "$LOCAL_FILE" "$BR_FILE" "$LOG_FILE"' EXIT

git rev-list "$REF"              > "$PROD_FILE"   # ancestors of prod = Published
git rev-list "$MAIN_REF"         > "$MAIN_FILE"   # reachable from main = on main
git rev-list HEAD "^$MAIN_REF"   > "$LOCAL_FILE"  # local commits not on main
: > "$BR_FILE"
for b in $BRANCHES; do
  name="${b#refs/remotes/origin/}"
  git rev-list "$b" "^$MAIN_REF" | sed "s/\$/ ${name}/" >> "$BR_FILE"  # sha<space>branch
done

# Universe of commits we might attribute to stories: main + local + branches.
git log --format='%H%x09%s' HEAD "$MAIN_REF" $BRANCHES > "$LOG_FILE"

# stage_of <sha> -> production | main | branch:<name> | local | unknown
stage_of() {
  local s="$1" b
  grep -qxF "$s" "$PROD_FILE"  && { echo production; return; }
  grep -qxF "$s" "$MAIN_FILE"  && { echo main;       return; }
  b=$(grep -m1 "^$s " "$BR_FILE" | awk '{print $2}')
  [ -n "$b" ]                  && { echo "branch:$b"; return; }
  grep -qxF "$s" "$LOCAL_FILE" && { echo local;      return; }
  echo unknown
}

# Commits whose subject names $id as a whole token. Trailing class rejects a
# following digit (ACTS-10 ≠ ACTS-108) and a following . or - (so a range like
# "ACTS-108..116" is not miscounted against ACTS-108).
commits_for() { grep -E "${1}([^0-9.-]|$)" "$LOG_FILE" || true; }

# Read a frontmatter field; strip key, inline "# comment", and whitespace.
field() {
  grep -m1 "^${2}:" "stories/${1}.md" 2>/dev/null \
    | sed -e "s/^${2}:[[:space:]]*//" -e 's/[[:space:]]*#.*$//' -e 's/[[:space:]]*$//' \
    | tr -d '\r' || true
}

pretty_stage() {  # stage token -> human phrase
  case "$1" in
    local)     echo "committed locally — not pushed" ;;
    branch:*)  echo "on branch ${1#branch:} — not merged to main" ;;
    main)      echo "on main — pushed to staging, not yet Published" ;;
    production) echo "Published to production" ;;
    *)         echo "unknown" ;;
  esac
}

echo "Release status — committed → remote branch → on main (staging) → Published to production"
echo "Deploy ≠ release: code behind a flag is deployed to prod but not released to users."
echo "Production line: ${REF} @ ${REF_SHA} \"${REF_SUBJ}\""
[ "$HAVE_ORIGIN" -eq 0 ] && echo "(no origin/main ref — can't tell committed-local from pushed)"
echo

# --- headline: everything not yet Published, with where it sits -------------
UNPUB=$(git log --format='%H%x09%s' HEAD "$MAIN_REF" $BRANCHES "^$REF" || true)
UNPUB_N=$(printf '%s' "$UNPUB" | grep -c . || true)
echo "■ Not yet Published — commits short of production (${UNPUB_N})"
if [ "$UNPUB_N" -eq 0 ]; then
  echo "  ✓ Everything is Published."
else
  printf '%s\n' "$UNPUB" | awk '{a[NR]=$0} END{for(i=NR;i>0;i--) print a[i]}' \
  | while IFS=$'\t' read -r sha subj; do
      [ -z "$sha" ] && continue
      st=$(stage_of "$sha")
      case "$st" in local) tag="local, not pushed";; branch:*) tag="branch ${st#branch:}";;
                    main) tag="on main";; *) tag="$st";; esac
      printf '  %s  [%-20s] %s\n' "$(git rev-parse --short "$sha")" "$tag" "$subj"
    done
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
  total=0; n_prod=0; n_main=0; n_branch=0; n_local=0; brname=""
  while IFS=$'\t' read -r sha _; do
    [ -z "$sha" ] && continue
    total=$((total+1))
    case "$(stage_of "$sha")" in
      production) n_prod=$((n_prod+1)) ;;
      main)       n_main=$((n_main+1)) ;;
      branch:*)   n_branch=$((n_branch+1)); s2=$(stage_of "$sha"); brname="${s2#branch:}" ;;
      local)      n_local=$((n_local+1)) ;;
    esac
  done < <(commits_for "$id")

  if [ "$total" -eq 0 ]; then
    n_none=$((n_none+1))
    NONE_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  no commits yet"$'\n'
  elif [ "$n_prod" -lt "$total" ]; then
    # Has unpublished work — describe where the not-yet-Published commits live.
    n_unrel=$((n_unrel+1))
    if   [ "$n_local"  -gt 0 ]; then loc="committed locally — not pushed"
    elif [ "$n_branch" -gt 0 ]; then loc="on branch ${brname} — not merged to main"
    else                             loc="on main — staging, not yet Published"; fi
    if [ "$n_prod" -gt 0 ]; then note="partially Published — ${n_prod}/${total} live; rest ${loc}"
    else                          note="$loc"; fi
    UNREL_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  ${note}"$'\n'
  elif [ "$vis" = "flagged" ]; then
    n_flag=$((n_flag+1))
    FLAG_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  in production · not released (flag${flag:+: $flag})"$'\n'
  else
    n_rel=$((n_rel+1))
    label="Published to production"; [ "$vis" = "live" ] && label="Published · released to users"
    REL_LINES+="  $(printf '%-9s %-13s' "$id" "$st")  ${label}"$'\n'
  fi
done

echo "■ Stories not yet Published (${n_unrel})"
[ -n "$UNREL_LINES" ] && printf '%s' "$UNREL_LINES" || echo "  ✓ none"
echo
echo "■ In production, behind a feature flag — not released to users (${n_flag})"
[ -n "$FLAG_LINES" ] && printf '%s' "$FLAG_LINES" || echo "  (none declared)"
echo

if [ -n "$STORY_FILTER" ] || [ "$SHOW_ALL" -eq 1 ]; then
  echo "■ Published to production (${n_rel})"
  [ -n "$REL_LINES" ] && printf '%s' "$REL_LINES" || echo "  (none)"
  echo
  echo "■ No commits yet (${n_none})"
  [ -n "$NONE_LINES" ] && printf '%s' "$NONE_LINES" || echo "  (none)"
  echo
fi

echo "Summary: ${n_rel} Published · ${n_unrel} not yet Published · ${n_flag} flagged (in prod, hidden) · ${n_none} not started"
if [ "$SHOW_ALL" -eq 0 ] && [ -z "$STORY_FILTER" ]; then
  echo "(--all also lists Published & not-started stories)"
fi
exit 0