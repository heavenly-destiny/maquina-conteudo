# Stories Lab

This repository is the single source of truth for the Stories Lab operation. Both computers clone it.

## Structure

| Folder | What it is | Where it runs |
|---|---|---|
| `vendas/` | Sales page (storieslab.app) | Cloudflare Pages project `storieslab` |
| `app/` | Customer app (Worker `storieslab-app`) | Cloudflare Workers, to be added |
| `cdn/` | Media gate (Worker `storieslab-cdn-4`) | Cloudflare Workers, to be added |

Everything runs on the Cloudflare account Tanpzdigital (`18374d1d24c8719460c31d9eed22762d`).
Secrets, D1, and R2 stay in Cloudflare and are never committed.

## Working on it

```bash
git pull                  # always, before editing
# edit…
git add -A && git commit -m "…" && git push
```

Never edit the same file on both computers at the same time.

## Publishing the sales page

```bash
./vendas/deploy.sh
```

This builds `vendas/dist` from `vendas/site` and runs `wrangler pages deploy`. Publish from this repo only.
A deploy from any other folder overwrites the API proxy (`vendas/functions/api`), the R2 bonus downloads (`vendas/functions/e/…` + `wrangler.toml`), and `_headers`.

### Bonus zips in R2

`figurinhas-animadas-parte-1.zip` and `-parte-2.zip` exceed Pages' 25 MiB file limit, so they are not in git.
They live in the R2 bucket `storieslab-bonus` under `e/eabpuFvO266o/` and are served at the same URL by `vendas/functions/e/eabpuFvO266o/[file].js`.
To replace one:

```bash
npx wrangler r2 object put "storieslab-bonus/e/eabpuFvO266o/<file>.zip" --file <file>.zip --content-type application/zip --remote
```
