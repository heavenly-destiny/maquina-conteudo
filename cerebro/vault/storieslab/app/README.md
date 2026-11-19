# app/ — Worker `storieslab-app`

Customer app at app.storieslab.app (and app.storieslab.shop through the Vercel rewrite during the transition).

- `src/` Worker code, `public/` static assets served by the Worker, `migrations/` + `schema.sql` for D1 `storieslab`.
- Deploy: `npx wrangler deploy` from this folder. Run `node test.mjs` first.
- `"workers_dev": true` in `wrangler.jsonc` must stay: app.storieslab.shop (Vercel) points at the workers.dev host.
- Secrets live in Cloudflare (`wrangler secret list`); key files are git-ignored.
- `build.py` regenerates `public/data.json` and expects folders that only exist on the Windows PC (`stories-lab/`).
