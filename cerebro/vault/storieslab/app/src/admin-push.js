// owner 09/11: the admin gets a push for every approved sale and an ads analysis 4x a day (9h, 12h30, 18h, 23h BRT),
// with what to do per campaign. Pushes are empty "tickles" (same VAPID key as the app); the service worker asks
// GET /api/push?ep=<its endpoint> and gets the oldest queued admin note for that device (admin_note).
import { parseSales } from './admin.js';
import { sendCreatorPush, validPushEndpoint } from './creator-push.js';

export const ADMIN_PUSH_SCHEMA = [
  'CREATE TABLE IF NOT EXISTS admin_push (endpoint TEXT PRIMARY KEY, created TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS admin_note (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, url TEXT NOT NULL, at TEXT NOT NULL, shown INTEGER NOT NULL DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS admin_seen (k TEXT PRIMARY KEY, at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS admin_report (slot TEXT PRIMARY KEY, at TEXT NOT NULL, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS admin_cfg (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
];
export const SLOTS = [['09:00', 'Manhã'], ['12:30', 'Almoço'], ['18:00', 'Fim de tarde'], ['23:00', 'Fim de noite']];
const DASH = env => env.UTMIFY_DASH || '65f507b820c872cfc0853444';
const brNow = t => new Date(t - 3 * 3600e3).toISOString();           // 'YYYY-MM-DDTHH:MM' in BRT
const brl = v => 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

// ---------- UTMify MCP (moved here from worker.js)
export async function utmifyCall(env, method, params, sid) {
  const r = await fetch(/^https?:/.test(env.UTMIFY_TOKEN) ? env.UTMIFY_TOKEN : `https://mcp.utmify.com.br/mcp?token=${encodeURIComponent(env.UTMIFY_TOKEN)}`, {   // UTMify hands out the full URL
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream',
      ...(sid ? { 'mcp-session-id': sid } : {}) }, body: JSON.stringify({ jsonrpc: '2.0', id: method === 'notifications/initialized' ? undefined : 1, method, params }) });
  const t = await r.text();
  if (!r.ok && r.status !== 202) throw new Error(`utmify ${r.status}: ${t.slice(0, 160)}`);
  const line = t.trim().startsWith('{') ? t : (t.split(/\r?\n/).filter(l => l.startsWith('data:')).pop() || '').slice(5);
  return { sid: r.headers.get('mcp-session-id') || sid, body: line ? JSON.parse(line) : null };
}
async function utmTools(env, calls) {
  const init = await utmifyCall(env, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'storieslab', version: '1' } });
  await utmifyCall(env, 'notifications/initialized', undefined, init.sid);
  const out = [];
  for (const [name, args] of calls) {
    const { body } = await utmifyCall(env, 'tools/call', { name, arguments: args }, init.sid);
    if (body?.error || body?.result?.isError) throw new Error('utmify: ' + JSON.stringify(body.error || body.result.content).slice(0, 200));
    out.push(JSON.parse(body.result.content[0].text));
  }
  return out;
}

// ---------- analysis: pure, tested in test-admin-push.mjs
// rows: get_meta_ad_objects campaign rows (cents). slot: index in SLOTS. Returns totals + one action per campaign.
// owner 10/11: decisions use the last 3 days (today + 2 full days), one day alone swings too much.
// fullDays = complete days inside rows, so "spent 60% of budget" compares against budget x days.
export function analyze(rows, slot, fullDays = 1) {
  const live = rows.filter(r => r.spend > 0 || r.status === 'ACTIVE');
  const sum = k => live.reduce((a, r) => a + (r[k] || 0), 0) / 100;
  const orders = live.reduce((a, r) => a + (r.approvedOrdersCount || 0), 0);
  // what one sale leaves before ads, minus Meta's tax on the ad money = the most a sale may cost
  const perSale = orders ? (sum('revenue') - sum('tax') - sum('fees')) / orders : 15;
  const be = Math.max(5, perSale / 1.1215);
  const camps = live.map(r => {
    const spend = r.spend / 100, n = r.approvedOrdersCount || 0, cpa = n ? spend / n : null, budget = r.dailyBudget ? r.dailyBudget / 100 : null;
    let act, why;
    if (!n) [act, why] = spend >= be * 1.5 ? ['pausar', `${brl(spend)} gastos sem venda`] : ['esperar', 'pouco gasto ainda'];
    else if (cpa > be * 1.25) [act, why] = ['pausar', `venda custando ${brl(cpa)}, limite ${brl(be)}`];
    else if (cpa > be) [act, why] = ['baixar 30%', `venda custando ${brl(cpa)}, acima do limite ${brl(be)}`];
    else if (cpa <= be * 0.7 && n >= 3 && slot > 0 && (!budget || spend >= budget * 0.6 * fullDays)) [act, why] = ['subir 20%', `venda a ${brl(cpa)}, bem abaixo do limite`];
    else [act, why] = ['manter', `venda a ${brl(cpa)}`];
    return { id: r.id ?? r.campaignId, name: r.name, budget, spend, sales: n, cpa, profit: r.profit / 100, act, why };
  }).sort((a, b) => b.profit - a.profit);
  return { be, spend: sum('spend'), revenue: sum('revenue'), profit: sum('profit'), sales: orders, camps };
}
export function reportNote(rep) {
  const by = a => rep.camps.filter(c => c.act === a).map(c => c.name.slice(0, 22));
  const parts = [['Subir', by('subir 20%')], ['Baixar', by('baixar 30%')], ['Pausar', by('pausar')]].filter(([, l]) => l.length).map(([k, l]) => `${k}: ${l.join(', ')}`);
  return {
    title: `${rep.label}: lucro ${brl(rep.profit)}`,
    body: `${rep.sales} vendas · gasto ${brl(rep.spend)} · faturou ${brl(rep.revenue)}. ${parts.join('. ') || 'Tudo para manter.'}`,
    url: '/admin#analises',
  };
}

