// Social proof media + live client count for the 07/11 sales-page changes.
(() => {
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (local) document.documentElement.classList.add('pv'); // show empty slots only in preview

  const hideIfEmpty = box => {
    if (box && !box.querySelector('.ok')) box.classList.add('none');
  };
  const vids = document.querySelector('.sp-vids'), prints = document.querySelector('.sp-prints');
  let pending = 0;
  const done = () => {
    if (--pending) return;
    hideIfEmpty(vids); hideIfEmpty(prints);
    if (vids && vids.querySelectorAll('.ok').length <= 2) vids.classList.add('few'); // center 1-2 videos, bigger
  };

  // Videos play only while visible
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { threshold: 0.4 }) : null;

  // iOS never fires loadeddata before play() with preload=metadata, so: muted+autoplay, observe right away,
  // and count the slot as filled on loadedmetadata.
  document.querySelectorAll('.sp-vid video[data-src]').forEach(v => {
    pending++;
    let seen = false;
    const ok = () => { if (seen) return; seen = true; v.parentElement.classList.add('ok'); done(); };
    v.addEventListener('loadedmetadata', ok, { once: true });
    v.addEventListener('loadeddata', ok, { once: true });
    v.addEventListener('error', () => { if (seen) return; seen = true; v.parentElement.classList.add('empty'); done(); }, { once: true });
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    if (!v.poster) v.poster = v.dataset.src.replace(/\.mp4$/, '.jpg');
    v.preload = 'auto';
    // page speed (07/11): fetch the video only when it is about one screen away, not on page open
    const start = () => { v.src = v.dataset.src; io ? io.observe(v) : v.play().catch(() => {}); };
    if (!io) return start();
    const near = new IntersectionObserver(es => { if (es[0].isIntersecting) { near.disconnect(); start(); } }, { rootMargin: '900px 0px' });
    near.observe(v);
  });
  document.querySelectorAll('.sp-print img[data-src]').forEach(img => {
    pending++;
    img.onload = () => { img.parentElement.classList.add('ok'); done(); };
    img.onerror = () => { img.parentElement.classList.add('empty'); done(); };
    img.src = img.dataset.src;
  });

})();

