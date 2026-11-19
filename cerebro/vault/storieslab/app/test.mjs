import assert from 'node:assert';
import { entitlements, parseHubla, evSummary, pushMsg, vapidJwt, hasAccess, noStickerLimit } from './src/worker.js';
const now = Date.parse('2026-11-01T00:00:00Z');
const r = (product, plan, status, approved = '2026-10-31T00:00:00Z') => ({ product, plan, status, approved });
let e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2)], now);
assert.deepEqual(e.features.sort(), ['basico', 'magneticos']); assert.ok(e.basicUntil);
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2, '2026-07-01T00:00:00Z')], now, '', '2026-07-02T00:00:00Z');   // 30 days from first entry
assert.deepEqual(e.features, []); assert.ok(e.basicUntil);            // expired basico
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2, '2026-07-01T00:00:00Z'), r('PPPBFLFI', 'PPLQQQT0O', 2)], now);
assert.deepEqual(e.features.sort(), ['animadas', 'basico', 'magneticos', 'premium']); assert.equal(e.basicUntil, null); // upgraded
e = entitlements([r('PPPBFLFI', 'PPLQQQT0N', 2), r('PPPBFLFO', '', 10)], now);
assert.deepEqual(e.features.sort(), ['agenda', 'animadas', 'basico', 'magneticos', 'premium', 'presets']);
e = entitlements([r('PPPBFLFI', 'PPLQQQT0N', 7), r('PPPBFLFM', '', 2)], now);
assert.deepEqual(e.features.sort(), ['magneticos', 'presets']);                              // refunded main
// Animadas is a Premium bonus only after an approved/complete entitlement, for both payment platforms.
for (const [product, plans] of [
  ['PPPBFLFI', ['PPLQQQT0N', 'PPLQQQT0O']],
  ['9t8GG43r9zIeZK1M7EUZ', ['ZGl5p5eUP5ZxlN4lGG3G', 'g7ehiv7FcvfCYKlC0Hbo']],
]) {
  for (const plan of plans) {
    for (const status of [2, 10]) {
      const premium = entitlements([r(product, plan, status)], now);
      assert.deepEqual(premium.features.sort(), ['animadas', 'basico', 'magneticos', 'premium']);
      assert.equal(premium.basicUntil, null);
    }
    for (const status of [1, 6, 7, 9]) {
      const revoked = entitlements([r(product, plan, status)], now);
      assert.deepEqual(revoked.features, []); assert.equal(hasAccess(revoked), false);
    }
  }
}
for (const [product, plan] of [['PPPBFLFI', 'PPLQQQT0M'], ['PPPBFLFI', 'PPLQQQTVN'], ['9t8GG43r9zIeZK1M7EUZ', 'ZjRp7qhKO17c5BwcqW2n']]) {
  const basic = entitlements([r(product, plan, 2)], now);
  assert.deepEqual(basic.features.sort(), ['basico', 'magneticos']); assert.ok(basic.basicUntil);
}
for (const status of [2, 10]) {
  const separatelyBought = entitlements([r('PPPBFLFN', '', status)], now);
  assert.deepEqual(separatelyBought.features.sort(), ['animadas', 'magneticos']);
  assert.equal(hasAccess(separatelyBought), true);
}
for (const status of [6, 7, 9]) {
  assert.deepEqual(entitlements([r('PPPBFLFN', '', status)], now).features, []);
  const refundedPremium = entitlements([r('PPPBFLFI', 'PPLQQQT0N', status), r('PPPBFLFN', '', 2)], now);
  assert.deepEqual(refundedPremium.features.sort(), ['animadas', 'magneticos']); // independent purchase survives
  const refundedSeparate = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2), r('PPPBFLFN', '', status)], now);
  assert.deepEqual(refundedSeparate.features.sort(), ['basico', 'magneticos']);
}
console.log('Premium Animadas bonus ok');
// unlimited stickers (R$5,90 plan of the Magnéticos product): feature only, never app access on its own
e = entitlements([r('PPPBFLFL', 'PPLQQQTVG', 2)], now);
assert.deepEqual(e.features, ['figurinhas']); assert.equal(hasAccess(e), false);
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2), r('PPPBFLFL', 'PPLQQQTVG', 2)], now);
assert.deepEqual(e.features.sort(), ['basico', 'figurinhas', 'magneticos']); assert.equal(hasAccess(e), true);
e = entitlements([r('PPPBFLFL', 'PPLQQQT0U', 2)], now);                 // the normal Magnéticos plan is not unlimited stickers
assert.deepEqual(e.features, ['magneticos']);
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2)], now, 'influencer@gmail.com');
assert.ok(e.features.includes('figurinhas')); assert.ok(!noStickerLimit('x@storieslab.test')); assert.ok(!noStickerLimit('ana@gmail.com'));
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2)], now, 'ana@gmail.com');
assert.deepEqual(e.features.sort(), ['basico', 'magneticos']);
// lifetime bump (R$9,90): Básico bought 100 days ago stays on; approved lifetime alone also grants access
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2, '2026-07-01T00:00:00Z'), r('PPPBFLFL', 'PPLQQQU3K', 2, '2026-07-01T00:00:00Z')], now);
assert.deepEqual(e.features.sort(), ['basico', 'magneticos', 'vitalicio']); assert.equal(e.basicUntil, null); assert.equal(hasAccess(e), true);
e = entitlements([r('PPPBFLFL', 'PPLQQQU3K', 2)], now);
assert.equal(hasAccess(e), true); assert.equal(e.basicUntil, null);
e = entitlements([r('PPPBFLFI', 'PPLQQQT0M', 2, '2026-07-01T00:00:00Z'), r('PPPBFLFL', 'PPLQQQU3K', 7)], now, '', '2026-07-02T00:00:00Z');
assert.deepEqual(e.features, []);                                       // refunded bump: expired again
console.log('fig ok');
// Approved lifetime grants Basic access; Personalizadas alone remains separate.
for (const [product, feature] of [['4OwRAxrZJT8jofvrAEVb', 'vitalicio'], ['Gznly9a4BInhGiVFg3pG', 'personalizadas']]) {
  for (const offer of ['normal', 'downsell']) {
    const parsed = parseHubla({ type: 'invoice.payment_succeeded', event: {
      user: { email: 'hubla-extra@example.com' }, products: [{ id: product, offers: [{ id: offer }] }],
    } });
    assert.equal(parsed.scanned, false);
    assert.deepEqual(parsed.rows, [{ product, plan: '' }]);
    assert.deepEqual(entitlements([r(product, '', 2)], now).features.sort(), feature === 'vitalicio' ? ['basico', 'magneticos', 'vitalicio'] : [feature]);
    assert.equal(hasAccess(entitlements([r(product, '', 2)], now)), feature === 'vitalicio');
  }
  for (const status of [6, 7, 9]) assert.deepEqual(entitlements([r(product, '', status)], now).features, []);
}
{
  const expired = r('9t8GG43r9zIeZK1M7EUZ', 'ZjRp7qhKO17c5BwcqW2n', 2, '2026-07-01T00:00:00Z');
  const lifetime = entitlements([expired, r('4OwRAxrZJT8jofvrAEVb', '', 2)], now, '', '2026-07-02T00:00:00Z');
  assert.equal(lifetime.basicUntil, null);
  assert.deepEqual(lifetime.features.sort(), ['basico', 'magneticos', 'vitalicio']);
  assert.deepEqual(entitlements([expired, r('4OwRAxrZJT8jofvrAEVb', '', 7)], now, '', '2026-07-02T00:00:00Z').features, []);
}
console.log('Hubla standalone extras delivery ok');
// New Premium offer is limited; legacy offers keep their already-granted access.
{
  const premium = r('9t8GG43r9zIeZK1M7EUZ', 'QMj5JhJdg9dEnbG262ZQ', 2, '2026-07-01T00:00:00Z');
  const first = entitlements([premium], now, '', '2026-07-02T00:00:00Z');
  assert.ok(first.features.includes('premium')); assert.equal(first.premiumStartNow, true);
  assert.equal(first.basicUntil, '2027-11-01T00:00:00.000Z'); // no Premium login yet; old Basic start does not start it
  const expired = entitlements([premium], Date.parse('2027-07-03T00:00:00Z'), '', null, '2026-07-02T00:00:00Z');
  assert.deepEqual(expired.features, []); assert.equal(hasAccess(expired), false);
  const active = entitlements([premium], Date.parse('2026-07-15T00:00:00Z'), '', null, '2026-07-02T00:00:00Z');
  assert.deepEqual(active.features.sort(), ['animadas', 'basico', 'magneticos', 'premium']);
  assert.equal(active.basicUntil, '2027-07-02T00:00:00.000Z');
  const lifetime = entitlements([premium, r('4OwRAxrZJT8jofvrAEVb', '', 2)], now, '', null, '2026-07-02T00:00:00Z');
  assert.deepEqual(lifetime.features.sort(), ['animadas', 'basico', 'magneticos', 'premium', 'vitalicio']);
  assert.equal(lifetime.basicUntil, null);
  assert.deepEqual(entitlements([premium, r('4OwRAxrZJT8jofvrAEVb', '', 7)], Date.parse('2027-07-03T00:00:00Z'), '', null, '2026-07-02T00:00:00Z').features, []);
  const legacy = entitlements([r('9t8GG43r9zIeZK1M7EUZ', 'ZGl5p5eUP5ZxlN4lGG3G', 2, '2026-07-01T00:00:00Z')], now);
  assert.equal(legacy.basicUntil, null); assert.ok(legacy.features.includes('premium'));
}
console.log('Hubla new Premium 365 days + lifetime + legacy access ok');
{
  const offer='sXAlfbopdB6LNsF9u5AS';
  const parsed=parseHubla({type:'invoice.payment_succeeded',event:{user:{email:'special@example.com'},products:[{id:'9t8GG43r9zIeZK1M7EUZ',offers:[{id:offer}]}]}});
  assert.equal(parsed.rows[0].plan,offer);
  const limited=entitlements([r('9t8GG43r9zIeZK1M7EUZ',offer,2,'2026-07-01T00:00:00Z')],Date.parse('2027-07-03T00:00:00Z'),'',null,'2026-07-02T00:00:00Z');
  assert.equal(hasAccess(limited),false);
}
// Hubla
e = entitlements([r('9t8GG43r9zIeZK1M7EUZ', 'ZjRp7qhKO17c5BwcqW2n', 2)], now);
assert.deepEqual(e.features.sort(), ['basico', 'magneticos']); assert.ok(e.basicUntil);
e = entitlements([r('9t8GG43r9zIeZK1M7EUZ', 'g7ehiv7FcvfCYKlC0Hbo', 2), r('KPGJDigaQ5RaQhNUnB10', '', 2)], now);
assert.deepEqual(e.features.sort(), ['agenda', 'animadas', 'basico', 'magneticos', 'premium', 'presets']);
let h = parseHubla({ type: 'invoice.payment_succeeded', event: { user: { email: ' Ana@X.com ' },
  products: [{ id: '9t8GG43r9zIeZK1M7EUZ', offers: [{ id: 'ZGl5p5eUP5ZxlN4lGG3G' }] }, { id: 'SKJYloVEWsWNATDm70a4', offers: [{ id: 'x' }] }] } });
