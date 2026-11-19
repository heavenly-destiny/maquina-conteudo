// CDN pass (owner 03/11, anti-cloning): /api/login hands the app a signed pass; the CDN workers (cdn/gate.js) only
// serve full-size stickers (/s/), materials (/mat/), bonus videos and PDFs when the URL carries a valid one.
// Format: base64url(email|flags).expiry(base36 ms).base64url(HMAC-SHA256(CDN_KEY, "email|flags.expiry")). Same code in cdn/gate.js.
// flags (08/11, Premium gate): '*' = may open every sticker (Premium); otherwise the gifted Premium slugs, comma separated.
const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const TTL = 864e5;   // 24 h; the app refreshes it on every login (app open, back to the tab)
export async function makePass(env, email, flags = '', now = Date.now()) {
  if (!env.CDN_KEY) return undefined;
  const key = await crypto.subtle.importKey('raw', enc.encode(env.CDN_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const exp = (now + TTL).toString(36);
  const id = email + '|' + flags;
  return `${b64u(enc.encode(id))}.${exp}.${b64u(await crypto.subtle.sign('HMAC', key, enc.encode(id + '.' + exp)))}`;
}
