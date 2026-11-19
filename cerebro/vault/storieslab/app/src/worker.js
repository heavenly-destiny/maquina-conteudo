import {runCreatorPushDemo} from './creator-push-demo.js';
import {quizEntryRequest,quizEntryStats,finalizeQuizEntry} from './quiz-entry.js';
// Stories Lab app backend: PerfectPay postback -> D1 entitlements, e-mail login.
// Static app files are served by Workers assets; only /api/* reaches this script.
import { channelRequest, shortRequest, SHORT_ROUTES } from './channel-links.js';
import { admin, adminOk, keyOk } from './admin.js';
import {creators,creatorAdmin,notifyCreatorSales} from './creators.js';
import { track, run as recoverRun } from './recover.js';
import {sessionCookie,sessionEmail,accessStarts,trialState,toolRequest,feedbackRequest,feedbackInbox,feedbackDone,feedbackNotice} from './experience.js';
import { deviceGate, deviceStatus } from './device.js';
import { customRequest, customInbox, customDone, customUpload, customFile, customImage } from './custom.js';
import { makePass } from './pass.js';
import PREMIUM_SLUGS from '../../cdn/premium.json' with { type: 'json' };
import { isBlocked } from './security.js';
import MAT_REELS from './mat/reels.json' with { type: 'json' };
import MAT_PERFIL from './mat/perfil.json' with { type: 'json' };
import { rankHit, rankGet, rankProfile } from './rank.js';
import { utmifyCall, adminPushSub, adminReports, adminTick, takeNote, adminPushCfg } from './admin-push.js';

// PerfectPay product/plan -> app features
const MAIN = 'PPPBFLFI';
const MAIN_PLANS = {
  PPLQQQT0M: ['basico'],             // Básico R$9,90 (3 meses; 11/11)
  PPLQQQTVN: ['basico'],             // Básico oferta final R$9,90 (exit popup on the landing)
  PPLQQQT0N: ['basico', 'premium'],  // Premium R$19,90 (11/11)
  PPLQQQT0O: ['basico', 'premium'],  // Premium via downsell R$14,90 (11/11)
};
const BUMPS = {
  PPPBFLFK: ['agenda'],
  PPPBFLFL: ['magneticos'],
  PPPBFLFM: ['presets'],
  PPPBFLFN: ['animadas'],
  PPPBFLFO: ['agenda', 'magneticos', 'presets', 'animadas'], // Kit Influencer Pro (upsell)
};
// Hubla (2026-10-31): product id -> features; main product tiers keyed by offer id.
// IDs live in stories-lab/hubla/ids.json.
const H_MAIN = '9t8GG43r9zIeZK1M7EUZ';
const H_MAIN_OFFERS = {
  QMj5JhJdg9dEnbG262ZQ: ['basico', 'premium'], // New Hubla Premium: 365 days from first entry; lifetime sold separately.
  sXAlfbopdB6LNsF9u5AS: ['basico', 'premium'], // New Premium special offer; same access period.
  ZjRp7qhKO17c5BwcqW2n: ['basico'],             // Básico R$9,90 (3 meses)
  ZGl5p5eUP5ZxlN4lGG3G: ['basico', 'premium'],  // Premium R$14,99
  g7ehiv7FcvfCYKlC0Hbo: ['basico', 'premium'],  // Premium downsell R$12,90
};
const H_PREMIUM365_OFFERS = new Set(['QMj5JhJdg9dEnbG262ZQ', 'sXAlfbopdB6LNsF9u5AS']);
const H_BUMPS = {
  '4OwRAxrZJT8jofvrAEVb': ['vitalicio'],
  Gznly9a4BInhGiVFg3pG: ['personalizadas'],
  pTg6Xx75MoOzoXNiNVPo: ['agenda'],
  '6V8bWRmHWXQZXE7Xz7Na': ['magneticos'],
  SKJYloVEWsWNATDm70a4: ['presets'],
  AnpKR4QxPycPeJgUPcVv: ['animadas'],
  KPGJDigaQ5RaQhNUnB10: ['agenda', 'magneticos', 'presets', 'animadas'], // Kit Influencer Pro (upsell)
  // owner 18/11: checkout bumps mirrored from Camys (fontes, seguidores, reels)
  GZQLgGquEpaAfBfbpWlT: ['letras'],
  UXT6ePcMnLQoaPH6tzaB: ['perfil'],
  meRm2P7UN18s4zn1VQAV: ['reels'],
};
const BASIC_DAYS = 90;
// owner 09/11: a Básico bought from BASIC30_FROM on lasts 30 days counted from her first entry in the app (table basic_start,
// stamped at the first login that grants it, or her first app use in `seen` for older buyers). Owner 09/11: applies to every
// Básico, old buyers included (BASIC30_FROM in the past); only the vitalício bump removes the limit.
export const BASIC30_FROM = '2000-01-01T00:00:00Z', BASIC30_DAYS = 30;

// Referral (owner 02/11): a customer shares storieslab.shop/?ind=CODE; the landing passes src=ind-CODE to the
// checkout (PerfectPay keeps it in metadata.src, Hubla in the payment session URL). When a NEW customer's main
// purchase is approved with that code, both get the Kit. One ent row per reward (plan = friend's e-mail), so a
// refund or chargeback of the friend's main purchase takes back exactly that reward from both.
const REFKIT = 'REFKIT';
const REF_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const refCodeIn = raw => (/(?:^|[^a-z0-9])ind-([A-HJ-NP-Z2-9]{6})(?![a-z0-9])/i.exec(raw || '') || [])[1]?.toUpperCase() || '';
async function isCustomer(env, email) {
  return !!await env.DB.prepare(`SELECT 1 FROM ent WHERE email = ? AND product IN (?, ?) AND status IN (2, 10) LIMIT 1`).bind(email, MAIN, H_MAIN).first();
}
async function refGrant(env, raw, buyer, sale, wasCustomer, now) {
  const code = refCodeIn(raw);
  if (!code || wasCustomer) return;
  const ref = await env.DB.prepare('SELECT email FROM ref WHERE code = ?').bind(code).first();
  if (!ref || ref.email === buyer) return;
  // friend is UNIQUE: a person only ever triggers one reward
  const r = await env.DB.prepare('INSERT OR IGNORE INTO refuse (sale, code, friend, at) VALUES (?1, ?2, ?3, ?4)').bind(sale, code, buyer, now).run();
  if (!r.meta.changes) return;
  for (const e of [ref.email, buyer]) {
    await env.DB.prepare(`INSERT OR REPLACE INTO ent (email, product, plan, status, sale, approved, updated) VALUES (?1, ?2, ?3, 2, 'REF', ?4, ?4)`)
      .bind(e, REFKIT, buyer, now).run();
  }
}
async function refRevoke(env, friend, now) {
  await env.DB.prepare('UPDATE ent SET status = 7, updated = ?2 WHERE product = ?3 AND plan = ?1').bind(friend, now, REFKIT).run();
}
// POST /api/ref {email}: the customer's own code (created on first use) and how many friends already bought
async function refInfo(req, env) {
  const email = cleanEmail(await sessionEmail(req, env));   // audit item 7: the signed sl_session cookie, not the body, so nobody can probe who is a customer
  if (!email || !await isCustomer(env, email)) return json({ ok: false });
  let row = await env.DB.prepare('SELECT code FROM ref WHERE email = ?').bind(email).first();
  for (let i = 0; !row && i < 5; i++) {
    const code = [...crypto.getRandomValues(new Uint8Array(6))].map(x => REF_ABC[x % REF_ABC.length]).join('');
    const r = await env.DB.prepare('INSERT OR IGNORE INTO ref (code, email, created) VALUES (?1, ?2, ?3)').bind(code, email, new Date().toISOString()).run();
    if (r.meta.changes) row = { code };
    else row = await env.DB.prepare('SELECT code FROM ref WHERE email = ?').bind(email).first(); // lost a race with ourselves
  }
  if (!row) return json({ ok: false }, 500);
  const n = await env.DB.prepare('SELECT COUNT(*) n FROM refuse WHERE code = ?').bind(row.code).first();
  return json({ ok: true, code: row.code, friends: n?.n || 0 });
}

// sale_status_enum: 2 aprovada, 10 completa -> libera; 6 cancelada, 7 devolvida, 9 chargeback -> revoga
const GRANT = new Set([2, 10]);
const REVOKE = new Set([6, 7, 9]);

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const cleanEmail = e => String(e || '').trim().toLowerCase();

