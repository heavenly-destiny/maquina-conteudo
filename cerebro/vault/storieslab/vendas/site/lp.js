// Connect rate: heavy loads wait for the Meta PageView (see slAfterPixel in <head>); falls back to now.
const slAfter = f => (window.slAfterPixel ? window.slAfterPixel(f) : f());
// For what is on the first screen: after the PageView, but never later than 1 s. Safari private tabs and
// blockers stop the pixel, and the head gate then waits its full 6 s (hero phone sat frozen, 16/11).
const slSoon = f => { let done = false; const g = () => { if (!done) { done = true; f(); } }; slAfter(g); setTimeout(g, 1000); };

// In-page buttons (#planos, #oferta...): scroll so the section's top lands right under the screen edge, then correct
// once more after lazy images above it finish loading (they used to push the target and the scroll stopped short).
// The correction stops the moment the visitor touches, scrolls or types: it used to pull people back up to the
// section when they kept scrolling down right after the tap, and the page looked broken (owner 18/11).
(() => {
  const GAP = 8, USER = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  let stopPrev = () => {};
  const go = t => {
    stopPrev();
    const y = () => Math.max(0, t.getBoundingClientRect().top + scrollY - GAP);
    let tries = 0, stopped = false, timer = 0;
    const stop = () => { stopped = true; clearTimeout(timer); USER.forEach(n => removeEventListener(n, stop)); };
    stopPrev = stop;
    USER.forEach(n => addEventListener(n, stop, { passive: true }));
    scrollTo({ top: y(), behavior: 'smooth' });
    const fix = () => {
      if (stopped) return;
      const off = t.getBoundingClientRect().top - GAP;
      if (Math.abs(off) > 3 && tries++ < 4) { scrollTo({ top: y(), behavior: 'smooth' }); timer = setTimeout(fix, 700); } else stop();
    };
    timer = setTimeout(fix, 900);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-plan') || e.defaultPrevented) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault(); go(t);
  });
  window.lpGo = go;
})();

// Premium price reveal (owner 18/11: the 197 -> 27 counter looked cheap). When the card reaches the screen
// the "De R$ 197" line gets struck through, then R$ 27 rises in with a soft spring. Styles in lp.css (.lp-arm / .lp-go).
(() => {
  const card = document.querySelector('#planos .plan.pro'), price = card?.querySelector('.price');
  if (!price || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  card.classList.add('lp-arm');
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    requestAnimationFrame(() => card.classList.add('lp-go'));
  }, { rootMargin: '0px 0px 15% 0px' }).observe(price);
})();

// Bonuses: two columns of big covers rolling vertically in opposite directions (owner: "passagem na vertical").
(() => {
  const box = document.getElementById('bonus-preview');
  if (!box) return;
  const items = [...box.children];
  const cols = [document.createElement('div'), document.createElement('div')];
  cols.forEach((c, i) => { c.className = 'lp-bcol' + (i ? ' down' : ''); });
  items.forEach((el, i) => cols[i % 2].append(el));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
    // three copies of each column: the loop shifts by exactly one copy, so a short column never runs dry
    cols.forEach(c => { const set = [...c.children]; for (let r = 0; r < 2; r++) set.forEach(el => { const k = el.cloneNode(true); k.setAttribute('aria-hidden', 'true'); c.append(k); }); });
  else box.classList.add('lp-still');
  // hold every cover (and the copies) until the section is near: native lazy-load misses images inside the
  // moving columns and also starts too early on slow connections
  box.querySelectorAll('img[src]').forEach(i => { i.dataset.src = i.getAttribute('src'); i.removeAttribute('src'); });
  box.append(...cols); box.classList.add('lp-bcols');
  const near = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return;
    near.disconnect(); slAfter(() => box.querySelectorAll('img[data-src]').forEach(i => { i.loading = 'eager'; i.src = i.dataset.src; i.removeAttribute('data-src'); }));
  }, { rootMargin: '800px 0px' });
  near.observe(box);
})();

// CTAs: the shine runs once, when the button first reaches the screen.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('lp-seen'); io.unobserve(e.target);
  }), { threshold: .6 });
  document.querySelectorAll('.lp-cta').forEach(b => io.observe(b));
})();

