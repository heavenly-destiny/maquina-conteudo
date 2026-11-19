import { saleChannel, channelStats, shortAdmin } from './channel-links.js';
import { operations } from './operations.js';
import { secAdmin } from './security.js';
import { rankAdmin } from './rank.js';
// Admin metrics (GET /api/admin, header x-k = HOOK_KEY). Sales are rebuilt from hooklog (raw PerfectPay/Hubla webhooks),
// the landing funnel from `ab`, the app from `ev`; ad spend and the test log are typed in the admin page (`spend`, `exp`).
import { recStats, recTest } from './recover.js';
// The page (public/admin.html) does the period/platform math in the browser.
// ponytail: hooklog is re-parsed on every request; move to a normalized sales table if it passes ~20k rows.

const NAME = {
  // PerfectPay: main plans + bump/upsell products
  PPLQQQT0M: 'basico', PPLQQQTVN: 'basico', PPLQQQT0N: 'premium', PPLQQQT0O: 'downsell', PPLQQQTVG: 'figurinhas', PPLQQQU3K: 'vitalicio', PPLQQQVCE: 'personalizadas',
  PPPBFLFK: 'agenda', PPPBFLFL: 'magneticos', PPPBFLFM: 'presets', PPPBFLFN: 'animadas', PPPBFLFO: 'kit', REFKIT: 'kit',
  // Hubla: main offers + bump/upsell products
  QMj5JhJdg9dEnbG262ZQ: 'premium',
  sXAlfbopdB6LNsF9u5AS: 'downsell',
  '4OwRAxrZJT8jofvrAEVb': 'vitalicio', Gznly9a4BInhGiVFg3pG: 'personalizadas',
  ZjRp7qhKO17c5BwcqW2n: 'basico', ZGl5p5eUP5ZxlN4lGG3G: 'premium', g7ehiv7FcvfCYKlC0Hbo: 'downsell',
  pTg6Xx75MoOzoXNiNVPo: 'agenda', '6V8bWRmHWXQZXE7Xz7Na': 'magneticos', SKJYloVEWsWNATDm70a4: 'presets', AnpKR4QxPycPeJgUPcVv: 'animadas', KPGJDigaQ5RaQhNUnB10: 'kit',
  GZQLgGquEpaAfBfbpWlT: 'letras', UXT6ePcMnLQoaPH6tzaB: 'perfil', meRm2P7UN18s4zn1VQAV: 'reels',
  Wf5o4eVYV4vwD9xz6jmO: 'presets',
};
const PP_MAIN = 'PPPBFLFI';
// owner 02/11: checkout keeps only 2 bumps (agenda, magneticos); animadas = upsell 1, presets = upsell 2 from UPSELL_FROM on.
// ponytail: by date, so an in-app animadas/presets purchase after that also counts as upsell; split by sale page if it matters.
const UPSELL_FROM = '2026-11-02T17:00:00Z';
// owner 03/11: magneticos left the checkout and became upsell 3 (site /upsell3/) from MG_UPSELL_FROM on; agenda is the only bump.
const MG_UPSELL_FROM = '2026-11-03T03:30:00Z';
// owner 13/11: bumps are vitalicio, agenda and presets again; upsells are personalizadas, magneticos (R$ 7,90) and the kit.
const PRESETS_BUMP_FROM = '2026-11-13T21:30:00Z';
export const kindOf = (k, at = '') => (['basico', 'premium', 'downsell'].includes(k) ? 'main'
  : k === 'kit' || k === 'figurinhas' || k === 'personalizadas' || (['animadas', 'presets'].includes(k) && Date.parse(at) >= Date.parse(UPSELL_FROM) && !(k === 'presets' && Date.parse(at) >= Date.parse(PRESETS_BUMP_FROM)))
    || (k === 'magneticos' && Date.parse(at) >= Date.parse(MG_UPSELL_FROM)) ? 'upsell' : 'bump');
