#!/usr/bin/env bash
#
# ship.sh — apply staged changes, build, and push.
#
#   bash ship.sh "commit message"
#
# What it does, in order:
#   0. Checks the git index is sane — STOPS or self-heals if it isn't
#   1. Applies any staged file updates (.claude-updates/, .seo-update/, etc.)
#   2. Installs dependencies if package.json changed
#   3. Syncs the database if the Prisma schema changed
#   4. Runs a production build — STOPS if it fails
#   5. Shows you what git will commit and asks for confirmation
#   6. Commits and pushes, which triggers the Vercel deploy
#
# Nothing is committed without the build passing and you saying yes.

set -euo pipefail

MSG="${1:-}"

if [ ! -f "package.json" ]; then
  echo "Run this from the repo root (the folder containing package.json)."
  exit 1
fi

if [ -z "$MSG" ]; then
  echo "Usage: bash ship.sh \"your commit message\""
  exit 1
fi

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

# ─── 0. Index integrity preflight ────────────────────────────
#
# This repo lives on the Desktop, which macOS syncs to iCloud Drive. iCloud
# periodically rewrites files underneath us, and when it touches .git/index
# the index is left effectively empty. Git then diffs HEAD against nothing
# and reports every tracked file in the repo as deleted, while the same
# paths show up as untracked. Committing in that state deletes the entire
# repository — it has nearly happened three times.
#
# The working tree is never actually damaged, so `git reset` (which rebuilds
# the index from HEAD and does not touch files on disk) always restores it.
# That makes this safe to do automatically.
#
# The signature we look for is a large number of staged deletions. A real
# change never deletes dozens of files at once here; corruption always
# deletes all of them.

TRACKED=$(git ls-tree -r HEAD --name-only 2>/dev/null | wc -l | tr -d ' ')
STAGED_DELETES=$(git diff --cached --name-only --diff-filter=D 2>/dev/null | wc -l | tr -d ' ')

if [ "$TRACKED" -gt 0 ] && [ "$STAGED_DELETES" -gt 20 ]; then
  yellow "Git index looks corrupt: $STAGED_DELETES of $TRACKED tracked files staged as deleted."
  yellow "This is the iCloud-sync issue, not a real deletion. Rebuilding the index..."
  git reset >/dev/null

  STAGED_DELETES=$(git diff --cached --name-only --diff-filter=D 2>/dev/null | wc -l | tr -d ' ')
  UNSTAGED_DELETES=$(git diff --name-only --diff-filter=D 2>/dev/null | wc -l | tr -d ' ')

  if [ "$STAGED_DELETES" -gt 20 ] || [ "$UNSTAGED_DELETES" -gt 20 ]; then
    echo ""
    red "Index is still reporting mass deletions after a reset."
    red "That means files may genuinely be missing. Nothing was committed."
    red "Do not commit. Send this output to Claude before doing anything else."
    exit 1
  fi

  green "Index rebuilt — the working tree was never touched."
  echo ""
fi

# ─── 1. Apply any staged update folders ──────────────────────
applied=0
for STAGE in .claude-updates .seo-update .claude-staged; do
  [ -d "$STAGE" ] || continue

  bold "Applying staged files from $STAGE/"
  BACKUP="${STAGE}-backup-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$BACKUP"

  while IFS= read -r src; do
    rel="${src#"$STAGE"/}"
    case "$rel" in apply.sh) continue ;; esac

    # Never let a staged copy overwrite this script while it is running.
    # Bash reads a script incrementally, so replacing ship.sh mid-execution
    # makes it resume at a byte offset in the new file and run garbage.
    case "$rel" in ship.sh)
      yellow "  skipped  ship.sh (cannot replace this script while it runs)"
      yellow "           staged copy left at $src — apply it by hand"
      continue
      ;;
    esac

    if [ -f "$rel" ]; then
      mkdir -p "$BACKUP/$(dirname "$rel")"
      cp "$rel" "$BACKUP/$rel"
    fi
    mkdir -p "$(dirname "$rel")"
    cp "$src" "$rel"
    echo "  updated  $rel"
    applied=$((applied + 1))
  done < <(find "$STAGE" -type f)

  rm -rf "$STAGE"
  echo "  (backups in $BACKUP/)"
  echo ""
done

[ "$applied" -gt 0 ] && green "Applied $applied file(s)." && echo ""

# ─── 2. Install if dependencies changed ──────────────────────
if ! git diff --quiet -- package.json 2>/dev/null || [ ! -d node_modules ]; then
  bold "package.json changed — installing dependencies"
  npm install
  echo ""
fi

# ─── 2b. Push schema changes to the database ─────────────────
# A Prisma schema change that never reaches Postgres means the deployed
# code queries columns that don't exist, and every affected page 500s.
# `prisma generate` (postinstall) only builds types, not tables.
if ! git diff --quiet -- prisma/schema.prisma 2>/dev/null; then
  bold "prisma/schema.prisma changed — syncing the database"
  if ! npx prisma db push; then
    echo ""
    red "Database sync failed. Nothing was committed."
    red "Fix the error above, or paste it to Claude, then run ship.sh again."
    exit 1
  fi
  echo ""
  green "Database in sync."
  echo ""
fi

# ─── 3. Build ────────────────────────────────────────────────
bold "Building"
if ! npm run build; then
  echo ""
  red "Build failed. Nothing was committed."
  red "Fix the error above, or paste it to Claude, then run ship.sh again."
  exit 1
fi
echo ""
green "Build passed."
echo ""

# ─── 4. Show the diff summary and confirm ────────────────────
bold "Changes to be committed:"
git status --short
echo ""

# Re-check after the build. iCloud has clobbered the index during this
# window before — the build is the longest, most file-heavy part of the run.
DELETIONS=$(git status --short | grep -c '^ *D' || true)
if [ "$DELETIONS" -gt 20 ]; then
  echo ""
  red "STOP: $DELETIONS files show as deleted. This is the iCloud index bug."
  red "Nothing was committed. Run:  git reset && git status --short"
  red "then run ship.sh again."
  exit 1
elif [ "$DELETIONS" -gt 0 ]; then
  echo ""
  yellow "Note: $DELETIONS file(s) show as deleted."
  yellow "If you didn't intend that, answer 'n' and check with Claude first."
  echo ""
fi

read -r -p "Commit and push these changes? [y/N] " reply
case "$reply" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Stopped. Nothing committed."; exit 0 ;;
esac

# ─── 5. Commit and push ──────────────────────────────────────
git add -A
git commit -m "$MSG"
git push

echo ""
green "Pushed. Vercel is building now."
echo "Watch it at: https://vercel.com/nathan-goodmans-projects-029a3162/prospect-it-app/deployments"
