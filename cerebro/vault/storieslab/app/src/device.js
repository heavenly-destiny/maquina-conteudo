// One device per customer. The app keeps a random id in localStorage (sl_dev) and sends it with /api/login.
// Owner 18/11: no IP/network rule and no code. The last device to sign in owns the access; the device that had it is
// told it was signed out on its next POST /api/device poll and can sign in again with just the e-mail (which then
// signs the other one out). ponytail: the gate is the app UI (data.json and the CDN stay public), so this stops
// simultaneous sharing, not scraping.
const FREE = new Set(['influencer@gmail.com', 'tanpzdigital@gmail.com']);   // shared demo / owner logins
const isFree = e => FREE.has(e) || e.endsWith('@storieslab.test');
const DEV_RE = /^[a-z0-9-]{16,64}$/;

import { isBlocked } from './security.js';
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
export const osOf = ua => (/(iPhone|iPad); CPU (?:iPhone )?OS [\d_]+/.exec(ua) || /Android [\d.]+/.exec(ua) || /Windows NT [\d.]+|Mac OS X [\d_]+/.exec(ua) || [''])[0];

// Called by /api/login after the purchase check passed. null = this device may enter; otherwise the JSON body to return.
// Owner 18/11: "tira a limitação de acesso por ip. se algum outro celular logar o outro desconecta. só isso, sem código sem nada".
// The last device to sign in owns the access; every other device is told it was signed out on its next /api/device poll.
export async function deviceGate(env, email, b, ua = '', now = Date.now()) {
  if (isFree(email)) return null;
  const device = String(b.device || '');
  if (!DEV_RE.test(device)) return { ok: false, error: 'update' };   // a tab opened before this shipped
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO dev (email, device, at, os) VALUES (?1, ?2, ?3, ?4) ON CONFLICT (email) DO UPDATE SET
      sw = sw + (device != ?2), device = ?2, sib = NULL, at = ?3, os = ?4, pdev = NULL, pcode = NULL, pexp = 0, tries = 0`).bind(email, device, now, osOf(ua)),
    env.DB.prepare('DELETE FROM devold WHERE email = ?1 AND device != ?2').bind(email, device)]);
  return null;
}

// POST /api/device {email, device}: polled by the signed-in app. Returns kicked when another device took the access.
export async function deviceStatus(req, env) {
  let b;
  try { b = await req.json(); } catch { return json({ ok: false }, 400); }
  const email = String(b.email || '').trim().toLowerCase(), device = String(b.device || '');
  if (!email || isFree(email)) return json({ ok: true });
  const row = await env.DB.prepare('SELECT device FROM dev WHERE email = ?').bind(email).first();
  if (!row) return json({ ok: true });
  if (await isBlocked(env, email)) return json({ ok: false, kicked: true });   // blocked in the admin (security.js)
  if (row.device !== device) return json({ ok: false, kicked: true });   // another device signed in after this one
  return json({ ok: true });
}