assert.equal(h.email, 'ana@x.com'); assert.equal(h.scanned, false);
assert.deepEqual(h.rows, [{ product: '9t8GG43r9zIeZK1M7EUZ', plan: 'ZGl5p5eUP5ZxlN4lGG3G' }, { product: 'SKJYloVEWsWNATDm70a4', plan: '' }]);
h = parseHubla({ type: 'NewSale', event: { userEmail: 'b@y.com', groupId: 'AnpKR4QxPycPeJgUPcVv' } }); // unknown shape -> scan
assert.equal(h.scanned, true); assert.deepEqual(h.rows, [{ product: 'AnpKR4QxPycPeJgUPcVv', plan: '' }]);
console.log('ok');

// usage summary: retention and per-category counts
const ev = (day, email, e, k = '', n = 1) => ({ day, email, e, k, n });
let sm = evSummary([ev('2026-11-01', 'a', 'open'), ev('2026-11-01', 'a', 'copy', 'cafe', 3), ev('2026-11-02', 'a', 'copy', 'cafe'),
  ev('2026-11-01', 'b', 'open'), ev('2026-11-08', 'b', 'open'), ev('2026-11-05', 'c', 'offer_click', 'presets')], '2026-11-08');
assert.equal(sm.users, 3);
assert.deepEqual(sm.retention.d1, { users: 3, back: 1, pct: 33.3 });      // only a came back next day
assert.deepEqual(sm.retention.d7, { users: 2, back: 1, pct: 50 });        // c (first 11-05) not old enough yet; b came back on day 7
assert.deepEqual(sm.topCopied, [['cafe', 4]]);
assert.equal(sm.offerClicks.presets, 1);
console.log('evSummary ok');

