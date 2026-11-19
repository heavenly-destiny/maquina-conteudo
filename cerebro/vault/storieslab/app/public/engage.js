// Engagement layer: featured theme, daily sticker, most used, favorites, recent, profile, upcoming dates, gifts,
// referral, guided tour, contextual offers and usage events. Loaded right after the main script and uses its globals
// (ME, PREMIUM, CATS, BY, CUR, S, OFFERS, GIFT, U, card, open, toast, renderHome, onCardClick, view, logout...).
(() => {
const LS = (k, d) => { try { return JSON.parse(SLStorage.getItem(k)) ?? d; } catch { return d; } };
const SV = (k, v) => { try { SLStorage.setItem(k, JSON.stringify(v)); } catch {} };
const pad = n => String(n).padStart(2, '0');
const dayStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const base = c => (c && c.twinOf) || c;   // a Premium twin ("Natal" Premium) is shown through its Básico card

// ---------- usage events (read in /api/ev) ----------
// m = opened as installed app or in the browser, p = notification permission (admin: installs, push reach)
const MODE = () => (matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'app' : 'web');
const PERM = () => ('Notification' in window ? Notification.permission : 'na');
const ev = (e, k = '', s) => {   // s = sticker number on copy/down (per-sticker ranking, table stk)
  if (!ME || ME.creator) return;
  fetch('/api/ev', {method: 'POST', keepalive: true, headers: {'content-type': 'application/json'}, body: JSON.stringify({email: ME.email, e, k, s, m: MODE(), p: PERM()})}).catch(() => {});
};
window.slEv = (e, k) => { if (e === 'photo') goalMark('photo'); return ev(e, k); };   // home2: photo saved = goal done
// live users: heartbeat while the app is on screen; coming back after 5+ min counts as a new open
setInterval(() => document.hidden || ev('ping'), 60e3);
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (hiddenAt && Date.now() - hiddenAt > 5 * 60e3) ev('open', 'volta'); else ev('ping');
});
addEventListener('appinstalled', () => ev('install'));
// what people search for (debounced, only finished terms)
let qT;
document.getElementById('q')?.addEventListener('input', e => {
  clearTimeout(qT);
  const v = e.target.value.trim().toLowerCase();
  if (v.length >= 3) qT = setTimeout(() => ev('search', v.slice(0, 40)), 1500);
});

// ---------- progress ----------
// days in a row using the app; one missed day never breaks it (gentle streak, no punishment)
function streak(days, today = new Date()) {
  if (!days.length) return 0;
  const t = d => Date.parse(d + 'T12:00:00');
  if ((t(dayStr(today)) - t(days[days.length - 1])) / 864e5 > 2) return 0;
  let n = 1;
  for (let i = days.length - 1; i > 0 && (t(days[i]) - t(days[i - 1])) / 864e5 <= 2; i--) n++;
  return n;
}

// ---------- home2 (09/11): daily goal = copy 1 sticker + see the post ideas + edit 1 photo; all 3 = confetti once a day
function goalMark(k) {
  const t = dayStr(new Date()), g = LS('sl_goal', {});
  if (g.d !== t) { g.d = t; g.post = g.photo = g.fx = 0; }
  if (g[k]) return;
  g[k] = 1; SV('sl_goal', g);
  setTimeout(() => { if (typeof renderMine === 'function') renderMine(); }, 0);
}
function goalState() {
  const t = dayStr(new Date()), g = LS('sl_goal', {}), days = LS('sl_days', []);
  const s = { copy: days[days.length - 1] === t, post: g.d === t && !!g.post, photo: g.d === t && !!g.photo };
  s.n = +s.copy + s.post + s.photo;
  if (s.n === 3 && !(g.d === t && g.fx)) { SV('sl_goal', { ...g, d: t, fx: 1 }); setTimeout(() => { confetti(); toast('Meta de hoje batida! Volte amanhã pra manter a sequência'); }, 500); }
  return s;
}

// ---------- upcoming dates (seasonal categories) ----------
function easter(Y) {
  const a = Y % 19, b = Math.floor(Y / 100), c = Y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), x = h + l - 7 * m + 114;
  return new Date(Y, Math.floor(x / 31) - 1, (x % 31) + 1);
}
const nth = (Y, m, dow, k) => { const d = new Date(Y, m, 1); d.setDate(1 + (dow - d.getDay() + 7) % 7 + 7 * (k - 1)); return d; };
const MONTHS = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function upcoming(now = new Date(), within = 60) {
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dates = Y => [
    [new Date(Y, 0, 1), 'ano-novo'], [addDays(easter(Y), -47), 'carnaval'], [new Date(Y, 2, 8), 'dia-das-mulheres'],
    [easter(Y), 'pascoa'], [nth(Y, 4, 0, 2), 'dia-das-maes'], [new Date(Y, 5, 12), 'dia-dos-namorados'],
    [new Date(Y, 5, 24), 'festa-junina'], [nth(Y, 7, 0, 2), 'dia-dos-pais'], [new Date(Y, 9, 1), 'outubro-rosa'],
    [addDays(nth(Y, 10, 4, 4), 1), 'black-friday'], [new Date(Y, 11, 25), 'natal'],
  ];
  const out = [...dates(t0.getFullYear()), ...dates(t0.getFullYear() + 1)]
    .filter(([d]) => d >= t0 && (d - t0) / 864e5 <= within).sort((a, b) => a[0] - b[0])
    .flatMap(([d, s]) => [s, s + '-premium'].map(slug => ({slug, days: Math.round((d - t0) / 864e5)})));
  out.unshift({slug: MONTHS[t0.getMonth()], days: 0});
  if (t0.getDate() >= 20) out.splice(1, 0, {slug: MONTHS[(t0.getMonth() + 1) % 12], days: 99});
  return out;
}
// featured theme: the next date within 30 days, else this month's category (changes by itself with the calendar)
function featured(now = new Date()) {
  const up = upcoming(now, 30).filter(x => BY[x.slug] && !locked(base(BY[x.slug])));
  const date = up.find(x => x.days > 0 && x.days < 99);
  return date ? {c: base(BY[date.slug]), days: date.days} : up[0] ? {c: base(BY[up[0].slug]), days: 0} : null;
}

// ---------- favorites / recent ----------
const idOf = (c, n) => c.slug + '/' + n;
const parse = id => { const i = id.lastIndexOf('/'); return [BY[id.slice(0, i)], +id.slice(i + 1)]; };
const usable = ([c, n]) => c && !c.kind && !locked(c) && c.fileSet?.has(n);
const thumb = (id, tag = 'button') => {
  const [c, n] = parse(id);
  const attrs = tag === 'button' ? ` type="button" data-id="${esc(id)}" aria-label="${esc(c.name)} ${n}"` : '';
  return `<${tag} class="st chk${c.lightSet.has(n) ? ' dk' : ''}"${attrs}><img class="fade" src="${U(`t/${c.slug}/${n}.webp`)}" alt="" loading="lazy" decoding="async"></${tag}>`;
};
function openId(id) {
  const [c, n] = parse(id);
  if (!usable([c, n])) return;
  CUR = c; openSticker(n);
}

// sticker of the day: same for everyone on the same date, picked from what she can use
function daily(now = new Date()) {
  const pool = CATS.filter(c => !c.kind && !locked(c) && c.tier !== 'bonus' && !GIFT.has(c.slug) && c.count > 0);
  if (!pool.length) return null;
  const mine = pool.filter(c => c.section === LS('sl_profile', ''));
  if (mine.length >= 3) pool.splice(0, pool.length, ...mine);
  const k = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const c = pool[(k * 7919) % pool.length];
  return idOf(c, (c.base || c.files)[(k * 104729) % c.count]);   // base order: the hourly ranking must not change it
}

// most copied categories (GET /api/top, aggregated for everyone); static list when offline
const TOP_FALLBACK = ['bom-dia', 'ferias-e-viagem', 'frases', 'gratidao', 'ano-novo', 'novembro', 'maternidade', 'casal-e-amor', 'academia-e-treino'];
let TOP = LS('sl_top', null);
fetch('/api/top').then(r => r.json()).then(t => { if (Array.isArray(t) && t.length) { TOP = t.map(x => x.slug); SV('sl_top', TOP); renderMine(); } }).catch(() => {});
const uniq = list => list.filter(Boolean).map(base).filter((c, i, a) => a.indexOf(c) === i);