// Proof wall: prints slide in one by one as the wall scrolls into view.
(() => {
  const wall = document.querySelector('.lp-wall');
  if (!wall || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  wall.classList.add('lp-armed');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('lp-in'); io.unobserve(e.target);
  }), { threshold: .25 });
  wall.querySelectorAll('.sp-print').forEach(p => io.observe(p));
})();

// 16/11 page rewrite: "Salvar Story" in the demo opens a pop-up (offer or keep reading) instead of downloading.
(() => {
  const save = document.getElementById('xpSave'), phone = document.getElementById('xpPhone');
  if (!save) return;
  const box = document.createElement('div');
  box.className = 'lp-modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'lpModalT');
  box.innerHTML = `<div class="lp-box">
    <button class="lp-x" type="button" aria-label="Fechar">×</button>
    <div class="lp-shot" aria-hidden="true"></div>
    <h3 id="lpModalT">Viu? Seu story <em>virou outro.</em></h3>
    <p>E isso foi <b>uma</b> figurinha. Lá dentro são <b>+24 mil</b>, mais editor de fotos e câmera com filtros, num app só. Cada story sem graça que você posta é seguidor passando reto.</p>
    <a class="btn wide lp-cta" href="#planos" data-lp-go><span class="lp-cta-main">Quero meus stories assim todo dia</span><span class="lp-cta-sub">Liberar meu acesso agora · R$ <span data-p="premium">27,00</span></span></a>
    <button class="lp-more" type="button" data-lp-more>Quero saber mais um pouco</button>
  </div>`;
  document.body.append(box);
  const price = document.querySelector('[data-p="premium"]');
  if (price) box.querySelector('[data-p="premium"]').textContent = price.textContent;

  // Snapshot of her Story: the scene photo with the stickers she placed, drawn small for the pop-up.
  const shot = box.querySelector('.lp-shot');
  const paint = () => {
    const bg = phone && getComputedStyle(phone).backgroundImage;
    shot.style.backgroundImage = bg && bg !== 'none' ? bg : '';
    shot.innerHTML = '';
    phone?.querySelectorAll('.xp-item img, .xp-st img, img.xp-sticker').forEach(img => {
      const c = img.closest('[style]') || img, r = c.getBoundingClientRect(), p = phone.getBoundingClientRect();
      const k = shot.offsetWidth / p.width || 132 / p.width, el = img.cloneNode();
      Object.assign(el.style, { position: 'absolute', left: (r.left - p.left) * k + 'px', top: (r.top - p.top) * k + 'px', width: r.width * k + 'px', transform: getComputedStyle(c).transform === 'none' ? '' : getComputedStyle(c).transform });
      shot.append(el);
    });
  };
  shot.style.position = 'relative'; shot.style.overflow = 'hidden';

  let last = null;
  const open = () => { last = document.activeElement; paint(); box.classList.add('on'); document.documentElement.style.overflow = 'hidden'; box.querySelector('[data-lp-go]').focus({ preventScroll: true }); };
  const close = () => { box.classList.remove('on'); document.documentElement.style.overflow = ''; last?.focus?.({ preventScroll: true }); };
  save.onclick = open;
  box.addEventListener('click', e => { if (e.target === box || e.target.closest('.lp-x')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('on')) close(); });
  // The pop-up already shows the price, so its button goes straight to the Premium checkout (owner 17/11).
  // It copies the href of the page's Premium button, which the inline script already filled with the ad's UTMs.
  const go = box.querySelector('[data-lp-go]'), prem = document.querySelector('a[data-plan="premium"]');
  if (prem && /^https:/.test(prem.href)) go.href = prem.href;
  go.addEventListener('click', () => { if (typeof abHit === 'function') abHit('click', 'premium'); close(); });
  box.querySelector('[data-lp-more]').addEventListener('click', () => {
    close();
    const t = document.getElementById('reacoes'); if (t) (window.lpGo ? lpGo(t) : t.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });
})();

// Demo: "Sua foto" is the first choice (owner 16/11), highlighted so she taps it.
(() => {
  const mine = document.getElementById('xpMine');
  if (!mine) return;
  mine.parentElement.prepend(mine);
  mine.classList.add('lp-mine');
  mine.textContent = '📷 Usar minha foto';
})();

// Hero story wall: the first tiles of each row have a real src in the HTML (on screen at first paint).
// The rest load as soon as the Meta PageView is out; waiting for window 'load' left the wall blank ~1 s on iPhone (16/11).
(() => {
  const go = () => document.querySelectorAll('.lp-storywall img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  slSoon(go);
})();

// Hero reel (owner 16/11): iPhone mockup playing finished stories like Instagram. Fast cube turns (~1.2 s),
// progress bars, hearts floating up, replies landing as DM toasts and reaction bubbles beside the phone.
(() => {
  const reel = document.querySelector('.lp-reel');
  if (!reel) return;
  const cube = reel.querySelector('.lp-cube'), f = cube.querySelector('.f'), r = cube.querySelector('.r');
  const bars = reel.querySelector('.lp-bars'), bub = reel.querySelector('.lp-bubbles');
  const hearts = reel.querySelector('.lp-hearts'), toasts = reel.querySelector('.lp-toasts');
  const POOL = ['comida-4','rotina-7','fe-1','treino-6','comida-6','beleza-5','comida-5','comida-1','treino-1','treino-3','treino-5','beleza-3','treino-7','fitness-com','comida-2','fe-3','gym-com','treino-2','comida-8','pizza-com','comida-7','netflix-com','beleza-2','rotina-2','rotina-1','rotina-5','rotina-3','comida-3','rotina-4','treino-4','beleza-1','rotina-6','fruit-com','beleza-4','fe-2'].map(n => `/img/${n}.webp`);
  const SAY = ['😍 que story lindo!', '💬 como você faz esses stories??', '🔥 amei isso', '💬 me passa o app?', '😮 ficou perfeito', '💬 onde achou essa figurinha?', '❤️ curtiu seu story', '👏 arrasou demais', '📤 compartilhou seu story', '🔁 repostou seu story'];
  const DM = [['Ana', 'que lindo!! 😍'], ['Bia', 'me ensina a fazer?'], ['Carol', 'qual app é esse??'], ['Duda', 'amei a figurinha 💖'], ['Lu', 'tá perfeito 🔥'], ['Mari', 'quero igual!']];
  const EMO = ['❤️', '💖', '😍', '🔥', '👏', '✨'];
  const SHOW = 7, STEP = 900;
  bars.innerHTML = '<i></i>'.repeat(SHOW);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // photo pool: fetch only the next two ahead of each turn instead of all of them up front
  const got = {};
  const warm = j => [1, 2].forEach(d => { const u = POOL[(j + d) % POOL.length]; if (!got[u]) { got[u] = new Image(); got[u].src = u; } });
  // a turn only happens once the next photo is downloaded, so a slow phone never shows a blank face mid-turn
  const ready = u => { const i = got[u]; return !i || (i.complete && i.naturalWidth > 0); };
  slSoon(() => warm(0));
  let k = 0, n = 0, seen = true;
  new IntersectionObserver(([e]) => seen = e.isIntersecting).observe(reel);
  const mark = () => bars.querySelectorAll('i').forEach((b, j) => { b.className = j < n % SHOW ? 'done' : j === n % SHOW ? 'run' : ''; });
  const temp = (parent, el, ms) => { parent.append(el); setTimeout(() => el.remove(), ms); };
  const heart = () => {
    const h = document.createElement('span'); h.className = 'lp-heart'; h.textContent = EMO[Math.floor(Math.random() * EMO.length)];
    h.style.setProperty('--x', (Math.random() * 40 - 20) + 'px'); h.style.setProperty('--d', (1.8 + Math.random() * .9) + 's');
    temp(hearts, h, 3000);
  };
  // reactions sit out at the sides of the phone, at varying heights, to fill the empty space around it
  const bubble = () => {
    const el = document.createElement('span'); el.className = 'lp-bub ' + (n % 2 ? 'l' : 'r');
    const t = SAY[n % SAY.length], sp = t.indexOf(' ');
    el.innerHTML = `<i>${t.slice(0, sp)}</i><span>${t.slice(sp + 1)}</span>`;
    el.style.top = (14 + Math.random() * 62) + '%'; temp(bub, el, 2400);
  };
  const toast = () => {
    const [who, msg] = DM[(n / 2 | 0) % DM.length], el = document.createElement('div'); el.className = 'lp-toast';
    el.innerHTML = `<img class="lp-tav" src="/img/av-${(n / 2 | 0) % 4 + 1}.webp" alt=""><p><b>${who}</b> respondeu ao seu story<span>${msg}</span></p>`;
    temp(toasts, el, 1800);
  };
  mark();
  if (reduce) return;
  // the reel starts turning (and downloading the next photos) once the Meta PageView is out (1 s at most); until then it
  // shows the first story, which is already preloaded
  slSoon(() => {
  // calmer (owner 18/11, "as reações tão poluindo"): fewer hearts, one bubble every 3rd story, one DM every 4th
  setInterval(() => { if (seen && !document.hidden) heart(); }, 950);
  setInterval(() => {
    if (!seen || document.hidden || !ready(POOL[(k + 1) % POOL.length])) return;
    k = (k + 1) % POOL.length; n++;
    r.src = POOL[k]; warm(k); cube.classList.add('turn');
    setTimeout(() => { cube.style.transition = 'none'; f.src = POOL[k]; cube.classList.remove('turn'); void cube.offsetWidth; cube.style.transition = ''; }, 430);
    mark(); if (n % 3 === 1) bubble(); if (n % 4 === 3) toast();
  }, STEP);
  });
})();

// Sample frame: the story tiles load only when the frame is about a screen away.
(() => {
  const box = document.querySelector('.lp-mosaic');
  if (!box) return;
  const go = () => box.querySelectorAll('img[data-lazy]').forEach(i => { i.onload = () => i.classList.add('on'); i.src = innerWidth >= 700 ? i.dataset.lazy.replace('/img/tm/', '/img/t/') : i.dataset.lazy; i.removeAttribute('data-lazy'); if (i.complete) i.classList.add('on'); });
  if (!('IntersectionObserver' in window)) return go();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); slSoon(go); } }, { rootMargin: '1800px 0px' });
  io.observe(box);
})();

