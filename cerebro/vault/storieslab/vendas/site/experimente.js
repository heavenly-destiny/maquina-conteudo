// "Teste agora" Story simulator (owner 02/11). Same flow as the quiz (tap the photo, "Colar", drag), plus:
// pinch with two fingers to resize/rotate (wheel on desktop, shift+wheel rotates), drag to the trash to delete,
// 8 example scenes with real stickers (animated ones play), her own photo (never uploaded), download as 1080x1920.
(() => {
  const root = document.getElementById('xp'); if (!root) return;
  const $ = s => root.querySelector(s);
  const T = '/img/teste/';
  // scene -> [label, stickers]; 'a' marks animated stickers that have a -hd version
  const SCENES = {
    bomdia: ['Bom dia', ['1', '2', '3a', '4a', '5']],
    treino: ['Treino', ['1', '2a', '3', '4a', '5']],
    praia: ['Praia', ['1', '2', '3a', '4', '5']],
    date: ['Date', ['1a', '2', '3a', '4', '5a']],
    niver: ['Niver', ['1', '2a', '3', '4a', '5']],
    cafe: ['Café', ['1a', '2a', '3', '4a', '5a']],
    natal: ['Natal', ['1', '2', '3', '4', '5']],
    pet: ['Pet', ['1', '2', '3', '4', '5']],
  };
  const stk = (k, s) => ({ t: `${T}${k}-${parseInt(s)}.webp`, hd: s.endsWith('a') ? `${T}${k}-${parseInt(s)}-hd.webp` : `${T}${k}-${parseInt(s)}.webp` });
  const beacon = plan => { try { navigator.sendBeacon('https://storieslab-app.tanpzdigital-183.workers.dev/api/ab', JSON.stringify({ v: 'a', e: 'try', plan })); } catch {} };

  const phone = $('#xpPhone'), tray = $('#xpTray'), step = $('#xpStep'), trash = $('#xpTrash');
  let scene = 'bomdia', photo = '', items = [], z = 10, menu = null, used = new Set();

  $('#xpScenes').insertAdjacentHTML('afterbegin', Object.entries(SCENES).map(([k, [l]]) =>
    `<button type="button" data-k="${k}" aria-pressed="${k === scene}"><img src="${T}${k}.webp" alt="" loading="lazy">${l}</button>`).join(''));
  requestAnimationFrame(() => { $('#xpScenes').scrollLeft = 0; });

  function setScene(k) {
    scene = k; photo = ''; clearAll();
    phone.style.backgroundImage = `url(${T}${k}.webp)`;
    root.querySelectorAll('#xpScenes [data-k]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
    $('#xpMine').setAttribute('aria-pressed', 'false');
    fillTray();
  }
  function fillTray() {
    tray.innerHTML = SCENES[scene][1].map((s, i) => `<button type="button" data-i="${i}" aria-label="Adicionar figurinha ${i + 1}" style="background-image:url(${T}${scene}.webp)"><img src="${stk(scene, s).t}" alt="" loading="lazy"></button>`).join('');
  }
  function clearAll() {
    items.forEach(it => it.el.remove()); items = []; used.clear(); menu?.remove(); menu = null;
    phone.classList.remove('on');
    if (!$('.xp-hint')) phone.insertAdjacentHTML('beforeend', '<div class="xp-hint">Toque aqui 👆</div>');
    step.textContent = '1. Toque na foto e escolha “Colar”';
    $('#xpSave').disabled = true;
  }

  // geometry helpers: x/y in % of the phone, w in % of phone width, r in degrees
  const box = () => phone.getBoundingClientRect();
  const pct = e => { const r = box(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const apply = it => { const s = it.el.style; s.left = it.x + '%'; s.top = it.y + '%'; s.width = it.w + '%'; s.transform = `translate(-50%,-50%) rotate(${it.r}deg)`; };

  function add(i, x, y, w) {
    const s = stk(scene, SCENES[scene][1][i]);
    const el = document.createElement('div'); el.className = 'xp-st';
    el.innerHTML = `<img src="${s.hd}" alt="" draggable="false">`;
    const it = { el, x, y, w, r: (Math.random() * 10 - 5) | 0 };
    el.style.zIndex = ++z; phone.append(el); apply(it); items.push(it); used.add(i);
    $('.xp-hint')?.remove(); phone.classList.add('on'); $('#xpSave').disabled = false;
    step.textContent = '2. Arraste · use dois dedos pra aumentar ou girar';
    return it;
  }

  // tap the photo -> "Colar" bubble (like Instagram) -> first sticker of the scene
  phone.addEventListener('click', e => {
    if (items.length || e.target.closest('.xp-st, .xp-paste')) return;
    const [x, y] = pct(e);
    menu?.remove();
    menu = document.createElement('button'); menu.type = 'button'; menu.className = 'xp-paste'; menu.textContent = 'Colar';
    menu.style.left = x + '%'; menu.style.top = y + '%';
    menu.onclick = ev => { ev.stopPropagation(); menu.remove(); menu = null; add(0, clamp(x, 22, 78), clamp(y, 18, 70), 46); beacon('paste'); };
    phone.append(menu);
  });
  tray.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.i;
    add(i, 25 + Math.random() * 50, 20 + Math.random() * 50, 34); beacon('add');
  });

  // gestures: 1 pointer drags, 2 pointers pinch (scale + rotate + move). The second finger may land off the sticker.
  const pts = new Map(); let cur = null, g = null, pinched = false;
  const itemOf = el => items.find(it => it.el === el);
  const startGesture = () => {
    const p = [...pts.values()];
    g = { x: cur.x, y: cur.y, w: cur.w, r: cur.r, p: p.map(q => [q.x, q.y]) };
    if (p.length > 1) { const [a, b] = p; g.d = Math.hypot(b.x - a.x, b.y - a.y); g.a = Math.atan2(b.y - a.y, b.x - a.x); g.m = [(a.x + b.x) / 2, (a.y + b.y) / 2]; }
  };
  phone.addEventListener('pointerdown', e => {
    const el = e.target.closest('.xp-st');
    if (!el && !cur) return;
    if (el && !cur) { cur = itemOf(el); cur.el.style.zIndex = ++z; cur.el.classList.add('drag'); }
    if (pts.size >= 2) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    phone.setPointerCapture(e.pointerId);
    startGesture();
  });
  phone.addEventListener('pointermove', e => {
    if (!cur || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = box(), p = [...pts.values()];
    if (p.length === 1) {
      cur.x = clamp(g.x + (p[0].x - g.p[0][0]) / r.width * 100, 0, 100);
      cur.y = clamp(g.y + (p[0].y - g.p[0][1]) / r.height * 100, 0, 100);
      phone.classList.add('dragging');
      const t = trash.getBoundingClientRect(), hot = Math.hypot(e.clientX - (t.left + t.width / 2), e.clientY - (t.top + t.height / 2)) < 44;
      trash.classList.toggle('hot', hot); cur.el.classList.toggle('doom', hot);
    } else {
      const [a, b] = p, d = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
      cur.w = clamp(g.w * d / g.d, 12, 110);
      cur.r = g.r + (ang - g.a) * 180 / Math.PI;
      cur.x = clamp(g.x + ((a.x + b.x) / 2 - g.m[0]) / r.width * 100, 0, 100);
      cur.y = clamp(g.y + ((a.y + b.y) / 2 - g.m[1]) / r.height * 100, 0, 100);
      pinched = true;
    }
    apply(cur);
  });
  const end = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size) { startGesture(); return; }       // one finger left: keep dragging from here
    if (trash.classList.contains('hot')) { cur.el.remove(); items = items.filter(it => it !== cur); beacon('trash'); if (!items.length) clearAll(); }
    if (pinched) { beacon('pinch'); pinched = false; }
    cur?.el.classList.remove('drag', 'doom'); trash.classList.remove('hot'); phone.classList.remove('dragging'); cur = null; g = null;
  };
  phone.addEventListener('pointerup', end);
  phone.addEventListener('pointercancel', end);
  // desktop: wheel resizes, shift+wheel rotates
  phone.addEventListener('wheel', e => {
    const it = itemOf(e.target.closest('.xp-st')); if (!it) return;
    e.preventDefault();
    if (e.shiftKey) it.r += e.deltaY > 0 ? 6 : -6; else it.w = clamp(it.w * (e.deltaY > 0 ? 0.93 : 1.07), 12, 110);
    apply(it);
  }, { passive: false });

  // chips
  $('#xpScenes').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { setScene(b.dataset.k); beacon('scene_' + b.dataset.k); } });
  $('#xpMine').onclick = () => $('#xpFile').click();
  $('#xpFile').onchange = e => {
    const f = e.target.files?.[0]; if (!f) return;
    photo = URL.createObjectURL(f); phone.style.backgroundImage = `url(${photo})`;
    root.querySelectorAll('#xpScenes [data-k]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#xpMine').setAttribute('aria-pressed', 'true'); beacon('photo');
  };
  $('#xpReset').onclick = () => { clearAll(); beacon('reset'); };

  // download the Story (1080x1920). Animated stickers are drawn at their current frame.
  const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  $('#xpSave').onclick = async () => {
    const btn = $('#xpSave'), label = btn.textContent; btn.disabled = true; btn.textContent = 'Preparando…';
    try {
      const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'), bg = await load(photo || `${T}${scene}.webp`);
      const sc = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
      x.drawImage(bg, (W - bg.naturalWidth * sc) / 2, (H - bg.naturalHeight * sc) / 2, bg.naturalWidth * sc, bg.naturalHeight * sc);
      for (const it of [...items].sort((a, b) => a.el.style.zIndex - b.el.style.zIndex)) {
        const im = it.el.querySelector('img'), w = it.w / 100 * W, h = w * im.naturalHeight / im.naturalWidth;
        x.save(); x.translate(it.x / 100 * W, it.y / 100 * H); x.rotate(it.r * Math.PI / 180);
        x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 16; x.shadowOffsetY = 6;
        x.drawImage(im, -w / 2, -h / 2, w, h); x.restore();
      }
      x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 8; x.fillStyle = 'rgba(255,255,255,.9)';
      x.font = '600 30px system-ui, sans-serif'; x.textAlign = 'right'; x.fillText('@storieslab.app', W - 44, H - 60);
      const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.92)), file = new File([blob], 'meu-story-storieslab.jpg', { type: 'image/jpeg' });
      beacon('download');
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] }).catch(() => {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); a.remove(); }
    } catch { step.textContent = 'Não deu pra salvar agora. Tente de novo.'; }
    btn.disabled = false; btn.textContent = label;
  };

  setScene(scene);
})();