// owner 04/11: 5 free stickers a day for everyone, R$5,90 unlocks unlimited. Sold as a plan of the Magnéticos product (its webhook and
// thank-you page already exist), so the plan, not the product, decides the feature.
export const FIG_PLAN = 'PPLQQQTVG';
// owner 05/11: checkout bump R$9,90 that removes the 90-day limit of Básico (plan of the Magnéticos product, like FIG_PLAN)
export const LIFE_PLAN = 'PPLQQQU3K';
// owner 10/11: Figurinhas personalizadas R$ 39,90 (50+ stickers with her brand in 24h, briefing in src/custom.js). Set when the PerfectPay plan exists.
export const CUSTOM_PLAN = 'PPLQQQVCE';
export const FIG_LINK = 'https://go.perfectpay.com.br/PPU38CQHH4N';
export function featuresOf(product, plan) {
  if (plan === FIG_PLAN) return ['figurinhas'];
  if (plan === LIFE_PLAN) return ['vitalicio'];
  if (plan === CUSTOM_PLAN) return ['personalizadas'];
  if (product === REFKIT) return BUMPS.PPPBFLFO;
  if (product === MAIN) return MAIN_PLANS[plan] || ['basico'];
  if (product === H_MAIN) return H_MAIN_OFFERS[plan] || ['basico'];
  return BUMPS[product] || H_BUMPS[product] || [];
}

// Hubla webhook v2: {type, event:{product, products:[{id, offers:[{id}]}], user:{email}, ...}}.
// Returns rows [{product, plan}] and the buyer e-mail; status is mapped by the caller.
const H_GRANT = new Set(['invoice.payment_succeeded', 'customer.member_added', 'NewSale']);
const H_REVOKE = new Set(['invoice.refunded', 'invoice.chargeback', 'customer.member_removed', 'CanceledSale']);
const H_KNOWN = [H_MAIN, ...Object.keys(H_BUMPS)];
export function parseHubla(b) {
  const ev = b.event || b;
  const email = cleanEmail(ev.user?.email || ev.customer?.email || ev.payer?.email || ev.invoice?.payer?.email || ev.userEmail);
  const prods = new Set(), offers = new Set();
  for (const p of [ev.product, ...(ev.products || [])].filter(Boolean)) {
    if (p.id) prods.add(String(p.id));
    for (const o of p.offers || []) if (o?.id) offers.add(String(o.id));
  }
  if (ev.offer?.id) offers.add(String(ev.offer.id));
  // unknown payload shape: fall back to spotting our ids anywhere in it (grants only, see hook)
  const scanned = !H_KNOWN.some(id => prods.has(id));
  if (scanned) {
    const s = JSON.stringify(b);
    for (const id of H_KNOWN) if (s.includes(id)) prods.add(id);
    for (const id of Object.keys(H_MAIN_OFFERS)) if (s.includes(id)) offers.add(id);
  }
  const rows = [];
  for (const id of prods) {
    if (id === H_MAIN) {
      const tier = Object.keys(H_MAIN_OFFERS).find(o => offers.has(o)) || '';
      rows.push({ product: id, plan: tier });
    } else if (H_BUMPS[id]) rows.push({ product: id, plan: '' });
  }
  return { email, rows, type: String(b.type || ''), scanned };
}

// rows: [{product, plan, status, approved}] -> {features:[...], basicUntil}
// accounts that never hit the daily sticker limit: the shared influencer demo login and the owner (@storieslab.test accounts are limited, for testing)
export const noStickerLimit = email => ['influencer@gmail.com', 'tanpzdigital@gmail.com'].includes(email);
// 'figurinhas' alone (someone who bought only the R$5,90 plan) is not access to the app
export const hasAccess = e => e.features.some(x => !['figurinhas', 'vitalicio', 'personalizadas'].includes(x));
export function entitlements(rows, now = Date.now(), email = '', start = null, premiumStart = null) {
  const f = new Set();
  let basicUntil = null, hadBasic = false, basic30 = false;
  let hadPremium30 = false, premiumUntil = null, unlimitedPremium = false;
  for (const r of rows) {
    if (!GRANT.has(r.status)) continue;
    if (r.product === H_MAIN && H_PREMIUM365_OFFERS.has(r.plan)) {
      hadPremium30 = true;
      const bought = new Date(r.approved || r.updated || now).getTime();
      const until = Math.max(bought, premiumStart ? Date.parse(premiumStart) : now) + 365 * 864e5;
      premiumUntil = Math.max(premiumUntil || 0, until);
      if (until < now) continue;
    } else if (featuresOf(r.product, r.plan).includes('premium')) unlimitedPremium = true;
    for (const x of featuresOf(r.product, r.plan)) {
      if (x === 'basico' && !featuresOf(r.product, r.plan).includes('premium')) {
        const bought = new Date(r.approved || r.updated || now).getTime(), is30 = bought >= Date.parse(BASIC30_FROM);
        // not entered yet (start null) = the 30 days have not started: counted from now, so it never expires early
        const until = is30 ? Math.max(bought, start ? Date.parse(start) : now) + BASIC30_DAYS * 864e5 : bought + BASIC_DAYS * 864e5;
        if (is30 && until >= now) basic30 = true;
        hadBasic = true;
        basicUntil = Math.max(basicUntil || 0, until);
        if (until < now) continue;
      }
      f.add(x);
    }
  }
  if (f.has('vitalicio')) { f.add('basico'); basicUntil = null; } // Approved lifetime purchases grant access even when the main purchase notification is missing.
  if (f.has('vitalicio') && hadPremium30) { f.add('basico'); f.add('premium'); }
  if (f.has('premium')) {
    basicUntil = unlimitedPremium || f.has('vitalicio') ? null : premiumUntil;
    f.add('animadas'); // Premium bonus lasts as long as the approved Premium entitlement.
  } else if (premiumUntil) basicUntil = Math.max(basicUntil || 0, premiumUntil);
  if (noStickerLimit(email) && f.size) f.add('figurinhas');
  if (hasAccess({ features: [...f] })) f.add('magneticos');   // owner 09/11: Magnéticos left the funnel, free for anyone with access
  return { features: [...f], basicUntil: basicUntil && new Date(basicUntil).toISOString(), ...(basicUntil ? { basicDays: hadPremium30 && f.has('premium') ? 365 : basic30 ? BASIC30_DAYS : BASIC_DAYS } : {}), ...(basic30 && !start && basicUntil ? { startNow: true } : {}), ...(hadPremium30 && !premiumStart ? { premiumStartNow: true } : {}) };
}

// PerfectPay posts JSON; accept form-encoded too (customer[email]=...)
async function readBody(req) {
  const raw = await req.text();
  try { return { raw, b: JSON.parse(raw) }; } catch {}
  const b = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    const parts = k.replace(/\]/g, '').split('[');
    let o = b;
    parts.slice(0, -1).forEach(p => { o = o[p] = o[p] || {}; });
    o[parts.at(-1)] = v;
  }
  return { raw, b };
}

async function hook(req, env) {
  const url = new URL(req.url);
  const { raw, b } = await readBody(req);
  // PerfectPay sends the account's public token in the body; ?k= is for our own tests
  const okToken = env.PP_TOKEN && b.token === env.PP_TOKEN;
  if (!okToken && !(await keyOk(req, env, url.searchParams.get('k'), [env.HOOK_KEY]))) return json({ ok: false }, 401);
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO hooklog (at, body) VALUES (?, ?)').bind(now, raw.slice(0, 20000)).run();
  try { await track(env, b); } catch (e) { console.log('recover track', String(e)); } // abandoned checkout / unpaid Pix reminders

  const email = cleanEmail(b.customer?.email);
  const product = String(b.product?.code || '');
  const plan = String(b.plan?.code || '');
  const status = Number(b.sale_status_enum);
  if (!email || !product) return json({ ok: true, skipped: 'no email/product' });
  if (!GRANT.has(status) && !REVOKE.has(status)) return json({ ok: true, skipped: 'status ' + status });
  const isMain = product === MAIN, sale = String(b.code || '');
  const wasCustomer = isMain && GRANT.has(status) && await isCustomer(env, email);

  await env.DB.prepare(
    `INSERT INTO ent (email, product, plan, status, sale, approved, updated) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT (email, product, plan) DO UPDATE SET status = CASE WHEN ent.status IN (7, 9) AND ent.sale = ?5 THEN ent.status ELSE ?4 END, sale = ?5,
       approved = COALESCE(excluded.approved, ent.approved), updated = ?7`   // audit item 4: a late "paid" of the same sale never undoes its refund/chargeback
  ).bind(email, product, plan, status, sale, GRANT.has(status) ? (b.date_approved || now) : null, now).run();
  if (isMain) {
    try { GRANT.has(status) ? await refGrant(env, raw, email, 'pp:' + sale, wasCustomer, now) : await refRevoke(env, email, now); }
    catch (e) { console.log('ref', String(e)); }
  }
  return json({ ok: true });
}