const PP_ST = { 1: 'pending', 12: 'abandoned', 2: 'paid', 10: 'paid', 5: 'rejected', 6: 'canceled', 7: 'refunded', 9: 'chargeback', 13: 'expired' };
const H_ST = { 'invoice.payment_succeeded': 'paid', 'invoice.refunded': 'refunded', 'invoice.chargeback': 'chargeback' };
// a late "pending" must never undo a "paid", and a refund beats both
const RANK = { abandoned: 0, pending: 1, expired: 1, rejected: 1, canceled: 2, paid: 3, refunded: 4, chargeback: 4 };
const TEST_MAIL = /storieslab\.test$|@example\.com$/;

export function parseBody(raw) {
  try { return JSON.parse(raw); } catch {}
  const b = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    const parts = k.replace(/\]/g, '').split('[');
    let o = b;
    parts.slice(0, -1).forEach(p => { o = o[p] = o[p] || {}; });
    o[parts.at(-1)] = v;
  }
  return b;
}
const fixText = s => { try { return decodeURIComponent(escape(s)); } catch { return s; } }; // Hubla double-encodes UTF-8 in utm
const campId = s => String(s || '').split('|')[1]?.trim() || '';   // utm_campaign is 'name|id'; many campaigns share a name
const cut = s => fixText(String(s || '').split('|')[0].split('::')[0].trim()) || '(sem utm)';
// PerfectPay dates are BRT without a zone; normalize to UTC ISO so they compare as text with Hubla/UTC times (bug 11/11: test window was 3h off)
const ppTime = s => { const t = s ? Date.parse(s.replace(' ', 'T') + '-03:00') : NaN; return isNaN(t) ? null : new Date(t).toISOString(); };
const brDay = iso => new Date(Date.parse(iso) - 3 * 3600e3).toISOString().slice(0, 10);
async function hash(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d).slice(0, 5)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// rows: [{ at, body }] in insertion order -> one line per sold item: { id, src, key, kind, price, status, pay, created, day, buyer, campaign, ad, place, tag }
export async function parseSales(rows) {
  const out = new Map();
  const put = l => {
    const old = out.get(l.id);
    if (!old || (RANK[l.status] || 0) >= (RANK[old.status] || 0)) out.set(l.id, old ? { ...old, ...l, ...Object.fromEntries(['source','medium','utmCampaign','utmContent','utmTerm'].map(k=>[k,l[k]||old[k]||''])), net: l.net ?? old.net, created: old.created, day: old.day } : l);
  };
  for (const r of rows) {
    if (r.body.startsWith('hubla ')) {
      let b; try { b = JSON.parse(r.body.slice(6)); } catch { continue; }
      const status = H_ST[b.type], inv = b.event?.invoice;
      if (!status || !inv) continue;
      const email = String(inv.payer?.email || '').toLowerCase();
      if (TEST_MAIL.test(email) || String(inv.id).startsWith('TEST')) continue;   // Hubla test invoices (TESTE1) are not sales
      const ps = inv.paymentSession || {}, utm = ps.utm || {};
      let tag = ''; try { tag = new URL(ps.url).searchParams.get('src') || ''; } catch {}
      const created = inv.statusAt?.[0]?.when || r.at;
      const seller = (inv.receivers || []).find(x => x.role === 'seller'), total = inv.amount?.totalCents || 0;
      const share = seller && total ? seller.totalCents / total : null; // net / gross for this invoice
      for (const p of b.event.products || []) for (const o of p.offers || []) {
        const key = NAME[o.id] || NAME[p.id];
        if (!key) continue;
        put({ id: inv.id + ':' + key, src: 'hubla', key, kind: typeof o.isOrderBump === 'boolean' ? (o.isOrderBump ? 'bump' : ['basico','premium','downsell'].includes(key) ? 'main' : 'upsell') : kindOf(key, created), price: (o.amountCents || 0) / 100,
          net: share == null ? null : Math.round((o.amountCents || 0) * share) / 100, status,
          pay: inv.paymentMethod === 'pix' ? 'pix' : 'card', created, day: brDay(created), buyer: await hash(email), mail: email,
          ...saleChannel(utm), campaign: cut(utm.campaign), campId: campId(utm.campaign), ad: cut(utm.content), place: utm.term || '', tag });
      }
    } else {
      const b = parseBody(r.body);
      const prod = String(b.product?.code || ''), plan = String(b.plan?.code || '');
      const key = ['figurinhas', 'vitalicio', 'personalizadas'].includes(NAME[plan]) ? NAME[plan] : prod === PP_MAIN ? NAME[plan] : NAME[prod];
      const email = String(b.customer?.email || '').toLowerCase();
      if (!key || !b.code || String(b.code).startsWith('TEST') || TEST_MAIL.test(email)) continue;
      const created = ppTime(b.date_created) || r.at, m = b.metadata || {};
      const com = Object.values(b.commission || {}).find(c => c && (c.affiliation_type_enum_key === 'producer' || String(c.affiliation_type_enum) === '1'));
      put({ id: b.code + ':' + key, src: 'pp', key, kind: kindOf(key, created), price: Number(b.sale_amount) || 0,
        net: com ? Number(com.commission_amount) : null,
        status: PP_ST[Number(b.sale_status_enum)] || 'other', pay: b.payment_type_enum_key === 'pix' ? 'pix' : 'card',
        created, day: brDay(created), buyer: await hash(email), mail: email,
        ...saleChannel(m), campaign: cut(m.utm_campaign), campId: campId(m.utm_campaign), ad: cut(m.utm_content), place: m.utm_term || '', tag: m.src || '' });
    }
  }
  const sales=[...out.values()],first=new Map();
  for(const s of [...sales].sort((a,b)=>a.created.localeCompare(b.created)))if(s.status==='paid'&&s.kind==='main'&&s.source&&s.source!=='app'&&!first.has(s.buyer))first.set(s.buyer,{source:s.source,medium:s.medium,campaign:s.utmCampaign,at:s.created});
  return sales.map(s=>({...s,acquisition:first.get(s.buyer)||null}));
}