let heroCleanup = () => {}, heroIndex = 0, heroPaused = false;
function renderHero() {
  heroCleanup();
  const box = $('#hero');
  if (!box || !DATA) return;
  const f = featured();
  if (!f) { box.innerHTML = ''; return; }
  const choices = [{camera:true,name:'Nova câmera'},{studio:true,name:'Estúdio de Fotos'},...uniq([f.c, ...['glow-up','ferias-e-viagem','bom-dia','gratidao'].map(s=>BY[s])]).filter(c=>!locked(c)).slice(0,3)];
  const art = {
    'black-friday':{photo:'img/ph/loja.webp',title:'Sua Black.<br>Seu destaque.',label:'Black Friday',stickers:[19]},
    'glow-up':{photo:'img/hero/glow-up.jpg',title:'Seu momento<br>de brilhar.',label:'Glow up',stickers:[64]},
    'ferias-e-viagem':{photo:'img/ph/o-praia.webp',title:'Dias de sol.<br>Stories seus.',label:'Férias e viagem',stickers:[1]},
    'bom-dia':{photo:'img/presets/antes/ref-soft-film-02.webp',title:'Um bom dia.<br>Do seu jeito.',label:'Bom dia',stickers:[]}
  };
  heroIndex %= choices.length;
  box.setAttribute('aria-roledescription','carrossel');
  box.innerHTML = `<div class="hero-stage hero-editorial">${choices.map((c,i)=>{
    if(c.camera)return `<a class="spotlight spotlight-camera hero-slide" href="#camera"${i===heroIndex?'':' hidden'} aria-label="Novidade: câmera com filtros para fotos e vídeos"><img class="spotlight-photo" src="img/presets/antes/ref-soft-film.webp" alt="" decoding="async" aria-hidden="true"><span class="spotlight-shade"></span><span class="spotlight-label">NOVIDADE · CÂMERA</span><span class="spotlight-camera-art" aria-hidden="true"><img src="img/cameras/instant.webp" alt=""><img src="img/cameras/film.webp" alt=""></span><span class="spotlight-copy"><strong>Sua nova<br><em>câmera.</em></strong><span>Fotografe e grave ${icon('i-arrow')}</span></span></a>`;
    if(c.studio)return `<a class="spotlight spotlight-studio hero-slide" href="#/m/presets"${i===heroIndex?'':' hidden'} aria-label="Estúdio: explorar filtros de fotos"><span class="spotlight-photos" aria-hidden="true"><span><img src="img/presets/depois/17-dark-cinema/ref-dark-cinema.webp" alt=""><i>Dark</i></span><span><img src="img/presets/depois/19-ocean/ref-ocean.webp" alt=""><i>Ocean</i></span><span><img src="img/presets/depois/14-editorial/ref-editorial.webp" alt=""><i>Editorial</i></span></span><span class="spotlight-shade"></span><span class="spotlight-label">ESTÚDIO DE FOTOS</span><span class="spotlight-copy"><strong>Uma foto.<br><em>Vários moods.</em></strong><span>Explorar filtros ${icon('i-arrow')}</span></span></a>`;
    const a=art[c.slug],photo=a?.photo||`img/cat/${c.slug}.webp?v=${CONFIG.thumbV}`;
    const picks=(a?.stickers||[]).filter(n=>c.fileSet.has(n));
    return `<a class="spotlight spotlight-category hero-slide" href="#/c/${c.slug}" data-feat="${c.slug}"${i===heroIndex?'':' hidden'} aria-label="${esc(c.name)}: explorar figurinhas">
      <img class="spotlight-photo" src="${photo}" alt="" decoding="async" aria-hidden="true">
      <span class="spotlight-shade"></span><span class="spotlight-label">${esc(a?.label||c.name)}</span>
      <span class="spotlight-stickers" aria-hidden="true">${picks.map(n=>`<img src="${U(`t/${c.slug}/${n}.webp`)}" alt="" decoding="async">`).join('')}</span>
      <span class="spotlight-copy"><strong>${a?.title||esc(c.name)}</strong><span>Ver figurinhas ${icon('i-arrow')}</span></span></a>`;
  }).join('')}<div class="hero-controls"><div class="hero-dots" role="group" aria-label="Escolher destaque">${choices.map((c,i)=>`<button type="button" data-hero="${i}" aria-label="Ver destaque: ${esc(c.name)}" aria-pressed="${i===heroIndex}"><span></span></button>`).join('')}</div><button class="hero-play" type="button" aria-label="Pausar destaques automáticos"></button></div></div>`;
  const motion = matchMedia('(prefers-reduced-motion: reduce)'), slides=[...box.querySelectorAll('.hero-slide')], dots=[...box.querySelectorAll('[data-hero]')], play=box.querySelector('.hero-play');
  let timer, inView=false, hovering=false, focused=false;
  const sync = () => {
    clearTimeout(timer);
    const stopped=heroPaused||motion.matches;
    play.hidden=motion.matches||choices.length<2;
    play.textContent=stopped?'▶':'Ⅱ'; play.setAttribute('aria-label',stopped?'Reproduzir destaques automáticos':'Pausar destaques automáticos');
    const running=!stopped&&inView&&!hovering&&(!focused||document.activeElement===play)&&!document.hidden&&!document.querySelector('dialog[open]');
    box.classList.toggle('hero-running',running);
    if(running)timer=setTimeout(()=>show(heroIndex+1),4000);
  };
  const show = n => {
    heroIndex=(n+choices.length)%choices.length;
    slides.forEach((s,i)=>s.hidden=i!==heroIndex);
    dots.forEach((b,i)=>b.setAttribute('aria-pressed',i===heroIndex));
    sync();
  };
  dots.forEach((b,i)=>b.onclick=()=>{heroPaused=true;show(i);});
  play.onclick=()=>{heroPaused=!heroPaused;sync();};
  box.onpointerenter=e=>{if(e.pointerType==='mouse'){hovering=true;sync();}};
  box.onpointerleave=()=>{hovering=false;sync();};
  box.onfocusin=()=>{focused=true;sync();};
  box.onfocusout=e=>{focused=box.contains(e.relatedTarget);sync();};
  const observer=new IntersectionObserver(es=>{inView=es[0].isIntersecting;sync();},{threshold:.25}); observer.observe(box);
  document.addEventListener('visibilitychange',sync); motion.addEventListener('change',sync);
  const dialogs=new MutationObserver(sync); document.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
  heroCleanup=()=>{clearTimeout(timer);observer.disconnect();dialogs.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);};
  sync();
}

function renderMine() {
  const box = $('#mine');
  if (!box || !DATA) return;
  const cnt = LS('sl_cnt', 0), st = streak(LS('sl_days', []));
  let html = '';
  const rc = uniq(LS('sl_rcat', []).map(s => BY[s])).filter(c => !locked(c)).slice(0, 8);
  if (rc.length) html += `<div><p class="rowh">Continuar de onde parou</p><div class="hrow conts">${rc.map(c => `<a class="cont" href="#/c/${c.slug}"><span class="ci sk"><img class="fade" src="img/cat/${c.slug}.webp?v=${CONFIG.thumbV}" alt="" loading="lazy"></span><span><b>${esc(c.name)}</b></span></a>`).join('')}</div></div>`;
  const d = daily(), g = goalState(), dc = d && parse(d)[0];
  // daily goal as a Stories-style bubble row (owner 09/11 v3): colored ring = to do, grey ring + check = done
  const img = src => `<img src="${src}" alt="" loading="lazy" decoding="async">`;
  const steps = [
    d && { k: 'copy', a: `data-id="${esc(d)}"`, ic: thumb(d, 'span'), t: 'Figurinha', full: 'Copiar a figurinha do dia' },
    window.POST_IDEAS && { k: 'post', a: 'data-post', ic: img('img/cat/frases-populares.webp'), t: 'Ideias', full: 'Ver 3 ideias de post' },
    { k: 'photo', a: 'href="#/m/presets/editor" data-home-studio', ic: img('img/presets/antes/praia.webp'), t: 'Filtro', full: 'Editar 1 foto com filtro', link: 1 },
  ].filter(Boolean);
  const tag = x => x.link ? 'a' : 'button', ty = x => x.link ? '' : ' type="button"';
  const goalHtml = `<section class="goal${g.n === 3 ? ' done' : ''}" aria-label="Meta de hoje">
    <div class="gh"><b>Meta de hoje</b><span>${g.n === 3 ? 'Tudo feito 🎉' : `${g.n} de 3`}</span></div>
    <div class="gs">${steps.map(x => `<${tag(x)} class="gb${g[x.k] ? ' ok' : ''}"${ty(x)} ${x.a} aria-label="${x.full}${g[x.k] ? ', feito' : ''}"><span class="gc"><span class="gin">${x.ic}</span><i class="ck">${icon('i-check')}</i></span><small>${x.t}</small></${tag(x)}>`).join('')}
      ${st > 0 ? `<div class="gb fire"><span class="gc"><span class="gin">🔥<b>${st}</b></span></span><small>${st > 1 ? `${st} dias` : '1 dia'}</small></div>` : ''}
      ${rankOn() ? `<button class="gb rank" type="button" data-rank><span class="gc"><span class="gin">${TROPHY}</span>${RANK && RANK.me.pos ? `<i class="pos">${RANK.me.pos}º</i>` : ''}</span><small>Ranking</small></button>` : ''}</div>
  </section>`;
  html += '<section id="styleEdits" aria-label="Seleções de estilos"></section>';
  const top = uniq((TOP || TOP_FALLBACK).map(s => BY[s])).slice(0, 10);
  if (top.length) html += `<div><p class="rowh">Mais usados</p><div class="hrow cards">${top.map(card).join('')}</div></div>`;
  const up = uniq(upcoming().map(x => BY[x.slug])).slice(0, 6);
  if (up.length) html += `<div><p class="rowh">Próximas datas</p><div class="hrow cards">${up.map(card).join('')}</div></div>`;
  box.innerHTML = html;
  const gb = $('#goalBox'); if (gb) gb.innerHTML = goalHtml; else box.insertAdjacentHTML('afterbegin', goalHtml);
  window.PremiumUI?.home();
  renderHero();
}

// ---------- O que postar hoje? (ideas in post-ideas.js) ----------
// one idea for the weekday + two for her profile, rotating by date; stickers = the ones whose printed text has the idea's word
function todayIdeas(now = new Date()) {
  const P = window.POST_IDEAS, k = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const mine = P[LS('sl_profile', '')] || P.rotina;
  return [P.dia[now.getDay()], mine[k % mine.length], mine[(k + 1) % mine.length]];
}
let postWords = null;
const postJson = u => fetch(u).then(r => (r.ok ? r.json() : {}));
async function ideaStickers(idea) {
  try { postWords ||= await postJson('ocr/_words.json?v=1'); } catch { return []; }
  for (const w of idea.w) {
    const score = {};
    for (const x in postWords) if (x.startsWith(w)) for (const s in postWords[x]) score[s] = (score[s] || 0) + postWords[x][s];
    const cats = Object.keys(score).map(s => BY[s]).filter(c => c && !c.kind && !locked(c) && c.count).sort((a, b) => score[b.slug] - score[a.slug]);
    for (const c of cats.slice(0, 3)) {
      let idx; try { idx = await postJson(`ocr/${c.slug}.json?v=1`); } catch { continue; }
      const ns = c.files.filter(n => (idx[n] || '').split(' ').some(t => t.startsWith(w))).slice(0, 4);
      if (ns.length) return ns.map(n => idOf(c, n));
    }
  }
  return [];
}
const AIW_DONE = '<p>Você está na lista do roteirista com IA. A gente avisa aqui no app.</p>';
function openPost() {
  const ideas = todayIdeas();
  ev('post_open', LS('sl_profile', '') || 'rotina'); goalMark('post');
  sheet(`<span class="tag">Ideias pra hoje</span><h3 id="enTitle">O que <em>postar</em> hoje?</h3>
    ${ideas.map((x, i) => `<article class="idea"><b>${esc(x.t)}</b><ol>${x.s.map(s => `<li>${esc(s)}</li>`).join('')}</ol><div class="ist" data-i="${i}"></div></article>`).join('')}
    <div class="aiw">${LS('sl_aiw', 0) ? AIW_DONE : '<p><b>Roteiros feitos pra você, com IA?</b> Entre na lista e seja das primeiras a usar.</p><button class="btn sm" type="button" data-aiw>Quero entrar na lista</button>'}</div>`);
  ideas.forEach((x, i) => ideaStickers(x).then(ids => { const box = dlg.querySelector(`.ist[data-i="${i}"]`); if (box) box.innerHTML = ids.map(id => thumb(id)).join(''); }));
}