// Category rows: lazy images sliding in sideways never get the browser's lazy trigger in time,
// so every card loads together once the rows are near the screen.
(() => {
  const rows = document.querySelector('.cats2 .lp-cats-row');
  if (!rows || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    document.querySelectorAll('.lp-cats-track img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  }, { rootMargin: '700px 0px' });
  io.observe(rows);
})();

// Proof row (18/11): message prints load when the row is near, then fade in.
(() => {
  const row = document.querySelector('.lp-pv-row');
  if (!row) return;
  const go = () => row.querySelectorAll('img[data-src]').forEach(i => { i.onload = () => i.classList.add('on'); i.src = i.dataset.src; i.removeAttribute('data-src'); if (i.complete) i.classList.add('on'); });
  if (!('IntersectionObserver' in window)) return go();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); slSoon(go); } }, { rootMargin: '1500px 0px' });
  io.observe(row);
})();

// Hero side phones (owner 18/11): the editor video starts after the pixel; the camera focuses, flashes,
// drops the shot in the thumbnail and moves to the next photo, every 2.6 s, only while the hero is on screen.
(() => {
  const v = document.querySelector('.mk-vid');
  if (v) slSoon(() => { v.src = v.dataset.src; v.play().catch(() => {}); });
  const cam = document.querySelector('.mk-cam');
  if (!cam || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const imgs = [...cam.querySelectorAll('.mk-vf img')], fl = cam.querySelector('.mk-flash'), fo = cam.querySelector('.mk-focus');
  const sh = cam.querySelector('.mk-shut'), th = cam.querySelector('.mk-thumb');
  const load = im => { if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } };
  const restart = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  const P = [[68, 38], [62, 30], [72, 45], [64, 52], [70, 34], [63, 42], [69, 30]];
  let i = 0, seen = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(cam);
  slSoon(() => load(imgs[1]));
  const shot = () => {
    if (document.hidden || !seen) return;
    const cur = imgs[i], nx = imgs[(i + 1) % imgs.length];
    load(nx); load(imgs[(i + 2) % imgs.length]);
    fo.style.left = P[i % P.length][0] + '%'; fo.style.top = P[i % P.length][1] + '%'; restart(fo, 'on');
    setTimeout(() => { sh.classList.add('press'); restart(fl, 'go'); }, 650);
    setTimeout(() => { sh.classList.remove('press'); th.src = cur.currentSrc || cur.src; restart(th, 'pop'); }, 820);
    setTimeout(() => { fo.classList.remove('on'); if (!nx.complete || !nx.naturalWidth) return; cur.classList.remove('on'); nx.classList.add('on'); i = (i + 1) % imgs.length; }, 1150);
  };
  setTimeout(() => { shot(); setInterval(shot, 2600); }, 1400);
})();
