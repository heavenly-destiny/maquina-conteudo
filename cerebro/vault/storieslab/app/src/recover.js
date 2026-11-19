// PerfectPay sale recovery by e-mail (Hubla recovers its own carts with Hubla Agents on WhatsApp).
// The PerfectPay postback already brings both cases, with a link that reopens the order:
//   status 12 = checkout abandoned after the e-mail was typed (billet_url = prefilled checkout)
//   status 1  = Pix generated, not paid yet (billet_url = the Pix QR page)
// track() stores them in `rec`; the */10 cron calls run(), which sends step 1 after 20 min and step 2 after 20 h,
// and stops as soon as the person buys. Sending goes through mail.js (Cloudflare Email, Resend fallback); with neither configured nothing is sent.

import { trackedUrl } from './channel-links.js';
import { sendMail, canMail } from './mail.js';
const MAIN = 'PPPBFLFI';
const STEP_AT = [20 * 60e3, 20 * 3600e3]; // after creation
const GIVE_UP = 3 * 864e5;                 // PerfectPay Pix expires in 3 days
const REPLY = 'suportedigitalfig@gmail.com';
const SCHEMA = `CREATE TABLE IF NOT EXISTS rec (code TEXT PRIMARY KEY, kind TEXT NOT NULL, email TEXT NOT NULL, name TEXT, link TEXT NOT NULL,
  price REAL, expires TEXT, created TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0, sent1 TEXT, sent2 TEXT, done TEXT, why TEXT)`;
const ppTime = s => (s ? Date.parse(s.replace(' ', 'T') + '-03:00') : NaN);