// ---------- Favoritas tab ----------
window.renderFavs = () => {
  const fav = LS('sl_fav', []).filter(id => usable(parse(id)));
  const rec = LS('sl_rec', []).filter(id => usable(parse(id)) && !fav.includes(id));
  // 09/11: favorites grouped by category, chip filter on top (newest first inside each group)
  const groups = [];
  for (const id of fav) { const c = parse(id)[0]; let g = groups.find(x => x.c === c); if (!g) groups.push(g = {c, ids: []}); g.ids.push(id); }
  if (FAVCAT && !groups.some(g => g.c.slug === FAVCAT)) FAVCAT = '';
  const shown = FAVCAT ? groups.filter(g => g.c.slug === FAVCAT) : groups;
  $('#favList').innerHTML = (fav.length
    ? `${groups.length > 1 ? `<nav class="fav-chips" aria-label="Filtrar por categoria"><button type="button" data-favcat="" aria-pressed="${!FAVCAT}">Todas <i>${fav.length}</i></button>${groups.map(g => `<button type="button" data-favcat="${g.c.slug}" aria-pressed="${FAVCAT === g.c.slug}"><img src="img/cat/${g.c.slug}.webp?v=${CONFIG.thumbV}" alt="">${esc(g.c.name)} <i>${g.ids.length}</i></button>`).join('')}</nav>` : ''}
      ${shown.map(g => `<section class="sec fav-g"><h2><a href="#/c/${g.c.slug}">${esc(g.c.name)}</a><small>${g.ids.length}</small></h2><div class="stickers rise">${g.ids.map((id, i) => thumb(id).replace('<button', `<button style="--i:${i}"`)).join('')}</div></section>`).join('')}`
    : `<div class="blk emptyb"><span class="eh">${HEART}</span><h2>Nenhuma favorita ainda</h2><p class="d">Toque no coração para salvar figurinhas.</p><a class="btn sm" href="#">Explorar figurinhas${icon('i-arrow')}</a></div>`)
    + (rec.length ? `<section class="sec"><h2>Usadas recentemente</h2><div class="stickers">${rec.map(id => thumb(id)).join('')}</div></section>` : '');
};
let FAVCAT = '';
$('#favList').addEventListener('click', e => { const f = e.target.closest('[data-favcat]'); if (f) { FAVCAT = f.dataset.favcat; return renderFavs(); } const b = e.target.closest('[data-id]'); if (b) openId(b.dataset.id); });

// ---------- Perfil tab ----------
// profile v2 (owner 09/11 "melhorar muito a área do perfil"): Instagram-like header, level + progress, badges, access card, grouped lists
const LEVELS = [[0, 'Iniciante'], [10, 'Criadora'], [50, 'Influencer'], [150, 'Diva dos Stories'], [400, 'Lenda']];
window.renderPerfil = () => {
  if (!ME) return;
  const fav = LS('sl_fav', []).filter(id => usable(parse(id))).length, cnt = LS('sl_cnt', 0), days = LS('sl_od', {n: 1}).n, st = streak(LS('sl_days', []));
  const mats = ['agenda', 'magneticos', 'presets', 'animadas'], own = mats.filter(has).length;
  const theme = document.documentElement.dataset.theme === 'dark';
  const li = LEVELS.findLastIndex(l => cnt >= l[0]), lv = LEVELS[li], nx = LEVELS[li + 1];
  const pct = nx ? Math.round(100 * (cnt - lv[0]) / (nx[0] - lv[0])) : 100;
  const pf = LS('sl_pf', {}), name = (RANK && RANK.me.name) || pf.name || ME.name || ME.email.split('@')[0], photo = (RANK && RANK.me.photo) || pf.photo || null;
  const left = ME.basicUntil ? Math.max(0, Math.ceil((new Date(ME.basicUntil) - Date.now()) / 864e5)) : null, total = ME.basicDays || 30;
  const badges = [['🎉', 'Primeira figurinha', cnt >= 1], ['✨', '10 figurinhas', cnt >= 10], ['🔥', '3 dias seguidos', st >= 3], ['💖', 'Primeira favorita', fav >= 1],
    ['🚀', '50 figurinhas', cnt >= 50], ['👑', '7 dias seguidos', st >= 7], ['🎁', 'Convidou amiga', !!(REF && REF.friends)], ['💎', '150 figurinhas', cnt >= 150]];
  const got = badges.filter(b => b[2]).length;
  const row = (ic, label, sub, attrs, tail = icon('i-next', 'chev2')) => `<li><${attrs.startsWith('href') ? 'a' : 'button type="button"'} ${attrs}><span class="li">${icon(ic)}</span><span class="grow">${label}${sub ? `<small>${sub}</small>` : ''}</span>${tail}</${attrs.startsWith('href') ? 'a' : 'button'}></li>`;
  const plan = ME.creator ? 'Creator' : has('vitalicio') ? 'Vitalício' : PREMIUM ? 'Premium' : 'Básico';
  $('#perfil').innerHTML = `<section class="pf">
    <div class="pf-top"><button class="pf-ava" type="button" data-pf-edit aria-label="Trocar foto e nome">${rAva({name, photo})}<i>${icon('i-spark')}</i></button>
      <div class="pf-st"><div><b>${nf.format(cnt)}</b><small>figurinhas</small></div><div><b>${nf.format(fav)}</b><small>favoritas</small></div><div><b>${nf.format(days)}</b><small>${days > 1 ? 'dias' : 'dia'} no app</small></div></div></div>
    <div class="pf-id"><button class="pf-name" type="button" data-pf-edit>${esc(name)}<small>editar</small></button><span class="pf-plan p-${plan === 'Básico' ? 'b' : 'p'}">${plan}</span>${st > 1 ? `<span class="pf-fire">🔥 ${st} dias seguidos</span>` : ''}</div>
    <small class="pf-mail">${esc(ME.email)}</small>
    <div class="pf-lv"><div class="pf-lvh"><span>Nível <b>${lv[1]}</b></span><small>${nx ? `faltam ${nx[0] - cnt} pra ${nx[1]}` : 'nível máximo!'}</small></div><div class="pf-bar"><span style="width:${Math.max(4, pct)}%"></span></div></div>
  </section>
  ${!ME.creator && !has('vitalicio') ? `<button class="pf-acc" type="button" data-vit-open>
    <span class="pf-acc-tx"><small>${left != null ? `Seu acesso vence em ${left} ${left === 1 ? 'dia' : 'dias'}` : 'Acesso vitalício'}</small><b>Garanta o app pra sempre</b>${left != null ? `<span class="pf-bar lt"><span style="width:${Math.max(4, Math.round(100 * left / total))}%"></span></span>` : ''}</span>
    <span class="pf-acc-go">R$ 14,90${icon('i-arrow')}</span></button>` : ''}
  <section class="pf-sec"><div class="pf-h"><h2>Conquistas</h2><small>${got} de ${badges.length}</small></div>
    <div class="pf-bdg">${badges.map(b => `<div class="${b[2] ? 'on' : ''}"><span>${b[0]}</span><small>${b[1]}</small></div>`).join('')}</div></section>
  <section class="pf-sec pf-ref" id="refBlk" ${ME.creator ? 'hidden' : ''}>
    <div class="pf-refh"><span class="pf-gift">${icon('i-gift')}</span><span><b>Convide uma amiga</b><small>${REF ? `Ela compra pelo seu link e vocês duas ganham o Kit Influencer Pro${REF.friends ? ` · ${REF.friends} ${REF.friends === 1 ? 'amiga já comprou' : 'amigas já compraram'}` : ''}` : REF === false ? 'Seu link aparece aqui quando a compra for confirmada' : 'Carregando seu link…'}</small></span></div>
    ${REF ? `<div class="row2"><a class="btn sm" href="https://wa.me/?text=${encodeURIComponent(refMsg())}" target="_blank" rel="noopener" data-ref="wa">WhatsApp</a><button class="btn sm ghost" type="button" data-ref="copy">${icon('i-copy')}Copiar link</button></div><button class="tutlink ghost invite" type="button">Como funciona o presente ${icon('i-arrow')}</button>` : ''}
  </section>
  ${PREMIUM || ME.creator ? '' : `<button class="pf-up" type="button" data-up>${icon('i-gem')}<span><b>Premium</b><small>+8 mil figurinhas, 6 bônus e novidades todo mês</small></span>${icon('i-arrow')}</button>`}
  <p class="pf-g">Seu app</p>
  <ul class="list">
    ${ME.creator ? row('i-arrow','Meu kit e meu link','','href="https://kit-storieslab.vercel.app/#meu-acesso"') : ''}
    ${row('i-book', 'Seus materiais', `${own} de 4 liberados`, 'href="#materiais"')}
    ${rankOn() ? row('i-spark', 'Ranking da semana', RANK && RANK.me.pos ? `Você está em ${RANK.me.pos}º` : 'Nome, foto e sua posição', 'data-rank') : ''}
    ${row('i-gift', `Marque ${IG_AT} e ganhe presente`, 'Poste um Story com as figurinhas', 'class="igb"')}
  </ul>
  <p class="pf-g">Preferências</p>
  <ul class="list">
    <li><button type="button" role="switch" data-theme-switch aria-checked="${theme}"><span class="li">${icon(theme ? 'i-moon' : 'i-sun')}</span><span class="grow">Tema escuro</span><span class="sw" aria-hidden="true"></span></button></li>
    ${canPush() ? row('i-bell', 'Avisos da figurinha do dia', 'Segunda, quarta e sexta', 'class="pushon"') : ''}
    ${matchMedia('(display-mode: standalone)').matches ? '' : row('i-phone', 'Instalar o app', 'Ícone na tela do celular', 'data-install')}
  </ul>
  <p class="pf-g">Ajuda</p>
  <ul class="list">
    ${row('i-play', 'Tutoriais em vídeo', '', 'href="#tutoriais"')}
    ${row('i-spark', 'Ver o tour de novo', '', 'data-tour-start')}
    ${row('i-chat', 'Falar com a gente no Instagram', '', 'href="https://ig.me/m/storieslab.app" target="_blank" rel="noopener"')}
    ${row('i-heart', 'Sugestões e feedback', '', 'data-feedback-open')}
  </ul>
  <ul class="list"><li><button type="button" class="out-btn" id="logout">${icon('i-out')}Sair da conta</button></li></ul>
  <p class="foot">Stories Lab · uso pessoal e comercial nos seus Stories</p>`;
};
document.addEventListener('click', e => { if (e.target.closest('[data-vit-open]')) window.slVitalicio?.(); if (e.target.closest('[data-pf-edit]')) rankEdit('perfil'); if (e.target.closest('[data-install]') && !window.slInstall?.()) location.hash = /iPhone|iPad|iPod|Mac/.test(navigator.userAgent) ? '#tutoriais/instalar-iphone' : '#tutoriais/instalar-android'; });
document.addEventListener('click', e => {
  if (e.target.closest('#logout')) return logout();
  if (e.target.closest('[data-up]')) return openUpsell();
  const sw = e.target.closest('[data-theme-switch]');
  if (sw) setTimeout(() => sw.querySelector('.li').innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'i-moon' : 'i-sun'), 0);
});