async function hubla(req, env) {
  const url = new URL(req.url);
  const raw = await req.text();
  // secret key in the webhook URL (?k=); Hubla's x-hubla-token is checked too when configured
  const okKey = env.HUBLA_KEY && url.searchParams.get('k') === env.HUBLA_KEY;
  const okTok = env.HUBLA_TOKEN && req.headers.get('x-hubla-token') === env.HUBLA_TOKEN;
  if (!okKey && !okTok) return json({ ok: false }, 401);
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO hooklog (at, body) VALUES (?, ?)').bind(now, 'hubla ' + raw.slice(0, 20000)).run();
  let b;
  try { b = JSON.parse(raw); } catch { return json({ ok: true, skipped: 'not json' }); }
  const { email, rows, type, scanned } = parseHubla(b);
  const status = H_GRANT.has(type) ? 2 : H_REVOKE.has(type) ? 7 : 0;
  if (!status) return json({ ok: true, skipped: 'type ' + type });
  if (scanned) return json({ ok: true, skipped: 'no explicit product' });   // audit item 8: ids found anywhere in the payload (e.g. checkout URL params) never grant
  if (!email || !rows.length) return json({ ok: true, skipped: 'no email/product' });
  const sale = String(b.event?.invoice?.id || b.event?.id || '');
  const isMain = rows.some(r => r.product === H_MAIN);
  const wasCustomer = isMain && status === 2 && await isCustomer(env, email);
  for (const r of rows) {
    await env.DB.prepare(
      `INSERT INTO ent (email, product, plan, status, sale, approved, updated) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT (email, product, plan) DO UPDATE SET status = CASE WHEN ent.status IN (7, 9) AND ent.sale = ?5 THEN ent.status ELSE ?4 END, sale = ?5,
         approved = CASE WHEN ent.sale = excluded.sale THEN COALESCE(ent.approved, excluded.approved) ELSE COALESCE(excluded.approved, ent.approved) END, updated = ?7`
    ).bind(email, r.product, r.plan, status, sale, status === 2 ? now : null, now).run();
  }
  if (isMain) {
    try { status === 2 ? await refGrant(env, raw, email, 'h:' + sale, wasCustomer, now) : await refRevoke(env, email, now); }
    catch (e) { console.log('ref', String(e)); }
  }
  return json({ ok: true, rows: rows.length });
}

// A/B test counters (landing page beacon) + scoreboard. A = PerfectPay, B = Hubla.
// set to the production launch time of the A/B site (UTC ISO). PerfectPay dates use a space, so they are normalized in SQL.
const AB_START = '2026-10-31T18:52:16Z';
const PP_PRICE = { PPLQQQT0M: 14.99, PPLQQQT0N: 27, PPLQQQT0O: 19.9, PPLQQQTVN: 9.9, PPPBFLFK: 9.9, PPPBFLFL: 9.9, PPPBFLFM: 12.9, PPPBFLFN: 12.9, PPPBFLFO: 19.9, PPLQQQT7J: 9.9, PPLQQQU3K: 14.9, PPLQQQT0U: 7.9, PPLQQQT0V: 7.9, PPLQQQT11: 12.9, PPLQQQT10: 9.9 }; // PPLQQQT7J = Kit downsell plan (shown when the upsell is refused)
const H_PRICE = { QMj5JhJdg9dEnbG262ZQ: 27, sXAlfbopdB6LNsF9u5AS: 19.9, ZjRp7qhKO17c5BwcqW2n: 9.9, ZGl5p5eUP5ZxlN4lGG3G: 14.99, g7ehiv7FcvfCYKlC0Hbo: 12.9,
  pTg6Xx75MoOzoXNiNVPo: 9.9, '6V8bWRmHWXQZXE7Xz7Na': 9.9, SKJYloVEWsWNATDm70a4: 12.9, AnpKR4QxPycPeJgUPcVv: 12.9, KPGJDigaQ5RaQhNUnB10: 19.9, XqXxZOfWNvBm23a3I59R: 9.9 }; // XqXx = Hubla Kit downsell offer
