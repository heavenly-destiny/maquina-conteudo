#!/bin/sh
# Builds dist/ from site/ and publishes it to Cloudflare Pages.
# Skips old page backups (*.pre-*), Vercel config, and files over Pages' 25 MiB limit.
set -e
cd "$(dirname "$0")"
rm -rf dist
rsync -a --exclude '*.pre-*' --exclude 'vercel*.json' --exclude '.vercelignore' --max-size=25m site/ dist/
cp _headers dist/
python3 -I inline-css.py dist
CLOUDFLARE_ACCOUNT_ID=18374d1d24c8719460c31d9eed22762d npx -y wrangler pages deploy dist --project-name storieslab --branch main --commit-dirty=true