// ---------- referral (owner 02/11): friend buys through her link, both get the Kit (granted by the sale webhook) ----------
let REF = null;
const refLink = () => `https://storieslab.shop/?ind=${REF.code}`;
const refMsg = () => `Amiga, tô usando um app com +24 mil figurinhas pro Story, é só copiar e colar. Comprando por esse link a gente ganha o Kit Influencer Pro de presente: ${refLink()}`;
function loadRef() {
  if(ME?.creator){REF=false;return;}
  fetch('/api/ref', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({email: ME.email})})
    .then(r => r.json()).then(r => { REF = r.ok ? r : false; if (!$('#perfil').hidden) renderPerfil(); }).catch(() => {});
}
function refSheet() {
  if (!REF) return false;
  const mine = has('agenda') && has('magneticos') && has('presets') && has('animadas');
  ev('ref_view', String(REF.friends));
  sheet(`<span class="tag">Um convite, um presente</span><h3 id="enTitle">${mine ? 'Sua amiga também<br>merece esse <em>Kit.</em>' : 'Crie com uma amiga.<br>O <em>Kit</em> é para as duas.'}</h3>
    <p class="lead">${mine ? 'Você já tem o Kit Influencer Pro. Compartilhe seu link: quando sua amiga comprar por ele, ela também ganha os quatro materiais.' : 'Compartilhe seu link. Quando sua amiga comprar um plano por ele, vocês duas ganham o Kit Influencer Pro.'}</p>
    <div class="ref-kit"><div>${icon('i-gift')}<b>Kit Influencer Pro</b><span>4 materiais</span></div><ul>${[['agenda','Agenda'],['magneticos','Roteiros'],['presets','Estúdio'],['animadas','Animadas']].map(([id,label])=>`<li><img src="img/material-covers/${id}-preview.webp" alt="" width="80" height="80">${label}</li>`).join('')}</ul></div>
    <div class="ref-how">${icon('i-check')}<span><strong>Presente liberado no app</strong><br>Acesso imediato após a confirmação da compra pelo seu link.</span></div>
    <a class="btn full" href="https://wa.me/?text=${encodeURIComponent(refMsg())}" target="_blank" rel="noopener" data-ref="wa">Convidar no WhatsApp${icon('i-arrow')}</a>
    <button class="alt" type="button" data-ref="copy">${icon('i-copy')}Copiar meu link</button>
    <p class="hint">${REF.friends ? `${REF.friends} ${REF.friends > 1 ? 'amigas já compraram' : 'amiga já comprou'} pelo seu link. ` : ''}O presente é ativado após a compra confirmada.</p>`);
  return true;
}
// shown once, from the second session on (first session is onboarding + Kit offer)
const refPop = () => !LS('sl_refpop', 0) && REF && (SV('sl_refpop', 1), refSheet());
document.addEventListener('click', e => {
  if (e.target.closest('.invite')) return refSheet();
  const b = e.target.closest('[data-ref]');
  if (!b || !REF) return;
  ev('ref_' + b.dataset.ref);
  if (b.dataset.ref === 'copy') navigator.clipboard.writeText(refMsg()).then(() => toast('Link copiado. Cole no WhatsApp ou no Direct da sua amiga.'), () => toast(refLink()));
  if (b.dataset.ref === 'share') navigator.share({text: refMsg()}).catch(() => {});
});

// ---------- Instagram bonus (owner 02/11): Story with our stickers + tag the brand + DM = a gift she picks.
// The gift is sent by hand by the team in the Direct; the app only explains and links to the profile.
const IG = 'storieslab.app', IG_AT = '@' + IG;
function igSheet() {
  ev('ig_view');
  sheet(`<span class="tag">Presente pra você</span><h3 id="enTitle">Marque a gente e ganhe um <em>presente</em></h3>
    <ol class="onb">
      <li><b>1</b><div><strong>Poste um Story com as figurinhas</strong></div></li>
      <li><b>2</b><div><strong>Marque ${IG_AT}</strong><small>No Story, toque em Aa e digite ${IG_AT}, ou use a figurinha de menção.</small></div></li>
      <li><b>3</b><div><strong>Chame a gente no Direct</strong><small>Mande "quero meu presente" e escolha um material: agenda, presets, Stories magnéticos ou figurinhas animadas.</small></div></li>
    </ol>
    <a class="btn full" href="https://ig.me/m/${IG}" target="_blank" rel="noopener" data-ig="dm">Chamar no Direct${icon('i-arrow')}</a>
    <button class="alt" type="button" data-ig="copy">Copiar ${IG_AT}</button>`);
  return true;
}
document.addEventListener('click', e => {
  if (e.target.closest('.igb')) return igSheet();
  const b = e.target.closest('[data-ig]');
  if (!b) return;
  ev('ig_' + b.dataset.ig);
  if (b.dataset.ig === 'copy') navigator.clipboard.writeText(IG_AT).then(() => toast(`${IG_AT} copiado. Cole no seu Story pra marcar a gente.`), () => toast(IG_AT));
});

// ---------- modals queued until the sticker sheet closes (she is copying to paste in the Story) ----------
let pending = [];
let TOUR = null;   // guided tour running: queued pop-ups wait until it ends
const editingPhoto = () => location.hash.startsWith('#/m/presets/editor');
function later(fn) {
  if (TOUR || editingPhoto() || document.querySelector('dialog[open]')) pending.push(fn); else fn();
}
const flush = () => setTimeout(() => { if (!TOUR && !editingPhoto() && !document.querySelector('dialog[open]') && pending.length) pending.shift()(); }, 500);

addEventListener('hashchange',()=>{if(!editingPhoto())flush();});
const dlg = document.createElement('dialog');
dlg.className = 'sheet up engagement-sheet';
dlg.setAttribute('aria-labelledby', 'enTitle');
document.body.append(dlg);
dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
// O que postar hoje? sheet: waitlist button, tap a sticker to open it
dlg.addEventListener('click', e => {
  if (e.target.closest('[data-aiw]')) { SV('sl_aiw', 1); ev('ai_wait', LS('sl_profile', '') || 'rotina'); dlg.querySelector('.aiw').innerHTML = AIW_DONE; return toast('Pronto! Você está na lista.'); }
  const st = e.target.closest('.ist [data-id]');
  if (st) { dlg.close(); openId(st.dataset.id); }
});
function sheet(html) {
  const t = $('#toast'); if (t && dlg.contains(t)) document.body.append(t);   // toast() moves #toast into open dialogs; keep it alive
  dlg.innerHTML = `<div class="in"><div class="grab"></div><button class="x" type="button" data-close aria-label="Fechar"><svg aria-hidden="true"><use href="#i-x"/></svg></button>${html}</div>`;
  open(dlg);
}
window.slSheet = sheet;
window.slLater = fn => later(fn);   // vitalicio.js: waits for tour/editor/open sheets

function confetti() {
  if (reduced) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#D92B63', '#FFD84D', '#F08AA9', '#B88CFF', '#5BD1B4'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % 5]};--dx:${(Math.random() - .5) * 160}px;--rot:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * .35}s`;
    box.append(p);
  }
  (document.querySelector('dialog[open]') || document.body).append(box);
  setTimeout(() => box.remove(), 2600);
}

// ---------- milestones: real rewards for real use ----------
const MILESTONES = [10, 50, 100, 250, 500, 1000];
function milestone(cnt) {
  const done = LS('sl_ms', []);
  if (!MILESTONES.includes(cnt) || done.includes(cnt)) return;
  SV('sl_ms', [...done, cnt]);
  later(() => celebrate(cnt));
}
async function celebrate(cnt) {
  let gift = null;
  if (!PREMIUM) {
    // Básico: a Premium category for free, close to what she uses
    // ponytail: stored on this device only; move to the server if people complain after switching phones
    const near = S.lastCat && S.lastCat.section;
    const pool = CATS.filter(c => c.tier === 'premium' && !c.kind && !GIFT.has(c.slug) && c.count > 0);
    gift = pool.find(c => c.section === near) || pool[0];
    // the CDN only serves a Premium category to Básico accounts once the server recorded the gift (pass flags)
    if (gift) try {
      const r = await fetch('/api/gift', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({slug: gift.slug})}).then(r => r.json());
      if (r.ok) { ME.pass = r.pass; (r.gifts || []).forEach(s => GIFT.add(s)); } else gift = null;
    } catch { gift = null; }
  }
  if (gift) {
    GIFT.add(gift.slug); SV('sl_gift', [...GIFT]);
    renderHome(); renderMine(); ev('gift', gift.slug);
    sheet(`<span class="tag">Presente</span><h3 id="enTitle">Você já usou <em>${nf.format(cnt)}</em> figurinhas!</h3>
      <p class="lead">Pra comemorar, liberamos de presente a categoria <b>${esc(gift.name)}</b> do Premium, com ${nf.format(gift.count)} figurinhas. É sua.</p>
      <div class="gtease">${(gift.cover || []).slice(0, 4).map(s => `<img src="${U(s)}" alt="">`).join('')}</div>
      <a class="btn full" href="#/c/${gift.slug}" data-close>Ver meu presente${icon('i-arrow')}</a>
      <p class="hint">Quer todas as outras? O Premium libera tudo, pra sempre.</p>`);
  } else {
    const st = streak(LS('sl_days', []));
    // 09/11: achievement v2 — medal, streak + level cards, progress to next level
    const li = LEVELS.findLastIndex(l => cnt >= l[0]), lv = LEVELS[li], nx = LEVELS[li + 1], pct = nx ? Math.round(100 * (cnt - lv[0]) / (nx[0] - lv[0])) : 100;
    sheet(`<div class="ach"><div class="ach-medal"><i aria-hidden="true"></i><span aria-hidden="true">🏆</span><b>${nf.format(cnt)}</b></div>
      <h3 id="enTitle">${nf.format(cnt)} figurinhas <em>usadas!</em></h3>
      <p class="lead">Seus Stories estão ficando lindos. Continue assim.</p>
      <div class="ach-row"><div><b>🔥 ${st}</b><small>${st === 1 ? 'dia seguido' : 'dias seguidos'}</small></div><div><b>${lv[1]}</b><small>seu nível</small></div></div>
      ${nx ? `<div class="ach-lv"><span style="width:${Math.max(6, pct)}%"></span></div><small class="ach-nx">Faltam ${nf.format(nx[0] - cnt)} pra virar <b>${nx[1]}</b></small>` : ''}
      <button class="btn full" type="button" data-close>Continuar criando</button></div>`);
  }
  confetti();
}