// landing page sections, in page order (data-reach in site/index.html)
const AB_SECTIONS = ['hero', 'dor', 'teste', 'reacoes', 'transformacao', 'uso', 'como', 'clientes', 'bonus', 'planos', 'garantia', 'acesso', 'pack', 'faq', 'final']; // page order since 02/11 03h (owner: show how it works before the price)
// real buyers of the main product in the last 24h (social proof on the landing page; never padded)
async function sold(env) {
  // PerfectPay "approved" is local time with a space, Hubla is ISO UTC: compare on a 27h window so neither is cut short
  const since = new Date(Date.now() - 27 * 3600e3).toISOString().slice(0, 19);
  const { results } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT email) n FROM ent WHERE product IN (?1, ?2) AND status IN (2, 10) AND REPLACE(approved, ' ', 'T') >= ?3
       AND COALESCE(sale, '') <> 'MANUAL' AND email NOT LIKE '%storieslab.test' AND email NOT LIKE '%@example.com'`).bind(MAIN, H_MAIN, since).all();
  return new Response(JSON.stringify({ n: results[0].n }), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300' } });
}
// 07/11: headless bots from cloud servers (AWS BR/Seoul) loaded the page with the FB utm and inflated visits ~10x.
// Real visitors come from mobile/home ISPs, so hits from hosting networks are dropped.
const DATACENTER = /amazon|aws|google|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|oracle|alibaba|tencent|huawei cloud|facebook|meta platforms|vultr|choopa|contabo|m247|datacamp|leaseweb|scaleway|cloudflare/i;
// 16/11: speed tests (Lighthouse, PageSpeed, headless Chrome) render the whole page at once and counted as visitors
// that reached every section.
const TEST_UA = /Chrome-Lighthouse|HeadlessChrome|PTST|GTmetrix|Pingdom|bot\b|crawler|spider/i;
async function abHit(req, env) {
  if (DATACENTER.test(req.cf?.asOrganization || '') || TEST_UA.test(req.headers.get('user-agent') || '')) return json({ ok: true });
  // 16/11: page tests on localhost and *.pages.dev previews were counted as real visits
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$|\.pages\.dev$/.test(req.headers.get('origin') || '')) return json({ ok: true });
  let b;
  try { b = JSON.parse(await req.text()); } catch { return json({ ok: false }, 400); }
  const v = ['a', 'b', 'i'].includes(b.v) ? b.v : null; // i = image-ad visitors, PerfectPay outside the test
  const e = ['view', 'click', 'reach', 'time', 'try', 'page', 'quiz'].includes(b.e) ? b.e : null;
  const OK = { view: ['', 'ads'], click: ['', 'basico', 'premium', 'downsell', 'bdown'], reach: AB_SECTIONS, time: ['15', '30', '60', '120', '300'], try: ['copy', 'share', 'fail', 'paste', 'add', 'photo', 'download', 'reset', 'trash', 'pinch', 'scene_bomdia', 'scene_treino', 'scene_praia', 'scene_date', 'scene_cafe'], // + the Experimente demo (16/11: these were rejected before)
    page: ['upsell', 'upsell2', 'upsell3', 'upsell_marca', 'obrigado', 'kit_click', 'volta', 'volta_click'],
    quiz: ['open', 'start', 'main', 'extra', 'copy', 'paste', 'share', 'src', 'freq', 'pain', 'use', 'result', 'ds', 'click_premium', 'click_basico', 'click_downsell', 'photo', 'download', 'style', 'style_share', 'scratch', 'style_rotina', 'style_beleza', 'style_moda', 'style_negocios', 'style_fitness', 'style_familia', 'style_comida', 'style_fe'] }; // site/quiz funnel steps
  const plan = e && OK[e].includes(b.plan || '') ? (b.plan || '') : '';
  if (e && e !== 'view' && e !== 'click' && !plan) return json({ ok: false }, 400);
  if (!v || !e) return json({ ok: false }, 400);
  // ponytail: anyone can inflate counts; fine for an internal A/B read, sales come from webhooks
  await env.DB.prepare(`INSERT INTO ab (day, v, e, plan, n) VALUES (?1, ?2, ?3, ?4, 1)
    ON CONFLICT (day, v, e, plan) DO UPDATE SET n = n + 1`).bind(brDay(), v, e, plan).run(); // BRT day, like sales (rows before 01/11 21h are UTC days)
  return json({ ok: true });
}
async function abStats(req, env) {
  const url = new URL(req.url);
  if (!(await keyOk(req, env, url.searchParams.get('k'), [env.HOOK_KEY]))) return json({ ok: false }, 401);
  const { results: hits } = await env.DB.prepare('SELECT v, e, plan, SUM(n) n FROM ab GROUP BY v, e, plan').all();
  const { results: rows } = await env.DB.prepare(
    `SELECT email, product, plan FROM ent WHERE status IN (2, 10) AND REPLACE(approved, ' ', 'T') >= ? AND COALESCE(sale, '') <> 'MANUAL' AND email NOT LIKE '%storieslab.test'`).bind(AB_START).all();
  const blank = () => ({ views: 0, clicks: {}, reach: {}, time: {}, try: {}, page: {}, buyers: new Set(), sales: 0, revenue: 0 });
  const out = { a: blank(), b: blank() };
  for (const h of hits) {
    const o = out[h.v];
    if (h.e === 'view') o.views += h.n;
    else if (h.e === 'click') o.clicks[h.plan || '?'] = h.n;
    else if (o[h.e]) o[h.e][h.plan] = h.n;
  }
  for (const r of rows) {
    const isH = r.product === H_MAIN || H_BUMPS[r.product];
    const isP = r.product === MAIN || BUMPS[r.product];
    if (!isH && !isP) continue;
    const o = out[isH ? 'b' : 'a'];
    const price = isH ? (H_PRICE[r.plan] ?? H_PRICE[r.product]) : (PP_PRICE[r.plan] && r.product !== MAIN ? PP_PRICE[r.plan] : PP_PRICE[r.product === MAIN ? r.plan : r.product]);
    o.sales++; o.revenue += price || 0;
    if (r.product === H_MAIN || r.product === MAIN) o.buyers.add(r.email);
  }
  for (const k of ['a', 'b']) {
    const o = out[k]; o.buyers = o.buyers.size; o.revenue = Math.round(o.revenue * 100) / 100;
    o.conversion = o.views ? +(100 * o.buyers / o.views).toFixed(2) : 0;
    o.revenuePerView = o.views ? +(o.revenue / o.views).toFixed(3) : 0;
    // share of visitors that reached each section / stayed N seconds
    o.reachPct = Object.fromEntries(AB_SECTIONS.map(k => [k, o.views ? +(100 * (o.reach[k] || 0) / o.views).toFixed(1) : 0]));
    o.timePct = Object.fromEntries(Object.entries(o.time).map(([k, n]) => [k + 's', o.views ? +(100 * n / o.views).toFixed(1) : 0]));
  }
  return json({ since: AB_START, note: 'a = PerfectPay, b = Hubla; revenue = list price (no fees); manual grants excluded', ...out });
}

// In-app usage events (one row per day/user/event/key, counted). Read with GET /api/ev?k=HOOK_KEY.
const EV = new Set(['open', 'cat', 'copy', 'down', 'fav', 'gift', 'up_view', 'up_click', 'offer_view', 'offer_click', 'profile', 'rel', 'push', 'ping', 'install', 'search', 'photo', 'rank_open', 'vit_view', 'vit_click', 'news', 'cus_view', 'cus_click', 'cus_banner', 'cus_brief_view', 'cus_brief_sent', 'cus_copy',
  'post_open', 'ai_wait', 'tour', 'mat', 'mat_done', 'mat_down', 'ref_view', 'ref_wa', 'ref_copy', 'ig_view', 'ig_dm', 'ig_copy']);   // 11/11: these were sent by engage.js/mat.js but rejected with 400
// live/behaviour tables: seen = last activity per user (live users, installed app, notification permission),
// act = events per user per BRT hour (hourly active users). ping (every 60 s while the app is on screen) only touches these two.
// tables in schema.sql (seen, act, pushlog)
const MODES = new Set(['app', 'web']), PERMS = new Set(['granted', 'denied', 'default', 'na']);
function trackUse(env, email, e, m, p) {
  const at = new Date().toISOString(), h = new Date(Date.now() - 3 * 3600e3).getUTCHours();
  return [
    env.DB.prepare(`INSERT INTO seen (email, first, at, mode, pwa, notif, last) VALUES (?1, ?2, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT (email) DO UPDATE SET at = ?2, mode = COALESCE(?3, mode), pwa = MAX(pwa, ?4), notif = COALESCE(?5, notif), last = COALESCE(?6, last)`)
      .bind(email, at, MODES.has(m) ? m : null, m === 'app' || e === 'install' ? 1 : 0, PERMS.has(p) ? p : null, e === 'ping' ? null : e),
    env.DB.prepare(`INSERT INTO act (day, h, email, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (day, h, email) DO UPDATE SET n = n + 1`).bind(brDay(), h, email),
  ];
}
// Ad spend straight from the Meta Marketing API (owner 01/11: typed-in spend was wrong). Needs secret META_TOKEN
// (ads_read) and optional var META_ACCOUNTS = "id1,id2,id3". Today and yesterday are refreshed every 10 min, because Meta keeps
// adjusting the previous day. Stored spend includes Meta's Brazilian tax (UTMify shows it without).
// owner 03/11: Meta blocked our app ("API access blocked"), so spend now comes from UTMify's MCP server when secret
// UTMIFY_TOKEN is set (UTMify > Avançado > Integração MCP). UTMify reads Meta through its own connection.
// var UTMIFY_DASH = dashboard id ("Sublime" = Stories Lab).
async function utmifySpend(env, tax) {
  const init = await utmifyCall(env, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'storieslab', version: '1' } });
  await utmifyCall(env, 'notifications/initialized', undefined, init.sid);
  if (env._debug) env._debug.enabled = JSON.parse((await utmifyCall(env, 'tools/call', { name: 'get_dashboards', arguments: {} }, init.sid)).body.result.content[0].text)
    .map(d => [d.name, d.metaProfiles.flatMap(p => p.adAccounts.filter(a => a.enabled).map(a => a.id + ' ' + a.name))]);
  const out = {};
  for (const day of [brDay(), brDay(Date.now() - 864e5)]) {
    const { body } = await utmifyCall(env, 'tools/call', { name: 'get_dashboard_summary', arguments: { dashboardId: env.UTMIFY_DASH || '65f507b820c872cfc0853444',
      dateRange: { from: `${day}T00:00:00-03:00`, to: `${day}T23:59:59-03:00` } } }, init.sid);
    if (body?.error || body?.result?.isError) throw new Error('utmify: ' + JSON.stringify(body.error || body.result.content).slice(0, 200));
    const d = JSON.parse(body.result.content[0].text), sum = (d.ads?.meta?.spent ?? d.ads?.spent ?? NaN) / 100;
    if (!Number.isFinite(sum)) throw new Error('utmify: no ads.meta.spent');   // never store a guess
    if (env._debug) env._debug[day] = { spent: sum, metaAdsTax: d.analytics?.metaAdsTax / 100 };
    // owner 14/11: the dollar accounts (UTMify "ca" name contains DOLLAR) pay no Meta tax; only the rest is taxed.
    const c = (await utmifyCall(env, 'tools/call', { name: 'get_meta_ad_objects', arguments: { dashboardId: env.UTMIFY_DASH || '65f507b820c872cfc0853444', level: 'campaign',
      dateRange: { from: `${day}T00:00:00-03:00`, to: `${day}T23:59:59-03:00` } } }, init.sid)).body;
    if (c?.error || c?.result?.isError) throw new Error('utmify campaigns: ' + JSON.stringify(c.error || c.result.content).slice(0, 200));
    const brl = JSON.parse(c.result.content[0].text).results.filter(r => !/dollar/i.test(r.ca || '')).reduce((t, r) => t + (Number(r.spend) || 0), 0) / 100;
    const taxAmt = Math.min(brl, sum) * tax;
    const eff = sum > 0 ? taxAmt / sum : 0;
    await env.DB.prepare('INSERT OR REPLACE INTO spend (day, amount, note) VALUES (?1, ?2, ?3)')
      .bind(day, Math.round((sum + taxAmt) * 100) / 100, `UTMify ${sum.toFixed(2)} + imposto ${(eff * 100).toFixed(2)}% (só contas BRL; auto ${new Date().toISOString().slice(11, 16)} UTC)`).run();
    out[day] = sum;
  }
  return out;
}
// owner 09/11: per-campaign numbers for budget decisions. GET /api/admin/utmcamp?day=YYYY-MM-DD&level=campaign|adset
async function utmifyCampaigns(req, env) {
  if (!env.UTMIFY_TOKEN) return json({ ok: false, error: 'no UTMIFY_TOKEN' }, 400);
  const u = new URL(req.url), day = /^\d{4}-\d{2}-\d{2}$/.test(u.searchParams.get('day') || '') ? u.searchParams.get('day') : brDay();
  const level = ['campaign', 'adset', 'ad'].includes(u.searchParams.get('level')) ? u.searchParams.get('level') : 'campaign';
  const init = await utmifyCall(env, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'storieslab', version: '1' } });
  await utmifyCall(env, 'notifications/initialized', undefined, init.sid);
  const { body } = await utmifyCall(env, 'tools/call', { name: 'get_meta_ad_objects', arguments: { dashboardId: env.UTMIFY_DASH || '65f507b820c872cfc0853444', level,
    dateRange: { from: `${day}T00:00:00-03:00`, to: `${day}T23:59:59-03:00` } } }, init.sid);
  if (body?.error || body?.result?.isError) return json({ ok: false, error: JSON.stringify(body.error || body.result.content).slice(0, 300) }, 502);
  const d = JSON.parse(body.result.content[0].text);
  const keep = ['name', 'status', 'effectiveStatus', 'dailyBudget', 'spend', 'approvedOrdersCount', 'totalOrdersCount', 'revenue', 'grossRevenue', 'profit', 'roas', 'cpa', 'cpm', 'inlineLinkClickCtr', 'costPerInlineLinkClick', 'landingPageViews', 'initiateCheckout', 'conversion', 'createdTime', 'campaignId', 'adsetId', 'metaAdsTax', 'tax', 'fees', 'ca'];   // ca = ad account name (owner 14/11: per-account read)
  return json({ ok: true, day, level, untracked: d.untrackedCount, rows: (d.results || []).map(r => Object.fromEntries(keep.map(k => [k, r[k]]))) });
}
async function metaSpend(env) {
  if (env.UTMIFY_TOKEN) return utmifySpend(env, env.META_TAX != null ? Number(env.META_TAX) : 0.1215);
  if (!env.META_TOKEN) return { skip: 'no META_TOKEN' };
  // without META_ACCOUNTS, every ad account the token can see is summed (a system-user token only sees the ones assigned to it)
  let ids = env.META_ACCOUNTS;
  if (!ids) {
    const r = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=account_id,name&limit=50&access_token=${env.META_TOKEN}`).then(x => x.json());
    if (r.error) throw new Error(r.error.message);
    ids = (r.data || []).map(a => a.account_id).join(',');
    if (env._debug) env._debug.accounts = r.data;
  }
  // owner 02/11: count Meta's Brazilian tax on the card invoice (PIS/COFINS 9.25% + ISS 2.9%). Override with var META_TAX.
  const tax = env.META_TAX != null ? Number(env.META_TAX) : 0.1215;
  const out = {};
  for (const day of [brDay(), brDay(Date.now() - 864e5)]) {
    let sum = 0;
    for (const id of ids.split(',').map(x => x.trim().replace(/^act_/, '')).filter(Boolean)) {
      const u = `https://graph.facebook.com/v21.0/act_${id}/insights?fields=spend&time_range=${encodeURIComponent(JSON.stringify({ since: day, until: day }))}&access_token=${env.META_TOKEN}`;
      const r = await fetch(u).then(x => x.json());
      if (r.error) throw new Error(`act_${id}: ${r.error.message} (code ${r.error.code}${r.error.error_subcode ? "/" + r.error.error_subcode : ""}, ${r.error.type || ""})`);   // never store a partial sum
      sum += Number(r.data?.[0]?.spend || 0);
      if (env._debug) (env._debug[day] ||= {})[id] = Number(r.data?.[0]?.spend || 0);
    }
    await env.DB.prepare('INSERT OR REPLACE INTO spend (day, amount, note) VALUES (?1, ?2, ?3)')
      .bind(day, Math.round(sum * (1 + tax) * 100) / 100, `Meta API ${sum.toFixed(2)} + imposto ${(tax * 100).toFixed(2)}% (auto ${new Date().toISOString().slice(11, 16)} UTC)`).run();
    out[day] = sum;
  }
  return out;
}
const brDay = (t = Date.now()) => new Date(t - 3 * 3600e3).toISOString().slice(0, 10);
async function evHit(req, env) {
  let b;
  try { b = JSON.parse(await req.text()); } catch { return json({ ok: false }, 400); }
  const email = cleanEmail(b.email), e = String(b.e || ''), k = String(b.k || '').slice(0, 60);
  if (!EV.has(e) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false }, 400);
  // ponytail: unauthenticated like /api/ab, so counts can be inflated; it is internal analytics, sales come from webhooks
  const q = trackUse(env, email, e, b.m, b.p);
  if (e !== 'ping') q.push(env.DB.prepare(`INSERT INTO ev (day, email, e, k, n) VALUES (?1, ?2, ?3, ?4, 1)
    ON CONFLICT (day, email, e, k) DO UPDATE SET n = n + 1`).bind(brDay(), email, e, k));
  // per-sticker ranking (owner 11/11): aggregated by sticker id, no e-mail stored; test accounts skipped
  const s = Number(b.s);
  if ((e === 'copy' || e === 'down') && Number.isInteger(s) && s > 0 && s < 1e5 && /^[a-z0-9-]+$/.test(k) && !/(storieslab\.test|@example\.com)$/.test(email))
    q.push(env.DB.prepare(`INSERT INTO stk (day, id, e, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (day, id, e) DO UPDATE SET n = n + 1`).bind(brDay(), k + '/' + s, e));
  // weekly ranking (rank.js): only from her own signed-in session
  if ((e === 'copy' || e === 'down' || e === 'photo') && cleanEmail(await sessionEmail(req, env)) === email) {
    const r = rankHit(env, email, e);
    if (r) q.push(r);
  }
  await env.DB.batch(q);
  return json({ ok: true });
}
// the service worker reports push shown/clicked; it only knows its subscription endpoint, which maps to the user
async function pushEv(req, env) {
  let b;
  try { b = JSON.parse(await req.text()); } catch { return json({ ok: false }, 400); }
  const e = b.e === 'push_click' ? 'push_click' : b.e === 'push_show' ? 'push_show' : null;
  const row = e && await env.DB.prepare('SELECT email FROM push WHERE endpoint = ?').bind(String(b.endpoint || '')).first();
  if (!row) return json({ ok: false }, 400);
  await env.DB.prepare(`INSERT INTO ev (day, email, e, k, n) VALUES (?1, ?2, ?3, '', 1)
    ON CONFLICT (day, email, e, k) DO UPDATE SET n = n + 1`).bind(brDay(), row.email, e).run();
  return json({ ok: true });
}
// rows: {day, email, e, k, n}; today: 'YYYY-MM-DD'
export function evSummary(rows, today) {
  const addDay = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const days = {}, first = {}, active = new Set(), sum = (o, k, n) => (o[k] = (o[k] || 0) + n);
  const tot = {}, copiesByCat = {}, opensByCat = {}, offerViews = {}, offerClicks = {};
  for (const r of rows) {
    const d = (days[r.day] ||= { users: new Set(), copies: 0 });
    d.users.add(r.email); active.add(r.day + '|' + r.email);
    if (!first[r.email] || r.day < first[r.email]) first[r.email] = r.day;
    sum(tot, r.e, r.n);
    if (r.e === 'copy' || r.e === 'down') { d.copies += r.n; sum(copiesByCat, r.k, r.n); }
    if (r.e === 'cat') sum(opensByCat, r.k, r.n);
    if (r.e === 'offer_view') sum(offerViews, r.k, r.n);
    if (r.e === 'offer_click') sum(offerClicks, r.k, r.n);
  }
  const ret = n => {
    const base = Object.entries(first).filter(([, d]) => addDay(d, n) <= today);
    const back = base.filter(([e, d]) => active.has(addDay(d, n) + '|' + e)).length;
    return { users: base.length, back, pct: base.length ? +(100 * back / base.length).toFixed(1) : 0 };
  };
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const users = Object.keys(first).length, uses = (tot.copy || 0) + (tot.down || 0);
  return {
    users, usesPerUser: users ? +(uses / users).toFixed(1) : 0, totals: tot,
    perDay: Object.keys(days).sort().map(d => ({ day: d, users: days[d].users.size, uses: days[d].copies })),
    retention: { d1: ret(1), d7: ret(7) },
    topCopied: top(copiesByCat), topOpened: top(opensByCat), offerViews, offerClicks,
  };
}
async function evStats(req, env) {
  const url = new URL(req.url);
  if (!(await keyOk(req, env, url.searchParams.get('k'), [env.HOOK_KEY]))) return json({ ok: false }, 401);
  const since = brDay(Date.now() - 30 * 864e5);
  const { results } = await env.DB.prepare(
    `SELECT day, email, e, k, n FROM ev WHERE day >= ? AND email NOT LIKE '%storieslab.test' AND email NOT LIKE '%@example.com'`).bind(since).all();
  return json({ since, ...evSummary(results, brDay()) });
}