export async function track(env, b) {
  const email = String(b.customer?.email || '').trim().toLowerCase(), st = Number(b.sale_status_enum), now = new Date().toISOString();
  if (!email || String(b.product?.code) !== MAIN || /storieslab\.test$|@example\.com$/.test(email)) return;
  await env.DB.prepare(SCHEMA).run();
  if (st === 2 || st === 10) {   // bought: stop everything for this person
    await env.DB.prepare(`UPDATE rec SET done = ?1, why = 'comprou' WHERE email = ?2 AND done IS NULL`).bind(now, email).run();
    return;
  }
  const kind = st === 12 ? 'abandon' : st === 1 && b.payment_type_enum_key === 'pix' ? 'pix' : null;
  if (!kind || !/^https:\/\/checkout\.perfectpay\.com\.br\//.test(b.billet_url || '')) return;
  // a Pix generated after an abandoned checkout replaces the abandon reminder
  if (kind === 'pix') await env.DB.prepare(`UPDATE rec SET done = ?1, why = 'gerou pix' WHERE email = ?2 AND kind = 'abandon' AND done IS NULL`).bind(now, email).run();
  const created = ppTime(b.date_created);
  await env.DB.prepare(`INSERT OR IGNORE INTO rec (code, kind, email, name, link, price, expires, created) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`)
    .bind(String(b.code), kind, email, String(b.customer?.full_name || '').split(' ')[0].slice(0, 40), b.billet_url, Number(b.sale_amount) || null,
      b.billet_expiration ? new Date(ppTime(b.billet_expiration)).toISOString() : null, new Date(isNaN(created) ? Date.now() : created).toISOString()).run();
}

// which reminder (1 or 2) is due now, 0 = none, -1 = give up
export function due(r, now) {
  const age = now - Date.parse(r.created);
  if (r.done) return 0;
  if (age > GIVE_UP || (r.expires && now > Date.parse(r.expires))) return -1;
  if (r.step === 0 && age >= STEP_AT[0]) return 1;
  if (r.step === 1 && age >= STEP_AT[1]) return 2;
  return 0;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const brl = n => (n ? 'R$ ' + n.toFixed(2).replace('.', ',') : '');
export function message(r, step) {
  r={...r,link:trackedUrl(r.link,'email-recuperacao',r.kind+'-'+step,'checkout')};
  const oi = r.name ? `Oi, ${r.name}!` : 'Oi!';
  const M = {
    abandon: [
      ['Seu pack de figurinhas ficou esperando', `${oi} Você começou a garantir o Pack +24.000 Figurinhas para Stories e não chegou a finalizar. Seu pedido continua salvo, é só continuar de onde parou.`, 'Finalizar minha compra'],
      ['Ainda dá tempo de garantir suas figurinhas', `${oi} Passando só pra lembrar: suas figurinhas para Stories continuam reservadas. São mais de 24.000 figurinhas num app, prontas pra copiar e colar no Story, com 7 dias de garantia.`, 'Quero minhas figurinhas'],
    ],
    pix: [
      ['Seu Pix está pronto, falta só pagar', `${oi} Seu Pix ${brl(r.price)} do Pack +24.000 Figurinhas foi gerado. Assim que o pagamento cair, o acesso chega no seu e-mail na hora.`, 'Abrir meu Pix'],
      ['Seu Pix das figurinhas ainda está em aberto', `${oi} O Pix ${brl(r.price)} do seu Pack de Figurinhas ainda não foi pago. Ele continua valendo${r.expires ? ' até ' + new Date(Date.parse(r.expires) - 3 * 3600e3).toISOString().slice(0, 10).split('-').reverse().join('/') : ''}; é só abrir e pagar.`, 'Pagar meu Pix'],
    ],
  };
  const [subject, body, cta] = M[r.kind][step - 1];
  const foot = 'Dúvidas? É só responder este e-mail. Não quer mais receber lembretes desta compra? Responda com "sair".';
  const html = `<!doctype html><html><body style="margin:0;background:#FFF7F5;font-family:Arial,Helvetica,sans-serif;color:#2A1630">
<div style="max-width:520px;margin:0 auto;padding:28px 20px"><p style="font-size:22px;font-weight:800;margin:0 0 18px">stories<span style="color:#FF2E74;font-style:italic;font-weight:400">lab</span></p>
<div style="background:#fff;border:1px solid #F3DEE2;border-radius:18px;padding:22px"><p style="font-size:16px;line-height:1.55;margin:0 0 20px">${esc(body)}</p>
<a href="${esc(r.link)}" style="display:block;text-align:center;background:#FF2E74;color:#fff;text-decoration:none;font-weight:700;font-size:17px;padding:15px;border-radius:14px">${esc(cta)}</a></div>
<p style="font-size:13px;color:#7A6578;line-height:1.5;margin-top:18px">${esc(foot)}</p></div></body></html>`;
  return { subject, html, text: `${body}\n\n${cta}: ${r.link}\n\n${foot}` };
}

async function send(env, r, step) {
  const m = message(r, step);
  await sendMail(env, { to: r.email, subject: m.subject, html: m.html, text: m.text,
    headers: { 'List-Unsubscribe': `<mailto:${REPLY}?subject=sair>` } });
}

export async function run(env, now = Date.now()) {
  if (!canMail(env)) return { skipped: 'no mail binding or RESEND_KEY' };
  await env.DB.prepare(SCHEMA).run();
  const { results } = await env.DB.prepare('SELECT * FROM rec WHERE done IS NULL ORDER BY created LIMIT 200').all();
  const out = { sent: 0, gaveUp: 0, errors: 0 };
  for (const r of results) {
    // bought on another code (e.g. paid a new Pix): ent already has the approved main product
    const paid = await env.DB.prepare(`SELECT 1 FROM ent WHERE email = ?1 AND product = ?2 AND status IN (2, 10) AND REPLACE(approved, ' ', 'T') >= ?3`).bind(r.email, MAIN, r.created.slice(0, 19)).first();
    if (paid) { await env.DB.prepare(`UPDATE rec SET done = ?1, why = 'comprou' WHERE code = ?2`).bind(new Date(now).toISOString(), r.code).run(); continue; }
    const step = due(r, now);
    if (step === -1) { await env.DB.prepare(`UPDATE rec SET done = ?1, why = 'expirou' WHERE code = ?2`).bind(new Date(now).toISOString(), r.code).run(); out.gaveUp++; continue; }
    if (!step) continue;
    try {
      await send(env, r, step);
      await env.DB.prepare(`UPDATE rec SET step = ?1, sent${step} = ?2 WHERE code = ?3`).bind(step, new Date(now).toISOString(), r.code).run();
      out.sent++;
    } catch (e) { console.log('recover', r.code, String(e)); out.errors++; }
  }
  return out;
}

// admin test: the 4 reminders, with fake data, to the support inbox
export async function recTest(env) {
  const base = { name: 'Teste', price: 14.99, expires: new Date(Date.now() + 2 * 864e5).toISOString(), email: REPLY };
  const out = [];
  for (const kind of ['abandon', 'pix']) for (const step of [1, 2]) {
    const r = { ...base, kind, link: kind === 'pix' ? 'https://storieslab.app/' : 'https://storieslab.app/#planos' };
    try { await send(env, r, step); out.push(kind + step + ' ok'); } catch (e) { out.push(kind + step + ' ' + String(e)); }
  }
  return out;
}

// for the admin page: per kind, how many entered, got reminders and bought afterwards
export async function recStats(env) {
  await env.DB.prepare(SCHEMA).run();
  const { results } = await env.DB.prepare(`SELECT kind, COUNT(*) n, SUM(sent1 IS NOT NULL) sent, SUM(why = 'comprou' AND sent1 IS NOT NULL) won,
    SUM(why = 'comprou' AND sent1 IS NULL) selfwon FROM rec GROUP BY kind`).all();
  return results;
}