// ---------- contextual offers (replaces the generic nudge) ----------
const ANGLE = {
  presets: '109 looks para sua foto. Escolha o filtro, ajuste e salve.',
  animadas: '156 figurinhas em movimento, organizadas em 8 temas.',
  agenda: '30 dias com ideias, textos e sequências prontas para postar.',
  magneticos: '60 roteiros com o que mostrar, escrever e perguntar em cada Story.',
};
// best-selling order bumps first (paid sales up to 01/11: agenda 4, animadas 3, magnéticos 2, presets 1);
// each pop-up shows the next one she doesn't own, never the same twice in a row
const BEST = ['agenda', 'animadas', 'magneticos', 'presets'];
function pickOffer() {
  const missing = OFFERS.filter(o => o.feature && !o.bundle && !has(o.feature)).sort((a, b) => BEST.indexOf(a.feature) - BEST.indexOf(b.feature));
  if (!missing.length) return null;
  const last = LS('sl_lastof', ''), i = missing.findIndex(m => m.feature === last);
  const o = missing[(i + 1) % missing.length];
  const kit = missing.length >= 2 ? OFFERS.find(x => x.bundle) : null;
  return {o, kit};
}
function offerSheet(c, why, force) {
  const pick = force ? {o: force, kit: OFFERS.filter(o => o.feature && !o.bundle && !has(o.feature)).length >= 2 ? OFFERS.find(x => x.bundle) : null} : pickOffer(c);
  if (!pick) return false;
  const {o, kit} = pick;
  if (!force) SV('sl_lastof', o.feature);
  ev('offer_view', o.feature);
  sheet(`<span class="tag">Pra você</span><h3 id="enTitle">${esc(o.title)}</h3>
    <p class="lead">${why === 'copy' && c ? `Vi que você curte <b>${esc(c.name)}</b>. ` : ''}${esc(ANGLE[o.feature] || o.sub)}</p>
    ${window.StoriesProducts.art(o.bundle ? 'kit' : o.feature)}
    <a class="btn full" href="${esc(o.buy)}" target="_blank" rel="noopener" data-of="${o.feature}">${esc(o.cta)}${icon('i-arrow')}</a>
    ${kit && !o.bundle ? `<a class="alt" href="${esc(kit.buy)}" target="_blank" rel="noopener" data-of="kit">Ou leve os 4 materiais por R$ 12,90</a>` : ''}
    <p class="hint">Pagamento único. Acesso imediato após a confirmação do pagamento.</p>`);
  return true;
}
window.slOffer = o => offerSheet(null, '', o);
// first session: guided tour on the real UI (owner 02/11: "um onboard literalmente, levando pra cada aba"),
// then 1) profile question, 2) Kit offer, chained through `pending`.
function onboard() {
  if (LS('sl_onb', 0)) return false;
  SV('sl_onb', 1);
  ev('profile', 'onboard');
  tourStart(true);
  return true;
}

