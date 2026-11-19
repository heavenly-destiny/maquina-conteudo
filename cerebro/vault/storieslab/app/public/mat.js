// Paid materials, used inside the app (owner 02/11: "as entregas tem que ser todas dentro do app").
// Tab "Materiais": owned first, locked ones after with their offer. Each material opens its own screen:
//   #/m/agenda/<dia>        30-day reader (Dia 4 de 30), "hoje é o dia X", done marks, frases + enquetes
//   #/m/magneticos/<n>      60 roteiros by chapter (Roteiro 12 de 60), intro + checklist
//   #/m/animadas/<tema>     animated stickers by theme + green-screen videos, share/download the GIF
//   #/m/presets/<look>      109 looks with a before/after slider, .xmp / .cube download, step-by-step tutorial
// Files live on storieslab-cdn-4 under /mat/ (staged by app-tools/materiais.py into cdn/b4/mat), served here at /m/mat/.
// Uses the main script's globals (ME, OFFERS, has, view, open, toast, shareFile, icon, esc, nf, $...).
(() => {
const MAT_V = 3;   // bump after redeploying cdn-4 with changed files (its _headers cache them as immutable)
const M = p => `/m/mat/${p}?v=${MAT_V}${typeof ME !== 'undefined' && ME && ME.pass ? '&p=' + ME.pass : ''}`;   // pass: cdn/gate.js
const LS = (k, d) => { try { return JSON.parse(SLStorage.getItem(k)) ?? d; } catch { return d; } };
const SV = (k, v) => { try { SLStorage.setItem(k, JSON.stringify(v)); } catch {} };
const pad2 = n => String(n).padStart(2, '0');
const ev = (e, k) => window.slEv?.(e, k);
const KEYS = ['animadas', 'agenda', 'magneticos', 'presets'];
const INFO = {
  animadas: {name: 'Figurinhas Animadas', sub: '156 figurinhas · 8 temas'},
  agenda: {name: 'Agenda de Conteúdo', sub: '30 dias de ideias'},
  magneticos: {name: 'Stories Magnéticos', sub: '60 roteiros para Stories'},
  presets: {name: 'Estúdio de Fotos', sub: '12 coleções de filtros'},
  letras: {name: 'Figurinhas com a sua frase', sub: '20 fontes exclusivas'},
  perfil: {name: 'Aumente seus seguidores', sub: 'Método prático em 21 dias'},
  reels: {name: 'Reels com ideias prontas', sub: '60 roteiros'},
};
// owner 18/11: checkout bumps; shown only to who bought them (no in-app offer)
const EXTRA = ['letras', 'perfil', 'reels'];
const offer = k => OFFERS.find(o => o.feature === k) || {};
const IDX = {};
const load = p => (IDX[p] ||= p === 'letras' ? Promise.resolve({}) : fetch(p === 'presets' ? 'preset-gallery.json?v=theme-1' : EXTRA.includes(p) ? `/api/mat?k=${p}` : M(`${p}/index.json`), {credentials: 'same-origin'}).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(e => { delete IDX[p]; throw e; }));
const box = () => $('#mat');
const copyText = t => navigator.clipboard.writeText(t).then(() => toast('Texto copiado.'), () => toast('Não deu pra copiar aqui.'));
const head = (title, sub, extra = '', back = '#materiais') => `<div class="vh"><a class="iconbtn" href="${back}" aria-label="${back === '#materiais' ? 'Voltar para Materiais' : 'Voltar para os looks'}">${icon('i-back')}</a><div class="grow"><h1>${title}</h1>${sub ? `<small>${sub}</small>` : ''}</div>${extra}</div>`;
const anim = (el, dir) => { if (reduced || !el) return; el.classList.remove('sl-l', 'sl-r'); void el.offsetWidth; el.classList.add(dir > 0 ? 'sl-l' : 'sl-r'); };
let STEP = null;   // current reader's prev/next, used by the swipe and the buttons

// ---------- progress line shown on the hub card ----------
function progress(k) {
  if (k === 'agenda') { const s = LS('sl_ag', {}); return {t: `Dia ${s.last || 1} de 30`, p: (s.done || []).length / 30}; }
  if (k === 'magneticos') { const s = LS('sl_mg', {}); return {t: `Roteiro ${s.last || 1} de 60`, p: (s.done || []).length / 60}; }
  if (k === 'animadas') return {t: '8 temas · 156 figurinhas'};
  if (k === 'perfil') { const s = LS('sl_pf', {}); return {t: `Dia ${s.last || 1} de 21`, p: (s.done || []).length / 21}; }
  if (k === 'reels') { const s = LS('sl_rl', {}); return {t: `Reel ${s.last || 1} de 60`, p: (s.done || []).length / 60}; }
  if (k === 'letras') return {t: '20 fontes · 5 estilos'};
  return {t: '109 looks e variações'};
}

// ---------- hub ----------
function hub() {
  const own = [...EXTRA, ...KEYS].filter(has), miss = KEYS.filter(k => !has(k));
  const kit = miss.length >= 2 && OFFERS.find(o => o.bundle);
  const cardOf = k => {
    const o = offer(k), trial=!has(k)&&window.ToolTrial?.enabled(k), lk = !has(k)&&!trial, pr = progress(k);
    return `<a class="mcard${lk ? ' locked' : ''}" href="#/m/${k}" data-mat="${k}">
      <span class="mcov">${window.StoriesProducts.art(k)}</span>
      <span class="mtx"><b>${INFO[k].name}</b>${lk ? `<small>${INFO[k].sub}</small>` : ''}
        ${lk ? `<span class="mprice">${esc(o.cta || 'Ver oferta')}${icon('i-arrow')}</span>` : trial?`${window.ToolTrial.badge(k)}<small>Cota diária grátis. Acesso ilimitado vendido à parte.</small><span class="btn sm">Abrir${icon('i-arrow')}</span>`:`<span class="mprog"><span>${pr.t}</span>${pr.p != null ? `<i style="--p:${Math.round(pr.p * 100)}%"></i>` : ''}</span><span class="btn sm">Abrir${icon('i-arrow')}</span>`}</span></a>`;
  };
  $('#mats').innerHTML = `<div class="vtitle"><h1>Seus <em class="ac">materiais</em></h1></div>
    ${own.length ? `<div class="mlist rise">${own.map((k, i) => cardOf(k).replace('class="mcard', `style="--i:${i}" class="mcard`)).join('')}</div>` : ''}
    ${miss.length ? `<section class="sec"><h2>${own.length ? 'Mais ferramentas para você' : 'Suas ferramentas'}</h2><div class="mlist">${miss.map(cardOf).join('')}</div></section>` : ''}
    ${kit ? `<a class="kitb product-kit-card" href="${esc(kit.buy)}" target="_blank" rel="noopener" data-of="kit">${window.StoriesProducts.art('kit')}<span class="product-kit-copy"><b>Seu kit de criação.</b><small>Estúdio + Animadas + Agenda + Roteiros</small><span class="btn sm">Os 4 por R$ 12,90${icon('i-arrow')}</span></span></a>` : ''}`;
}
$('#mats').addEventListener('click', e => {
  const a = e.target.closest('[data-mat]');
  if (a && !has(a.dataset.mat)&&!window.ToolTrial?.enabled(a.dataset.mat)) { e.preventDefault(); window.slOffer?.(offer(a.dataset.mat)); }
});

// ---------- route ----------
let matRequest = 0;
window.matRoute = h => {
  const request = ++matRequest;
  if (h === '#materiais') { hub(); view('mats'); return true; }
  const m = h.match(/^#\/m\/(\w+)(?:\/([\w-]+))?/);
  if (!m || !KEYS.includes(m[1]) && !EXTRA.includes(m[1])) return false;
  if (!has(m[1])&&!window.ToolTrial?.enabled(m[1])) { hub(); view('mats'); setTimeout(() => window.slOffer?.(offer(m[1])), 350); return true; }
  const [, k, arg] = m;
  if (box().dataset.k !== k) { box().dataset.k = k; box().innerHTML = head(INFO[k].name, 'Carregando…') + '<div class="mload sk"></div>'; }
  view('mat');
  ev('mat', k + (arg ? '/' + arg : ''));
  load(k).then(d => { if(request===matRequest && location.hash===h) R[k](d, arg); }).catch(() => {
    if(request!==matRequest || location.hash!==h) return;
    box().innerHTML = head(INFO[k].name, '') + `<div class="blk emptyb"><h2>Não deu pra abrir agora</h2><p class="d">Confira sua internet e tente de novo.</p><button class="btn sm" type="button" data-retry>Tentar de novo</button></div>`;
  });
  return true;
};
box().addEventListener('click', e => {
  if (e.target.closest('[data-retry]')) return route();
  const dk = e.target.closest('[data-chkdark]');
  if (dk) { setChkDark(!document.body.classList.contains('chkdark')); dk.setAttribute('aria-pressed', document.body.classList.contains('chkdark')); return; }
  const c = e.target.closest('[data-copy]');
  if (c) return copyText(c.dataset.copy);
  const s = e.target.closest('[data-step]');
  if (s && STEP) STEP(+s.dataset.step);
});
// swipe left/right on a reader changes day / roteiro / look
let sx = null, sy = 0;
box().addEventListener('touchstart', e => { sx = e.target.closest('.ba,.phs,.dstrip,.chips,.hrow,input,select,textarea') ? null : e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
box().addEventListener('touchend', e => {
  if (sx == null || !STEP) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) STEP(dx < 0 ? 1 : -1);
  sx = null;
}, {passive: true});
const setHash = h => history.replaceState(null, '', h);
const strip = (items, cur) => `<nav class="dstrip" aria-label="Navegar">${items.map(([id, label, done]) => `<a href="${id}" class="${done ? 'done' : ''}"${id === cur ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>`;
const centerStrip = () => requestAnimationFrame(() => { const a = box().querySelector('.dstrip [aria-current]'); a?.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'instant'}); });
const seqHTML = (list, startN = 1) => `<ol class="seq">${list.map((s, i) => `<li><span class="sn">${startN + i}</span><div>
  <p class="sh"><b>Mostre</b>${esc(s.show)}</p>
  ${s.text ? `<div class="tt"><span><b>Texto na tela</b>“${esc(s.text)}”</span><button class="cbtn" type="button" data-copy="${esc(s.text)}" aria-label="Copiar texto">${icon('i-copy')}</button></div>` : ''}
  ${s.sticker ? `<p class="sk2">${icon('i-spark')}${esc(s.sticker)}</p>` : ''}</div></li>`).join('')}</ol>`;
const navHTML = (prevOk, nextOk, doneOn, doneLabel) => `<div class="rnav">
  <button class="iconbtn" type="button" data-step="-1" aria-label="Anterior"${prevOk ? '' : ' disabled'}>${icon('i-back')}</button>
  <button class="btn ${doneOn ? 'ink' : 'ghost'} sm donebtn" type="button" data-done aria-pressed="${doneOn}">${icon('i-check')}${doneOn ? 'Feito' : doneLabel}</button>
  <button class="iconbtn" type="button" data-step="1" aria-label="Próximo"${nextOk ? '' : ' disabled'}>${icon('i-next')}</button></div>`;
const pdfLink = (file, label) => !has(file.split('/')[0])&&window.ToolTrial?.enabled(file.split('/')[0])?`<button type="button" class="dl2" data-trial-offer="${file.split('/')[0]}">Liberar material completo</button>`:`<a class="dl2" href="${M(file)}" download>${icon('i-down')}${label}</a>`;

// ---------- Agenda ----------
const R = {};
const dayIdx = s => { const t0 = Date.parse((s.start || new Date().toISOString().slice(0, 10)) + 'T12:00:00'); return Math.min(30, Math.max(1, Math.floor((Date.now() - t0) / 864e5) + 1)); };
R.agenda = (d, arg) => {
  const s = LS('sl_ag', {done: []});
  if (!s.start) { s.start = new Date().toISOString().slice(0, 10); SV('sl_ag', s); }
  const today = dayIdx(s);
  const cur = arg === 'frases' || arg === 'enquetes' ? arg : Math.min(30, Math.max(1, +arg || s.last || today));
  if(window.ToolTrial?.readerGate(box(),'agenda','day:'+cur,'Agenda de Conteúdo','#materiais'))return;
  const items = [...d.days.map((x, i) => [`#/m/agenda/${i + 1}`, pad2(i + 1), (s.done || []).includes(i + 1)]), ['#/m/agenda/frases', 'Frases'], ['#/m/agenda/enquetes', 'Enquetes']];
  let body;
  if (typeof cur === 'number') {
    s.last = cur; SV('sl_ag', s);
    const x = d.days[cur - 1], ty = d.types[x.type] || {label: x.type, color: '#B8204F'}, done = (s.done || []).includes(cur);
    body = `<article class="rcard" id="rc">
      <div class="rtop"><span class="dnum">${pad2(cur)}</span><span><span class="rtag" style="--c:${ty.color}">${esc(ty.label)}</span><h2>${esc(x.theme)}</h2></span></div>
      <p class="why">${esc(x.why)}</p>
      <h3 class="rh">Sequência de hoje<small>${x.seqs.length} stories</small></h3>${seqHTML(x.seqs)}
      ${x.cta ? `<div class="tip"><b>Chamada final</b>${esc(x.cta)}<button class="cbtn" type="button" data-copy="${esc(x.cta)}" aria-label="Copiar chamada">${icon('i-copy')}</button></div>` : ''}
      ${(x.nichos || []).length ? `<details class="nich"><summary>Adaptar pro seu nicho${icon('i-chev', 'chev')}</summary>${x.nichos.map(n => `<p><b>${esc(n.tag)}</b>${esc(n.note)}</p>`).join('')}</details>` : ''}
    </article>${navHTML(cur > 1, true, done, 'Marcar como feito')}`;
    STEP = dir => { const n = cur + dir; if (n < 1) return; go(n > 30 ? '#/m/agenda/frases' : `#/m/agenda/${n}`, dir); };
  } else {
    const list = cur === 'frases' ? d.frases.map(f => ({text: f})) : d.enquetes;
    body = `<article class="rcard" id="rc"><h2 class="rt2">${cur === 'frases' ? 'Frases prontas' : 'Ideias de enquete e caixinha'}</h2>
      <p class="why">${cur === 'frases' ? 'Pros dias em que a cabeça não ajuda: escreva por cima de uma foto sua, do seu espaço ou do produto.' : 'Interação puxa conversa. Use uma nos dias mais parados.'}</p>
      <ul class="clist">${list.map(f => `<li>${f.kind ? `<span class="rtag">${esc(f.kind)}</span>` : ''}<span>${esc(f.text)}</span><button class="cbtn" type="button" data-copy="${esc(f.text)}" aria-label="Copiar">${icon('i-copy')}</button></li>`).join('')}</ul></article>`;
    STEP = dir => go(cur === 'frases' ? (dir > 0 ? '#/m/agenda/enquetes' : '#/m/agenda/30') : dir < 0 ? '#/m/agenda/frases' : null, dir);
  }
  const done = (s.done || []).length;
  box().innerHTML = head('Agenda de Conteúdo', typeof cur === 'number' ? `Dia ${cur} de 30 · ${done} ${done === 1 ? 'feito' : 'feitos'}` : 'Bônus')
    + `<div class="pbar" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="30" aria-label="Dias feitos"><i style="--p:${done / 30 * 100}%"></i></div>`
    + (cur !== today ? `<a class="todayb" href="#/m/agenda/${today}">${icon('i-spark')}Hoje é o dia ${today}<span>Ir pra ele</span></a>` : '')
    + strip(items, typeof cur === 'number' ? `#/m/agenda/${cur}` : `#/m/agenda/${cur}`) + body
    + `<div class="matfoot">${pdfLink('agenda/agenda-de-conteudo.pdf', 'Baixar o PDF da agenda')}</div>`;
  box().insertAdjacentHTML('beforeend',`<a class="tutlink" href="#tutoriais/${location.hash.includes('magneticos')?'roteiros':'agenda'}">Ver tutorial em vídeo ↗</a>`);
  centerStrip();
  box().querySelector('[data-done]')?.addEventListener('click', () => {
    const st = LS('sl_ag', {done: []}), on = !(st.done || []).includes(cur);
    st.done = on ? [...(st.done || []), cur] : st.done.filter(n => n !== cur); SV('sl_ag', st);
    if (on) { toast(cur < 30 ? `Dia ${cur} feito! Amanhã tem o dia ${cur + 1}.` : 'Você fechou os 30 dias!'); ev('mat_done', 'agenda/' + cur); }
    R.agenda(d, String(cur));
  });
};

// ---------- Magnéticos ----------
R.magneticos = (d, arg) => {
  const s = LS('sl_mg', {done: [], chk: []});
  const all = d.chapters.flatMap((c, ci) => c.scripts.map(x => ({...x, ci})));
  const cur = arg === 'inicio' || arg === 'checklist' ? arg : Math.min(60, Math.max(1, +arg || s.last || 1));
  if(cur!=='inicio'&&cur!=='checklist'&&window.ToolTrial?.readerGate(box(),'magneticos','script:'+cur,'Stories Magnéticos','#materiais'))return;
  const chapItems = [['#/m/magneticos/inicio', 'Como funciona'], ...d.chapters.map((c, i) => [`#/m/magneticos/${c.scripts[0].n}`, `${i + 1}. ${c.title}`]), ['#/m/magneticos/checklist', 'Checklist']];
  const curChap = typeof cur === 'number' ? `#/m/magneticos/${d.chapters[all[cur - 1].ci].scripts[0].n}` : `#/m/magneticos/${cur}`;
  let body, sub;
  if (typeof cur === 'number') {
    s.last = cur; SV('sl_mg', s);
    const x = all[cur - 1], ch = d.chapters[x.ci], done = (s.done || []).includes(cur);
    sub = `Roteiro ${cur} de 60 · ${(s.done || []).length} feitos`;
    body = `<article class="rcard" id="rc">
      <p class="kick">Capítulo ${x.ci + 1} · ${esc(ch.title)}</p>
      <div class="rtop"><span class="dnum">${pad2(cur)}</span><span><span class="rtag">${x.stories.length} stories</span><h2>${esc(x.title)}</h2></span></div>
      <p class="why"><b>Objetivo:</b> ${esc(x.goal)}</p>
      ${seqHTML(x.stories)}
      ${x.dica ? `<div class="tip"><b>Dica</b>${esc(x.dica)}</div>` : ''}
    </article>${navHTML(cur > 1, cur < 60, done, 'Marcar como usado')}
    <div class="rnums">${ch.scripts.map(y => `<a href="#/m/magneticos/${y.n}"${y.n === cur ? ' aria-current="true"' : ''} class="${(s.done || []).includes(y.n) ? 'done' : ''}">${y.n}</a>`).join('')}</div>`;
    STEP = dir => { const n = cur + dir; if (n >= 1 && n <= 60) go(`#/m/magneticos/${n}`, dir); };
  } else if (cur === 'inicio') {
    sub = 'A lógica dos roteiros';
    body = `<article class="rcard" id="rc"><h2 class="rt2">A lógica de uma sequência magnética</h2>
      ${d.intro.lead.split('\n\n').map(p => `<p class="why">${esc(p)}</p>`).join('')}
      <ol class="seq">${d.intro.steps.map((x, i) => `<li><span class="sn">${i + 1}</span><div><p class="sh"><b>${esc(x.name)}</b>${esc(x.text)}</p></div></li>`).join('')}</ol>
      ${(d.intro.howto || []).length ? `<h3 class="rh">Como usar</h3><ul class="bul">${d.intro.howto.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <a class="btn full" href="#/m/magneticos/1">Começar pelo roteiro 1${icon('i-arrow')}</a></article>`;
    STEP = dir => dir > 0 && go('#/m/magneticos/1', 1);
  } else {
    sub = 'Antes de postar';
    const chk = new Set(s.chk || []);
    body = `<article class="rcard" id="rc"><h2 class="rt2">Checklist da sequência</h2><p class="why">Marque o que já fez.</p>
      ${d.checklist.map((g, gi) => `<h3 class="rh">${esc(g.group)}</h3><ul class="checks">${g.items.map((t, i) => `<li><label><input type="checkbox" data-chk="${gi}-${i}"${chk.has(`${gi}-${i}`) ? ' checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>`).join('')}
      <button class="alt" type="button" data-chk-reset>Limpar marcações</button></article>`;
    STEP = dir => dir < 0 && go('#/m/magneticos/60', -1);
  }
  box().innerHTML = head('Stories Magnéticos', sub)
    + `<div class="pbar"><i style="--p:${(s.done || []).length / 60 * 100}%"></i></div>`
    + strip(chapItems, curChap) + body
    + `<div class="matfoot">${pdfLink('magneticos/stories-magneticos.pdf', 'Baixar o PDF dos roteiros')}</div>`;
  box().insertAdjacentHTML('beforeend',`<a class="tutlink" href="#tutoriais/${location.hash.includes('magneticos')?'roteiros':'agenda'}">Ver tutorial em vídeo ↗</a>`);
  centerStrip();
  box().querySelector('[data-done]')?.addEventListener('click', () => {
    const st = LS('sl_mg', {done: []}), on = !(st.done || []).includes(cur);
    st.done = on ? [...(st.done || []), cur] : st.done.filter(n => n !== cur); SV('sl_mg', st);
    if (on) { toast('Roteiro concluído.'); ev('mat_done', 'magneticos/' + cur); }
    R.magneticos(d, String(cur));
  });
  box().querySelectorAll('[data-chk]').forEach(i => i.addEventListener('change', () => {
    const st = LS('sl_mg', {}); const set = new Set(st.chk || []);
    i.checked ? set.add(i.dataset.chk) : set.delete(i.dataset.chk); st.chk = [...set]; SV('sl_mg', st);
  }));
  box().querySelector('[data-chk-reset]')?.addEventListener('click', () => { const st = LS('sl_mg', {}); st.chk = []; SV('sl_mg', st); R.magneticos(d, 'checklist'); });
};
function go(h, dir) {
  if (!h) return;
  setHash(h);
  window.matRoute(h);
  anim($('#rc'), dir);
  scrollTo({top: 0, behavior: 'instant'});
}


// ---------- Reels com ideias prontas (bump 18/11) ----------
R.reels = (d, arg) => {
  const s = LS('sl_rl', {done: []}), N = d.items.length;
  const cur = arg === 'inicio' ? arg : Math.min(N, Math.max(1, +arg || s.last || 1));
  const chap = n => d.chapters.find(c => n >= c.from && n <= c.to);
  const items = [['#/m/reels/inicio', 'Como usar'], ...d.chapters.map((c, i) => [`#/m/reels/${c.from}`, `${i + 1}. ${c.title}`])];
  let body, sub;
  if (cur === 'inicio') {
    sub = 'Antes de gravar';
    body = `<article class="rcard" id="rc"><h2 class="rt2">Como usar os roteiros</h2><p class="why">${esc(d.intro)}</p>
      <ul class="bul">${d.rules.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <a class="btn full" href="#/m/reels/1">Começar pelo Reel 1${icon('i-arrow')}</a></article>`;
    STEP = dir => dir > 0 && go('#/m/reels/1', 1);
  } else {
    s.last = cur; SV('sl_rl', s);
    const x = d.items[cur - 1], ch = chap(cur), done = (s.done || []).includes(cur), cap = `${x.caption}\n\n${x.hashtags}`;
    sub = `Reel ${cur} de ${N} · ${(s.done || []).length} feitos`;
    body = `<article class="rcard" id="rc">
      <p class="kick">${esc(ch.title)}</p>
      <div class="rtop"><span class="dnum">${pad2(cur)}</span><span><span class="rtag">${esc(x.duration)}</span><h2>${esc(x.title)}</h2></span></div>
      <p class="why"><b>Serve pra:</b> ${esc(x.niche)}</p>
      <div class="tip"><b>Gancho na tela</b>${esc(x.hook)}<button class="cbtn" type="button" data-copy="${esc(x.hook)}" aria-label="Copiar gancho">${icon('i-copy')}</button></div>
      <h3 class="rh">Cenas<small>${x.scenes.length} cenas</small></h3>${seqHTML(x.scenes)}
      <h3 class="rh">Legenda</h3><div class="tip cap"><span>${esc(x.caption)}<br><br>${esc(x.hashtags)}</span><button class="cbtn" type="button" data-copy="${esc(cap)}" aria-label="Copiar legenda">${icon('i-copy')}</button></div>
      <p class="why"><b>Áudio:</b> ${esc(x.audio)}</p>
      ${x.tip ? `<p class="why"><b>Dica:</b> ${esc(x.tip)}</p>` : ''}
    </article>${navHTML(cur > 1, cur < N, done, 'Marcar como postado')}
    <div class="rnums">${Array.from({length: ch.to - ch.from + 1}, (_, i) => ch.from + i).map(n => `<a href="#/m/reels/${n}"${n === cur ? ' aria-current="true"' : ''} class="${(s.done || []).includes(n) ? 'done' : ''}">${n}</a>`).join('')}</div>`;
    STEP = dir => { const n = cur + dir; if (n >= 1 && n <= N) go(`#/m/reels/${n}`, dir); };
  }
  box().innerHTML = head(INFO.reels.name, sub) + `<div class="pbar"><i style="--p:${(s.done || []).length / N * 100}%"></i></div>`
    + strip(items, cur === 'inicio' ? '#/m/reels/inicio' : `#/m/reels/${chap(cur).from}`) + body;
  centerStrip();
  box().querySelector('[data-done]')?.addEventListener('click', () => {
    const st = LS('sl_rl', {done: []}), on = !(st.done || []).includes(cur);
    st.done = on ? [...(st.done || []), cur] : st.done.filter(n => n !== cur); SV('sl_rl', st);
    if (on) { toast('Reel postado. Bora pro próximo!'); ev('mat_done', 'reels/' + cur); }
    R.reels(d, String(cur));
  });
};

// ---------- Aumente seus seguidores: método de 21 dias (bump 18/11) ----------
R.perfil = (d, arg) => {
  const s = LS('sl_pf', {done: []}), N = d.days.length;
  const cur = arg === 'rotina' || arg === 'inicio' ? arg : Math.min(N, Math.max(1, +arg || s.last || 1));
  const items = [['#/m/perfil/inicio', 'Como funciona'], ...d.days.map(x => [`#/m/perfil/${x.n}`, pad2(x.n), (s.done || []).includes(x.n)]), ['#/m/perfil/rotina', 'Rotina']];
  let body, sub;
  if (cur === 'inicio') {
    sub = 'Método prático';
    body = `<article class="rcard" id="rc"><h2 class="rt2">Uma tarefa por dia</h2>${String(d.intro).split('\n\n').map(p => `<p class="why">${esc(p)}</p>`).join('')}
      <ul class="bul">${d.weeks.map(w => `<li>${esc(w.title)}</li>`).join('')}</ul>
      <a class="btn full" href="#/m/perfil/1">Começar o dia 1${icon('i-arrow')}</a></article>`;
    STEP = dir => dir > 0 && go('#/m/perfil/1', 1);
  } else if (cur === 'rotina') {
    sub = 'Depois dos 21 dias';
    body = `<article class="rcard" id="rc"><h2 class="rt2">Sua rotina da semana</h2><p class="why">Pra continuar crescendo sem pensar muito.</p>
      <ul class="bul">${d.routine.map(t => `<li>${esc(t)}</li>`).join('')}</ul></article>`;
    STEP = dir => dir < 0 && go(`#/m/perfil/${N}`, -1);
  } else {
    s.last = cur; SV('sl_pf', s);
    const x = d.days[cur - 1], w = d.weeks.find(w => cur >= w.from && cur <= w.to), done = (s.done || []).includes(cur);
    sub = `Dia ${cur} de ${N} · ${(s.done || []).length} ${(s.done || []).length === 1 ? 'feito' : 'feitos'}`;
    body = `<article class="rcard" id="rc">
      ${w ? `<p class="kick">${esc(w.title)}</p>` : ''}
      <div class="rtop"><span class="dnum">${pad2(cur)}</span><span><h2>${esc(x.title)}</h2></span></div>
      <p class="why"><b>Objetivo:</b> ${esc(x.goal)}</p><p class="why">${esc(x.why)}</p>
      <h3 class="rh">Passo a passo</h3><ol class="seq">${x.steps.map((t, i) => `<li><span class="sn">${i + 1}</span><div><p class="sh">${esc(t)}</p></div></li>`).join('')}</ol>
      ${(x.copy || []).length ? `<h3 class="rh">Modelos pra copiar</h3><ul class="clist">${x.copy.map(c => `<li><span class="rtag">${esc(c.label)}</span><span class="pre">${esc(c.text)}</span><button class="cbtn" type="button" data-copy="${esc(c.text)}" aria-label="Copiar">${icon('i-copy')}</button></li>`).join('')}</ul>` : ''}
      ${x.check ? `<div class="tip"><b>Pronto quando</b>${esc(x.check)}</div>` : ''}
    </article>${navHTML(cur > 1, true, done, 'Marcar como feito')}`;
    STEP = dir => { const n = cur + dir; if (n < 1) return; go(n > N ? '#/m/perfil/rotina' : `#/m/perfil/${n}`, dir); };
  }
  box().innerHTML = head(INFO.perfil.name, sub) + `<div class="pbar"><i style="--p:${(s.done || []).length / N * 100}%"></i></div>`
    + strip(items, `#/m/perfil/${cur}`) + body;
  centerStrip();
  box().querySelector('[data-done]')?.addEventListener('click', () => {
    const st = LS('sl_pf', {done: []}), on = !(st.done || []).includes(cur);
    st.done = on ? [...(st.done || []), cur] : st.done.filter(n => n !== cur); SV('sl_pf', st);
    if (on) { toast(cur < N ? `Dia ${cur} feito! Amanhã tem o dia ${cur + 1}.` : 'Você fechou os 21 dias!'); ev('mat_done', 'perfil/' + cur); }
    R.perfil(d, String(cur));
  });
};

// ---------- Figurinhas com a sua frase: fontes exclusivas (bump 18/11) ----------
const LX_FONTS = [['pacifico','Pacifico'],['dancing-script','Dancing Script'],['great-vibes','Great Vibes'],['caveat','Caveat'],['satisfy','Satisfy'],['sacramento','Sacramento'],['kaushan-script','Kaushan'],['playfair-display','Playfair'],['dm-serif-display','DM Serif'],['abril-fatface','Abril'],['bebas-neue','Bebas'],['righteous','Righteous'],['fredoka','Fredoka'],['shrikhand','Shrikhand'],['monoton','Monoton'],['allura','Allura'],['lobster','Lobster'],['yellowtail','Yellowtail'],['permanent-marker','Marker'],['amatic-sc','Amatic']];
const LX_COLORS = ['#ffffff', '#2A1630', '#D92B63', '#FFD84D', '#F4C6D3', '#E9DCCB', '#7FB3A3', '#111111'];
const LX_STYLES = [['simples','Simples'],['contorno','Contorno'],['sombra','Sombra'],['fundo','Fundo'],['neon','Neon']];
const LX_IDEAS = ['bom dia', 'sextou', 'obrigada, Deus', 'look do dia', 'agenda aberta', 'novidade', 'chegou!', 'vem ver', 'promo de hoje', 'boa noite', 'gratidão', 'meu cantinho'];
let lxFace = false;
const lxFonts = () => { if (lxFace) return; lxFace = true; const st = document.createElement('style'); st.textContent = LX_FONTS.map(([f]) => `@font-face{font-family:"lx-${f}";src:url(letras/${f}.woff2) format("woff2");font-display:swap}`).join(''); document.head.append(st); };
const dark = c => { const n = parseInt(c.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return r * .299 + g * .587 + b * .114 < 150; };
function lxDraw(st) {
  const fam = `"lx-${st.font}"`, text = (st.text || '').trim() || 'sua frase', lines = text.split('\n').slice(0, 4);
  const W = 1400, H = 1000, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); let size = 260;
  const fit = () => { x.font = `${size}px ${fam}`; return Math.max(...lines.map(l => x.measureText(l).width)) <= 1060 && lines.length * size * 1.2 <= 820; };
  while (size > 40 && !fit()) size -= 8;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  const lh = size * 1.2, y0 = H / 2 - (lines.length - 1) * lh / 2, alt = dark(st.color) ? '#ffffff' : '#2A1630';
  lines.forEach((l, i) => {
    const y = y0 + i * lh;
    x.save();
    if (st.style === 'fundo') {
      const w = x.measureText(l).width + size * .7, h = size * 1.15;
      x.fillStyle = st.color; x.beginPath(); x.roundRect(W / 2 - w / 2, y - h / 2, w, h, h * .28); x.fill();
      x.fillStyle = alt; x.fillText(l, W / 2, y + size * .04);
    } else {
      if (st.style === 'contorno') { x.lineWidth = size * .14; x.strokeStyle = alt; x.strokeText(l, W / 2, y); }
      if (st.style === 'sombra') { x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = size * .1; x.shadowOffsetY = size * .05; }
      if (st.style === 'neon') { x.shadowColor = st.color; x.shadowBlur = size * .35; x.fillStyle = st.color; x.fillText(l, W / 2, y); x.fillText(l, W / 2, y); }
      x.fillStyle = st.color; x.fillText(l, W / 2, y);
    }
    x.restore();
  });
  // crop to the drawn pixels so the sticker pastes tight on the Story
  const px = x.getImageData(0, 0, W, H).data; let a = W, b = H, e = 0, f = 0;
  for (let yy = 0; yy < H; yy += 2) for (let xx = 0; xx < W; xx += 2) if (px[(yy * W + xx) * 4 + 3] > 8) { if (xx < a) a = xx; if (xx > e) e = xx; if (yy < b) b = yy; if (yy > f) f = yy; }
  if (e <= a) return c;
  const pad = 24, o = document.createElement('canvas'); o.width = e - a + pad * 2; o.height = f - b + pad * 2;
  o.getContext('2d').drawImage(c, a - pad, b - pad, o.width, o.height, 0, 0, o.width, o.height);
  return o;
}
R.letras = () => {
  lxFonts(); STEP = null;
  const st = LS('sl_lx', {text: 'bom dia', font: 'pacifico', color: '#ffffff', style: 'sombra'});
  box().innerHTML = head(INFO.letras.name, '20 fontes exclusivas')
    + `<div class="lx">
      <div class="lx-pv${dark(st.color) ? '' : ' lx-dk'}"><img id="lxImg" alt="Prévia da figurinha"></div>
      <label class="lx-lbl" for="lxT">Sua frase</label>
      <textarea id="lxT" rows="2" maxlength="60" placeholder="Escreva sua frase">${esc(st.text)}</textarea>
      <nav class="chips lx-ideas" aria-label="Ideias de frase">${LX_IDEAS.map(t => `<button class="chip" type="button" data-lx-idea="${esc(t)}">${esc(t)}</button>`).join('')}</nav>
      <h3 class="rh">Fonte</h3>
      <div class="lx-fonts">${LX_FONTS.map(([f, n]) => `<button type="button" data-lx-font="${f}" aria-pressed="${f === st.font}" aria-label="${n}" style="font-family:'lx-${f}'">Aa</button>`).join('')}</div>
      <h3 class="rh">Cor</h3>
      <div class="lx-colors">${LX_COLORS.map(c => `<button type="button" data-lx-color="${c}" aria-pressed="${c === st.color}" aria-label="Cor ${c}" style="--c:${c}"></button>`).join('')}</div>
      <h3 class="rh">Estilo</h3>
      <nav class="chips lx-styles">${LX_STYLES.map(([k, n]) => `<button class="chip" type="button" data-lx-style="${k}" aria-pressed="${k === st.style}">${n}</button>`).join('')}</nav>
      <div class="actions lx-act"><button class="btn" type="button" data-lx-copy>${icon('i-copy')}Copiar figurinha</button><button class="btn ghost" type="button" data-lx-save>${icon('i-down')}Baixar</button></div>
      <p class="hint">Copie e cole direto no seu Story, ou baixe e escolha na galeria.</p></div>`;
  const root = box().querySelector('.lx'), img = $('#lxImg');
  let blobP = null;
  const render = async () => {
    SV('sl_lx', st);
    await document.fonts.load(`80px "lx-${st.font}"`).catch(() => {});
    const c = lxDraw(st); img.src = c.toDataURL('image/png');
    blobP = new Promise(r => c.toBlob(r, 'image/png'));
    root.querySelector('.lx-pv').classList.toggle('lx-dk', !dark(st.color));
  };
  const press = (sel, attr, v) => root.querySelectorAll(sel).forEach(b => b.setAttribute('aria-pressed', b.getAttribute(attr) === v));
  let t; $('#lxT').addEventListener('input', e => { st.text = e.target.value; clearTimeout(t); t = setTimeout(render, 120); });
  root.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.lxIdea) { st.text = b.dataset.lxIdea; $('#lxT').value = st.text; }
    else if (b.dataset.lxFont) { st.font = b.dataset.lxFont; press('[data-lx-font]', 'data-lx-font', st.font); }
    else if (b.dataset.lxColor) { st.color = b.dataset.lxColor; press('[data-lx-color]', 'data-lx-color', st.color); }
    else if (b.dataset.lxStyle) { st.style = b.dataset.lxStyle; press('[data-lx-style]', 'data-lx-style', st.style); }
    else if (b.hasAttribute('data-lx-copy') || b.hasAttribute('data-lx-save')) {
      const name = 'figurinha-' + (st.text || 'frase').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) + '.png';
      ev('mat_down', 'letras/' + st.font);
      if (b.hasAttribute('data-lx-save')) return shareFile(await blobP, name, 'Figurinha baixada. No Story, abra a galeria e escolha ela.');
      try { await navigator.clipboard.write([new ClipboardItem({'image/png': blobP})]); return toast('Copiada! Agora é só colar no Story.'); }
      catch { return shareFile(await blobP, name, 'Figurinha baixada. No Story, abra a galeria e escolha ela.'); }
    } else return;
    render();
  });
  render();
};

// ---------- Animadas ----------
const ASK = 'No Instagram, a figurinha animada colada da galeria fica parada. Pra ela se mexer, coloque por cima de um vídeo no CapCut, InShot ou Canva e poste o vídeo.';
R.animadas = (d, arg) => {
  const th = d.themes.find(t => t.slug === arg) || (arg === 'verde' ? null : d.themes[0]);
  const chips = [...d.themes.map(t => [`#/m/animadas/${t.slug}`, t.name]), ['#/m/animadas/verde', 'Fundo verde']];
  const cur = th ? `#/m/animadas/${th.slug}` : '#/m/animadas/verde';
  STEP = null;
  box().innerHTML = head('Figurinhas Animadas', th ? `${th.name} · ${th.count} figurinhas` : `${d.verde.length} vídeos com fundo verde`,
      th ? `<button class="iconbtn" type="button" data-chkdark aria-pressed="${document.body.classList.contains('chkdark')}" aria-label="Fundo escuro (para figurinhas brancas)">${icon('i-bgtile')}</button>` : '')
    + (window.ToolTrial?.badge('animadas')||'') + (!has('animadas')&&window.ToolTrial?.enabled('animadas')?'<p class="tnote">3 arquivos por dia nos dois primeiros dias; depois, 2 por dia. Renovação à meia-noite de Brasília. Repetir o mesmo arquivo no dia não gasta outro uso.</p>':'') + `<nav class="chips" aria-label="Temas">${chips.map(([h, n]) => `<a class="chip" href="${h}"${h === cur ? ' aria-current="true"' : ''}>${esc(n)}</a>`).join('')}</nav>`
    + `<details class="howto ainfo"><summary><span><span class="ic">!</span>Como elas ficam animadas no Story</span>${icon('i-chev', 'chev')}</summary>
        <div class="ain"><p>${ASK}</p>
        <h3>CapCut</h3><ol><li>Crie um projeto 9:16 com sua foto ou vídeo.</li><li>Toque em <b>Sobrepor</b> e escolha o GIF (ou o vídeo de fundo verde).</li><li>No fundo verde, use <b>Remover fundo → Chroma key</b> e aponte pro verde.</li><li>Exporte em 1080p e poste no Story.</li></ol>
        <h3>InShot</h3><ol><li>Abra o vídeo ou foto → <b>Adesivo</b> → ícone de galeria.</li><li>Escolha o GIF, ajuste tamanho e duração.</li><li>Salve e poste no Story.</li></ol>
        <h3>Canva</h3><ol><li>Crie um design de Story e coloque sua foto.</li><li>Em <b>Uploads</b>, envie o GIF e arraste pro design.</li><li>Baixe como <b>MP4</b> e poste.</li></ol></div></details>`
    + (th ? `<div class="stickers agrid">${Array.from({length: th.count}, (_, i) => `<button class="st chk" type="button" data-an="${i + 1}" aria-label="Figurinha animada ${i + 1}"><img class="fade" src="${M(`animadas/${th.slug}/t/${i + 1}.webp`)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : `<div class="vgrid">${d.verde.map(k => `<button class="vcard" type="button" data-vd="${k}"><span class="sk"><img class="fade" src="${M(`animadas/verde/${k}.webp`)}" alt="" loading="lazy"></span><span class="play">${icon('i-play')}</span><small>${esc(k.replace(/-(\d+)$/, ' $1'))}</small></button>`).join('')}</div>`);
  box().insertAdjacentHTML('beforeend','<a class="tutlink" href="#tutoriais/animadas">Ver tutorial em vídeo ↗</a>');
  box().querySelector('.chips [aria-current]')?.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'instant'});
  box().querySelector('.agrid')?.addEventListener('click', e => { const b = e.target.closest('[data-an]'); if (b) aSheet(th, +b.dataset.an); });
  box().querySelector('.vgrid')?.addEventListener('click', e => { const b = e.target.closest('[data-vd]'); if (b) vSheet(b.dataset.vd); });
};
box().addEventListener('click', e => {
  const a = e.target.closest('.chips a, .dstrip a, .rnums a, .todayb');
  if (!a || !a.getAttribute('href').startsWith('#/m/')) return;
  e.preventDefault();
  const h = a.getAttribute('href');
  setHash(h); window.matRoute(h); if (!a.closest('.chips')) scrollTo({top: 0, behavior: 'instant'});
});
// own sheet for animated stickers / videos
const ms = document.createElement('dialog');
ms.className = 'sheet'; ms.setAttribute('aria-labelledby', 'msT');
document.body.append(ms);
ms.addEventListener('click', e => { if (e.target === ms || e.target.closest('[data-close]')) ms.close(); });
ms.addEventListener('close', () => { ms.querySelector('video')?.pause();window.ToolTrial?.release('animadas',A?.item);A=null; });
let A = null;
const fileBlob = url => fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); });
function aSheet(th, n) {
  window.ToolTrial?.release('animadas',A?.item);
  A = {item:`gif:${th.slug}/${n}`,th, n, blob: fileBlob(M(`animadas/${th.slug}/g/${n}.gif`))};
  A.blob.catch(() => {});
  ms.innerHTML = `<div class="in"><div class="grab"></div><button class="x" type="button" data-close aria-label="Fechar">${icon('i-x')}</button>
    <div class="pv chk"><img src="${M(`animadas/${th.slug}/t/${n}.webp`)}" alt="" id="aImg">
      <button class="nav prev" type="button" data-a="-1" aria-label="Anterior"${n > 1 ? '' : ' disabled'}>${icon('i-back')}</button>
      <button class="nav next" type="button" data-a="1" aria-label="Próxima"${n < th.count ? '' : ' disabled'}>${icon('i-next')}</button></div>
    <div class="pvinfo"><b id="msT">${esc(th.name)}</b><span>${n} de ${th.count}</span></div>
    <div class="actions"><button class="btn" type="button" data-share>${icon('i-share')}Salvar / Compartilhar GIF</button></div>
    <p class="hint">${ASK}</p></div>`;
  const full = new Image(); full.onload = () => { if (A && A.n === n && A.th===th) $('#aImg').src = full.src; }; full.src = M(`animadas/${th.slug}/w/${n}.webp`);
  open(ms);prepareAnimated(A);
}
function vSheet(k) {
  window.ToolTrial?.release('animadas',A?.item);
  A = {item:`video:${k}`,vd: k, blob: fileBlob(M(`animadas/verde/${k}.mp4`))};
  A.blob.catch(() => {});
  ms.innerHTML = `<div class="in"><div class="grab"></div><button class="x" type="button" data-close aria-label="Fechar">${icon('i-x')}</button>
    <div class="pv vidbox"><video src="${M(`animadas/verde/${k}.mp4`)}" poster="${M(`animadas/verde/${k}.webp`)}" autoplay muted loop playsinline></video></div>
    <div class="pvinfo"><b id="msT">Fundo verde · ${esc(k.replace(/-(\d+)$/, ' $1'))}</b></div>
    <div class="actions"><button class="btn" type="button" data-share>${icon('i-down')}Salvar vídeo</button></div>
    <p class="hint">No CapCut: Sobrepor → escolha o vídeo → Remover fundo → Chroma key e aponte pro verde.</p></div>`;
  open(ms);prepareAnimated(A);
}
async function prepareAnimated(a){
  const button=ms.querySelector('[data-share]');button.disabled=true;button.textContent='Preparando arquivo…';a.ready=false;a.blocked=false;
  try{
    const [blob,permit]=await Promise.all([a.blob,window.ToolTrial?.reserve('animadas',a.item)||{ok:true}]);
    if(A!==a||!ms.open){window.ToolTrial?.release('animadas',a.item);return;}
    if(permit.error==='busy')throw Error('busy');
    a.file=blob;a.expires=permit.expires||0;a.blocked=!permit.ok;a.ready=true;
    button.textContent=a.blocked?'Ver acesso ilimitado':a.th?'Salvar / Compartilhar GIF':'Salvar vídeo';
  }catch{if(A===a)button.textContent='Tentar novamente';}
  finally{if(A===a)button.disabled=false;}
}
ms.addEventListener('click', async e => {
  const nv=e.target.closest('[data-a]');
  if(nv&&A?.th)return aSheet(A.th,A.n+ +nv.dataset.a);
  const button=e.target.closest('[data-share]');if(!button||!A)return;
  const a=A;
  if(!a.ready||(!has('animadas')&&(!window.ToolTrial?.isToday()||(a.expires&&Date.now()>=a.expires-5000))))return prepareAnimated(a);
  if(a.blocked)return window.ToolTrial?.offer('animadas');
  button.disabled=true;
  const name=a.th?`stories-lab-${a.th.slug}-${a.n}.gif`:`stories-lab-fundo-verde-${a.vd}.mp4`;
  try{
    if(await shareFile(a.file,name,a.th?'GIF salvo.':'Vídeo salvo.')){
      await window.ToolTrial?.commit('animadas',a.item);a.expires=0;
      ev('mat_down',a.th?`animadas/${a.th.slug}/${a.n}`:'verde/'+a.vd);
      if(A===a)ms.close();
    }
  }catch{toast('Não deu para concluir agora. Confira sua conexão e tente novamente.');}
  finally{if(A===a)button.disabled=false;}
});

// ---------- Presets ----------
const P = p => `img/presets/${p}?v=theme-1`;
let psGroup = 'Todos';
const savedLooks = () => LS('sl_ps_saved', []);
box().addEventListener('click', async e => {
  const b=e.target.closest('[data-save-look]'); if(!b)return;
  const id=b.dataset.saveLook, old=savedLooks(), on=!old.includes(id);
  SV('sl_ps_saved',on?[...old,id]:old.filter(x=>x!==id));
  b.setAttribute('aria-pressed',on); b.textContent=b.classList.contains('look-save')?(on?'♥':'♡'):(on?'Salvo ♥':'Salvar ♡');
  if(!on && psGroup==='Salvos' && b.closest('.preset-grid')) {
    const d=await load('presets'); if(location.hash!=='#/m/presets')return;
    R.presets(d); box().querySelector('[data-group="Salvos"]').focus({preventScroll:true});
  }
});
const TUT = {
  lr: ['No Stories Lab, toque em <b>Usar na minha foto</b> e escolha sua imagem.', 'Ajuste a intensidade e toque em <b>Salvar foto</b>.', 'Importe o JPG salvo no Lightroom para continuar a edição. Estes looks são LUTs; não há arquivo XMP equivalente nesta coleção.'],
  cc: ['Toque em <b>CapCut / VN (.cube)</b> aqui em cima pra baixar o filtro.', '<b>VN no celular:</b> toque no clipe → <b>Filtro</b> → ícone de importar e escolha o .cube.', '<b>CapCut no computador:</b> clipe → <b>Ajustar</b> → <b>LUT</b> → <b>Importar</b>.', 'Ajuste a intensidade até ficar do seu jeito.', 'CapCut no celular não importa LUT: use o VN, ou copie o visual olhando o antes e depois.'],
  is: ['No <b>Estúdio de Fotos</b> do Stories Lab, escolha sua foto e aplique o look.', 'Ajuste a intensidade e toque em <b>Salvar foto</b>.', 'Sua foto está pronta para publicar. Você também pode abrir o JPG em outro editor.'],
};
R.presets = (d, arg) => {
  if(arg==='editor') { STEP=null;window.PhotoStudio.mount(box(),d,location.hash.split('/')[4]);return; }
  const L = d.looks.find(l => l.id === arg);
  if (!L) {
    STEP = null;
    const chipScroll = box().querySelector('.studio-tools .chips')?.scrollLeft || 0;
    const saved=savedLooks(), filtered=d.looks.filter(l=>psGroup==='Todos'||(psGroup==='Salvos'?saved.includes(l.id):(l.groups||[l.group]).includes(psGroup))); const list=psGroup==='Todos'?filtered.filter((l,i,a)=>l.collection==='Cinema'||a.findIndex(x=>x.collection===l.collection)===i):filtered;
    box().innerHTML = head('Estúdio de Fotos', '')
      + `<section class="studio-intro si2"><img src="${R._si||=(window.slDemoPhoto?.()||'img/presets/antes/studio-demo-1.webp')}" alt=""><div class="si2-tx"><b>Sua foto com cara<br>de <em>editorial</em></b><nav class="si2-looks" aria-label="Testar um look">${['17-dark-cinema','13-soft-film','19-ocean'].map(id=>d.looks.find(l=>l.id===id)).filter(Boolean).map(l=>`<a href="#/m/presets/editor/${l.id}">${esc(l.name)}</a>`).join('')}</nav><div class="si2-cta"><a class="btn sm photo-entry" href="#/m/presets/editor">Editar minha foto ${icon('i-arrow')}</a><a class="tutlink" href="#tutoriais/fotos">Tutorial</a></div></div></section>
      <div class="studio-tools"><nav class="chips" aria-label="Estilos de presets">${['Todos',...(d.groups||[]),'Salvos'].map(g=>`<button class="chip" type="button" data-group="${g}" aria-pressed="${g===psGroup}">${g}</button>`).join('')}</nav>
      </div>
      <div class="preset-grid">${list.map((l,i)=>`<article class="look-card"><a href="#/m/presets/${l.id}" aria-label="Comparar ${esc(l.name)}"><span class="look-photo"><img src="${P(`depois/${l.id}/${l.photo}.webp`)}" alt="Prévia de ${esc(l.name)}" loading="lazy"><span class="look-tag">${l.group}</span></span><span class="look-info"><b>${esc(psGroup==='Todos'&&l.collection!=='Cinema'?l.collection:l.name)}</b>${psGroup==='Todos'&&l.collection!=='Cinema'?`<small>${d.looks.filter(x=>x.collection===l.collection).length} variações</small>`:''}<span class="look-cta">Comparar ↗</span></span></a><button class="look-save" type="button" data-save-look="${l.id}" aria-label="Salvar ${esc(l.name)}" aria-pressed="${saved.includes(l.id)}">${saved.includes(l.id)?'♥':'♡'}</button></article>`).join('')}</div>
      ${!list.length?'<div class="empty"><b>Nenhum look salvo</b><p>Toque em Salvar para guardar um look.</p></div>':''}`;
    box().querySelector('.studio-tools .chips').scrollLeft = chipScroll;
    box().querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{psGroup=b.dataset.group;R.presets(d);box().querySelector(`[data-group="${psGroup}"]`).focus({preventScroll:true});});
    return;
  }
  const i = d.looks.indexOf(L), photos = L.photos?.length ? L.photos : [L.photo], savedPhoto = LS('sl_ps_ph', {})[L.id], ph = photos.includes(savedPhoto) ? savedPhoto : L.photo;
  box().innerHTML = head(esc(L.name), esc(L.group), `<button class="preset-save look-save" type="button" data-save-look="${L.id}" aria-pressed="${savedLooks().includes(L.id)}" aria-label="Salvar look">${savedLooks().includes(L.id)?'♥':'♡'}</button>`, '#/m/presets')
    + `<article id="rc" class="preset-detail"><div class="preset-visual"><div class="ba" style="--x:50%"><img src="${P(`antes/${ph}.webp`)}" alt="Foto antes do look"><img class="af" src="${P(`depois/${L.id}/${ph}.webp`)}" alt="Foto com o look ${esc(L.name)}">
        <span class="bal">Antes</span><span class="bar2">Depois</span><span class="bline"><span class="bknob">${icon('i-back')}${icon('i-next')}</span></span>
        <input type="range" min="0" max="100" value="50" aria-label="Arraste pra comparar antes e depois"></div>
      <div class="phs" role="group" aria-label="Escolher foto">${photos.map(p => `<button type="button" data-ph="${p}"${p === ph ? ' aria-pressed="true"' : ''} aria-label="${esc(d.photoLabels[p] || p)}"><img src="${P(`depois/${L.id}/${p}.webp`)}" alt="" loading="lazy"><span>${esc(d.photoLabels[p] || p)}</span></button>`).join('')}</div>
      </div><div class="preset-details">
      ${L.collection!=='Cinema'?`<nav class="preset-variants" aria-label="Variações de ${esc(L.collection)}">${d.looks.filter(x=>x.collection===L.collection).map(x=>`<a href="#/m/presets/${x.id}" aria-current="${x.id===L.id?'true':'false'}">${esc(x.variant)}</a>`).join('')}</nav>`:''}<a class="btn full photo-entry" href="#/m/presets/editor/${L.id}">Usar na minha foto ${icon('i-arrow')}</a><div class="row2 ps-dl">${L.sourceKind==='dng-color-adaptation'?`<a class="ps-dlb lr" href="${M(`presets/dng/SL-${L.id}.dng`)}" download="StoriesLab-${L.id}.dng" data-dl="dng"><b>Lr</b><span>Lightroom</span></a>`:''}<a class="ps-dlb" href="${M(`presets/cube/SL-${L.id}.cube`)}" download data-dl="cube">${icon('i-down')}<span>CapCut</span></a></div>
      ${L.sourceKind==='dng-color-adaptation'?'<p class="ps-hint">No Lightroom: abra o arquivo, toque em ••• e em <b>Criar predefinição</b>.</p>':''}</div>
    </article>
    <div class="rnav"><button class="iconbtn" type="button" data-step="-1" aria-label="Look anterior"${i ? '' : ' disabled'}>${icon('i-back')}</button><a class="btn ghost sm" href="#/m/presets">Todos os looks</a><button class="iconbtn" type="button" data-step="1" aria-label="Próximo look"${i < d.looks.length - 1 ? '' : ' disabled'}>${icon('i-next')}</button></div>`;
  if(!has('presets')&&window.ToolTrial?.enabled('presets')){box().querySelector('.row2').innerHTML='<button class="btn full" type="button" data-trial-offer="presets">Liberar download pro Lightroom</button>';box().querySelector('.ps-hint')?.remove();}
  STEP = dir => { const n = d.looks[i + dir]; if (n) go(`#/m/presets/${n.id}`, dir); };
  const ba = box().querySelector('.ba'), rng = ba.querySelector('input');
  const setX = v => { v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--x', v + '%'); rng.value = v; };
  rng.addEventListener('input', () => setX(+rng.value));
  let drag = false;
  const at = e => setX((e.clientX - ba.getBoundingClientRect().left) / ba.offsetWidth * 100);
  ba.addEventListener('pointerdown', e => { drag = true; ba.setPointerCapture(e.pointerId); at(e); });
  ba.addEventListener('pointermove', e => { if (drag) at(e); });
  ba.addEventListener('pointerup', () => { drag = false; });
  ba.addEventListener('pointercancel', () => { drag = false; });
  if (!reduced && !LS('sl_ps_hint', 0)) { SV('sl_ps_hint', 1); ba.classList.add('hint'); setTimeout(() => ba.classList.remove('hint'), 2200); }
  let sceneRequest = 0;
  box().querySelector('.phs').addEventListener('click', async e => {
    const b = e.target.closest('[data-ph]'); if (!b) return; setX(50);
    const request=++sceneRequest, before=P(`antes/${b.dataset.ph}.webp`), after=P(`depois/${L.id}/${b.dataset.ph}.webp`);
    ba.setAttribute('aria-busy','true');
    try {
      await Promise.all([before,after].map(src=>{const img=new Image();img.src=src;return img.decode();}));
      if(request!==sceneRequest||!ba.isConnected)return;
      ba.querySelector('img').src=before; ba.querySelector('.af').src=after;
      const map=LS('sl_ps_ph',{});map[L.id]=b.dataset.ph;SV('sl_ps_ph',map);
      box().querySelectorAll('[data-ph]').forEach(x=>x.setAttribute('aria-pressed',x===b));
    } catch { if(request===sceneRequest&&ba.isConnected)toast('Não deu para carregar essa prévia. Toque na foto para tentar de novo.'); }
    finally { if(request===sceneRequest)ba.removeAttribute('aria-busy'); }
  });
  box().querySelector('.tutb .seg')?.addEventListener('click', e => {
    const a = e.target.closest('[data-tut]'); if (!a) return;
    e.preventDefault();
    box().querySelectorAll('[data-tut]').forEach(x => (x === a ? x.setAttribute('aria-current', 'true') : x.removeAttribute('aria-current')));
    $('#tutSteps').innerHTML = TUT[a.dataset.tut].map(t => `<li>${t}</li>`).join('');
  });
  box().querySelectorAll('[data-dl]').forEach(a => a.addEventListener('click', () => ev('mat_down', `presets/${L.id}.${a.dataset.dl}`)));
};
// A fast cached catalog can boot before this script finishes downloading.
// Honor the current material deep link once its route handlers are ready.
if(S.booted && (location.hash==='#materiais'||location.hash.startsWith('#/m/')))route();
})();