// most copied categories in the last 14 days, for the app's "Mais usados" row: public, aggregated (no e-mails), cached 1h
export async function topCats(env, now = Date.now()) {
  const { results } = await env.DB.prepare(
    `SELECT k slug, SUM(n) n FROM ev WHERE e IN ('copy', 'down') AND day >= ? AND k <> ''
     AND email NOT LIKE '%storieslab.test' AND email NOT LIKE '%@example.com' GROUP BY k ORDER BY n DESC LIMIT 12`).bind(brDay(now - 14 * 864e5)).all();
  return (results || []).map(r => ({ slug: String(r.slug), n: +r.n }));
}

// owner 14/11: inside each category the most copied stickers come first (no badge, only the order).
// Built hourly by the */10 cron into admin_cfg 'topstk' so an app open reads one row, not the whole stk window.
export function topStkMap(rows, per = 30) {
  const out = {};
  for (const r of rows) { const [slug, s] = String(r.id).split('/'); const a = (out[slug] ||= []); if (a.length < per && +s > 0) a.push(+s); }
  return out;
}
async function topStk(env, now = Date.now()) {
  const { results } = await env.DB.prepare(
    `SELECT id, SUM(n) n FROM stk WHERE day >= ? GROUP BY id HAVING n >= 2 ORDER BY n DESC, MAX(day) DESC`).bind(brDay(now - 30 * 864e5)).all();
  const out = topStkMap(results || []);
  await env.DB.prepare("INSERT OR REPLACE INTO admin_cfg (k, v) VALUES ('topstk', ?)").bind(JSON.stringify(out)).run();
  return out;
}