// Guided paths on the real app. Never copies, favorites, uploads or saves on behalf of the user.
const sheetEl = $('#sheet');
const tourBox = document.createElement('div');
tourBox.className = 'tour'; tourBox.hidden = true;
tourBox.innerHTML = '<div class="tour-dim"></div><div class="tour-ring" aria-hidden="true"></div>';
const tip = document.createElement('section');
tip.className = 'tour-tip'; tip.setAttribute('role', 'dialog');
tip.setAttribute('aria-labelledby', 'tourT'); tip.setAttribute('aria-describedby', 'tourP');
tourBox.append(tip); document.body.append(tourBox);
const tourVisible = el => !!el && !el.closest('[hidden]') && el.getBoundingClientRect().height > 0;
const tourHasPhoto = () => tourVisible($('#photoWorkspace'));
const tourCanStudio = () => has('presets') || window.ToolTrial?.enabled('presets');
function tourSteps(track) {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /mac/i.test(navigator.platform));
  const pick = $('.today') ? {id:'escolher', chapter:'Sua primeira figurinha', route:'', el:'.today', pick:true,
    t:'Experimente uma de verdade', p:'Toque na figurinha em destaque. Você vai abrir a prévia e ver as opções para usar no seu Story.',
    action:'Abrir figurinha', run:()=>$('.today')?.click(), wait:()=>sheetEl.open} :
    {id:'escolher', chapter:'Sua primeira figurinha', route:'', el:'#list .card:not(.locked)', pick:true,
      t:'Escolha um tema para começar', p:'Abra uma categoria e toque na figurinha que quiser. A próxima etapa aparece quando a prévia abrir.',
      action:'Explorar categoria', run:()=>$('#list .card:not(.locked)')?.click(), wait:()=>sheetEl.open};
  const stickers = [
    {id:'busca',chapter:'Encontre o seu estilo',route:'',el:'.tools .search',t:'Comece pelo que vai postar',p:'Busque “café”, “treino” ou “bom dia”. As categorias reúnem as figurinhas do tema para você escolher.',btn:'Experimentar uma figurinha'},
    pick,
    {id:'copiar',chapter:'Sua primeira figurinha',sheet:'#copy',t:'Copie a figurinha, sem fundo',p:'Toque em Copiar. Se o navegador não permitir, use Baixar / Compartilhar. Você também pode continuar sem copiar agora.',wait:()=>!!TOUR?.copied||!!TOUR?.downloaded,skipLabel:'Continuar sem copiar'},
    {id:'colar',chapter:'Leve para o seu Story',sheet:'#imgActions',t:()=>TOUR?.copied?'Figurinha copiada!':'Agora, use no Instagram',
      p:()=>TOUR?.copied?(ios?'Abra uma foto no Story do Instagram. Toque na ferramenta de texto, segure no campo e escolha “Colar”. Depois, arraste e ajuste o tamanho.':'Abra uma foto no Story do Instagram e tente colar a imagem. Se o teclado não oferecer essa opção, baixe a figurinha e adicione pelo adesivo de Foto/Galeria.'):'Depois de baixar a figurinha, abra sua foto no Story do Instagram e adicione a imagem pelo adesivo de Foto/Galeria. As opções variam conforme o celular.',
      note:'Quer guardar esta figurinha? Toque no coração da prévia.',btn:'Ver minhas favoritas'},
    {id:'favoritas',chapter:'Tudo fácil de encontrar',route:'#favoritas',el:'#tabbar [data-tab=favoritas]',t:'Seu repertório, num só lugar',p:'Esta é a tela de Favoritas. O coração guarda as suas preferidas; as figurinhas usadas recentemente também ajudam você a reencontrar uma escolha.',btn:track==='stickers'?'Concluir':'Conhecer as ferramentas'}
  ];
  const studio = [
    {id:'foto',chapter:'Escolha sua foto',route:'#/m/presets/editor',el:'.photo-studio:not(.has-photo) #photoEmptyPick,.photo-studio.has-photo #photoPick',t:'A edição começa com você',p:'Toque em Escolher minha foto e selecione uma imagem do seu celular. Ela fica neste aparelho. Se preferir, veja o passo a passo sem enviar uma foto agora.',wait:tourHasPhoto,skipLabel:'Ver sem enviar foto'},
    {id:'look',chapter:'Encontre seu look',el:'.photo-looks',t:'Uma foto. Novas possibilidades.',p:'Escolha uma coleção e toque nas miniaturas para comparar suas variações. Cada prévia mostra o efeito na sua própria foto.',note:'Não encontrou o seu estilo? Você pode mudar o look a qualquer momento.'},
    {id:'intensidade',chapter:'Deixe na sua medida',el:'.photo-intensity',t:'Mais sutil ou mais marcante?',p:'Arraste Intensidade: perto de 0, a foto se aproxima da original; perto de 100, o look fica completo. Em Luz e Cor, refine exposição, sombras, temperatura e saturação.',note:'Use Antes / depois para comparar. As setas no topo desfazem e refazem seus ajustes.'},
    {id:'salvar',chapter:'Sua foto pronta',el:'#photoSave',t:'Gostou? Salve a sua versão',p:'O botão Salvar foto prepara a imagem final em JPG, sem recortar a composição. No celular, conclua o salvamento ou compartilhamento na opção que aparecer.',note:'Experimente à vontade antes de salvar. Você decide quando finalizar.',btn:'Concluir e editar'}
  ];
  const full = [...stickers,
    {id:'materiais',chapter:'Seu espaço de criação',route:'#materiais',el:'#mats .vtitle',t:'Uma ferramenta para cada momento',p:'Estúdio para editar fotos, Agenda para planejar, Stories Magnéticos para montar sequências e Animadas para dar movimento.',tiles:['Editar fotos','Planejar conteúdo','Criar sequências','Dar movimento'],btn:'Conhecer o Estúdio'},
    ...(tourCanStudio()?[{id:'estudio',chapter:'Conheça o Estúdio',route:'#/m/presets',el:'.studio-intro',t:'Sua foto, com o seu estilo',p:'Escolha uma foto, explore 12 coleções, ajuste a intensidade e salve o resultado aqui mesmo.',action:'Aprender a editar',run:()=>tourChoose('studio'),btn:'Continuar o tour'}]:[]),
    {id:'perfil',chapter:'Ajuda sempre à mão',route:'#perfil',el:'#tabbar [data-tab=perfil]',t:'Pode voltar aqui quando precisar',p:'No Perfil você encontra seu acesso, os tutoriais e a opção de refazer esta tour. Escolha um caminho diferente para aprender outra função.',btn:'Concluir'}
  ];
  const list = track==='studio' ? studio : track==='stickers' ? stickers : full;
  return [...list,{id:'pronto',chapter:'Do seu jeito, no seu tempo',end:true,t:track==='studio'?'Sua próxima edição começa aqui':'Tudo pronto para criar',p:track==='studio'?'Escolha sua foto e experimente. Você pode testar looks e ajustar a intensidade antes de decidir salvar.':'Explore o app no seu ritmo. Quando quiser rever alguma etapa, abra Perfil → Ver o tour de novo.',btn:track==='studio'?'Ir para o Estúdio':'Começar a criar'}];
}
function tourStart(first) {
  if (TOUR) return;
  const returnFocus = document.activeElement;
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  TOUR = {first,returnFocus,track:null,steps:[],i:0,copied:false,downloaded:false,token:0};
  tourBox.hidden=false; document.body.classList.add('tour-running');
  addEventListener('resize',tourPlace); addEventListener('scroll',tourPlace,{passive:true});
  visualViewport?.addEventListener('resize',tourPlace);
  TOUR.poll=setInterval(tourPoll,250);
  tourWelcome();
}
function tourWelcome() {
  const T=TOUR;if(!T)return;T.track=null;T.el=null;T.token++;
  if(sheetEl.open)sheetEl.close();tourBox.append(tip);tip.classList.remove('inline');tourBox.classList.remove('insheet');
  tip.innerHTML=`<button class="tour-close" data-tour="skip" aria-label="Fechar tour">${icon('i-x')}</button><div class="tour-welcome-icon" aria-hidden="true">${icon('i-spark')}</div><h3 id="tourT" tabindex="-1">O que você quer<br><em>criar hoje?</em></h3><p id="tourP">Escolha o que quer aprender.</p><div class="tour-paths"><button data-tour-path="full"><span>${icon('i-spark')}<b>Conhecer o app</b></span>${icon('i-arrow')}</button><button data-tour-path="stickers"><span>${icon('i-heart')}<b>Usar minha primeira figurinha</b></span>${icon('i-arrow')}</button>${tourCanStudio()?`<button data-tour-path="studio"><span>${icon('i-sun')}<b>Editar uma foto minha</b></span>${icon('i-arrow')}</button>`:''}</div><button class="tour-later" data-tour="skip">Explorar por conta própria</button>`;
  tourPlace();requestAnimationFrame(()=>$('#tourT')?.focus({preventScroll:true}));
}
function tourChoose(track){const T=TOUR;if(!T)return;T.track=track;T.steps=tourSteps(track);T.i=0;tourShow();}
function tourShow() {
  const T=TOUR;if(!T||!T.track)return;
  const s=T.steps[T.i];if(!s)return tourEnd('done');
  const token=++T.token;T.ready=false;
  document.querySelectorAll('.tour-pulse').forEach(x=>x.classList.remove('tour-pulse'));
  if(!s.sheet&&sheetEl.open)sheetEl.close();
  if(s.sheet&&!sheetEl.open){
    if(T.sticker){CUR=T.sticker.c;openSticker(T.sticker.n);}
    else{T.i=T.steps.findIndex(x=>x.pick);return tourShow();}
  }
  if(s.route!==undefined&&location.hash!==s.route){location.hash=s.route;}
  const render=()=>{
    if(TOUR!==T||T.token!==token)return;
    const el=s.sheet?$(s.sheet):s.el?$(s.el):null;
    T.el=tourVisible(el)?el:null;T.ready=true;
    const n=T.steps.length,t=typeof s.t==='function'?s.t():s.t,p=typeof s.p==='function'?s.p():s.p;
    ev('tour',s.id);
    tip.innerHTML=`<button class="tour-close" data-tour="skip" aria-label="Fechar tour">${icon('i-x')}</button><div class="tour-meta"><span>${esc(s.chapter)}</span><b>${T.i+1} / ${n}</b></div><div class="tour-progress" role="progressbar" aria-label="Progresso da tour" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${T.i+1}"><i style="width:${(T.i+1)/n*100}%"></i></div>${s.end?'<div class="tour-complete" aria-hidden="true">✓</div>':''}<h3 id="tourT" tabindex="-1">${esc(t)}</h3><p id="tourP">${esc(p)}</p>${s.tiles?`<div class="tour-tiles">${s.tiles.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}${s.note?`<div class="tour-note">${esc(s.note)}</div>`:''}${s.wait?'<div class="tour-do"><i></i>Toque no destaque para experimentar</div>':''}<div class="tour-act"><button class="tour-back" data-tour="back" aria-label="Voltar uma etapa">${icon('i-back')}</button>${s.action?`<button class="btn" data-tour="act">${esc(s.action)}</button>`:''}<button class="${s.wait||s.action?'tour-sec':'btn'}" data-tour="next">${esc(s.wait?s.skipLabel||'Ver próxima etapa':s.btn||'Continuar')}${s.wait||s.action?'':icon('i-arrow')}</button></div>${s.end?'<button class="tour-later" data-tour="paths">Escolher outro caminho</button>':''}`;
    if(s.sheet){
      T.el=null;tip.classList.add('inline');tip.style.cssText='';
      sheetEl.querySelector('.in').insertBefore(tip,$('#imgActions'));tourBox.classList.add('insheet');
      if(s.sheet!=='#imgActions')el?.classList.add('tour-pulse');
    }else{
      tip.classList.remove('inline');tourBox.append(tip);tourBox.classList.remove('insheet');
      if(T.el&&!T.el.closest('#tabbar'))T.el.scrollIntoView({block:'center',behavior:'instant'});
    }
    tourPlace();requestAnimationFrame(()=>$('#tourT')?.focus({preventScroll:true}));
  };
  // Material screens may load asynchronously. Bound retries still leave a usable guide when offline.
  let tries=0;const settle=()=>{
    if(TOUR!==T||T.token!==token)return;
    if(s.route&&s.el&&!tourVisible($(s.el))&&++tries<12)return setTimeout(settle,150);
    render();
  };setTimeout(settle,180);
}
function tourPlace(){
  const T=TOUR;if(!T||tip.classList.contains('inline'))return;
  const dim=tourBox.querySelector('.tour-dim'),ring=tourBox.querySelector('.tour-ring');
  const vh=visualViewport?.height||innerHeight,top=visualViewport?.offsetTop||0;
  tip.style.maxHeight=Math.max(160,vh-24)+'px';
  const el=tourVisible(T.el)?T.el:null;tourBox.classList.toggle('nohole',!el);
  tip.style.transform='';tip.style.bottom='';
  if(!el){dim.style.clipPath='';tip.style.top=(top+Math.max(12,(vh-tip.offsetHeight)/2))+'px';return;}
  const r=el.getBoundingClientRect(),x1=Math.max(4,r.left-6),x2=Math.min(innerWidth-4,r.right+6),y1=Math.max(top+4,r.top-6),y2=Math.min(top+vh-4,r.bottom+6);
  if(x2<=x1||y2<=y1){T.el=null;return tourPlace();}
  dim.style.clipPath=`polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${x1}px ${y1}px,${x1}px ${y2}px,${x2}px ${y2}px,${x2}px ${y1}px,${x1}px ${y1}px)`;
  Object.assign(ring.style,{left:x1+'px',top:y1+'px',width:x2-x1+'px',height:y2-y1+'px'});
  const h=tip.offsetHeight,below=y2+16,above=y1-h-16;
  tip.style.top=Math.max(top+12,Math.min(top+vh-h-12,below+h<top+vh-12?below:above))+'px';
}
function tourPoll(){
  const T=TOUR;if(!T?.track||!T.ready)return;
  const s=T.steps[T.i];if(!s)return;
  if(sheetEl.open&&s.pick){T.sticker={c:CUR,n:S.n};}
  if(s.sheet&&!sheetEl.open){T.i=T.steps.findIndex(x=>x.id==='favoritas');return tourShow();}
  if(s.wait&&s.wait())return tourNext();
  // The category route is chosen by the user. Keep the first sticker reachable in the fallback path.
  if(s.pick&&!sheetEl.open&&!$('#cat').hidden&&tourVisible($('#stickers .st'))&&T.el!==$('#stickers .st')){T.el=$('#stickers .st');T.el.scrollIntoView({block:'center',behavior:'instant'});tourPlace();}
}
function tourNext(){const T=TOUR;if(!T?.ready)return;T.ready=false;if(T.i>=T.steps.length-1)return tourEnd('done');if(T.steps[T.i].pick&&!sheetEl.open)T.i=T.steps.findIndex(x=>x.id==='favoritas');else T.i++;tourShow();}
function tourEnd(how){
  const T=TOUR;if(!T)return;ev('tour',how);clearInterval(T.poll);T.token++;
  removeEventListener('resize',tourPlace);removeEventListener('scroll',tourPlace);visualViewport?.removeEventListener('resize',tourPlace);
  document.querySelectorAll('.tour-pulse').forEach(x=>x.classList.remove('tour-pulse'));
  tourBox.append(tip);tourBox.hidden=true;document.body.classList.remove('tour-running');TOUR=null;
  if(sheetEl.open)sheetEl.close();
  if(how==='done'){location.hash=T.track==='studio'?'#/m/presets':'';SV('sl_tour_v2',true);}
  if(T.returnFocus?.isConnected&&tourVisible(T.returnFocus))T.returnFocus.focus({preventScroll:true});
  if(T.first){pending.push(welcomeKit);setTimeout(()=>askProfile()||flush(),600);}else flush();
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-tour-start]')){e.preventDefault();ev('tour','replay');return tourStart(false);}
  if(!TOUR)return;
  const path=e.target.closest('[data-tour-path]');if(path)return tourChoose(path.dataset.tourPath);
  const b=e.target.closest('[data-tour]');if(!b)return;
  const action=b.dataset.tour;
  if(action==='skip')return tourEnd('skip');
  if(action==='paths')return tourWelcome();
  if(action==='back'){if(!TOUR.track||TOUR.i===0)return tourWelcome();TOUR.i--;return tourShow();}
  if(action==='act')return TOUR.steps[TOUR.i]?.run?.();
  tourNext();
},true);
document.addEventListener('keydown',e=>{
  if(!TOUR)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();return tourEnd('skip');}
  if(e.key!=='Tab')return;
  const targets=[...tip.querySelectorAll('button,a,input')];
  const el=TOUR.el;if(el){if(el.matches('button,a,input'))targets.push(el);targets.push(...el.querySelectorAll('button,a,input'));}
  if(tip.classList.contains('inline'))targets.push(...sheetEl.querySelectorAll('#copy,#share,#fav'));
  const focusables=[...new Set(targets)].filter(x=>!x.disabled&&tourVisible(x));if(!focusables.length)return;
  e.preventDefault();let i=focusables.indexOf(document.activeElement);i=(i+(e.shiftKey?-1:1)+focusables.length)%focusables.length;focusables[i].focus();
},true);
window.slTour=()=>TOUR;

function welcomeKit() {
  if(ME?.creator)return false;
  if (LS('sl_wkit', 0)) return false;
  SV('sl_wkit', 1);
  const kit = (pickOffer(null) || {}).kit;
  if (!kit) return false;
  ev('offer_view', 'kit');
  sheet(`<span class="tag">Seu acesso está liberado</span><h3 id="enTitle">Quer deixar seus Stories <em>completos</em>?</h3>
    <p class="lead">${esc(kit.sub)}</p>
    ${window.StoriesProducts.art('kit')}
    <a class="btn full" href="${esc(kit.buy)}" target="_blank" rel="noopener" data-of="kit">${esc(kit.cta)}${icon('i-arrow')}</a>
    <button class="alt" type="button" data-close>Agora não, quero ver minhas figurinhas</button>
    <p class="hint">Pagamento único. Acesso imediato após a confirmação do pagamento.</p>`);
  return true;
}
const baseNudge = nudge;
window.nudge = why => {
  if (!ME || TOUR || editingPhoto()) return false;
  // the copy nudge fires while the sticker sheet is still open: show it once the sheet closes
  if (document.querySelector('dialog[open]')) { if (why === 'copy') pending.push(() => window.nudge(why)); return false; }
  // owner 02/11: pop-up every 2 copies instead of the offers rail; capped at 3 a day so the app stays pleasant.
  // Básico alternates the Premium upgrade with the materials; Premium sees the materials in best-seller order.
  const t = dayStr(new Date()), nd = LS('sl_nd', {d: '', n: 0});
  if (nd.d !== t) { nd.d = t; nd.n = 0; }
  if (nd.n >= 3) return true;
  let shown;
  if (!PREMIUM && nd.n % 2 === 0) { SLStorage.setItem('sl_nudge', 0); shown = baseNudge(why); }
  else shown = offerSheet(S.lastCat, why);
  if (shown) { nd.n++; SV('sl_nd', nd); }
  return true;
};


// ---------- onboarding: one question, the app reorganizes around the answer ----------
const PROFILES = [['rotina', 'Rotina e frases'], ['beleza', 'Beleza e autocuidado'], ['moda', 'Moda e minha loja'], ['negocios', 'Meu trabalho ou negócio'],
  ['fitness', 'Treino e saúde'], ['familia', 'Maternidade e família'], ['comida', 'Comida e café'], ['fe', 'Fé']];
function askProfile() {
  if(ME?.creator)return false;
  if (LS('sl_asked', 0)) return false;
  SV('sl_asked', 1);
  sheet(`<span class="tag">Rapidinho</span><h3 id="enTitle">Pra que você mais <em>posta</em>?</h3>
    
    <div class="pick">${PROFILES.filter(([id]) => DATA.sections.some(s => s.id === id)).map(([id, n]) => `<button type="button" class="chip" data-prof="${id}">${n}</button>`).join('')}</div>
    <button class="alt" type="button" data-close>Agora não</button>`);
  return true;
}
function setProfile(id) {
  SV('sl_profile', id);
  DATA.sections.sort((a, b) => (b.id === id) - (a.id === id));
  const chip = $(`#chips [data-sec="${id}"]`);
  if (chip) $('#chips .chip').after(chip);
  renderHome(); renderMine(); ev('profile', id);
  toast('Pronto! Suas categorias favoritas estão no topo.');
}
dlg.addEventListener('click', e => {
  const b = e.target.closest('[data-prof]');
  if (b) { dlg.close(); setProfile(b.dataset.prof); }
});

