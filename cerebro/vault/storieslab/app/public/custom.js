// Figurinhas personalizadas (owner 10/11): 50+ stickers with the buyer's brand, delivered in 24h, R$ 29,90 since 18/11 (was 19,90).
// 1) offer sheet for everyone (not creators) who does not own 'personalizadas': on open (once a day) and after copy/download (max 1x/day, never twice in a session)
// 2) 'personalizadas' owner: the same entry becomes "Preencher briefing" -> POST /api/custom -> order shows as "em produção"
// 3) home banner always visible (offer or briefing/status)
(() => {
  const CUS = { price: 'R$ 29,90', link: 'https://pay.hub.la/NZEH050hceJ42na0Ydcn' };   // PerfectPay plan 'personalizadas' (filled when the product is created)
  const get = (s, k, d) => { try { return JSON.parse(s.getItem(k)) ?? d; } catch { return d; } };
  const put = (s, k, v) => { try { s.setItem(k, JSON.stringify(v)); } catch {} };
  const today = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const owner = () => typeof ME !== 'undefined' && ME && !ME.creator && has('personalizadas');
  const LIVE = !CUS.link.includes('PENDING');   // offer stays hidden until the real checkout link is in
  const eligible = () => LIVE && typeof ME !== 'undefined' && ME && !ME.creator && !has('personalizadas');
  let order;   // null = no order yet, object = her order, undefined = not loaded

  async function api(path, opt) {
    const go = () => fetch(path, { headers: { 'content-type': 'application/json' }, ...opt });
    let r = await go();
    if (r.status === 401) { await login(ME.email, true); r = await go(); }
    return r;
  }
  async function loadOrder() {
    try { const r = await api('/api/custom'); if (r.ok) order = (await r.json()).order || null; } catch {}
    return order;
  }

  const cov = s => `<img src="img/cat/${s}.webp" alt="" loading="eager" decoding="async">`;
  const FAN = [['loja-de-makes', 'Bella Makes', 'novidade ✦'], ['salao-de-cabelo', 'Studio Hair', 'agende já'], ['cafe', 'Café da Ana', 'peça o seu']];
  const LIST = ['20 figurinhas com a sua marca', 'Seu nome, suas cores e o seu estilo', 'Pronto em até 24 horas', 'Pagamento único, as figurinhas são suas pra sempre'];

  function offer() {
    if (!eligible()) return;
    window.slEv('cus_view');
    window.slSheet(`<div class="cus">
      <div class="cban" aria-hidden="true"><div class="cfan">${FAN.map(([c, n, t]) => `<i>${cov(c)}<b>${n}<small>${t}</small></b></i>`).join('')}</div>
        <span class="cchip">Novo · pronto em 24h</span></div>
      <h3 id="enTitle">Figurinhas com a <em>sua marca</em></h3>
      <p class="lead">Seu pacote personalizado pra sua empresa, loja ou perfil. A gente cria, você recebe pronto em apenas 24 horas.</p>
      <ul class="clist">${LIST.map(t => `<li>${icon('i-check')}<span>${t}</span></li>`).join('')}</ul>
      <a class="btn full ccta" href="${CUS.link}" target="_blank" rel="noopener" data-cus><span>Quero o meu por <b>${CUS.price}</b></span>${icon('i-arrow')}</a>
      <button class="btn full ghost" type="button" data-close>Agora não</button>
      <p class="hint">Use o mesmo e-mail do app: ${esc(ME.email)}</p></div>`);
  }

  const FIELDS = [
    ['brand', 'Nome da marca ou loja', 'input', 'Ex.: Studio Bela', true],
    ['niche', 'O que você vende ou faz', 'input', 'Ex.: salão, loja de roupas, doceria', true],
    ['social', 'Instagram ou site', 'input', '@suamarca', false],
    ['colors', 'Cores da marca', 'input', 'Ex.: rosa, dourado e branco', false],
    ['style', 'Estilo das figurinhas', 'select', ['Delicado e feminino', 'Moderno e clean', 'Luxo e elegante', 'Divertido e colorido', 'Minimalista'], true],
    ['phrases', 'Frases ou palavras que você quer', 'textarea', 'Ex.: Agende seu horário, Promoção, Novidade, Obrigada!', false],
    ['notes', 'Mais alguma coisa?', 'textarea', 'Conta pra gente o que for importante', false],
  ];
  const field = ([k, label, type, ph, req]) => `<label class="cf"><span>${label}${req ? '' : ' <small>(opcional)</small>'}</span>${
    type === 'select' ? `<select name="${k}" required>${ph.map(o => `<option>${o}</option>`).join('')}</select>`
    : type === 'textarea' ? `<textarea name="${k}" rows="2" maxlength="600" placeholder="${ph}"></textarea>`
    : `<input name="${k}" maxlength="120" placeholder="${ph}" ${req ? 'required' : ''}>`}</label>`;

  async function briefing() {
    if (!owner()) return;
    if (order === undefined) await loadOrder();   // tapped before the boot fetch came back
    if (order) return status();
    window.slEv('cus_brief_view');
    window.slSheet(`<div class="cus"><span class="tag">Pedido liberado</span>
      <h3 id="enTitle">Conta sobre a <em>sua marca</em></h3>
      <p class="lead">Preencha com calma. Com essas informações a gente cria suas figurinhas e entrega em até 24 horas.</p>
      <form id="cusForm" class="cform">${FIELDS.slice(0, 5).map(field).join('')}
        <div class="cf"><span>Sua logo <small>(opcional)</small></span><label class="cup"><input type="file" accept="image/*" data-up="logo" hidden><b>${icon('i-arrow')} Enviar a logo</b></label><div class="cthumbs" data-th="logo"></div></div>
        <div class="cf"><span>Fotos dos seus produtos ou do seu trabalho <small>(opcional, até 3)</small></span><label class="cup"><input type="file" accept="image/*" multiple data-up="fotos" hidden><b>${icon('i-arrow')} Escolher fotos</b></label><div class="cthumbs" data-th="fotos"></div></div>
        ${FIELDS.slice(5).map(field).join('')}
        <p class="cerr" id="cusErr" role="alert"></p>
        <button class="btn full" type="submit">Enviar pedido</button></form></div>`);
    const f = document.querySelector('#cusForm'), id = crypto.randomUUID(), pics = { logo: [], fotos: [] };
    f.querySelectorAll('[data-up]').forEach(inp => inp.onchange = () => {
      const k = inp.dataset.up; pics[k] = [...inp.files].filter(x => x.type.startsWith('image/')).slice(0, k === 'logo' ? 1 : 3);
      f.querySelector(`[data-th="${k}"]`).innerHTML = pics[k].map(x => `<img src="${URL.createObjectURL(x)}" alt="">`).join('');
    });
    f.onsubmit = async e => {
      e.preventDefault();
      const b = f.querySelector('[type=submit]'), err = f.querySelector('#cusErr'), d = Object.fromEntries([...new FormData(f)].filter(([, v]) => typeof v === 'string'));
      b.disabled = true; b.textContent = 'Enviando…'; err.textContent = '';
      try {
        const r = await api('/api/custom', { method: 'POST', body: JSON.stringify({ id, ...d }) });
        if (!r.ok) throw Error();
        order = (await r.json()).order;
        const up = [...pics.logo.map(x => [0, x]), ...pics.fotos.map((x, i) => [201 + i, x])];
        let bad = 0;
        for (const [n, file] of up) {
          b.textContent = `Enviando imagens… ${up.findIndex(u => u[0] === n) + 1} de ${up.length}`;
          const ok = async () => (await api(`/api/custom/img?id=${order.id}&n=${n}`, { method: 'POST', body: await shrink(file), headers: { 'content-type': 'image/webp' } })).ok;
          try { if (!await ok() && !await ok()) bad++; } catch { bad++; }
        }
        window.slEv('cus_brief_sent'); status(true);
        if (bad) toast('Seu pedido foi enviado, mas alguma imagem não subiu. A gente cria com as informações que você escreveu.');
      } catch { err.textContent = 'Não deu pra enviar agora. Suas respostas continuam aqui, tente de novo.'; b.disabled = false; b.textContent = 'Tentar de novo'; }
    };
  }

  // logo/photos: max 1200 px webp so each one fits a D1 row (< 900 KB)
  function shrink(file) {
    return new Promise((ok, no) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, 1200 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const out = q => c.toBlob(bl => (!bl ? no(Error('img')) : bl.size > 880e3 && q > .4 ? out(q - .2) : ok(bl)), 'image/webp', q);
        out(.86);
      };
      im.onerror = () => { URL.revokeObjectURL(url); no(Error('img')); };
      im.src = url;
    });
  }

  function status(fresh) {
    const o = order, due = o && new Date(new Date(o.created).getTime() + 24 * 3600e3);
    const done = o?.status === 'entregue';
    if (done && o.files) return pack(o);
    window.slSheet(`<div class="cus cok"><span class="cokb">${icon('i-check')}</span>
      <h3 id="enTitle">${done ? 'Seu pacote <em>está pronto!</em>' : fresh ? 'Pedido <em>recebido!</em>' : 'Seu pedido está <em>em produção</em>'}</h3>
      <p class="lead">${done ? `Enviamos as figurinhas de <b>${esc(o.brand)}</b> pro seu e-mail. Confira também a caixa de spam.`
        : `Estamos criando as figurinhas de <b>${esc(o?.brand || 'sua marca')}</b>. Suas figurinhas aparecem aqui no app até <b>${due.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</b>.`}</p>
      <button class="btn full" type="button" data-close>Voltar ao app</button></div>`);
  }

  // delivered pack (generator uploads the webps to D1): tap copies like any other sticker, "Baixar" saves the selected one
  function pack(o) {
    const src = i => `/api/custom/file/${o.id}/${i}.webp?v=2`, file = i => `${o.brand.replace(/[^\w-]+/g, '-').toLowerCase()}-${i}.png`;
    window.slSheet(`<div class="cus cpk"><h3 id="enTitle">Suas figurinhas <em>${esc(o.brand)}</em></h3>
      <p class="lead">Toque numa figurinha pra copiar e colar no Story.</p>
      <div class="cgrid">${Array.from({ length: o.files }, (_, k) => `<button type="button" data-i="${k + 1}" aria-label="Figurinha ${k + 1}"><img src="${src(k + 1)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>
      <div class="cbar"><button class="btn full" type="button" data-down disabled>Baixar a selecionada</button></div></div>`);
    let sel = 0;
    const box = document.querySelector('.cpk');
    box.querySelector('.cgrid').onclick = async e => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      box.querySelectorAll('.cgrid [aria-pressed]').forEach(x => x.removeAttribute('aria-pressed'));
      b.setAttribute('aria-pressed', 'true'); sel = +b.dataset.i; box.querySelector('[data-down]').disabled = false;
      const p = pngBlob(src(sel)); p.catch(() => {});
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': p })]); toast('Copiada! Agora é só colar no Story.'); window.slEv('cus_copy'); }
      catch { try { await shareFile(await p, file(sel), 'Figurinha baixada. No Story, abra a galeria e escolha ela.'); } catch { toast('Não deu pra copiar. Toque em Baixar a selecionada.'); } }
    };
    box.querySelector('[data-down]').onclick = async () => { try { saveFile(await pngBlob(src(sel)), file(sel)); toast('Figurinha baixada sem fundo.'); } catch { toast('Não deu pra baixar agora. Tente de novo.'); } };
  }

  // home banner: offer for everyone else, briefing / status for owners
  function banner() {
    if (document.querySelector('#cusBanner') || typeof ME === 'undefined' || !ME || ME.creator) return;
    const host = document.querySelector('#upsellBanner'); if (!host) return;
    const own = owner(); if (!own && !LIVE) return;
    const label = own ? (order ? (order.status === 'entregue' ? 'Seu pacote está pronto' : 'Pedido em produção') : 'Preencher briefing') : 'Figurinhas com a sua marca';
    const sub = own ? (order ? 'Toque pra ver o andamento' : 'Conta sobre sua marca e receba em 24h') : `20 figurinhas personalizadas em 24h por ${CUS.price}`;
    const b = document.createElement('button');
    b.id = 'cusBanner'; b.type = 'button'; b.className = 'upsell cusb';
    b.innerHTML = `<span class="gem">${icon('i-spark')}</span><span><b>${label}</b><small>${sub}</small></span><span class="go">${icon('i-arrow')}</span>`;
    b.onclick = () => { window.slEv('cus_banner'); own ? briefing() : offer(); };
    host.after(b);
  }

  // triggers
  let hiddenAt = 0;
  function maybe(afterCopy) {
    if (!eligible() || get(sessionStorage, 'sl_cus_s', 0)) return;
    const c = get(localStorage, 'sl_cus', {}); if (c.d === today()) return;
    put(sessionStorage, 'sl_cus_s', 1); put(localStorage, 'sl_cus', { d: today() });
    setTimeout(() => { const t = setInterval(() => { if (!document.querySelector('dialog[open]')) { clearInterval(t); window.slLater(offer); } }, 600); }, afterCopy ? 2600 : 0);
  }
  const base = window.slUse;
  window.slUse = kind => { base?.(kind); if (kind === 'copy' || kind === 'down') maybe(true); };
  window.slCustom = () => (owner() ? briefing() : offer());   // preview / manual trigger

  document.addEventListener('click', e => { if (e.target.closest('[data-cus]')) window.slEv('cus_click'); });
  const st = document.createElement('style');
  st.textContent = `.engagement-sheet:has(.cban) .x{background:rgba(255,255,255,.22);color:#fff;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:3}
.engagement-sheet:has(.cban) .grab{position:relative;z-index:3;background:rgba(255,255,255,.55)}
.cus .cban{position:relative;height:208px;margin:-47px -24px 22px;border-radius:28px 28px 0 0;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0,#ffd84d66 0,transparent 60%),radial-gradient(90% 80% at 100% 100%,#ff6fa588,transparent 60%),linear-gradient(160deg,#7a3cff,#a2186e 60%,#3a1040)}
.cus .cban::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(40,8,34,.35));pointer-events:none}
.cus .cfan{position:absolute;left:50%;top:34px;width:0;height:0}
.cus .cfan i{position:absolute;width:104px;aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:3px solid rgba(255,255,255,.92);box-shadow:0 18px 30px -12px rgba(40,0,30,.7);
  transform-origin:50% 120%;transform:rotate(var(--r));animation:cfan .9s cubic-bezier(.34,1.4,.64,1) both}
.cus .cfan i img{width:100%;height:100%;object-fit:cover;display:block}
.cus .cfan i b{position:absolute;left:50%;bottom:14px;transform:translateX(-50%) rotate(-5deg);display:grid;justify-items:center;gap:3px;padding:6px 9px 7px;border-radius:12px;background:#fff;color:#2a1020;font:italic 600 13px/1 var(--display);white-space:nowrap;box-shadow:0 6px 14px -6px rgba(40,0,30,.6)}
.cus .cfan i b small{font:800 8px/1 var(--sans);font-style:normal;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--rose);padding:3px 6px;border-radius:99px}
.cus .cfan i:nth-child(1){left:-148px;top:22px;--r:-11deg;animation-delay:.08s}
.cus .cfan i:nth-child(3){left:44px;top:22px;--r:11deg;animation-delay:.16s}
.cus .cfan i:nth-child(2){left:-58px;top:0;width:116px;--r:0deg;z-index:2}
@keyframes cfan{from{opacity:0;transform:translateY(40px) rotate(0) scale(.9)}to{opacity:1;transform:rotate(var(--r))}}
.cus .cchip{position:absolute;left:16px;top:16px;z-index:3;padding:6px 10px;border-radius:999px;background:var(--butter,#ffd84d);color:#2a1020;font:700 10px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase}
.cus h3{margin-top:0}
.cus .clist{list-style:none;margin:16px 0 4px;padding:0;display:grid;gap:9px}
.cus .clist li{display:flex;flex-wrap:nowrap;align-items:center;gap:10px;font-size:15px}
.cus .clist svg{width:20px;height:20px;flex:none;padding:3px;border-radius:50%;background:var(--rose);color:#fff}
.cpk .cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0;max-height:52vh;overflow-y:auto;padding:2px}
.cpk .cgrid button{aspect-ratio:1;border:0;border-radius:14px;padding:6px;background:repeating-conic-gradient(#b8adb3 0 25%,#cbc2c7 0 50%) 0 0/14px 14px;cursor:pointer}
.cpk .cgrid button[aria-pressed]{box-shadow:0 0 0 2.5px var(--rose,#FF2E74)}
.cpk .cgrid img{width:100%;height:100%;object-fit:contain;display:block}
.cus .ccta{position:relative;overflow:hidden}
.cus .ccta::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-100%);animation:cshine 2.8s 1.2s infinite}
@keyframes cshine{to{transform:translateX(100%)}}
.cus .btn.ghost{margin-top:8px}.cus .hint{text-align:center}
.cus .cform{display:grid;gap:12px;margin-top:14px}
.cus .cf{display:grid;gap:6px;font-size:13px;font-weight:600}
.cus .cf small{font-weight:400;opacity:.6}
.cus .cf :is(input,select,textarea){font:400 16px/1.3 var(--sans);padding:12px 14px;border-radius:14px;border:1.5px solid var(--line-2,rgba(0,0,0,.14));background:var(--card,#fff);color:inherit;width:100%;box-sizing:border-box;resize:vertical}
.cus .cf :is(input,select,textarea):focus{outline:2px solid var(--rose);outline-offset:1px}
.cus .cup{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:14px;border:1.5px dashed var(--rose);color:var(--rose);font:700 14px var(--sans);cursor:pointer}
.cus .cup svg{width:16px;height:16px;transform:rotate(-90deg)}
.cus .cthumbs{display:flex;gap:8px;flex-wrap:wrap}.cus .cthumbs:empty{display:none}
.cus .cthumbs img{width:64px;height:64px;object-fit:cover;border-radius:12px;box-shadow:0 0 0 1px var(--line-2,rgba(0,0,0,.12))}
.cus .cerr{color:#c0213a;font-size:13px;min-height:0;margin:0}
.cus.cok{text-align:center}.cus .cokb{display:grid;place-items:center;width:64px;height:64px;margin:4px auto 12px;border-radius:22px;background:linear-gradient(135deg,#ff6fa5,var(--rose));color:#fff;animation:cpop .6s cubic-bezier(.34,1.5,.64,1) both}.cus .cokb svg{width:30px;height:30px}
@keyframes cpop{from{transform:scale(.4);opacity:0}}
.upsell.cusb{background:linear-gradient(120deg,#7a3cff,#a2186e)}
@media (prefers-reduced-motion:reduce){.cus .cfan i,.cus .ccta::after,.cus .cokb{animation:none}}`;
  document.head.append(st);

  // boot: wait for the app, then banner + (once a day) the offer on open
  const wait = setInterval(() => {
    if (typeof ME !== 'undefined' && ME && typeof DATA !== 'undefined' && DATA && document.querySelector('#list .card')) {
      clearInterval(wait);
      (has('personalizadas') ? loadOrder() : Promise.resolve()).then(() => {
        banner(); setTimeout(() => maybe(false), 3500);
        // bought but no briefing yet: open the form by itself (every session until she sends it)
        if (owner() && order === null && !get(sessionStorage, 'sl_cus_b', 0)) {
          put(sessionStorage, 'sl_cus_b', 1);
          setTimeout(() => { const t = setInterval(() => { if (!document.querySelector('dialog[open]')) { clearInterval(t); window.slLater(briefing); } }, 600); }, 2500);
        }
      });
    }
  }, 700);
})();
