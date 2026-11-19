# cdn/ — media gate Workers (`storieslab-cdn-1..4`)

Code in git: `gate.js`, `premium.json` and the wrangler configs. The asset folders `b1`..`b4` (about 2 GB of stickers,
videos and PDFs) are not in git.

**Never run `wrangler deploy` here without `b1`..`b4` in place: a deploy without them removes every file from the CDN.**

## Getting the assets

```bash
./cdn/restore-assets.sh        # downloads the snapshot from the private R2 bucket storieslab-cdn-assets and extracts it
```

The script prints the file count per folder; compare with the numbers in its last line before deploying.

## Updating the snapshot

After adding stickers or media, pack the folders again and upload under a new date:

```bash
tar -cf - b1 b2 b3 b4 | split -b 290M -d - cdn-assets.tar.part-     # wrangler uploads at most 315 MB per object
sha256sum cdn-assets.tar.part-* > SHA256SUMS
for f in SHA256SUMS cdn-assets.tar.part-*; do npx wrangler r2 object put "storieslab-cdn-assets/YYYY-MM-DD/$f" --file "$f" --remote; done
```

Then change the default snapshot date in `restore-assets.sh`.

## Deploy

```bash
npx wrangler deploy -c wrangler.gate1.jsonc   # cdn-1 (gate2, gate3 likewise)
npx wrangler deploy -c wrangler.b4.jsonc      # cdn-4
```