// ---------- "combina com": related categories inside the sticker sheet ----------
const rel = document.createElement('div');
rel.className = 'rel';
$('#pvHint').after(rel);
function renderRel(c) {
  const same = CATS.filter(x => x.section === c.section && base(x) !== base(c) && !x.kind && !x.twinOf);
  const start = Math.max(same.findIndex(x => x.i > c.i), 0);
  const list = [...same.slice(start), ...same.slice(0, start)].sort((a, b) => locked(a) - locked(b)).slice(0, 5);
  rel.innerHTML = list.length ? `<small>Explore também</small><div class="rel-row">${list.map(x => `<a class="rel-c" href="#/c/${x.slug}" data-rel="${x.slug}"><img src="img/cat/${base(x).slug}.webp?v=${CONFIG.thumbV}" alt="" loading="lazy"><span>${locked(x) ? icon('i-lock') : ''}${esc(x.name)}</span></a>`).join('')}</div>` : '';
}
rel.addEventListener('click', e => {
  const a = e.target.closest('[data-rel]');
  if (!a) return;
  e.preventDefault();
  const x = BY[a.dataset.rel];
  $('#sheet').close(); ev('rel', x.slug);
  locked(x) ? openUpsell(x) : (location.hash = '#/c/' + x.slug);
});

// ---------- web push: "figurinha do dia" reminder, Mon/Wed/Fri (sent by the worker cron) ----------
const VAPID = 'BB95F2GVzvLOGhw8FrpM19iR7ZMNUtjoWNlUtfjblyDxlHmAOHHNupJXxxfCxeGFYGqEk1PHSau3gQtMQegYxSI';
const canPush = () => !ME?.creator && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && Notification.permission === 'default' && !LS('sl_push', 0);
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0));
async function pushOn() {
  try {
    if (await Notification.requestPermission() !== 'granted') { SV('sl_push', 'no'); window.renderPerfil(); return toast('Tudo bem. Você pode ativar depois nas configurações.'); }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: b64u(VAPID)});
    const r = await fetch('/api/push', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({email: ME.email, endpoint: sub.endpoint})});
    if (!r.ok) throw new Error('save ' + r.status);
    SV('sl_push', 1); ev('push'); window.renderPerfil();
    toast('Pronto! Você vai receber a figurinha do dia.');
  } catch (e) {
    console.warn(e);
    toast('Não deu pra ativar os avisos neste celular.');
  }
}
document.addEventListener('click', e => { if (e.target.closest('.pushon')) { if (dlg.open) dlg.close(); pushOn(); } });
// 09/11: the 02/11 tour asked for push; the new tour does not, so 139 of 151 installs never saw the prompt.
// Ask after a copy/download (she just got value), at most 3 times, 3 days apart. iOS needs the tap to come from her.
function pushAsk() {
  const a = LS('sl_pushask', {n: 0, t: 0});
  if (!canPush() || a.n >= 3 || Date.now() - a.t < 3 * 864e5) return;
  SV('sl_pushask', {n: a.n + 1, t: Date.now()});
  ev('push', 'ask');
  later(() => sheet(`<span class="tag">Figurinha do dia</span><h3 id="enTitle">Quer saber quando chegar <em>figurinha nova?</em></h3>
    <p class="lead">A gente te avisa segunda, quarta e sexta com a figurinha do dia. Só isso, sem spam.</p>
    <button class="btn full pushon" type="button">${icon('i-bell')}Ativar avisos</button>
    <button class="alt" type="button" data-close>Agora não</button>`));
}

// ---------- hooks into the main app ----------
// called by the main script after a successful copy / share
window.slUse = kind => {
  if (TOUR && kind === 'copy') TOUR.copied = true;
  if (TOUR && kind === 'down') TOUR.downloaded = true;
  const c = CUR;
  if (!c || !S.n) return;
  if (kind === 'copy' && !TOUR) setTimeout(() => TOUR || toast(`Cole no Story e marque ${IG_AT} pra ganhar um presente`), 2400);
  const id = idOf(c, S.n);
  SV('sl_rec', [id, ...LS('sl_rec', []).filter(x => x !== id)].slice(0, 24));
  const cnt = LS('sl_cnt', 0) + 1;
  SV('sl_cnt', cnt);
  const days = LS('sl_days', []), t = dayStr(new Date());
  if (days[days.length - 1] !== t) SV('sl_days', [...days, t].slice(-90));
  S.lastCat = c;
  ev(kind, c.slug, S.n);
  renderMine();
  milestone(cnt);
  if (kind === 'copy' || kind === 'down') pushAsk();
};

$('#goalBox')?.addEventListener('click', e => {
    if (e.target.closest('[data-post]')) return openPost();
    const b = e.target.closest('[data-id]');
    if (b) openId(b.dataset.id);
  });
$('#mine').addEventListener('click', e => {
    if (e.target.closest('[data-post]')) return openPost();
    const b = e.target.closest('[data-id]');
    if (b) return openId(b.dataset.id);
    onCardClick(e);
  });
const baseInit = init;
window.init = data => {
  const prof = LS('sl_profile', '');
  if (prof) data.sections.sort((a, b) => (b.id === prof) - (a.id === prof));
  const od = LS('sl_od', {n: 0, d: ''}), t = dayStr(new Date());
  if (od.d !== t) SV('sl_od', {n: od.n + 1, d: t});   // days she opened the app (profile stats)
  baseInit(data);
  renderMine();
  loadRef();
  loadRank().then(() => { if (!RANK) return; renderMine(); if (!$('#perfil').hidden) renderPerfil(); });
  ev('open', MODE());
  // first session: show the Kit once (Pix buyers often never return to the checkout tab, so they miss the upsell page);
  // the profile question moves to the next open
  setTimeout(() => later(() => { if (!onboard()) welcomeKit() || askProfile() || profPop() || refPop(); }), 1200);
};