// push text by weekday (times are 12:00 UTC = 9h BRT)
assert.match(pushMsg(Date.parse('2026-11-02T12:00:00Z')).title, /^Bom dia/);           // Monday
assert.equal(pushMsg(Date.parse('2026-11-04T12:00:00Z')).title, 'Faltam 23 dias pro Black Friday'); // Wednesday, BF 27/11
assert.equal(pushMsg(Date.parse('2026-11-06T12:00:00Z')).title, 'Sextou!');
// VAPID JWT verifies with the public key
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwt = await vapidJwt(await crypto.subtle.exportKey('jwk', kp.privateKey), 'https://fcm.googleapis.com');
const [jh, pl, sg] = jwt.split('.');
const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, kp.publicKey, Buffer.from(sg, 'base64url'), new TextEncoder().encode(jh + '.' + pl));
assert.ok(ok); assert.equal(JSON.parse(Buffer.from(pl, 'base64url')).aud, 'https://fcm.googleapis.com');
console.log('push ok');

// admin: sales rebuilt from raw webhooks
import { parseSales } from './src/admin.js';
{
  const pp = (code, plan, st, prod = 'PPPBFLFI', extra = {}) => ({ at: '2026-11-01T12:00:00Z', body: JSON.stringify({ code, sale_amount: 14.99, sale_status_enum: st,
    payment_type_enum_key: 'pix', date_created: '2026-11-01 08:00:00', product: { code: prod }, plan: { code: plan }, customer: { email: 'a@b.com' },
    metadata: { utm_campaign: 'CBO LOW 2|123', utm_content: 'ad1|9::xx', utm_term: 'Instagram_Feed' }, ...extra }) });
  const hb = (id, offers, type = 'invoice.payment_succeeded') => ({ at: '2026-11-01T15:00:00Z', body: 'hubla ' + JSON.stringify({ type, event: {
    products: offers.map(([pid, oid, c, bump]) => ({ id: pid, offers: [{ id: oid, amountCents: c, isOrderBump: bump }] })),
    invoice: { id, paymentMethod: 'credit_card', payer: { email: 'c@d.com' }, statusAt: [{ when: '2026-11-01T14:00:00Z' }],
      paymentSession: { url: 'https://pay.hub.la/x?src=t1-b', utm: { campaign: 'C1|1', content: 'ad2|2' } } } } }) });
  const s = await parseSales([
    pp('X1', 'PPLQQQT0N', 1), pp('X1', 'PPLQQQT0N', 2), pp('X1', 'PPLQQQT0N', 1),   // late pending must not undo paid
    pp('X2', '', 2, 'PPPBFLFK'), pp('X3', 'PPLQQQT0O', 7),
    pp('X4', 'PPLQQQT0M', 2, 'PPPBFLFI', { customer: { email: 'basico@storieslab.test' } }),   // test buyer ignored
    { at: '2026-11-01T12:00:00Z', body: 'code=X5&sale_amount=5.99&sale_status_enum=2&product[code]=PPPBFLFI&plan[code]=PPLQQQT0M&customer[email]=z@z.com&date_created=2026-11-01 23:30:00' },
    hb('I1', [['9t8GG43r9zIeZK1M7EUZ', 'ZGl5p5eUP5ZxlN4lGG3G', 1499, false], ['pTg6Xx75MoOzoXNiNVPo', 'AkhU0WtAD1m4BvoIY55i', 990, true]]),
    hb('I2', [['9t8GG43r9zIeZK1M7EUZ', 'ZGl5p5eUP5ZxlN4lGG3G', 1499, false]], 'customer.member_added'),
  ]);
  const by = Object.fromEntries(s.map(l => [l.id, l]));
  assert.equal(by['X1:premium'].status, 'paid'); assert.equal(by['X1:premium'].campaign, 'CBO LOW 2'); assert.equal(by['X1:premium'].ad, 'ad1');
  assert.equal(by['X2:agenda'].kind, 'bump'); assert.equal(by['X3:downsell'].status, 'refunded');
  assert.ok(!s.some(l => l.id.startsWith('X4')));
  assert.equal(by['X5:basico'].day, '2026-11-01'); assert.equal(by['X5:basico'].campaign, '(sem utm)');   // form-encoded postback, BRT date kept
  assert.equal(by['I1:premium'].price, 14.99); assert.equal(by['I1:agenda'].kind, 'bump'); assert.equal(by['I1:agenda'].tag, 't1-b');
  assert.equal(by['I1:premium'].pay, 'card'); assert.equal(by['I1:premium'].buyer, by['I1:agenda'].buyer);
  assert.ok(!by['I2:premium']);   // member_added is not a sale
  console.log('admin parseSales ok');
}

