#!/usr/bin/env bash
# Replicates this Mac's Claude Code setup on another computer.
# Usage: bash install.sh   (run from inside the claude-setup folder)
# Safe to re-run: existing items are updated, not duplicated.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
CL="$HOME/.claude"
fail=()

for cmd in claude git npx python3; do
  command -v "$cmd" >/dev/null || { echo "Missing: $cmd. Install it and run again."; exit 1; }
done
mkdir -p "$CL/skills"

echo "== 1/4 Skills without an official repo + agents + hooks + settings (copied from the Mac)"
[ -f "$CL/settings.json" ] && cp "$CL/settings.json" "$CL/settings.json.bak-$(date +%Y%m%d%H%M%S)"
tar -xzf "$DIR/claude-bundle.tar.gz" -C "$CL" || fail+=("bundle")

echo "== 2/4 Marketplaces and plugins (official GitHub)"
while read -r repo; do
  [ -n "$repo" ] && { claude plugin marketplace add "$repo" >/dev/null 2>&1 || echo "  marketplace already added or failed: $repo"; }
done < "$DIR/marketplaces.txt"
claude plugin marketplace update >/dev/null 2>&1
while read -r plugin state; do
  [ -z "$plugin" ] && continue
  echo "  $plugin"
  claude plugin install "$plugin" >/dev/null 2>&1 || claude plugin list 2>/dev/null | grep -q "${plugin%@*}" || fail+=("plugin $plugin")
  [ "$state" = "disabled" ] && claude plugin disable "$plugin" >/dev/null 2>&1
done < "$DIR/plugins.txt"

echo "== 3/4 Skills installed with npx skills (official GitHub)"
python3 -c "
import json,sys
for name,v in json.load(open(sys.argv[1]))['skills'].items(): print(v['source'], name)
" "$DIR/skill-lock.json" | while read -r src name; do
  echo "  $name ($src)"
  npx -y skills add "$src" -g -y -a claude-code -s "$name" >/dev/null 2>&1 || echo "  FAILED: $name"
done

echo "== 4/4 Skills that are git clones"
for pair in "gstack https://github.com/garrytan/gstack.git" "humanizer https://github.com/blader/humanizer.git"; do
  set -- $pair
  if [ -d "$CL/skills/$1/.git" ]; then git -C "$CL/skills/$1" pull -q || fail+=("git $1")
  else git clone -q "$2" "$CL/skills/$1" || fail+=("git $1"); fi
done

echo
if [ ${#fail[@]} -eq 0 ]; then echo "Done. Close and reopen Claude Code."
else printf 'Done with failures:\n'; printf '  - %s\n' "${fail[@]}"; fi