// ---------- weekly ranking (appsrv/src/rank.js, owner 07/11) ----------
// Points come from the server (copies, Studio photos, days used; restarts Monday). Name and photo are chosen by her.
let RANK = null;
const TROPHY = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3M12 13v4M8 20h8M9 17h6"/></svg>';
const rankOn = () => ME && !ME.creator;
const loadRank = () => rankOn() ? fetch('/api/rank').then(r => r.ok ? r.json() : null).then(r => (RANK = r && r.ok && r.me ? r : null)).catch(() => RANK) : Promise.resolve(null);
// 09/11: no-photo avatars get a color per person (position, else name) so a list of "Criadora" isn't all the same pink C
const rAva = (p, cls = '') => `<span class="rava ${cls}"${p.photo ? '' : ` style="--h:${((p.pos || [...(p.name || 'C')].reduce((a, ch) => a + ch.charCodeAt(0), 0)) * 67) % 360}"`}>${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc((p.name || 'C')[0].toUpperCase())}</span>`;
const pts = n => `${nf.format(n)} ${n === 1 ? 'ponto' : 'pontos'}`;
async function openRank() {
  ev('rank_open');
  sheet(`<span class="tag">Ranking da semana</span><h3 id="enTitle">Quem mais <em>criou</em></h3><p class="lead">Carregando…</p>`);
  const r = await loadRank();
  renderMine();
  if (!dlg.open || dlg.querySelector('.rprof')) return;
  if (!r) return sheet(`<span class="tag">Ranking da semana</span><h3 id="enTitle">Quem mais <em>criou</em></h3><p class="lead">Não deu pra carregar agora. Confira a conexão e tente de novo.</p>`);
  const [a, b, c] = r.top, me = r.me;
  const MED = ['', '👑', '🥈', '🥉'];
  const pod = (p, k) => p ? `<div class="p${k}"><i class="rmed" aria-hidden="true">${MED[k]}</i>${rAva(p)}<b>${esc(p.name)}</b><small>${pts(p.pts)}</small><span class="st">${k}º</span></div>` : `<div class="p${k} empty"><span class="rava">?</span><b>&nbsp;</b><small>&nbsp;</small><span class="st">${k}º</span></div>`;
  const youName = me.name || 'Você';
  // 09/11 ranking v2: countdown to Monday, point rules as chips, gap to the next place
  const left = (8 - new Date().getDay()) % 7 || 7, above = me.pos > 1 && r.top.find(p => p.pos === me.pos - 1), gap = above ? above.pts - me.pts + 1 : 0;
  sheet(`<div class="rhead"><span class="tag">Ranking da semana</span><span class="rleft">⏳ ${left === 1 ? 'Termina amanhã' : `Termina em ${left} dias`}</span></div><h3 id="enTitle">Quem mais <em>criou</em></h3>
    <div class="rrules"><span>🖼️ Figurinha <b>1 pt</b></span><span>📸 Foto <b>3 pts</b></span><span>📅 Dia no app <b>5 pts</b></span></div>
    ${r.top.length ? `<div class="rpod">${pod(b, 2)}${pod(a, 1)}${pod(c, 3)}</div>
    ${r.top.length > 3 ? `<ol class="rlist" start="4">${r.top.slice(3).map(p => `<li${p.me ? ' class="me"' : ''}><span class="n">${p.pos}</span>${rAva(p)}<span class="nm">${esc(p.name)}</span><span class="pt">${nf.format(p.pts)} <small>pts</small></span></li>`).join('')}</ol>` : ''}`
    : '<p class="rnone">O ranking desta semana acabou de começar. Use uma figurinha e seja a primeira.</p>'}
    <div class="rme">${rAva({name: youName, photo: me.photo})}<span class="nm"><b>${me.hidden ? 'Você está fora do ranking' : me.pos ? `Você está em ${me.pos}º` : 'Você ainda não pontuou'}</b><small>${me.hidden === 2 ? 'Perfil retirado pela equipe' : me.hidden ? 'Só você vê seus pontos' : me.pos ? `${pts(me.pts)}${gap ? ` · faltam ${nf.format(gap)} pro ${me.pos - 1}º` : me.pos === 1 ? ' · você lidera! 👑' : ''}` : 'Use uma figurinha pra entrar'}</small></span>
      <button class="btn sm ghost" type="button" data-rank-edit>${me.name ? 'Editar' : 'Criar perfil'}</button></div>`);
}
let rkPhoto;
let rkFrom = '';
function rankEdit(from = '') {
  rkFrom = from;
  const me = (RANK && RANK.me) || {}, pf = LS('sl_pf', {});
  rkPhoto = me.photo || pf.photo || null; rkImg = null;
  const name = me.name || pf.name || String(ME.name || '').trim().split(/\s+/)[0] || '';
  const onb = from === 'onb';
  sheet(`<span class="tag">${onb ? 'Novidade no app' : from ? 'Seu perfil' : 'Seu perfil no ranking'}</span><h3 id="enTitle">${onb ? 'Crie seu <em>perfil</em>' : 'Como você quer <em>aparecer?</em>'}</h3>
    ${onb ? '<p class="lead">Coloque seu nome e uma foto. Eles aparecem no seu perfil, nas suas conquistas e no ranking da semana.</p>' : ''}
    <div class="rprof"><div class="rpicw"><span id="rkAva">${rAva({name: name || 'C', photo: rkPhoto})}</span><label class="rpic"><input type="file" accept="image/*" id="rkFile" hidden><small>${rkPhoto ? 'Trocar foto' : 'Pôr foto'}</small></label></div>
      <label class="rname">Seu nome<input id="rkName" maxlength="24" autocomplete="given-name" value="${esc(name)}"></label></div>
    ${me.hidden === 2 ? '' : `<label class="rhide"><input type="checkbox" id="rkHide" ${me.hidden ? 'checked' : ''}> Não aparecer no ranking</label>`}
    <div class="rzoom" id="rkZoom" hidden><small>Arraste a foto pra ajustar</small><input type="range" min="1" max="3" step="0.01" value="1" id="rkZ" aria-label="Zoom da foto"></div>
    <button class="btn full" type="button" data-rank-save>${onb ? 'Criar meu perfil' : 'Salvar'}</button>${onb ? '<button class="alt" type="button" data-close>Agora não</button>' : ''}<p class="hint">Seu e-mail nunca aparece.</p>`);
}
// 09/11 owner: "dispara pra todo mundo criar o perfil com nome e foto". On app open, anyone without a name or a photo
// gets the profile sheet, once a day, up to 4 times. Skipped while the first-session tour runs (onboard() comes first).
function profPop() {
  if (!rankOn()) return false;
  const me = (RANK && RANK.me) || LS('sl_pf', {}), a = LS('sl_profask', {n: 0, t: 0});
  if ((me.name && me.photo) || a.n >= 4 || Date.now() - a.t < 864e5) return false;
  SV('sl_profask', {n: a.n + 1, t: Date.now()});
  ev('profile', 'ask');
  rankEdit('onb');
  return true;
}
// square crop, 128 px JPEG (~6 KB): small enough for the ranking list, stored on the server
// 09/11: adjustable crop. Drag the circle to move, slider to zoom; the 128 px JPEG is redrawn on each change
let rkImg = null, rkCut = {z: 1, x: 0, y: 0};
function rankDraw() {
  const img = rkImg, cv = $('#rkCv');
  if (!img || !cv) return;
  const s = Math.min(img.width, img.height) / rkCut.z, mx = (img.width - s) / 2, my = (img.height - s) / 2;
  rkCut.x = Math.max(-mx, Math.min(mx, rkCut.x)); rkCut.y = Math.max(-my, Math.min(my, rkCut.y));
  const g = cv.getContext('2d'); g.drawImage(img, mx + rkCut.x, my + rkCut.y, s, s, 0, 0, 128, 128);
  rkPhoto = cv.toDataURL('image/jpeg', 0.82);
}
async function rankPic(file) {
  const img = await createImageBitmap(file).catch(() => null);
  if (!img) return toast('Não deu pra abrir essa foto. Tente outra.');
  rkImg = img; rkCut = {z: 1, x: 0, y: 0};
  $('#rkAva').innerHTML = '<span class="rava rcv"><canvas id="rkCv" width="128" height="128"></canvas></span>';
  $('#rkZoom').hidden = false; $('#rkZ').value = 1;
  $('.rpic small').textContent = 'Trocar foto';
  rankDraw();
  const cv = $('#rkCv'); let p0 = null;
  cv.onpointerdown = e => { p0 = {x: e.clientX, y: e.clientY, cx: rkCut.x, cy: rkCut.y}; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (!p0) return; const k = Math.min(img.width, img.height) / rkCut.z / cv.clientWidth; rkCut.x = p0.cx - (e.clientX - p0.x) * k; rkCut.y = p0.cy - (e.clientY - p0.y) * k; rankDraw(); };
  cv.onpointerup = cv.onpointercancel = () => { p0 = null; };
}
dlg.addEventListener('input', e => { if (e.target.id === 'rkZ') { rkCut.z = +e.target.value; rankDraw(); } });
async function rankSave(btn) {
  const name = $('#rkName').value.trim();
  if (name.length < 2) return toast('Escreva seu nome.');
  btn.disabled = true;
  const r = await fetch('/api/rank/profile', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({name, photo: rkPhoto, hidden: !!$('#rkHide')?.checked})}).then(r => r.json()).catch(() => ({}));
  btn.disabled = false;
  if (!r.ok) return toast('Não deu pra salvar agora. Tente de novo.');
  toast('Perfil salvo');
  SV('sl_pf', {name, photo: rkPhoto});
  if (RANK && RANK.me) Object.assign(RANK.me, {name, photo: rkPhoto});
  if (rkFrom === 'onb') { dlg.close(); renderMine(); if (!$('#perfil').hidden) renderPerfil(); ev('profile', 'done'); toast('Perfil criado!'); }
  else if (rkFrom === 'perfil') { dlg.close(); renderPerfil(); } else openRank();
}
dlg.addEventListener('click', e => {
  if (e.target.closest('[data-rank-edit]')) return rankEdit();
  const s = e.target.closest('[data-rank-save]');
  if (s) rankSave(s);
});
dlg.addEventListener('change', e => { if (e.target.id === 'rkFile' && e.target.files[0]) rankPic(e.target.files[0]); });
document.addEventListener('click', e => { if (e.target.closest('[data-rank]')) openRank(); });

const baseShowCat = showCat;
window.showCat = c => {
  baseShowCat(c);
  const seen = LS('sl_seen', []);
  if (!seen.includes(c.slug)) SV('sl_seen', [...seen, c.slug]);
  SV('sl_rcat', [base(c).slug, ...LS('sl_rcat', []).filter(x => x !== base(c).slug)].slice(0, 12));
  ev('cat', c.slug);
};

// favorite button in the sticker sheet
const favBtn = document.createElement('button');
favBtn.className = 'fav'; favBtn.type = 'button'; favBtn.id = 'fav';
favBtn.setAttribute('aria-label', 'Salvar nas favoritas'); favBtn.innerHTML = HEART;
$('.pvinfo').append(favBtn);
favBtn.onclick = () => {
  if (!CUR || !S.n) return;
  const id = idOf(CUR, S.n), fav = LS('sl_fav', []), on = !fav.includes(id);
  SV('sl_fav', on ? [id, ...fav].slice(0, 200) : fav.filter(x => x !== id));
  favBtn.setAttribute('aria-pressed', on);
  favBtn.classList.remove('pop'); void favBtn.offsetWidth; if (on) favBtn.classList.add('pop');
  toast(on ? 'Salva nas favoritas.' : 'Removida das favoritas.');
  if (on) ev('fav', CUR.slug);
  if (!$('#favs').hidden) window.renderFavs();
};
const baseOpenSticker = openSticker;
window.openSticker = n => {
  if (!CUR || !CUR.fileSet?.has(n)) return;
  baseOpenSticker(n);
  renderRel(CUR);
  favBtn.hidden = false;
  favBtn.setAttribute('aria-pressed', LS('sl_fav', []).includes(idOf(CUR, n)));
};
const baseOpenLink = openLinkSheet;
window.openLinkSheet = (c, n) => { baseOpenLink(c, n); favBtn.hidden = true; rel.innerHTML = ''; };

// sticker opened from the home rows / favorites: forget the category when the sheet closes
$('#sheet').addEventListener('close', () => { if ($('#cat').hidden) CUR = null; flush(); });
$('#up').addEventListener('close', flush);
dlg.addEventListener('close', flush);

const baseUpsell = openUpsell;
window.openUpsell = c => { baseUpsell(c); ev('up_view', c ? c.slug : ''); };
$('#upCta').addEventListener('click', () => ev('up_click'));
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-of]');
  if (a) ev('offer_click', a.dataset.of);
});

// Cached data may initialize before this script loads.
if(S.booted) renderMine();
window.SL = {streak, upcoming, easter, daily, featured, renderMine};   // for the e2e check
})();

// 09/11: on phones the keyboard lifts the bottom menu over the search results; hide it while a text field has focus
document.addEventListener('focusin', e => { if (e.target.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea')) document.body.classList.add('kbd'); });
document.addEventListener('focusout', () => setTimeout(() => { if (!document.activeElement?.matches('input, textarea')) document.body.classList.remove('kbd'); }, 50));

// owner 09/11: categories with several cover photos rotate every 2 s (img/cat/<slug>__<n>.webp, made by app-tools/capas-rot/build.py)
const COVER_ROT = {"ferias-e-viagem": 12, "ferias-e-viagem-premium": 12, "final-de-semana": 6, "casal-e-amor": 10, "dia-dos-namorados": 3, "campo-e-roca": 6, "boss": 4, "pets": 2, "pets-premium": 2, "moda-praia": 2, "fitness": 2, "feliz-aniversario": 2, "lei-da-atracao": 4, "maternidade": 2, "maternidade-premium": 2, "mae": 3, "dia-das-maes": 3, "familia": 3, "dia-dos-pais": 2, "copa-do-mundo": 2, "me-mimei": 2, "tbt": 3, "blogueira": 3, "blogueira-premium": 3};
setInterval(() => {
  if (document.hidden) return;
  document.querySelectorAll('img[src*="img/cat/"]').forEach(img => {
    const a = img.getAttribute('src'), m = a.match(/img\/cat\/([a-z0-9-]+?)(?:__(\d+))?\.webp/), n = m && COVER_ROT[m[1]];
    if (!n) return;
    const r = img.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
    const k = (+(m[2] || 1)) % n + 1, src = a.replace(m[0], `img/cat/${m[1]}${k > 1 ? '__' + k : ''}.webp`), pre = new Image();
    pre.onload = () => { img.src = src; }; pre.src = src;
  });
}, 2000);