// ---------- settings the owner edits in the admin (admin_cfg k='push'): texts with {placeholders} + on/off
export const DEFAULT_CFG = { sales: true, reports: true, saleTitle: 'Venda aprovada: {valor}', saleBody: '{produtos}{pix} · Hoje: {vendas}, {total}' };
export const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m, k) => k in v ? v[k] : m);
async function getCfg(env) {
  const r = await env.DB.prepare("SELECT v FROM admin_cfg WHERE k = 'push'").first().catch(() => null);
  try { return { ...DEFAULT_CFG, ...(r ? JSON.parse(r.v) : {}) }; } catch { return { ...DEFAULT_CFG }; }
}
const SAMPLE = { valor: 'R$ 29,80', produtos: 'Premium + Vitalício', pix: ' · Pix', vendas: '12 vendas', total: 'R$ 238,80' };
// GET = settings ; POST {sales, reports, saleTitle, saleBody} saves ; POST {test:'sale'|'report'} sends a sample to every device
export async function adminPushCfg(req, env) {
  if (req.method !== 'POST') return json({ ok: true, cfg: await getCfg(env), def: DEFAULT_CFG, sample: SAMPLE });
  let b; try { b = await req.json(); } catch { return json({ ok: false }, 400); }
  const cfg = await getCfg(env);
  if (b.test === 'sale') return json({ ok: true, push: await notify(env, { title: fill(cfg.saleTitle, SAMPLE) + ' (teste)', body: fill(cfg.saleBody, SAMPLE), url: '/admin' }) });
  if (b.test === 'report') {
    const last = await env.DB.prepare('SELECT data FROM admin_report ORDER BY slot DESC LIMIT 1').first();
    const rep = last ? JSON.parse(last.data) : { label: 'Teste', profit: 0, sales: 0, spend: 0, revenue: 0, camps: [] };
    const n = reportNote(rep);
    return json({ ok: true, push: await notify(env, { ...n, title: n.title + ' (teste)' }) });
  }
  const txt = (v, d) => { v = String(v ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 140); return v || d; };
  const next = { sales: b.sales !== false, reports: b.reports !== false, saleTitle: txt(b.saleTitle, DEFAULT_CFG.saleTitle), saleBody: txt(b.saleBody, DEFAULT_CFG.saleBody) };
  await env.DB.prepare("INSERT OR REPLACE INTO admin_cfg (k, v) VALUES ('push', ?)").bind(JSON.stringify(next)).run();
  return json({ ok: true, cfg: next });
}