// "Teste agora": cycle the example photos until the visitor interacts (user 07/11).
(() => {
  return; // Preview: the visitor controls scene changes.
  const xp = document.getElementById('xp'), row = document.getElementById('xpScenes');
  if (!xp || !row || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // auto clicks must not count as visitor choices in the A/B beacons
  let auto = false;
  const send = navigator.sendBeacon && navigator.sendBeacon.bind(navigator);
  if (send) navigator.sendBeacon = (u, d) => (auto ? true : send(u, d));
  let stopped = false, visible = false, timer = 0;
  const stop = () => { stopped = true; clearInterval(timer); };
  ['pointerdown', 'keydown', 'wheel'].forEach(t => xp.addEventListener(t, e => { if (e.isTrusted) stop(); }, { capture: true, passive: true }));
  const next = () => {
    if (stopped || !visible || document.hidden) return;
    const bs = [...row.querySelectorAll('[data-k]')];
    const i = bs.findIndex(b => b.getAttribute('aria-pressed') === 'true');
    const b = bs[(i + 1) % bs.length];
    auto = true; b.click(); auto = false;
    row.scrollTo({ left: b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 }).observe(xp);
  timer = setInterval(next, 1400);
})();

// "Agora imagina isso no seu Instagram": endless stream of new notifications (user 07/11).
(() => {
  const box = document.getElementById('dms'); if (!box) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  box.setAttribute('aria-live', 'off'); // a never-ending stream must not be read aloud
  const heart = box.querySelector('.hrt');
  const POOL = [
    ['Sua irmã', 'amei esse Story 😍'], ['Sua tia', null], ['Sua cliente', 'quero agendar! 💅'],
    ['Sua vizinha', 'que foto linda!!'], ['Sua amiga', 'me ensina a fazer assim?'], ['Sua prima', null],
    ['Sua chefe', 'ficou muito profissional 👏'], ['Sua colega', 'onde você achou essa figurinha??'],
    ['Sua amiga da academia', 'me passa o nome do app?'], ['Sua madrinha', 'que lindaaa ❤️'],
    ['Sua amiga', 'que Story lindo 😍'], ['Sua cunhada', null], ['Sua seguidora', 'qual app você usa?'],
  ];
  let n = 0, visible = false;
  const row = () => {
    const [name, msg] = POOL[n % POOL.length];
    const el = document.createElement('div'); el.className = 'dm dm-in';
    el.innerHTML = `<img class="av" src="/img/av-${(n % 4) + 1}.webp" alt="" width="36" height="36"><p><b></b><span></span></p><time>agora</time>`;
    el.querySelector('b').textContent = name;
    el.querySelector('span').textContent = msg || 'curtiu seu story';
    if (msg || !heart) el.insertAdjacentHTML('beforeend', '<i class="new"></i>'); else el.append(heart.cloneNode(true));
    n++; return el;
  };
  const tick = () => {
    if (!visible || document.hidden) return;
    const rows = box.querySelectorAll('.dm');
    rows.forEach((r, i) => { const t = r.querySelector('time'); if (t) t.textContent = i === 0 ? '1 min' : (i + 1) + ' min'; });
    box.querySelector('.dms-h').after(row());
    const all = box.querySelectorAll('.dm');
    if (all.length > 4) all[all.length - 1].remove();
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 }).observe(box);
  setTimeout(() => setInterval(tick, 2200), 2400); // after the first fill-in animation
})();

// Top bar: countdown to midnight, same deadline as the "hoje, dd/mm" date.
(() => {
  const el = document.getElementById('tbClock'); if (!el) return;
  const p = n => String(n).padStart(2, '0');
  const tick = () => {
    const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    el.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
  };
  tick(); setInterval(tick, 1000);
})();

// Modals: load + play the demo video only while a v2 modal is open.
document.querySelectorAll('.ds-v2').forEach(d => {
  const v = d.querySelector('video[data-dv-src]'); if (!v) return;
  new MutationObserver(() => {
    if (d.open) { if (!v.src) v.src = v.dataset.dvSrc; v.play().catch(() => {}); } else v.pause();
  }).observe(d, { attributes: true, attributeFilter: ['open'] });
});

// Sticky price bar: shown only while the "Do app ao seu Story" section is on screen.
(() => {
  const st = document.getElementById('sticky'), zone = document.getElementById('como-usar');
  if (!st || !zone) return;
  new IntersectionObserver(([e]) => st.classList.toggle('zone', e.isIntersecting), { threshold: 0.15 }).observe(zone);
})();

// "+ 6 bônus de presente" as gift cards (user 07/11): one tap flips the card and reveals the bonus (scratching was hard on mobile).
(() => {
  return; // Preview: all bonus covers and names are visible immediately.
  const grid = document.getElementById('bonus-preview'); if (!grid) return;
  const cards = [...grid.querySelectorAll('.bonus')]; if (!cards.length) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hint = document.createElement('p'); hint.className = 'scr-hint';
  grid.before(hint);
  let opened = 0;
  const paintHint = () => {
    hint.innerHTML = opened === cards.length ? '🎉 <b>Os 6 bônus são seus</b> no Premium'
      : opened ? `<b>${opened} de ${cards.length}</b> revelados. Toque nos outros 👇` : 'Toque nos cartões e descubra seus presentes 👇';
  };
  paintHint();

  // "Quanto vale tudo isso": each bonus row unlocks when its card is scratched. Rows still locked when the
  // box comes into view unlock one by one, so nobody misses the value.
  const rows = [...document.querySelectorAll('.vt2 li')].slice(1);
  rows.forEach(r => r.classList.add('lock'));
  const unlock = k => { const r = rows[k]; if (r && r.classList.contains('lock')) { r.classList.remove('lock'); r.classList.add('unlocked'); } };
  rows.forEach((r, k) => r.addEventListener('click', () => {
    if (!r.classList.contains('lock')) return;
    const c = cards[k]; c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    c.classList.remove('nudge'); void c.offsetWidth; c.classList.add('nudge');
  }));

  // All 6 scratched: congrats toast with a short synthesized chime, then it fades away.
  const celebrate = () => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {  // C E G C arpeggio
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.11;
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.6);
      });
      setTimeout(() => ac.close(), 1500);
    } catch {}
    const box = document.createElement('div');
    box.className = 'scr-win'; box.setAttribute('role', 'status');
    box.innerHTML = '<div class="scr-win-card"><span class="scr-win-emoji" aria-hidden="true">🎉</span><b>Parabéns!</b>'
      + '<p>Você desbloqueou os <strong>6 bônus</strong>, que valem R$ 100, de presente no Premium.</p></div>';
    document.body.append(box);
    if (!calm) for (let i = 0; i < 40; i++) {
      const s = document.createElement('i'); s.className = 'scr-conf scr-conf-big';
      s.style.cssText = `--x:${(Math.random() * 2 - 1) * 260}px;--y:${-120 - Math.random() * 260}px;--c:${['#FF2D7A', '#FFE14D', '#14A35B', '#8B5CF6'][i % 4]};animation-delay:${Math.random() * 0.2}s`;
      box.append(s);
    }
    requestAnimationFrame(() => box.classList.add('in'));
    const bye = () => { box.classList.remove('in'); setTimeout(() => box.remove(), 500); };
    box.addEventListener('click', bye);
    setTimeout(bye, 3800);
  };

  cards.forEach((card, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'scrx'; btn.setAttribute('aria-label', `Revelar o bônus ${idx + 1}`);
    const cv = document.createElement('canvas'); btn.append(cv); card.append(btn); card.classList.add('scr-card');
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, done = false;

    const paint = () => {
      const r = card.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height; if (!w || !h) return;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#FF7EB0'); g.addColorStop(.45, '#FF2D7A'); g.addColorStop(.75, '#F7B733'); g.addColorStop(1, '#FFE38A');
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.28)';  // foil sparkle
      for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc((i * 73 % 101) / 101 * w, (i * 37 % 97) / 97 * h, (i % 3) + .8, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = `${Math.round(Math.min(w, h) * .26)}px system-ui`; ctx.fillText('🎁', w / 2, h * .42);
      ctx.font = `800 ${Math.max(11, Math.round(w * .085))}px system-ui`; ctx.fillText(`BÔNUS 0${idx + 1}`, w / 2, h * .6);
      ctx.font = `600 ${Math.max(10, Math.round(w * .075))}px system-ui`; ctx.fillText('Toque pra abrir ✨', w / 2, h * .7);
    };
    const reveal = () => {
      if (done) return; done = true; opened++; paintHint();
      if (opened === cards.length) setTimeout(celebrate, 650);
      unlock(idx);
      btn.classList.add('gone'); card.classList.add('won'); btn.tabIndex = -1;
      if (!calm) for (let i = 0; i < 14; i++) {
        const s = document.createElement('i'); s.className = 'scr-conf';
        s.style.cssText = `--x:${(Math.random() * 2 - 1) * 90}px;--y:${-40 - Math.random() * 90}px;--c:${['#FF2D7A', '#FFE14D', '#14A35B', '#8B5CF6'][i % 4]}`;
        card.append(s); setTimeout(() => s.remove(), 900);
      }
      setTimeout(() => btn.remove(), 600);
    };
    btn.addEventListener('click', () => {
      if (done || btn.classList.contains('flip')) return;
      if (calm) return reveal();
      btn.classList.add('flip'); setTimeout(reveal, 380);
    });
    paint();
    new ResizeObserver(() => { if (!done) paint(); }).observe(card);
  });
})();

// "Olha tudo que vem no Premium" (mobile carousel): slides on its own without stopping (user 07/11).
// A touch pauses it for a few seconds so the visitor can swipe, then it carries on.
(() => {
  const row = document.querySelector('.tools3'); if (!row) return;
  const items = [...row.children]; if (items.length < 2) return;
  let i = 0, holdUntil = 0, visible = false;
  const hold = () => { holdUntil = Date.now() + 5000; };
  ['pointerdown', 'wheel', 'touchstart'].forEach(t => row.addEventListener(t, hold, { passive: true }));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 }).observe(row);
  setInterval(() => {
    if (!visible || document.hidden || Date.now() < holdUntil || row.scrollWidth <= row.clientWidth + 4) return;
    // continue from wherever the visitor left it
    const mid = row.scrollLeft + row.clientWidth / 2;
    i = items.reduce((best, el, k) => Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid) < Math.abs(items[best].offsetLeft + items[best].offsetWidth / 2 - mid) ? k : best, 0);
    i = (i + 1) % items.length;
    const el = items[i];
    row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
  }, 2800);
})();