const addDay = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const TEST_EV = /storieslab\.test$|@example\.com$/;
const mask = e => { const [u, d = ''] = e.split('@'); return u.slice(0, 3) + '***@' + d; };
// one row per app user (index = id) + compact per-user daily events [day, id, event, n] for cohort/behaviour math in the page.
// E-mails are masked: the page is for patterns, not for contacting people.
// ponytail: uev grows with users x days; aggregate server-side per period once it passes a few MB.
export function usersOf(evRows, seenRows, entRows) {
  const idx = new Map(), users = [], uev = [], agg = new Map();
  const id = email => {
    if (!idx.has(email)) { idx.set(email, users.length); users.push({ id: users.length, u: mask(email), first: null, at: null, mode: null, pwa: 0, notif: null, last: null, owns: [] }); }
    return idx.get(email);
  };
  for (const r of evRows) {
    const i = id(r.email), k = r.day + '|' + i + '|' + r.e;
    agg.set(k, (agg.get(k) || 0) + r.n);
    const u = users[i];
    if (!u.first || r.day < u.first) u.first = r.day;
  }
  for (const [k, n] of agg) { const [d, i, e] = k.split('|'); uev.push([d, +i, e, n]); }
  for (const s of seenRows) {
    if (TEST_EV.test(s.email)) continue;
    const u = users[id(s.email)];
    Object.assign(u, { at: s.at, mode: s.mode, pwa: s.pwa, notif: s.notif, last: s.last });
    u.first ||= s.first.slice(0, 10);
  }
  for (const e of entRows) {
    if (!idx.has(e.email)) continue;
    const k = NAME[e.plan] || NAME[e.product];
    if (k && !users[idx.get(e.email)].owns.includes(k)) users[idx.get(e.email)].owns.push(k);
  }
  return { users, uev };
}

