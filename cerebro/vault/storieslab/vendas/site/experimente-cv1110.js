// "Teste agora" Story simulator (owner 02/11). Same flow as the quiz (tap the photo, "Colar", drag), plus:
// pinch with two fingers to resize/rotate (wheel on desktop, shift+wheel rotates), drag to the trash to delete,
// 8 example scenes with real stickers (animated ones play), her own photo (never uploaded), download as 1080x1920.
(() => {
  const root = document.getElementById('xp'); if (!root) return;
  const $ = s => root.querySelector(s);
  const T = '/img/teste/';
  const scenePhoto = key => `/media/cv1110/photos/${key}.jpg`;
  // Sticker kits (owner 16/11: "usar figurinhas melhores"): bold, colourful ones first, animated ones mixed in.
  // 't:name' = /img/teste/name.webp ('*' = animated: small file in the tray, -hd file on the Story);
  // 'c:name' = the thinner cv1110 set (220px copy in the tray). 7 per kit: one big tile + 3 rows of 2.
  const SCENES = {
    bomdia: ['Bom dia', ['t:bomdia-1', 't:bomdia-3*', 't:bomdia-2', 'c:bomdia-4', 't:bomdia-4*', 't:bomdia-5', 'c:bomdia-2']],
    treino: ['Treino', ['t:treino-1', 't:treino-2*', 't:treino-3', 'c:treino-2', 't:treino-5', 'c:treino-3', 'c:treino-1']],
    praia: ['Praia', ['t:praia-2', 't:praia-1', 't:praia-3*', 'c:praia-1', 't:praia-5', 't:praia-4', 'c:praia-2']],
    date: ['A dois', ['t:date-2', 't:date-1*', 't:date-4', 'c:date-4', 't:praia-3*', 'c:date-3', 'c:date-1']],
    cafe: ['Café', ['t:cafe-3', 't:cafe-1*', 't:bomdia-4*', 'c:cafe-2', 'c:cafe-4', 'c:cafe-1', 'c:cafe-3']],
  };
  // her own photo gets the stickers that work on any picture
  const MINE = ['t:bomdia-3*', 't:praia-2', 't:date-2', 't:treino-1', 't:praia-3*', 't:praia-5', 't:date-1*'];
  const kit = () => photo ? MINE : SCENES[scene][1];
  const stk = id => {
    const [set, raw] = id.split(':'), anim = raw.endsWith('*'), n = raw.replace('*', '');
    if (set === 'c') return { t: `/img/cv1110/stickers/t/${n}.webp`, hd: `/img/cv1110/stickers/${n}.webp` };
    return { t: `${T}${n}.webp`, hd: `${T}${n}${anim ? '-hd' : ''}.webp` };
  };
  const bgNow = () => photo || `/media/cv1110/photos/t/${scene}.webp`;
  // the tray (one animated sticker is ~560 KB) loads only when this section is near, so it never competes
  // with the first screen and the tracking scripts
  let near = false;
  const showTray = () => { if (near) return; near = true; fillTray(); root.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); }); if (!photo) phone.style.backgroundImage = `url(/media/cv1110/photos/m/${scene}.webp)`; };
  const nearIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { nearIO.disconnect(); showTray(); } }, { rootMargin: '300px 0px' });
  nearIO.observe(root);
  // safety net: at the latest 4 s after the page has loaded
  addEventListener('load', () => setTimeout(() => { nearIO.disconnect(); showTray(); }, 4000));
  const beacon = plan => { try { navigator.sendBeacon('https://storieslab-app.tanpzdigital-183.workers.dev/api/ab', JSON.stringify({ v: 'a', e: 'try', plan })); } catch {} };

  const phone = $('#xpPhone'), tray = $('#xpTray'), step = $('#xpStep'), trash = $('#xpTrash');
  let scene = 'praia', photo = '', items = [], z = 10, menu = null, used = new Set();

  $('#xpScenes').insertAdjacentHTML('afterbegin', Object.entries(SCENES).map(([k, [l]]) =>
    `<button type="button" data-k="${k}" aria-pressed="${k === scene}"><img ${near ? 'src' : 'data-src'}="/media/cv1110/photos/t/${k}.webp" alt="">${l}</button>`).join(''));
  requestAnimationFrame(() => { $('#xpScenes').scrollLeft = 0; });

  function setScene(k) {
    scene = k; photo = ''; clearAll();
    if (near) phone.style.backgroundImage = `url(/media/cv1110/photos/m/${k}.webp)`; // 720px for the screen; the saved Story still uses the full photo
    root.querySelectorAll('#xpScenes [data-k]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
    $('#xpMine').setAttribute('aria-pressed', 'false');
    fillTray();
  }
  // each tile shows the sticker on top of the current photo (hers or the scene's), so she previews the result
  function fillTray() {
    tray.innerHTML = kit().map((s, i) => `<button type="button" data-i="${i}" aria-label="Adicionar figurinha ${i + 1}" style="${near ? `--bg:url(${bgNow()})` : ''}"><img ${near ? 'src' : 'data-src'}="${stk(s).t}" alt=""></button>`).join('');
  }
  function clearAll() {
    step.classList.remove('cv-error');
    items.forEach(it => it.el.remove()); items = []; used.clear(); menu?.remove(); menu = null;
    tray.querySelectorAll('button.on').forEach(b => b.classList.remove('on'));
    phone.classList.remove('on');
    if (!$('.xp-hint')) phone.insertAdjacentHTML('beforeend', '<div class="xp-hint">Toque para criar <span>＋</span></div>');
    step.textContent = 'Toque em uma figurinha para adicionar.';
    $('#xpSave').disabled = true;
  }

  // geometry helpers: x/y in % of the phone, w in % of phone width, r in degrees
  const box = () => phone.getBoundingClientRect();
  const pct = e => { const r = box(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const apply = it => { const s = it.el.style; s.left = it.x + '%'; s.top = it.y + '%'; s.width = it.w + '%'; s.transform = `translate(-50%,-50%) rotate(${it.r}deg)`; };

  function add(i, x, y, w) {
    if (!items.length && !photo) {
      const cfg=window.SL_EXAMPLES?.hero[scene]||window.SL_EXAMPLES?.gallery[scene]?.[0];
      if(cfg){const p=cfg.zones[0],image=tray.querySelector(`button[data-i="${i}"] img`),ratio=image?.naturalWidth/image?.naturalHeight||2;x=p[0]+p[2]/2;y=p[1]+p[3]/2;w=Math.min(p[2],p[3]*16/9*ratio);}
    }
    const s = stk(kit()[i]);
    // a sticker she has not touched yet gets swapped in place, so trying several feels like flipping through them
    const last = items[items.length - 1];
    if (last && last.fresh) {
      last.el.querySelector('img').src = s.hd; last.i = i; markTray(i);
      step.textContent = 'Gostou? Arraste pra posicionar ou toque em outra pra trocar';
      return last;
    }
    const el = document.createElement('div'); el.className = 'xp-st';
    el.innerHTML = `<img src="${s.hd}" alt="" draggable="false">`;
    const it = { el, x, y, w, i, fresh: true, r: (Math.random() * 10 - 5) | 0 };
    el.style.zIndex = ++z; phone.append(el); apply(it); items.push(it); used.add(i); markTray(i);
    $('.xp-hint')?.remove(); phone.classList.add('on'); $('#xpSave').disabled = false;
    step.textContent = 'Toque em outra figurinha pra trocar · arraste pra posicionar';
    return it;
  }
  const markTray = i => tray.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));

  // In this proposal, one tap gives an immediate result; dragging and pinching stay intact.
  phone.addEventListener('click', e => {
    if (items.length || e.target.closest('.xp-st')) return;
    add(0, 50, 30, 62); beacon('paste');
  });
  phone.tabIndex=0;
  phone.setAttribute('role','button');
  phone.setAttribute('aria-label','Adicionar uma figurinha ao Story');
  phone.addEventListener('keydown',e=>{if(e.target===phone && ['Enter',' '].includes(e.key)){e.preventDefault(); if(!items.length)add(0,50,30,62);}});
  tray.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.i;
    add(i, 30 + Math.random() * 40, 18 + Math.random() * 40, photo ? 56 : 44); beacon('add');
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
    if (el && !cur) { cur = itemOf(el); cur.fresh = false; cur.el.style.zIndex = ++z; cur.el.classList.add('drag'); }
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
    clearAll(); fillTray(); add(0, 50, 20, 62);
    step.textContent = 'Ficou lindo, né? Toque nas figurinhas pra trocar ou arraste pra posicionar';
    phone.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  $('#xpReset').onclick = () => { clearAll(); beacon('reset'); };

  // download the Story (1080x1920). Animated stickers are drawn at their current frame.
  const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  $('#xpSave').onclick = async () => {
    step.classList.remove('cv-error');
    const btn = $('#xpSave'), label = btn.textContent; btn.disabled = true; btn.textContent = 'Preparando…';
    try {
      const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d'), bg = await load(photo || `${scenePhoto(scene)}`);
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
      const download = () => {
        const a = document.createElement('a'), url = URL.createObjectURL(blob);
        a.href = url; a.download = file.name; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      };
      if (navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
        try { await navigator.share({ files: [file] }); }
        catch (error) { if (error.name !== 'AbortError') download(); }
      } else download();
    } catch { step.classList.add('cv-error'); step.textContent = 'Não deu pra salvar agora. Tente de novo.'; }
    btn.disabled = false; btn.textContent = label;
  };

  setScene(scene);
})();