// ---------- push
export async function adminPushSub(req, env) {
  let b; try { b = await req.json(); } catch { return json({ ok: false }, 400); }
  const endpoint = String(b.endpoint || '');
  if (!validPushEndpoint(endpoint)) return json({ ok: false, error: 'endpoint' }, 400);
  await env.DB.prepare('INSERT OR REPLACE INTO admin_push (endpoint, created) VALUES (?, ?)').bind(endpoint, new Date().toISOString()).run();
  if (b.test) await notify(env, { title: 'Notificações do admin ativadas', body: 'Você vai receber cada venda e a análise das 9h, 12h30, 18h e 23h.', url: '/admin' }, endpoint);
  return json({ ok: true });
}
export async function notify(env, note, only) {
  if (!env.VAPID_D) return { skipped: 'no VAPID_D' };
  const { results } = only ? { results: [{ endpoint: only }] } : await env.DB.prepare('SELECT endpoint FROM admin_push').all();
  let sent = 0;
  for (const { endpoint } of results) {
    const r = await env.DB.prepare('INSERT INTO admin_note (endpoint, title, body, url, at) VALUES (?, ?, ?, ?, ?) RETURNING id')
      .bind(endpoint, note.title, note.body, note.url, new Date().toISOString()).first();
    try {
      const res = await sendCreatorPush(env, endpoint, 'a' + r.id);   // unique topic: notes must not replace each other
      if (res.status === 404 || res.status === 410) await env.DB.batch([env.DB.prepare('DELETE FROM admin_push WHERE endpoint = ?').bind(endpoint), env.DB.prepare('DELETE FROM admin_note WHERE endpoint = ?').bind(endpoint)]);
      else if (res.ok) sent++;
    } catch (e) { console.log('admin push', e.message); }
  }
  return { sent, total: results.length };
}
// called by GET /api/push?ep=... ; null when that device has nothing queued (then it is a customer push)
export async function takeNote(env, endpoint) {
  if (!endpoint) return null;
  const n = await env.DB.prepare("SELECT id, title, body, url FROM admin_note WHERE endpoint = ? AND shown = 0 AND at > ? ORDER BY id LIMIT 1")
    .bind(endpoint, new Date(Date.now() - 864e5).toISOString()).first();
  if (!n) return null;
  await env.DB.prepare('UPDATE admin_note SET shown = 1 WHERE id = ?').bind(n.id).run();
  return { title: n.title, body: n.body, url: n.url };
}

// ---------- sales: one push per buyer's new approved items, with today's running total
const LABEL = { basico: 'Básico', premium: 'Premium', downsell: 'Premium (downsell)', vitalicio: 'Vitalício', agenda: 'Agenda', magneticos: 'Magnéticos', presets: 'Presets', animadas: 'Animadas', kit: 'Kit', figurinhas: 'Figurinhas' };
export function newSaleNotes(sales, seen, today, cfg = DEFAULT_CFG) {
  const paid = sales.filter(s => s.status === 'paid' && s.day === today);
  const fresh = paid.filter(s => !seen.has(s.id));
  const main = paid.filter(s => s.kind === 'main').length, total = paid.reduce((a, s) => a + (s.price || 0), 0);
  const byBuyer = new Map();
  for (const s of fresh) byBuyer.set(s.buyer, [...(byBuyer.get(s.buyer) || []), s]);
  return { ids: fresh.map(s => s.id), notes: [...byBuyer.values()].map(items => {
    const v = { valor: brl(items.reduce((a, s) => a + (s.price || 0), 0)), produtos: items.map(s => LABEL[s.key] || s.key).join(' + '),
      pix: items[0].pay === 'pix' ? ' · Pix' : '', vendas: `${main} ${main === 1 ? 'venda' : 'vendas'}`, total: brl(total) };
    return { title: fill(cfg.saleTitle, v), body: fill(cfg.saleBody, v), url: '/admin' };
  }) };
}
async function salesTick(env) {
  const last = await env.DB.prepare('SELECT MAX(id) id FROM hooklog').first();
  const key = 'hook:' + (last?.id || 0);
  if (await env.DB.prepare('SELECT 1 FROM admin_seen WHERE k = ?').bind(key).first()) return { idle: true };
  const { results } = await env.DB.prepare('SELECT at, body FROM hooklog WHERE at > ? ORDER BY id').bind(new Date(Date.now() - 30 * 3600e3).toISOString()).all();
  const sales = await parseSales(results), today = brNow(Date.now()).slice(0, 10);
  const { results: seenRows } = await env.DB.prepare("SELECT k FROM admin_seen WHERE k LIKE 'sale:%'").all();
  const seen = new Set(seenRows.map(r => r.k.slice(5)));
  const first = !seenRows.length;   // first run after deploy: mark what exists, notify nothing
  const cfg = await getCfg(env);
  const { ids, notes } = newSaleNotes(sales, seen, today, cfg);
  const now = new Date().toISOString();
  const marks = [...ids.map(id => 'sale:' + id), key].map(k => env.DB.prepare('INSERT OR IGNORE INTO admin_seen (k, at) VALUES (?, ?)').bind(k, now));
  for (let i = 0; i < marks.length; i += 50) await env.DB.batch(marks.slice(i, i + 50));
  if (!first && cfg.sales) for (const n of notes.slice(0, 10)) await notify(env, n);
  await env.DB.prepare("DELETE FROM admin_seen WHERE at < ? AND k NOT LIKE 'slot:%'").bind(new Date(Date.now() - 4 * 864e5).toISOString()).run();
  return { sent: first ? 0 : notes.length, first };
}