// owner 15/11: how many times an offer was shown to each buyer before buying. { buyerHash: [[day, product, 'v'|'c', n], ...] }
// ponytail: ev is per day, so views on the purchase day count even if they happened after paying; add a timestamp to ev if that precision matters.
const OFFER_EV = { offer_view: 'v', offer_click: 'c', up_view: 'v', up_click: 'c', vit_view: 'v', vit_click: 'c', cus_view: 'v', cus_banner: 'v', cus_click: 'c' };
export const offerProduct = r => r.e.startsWith('up_') ? 'premium' : r.e.startsWith('vit_') ? 'vitalicio' : r.e.startsWith('cus_') ? 'personalizadas' : r.k || '?';
export async function offerTouches(evRows) {
  const by = new Map();
  for (const r of evRows) {
    const t = OFFER_EV[r.e];
    if (!t) continue;
    const m = by.get(r.email) || by.set(r.email, new Map()).get(r.email), k = r.day + '|' + offerProduct(r) + '|' + t;
    m.set(k, (m.get(k) || 0) + r.n);
  }
  const out = {};
  for (const [email, m] of by) out[await hash(email)] = [...m].map(([k, n]) => [...k.split('|'), n]);
  return out;
}

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS spend (day TEXT PRIMARY KEY, amount REAL NOT NULL, note TEXT)',
  `CREATE TABLE IF NOT EXISTS exp (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, hyp TEXT, metric TEXT, split TEXT, tag TEXT,
     start TEXT, end TEXT, status TEXT NOT NULL DEFAULT 'ideia', result TEXT, created TEXT)`,
];
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const str = (v, n = 2000) => (v == null ? null : String(v).slice(0, n));

