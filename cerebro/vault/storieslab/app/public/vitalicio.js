// Vitalício offer inside the app (owner 09/11). Shown after she copies or downloads a sticker, at most once per access
// (app opened, or back after 5+ min away) and at most twice a day, until she owns 'vitalicio'. Owner 09/11: everyone sees it
// except buyers of the vitalício bump (Premium too; Premium has no end date, so its copy shows no countdown).
// Also 09/11: one-time "App atualizado" sheet on the first open after this release, followed by the offer.
(() => {
  const VIT = { price: 'R$ 14,90', link: 'https://pay.hub.la/cGqFrb0fb52WtaoGmYYu' };   // PerfectPay plan PPLQQQU3K (same as the checkout bump) -> 'vitalicio'
  const DAY_MAX = 2, AWAY = 5 * 60e3;
  const today = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const get = (s, k, d) => { try { return JSON.parse(s.getItem(k)) ?? d; } catch { return d; } };
  const put = (s, k, v) => { try { s.setItem(k, JSON.stringify(v)); } catch {} };
  const eligible = () => typeof ME !== 'undefined' && ME && !ME.creator && !has('vitalicio');
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > AWAY) { try { sessionStorage.removeItem('sl_vit_s'); } catch {} }
  });
  function maybe() {
    if (!eligible() || get(sessionStorage, 'sl_vit_s', 0)) return;
    const c = get(localStorage, 'sl_vit', {}), n = c.d === today() ? c.n : 0;
    if (n >= DAY_MAX) return;
    put(sessionStorage, 'sl_vit_s', 1);
    put(localStorage, 'sl_vit', { d: today(), n: n + 1 });
    // after the "Copiada!" toast; when she closes the sticker preview (or any open sheet) it shows, tour/editor wait too
    setTimeout(() => { const t = setInterval(() => { if (!document.querySelector('dialog[open]')) { clearInterval(t); window.slLater(show); } }, 600); }, 2600);
  }
  function show() {
    if (!eligible()) return;
    const until = ME.basicUntil && new Date(ME.basicUntil), left = until ? Math.max(0, Math.ceil((until - Date.now()) / 864e5)) : 0;
    const total = ME.basicDays || (left > 30 ? 90 : 30), pct = Math.max(4, Math.round(100 * left / total));   // 30 = counted from her first entry
    const cov = s => `<img src="img/cat/${s}.webp" alt="" loading="eager" decoding="async">`;
    window.slEv('vit_view', String(left));
    window.slSheet(`<div class="vit">
      <div class="vban" aria-hidden="true"><div class="vfan"><i>${cov('academia-e-treino')}</i><i>${cov('ferias-e-viagem')}</i><i>${cov('skincare-e-autocuidado')}</i></div>
        <div class="vinf"><svg viewBox="0 0 64 32"><path d="M16 4C8 4 3 10 3 16s5 12 13 12c9 0 13-7 16-12s7-12 16-12c8 0 13 6 13 12s-5 12-13 12c-9 0-13-7-16-12S25 4 16 4Z"/></svg></div>
        <span class="vchip">Acesso vitalício</span></div>
      <h3 id="enTitle">Suas figurinhas <em>pra sempre</em></h3>
      ${until ? `<p class="lead">Seu acesso de ${total} dias vence em <b>${until.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</b>. Pague uma vez e o app nunca mais vence.</p>
      <div class="vleft"><div class="vbar"><span style="width:${pct}%"></span></div><b>${left === 1 ? 'Falta 1 dia' : `Faltam ${left} dias`}</b></div>`
      : `<p class="lead">Garanta o acesso vitalício: pague uma vez e o app é seu pra sempre, com todas as novidades.</p>`}
      <ul class="vlist"><li>${icon('i-check')}Nunca mais vence</li><li>${icon('i-check')}Figurinhas novas todo mês</li><li>${icon('i-check')}Pagamento único, sem mensalidade</li></ul>
      <a class="btn full vcta" href="${VIT.link}" target="_blank" rel="noopener" data-vit><span>Quero o vitalício por <b>${VIT.price}</b></span>${icon('i-arrow')}</a>
      <button class="btn full ghost" type="button" data-close>Agora não</button>
      <p class="hint">Use o mesmo e-mail do app: ${esc(ME.email)}</p></div>`);
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-vit]')) window.slEv('vit_click'); });
  const st = document.createElement('style');
  st.textContent = `.engagement-sheet:has(.vit) .x{background:rgba(255,255,255,.22);color:#fff;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:3}
.engagement-sheet:has(.vit) .grab{position:relative;z-index:3;background:rgba(255,255,255,.55)}
.vit .vban{position:relative;height:208px;margin:-47px -24px 22px;border-radius:28px 28px 0 0;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0,#ff6fa5 0,transparent 60%),radial-gradient(90% 80% at 0 100%,#ffb36b55,transparent 60%),linear-gradient(160deg,#ff3d84,#a2186e 55%,#4a1240)}
.vit .vban::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(40,8,34,.35));pointer-events:none}
.vit .vfan{position:absolute;left:50%;top:34px;width:0;height:0}
.vit .vfan i{position:absolute;width:104px;aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:3px solid rgba(255,255,255,.9);box-shadow:0 18px 30px -12px rgba(40,0,30,.7);
  transform-origin:50% 120%;animation:vfan .9s cubic-bezier(.34,1.4,.64,1) both}
.vit .vfan i img{width:100%;height:100%;object-fit:cover;display:block}
.vit .vfan i:nth-child(1){left:-148px;top:22px;--r:-11deg;animation-delay:.08s}
.vit .vfan i:nth-child(3){left:44px;top:22px;--r:11deg;animation-delay:.16s}
.vit .vfan i:nth-child(2){left:-58px;top:0;width:116px;--r:0deg;z-index:2}
.vit .vfan i{transform:rotate(var(--r))}
@keyframes vfan{from{opacity:0;transform:translateY(40px) rotate(0) scale(.9)}to{opacity:1;transform:rotate(var(--r))}}
.vit .vinf{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:3;width:64px;height:40px;display:grid;place-items:center;border-radius:20px;
  background:rgba(255,255,255,.95);box-shadow:0 10px 24px -8px rgba(60,0,40,.6)}
.vit .vinf svg{width:40px;height:20px;fill:none;stroke:var(--rose);stroke-width:5;stroke-linecap:round;stroke-dasharray:160;animation:vinf 1.6s .4s ease-out both}
@keyframes vinf{from{stroke-dashoffset:160}to{stroke-dashoffset:0}}
.vit .vchip{position:absolute;left:16px;top:16px;z-index:3;padding:6px 10px;border-radius:999px;background:var(--butter,#ffd84d);color:#2a1020;font:700 10px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase}
.vit h3{margin-top:0}
.vit .vleft{display:flex;align-items:center;gap:12px;margin:0 0 6px}
.vit .vbar{flex:1;height:8px;border-radius:9px;background:var(--line-2,rgba(0,0,0,.08));overflow:hidden}
.vit .vbar span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#ffb36b,var(--rose))}
.vit .vleft b{font-size:13px;color:var(--rose-ink);white-space:nowrap}
.vit .vlist{list-style:none;margin:16px 0 4px;padding:0;display:grid;gap:9px}
.vit .vlist li{display:flex;align-items:center;gap:10px;font-size:15px}
.vit .vlist svg{width:20px;height:20px;flex:none;padding:3px;border-radius:50%;background:var(--rose);color:#fff}
.vit .vcta{position:relative;overflow:hidden}
.vit .vcta::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-100%);animation:vshine 2.8s 1.2s infinite}
@keyframes vshine{to{transform:translateX(100%)}}
.vit .btn.ghost{margin-top:8px}.vit .hint{text-align:center}
.vnews{text-align:center}.vnews .vnb{display:grid;place-items:center;width:64px;height:64px;margin:4px auto 12px;border-radius:22px;background:linear-gradient(135deg,#ff6fa5,var(--rose));color:#fff;box-shadow:0 14px 30px -12px var(--rose);animation:vpop .6s cubic-bezier(.34,1.5,.64,1) both}.vnews .vnb svg{width:30px;height:30px}
.vnews .vlist{text-align:left;margin:16px 0 20px}.vnews .vlist{list-style:none;padding:0;display:grid;gap:10px}.vnews .vlist li{display:flex;align-items:center;gap:10px;font-size:15px}.vnews .vlist svg{width:20px;height:20px;flex:none;padding:3px;border-radius:50%;background:var(--rose);color:#fff}
@keyframes vpop{from{transform:scale(.4);opacity:0}}
@media (prefers-reduced-motion:reduce){.vit .vfan i,.vit .vinf svg,.vit .vcta::after{animation:none}.vit .vfan i{transform:rotate(var(--r))}}`;
  document.head.append(st);
  const base = window.slUse;
  window.slUse = kind => { base?.(kind); if (kind === 'copy' || kind === 'down') maybe(); };
  window.slVitalicio = show;   // preview / manual trigger
  // one-time release note, then the offer (queued by slLater until the note closes)
  const NEWS = 'upd-1109b';   // 09/11 madrugada: second release note, shows again to everyone
  function news() {
    if (typeof ME === 'undefined' || !ME || ME.creator) return;
    try { if (localStorage.getItem('sl_news') === NEWS) return; localStorage.setItem('sl_news', NEWS);
      if (!(window.SLStorage || localStorage).getItem('sl_cnt')) return; } catch { return; }   // 11/11 owner ok: a buyer who never copied gets no release note (was 4 popups on first open)
    window.slEv('news', NEWS);
    window.slSheet(`<div class="vnews"><span class="vnb">${icon('i-spark')}</span><span class="tag">Atualização</span>
      <h3 id="enTitle">App <em>atualizado</em>!</h3>
      <p class="lead">A gente está sempre melhorando o Stories Lab e trazendo novidades pra você. Olha o que chegou:</p>
      <ul class="vlist"><li>${icon('i-check')}Estúdio de Fotos: filtros profissionais na sua foto</li><li>${icon('i-check')}Presets pra baixar no Lightroom</li><li>${icon('i-check')}Capas novas e telas mais bonitas</li><li>${icon('i-check')}Perfil com sua foto, nível e conquistas</li><li>${icon('i-check')}Favoritas separadas por categoria</li></ul>
      <button class="btn full" type="button" data-close>Ver novidades</button></div>`);
    if (eligible()) { put(sessionStorage, 'sl_vit_s', 1); window.slLater(show); }
  }
  const wait = setInterval(() => { if (typeof ME !== 'undefined' && ME && typeof DATA !== 'undefined' && DATA && document.querySelector('#list .card')) { clearInterval(wait); setTimeout(() => window.slLater(news), 1200); } }, 700);
})();