// recovery: reminder timing and copy
import { due, message } from './src/recover.js';
{
  const t0 = Date.parse('2026-11-01T12:00:00Z'), r = { kind: 'pix', created: '2026-11-01T12:00:00Z', step: 0, price: 14.99, name: 'Ana', link: 'https://checkout.perfectpay.com.br/pix/X', expires: '2026-11-04T03:00:00Z' };
  assert.equal(due(r, t0 + 10 * 60e3), 0);
  assert.equal(due(r, t0 + 21 * 60e3), 1);
  assert.equal(due({ ...r, step: 1 }, t0 + 2 * 3600e3), 0);
  assert.equal(due({ ...r, step: 1 }, t0 + 21 * 3600e3), 2);
  assert.equal(due({ ...r, step: 2 }, t0 + 30 * 3600e3), 0);
  assert.equal(due(r, Date.parse('2026-11-04T04:00:00Z')), -1);         // Pix expired
  assert.equal(due({ ...r, done: 'x' }, t0 + 21 * 60e3), 0);
  const m = message(r, 1);
  assert.ok(m.subject && m.text.includes('R$ 14,99') && m.text.includes(r.link) && m.html.includes('Oi, Ana!'));
  assert.ok(message({ ...r, kind: 'abandon', name: '<b>' }, 2).html.includes('&lt;b&gt;'));   // name escaped
  console.log('recover ok');
}