// owner 03/11: the admin also opens with a short password (secret ADMIN_PASS); HOOK_KEY keeps working.
// 08/11 (audit item 3): more than 10 wrong keys in a minute from one IP locks that IP out for 15 min, even with the right key.
// Used by the admin (x-k header) and by the ?k= routes. ponytail: per-IP only, so the real defense is a long ADMIN_PASS.
const LOCK_MS = 15 * 60e3;
const same = (a, b) => { if (!a || !b || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
export async function keyOk(req, env, given, keys) {
  const ip = req.headers.get('cf-connecting-ip') || '?', now = Date.now();
  const locked = await env.DB.prepare('SELECT 1 FROM adminlock WHERE ip = ?1 AND until > ?2').bind(ip, now).first().catch(() => null);
  if (locked) return false;
  if (keys.some(k => same(given || '', k || ''))) return true;
  if (!given) return false;
  if (env.RL_ADMIN && !(await env.RL_ADMIN.limit({ key: ip })).success) {
    await env.DB.batch([env.DB.prepare('CREATE TABLE IF NOT EXISTS adminlock (ip TEXT PRIMARY KEY, until INTEGER NOT NULL)'),
      env.DB.prepare('INSERT OR REPLACE INTO adminlock (ip, until) VALUES (?1, ?2)').bind(ip, now + LOCK_MS)]);
  }
  await new Promise(r => setTimeout(r, 1000));
  return false;
}
export const adminOk = (req, env) => keyOk(req, env, req.headers.get('x-k'), [env.HOOK_KEY, env.ADMIN_PASS]);
export async function admin(req, env, evSummary, today) {
  if (!(await adminOk(req, env))) return J({ ok: false }, 401);
  await env.DB.batch(SCHEMA.map(s => env.DB.prepare(s)));
  const { pathname } = new URL(req.url);
  if (pathname === '/api/admin/links') return shortAdmin(req, env);
  if (pathname === '/api/admin/operations' || pathname.startsWith('/api/admin/operations/')) return operations(req, env);

  if (req.method === 'POST' && pathname === '/api/admin/spend') {
    const b = await req.json().catch(() => ({}));
    if (!/^\d{4}-\d\d-\d\d$/.test(b.day || '')) return J({ ok: false }, 400);
    if (b.del) await env.DB.prepare('DELETE FROM spend WHERE day = ?').bind(b.day).run();
    else {
      const amount = Number(b.amount);
      if (!(amount >= 0)) return J({ ok: false }, 400);
      await env.DB.prepare('INSERT OR REPLACE INTO spend (day, amount, note) VALUES (?1, ?2, ?3)').bind(b.day, amount, str(b.note, 200)).run();
    }
    return J({ ok: true });
  }
  if (req.method === 'POST' && pathname === '/api/admin/exp') {
    const b = await req.json().catch(() => ({}));
    if (b.del && b.id) { await env.DB.prepare('DELETE FROM exp WHERE id = ?').bind(b.id).run(); return J({ ok: true }); }
    if (!b.name) return J({ ok: false }, 400);
    const v = [str(b.name, 200), str(b.hyp), str(b.metric, 200), b.split === 'src' ? 'src' : b.split === 'platform' ? 'platform' : null,
      str(b.tag, 40), str(b.start, 30), str(b.end, 30), str(b.status, 20) || 'ideia', str(b.result)];
    if (b.id) await env.DB.prepare('UPDATE exp SET name=?1, hyp=?2, metric=?3, split=?4, tag=?5, start=?6, end=?7, status=?8, result=?9 WHERE id=?10').bind(...v, b.id).run();
    else await env.DB.prepare('INSERT INTO exp (name, hyp, metric, split, tag, start, end, status, result, created) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)').bind(...v, new Date().toISOString()).run();
    return J({ ok: true });
  }
  if (pathname.startsWith('/api/admin/sec')) return secAdmin(req, env, pathname);   // security.js
  if (pathname === '/api/admin/rank') return rankAdmin(req, env, pathname);   // rank.js
  if (req.method === 'POST' && pathname === '/api/admin/rectest') return J({ ok: true, r: await recTest(env) });
  if (req.method !== 'GET') return J({ ok: false }, 404);

  const [hook, ab, ev, evRaw, spend, exp, seen, act, ent, subs, plog, refs, stk] = await env.DB.batch([
    env.DB.prepare(`SELECT at, body FROM hooklog WHERE at >= '2026-10-30' ORDER BY id`),
    env.DB.prepare('SELECT day, v, e, plan, n FROM ab'),
    env.DB.prepare(`SELECT day, e, k, SUM(n) n, COUNT(DISTINCT email) u FROM ev WHERE email NOT LIKE '%storieslab.test' AND email NOT LIKE '%@example.com' GROUP BY day, e, k`),
    env.DB.prepare(`SELECT day, email, e, k, n FROM ev WHERE email NOT LIKE '%storieslab.test' AND email NOT LIKE '%@example.com'`),
    env.DB.prepare('SELECT day, amount, note FROM spend ORDER BY day'),
    env.DB.prepare('SELECT * FROM exp ORDER BY id DESC'),
    env.DB.prepare('SELECT email, first, at, mode, pwa, notif, last FROM seen'),
    env.DB.prepare(`SELECT day, h, COUNT(*) u, SUM(n) n FROM act WHERE day >= ? GROUP BY day, h`).bind(addDay(today, -7)),
    env.DB.prepare('SELECT email, product, plan FROM ent WHERE status IN (2, 10)'),
    env.DB.prepare('SELECT COUNT(*) n FROM push'),
    env.DB.prepare('SELECT * FROM pushlog ORDER BY at DESC LIMIT 30'),
    env.DB.prepare("SELECT (SELECT COUNT(*) FROM ref) links, (SELECT COUNT(*) FROM refuse) friends, (SELECT COUNT(*) FROM ent WHERE product = 'REFKIT' AND status IN (2, 10)) kits"),
    env.DB.prepare('SELECT day, id, SUM(n) n FROM stk WHERE day >= ? GROUP BY day, id').bind(addDay(today, -60)),
  ]);
  const people = usersOf(evRaw.results, seen.results, ent.results);
  const evDays = {};
  for (const r of evRaw.results) (evDays[r.day] ||= new Set()).add(r.email);
  return J({
    now: new Date().toISOString(),
    sales: await parseSales(hook.results), channels: await channelStats(env),
    ab: ab.results, ev: ev.results, evUsers: Object.fromEntries(Object.entries(evDays).map(([d, s]) => [d, s.size])),
    app: evSummary(evRaw.results, today), spend: spend.results, exp: exp.results, rec: await recStats(env),
    users: people.users, uev: people.uev, touch: await offerTouches(evRaw.results), act: act.results, push: { subs: subs.results[0]?.n || 0, log: plog.results }, ref: refs.results[0] || {}, stk: stk.results,
  });
}
