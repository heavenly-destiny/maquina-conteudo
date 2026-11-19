"""Pilot v2: talking head stays clean, intercut with full-screen motion scenes.
build/<u>m.txt sections: TIMES (python), CSS, HTML, JS, SFX (python list).  Run: <venv python> make2.py u1"""
import json, os, re, shutil, sys, unicodedata
import numpy as np
import make as M

norm = lambda x: re.sub(r"[^a-z0-9]", "", "".join(c for c in unicodedata.normalize("NFD", x.lower()) if unicodedata.category(c) != "Mn"))

for u in sys.argv[1:]:
    D = json.load(open(f"build/{u}.json")); src = open(f"build/{u}m.txt").read()
    def W(k, o=0, end=False):
        n = 0
        for x in D["words"]:
            if norm(x[0]) == norm(k):
                if n == o: return x[2] if end else x[1]
                n += 1
        raise SystemExit(f"{u}: word {k} {o}")
    sec = dict(re.findall(r"===(\w+)===\n(.*?)(?====\w+===|\Z)", src, re.S))
    env = {"W": W, "D": D, "TOTAL": D["total"]}; exec(sec["TIMES"], env)
    T = {k: round(v, 3) for k, v in env.items() if k.startswith("T_")}
    sfx = eval(sec["SFX"], env)
    html = sec["HTML"]
    if "SHARED" in sec:
        sec["CSS"] = open("build/shared.css").read() + sec["CSS"]
        html = html + open("build/shared.html").read()
        sec["JS"] = open("build/shared.js").read() + sec["JS"]
    if "T_B1" in T: html = html.replace("__B1D__", f"{T['T_B2'] - T['T_B1'] + 0.05:.3f}").replace("__B2D__", f"{T.get('T_A', T.get('T_A2', 0)) - T['T_B2'] + 0.05:.3f}")
    for k, v in T.items(): html = html.replace(f"__{k}__", f"{v:.3f}")
    js = "\n".join(f"      const {k} = {v};" for k, v in T.items()) + "\n" + sec["JS"]
    lib = open("lib2.html").read()
    if os.path.exists(f"assets/{u}-cut.webm"):
        imgs = ["comida-2", "treino-3", "rotina-2", "beleza-1", "fe-2", "rotina-5"]
        pos = [(-40, 120, 1, 1.0), (790, 160, 1, 1.0), (-90, 760, 0, 0.85), (860, 820, 0, 0.85), (330, -60, 0, 0.7), (560, -120, 0, 0.6)]
        cards = "".join(f'<div class="fc{" far" if far == 0 else ""}" style="left:{x}px;top:{y}px;transform:scale({sc});background-image:url(assets/site/{im}.webp)"></div>' for im, (x, y, far, sc) in zip(imgs, pos))
        bk = "".join(f'<div class="bk" style="left:{(i * 137) % 1080}px;top:{900 + (i * 211) % 1100}px;width:{20 + (i * 7) % 30}px;height:{20 + (i * 7) % 30}px"></div>' for i in range(12))
        lib = lib.replace('<div id="cam"><video id="talk" class="clip" src="assets/__U__-talk.mp4" muted playsinline',
                          f'<div id="cam"><video id="orig" class="clip" src="assets/{u}-talk.mp4" muted playsinline data-start="0" data-duration="{D["total"]:.2f}" data-track-index="9"></video><div class="ubg" id="ubg"><div class="g1"></div><div class="g2"></div>{cards}{bk}</div><video id="talk" class="clip cut" data-layout-allow-occlusion src="assets/__U__-cut.webm" muted playsinline')
    out = (lib.replace("/*__CSS__*/", sec["CSS"]).replace("<!--__HTML__-->", html).replace("/*__JS__*/", js)
           .replace("__DATA__", json.dumps(D, ensure_ascii=False)).replace("__VO__", '{"lines": []}').replace("__TOTAL__", f"{D['total']:.2f}").replace("__U__", u))
    os.makedirs(u, exist_ok=True); open(f"{u}/index.html", "w").write(out)
    # mix: voice + music bed + the scene's own SFX list
    SR = M.SR; N = int(D["total"] * SR); tax = np.arange(N) / SR
    vo = M.load(f"assets/{u}-voice.wav")[:N]; vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    full = M.load(f"assets/music/{D['music']}.mp3"); mono = full.mean(axis=1)
    # beat grid: spectral-flux onsets, period by autocorrelation, phase by grid energy
    h = 512; fr = np.lib.stride_tricks.sliding_window_view(mono, 2048)[::h]
    Sx = np.abs(np.fft.rfft(fr * np.hanning(2048), axis=1)); flux = np.maximum(0, np.diff(np.log1p(Sx), axis=0)).sum(1); flux -= flux.mean()
    fps = SR / h; ac = np.correlate(flux, flux, "full")[len(flux) - 1:]; lag = np.arange(len(ac)) / fps
    sel = (lag > 60 / 170) & (lag < 60 / 75); P = lag[sel][np.argmax(ac[sel])]
    ph = max(np.arange(0, P, 1 / fps), key=lambda q: flux[np.clip(((q + np.arange(0, len(flux) / fps - P, P)) * fps).astype(int), 0, len(flux) - 1)].sum())
    beats = ph + np.arange(0, len(mono) / SR, P)
    keys = [T[k] for k in T if k in ("T_M1", "T_M1E", "T_M2", "T_P3", "T_B1", "T_B2", "T_A", "T_P2", "T_M3", "T_INK")]
    fr0 = env.get("MUSIC_FROM", 8.0)
    cand = np.arange(fr0, fr0 + 2 * P, 0.005)
    err = lambda o: sum(min(abs((beats - o) - k)) for k in keys)
    off = min(cand, key=err)
    print("music", D["music"], f"bpm {60 / P:.0f} offset {off:.2f} mean beat error {err(off) / len(keys) * 1000:.0f} ms")
    m = full[int(off * SR):]
    while len(m) < N: m = np.vstack([m, full[int(fr0 * SR):]])
    m = M.fade(m[:N].copy(), 0.05, 1.2)
    # intro under the hook: low-passed, opens on the first transition
    k = int(T.get("T_M1", 1.0) * SR); a = np.exp(-2 * np.pi * 900 / SR); y = np.zeros_like(m[:k])
    for c in (0, 1):
        z = 0.0; col = m[:k, c]; out = y[:, c]
        for i in range(k): z = (1 - a) * col[i] + a * z; out[i] = z
    m[:k] = y
    vr = np.sqrt(np.mean(vo[np.abs(vo[:, 0]) > 1e-3] ** 2)) + 1e-9; m *= vr / (np.sqrt(np.mean(m ** 2)) + 1e-9)
    hop = int(0.05 * SR); env_ = np.sqrt(np.mean(vo[: len(vo) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
    sp = (20 * np.log10(env_ + 1e-9) > -40).astype(float); dk = np.zeros_like(sp)
    for i in range(1, len(sp)): a = 0.55 if sp[i] > dk[i - 1] else 0.12; dk[i] = dk[i - 1] + a * (sp[i] - dk[i - 1])
    lvl = np.interp(tax, np.arange(len(dk)) * 0.05, -10 - dk * 8); lvl = np.where(tax > D["talk_end"], -5.0, lvl)
    m *= M.db(lvl)[:, None].astype(np.float32)
    fx = np.zeros((N, 2), np.float32)
    # same cut-out windows as the page (lib2 core): free talking-head gaps, every other one
    if os.path.exists(f"assets/{u}-cut.webm"):
        busy = []
        for key in ("MW", "PIP", "ORIG", "BROLL"):
            m_ = re.search(r"window\." + key + r" = (\[.*?\]);\n", sec["JS"], re.S)
            if m_: busy += eval(m_.group(1), env)
        busy.sort(); free = []; c = 0
        for a, b in busy:
            if a > c: free.append((c, a))
            c = max(c, b)
        if c < D["talk_end"]: free.append((c, D["talk_end"]))
        wins = [w for w in free if w[1] - w[0] >= 1.0 and w[0] > 0.05]
        print("cut-out windows", [(round(a, 2), round(b, 2)) for a, b in wins])
        for a, b in wins: sfx = list(sfx) + [("bloom", a, -15, 2), ("swish", a - 0.04, -17, 4), ("swish", b - 0.04, -19, -2)]
    # cut-backs to her (lib2 core): one fixed sound per transition type, a softer one on the way out
    m_ = re.search(r"window\.HER = (\[.*?\]);\n", sec["JS"], re.S)
    for i, (a, b) in enumerate(eval(m_.group(1)) if m_ else []):
        k = i % 3
        sfx = list(sfx) + [(("whoosh", "swish", "swish")[k], a - 0.05, -15, (0, 3, -2)[k]), ("pop", a + 0.02, -21, 5), ("swish", b - 0.12, -19, 6)]
    for h in sfx:
        name, t, lv, semis = h[:4]; trim = h[4] if len(h) > 4 else None
        c, pk = M.S(name, trim)
        if semis: c = M.pitch(c, semis); pk /= 2 ** (semis / 12)
        M.place(fx, M.fade(c, 0, 0.04), t - pk, lv + 6)
    o = vo + m + fx * M.db(-4); o = (o / max(np.max(np.abs(o)), 1e-6) * M.db(-1.5)).astype(np.float32)
    raw = f"/tmp/ugc2-{u}.f32"; open(raw, "wb").write(o.tobytes())
    import subprocess
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), f"assets/{u}-mix.wav"], check=True)
    os.remove(raw); print(u, "ok", D["total"], T)
