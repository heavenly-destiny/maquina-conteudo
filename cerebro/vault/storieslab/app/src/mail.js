// Outgoing e-mail (owner 16/11: centralize on storieslab.app, Resend free tier caps at 100/day).
// First choice: Cloudflare Email Service (binding EMAIL, sender oi@storieslab.app).
// Fallback: Resend (secret RESEND_KEY, sender oi@storieslab.shop, already verified there), used when the binding is
// missing or Cloudflare refuses the message (new-account daily quota, unsupported header...), so a login code still goes out.
const REPLY = 'suportedigitalfig@gmail.com';

export const canMail = env => !!(env.EMAIL || env.RESEND_KEY);

export async function sendMail(env, { to, subject, html, text, headers }) {
  if (env.EMAIL) {
    try {
      await env.EMAIL.send({ to, from: { email: 'oi@storieslab.app', name: 'Stories Lab' }, replyTo: REPLY, subject, html, text, ...(headers ? { headers } : {}) });
      return 'cloudflare';
    } catch (e) {
      if (!env.RESEND_KEY) throw e;
      console.warn('cloudflare email failed, using resend', e.code, e.message);
    }
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: 'Bearer ' + env.RESEND_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'Stories Lab <oi@storieslab.shop>', to: [to], reply_to: REPLY, subject, html, text, ...(headers ? { headers } : {}) }),
  });
  if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return 'resend';
}
