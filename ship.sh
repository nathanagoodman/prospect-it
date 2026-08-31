#!/usr/bin/env bash
#
# ship.sh — apply staged changes, build, and push.
#
#   bash ship.sh "commit message"
#
# What it does, in order:
#   1. Applies any staged file updates (.claude-updates/, .seo-update/, etc.)
#   2. Installs dependencies if package.json changed
#   3. Runs a production build — STOPS if it fails
#   4. Shows you what git will commit and asks for confirmation
#   5. Commits and pushes, which triggers the Vercel deploy
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

DELETIONS=$(git status --short | grep -c '^ *D' || true)
if [ "$DELETIONS" -gt 0 ]; then
  echo ""
  red "WARNING: $DELETIONS file(s) show as DELETED."
  red "If you didn't intend to delete anything, answer 'n' and check with Claude first."
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