// ---------- web push: empty "tickle" pushes (no payload encryption needed); the service worker
// fetches the text from GET /api/push. Sent by the cron in wrangler.jsonc (Mon/Wed/Fri 9h BRT; Cloudflare reads 1,3,5 as Sun/Tue/Thu, so the cron uses MON,WED,FRI).
const VAPID_PUB = 'BB95F2GVzvLOGhw8FrpM19iR7ZMNUtjoWNlUtfjblyDxlHmAOHHNupJXxxfCxeGFYGqEk1PHSau3gQtMQegYxSI';
const PUSH_HOST = /^https:\/\/([a-z0-9-]+\.)*(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)\//;
async function pushSub(req, env) {
  let b;
  try { b = JSON.parse(await req.text()); } catch { return json({ ok: false }, 400); }
  const email = cleanEmail(b.email), endpoint = String(b.endpoint || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !PUSH_HOST.test(endpoint) || endpoint.length > 1000) return json({ ok: false }, 400);
  await env.DB.prepare('INSERT OR REPLACE INTO push (endpoint, email, created) VALUES (?1, ?2, ?3)').bind(endpoint, email, new Date().toISOString()).run();
  return json({ ok: true });
}
const DATES = Y => {
  const nth = (m, dow, k) => { const d = new Date(Date.UTC(Y, m, 1)); d.setUTCDate(1 + (dow - d.getUTCDay() + 7) % 7 + 7 * (k - 1)); return d; };
  const bf = nth(10, 4, 4); bf.setUTCDate(bf.getUTCDate() + 1);
  return [[new Date(Date.UTC(Y, 0, 1)), 'Ano Novo'], [new Date(Date.UTC(Y, 2, 8)), 'Dia das Mulheres'], [nth(4, 0, 2), 'Dia das Mães'],
    [new Date(Date.UTC(Y, 5, 12)), 'Dia dos Namorados'], [nth(7, 0, 2), 'Dia dos Pais'], [bf, 'Black Friday'], [new Date(Date.UTC(Y, 11, 25)), 'Natal']];
};
export function pushMsg(t = Date.now()) {
  const now = new Date(t - 3 * 3600e3), today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const next = [...DATES(now.getUTCFullYear()), ...DATES(now.getUTCFullYear() + 1)].map(([d, n]) => [Math.round((d - today) / 864e5), n]).find(([n]) => n >= 0);
  const dow = now.getUTCDay();
  if (next && next[0] <= 30 && dow === 3) return { title: next[0] ? `Faltam ${next[0]} dias pro ${next[1]}` : `Hoje é ${next[1]}!`, body: `Suas figurinhas de ${next[1]} já estão prontas no app.`, url: '/' };
  if (dow === 5) return { title: 'Sextou!', body: 'Figurinhas de final de semana prontas pro seu Story.', url: '/' };
  if (dow === 3) return { title: 'Meio da semana pede Story bonito', body: 'Sua figurinha do dia já está te esperando.', url: '/' };
  return { title: 'Bom dia! Sua figurinha do dia chegou', body: 'Abre o app e deixa o Story de hoje lindo em segundos.', url: '/' };
}
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export async function vapidJwt(jwk, aud, now = Date.now()) {
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const enc = o => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const head = enc({ typ: 'JWT', alg: 'ES256' }) + '.' + enc({ aud, exp: Math.floor(now / 1000) + 12 * 3600, sub: 'https://storieslab.shop' });
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(head));
  return head + '.' + b64url(sig);
}
async function pushAll(env) {
  if (!env.VAPID_D) return { skipped: 'no VAPID_D secret' };
  const raw = Uint8Array.from(atob(VAPID_PUB.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const jwk = { kty: 'EC', crv: 'P-256', x: b64url(raw.slice(1, 33)), y: b64url(raw.slice(33, 65)), d: env.VAPID_D };
  const { results } = await env.DB.prepare('SELECT endpoint FROM push').all();
  const jwts = {};
  let sent = 0, gone = 0;
  // ponytail: one cron run sends to everyone in sequence; subrequest limits (50 free / 1000 paid) cap it, move to Queues past ~900 subscribers
  for (const { endpoint } of results) {
    const aud = new URL(endpoint).origin;
    jwts[aud] ||= await vapidJwt(jwk, aud);
    const r = await fetch(endpoint, { method: 'POST', headers: { TTL: '43200', Urgency: 'normal', Authorization: `vapid t=${jwts[aud]}, k=${VAPID_PUB}` } });
    if (r.status === 404 || r.status === 410) { gone++; await env.DB.prepare('DELETE FROM push WHERE endpoint = ?').bind(endpoint).run(); }
    else if (r.ok) sent++;
  }
  await env.DB.prepare('INSERT OR REPLACE INTO pushlog (at, sent, gone, total) VALUES (?1, ?2, ?3, ?4)').bind(new Date().toISOString(), sent, gone, results.length).run();
  return { sent, gone, total: results.length };
}

// Cloned sales pages report themselves: the site guard (/*sl-g*/, app-tools/anticlone/patch_site.py) calls
// GET /api/clone?h=host&u=url&r=referrer when the page runs on a foreign host. Listed in the admin (table clone).
// ponytail: unauthenticated, so fake hosts can be inserted; it is a lead list, not proof.
const http = v => (/^https?:\/\//i.test(v || '') ? String(v) : '');   // audit item 2: never store javascript: or data: links
async function cloneHit(req, env) {
  const q = new URL(req.url).searchParams, h = String(q.get('h') || 'arquivo.local').toLowerCase().slice(0, 120);
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)) await env.DB.prepare(`INSERT INTO clone (host, first, last, n, url, ref) VALUES (?1, ?2, ?2, 1, ?3, ?4)
    ON CONFLICT (host) DO UPDATE SET last = ?2, n = n + 1, url = ?3, ref = COALESCE(NULLIF(?4, ''), ref)`)
    .bind(h, new Date().toISOString(), http(q.get('u')).slice(0, 300), http(q.get('r')).slice(0, 200)).run();
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}

// Terms of use, accepted once per version (owner 04/11). The app shows a short screen after the first login of each
// version and POSTs /api/terms; the row (e-mail, version, time, IP, user-agent, device) is the record for chargeback or
// resale disputes. Text of each version: app-tools/anticlone/termos-v<N>.txt. Bump TERMS_V to ask everyone again.
const TERMS_V = 1;
async function termsAccept(req, env) {
  const email = await sessionEmail(req, env);   // the sl_session cookie set by /api/login
  if (!email) return json({ ok: false, error: 'session' }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  await env.DB.prepare('INSERT OR IGNORE INTO terms (email, v, at, ip, ua, device) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(email, TERMS_V, new Date().toISOString(), req.headers.get('cf-connecting-ip') || '', (req.headers.get('user-agent') || '').slice(0, 300), String(b.device || '').slice(0, 64)).run();
  return json({ ok: true, v: TERMS_V });
}

// Premium gate (08/11): milestone gifts live in D1 (table gift) so the CDN pass can carry them; before they were only in localStorage.
const PREMIUM_SET = new Set(PREMIUM_SLUGS);
const GIFT_AT = [10, 50, 100, 250, 500, 1000];   // same milestones as app/engage.js
const passFlags = (features, gifts) => (features.includes('premium') ? '*' : gifts.join(','));
const giftsOf = async (env, email) => (await env.DB.prepare('SELECT slug FROM gift WHERE email = ?').bind(email).all().catch(() => ({ results: [] }))).results.map(r => r.slug);
async function giftHit(req, env) {
  const email = cleanEmail(await sessionEmail(req, env));
  let slug = '';
  try { slug = String((await req.json()).slug || ''); } catch {}
  if (!email || !PREMIUM_SET.has(slug)) return json({ ok: false }, 400);
  const { results } = await env.DB.prepare('SELECT product, plan, status, approved, updated FROM ent WHERE email = ?').bind(email).all();
  const starts = await accessStarts(env, email);
  const e = entitlements(results, Date.now(), email, starts.start, starts.premiumStart);
  if (!hasAccess(e)) return json({ ok: false }, 403);
  const gifts = await giftsOf(env, email);
  if (!gifts.includes(slug)) {
    // ponytail: copies counted from the ev log (+5 slack for events lost offline); a determined user could inflate it with fake events
    const used = (await env.DB.prepare("SELECT COALESCE(SUM(n), 0) n FROM ev WHERE email = ? AND e IN ('copy', 'down')").bind(email).first()).n + 5;
    if (gifts.length >= GIFT_AT.filter(m => used >= m).length) return json({ ok: false, error: 'not yet' }, 403);
    await env.DB.prepare('INSERT OR IGNORE INTO gift (email, slug, created) VALUES (?, ?, ?)').bind(email, slug, new Date().toISOString()).run();
    gifts.push(slug);
  }
  return json({ ok: true, gifts, pass: await makePass(env, email, passFlags(e.features, gifts)) });
}

// Text materials bought as checkout bumps (owner 18/11): served only to a session that owns the feature.
const MAT_DATA = { reels: MAT_REELS, perfil: MAT_PERFIL };
async function matData(req, env) {
  const k = new URL(req.url).searchParams.get('k'), d = MAT_DATA[k];
  const email = cleanEmail(await sessionEmail(req, env));
  if (!d || !email) return json({ ok: false }, 403);
  const { results } = await env.DB.prepare('SELECT product, plan, status, approved, updated FROM ent WHERE email = ?').bind(email).all();
  const starts = await accessStarts(env, email);
  if (!entitlements(results, Date.now(), email, starts.start, starts.premiumStart).features.includes(k)) return json({ ok: false }, 403);
  return json(d);
}

async function login(req, env) {
  let email, b;
  try { b = await req.json(); email = cleanEmail(b.email); } catch { return json({ ok: false, error: 'bad request' }, 400); }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);
  // ponytail: no rate limit; add Workers rate-limit binding if someone starts enumerating e-mails
  const { results } = await env.DB.prepare('SELECT product, plan, status, approved, updated FROM ent WHERE email = ?').bind(email).all();
  const { start, premiumStart } = await accessStarts(env, email);
  const { startNow, premiumStartNow, ...e } = entitlements(results, Date.now(), email, start, premiumStart);
  const ok=hasAccess(e);
  if (ok && e.basicDays === BASIC30_DAYS) await env.DB.prepare('INSERT OR IGNORE INTO basic_start (email, at) VALUES (?, ?)').bind(email, start || new Date().toISOString()).run().catch(() => {});
  if(ok&&await isBlocked(env,email))return json({ok:false,error:'blocked',email});   // admin > Segurança
  if(ok){const gate=await deviceGate(env,email,b,req.headers.get('user-agent')||'');if(gate)return json({...gate,email});}   // one device per customer (device.js)
  if (ok && premiumStartNow) await env.DB.prepare('INSERT OR IGNORE INTO premium_start (email, at) VALUES (?, ?)').bind(email, new Date().toISOString()).run();
  const gifts=ok?await giftsOf(env,email):[];
  const response=json({ok,email,...e,gifts,expired:!ok&&!!e.basicUntil,...(ok?{trials:await trialState(env,email,e.features),pass:await makePass(env,email,passFlags(e.features,gifts)),termsV:TERMS_V,terms:(await env.DB.prepare('SELECT MAX(v) v FROM terms WHERE email = ?').bind(email).first())?.v||0}:{})});
  if(ok)response.headers.set('set-cookie',await sessionCookie(env,email));
  return response;
}

export default {
  async fetch(req, env, ctx) {
    const { pathname } = new URL(req.url);
    // owner 16/11: /m/* = bonus videos, PDFs and materials on storieslab-cdn-4 (same job as the Vercel rewrite on app.storieslab.shop)
    // ponytail: each /m/ request costs two Worker invocations; move to a route on cdn-4 (gate.js stripping /m) if volume matters
    if (pathname.startsWith('/m/') && env.CDN4) { const u = new URL(req.url); u.pathname = pathname.slice(2); return env.CDN4.fetch(new Request(u, req)); }
    // Any browser call from a foreign site (cloned app or page, script guard stripped) is logged in the clone table.
    try { const o = new URL(req.headers.get('origin') || 'null:'); if (/^https?:$/.test(o.protocol) && pathname.startsWith('/api/') && !/(^|\.)(storieslab\.(shop|app)|workers\.dev|stories-lab-sandy\.vercel\.app|storieslab-figurinhas\.vercel\.app)$|^(localhost|127\.0\.0\.1)$|^stories-[a-z0-9]+-heavenly-destinys-projects\.vercel\.app$/.test(o.hostname))
      ctx?.waitUntil(env.DB.prepare(`INSERT INTO clone (host, first, last, n, url, ref) VALUES (?1, ?2, ?2, 1, ?3, '') ON CONFLICT (host) DO UPDATE SET last = ?2, n = n + 1, url = ?3`).bind(o.hostname.slice(0, 120), new Date().toISOString(), http(req.headers.get('referer')).slice(0, 300)).run().catch(() => {})); } catch (e) {}
    if (pathname === '/bio' && ['GET','HEAD'].includes(req.method)) {
      const redirect = await shortRequest(req, env, ctx);
      if (redirect.status !== 302) return redirect;
      const attribution = new URL(redirect.headers.get('location')).searchParams;
      const chooser = await env.ASSETS.fetch(new Request('https://app.storieslab.shop/acessar', { method: req.method }));
      const page = new HTMLRewriter()
        .on('img[src]', { element(el) { el.setAttribute('src', new URL(el.getAttribute('src'), 'https://app.storieslab.shop').href); } })
        .on('script[src]', { element(el) { el.remove(); } })
        .on('a.choice', { element(el) {
          const target = new URL(el.getAttribute('href').replace(/&amp;/g, '&'));
          for (const [field,value] of attribution) target.searchParams.set(field,value);
          el.setAttribute('href', target.href);
        } }).transform(chooser);
      const response = new Response(page.body, page);
      response.headers.set('Cache-Control','no-store');
      return response;
    }
    if(SHORT_ROUTES[pathname]||pathname.startsWith('/l/'))return shortRequest(req,env,ctx);
    if(pathname==='/api/links'||pathname.startsWith('/api/links/')||pathname==='/api/channel-event')return channelRequest(req,env,ctx);
    if(pathname.startsWith('/api/creators/'))return creators(req,env);
    if(pathname==='/api/admin/creators')return creatorAdmin(req,env);
    if (req.method === 'POST' && (pathname === '/api/pp'||pathname === '/api/hubla')) {
      const response=await (pathname==='/api/pp'?hook(req,env):hubla(req,env));
      if(response.ok)ctx?.waitUntil(notifyCreatorSales(env).catch(e=>console.log('creator push failed',e.name)));
      return response;
    }
    if (req.method === 'GET' && pathname === '/api/mat') return matData(req, env);
    if (req.method === 'POST' && pathname === '/api/quiz-entry') return quizEntryRequest(req, env);
    if (req.method === 'GET' && pathname === '/api/admin/quiz-entry') {
      if (!(await adminOk(req,env))) return json({ok:false},401);
      return json(await quizEntryStats(env));
    }
    if (req.method === 'GET' && pathname === '/api/clone') return cloneHit(req, env);
    if (req.method === 'GET' && pathname === '/api/funnel-state') {
      const email = await sessionEmail(req, env);
      if (!email) return json({ ok: false }, 401);
      const { results } = await env.DB.prepare('SELECT product,plan,status,approved,updated FROM ent WHERE email=?').bind(email).all();
      const starts = await accessStarts(env, email);
      const { features } = entitlements(results, Date.now(), email, starts.start, starts.premiumStart);
      return json({ ok: true, features: features.filter(f => ['agenda','presets','animadas','personalizadas'].includes(f)) });
    }
    if (req.method === 'POST' && pathname === '/api/terms') return termsAccept(req, env);
    if (req.method === 'POST' && pathname === '/api/ab') return abHit(req, env);
    if (req.method === 'GET' && pathname === '/api/ab') return abStats(req, env);
    if (req.method === 'POST' && pathname === '/api/login') {
      // 30 logins/min per IP (wrangler.jsonc ratelimits): stops e-mail enumeration; Brazilian carrier NAT stays far below it
      if (env.RL_LOGIN && !(await env.RL_LOGIN.limit({ key: req.headers.get('cf-connecting-ip') || '?' })).success) return json({ ok: false, error: 'rate' }, 429);
      return login(req, env);
    }
    if (req.method === 'POST' && pathname === '/api/device') return deviceStatus(req, env);
    if (req.method === 'POST' && pathname === '/api/tools') return toolRequest(req, env, entitlements);
    if (req.method === 'POST' && pathname === '/api/feedback') return feedbackRequest(req, env, entitlements);
    if ((req.method === 'GET' || req.method === 'POST') && pathname === '/api/custom') return customRequest(req, env, entitlements);
    if (req.method === 'GET' && pathname === '/api/admin/custom') return customInbox(req, env);
    if (req.method === 'POST' && pathname === '/api/admin/custom/done') return customDone(req, env);
    if (req.method === 'POST' && pathname === '/api/custom/img') return customImage(req, env, entitlements, new URL(req.url));
    if (req.method === 'POST' && pathname === '/api/admin/custom/file') return customUpload(req, env, new URL(req.url));
    { const m = req.method === 'GET' && pathname.match(/^\/api\/custom\/file\/([a-zA-Z0-9-]+)\/(\d{1,3})\.webp$/); if (m) return customFile(req, env, ctx, m[1], m[2]); }
    if (req.method === 'GET' && pathname === '/api/admin/feedback') return feedbackInbox(req, env);
    if (req.method === 'POST' && pathname === '/api/admin/feedback/done') return feedbackDone(req, env);
    if ((req.method === 'GET' || req.method === 'POST') && pathname === '/api/feedback/notice') return feedbackNotice(req, env, entitlements);
    if (req.method === 'POST' && pathname === '/api/ref') return refInfo(req, env);
    if (req.method === 'POST' && pathname === '/api/gift') return giftHit(req, env);
    if (req.method === 'GET' && pathname === '/api/rank') return rankGet(req, env, cleanEmail(await sessionEmail(req, env)));
    if (req.method === 'POST' && pathname === '/api/rank/profile') return rankProfile(req, env, cleanEmail(await sessionEmail(req, env)));
    if (req.method === 'POST' && pathname === '/api/ev') return evHit(req, env);
    if (req.method === 'GET' && pathname === '/api/ev') return evStats(req, env);
    if (req.method === 'POST' && pathname === '/api/push') return pushSub(req, env);
    if (req.method === 'POST' && pathname === '/api/pushev') return pushEv(req, env);
    if (req.method === 'GET' && pathname === '/api/sold') return sold(env);
    if (req.method === 'GET' && pathname === '/api/top') {
      const r = json(await topCats(env));
      r.headers.set('cache-control', 'public, max-age=3600');
      return r;
    }
    if (req.method === 'GET' && pathname === '/api/topstk') {
      const row = await env.DB.prepare("SELECT v FROM admin_cfg WHERE k = 'topstk'").first().catch(() => null);
      const r = json(row ? JSON.parse(row.v) : await topStk(env));
      r.headers.set('cache-control', 'public, max-age=3600');
      return r;
    }
    if (req.method === 'GET' && pathname === '/api/push') return json(await takeNote(env, new URL(req.url).searchParams.get('ep')) || pushMsg());
    // manual "sync now" for ad spend (same job as the 10-min cron); errors are returned, never the token
    if (pathname === '/api/admin/push' && req.method === 'POST') { if (!(await adminOk(req, env))) return json({ ok: false }, 401); return adminPushSub(req, env); }
    if (pathname === '/api/admin/push-cfg') { if (!(await adminOk(req, env))) return json({ ok: false }, 401); return adminPushCfg(req, env); }
    if (pathname === '/api/admin/reports') { if (!(await adminOk(req, env))) return json({ ok: false }, 401); return adminReports(req, env); }
    if (req.method === 'GET' && pathname === '/api/admin/utmcamp') {
      // admin password, or a short-lived token created by hand in D1 (table ot) so a script can read it without the password
      const ot = req.headers.get('x-ot') || '';
      const okOt = ot.length >= 32 && await env.DB.prepare('SELECT 1 FROM ot WHERE token = ? AND exp > ?').bind(ot, Date.now()).first().catch(() => null);
      if (!okOt && !(await adminOk(req, env))) return json({ ok: false }, 401);
      return utmifyCampaigns(req, env);
    }
    if (pathname === '/api/admin/metasync' && req.method === 'POST') {
      if (!(await adminOk(req, env))) return json({ ok: false }, 401);
      const dbg = new URL(req.url).searchParams.has('debug') ? {} : null;
      try { const e2 = dbg ? { ...env, _debug: dbg } : env; return json({ ok: true, r: await metaSpend(e2), dbg }); } catch (e) { return json({ ok: false, error: String(e.message).replace(env.META_TOKEN || '#', '***').replace(env.UTMIFY_TOKEN || '#', '***'), dbg }); }
    }
    // read-only funnel per campaign/ad from Meta (link clicks, landing views, checkouts, purchases); token never returned
    if (pathname === '/api/admin/metains' && req.method === 'GET') {
      if (!(await adminOk(req, env))) return json({ ok: false }, 401);
      const q = new URL(req.url).searchParams, level = q.get('level') === 'ad' ? 'ad' : 'campaign', day = q.get('day') || brDay();
      const out = [];
      for (const id of String(env.META_ACCOUNTS || '').split(',').filter(Boolean)) {
        const u = `https://graph.facebook.com/v21.0/act_${id}/insights?level=${level}&fields=campaign_name,ad_name,spend,impressions,inline_link_clicks,actions&time_range=${encodeURIComponent(JSON.stringify({ since: day, until: day }))}&limit=200&access_token=${env.META_TOKEN}`;
        const r = await fetch(u).then(x => x.json());
        if (r.error) { out.push({ id, error: String(r.error.message).replace(env.META_TOKEN, '***') }); continue; }
        for (const x of r.data || []) {
          const act = Object.fromEntries((x.actions || []).map(a => [a.action_type, +a.value]));
          out.push({ c: x.campaign_name, ad: x.ad_name, spend: +x.spend, imp: +x.impressions, clicks: +(x.inline_link_clicks || 0),
            lpv: act.landing_page_view || 0, ic: act['offsite_conversion.fb_pixel_initiate_checkout'] || act.initiate_checkout || 0,
            buy: act['offsite_conversion.fb_pixel_purchase'] || act.purchase || 0 });
        }
      }
      return json({ ok: true, day, level, rows: out });
    }
    if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) return admin(req, env, evSummary, brDay());
    return json({ ok: false }, 404);
  },
  async scheduled(event, env, ctx) {
    if(event.cron==='* * * * *'){
      ctx.waitUntil(runCreatorPushDemo(env).catch(e=>console.log('creator demo failed',e.name)));
      ctx.waitUntil(notifyCreatorSales(env).then(r=>console.log('creator push',JSON.stringify(r))).catch(e=>console.log('creator push failed',e.name)));
      ctx.waitUntil(adminTick(env).then(r=>{if(!r.sales?.idle||!r.report?.idle)console.log('admin tick',JSON.stringify(r));}));
      return;
    }
    if (event.cron === '*/10 * * * *') {
      ctx.waitUntil(finalizeQuizEntry(env).catch(e=>console.log('quiz entry finalize failed', e.message)));
      ctx.waitUntil(recoverRun(env).then(r => console.log('recover', JSON.stringify(r))));
      if (new Date().getUTCMinutes() < 10) ctx.waitUntil(topStk(env).catch(e => console.log('topstk fail', e.message)));
      ctx.waitUntil(metaSpend(env).then(r => console.log('spend', JSON.stringify(r))).catch(e => console.log('spend fail', e.message)));
    }
    else ctx.waitUntil(pushAll(env).then(r => console.log('push', JSON.stringify(r))));
  },
};
