#!/usr/bin/env bash
# Downloads the CDN asset folders b1..b4 (about 2 GB) from the private R2 bucket storieslab-cdn-assets into cdn/.
# Needed once per computer before any `wrangler deploy` of storieslab-cdn-1..4. Usage: ./cdn/restore-assets.sh [snapshot]
set -euo pipefail
cd "$(dirname "$0")"
export CLOUDFLARE_ACCOUNT_ID=18374d1d24c8719460c31d9eed22762d
SNAP="${1:-2026-11-16}"
TMP=".assets-download"
mkdir -p "$TMP"
get() { npx wrangler r2 object get "storieslab-cdn-assets/$SNAP/$1" --file "$TMP/$1" --remote >/dev/null; }
get SHA256SUMS
for f in $(awk '{print $2}' "$TMP/SHA256SUMS" | tr -d '*'); do [ -f "$TMP/$f" ] || get "$f"; done
(cd "$TMP" && { sha256sum -c SHA256SUMS 2>/dev/null || shasum -a 256 -c SHA256SUMS; })
cat "$TMP"/cdn-assets.tar.part-* | tar -xf -
rm -rf "$TMP"
for b in b1 b2 b3 b4; do echo "$b: $(find "$b" -type f | wc -l) files"; done   # 16/11 snapshot: 15413, 15574, 15939, 1048