// net of platform fees: PerfectPay producer commission (JSON and form-encoded), Hubla seller share split by item price
import { parseSales as ps2 } from './src/admin.js';
{
  const pp = { code: 'PPCPNET1', sale_status_enum: 2, sale_amount: 14.99, date_created: '2026-11-01 10:00:00', product: { code: 'PPPBFLFI' }, plan: { code: 'PPLQQQT0N' }, customer: { email: 'a@b.com' },
    commission: [{ affiliation_type_enum_key: 'producer', affiliation_type_enum: 1, commission_amount: 11.47 }, { name: 'PerfectPay', commission_amount: 3.52, affiliation_type_enum: 0 }] };
  const form = 'code=PPCPNET2&sale_status_enum=2&sale_amount=9.9&date_created=2026-11-01+10:00:00&product[code]=PPPBFLFK&plan[code]=PPLQQQT0T&customer[email]=a@b.com&commission[0][affiliation_type_enum]=1&commission[0][commission_amount]=7.10';
  const pend = { ...pp, sale_status_enum: 1, commission: undefined };
  const hub = 'hubla ' + JSON.stringify({ type: 'invoice.payment_succeeded', event: { products: [{ id: 'p', offers: [{ id: 'ZGl5p5eUP5ZxlN4lGG3G', amountCents: 1499 }, { id: 'pTg6Xx75MoOzoXNiNVPo', amountCents: 990 }] }],
    invoice: { id: 'inv1', payer: { email: 'c@d.com' }, paymentMethod: 'pix', amount: { totalCents: 2489 }, receivers: [{ role: 'platform', totalCents: 489 }, { role: 'seller', totalCents: 2000 }] } } });
  const s = await ps2([{ at: '2026-11-01T13:00:00Z', body: JSON.stringify(pp) }, { at: '2026-11-01T13:00:00Z', body: JSON.stringify(pend) }, { at: '2026-11-01T13:00:00Z', body: form }, { at: '2026-11-01T13:00:00Z', body: hub }]);
  const by = id => s.find(x => x.id === id);
  assert.equal(by('PPCPNET1:premium').net, 11.47);           // late pending without commission keeps the paid net
  assert.equal(by('PPCPNET2:agenda').net, 7.1);
  assert.equal(by('inv1:premium').net, 12.04); assert.equal(by('inv1:agenda').net, 7.96);
  console.log('net ok');
}

