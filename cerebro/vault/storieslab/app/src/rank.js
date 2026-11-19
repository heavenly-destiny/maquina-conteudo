// Weekly ranking (owner 07/11: "ranking com nome de cada pessoa, foto de perfil, de quem mais usou o app").
// Points: 1 per sticker copied/downloaded (max 50 a day), 3 per photo saved in the Studio (max 10 a day), 5 per day with
// any of those. Restarts every Monday (BRT). Only events sent with a valid session cookie count, so nobody can add
// points to someone else by posting to /api/ev. Profile = name + small photo chosen by the person; the e-mail never
// leaves the server. Nobody shows by name until she picks one; the others appear as "Criadora". She can hide herself,
// the admin can hide a profile (hidden = 2, she cannot undo it).
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export const RANK_SCHEMA = [
  'CREATE TABLE IF NOT EXISTS rankd (day TEXT NOT NULL, email TEXT NOT NULL, c INTEGER NOT NULL DEFAULT 0, p INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, email))',
  'CREATE TABLE IF NOT EXISTS rankp (email TEXT PRIMARY KEY, name TEXT, photo TEXT, hidden INTEGER NOT NULL DEFAULT 0, updated TEXT)',
];
const CAP_C = 50, CAP_P = 10, TOP = 23;
const SKIP = e => e.endsWith('@storieslab.test') || e === 'influencer@gmail.com';   // QA and the shared demo login
const brDay = t => new Date(t - 3 * 3600e3).toISOString().slice(0, 10);
export function weekStart(t = Date.now()) {
  const d = new Date(t - 3 * 3600e3), back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * 864e5).toISOString().slice(0, 10);
}
export const points = (c, p, days) => c + 3 * p + 5 * days;

// statement for evHit: copy/down/photo from a signed-in session
export function rankHit(env, email, e, t = Date.now()) {
  if (SKIP(email)) return null;
  const col = e === 'photo' ? 'p' : 'c', cap = e === 'photo' ? CAP_P : CAP_C;
  return env.DB.prepare(`INSERT INTO rankd (day, email, ${col}) VALUES (?1, ?2, 1)
    ON CONFLICT (day, email) DO UPDATE SET ${col} = MIN(${col} + 1, ${cap})`).bind(brDay(t), email);
}

async function board(env, t = Date.now()) {
  const week = weekStart(t);
  const { results } = await env.DB.prepare(`SELECT d.email, SUM(d.c) c, SUM(d.p) p, COUNT(*) days, r.name, r.photo, COALESCE(r.hidden, 0) hidden
    FROM rankd d LEFT JOIN rankp r ON r.email = d.email WHERE d.day >= ? GROUP BY d.email`).bind(week).all();
  const rows = results.map(r => ({ ...r, pts: points(r.c, r.p, r.days) }))
    .sort((a, b) => b.pts - a.pts || (a.email < b.email ? -1 : 1));
  return { week, rows };
}
const pub = (r, pos) => ({ pos, name: r.name || 'Criadora', photo: r.name ? r.photo || null : null, pts: r.pts });

// GET /api/rank -> {week, top:[{pos,name,photo,pts,me}], me:{pos,pts,name,photo,hidden}, total}
export async function rankGet(req, env, email) {
  if (!email) return J({ ok: false }, 401);
  await env.DB.batch(RANK_SCHEMA.map(s => env.DB.prepare(s)));
  const { week, rows } = await board(env);
  const shown = rows.filter(r => !r.hidden);
  const top = shown.slice(0, TOP).map((r, i) => ({ ...pub(r, i + 1), me: r.email === email || undefined }));
  const prof = await env.DB.prepare('SELECT name, photo, hidden FROM rankp WHERE email = ?').bind(email).first();
  const mine = rows.find(r => r.email === email), at = shown.findIndex(r => r.email === email);
  return J({ ok: true, week, top, total: shown.length,
    me: { pos: at < 0 ? null : at + 1, pts: mine ? mine.pts : 0, name: prof?.name || '', photo: prof?.photo || null, hidden: prof?.hidden || 0 } });
}

// POST /api/rank/profile {name, photo, hidden}
export async function rankProfile(req, env, email) {
  if (!email) return J({ ok: false }, 401);
  let b;
  try { b = await req.json(); } catch { return J({ ok: false }, 400); }
  const name = String(b.name || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  const photo = b.photo == null ? null : String(b.photo);
  if (name.length < 2) return J({ ok: false, error: 'name' }, 400);
  if (photo && (!/^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) || photo.length > 24000)) return J({ ok: false, error: 'photo' }, 400);
  await env.DB.batch(RANK_SCHEMA.map(s => env.DB.prepare(s)));
  // hidden 2 = removed by the admin: keeps it
  await env.DB.prepare(`INSERT INTO rankp (email, name, photo, hidden, updated) VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT (email) DO UPDATE SET name = ?2, photo = ?3, hidden = CASE WHEN rankp.hidden = 2 THEN 2 ELSE ?4 END, updated = ?5`)
    .bind(email, name, photo, b.hidden ? 1 : 0, new Date().toISOString()).run();
  return J({ ok: true });
}

// GET /api/admin/rank -> profiles with a name (to moderate photos); POST /api/admin/rank {email, hide}
export async function rankAdmin(req, env, pathname) {
  await env.DB.batch(RANK_SCHEMA.map(s => env.DB.prepare(s)));
  if (req.method === 'POST') {
    const b = await req.json().catch(() => ({}));
    await env.DB.prepare('UPDATE rankp SET hidden = ? WHERE email = ?').bind(b.hide ? 2 : 0, String(b.email || '').toLowerCase()).run();
    return J({ ok: true });
  }
  const { week, rows } = await board(env);
  const pos = new Map(rows.filter(r => !r.hidden).map((r, i) => [r.email, i + 1]));
  const { results } = await env.DB.prepare('SELECT email, name, photo, hidden, updated FROM rankp ORDER BY updated DESC LIMIT 200').all();
  return J({ ok: true, week, people: rows.length, profiles: results.map(r => ({ ...r, pos: pos.get(r.email) || null, pts: rows.find(x => x.email === r.email)?.pts || 0 })) });
}
