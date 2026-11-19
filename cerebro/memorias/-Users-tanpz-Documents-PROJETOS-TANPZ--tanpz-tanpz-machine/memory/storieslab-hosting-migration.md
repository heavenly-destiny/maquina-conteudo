---
name: storieslab-hosting-migration
description: "storieslab.app (user's sales page) is moving from Vercel to Cloudflare Pages; do not cancel Vercel until the move is verified"
metadata:
  node_type: memory
  type: project
  originSessionId: b1f6af71-1c20-44f9-842c-c8e63bdc38ee
  modified: 2026-11-16T05:23:32.314Z
---

storieslab.app is the user's own sales page. On 2026-11-15 it was served by Vercel (Pro, US$20/mo), with DNS on Cloudflare and a Worker at storieslab-app.tanpzdigital-183.workers.dev. The user already pays for Cloudflare Workers Paid (US$5/mo). The project lives on the user's other computer and is not in the Vercel account connected here.

Measured on 2026-11-15: the server was fast (TTFB about 0.1s, served from the GRU edge, cache HIT). The page was heavy: 4.3 MB, 73 requests, a 1.3 MB app-loop-v4.mp4, a 550 KB praia-animada.webp and 9 third-party trackers. The user suspected Vercel was hurting conversion whenever they raised the ad budget.

Progress as of 2026-11-16: the live site is Vercel project "stories-lab" (deployed by Codex via CLI from the other computer, no git). Its files were downloaded to tanpz_machine/storieslab-cf/site. That copy is deployed to the Cloudflare Pages project "storieslab" (account 18374d1d…) via deploy.sh and tested on storieslab.pages.dev. The two bonus zips over 25 MB are in R2 bucket storieslab-bonus, served by a Pages Function at the same URL. On 2026-11-16 storieslab.app and www were pointed at Pages and verified live. Rollback DNS: A @ 216.150.1.1 and 216.150.16.1, CNAME www → a98686aa8936c2e9.vercel-dns-017.com. The user wants the whole operation centralized on storieslab.app; .shop was a test domain. Stage 1 is done: storieslab.shop and www 301-redirect to storieslab.app via Vercel domain redirects, keeping path and query. Stage 2 is to move the customer app from app.storieslab.shop (Vercel project storieslab-app) to app.storieslab.app, update Resend email DNS, Hubla links and the .shop references in the page code (the anti-clone guard encodes "storieslab.shop" as char codes). Finding (2026-11-16): app.storieslab.shop is really the Cloudflare Worker storieslab-app (with assets, D1 and many secrets). The Vercel project only rewrites /m/* to the worker storieslab-cdn-4 and everything else to storieslab-app. The worker code hardcodes app.storieslab.shop in its origin checks, links and creators APP, and sends Resend mail from oi@storieslab.shop. Stage 2 code edits must therefore happen on the other computer, where the worker source lives; redeploying the downloaded bundle from here would risk losing the assets. Stage 3 is to redirect app.storieslab.shop, then cancel Vercel. Vercel cannot be cancelled before stage 3, or the customer app goes down. Also pending: switching the other computer's deploy from Vercel to wrangler, and turning on hotlink protection.

Source of truth (2026-11-16): private GitHub repo heavenly-destiny/storieslab, cloned locally at tanpz_machine/storieslab. vendas/ holds the sales page and publishes with vendas/deploy.sh. app/ and cdn/ are meant for the worker sources, which Codex will add from the other computer. The Pages project is Direct Upload and cannot be switched to Git integration, so auto-deploy would need a new project or GitHub Actions.

E-mail (2026-11-16): the app sends through Cloudflare Email Service (binding EMAIL, oi@storieslab.app, onboarded on the storieslab.app zone) using app/src/mail.js. It falls back to Resend from oi@storieslab.shop, because Resend's free plan caps at 100/day. Deployed as app version b7cea1bf; the previous version was c4d07c7b, for rollback. A real send to Gmail was verified on 2026-11-16 and landed in the inbox. A storieslab.app domain was also left pending and unused in Resend (account nathan.abrao44).

Stage 3 (2026-11-16, done): the storieslab.shop zone is on Cloudflare (zone aab52792…) with nameservers elliot/sofia, set at the Vercel registrar. app.storieslab.shop is a Worker custom domain, deliberately not a redirect, because customer sessions live in that origin's localStorage. Apex and www 301 to storieslab.app through a redirect rule. Resend DNS (send, rsend, DKIM) was kept. Vercel can be downgraded to Hobby after about 24-48h of NS cache, but not deleted, because storieslab.shop is registered at Vercel until Oct 2027 (transfer blocked until about 2026-12-30).

On the storieslab.app zone: Hotlink Protection is on (jpg/png/gif). The WAF custom rule "Hotlink webp e video" blocks webp/mp4/webm/avif/mov when the referer is not the user's own hosts, storieslab.pages.dev or clarity. www redirects to the apex with a 301 that keeps the query string.

**Why:** The user scales offers with paid traffic and wants hosting that holds up under traffic spikes. Paying for both hosts is redundant.

**How to apply:** Migrate in this order: deploy to Cloudflare Pages, test on the .pages.dev address (checkout, Pixel, Utmify), point storieslab.app at Pages, run 1-2 days, and only then cancel Vercel. Also slim the page. Check the Meta Ads ratio of landing page views to link clicks before and after.