// referral: code parsed from PerfectPay metadata / Hubla URL, never from look-alike words
import { refCodeIn } from './src/worker.js';
assert.equal(refCodeIn('{"metadata":{"src":"ind-ab23cd"}}'), 'AB23CD');
assert.equal(refCodeIn('https://pay.hub.la/x?utm_source=FB&src=ind-QW8ERT&fbclid=1'), 'QW8ERT');
assert.equal(refCodeIn('{"x":"kind-AB23CD"}'), '');
assert.equal(refCodeIn('src=ind-AB23CDE'), '');
assert.equal(refCodeIn('{"src":null}'), '');
assert.deepEqual(entitlements([r('REFKIT', 'amiga@x.com', 2)], now).features.sort(), ['agenda', 'animadas', 'magneticos', 'presets']);
assert.deepEqual(entitlements([r('REFKIT', 'amiga@x.com', 7)], now).features, []);
console.log('ref ok');
{ // funnel 02/11: animadas/presets become upsells after the cutoff, agenda stays bump
  const { kindOf } = await import('./src/admin.js');
  const a = (x, y) => { if (x !== y) throw new Error(`kindOf: ${x} != ${y}`); };
  a(kindOf('animadas', '2026-11-01T12:00:00-03:00'), 'bump'); a(kindOf('animadas', '2026-11-02T20:00:00-03:00'), 'upsell');
  a(kindOf('presets', '2026-11-03T10:00:00-03:00'), 'upsell'); a(kindOf('agenda', '2026-11-03T10:00:00-03:00'), 'bump');
  a(kindOf('magneticos', '2026-11-05T10:00:00-03:00'), 'upsell'); a(kindOf('magneticos', '2026-11-14T10:00:00-03:00'), 'upsell'); a(kindOf('presets', '2026-11-14T10:00:00-03:00'), 'bump');
  a(kindOf('kit'), 'upsell'); a(kindOf('premium'), 'main'); console.log('kind ok');
}

// /api/top (public "Mais usados") and /api/ref (her own friends count) against a tiny fake D1
{
  const { default: app } = await import('./src/worker.js');
  const calls = [];
  const db = rows => ({ prepare: sql => ({ bind: (...a) => { calls.push([sql, a]); return {
    all: async () => ({ results: rows(sql, a) }), first: async () => rows(sql, a)[0] || null, run: async () => ({ meta: { changes: 1 } }) }; } }) });
  const env = { DB: db(sql => /FROM ev/.test(sql) ? [{ slug: 'bom-dia', n: 40 }, { slug: 'frases', n: '12' }] : []) };
  let res = await app.fetch(new Request('https://x/api/top'), env);
  assert.equal(res.headers.get('cache-control'), 'public, max-age=3600');
  const top = await res.json();
  assert.deepEqual(top, [{ slug: 'bom-dia', n: 40 }, { slug: 'frases', n: 12 }]);
  assert.ok(!JSON.stringify(top).includes('@'));
  const [sql, args] = calls.find(c => /FROM ev/.test(c[0]));
  assert.match(sql, /GROUP BY k/); assert.match(sql, /LIMIT 12/); assert.ok(!/SELECT[^F]*email/.test(sql));
  assert.match(args[0], /^\d{4}-\d{2}-\d{2}$/);
  // ref: customer gets her code and how many friends bought with it; non-customer gets nothing
  const refEnv = cust => ({ HOOK_KEY: 'test-hook-key', DB: db((sql, a) => /FROM ent/.test(sql) ? (cust ? [{ 1: 1 }] : []) : /FROM ref WHERE email/.test(sql) ? [{ code: 'ABC234' }]
    : /COUNT\(\*\) n FROM refuse/.test(sql) ? (a[0] === 'ABC234' ? [{ n: 2 }] : [{ n: 0 }]) : []) });
  // 08/11: the e-mail comes from the signed sl_session cookie; the body is ignored
  const { sessionCookie } = await import('./src/experience.js');
  const cookie = async e => (await sessionCookie({ HOOK_KEY: 'test-hook-key' }, e)).split(';')[0];
  const post = (body, c) => new Request('https://x/api/ref', { method: 'POST', headers: { 'content-type': 'application/json', ...(c ? { cookie: c } : {}) }, body: JSON.stringify(body) });
  assert.deepEqual(await (await app.fetch(post({}, await cookie('ana@x.com')), refEnv(true))).json(), { ok: true, code: 'ABC234', friends: 2 });
  assert.deepEqual(await (await app.fetch(post({ email: 'ana@x.com' }), refEnv(true))).json(), { ok: false }, 'body e-mail without cookie gets nothing');
  assert.deepEqual(await (await app.fetch(post({}, await cookie('nope@x.com')), refEnv(false))).json(), { ok: false });
  console.log('top + ref ok');
}
{ // magneticos free with access, not for expired
  const now = Date.parse('2026-11-01T00:00:00Z'), r = (plan, approved = '2026-10-31T00:00:00Z') => ({ product: 'PPPBFLFI', plan, status: 2, approved });
  assert.ok(entitlements([r('PPLQQQT0M')], now).features.includes('magneticos'));
  assert.ok(entitlements([r('PPLQQQT0O')], now).features.includes('magneticos'));
  const x = entitlements([r('PPLQQQT0M', '2026-07-01T00:00:00Z')], now, '', '2026-07-02T00:00:00Z');
  assert.deepEqual(x.features, []); assert.equal(hasAccess(x), false);
  console.log('magneticos free ok');
}
// custom sticker pack (plan of the Magnéticos product): grants only 'personalizadas', never app access or magneticos
e = entitlements([r('PPPBFLFL', 'PPLQQQVCE', 2)], now);
assert.deepEqual(e.features, ['personalizadas']); assert.equal(hasAccess(e), false);
console.log('personalizadas ok');