// ---------- reports
export async function buildReport(env, slot, t = Date.now()) {
  const day = brNow(t).slice(0, 10), from = brNow(t - 2 * 864e5).slice(0, 10);
  const args = f => ({ dashboardId: DASH(env), level: 'campaign', dateRange: { from: `${f}T00:00:00-03:00`, to: `${day}T23:59:59-03:00` } });
  const [d, d3] = await utmTools(env, [['get_meta_ad_objects', args(day)], ['get_meta_ad_objects', args(from)]]);
  return mergeReport(analyze(d.results || [], slot), analyze(d3.results || [], slot, 2), { label: SLOTS[slot]?.[1] || 'Agora', day, from, at: new Date(t).toISOString(), untracked: d.untrackedCount || 0 });
}
// headline totals = today; per-campaign action, numbers and limit = 3 days; each campaign also carries its today numbers
export function mergeReport(today, three, meta) {
  const t = new Map(today.camps.map(c => [c.id ?? c.name, c]));   // same-name campaigns must not overwrite each other
  const camps = three.camps.map(c => { const x = t.get(c.id ?? c.name); return { ...c, why: c.why + ' em 3 dias', today: x ? { spend: x.spend, sales: x.sales, profit: x.profit } : { spend: 0, sales: 0, profit: 0 } }; });
  return { ...meta, days: 3, be: three.be, spend: today.spend, revenue: today.revenue, profit: today.profit, sales: today.sales, camps };
}
async function reportTick(env, t = Date.now()) {
  const now = brNow(t), day = now.slice(0, 10), hm = now.slice(11, 16);
  const i = SLOTS.findIndex(([s]) => hm >= s && hm < addMin(s, 30));   // ponytail: a slot missed for 30 min is skipped, not sent late
  if (i < 0 || !env.UTMIFY_TOKEN) return { idle: true };
  const k = `slot:${day}:${SLOTS[i][0]}`;
  const claim = await env.DB.prepare('INSERT OR IGNORE INTO admin_seen (k, at) VALUES (?, ?)').bind(k, new Date(t).toISOString()).run();
  if (!claim.meta.changes) return { done: k };
  try {
    const rep = await buildReport(env, i, t);
    await env.DB.prepare('INSERT OR REPLACE INTO admin_report (slot, at, data) VALUES (?, ?, ?)').bind(`${day} ${SLOTS[i][0]}`, rep.at, JSON.stringify(rep)).run();
    return { report: k, push: (await getCfg(env)).reports ? await notify(env, reportNote(rep)) : 'off' };
  } catch (e) { await env.DB.prepare('DELETE FROM admin_seen WHERE k = ?').bind(k).run(); throw e; }   // retry next minute
}
const addMin = (hm, m) => { const x = +hm.slice(0, 2) * 60 + +hm.slice(3) + m; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };

export async function adminTick(env) {
  const out = {};
  try { out.sales = await salesTick(env); } catch (e) { out.salesErr = e.message; }
  try { out.report = await reportTick(env); } catch (e) { out.reportErr = e.message; }
  return out;
}
// GET /api/admin/reports (last 3 days) ; POST /api/admin/reports = run one now (not pushed unless ?push)
export async function adminReports(req, env) {
  if (req.method === 'POST') {
    const rep = await buildReport(env, SLOTS.findLastIndex(([s]) => brNow(Date.now()).slice(11, 16) >= s));
    rep.label = 'Agora';
    if (new URL(req.url).searchParams.has('push')) await notify(env, reportNote(rep));
    return json({ ok: true, report: rep });
  }
  const { results } = await env.DB.prepare('SELECT slot, data FROM admin_report ORDER BY slot DESC LIMIT 12').all();
  const { n } = await env.DB.prepare('SELECT COUNT(*) n FROM admin_push').first();
  return json({ ok: true, devices: n, reports: results.map(r => ({ slot: r.slot, ...JSON.parse(r.data) })) });
}
