// Figurinhas personalizadas (owner 10/11): the buyer of plan CUSTOM_PLAN fills a briefing in the app; the team delivers by e-mail in 24h.
// status: novo -> entregue (admin). One order per purchase; a second purchase can open a new briefing later (not needed yet).
import { customer } from './experience.js';
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const ID = /^[a-zA-Z0-9-]{16,80}$/;
const FIELDS = { brand: 120, niche: 120, social: 120, colors: 120, style: 60, phrases: 600, logo: 300, notes: 600 };
const STYLES = ['Delicado e feminino', 'Moderno e clean', 'Luxo e elegante', 'Divertido e colorido', 'Minimalista'];
const mine = (env, email) => env.DB.prepare('SELECT id,brand,status,created,files FROM custom_order WHERE email=? ORDER BY created DESC LIMIT 1').bind(email).first();

export async function customRequest(req, env, entitlements) {
  const user = await customer(req, env, entitlements);
  if (!user) return json({ ok: false, error: 'session' }, 401);
  if (req.method === 'GET') return json({ ok: true, order: await mine(env, user.email) });
  if (!user.features.includes('personalizadas')) return json({ ok: false, error: 'not_bought' }, 403);
  let b; try { b = await req.json(); } catch { return json({ ok: false, error: 'request' }, 400); }
  const v = {};
  for (const [k, max] of Object.entries(FIELDS)) v[k] = typeof b[k] === 'string' ? b[k].trim().slice(0, max) : '';
  if (!ID.test(b.id || '') || v.brand.length < 2 || v.niche.length < 2 || !STYLES.includes(v.style)) return json({ ok: false, error: 'validation' }, 400);
  const prev = await mine(env, user.email);
  if (prev) return json({ ok: true, order: prev });   // one briefing per buyer (double tap / second device)
  const created = new Date().toISOString();
  await env.DB.prepare('INSERT INTO custom_order(id,email,brand,niche,social,colors,style,phrases,logo,notes,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(b.id, user.email, v.brand, v.niche, v.social, v.colors, v.style, v.phrases, v.logo, v.notes, created).run();
  return json({ ok: true, order: { id: b.id, brand: v.brand, status: 'novo', created } });
}
// Her logo (n=0) and up to 3 reference photos (n=201..203), sent right after the briefing; same table as the pack.
export async function customImage(req, env, entitlements, url) {
  const user = await customer(req, env, entitlements);
  if (!user) return json({ ok: false, error: 'session' }, 401);
  const id = url.searchParams.get('id') || '', n = Number(url.searchParams.get('n'));
  if (!ID.test(id) || ![0, 201, 202, 203].includes(n)) return json({ ok: false }, 400);
  const own = await env.DB.prepare('SELECT 1 FROM custom_order WHERE id=? AND email=?').bind(id, user.email).first();
  if (!own) return json({ ok: false }, 403);
  const data = await req.arrayBuffer();
  if (!data.byteLength || data.byteLength > 900e3) return json({ ok: false, error: 'size' }, 400);
  await env.DB.prepare('INSERT OR REPLACE INTO custom_file(oid,n,data) VALUES(?,?,?)').bind(id, n, data).run();
  return json({ ok: true });
}
const adminKey = (req, env) => env.HOOK_KEY && req.headers.get('x-k') === env.HOOK_KEY;
export async function customInbox(req, env) {
  if (!adminKey(req, env)) return json({ ok: false }, 401);
  const { results } = await env.DB.prepare('SELECT * FROM custom_order ORDER BY created DESC LIMIT 200').all();
  return json({ ok: true, items: results });
}
export async function customDone(req, env) {
  if (!adminKey(req, env)) return json({ ok: false }, 401);
  let b; try { b = await req.json(); } catch { return json({ ok: false }, 400); }
  if (!ID.test(b.id || '')) return json({ ok: false }, 400);
  const files = Number.isInteger(b.files) && b.files > 0 && b.files <= 200 ? b.files : null;   // set by the generator, null = delivered by e-mail
  await env.DB.prepare("UPDATE custom_order SET status='entregue', delivered=?, files=COALESCE(?,files) WHERE id=?").bind(new Date().toISOString(), files, b.id).run();
  return json({ ok: true });
}
// The pack lives in D1 (one webp per row, ~30 KB) so delivering never needs a deploy. The order id is a random UUID only the buyer sees.
export async function customUpload(req, env, url) {
  if (!adminKey(req, env)) return json({ ok: false }, 401);
  const id = url.searchParams.get('id') || '', n = Number(url.searchParams.get('n'));
  if (!ID.test(id) || !Number.isInteger(n) || n < 1 || n > 200) return json({ ok: false }, 400);
  const data = await req.arrayBuffer();
  if (!data.byteLength || data.byteLength > 900e3) return json({ ok: false, error: 'size' }, 400);
  await env.DB.prepare('INSERT OR REPLACE INTO custom_file(oid,n,data) VALUES(?,?,?)').bind(id, n, data).run();
  return json({ ok: true });
}
export async function customFile(req, env, ctx, id, n) {
  if (!ID.test(id)) return new Response('', { status: 404 });
  const cache = caches.default, hit = await cache.match(req);
  if (hit) return hit;
  const row = await env.DB.prepare('SELECT data FROM custom_file WHERE oid=? AND n=?').bind(id, Number(n)).first();
  const bytes = row && new Uint8Array(row.data);   // D1 hands BLOBs back as a plain number array
  if (!bytes?.length) return new Response('', { status: 404 });
  const res = new Response(bytes, { headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } });
  ctx.waitUntil(cache.put(req, res.clone()));
  return res;
}
