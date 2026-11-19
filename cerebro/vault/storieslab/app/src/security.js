// Admin "Segurança" (owner 03/11, anti-cloning item 6): suspicious accounts, cloned pages and a block switch.
// Signals: heavy CDN downloads (table dl, cdn/gate.js), device switches by code (dev.sw, device.js), many browsers kept
// from before the device lock (devold), cloned sales pages that reported themselves (clone). A blocked e-mail (blk)
// gets no login, its open app is signed out on the next /api/device poll and the CDN refuses its pass.
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export const SEC_SCHEMA = [
  'CREATE TABLE IF NOT EXISTS blk (email TEXT PRIMARY KEY, at TEXT NOT NULL, note TEXT)',
];
export async function isBlocked(env, email) {
  return !!await env.DB.prepare('SELECT 1 FROM blk WHERE email = ?').bind(email).first();
}
const day = t => new Date(t - 3 * 3600e3).toISOString().slice(0, 10);

// GET /api/admin/sec -> lists; POST /api/admin/sec/block {email, note?, unblock?}
export async function secAdmin(req, env, pathname) {
  await env.DB.batch(SEC_SCHEMA.map(s => env.DB.prepare(s)));
  if (req.method === 'POST' && pathname === '/api/admin/sec/block') {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return J({ ok: false }, 400);
    if (b.unblock) await env.DB.prepare('DELETE FROM blk WHERE email = ?').bind(email).run();
    else await env.DB.prepare('INSERT OR REPLACE INTO blk (email, at, note) VALUES (?1, ?2, ?3)').bind(email, new Date().toISOString(), String(b.note || '').slice(0, 200)).run();
    return J({ ok: true });
  }
  if (req.method !== 'GET') return J({ ok: false }, 404);
  const since = day(Date.now() - 7 * 864e5), now = Date.now();
  const [heavy, switches, old, pending, clones, blocked] = (await env.DB.batch([
    env.DB.prepare(`SELECT email, SUM(n) total, MAX(n) peak, COUNT(*) days FROM dl WHERE day >= ? AND email NOT LIKE '%storieslab.test'
      GROUP BY email ORDER BY peak DESC LIMIT 20`).bind(since),
    env.DB.prepare('SELECT email, sw, plabel FROM dev WHERE sw > 0 ORDER BY sw DESC LIMIT 20'),
    env.DB.prepare('SELECT email, COUNT(*) n FROM devold GROUP BY email HAVING n >= 3 ORDER BY n DESC LIMIT 20'),
    env.DB.prepare('SELECT email, plabel, pexp FROM dev WHERE pexp > ? ORDER BY pexp DESC LIMIT 20').bind(now),
    env.DB.prepare('SELECT host, first, last, n, url, ref FROM clone ORDER BY last DESC LIMIT 30'),
    env.DB.prepare('SELECT email, at, note FROM blk ORDER BY at DESC'),
  ])).map(r => r.results || []);
  return J({ ok: true, since, heavy, switches, old, pending, clones, blocked });
}