// per-category sticker ranking (/api/topstk): keeps SQL order, caps per category, drops bad ids
{
  const { topStkMap } = await import('./src/worker.js');
  const m = topStkMap([{ id: 'bom-dia/7' }, { id: 'frases/2' }, { id: 'bom-dia/3' }, { id: 'bom-dia/x' }, { id: 'bom-dia/9' }], 2);
  assert.deepStrictEqual(m, { 'bom-dia': [7, 3], frases: [2] });
  console.log('ok topStkMap');
}
{ // mail.js: Cloudflare first, Resend when Cloudflare refuses
  const { sendMail, canMail } = await import('./src/mail.js');
  const msg = { to: 'a@b.com', subject: 's', html: '<p>h</p>', text: 't' };
  const sent = [];
  assert.equal(await sendMail({ EMAIL: { send: async m => { sent.push(m); } } }, msg), 'cloudflare');
  assert.equal(sent[0].from.email, 'oi@storieslab.app');
  const realFetch = globalThis.fetch; let resendBody;
  globalThis.fetch = async (_u, o) => { resendBody = JSON.parse(o.body); return { ok: true }; };
  const quota = Object.assign(new Error('quota'), { code: 'E_RATE_LIMIT_EXCEEDED' });
  assert.equal(await sendMail({ EMAIL: { send: async () => { throw quota; } }, RESEND_KEY: 'k' }, msg), 'resend');
  assert.equal(resendBody.from, 'Stories Lab <oi@storieslab.shop>');
  await assert.rejects(sendMail({ EMAIL: { send: async () => { throw quota; } } }, msg));
  globalThis.fetch = realFetch;
  assert.ok(!canMail({})); assert.ok(canMail({ EMAIL: {} }));
  console.log('ok mail fallback');
}

// /api/ab accepts every beacon kind the pages send (16/11: a misplaced comment dropped 'page' and threw on obrigado/upsell)
{
  const { default: app } = await import('./src/worker.js');
  const env = { DB: { prepare: () => ({ bind: () => ({ run: async () => ({}) }) }) } };
  for (const [e, plan] of [['page', 'obrigado'], ['page', 'upsell_marca'], ['page', 'volta'], ['try', 'add'], ['reach', 'hero'], ['view', 'ads'], ['click', 'premium']]) {
    const res = await app.fetch(new Request('https://x/api/ab', { method: 'POST', body: JSON.stringify({ v: 'a', e, plan }) }), env);
    assert.equal(res.status, 200, `${e}/${plan} -> ${res.status}`);
  }
  let wrote = 0; const env2 = { DB: { prepare: () => ({ bind: () => ({ run: async () => { wrote++; return {}; } }) }) } };
  for (const o of ['http://localhost:8788', 'https://preview-speed.storieslab.pages.dev']) await app.fetch(new Request('https://x/api/ab', { method: 'POST', headers: { origin: o }, body: JSON.stringify({ v: 'a', e: 'view' }) }), env2);
  assert.equal(wrote, 0, 'test origins must not count');
  await app.fetch(new Request('https://x/api/ab', { method: 'POST', headers: { origin: 'https://storieslab.app' }, body: JSON.stringify({ v: 'a', e: 'view' }) }), env2);
  assert.equal(wrote, 1, 'the real site counts');
  console.log('ab beacons ok');
}
