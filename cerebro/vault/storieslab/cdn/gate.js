// Gate for the sticker/material CDN workers (owner 03/11, anti-cloning). Only the paths listed in each worker's
// assets.run_worker_first reach this code (full-size stickers /s/*, materials /mat/*, bonus /v/* and PDFs);
// thumbnails, tutorials and covers stay public static assets.
// A request needs ?p=<pass> from /api/login (appsrv/src/pass.js, same secret CDN_KEY) and each account may fetch
// at most DAILY files per day (BRT), counted in D1 table dl (the admin flags heavy accounts).
import PREMIUM_SLUGS from './premium.json' with { type: 'json' };   // app-tools/premium-gate/premium.py
const PREMIUM = new Set(PREMIUM_SLUGS);
const STICKERS = 150;   // different stickers DOWNLOADED per account per day (owner 07/11); since 18/11 copying is unlimited
const DAILY = 20000;   // anti-scraping ceiling on all full-size fetches; 1500 on 04/11, 6000 until 18/11 (copying is unlimited)
const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deny = (status, msg) => new Response(msg, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' } });

// pass payload = "email|flags" (since 08/11; older passes are just "email" and expire within 24 h): flags '*' opens every
// sticker, otherwise it lists the Premium categories she won as gifts. Returns {email, flags} (flags null on old passes).
export async function passInfo(pass, secret, now) {
  const id = await passEmail(pass, secret, now);
  if (!id) return null;
  const i = id.lastIndexOf('|');
  return i < 0 ? { email: id, flags: null } : { email: id.slice(0, i), flags: id.slice(i + 1) };
}
export function premiumDenied(path, flags) {
  const m = path.match(/^\/s\/([\w-]+)\//);
  return !!(m && PREMIUM.has(m[1]) && flags !== null && flags !== '*' && !flags.split(',').includes(m[1]));
}

export async function passEmail(pass, secret, now = Date.now()) {
  const [e, exp, sig] = String(pass || '').split('.');
  if (!e || !exp || !sig || !secret || parseInt(exp, 36) < now) return null;
  let email;
  try { email = new TextDecoder().decode(Uint8Array.from(atob(e.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))); } catch { return null; }
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const good = b64u(await crypto.subtle.sign('HMAC', key, enc.encode(email + '.' + exp)));
  if (good.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff ? null : email;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    const info = await passInfo(url.searchParams.get('p'), env.CDN_KEY);
    const email = info && info.email;
    if (info && premiumDenied(url.pathname, info.flags)) return deny(403, 'Figurinha do Premium.');
    if (!email) {
      // grace window after launch so apps left open on the old version keep working until they reload
      if (!(env.ENFORCE_FROM && Date.now() < Date.parse(env.ENFORCE_FROM))) return deny(403, 'Acesso somente pelo app Stories Lab.');
    } else if (env.DB) {
      if (await env.DB.prepare('SELECT 1 FROM blk WHERE email = ?').bind(email).first()) return deny(403, 'Acesso suspenso.');   // admin > Segurança
      if (email === 'influencer@gmail.com') return serve(req, env);   // shared demo login: many people, no daily cap
      const day = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
      const row =await env.DB.prepare(`INSERT INTO dl (day, email, n) VALUES (?1, ?2, 1)
        ON CONFLICT (day, email) DO UPDATE SET n = n + 1 RETURNING n`).bind(day, email).first();
      if (row && row.n > DAILY) return deny(429, 'Limite diário de downloads atingido. Volte amanhã.');
      // owner 07/11: at most 150 different stickers a day; opening the same one again is free.
      // owner 18/11: only downloads count (the app adds &d=1 to Baixar); opening, swiping and copying are unlimited.
      // ponytail: dlf keeps one row per file per day forever; delete old days if the table gets big
      if (url.pathname.startsWith('/s/') && url.searchParams.has('d')) {
        const seen = await env.DB.prepare('SELECT 1 FROM dlf WHERE day = ?1 AND email = ?2 AND path = ?3').bind(day, email, url.pathname).first();
        if (!seen) {
          const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM dlf WHERE day = ?1 AND email = ?2').bind(day, email).first();
          if (c && c.n >= STICKERS) return deny(429, 'Limite de 150 downloads por dia. Copiar continua liberado.');
          await env.DB.prepare('INSERT OR IGNORE INTO dlf (day, email, path) VALUES (?1, ?2, ?3)').bind(day, email, url.pathname).run();
        }
      }
    }
    return serve(req, env);
  },
};

async function serve(req, env) {
  const r = await env.ASSETS.fetch(req);
  if (!r.ok) return r;
  const out = new Response(r.body, r);
  out.headers.set('cache-control', 'private, max-age=86400');   // never in a shared cache: the pass must be checked
  out.headers.set('access-control-allow-origin', '*');
  return out;
}
