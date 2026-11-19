"""Film-style mix for the 3 Stories Lab creatives (numpy, sample-exact). Same recipe as motion-reel-premium mix4:
music spliced by measured energy + mood base curve + voice duck + hit duck, SFX placed by measured PEAK, panned, pitched,
reverb per mood, ambience bed, loudnorm -14 LUFS. Event times are derived from the same VO word times the HTML uses.
Run from videos/sl-criativos: venv/bin/python build/mix.py 1 2 3"""
import json, subprocess, sys
import numpy as np

SR = 48000
K1 = "../zupi-emocao/assets/sfx/"; K4 = "../zupi-emocao/assets/sfx4/"
rng = np.random.default_rng(5)
db = lambda x: 10 ** (x / 20)


def load(path, ss=0.0, t=None, af=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(t)] if t else []) + ["-i", path] + (["-af", af] if af else []) + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()


def place(bus, clip, start, gain_db=0.0):
    i = int(round(start * SR)); clip = clip * db(gain_db)
    if i < 0: clip, i = clip[-i:], 0
    clip = clip[: max(0, len(bus) - i)]; bus[i : i + len(clip)] += clip


def fade(c, fin=0.0, fout=0.06):
    c = c.copy(); a, b = int(fin * SR), int(fout * SR)
    if a: c[:a] *= np.linspace(0, 1, a)[:, None]
    if b: c[-b:] *= np.linspace(1, 0, b)[:, None]
    return c


def pan(c, p0, p1=None):
    p1 = p0 if p1 is None else p1; p = np.linspace(p0, p1, len(c)); a = (p + 1) * np.pi / 4; m = c.mean(axis=1)
    return np.stack([m * np.cos(a), m * np.sin(a)], axis=1) * np.sqrt(2)


def pitch(c, semis):
    r = 2 ** (semis / 12); idx = np.arange(0, len(c) - 1, r)
    return np.stack([np.interp(idx, np.arange(len(c)), c[:, k]) for k in (0, 1)], axis=1).astype(np.float32)


def reverb(c, decay=1.5, wet=0.3):
    n = int(decay * SR); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir /= np.sqrt(np.sum(ir ** 2))
    m = len(c) + n; F = 1 << int(np.ceil(np.log2(m)))
    o = np.stack([np.fft.irfft(np.fft.rfft(c[:, k], F) * np.fft.rfft(ir, F), F)[:m] for k in (0, 1)], axis=1)
    return (np.vstack([c, np.zeros((n, 2))]) * (1 - wet) + o * wet).astype(np.float32)


def loop_to(c, sec, xf=0.5):
    out = c.copy(); k = int(xf * SR)
    while len(out) < sec * SR:
        out[-k:] = out[-k:] * np.linspace(1, 0, k)[:, None] + c[:k] * np.linspace(0, 1, k)[:, None]; out = np.vstack([out, c[k:]])
    return out[: int(sec * SR)]


cache = {}
def S(path, trim=None):
    if path not in cache:
        c = load(path); e = np.abs(c).mean(axis=1); h = int(0.01 * SR)
        env = e[: len(e) // h * h].reshape(-1, h).max(axis=1); cache[path] = (c, np.argmax(env) * h / SR, 20 * np.log10(env.max() + 1e-9))
    c, pk, lv = cache[path]
    return (c[: int(trim * SR)] if trim else c).copy(), pk, lv


def mix(n, cfg):
    vo_meta = json.load(open(f"build/c{n}-vo.json")); TOTAL = vo_meta["total"]; N = int(TOTAL * SR); t_axis = np.arange(N) / SR
    W = lambda ln, i: vo_meta["lines"][ln]["words"][i][1]
    vo = load(f"assets/vo/c{n}.wav")[:N]; vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    E = cfg(W, TOTAL)

    music = np.zeros((N, 2), np.float32)
    for seg in E["music"]:
        src, ss, at, dur, fi, fo = seg[:6]; af = seg[6] if len(seg) > 6 else None
        place(music, fade(load(f"assets/music/{src}.mp3", ss, dur, af), fi, fo), at)
    base = np.interp(t_axis, *zip(*E["curve"]))
    hop = int(0.05 * SR); env = np.sqrt(np.mean(vo[: len(vo) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
    sp = (20 * np.log10(env + 1e-9) > -42).astype(float); d = np.zeros_like(sp)
    for i in range(1, len(sp)):
        a = (1 - np.exp(-0.05 / 0.06)) if sp[i] > d[i - 1] else (1 - np.exp(-0.05 / 0.35)); d[i] = d[i - 1] + a * (sp[i] - d[i - 1])
    duck = np.interp(t_axis, np.arange(len(d)) * 0.05, d * -7.0) * np.interp(t_axis, *zip(*E["duck_depth"]))
    hd = np.zeros(N)
    for t, dep in E["hit_duck"]:
        i = int(t * SR); att, rel = int(0.03 * SR), int(0.45 * SR); seg = np.concatenate([np.linspace(0, dep, att), np.linspace(dep, 0, rel)])
        j = max(0, i - att); hd[j : j + len(seg)] = np.minimum(hd[j : j + len(seg)], seg[: N - j])
    music *= db(base + duck + hd)[:, None].astype(np.float32)

    amb = np.zeros((N, 2), np.float32)
    for path, at, dur, lvl, fi, fo in E.get("amb", []):
        c, _, _ = S(path); place(amb, fade(loop_to(c, dur, 0.4), fi, fo), at, lvl)

    sfx = np.zeros((N, 2), np.float32)
    for h in E["sfx"]:
        path, t, lvl = h[0], h[1], h[2]; o = h[3] if len(h) > 3 else {}
        c, pk, _ = S(path, o.get("trim"))
        if o.get("trim") and pk > o["trim"]: pk = 0.0
        c = fade(c, 0, 0.05)
        if o.get("semis"): c = pitch(c, o["semis"]); pk /= 2 ** (o["semis"] / 12)
        c = pan(c, o.get("p0", 0.0), o.get("p1"))
        if o.get("wet"): c = reverb(c, o.get("decay", 1.4), o["wet"])
        place(sfx, c, t - pk, lvl)

    out = vo * db(E.get("vo_gain", 0)) + music + amb + sfx
    out = (out / max(np.max(np.abs(out)), 1e-6) * db(-1.5)).astype(np.float32)
    raw = f"/tmp/sl-mix-{n}.f32"; open(raw, "wb").write(out.tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw,
                    "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), f"assets/mix-c{n}.wav"], check=True)
    rms = [20 * np.log10(np.sqrt(np.mean(out[i * SR : (i + 1) * SR] ** 2)) + 1e-9) for i in range(int(TOTAL))]
    print(f"c{n} ok", " ".join(f"{r:.0f}" for r in rms))


# ---------------- per-creative sound design ----------------
TAP = (K1 + "tick.mp3", {"trim": 0.15, "semis": 5, "p0": 0.0})

def c1(W, TOTAL):
    T_DIVE = W(1, 0) - 0.3; T_IRIS = W(2, 0) - 0.4; T_PASTE = W(2, 19) - 0.15; T_W = W(3, 0) - 0.18; T_L = W(4, 0) - 0.3; T_INK = W(4, 19) - 0.4
    s = [
        # A curious: DMs ding in, panned in from the top-right
        (K1 + "ding.mp3", W(0, 3) + 0.1, -14, {"semis": 2, "p0": 0.3}), (K1 + "ding.mp3", W(0, 6) + 0.15, -15, {"semis": 4, "p0": -0.2}),
        (K1 + "ding.mp3", W(0, 8) + 0.1, -15, {"semis": 7, "p0": 0.2}),
        (K4 + "fall.mp3", T_DIVE + 0.5, -20, {"trim": 3.0, "wet": 0.35, "decay": 2.0}),   # dive into the secret
        (K1 + "heartbeat.mp3", 6.3, -12, {"trim": 1.4, "wet": 0.3}),
        (K1 + "swell.mp3", T_IRIS + 0.4, -8, {"trim": 2.0}), (K4 + "bloom.mp3", T_IRIS + 0.3, -8, {"wet": 0.2}),
        (K4 + "sparkles.mp3", T_IRIS + 0.6, -14, {"trim": 2.0, "p0": -0.5, "p1": 0.5}),
        (K4 + "land.mp3", T_IRIS + 1.0, 2, {"trim": 0.6}),                                # phone lands
        (*TAP[:1], W(2, 6) + 0.12, -6, TAP[1]), (K4 + "swish.mp3", W(2, 6) + 0.4, -2, {"trim": 1.2, "p0": 0.4, "p1": -0.4}),
        (*TAP[:1], W(2, 10) + 0.05, -6, TAP[1]), (K4 + "swish.mp3", W(2, 10) + 0.35, -3, {"trim": 1.2, "p0": 0.4, "p1": -0.4, "semis": 2}),
    ]
    for i in range(8):  # stickers burst out: rising pops across the stereo field
        s.append((K1 + "pop.mp3", W(2, 12) + 0.35 + i * 0.09, -14 + i * 0.3, {"trim": 0.5, "semis": i * 1.0, "p0": [-0.7, 0.7, -0.6, 0.6, -0.5, 0.5, 0.2, -0.2][i]}))
    s += [
        (K4 + "passby.mp3", W(2, 17) - 0.35, -16, {"trim": 0.9, "semis": 4}),              # stickers fly back in
        (*TAP[:1], W(2, 17) - 0.3, -6, TAP[1]), (K4 + "swish.mp3", W(2, 17) - 0.05, -4, {"trim": 1.2, "semis": -2}),
        (*TAP[:1], W(2, 18) + 0.12, -6, TAP[1]), (K1 + "ding.mp3", W(2, 18) + 0.3, -10, {"semis": 5}),   # Copiada!
        (K1 + "whoosh.mp3", T_PASTE + 0.3, -8, {"p0": -0.2, "p1": 0.6}),
        (K1 + "pop.mp3", W(2, 20) + 0.2, -5, {"trim": 0.5}), (K4 + "land.mp3", W(2, 20) + 0.2, 0, {"trim": 0.6}),
        (K1 + "pop.mp3", W(2, 22) + 0.2, -6, {"trim": 0.5, "semis": 3, "p0": 0.3}),
        (K1 + "confetti.mp3", W(2, 23) + 0.1, -6, {"p0": 0.3, "p1": 0.6}), (K1 + "ding.mp3", W(2, 23) + 0.15, -9, {"semis": 2}),
        (K1 + "pop.mp3", W(2, 25) + 0.2, -9, {"trim": 0.5, "p0": -0.4}),
        (K1 + "whoosh.mp3", T_W + 0.19, -6, {"semis": 2}),                                 # vertical whip
        (K4 + "swish.mp3", W(3, 5), -2, {"trim": 1.2}),
        (K1 + "pop.mp3", W(3, 9) + 0.2, -9, {"trim": 0.5, "p0": -0.5}), (K4 + "swish.mp3", W(3, 9) + 0.1, -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4}),
        (K4 + "swish.mp3", W(3, 18) - 0.2, -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4, "semis": 2}),
        (K1 + "pop.mp3", W(3, 18) + 0.2, -8, {"trim": 0.5, "semis": 3, "p0": 0.5}),
        (K4 + "land.mp3", W(3, 20) + 0.3, 2, {"trim": 0.6}), (K1 + "pop.mp3", W(3, 20) + 0.25, -9, {"trim": 0.5, "semis": 5, "p0": -0.4}),
        (K1 + "shimmer.mp3", W(3, 23), -10, {"trim": 1.6}), (K1 + "coin.mp3", W(3, 24) + 0.1, -10, {"trim": 0.8}),
        (K4 + "flashw.mp3", T_L + 0.1, -4, {"p0": 0.6, "p1": -0.6}),                       # light leak
    ]
    for i, k in enumerate([7, 9, 11]):
        s.append((K1 + "ding.mp3", W(4, k) + 0.15, -12, {"semis": [2, 5, 9][i], "p0": [0.3, -0.3, 0.2][i]}))
        s.append((K1 + "pop.mp3", W(4, k) + 0.3, -16, {"trim": 0.5, "semis": 7 + i * 2, "p0": 0.5}))
    s += [(K1 + "sparkles.mp3" if False else K4 + "sparkles.mp3", W(4, 17), -12, {"trim": 2.0, "p0": -0.5, "p1": 0.5}),
          (K4 + "passby.mp3", T_INK + 0.35, -10, {"trim": 1.0, "p0": 0.4, "p1": -0.2}),
          (K1 + "riser.mp3", T_INK + 0.4, -14, {"trim": 1.75}), (K4 + "sting.mp3", W(4, 19) + 0.05, -5),
          (K4 + "sparkles.mp3", W(4, 19) + 0.6, -16, {"trim": 2.0, "p0": -0.3, "p1": 0.3})]
    return {
        "music": [("m1", 0.0, 0.0, 33.6, 0.0, 0.6), ("m1", 25.05, 33.0, TOTAL - 33.0, 0.6, 1.6)],
        "curve": [(0, -6), (T_DIVE - 0.2, -7), (T_DIVE + 0.4, -14), (T_IRIS - 0.2, -16), (T_IRIS + 0.35, -4), (T_IRIS + 1.2, -7),
                  (W(2, 23), -4), (T_W, -5), (T_W + 0.5, -7), (W(3, 22), -4), (T_L, -5), (T_L + 0.6, -6), (W(4, 12), -5), (W(4, 17), -3),
                  (T_INK, -4), (W(4, 19) + 0.1, -2), (TOTAL - 1.2, -6), (TOTAL, -40)],
        "duck_depth": [(0, 1.0), (TOTAL, 1.0)],
        "hit_duck": [(W(2, 20) + 0.2, -3), (W(2, 23) + 0.1, -3), (W(4, 19), -3)],
        "amb": [(K4 + "amb_hope.mp3", T_IRIS, TOTAL - T_IRIS, -26, 1.5, 1.5)],
        "sfx": s,
    }


def c2(W, TOTAL):
    T_W = W(1, 0) - 0.22; T_GO = 7.6; T_STOP = W(2, 3) - 0.1; T_P = 9.85; T_Z = W(3, 0) - 0.3; T_L = W(4, 0) - 0.3; T_INK = W(4, 18) - 0.45
    s = [(K1 + "dissolve.mp3", W(0, 4) + 0.2, -10, {"trim": 1.0, "wet": 0.4}),
         (K4 + "fall.mp3", W(0, 6) + 0.6, -22, {"trim": 1.6, "semis": 3}),                 # the sag (comic)
         (K1 + "whoosh.mp3", T_W + 0.18, -6, {"semis": 2}),
         (K4 + "land.mp3", T_W + 0.9, 2, {"trim": 0.6}),
         (K1 + "pop.mp3", W(1, 4) + 0.2, -9, {"trim": 0.5, "p0": 0.4})]
    for k in range(int((T_STOP - T_GO) / 0.36)):  # stopwatch ticks (timelapse)
        s.append((K1 + "tick.mp3", T_GO + k * 0.36, -16, {"trim": 0.12, "semis": 7 if k % 2 else 5, "p0": 0.45}))
    for t, x, y in [(7.85, 150, 268), (8.4, 155, 386), (8.95, 178, 797), (9.45, 345, 932)]:
        s.append((*TAP[:1], t, -6, TAP[1]))
    s += [(K4 + "swish.mp3", 8.1, -5, {"trim": 1.0, "p0": 0.4, "p1": -0.4, "semis": 3}), (K4 + "swish.mp3", 8.65, -5, {"trim": 1.0, "p0": 0.4, "p1": -0.4, "semis": 5}),
          (K1 + "ding.mp3", 9.65, -10, {"semis": 5}), (K1 + "whoosh.mp3", T_P + 0.35, -8, {"p0": -0.2, "p1": 0.6}),
          (K4 + "impact.mp3", W(2, 0) - 0.05, -6, {"trim": 1.4}), (K4 + "flashw.mp3", W(2, 0) - 0.05, -6),       # glow-up hit
          (K1 + "pop.mp3", W(2, 0) + 0.45, -5, {"trim": 0.5}), (K1 + "pop.mp3", W(2, 1) + 0.1, -6, {"trim": 0.5, "semis": 3, "p0": -0.3}),
          (K1 + "confetti.mp3", W(2, 2) + 0.05, -4, {"p0": -0.6, "p1": 0.6}), (K4 + "cheer.mp3", W(2, 2) + 0.1, 2, {"trim": 1.0}),
          (K4 + "swish.mp3", W(2, 3) - 0.1, -3, {"trim": 1.2, "p0": -0.6, "p1": -0.2}),
          (K1 + "ding.mp3", T_STOP + 0.05, -6, {"semis": 0}), (K1 + "pop.mp3", W(2, 4) + 0.15, -8, {"trim": 0.5, "semis": 5, "p0": 0.5}),
          (K4 + "passby.mp3", T_Z + 0.3, -6, {"trim": 1.0}),                                 # zoom through
          (K1 + "pop.mp3", W(3, 3) + 0.2, -9, {"trim": 0.5, "p0": -0.5}), (K4 + "swish.mp3", W(3, 3), -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4}),
          (K4 + "swish.mp3", W(3, 6) - 0.2, -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4, "semis": 2}),
          (K1 + "pop.mp3", W(3, 6) + 0.2, -8, {"trim": 0.5, "semis": 3, "p0": 0.5}),
          (K4 + "land.mp3", W(3, 8) + 0.3, 2, {"trim": 0.6}), (K1 + "pop.mp3", W(3, 12) + 0.2, -9, {"trim": 0.5, "semis": 5, "p0": -0.4}),
          (K1 + "shimmer.mp3", W(3, 15), -10, {"trim": 1.6}), (K1 + "coin.mp3", W(3, 17) + 0.1, -10, {"trim": 0.8}),
          (K4 + "flashw.mp3", T_L + 0.1, -4, {"p0": 0.6, "p1": -0.6}),
          (K4 + "land.mp3", W(4, 8) + 0.3, 0, {"trim": 0.6, "p0": -0.5}), (K4 + "land.mp3", W(4, 9) + 0.3, 0, {"trim": 0.6, "p0": 0.5}),
          (K4 + "sparkles.mp3", W(4, 11), -14, {"trim": 2.0}), (K1 + "pop.mp3", W(4, 14) + 0.2, -8, {"trim": 0.5, "semis": 4}),
          (K4 + "passby.mp3", T_INK + 0.35, -10, {"trim": 1.0, "p0": 0.4, "p1": -0.2}),
          (K1 + "riser.mp3", T_INK + 0.45, -14, {"trim": 1.75}), (K4 + "sting.mp3", W(4, 18) + 0.05, -5),
          (K4 + "sparkles.mp3", W(4, 18) + 0.6, -16, {"trim": 2.0, "p0": -0.3, "p1": 0.3})]
    # m2: comic/sad 0-6, build ~6-16.5, drop at 16.5 -> drop lands on "Gente" (10.29)
    off = 16.5 - W(2, 0) + 0.05
    g0, g1 = 16.5, 24.78
    a1 = W(2, 0) + (g1 - g0)
    return {
        "music": [("m2", 1.0, 0.0, 4.6, 0.3, 0.4), ("m2", off + T_W, T_W, (g1 - off) - T_W, 0.3, 0.3),
                  ("m2", g0, a1 - 0.15, g1 - g0 + 0.3, 0.3, 0.3), ("m2", g0, a1 + (g1 - g0) - 0.3, TOTAL - (a1 + (g1 - g0) - 0.3), 0.3, 1.5)],
        "curve": [(0, -14), (W(0, 6), -14), (T_W, -10), (T_GO - 0.3, -5), (T_STOP - 2.5, -4), (W(2, 0) - 0.1, -60), (W(2, 0) - 0.05, -2),
                  (W(2, 3), -4), (T_Z, -4), (T_Z + 0.5, -6), (T_L, -5), (T_L + 0.6, -7), (W(4, 13), -5), (T_INK, -4), (W(4, 18), -2), (TOTAL - 1.0, -6), (TOTAL, -40)],
        "duck_depth": [(0, 1.0), (TOTAL, 1.0)],
        "hit_duck": [(W(2, 0), -2), (W(2, 2), -3), (W(4, 18), -3)],
        "amb": [(K4 + "amb_room.mp3", 0, T_W + 0.5, -18, 0.5, 0.6), (K4 + "amb_hope.mp3", W(2, 0), TOTAL - W(2, 0), -26, 1.5, 1.5)],
        "sfx": s,
    }


def c3(W, TOTAL):
    T_IRIS = W(2, 0) - 0.45; T_W = W(3, 0) - 0.2; T_L = W(4, 0) - 0.3; T_INK = W(5, 0) - 0.45
    s = [(K4 + "swish.mp3", 0.3, -14, {"trim": 1.6, "p0": 0.6, "p1": -0.6, "wet": 0.3}),
         (K1 + "dissolve.mp3", W(0, 11), -10, {"trim": 1.0, "wet": 0.45}),
         (K4 + "land.mp3", W(0, 11) + 0.6, -2, {"trim": 0.6, "wet": 0.3}),
         (K4 + "swish.mp3", W(1, 3) + 0.2, -8, {"trim": 1.2, "wet": 0.3}),                   # delete sheet rises
         (*TAP[:1], W(1, 6) - 0.05, -8, TAP[1]),
         (K1 + "dissolve.mp3", W(1, 6) + 0.35, -8, {"trim": 1.0, "wet": 0.45, "p0": 0.0, "p1": -0.3}),  # story deleted
         (K4 + "swish.mp3", W(1, 7), -8, {"trim": 1.2, "wet": 0.3, "semis": -2})]
    for k in range(18):  # typing the search
        s.append((K1 + "tick.mp3", W(1, 8) + k * 0.075, -24, {"trim": 0.08, "semis": [3, 5, 4, 6][k % 4], "p0": 0.1}))
    for k in range(9):   # slow clock under the 30 minutes
        s.append((K1 + "tick.mp3", W(1, 9) + k * 0.42, -18, {"trim": 0.12, "semis": -3, "wet": 0.4}))
    s += [(K4 + "swish.mp3", W(1, 9) + 0.3, -12, {"trim": 1.6, "p0": 0.0, "semis": -3, "wet": 0.3}),     # endless scroll
          (K4 + "swish.mp3", W(1, 12), -13, {"trim": 1.6, "semis": -5, "wet": 0.3}),
          (*TAP[:1], W(1, 15) + 0.05, -8, TAP[1]), (K1 + "pop.mp3", W(1, 15) + 0.3, -10, {"trim": 0.5, "semis": -2}),
          (K4 + "land.mp3", W(1, 16) + 0.3, -2, {"trim": 0.6}),                                      # pasted... ugly
          (K4 + "fall.mp3", W(1, 18) + 0.4, -18, {"trim": 1.4, "semis": 2, "wet": 0.3}),            # the "meh"
          (K1 + "heartbeat.mp3", W(1, 16), -10, {"trim": 1.4, "wet": 0.35}),
          (K1 + "swell.mp3", T_IRIS + 0.4, -6, {"trim": 2.0}), (K4 + "bloom.mp3", T_IRIS + 0.3, -6, {"wet": 0.25}),
          (K4 + "sparkles.mp3", T_IRIS + 0.6, -12, {"trim": 2.0, "p0": -0.5, "p1": 0.5}),
          (K1 + "ding.mp3", W(2, 2) + 0.4, -10, {"semis": 2, "p0": 0.2}),                     # friend's message
          (K1 + "whoosh.mp3", W(2, 5) + 0.2, -10, {"p0": 0.0}), (K4 + "land.mp3", W(2, 5) + 0.7, 2, {"trim": 0.6}),
          (K1 + "shimmer.mp3", W(2, 8), -8, {"trim": 1.6}),
          (K1 + "whoosh.mp3", T_W + 0.18, -6, {"semis": 2})]
    for i in range(6):
        s.append((K1 + "pop.mp3", W(3, 2) + 0.3 + i * 0.07, -14, {"trim": 0.5, "semis": i * 1.5, "p0": [-0.7, 0.7, -0.6, 0.6, -0.5, 0.5][i]}))
    s += [(K4 + "swish.mp3", W(3, 4) - 0.1, -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4}), (K1 + "pop.mp3", W(3, 5) + 0.2, -9, {"trim": 0.5, "p0": -0.5}),
          (K4 + "swish.mp3", W(3, 8) - 0.25, -4, {"trim": 1.2, "p0": 0.4, "p1": -0.4, "semis": 2}),
          (K1 + "pop.mp3", W(3, 8) + 0.2, -8, {"trim": 0.5, "semis": 3, "p0": 0.5}),
          (K4 + "land.mp3", W(3, 10) + 0.3, 2, {"trim": 0.6}), (K1 + "pop.mp3", W(3, 11) + 0.2, -9, {"trim": 0.5, "semis": 5, "p0": -0.4}),
          (K1 + "coin.mp3", W(3, 14) + 0.1, -9, {"trim": 0.8}),
          (K4 + "flashw.mp3", T_L + 0.1, -3, {"p0": 0.6, "p1": -0.6}),
          (K4 + "impact.mp3", W(4, 4), -7, {"trim": 1.5}), (K1 + "confetti.mp3", W(4, 4), -2, {"p0": -0.6, "p1": 0.6}),
          (K4 + "cheer.mp3", W(4, 4) + 0.05, 5, {"trim": 1.0})]
    for i in range(4):  # replies rain in: rising dings
        s.append((K1 + "ding.mp3", W(4, 4) + 0.3 + i * 0.16, -14 + i, {"semis": [0, 3, 5, 8][i], "p0": [-0.4, 0.4, -0.2, 0.2][i]}))
    s += [(K4 + "sparkles.mp3", W(4, 7), -12, {"trim": 2.0, "p0": -0.5, "p1": 0.5}),
          (K4 + "passby.mp3", T_INK + 0.35, -12, {"trim": 1.0, "p0": 0.4, "p1": -0.2}),
          (K4 + "bloom.mp3", W(5, 3), -14, {"wet": 0.3}),
          (K1 + "riser.mp3", W(5, 7) - 0.05, -16, {"trim": 1.75}), (K4 + "sting.mp3", W(5, 7), -7),
          (K4 + "sparkles.mp3", W(5, 9), -16, {"trim": 2.0, "p0": -0.3, "p1": 0.3})]
    G0, G1 = 27.0, 35.0
    return {
        "music": [("m3", 0.0, 0.0, T_IRIS + 0.2, 0.0, 0.4), ("m3", 13.3, T_IRIS, T_W + 0.3 - T_IRIS, 0.3, 0.25),
                  ("m3", G0 - 0.05, T_W + 0.2, G1 - G0, 0.05, 0.3), ("m3", G0, T_W + 0.2 + (G1 - G0) - 0.3, 8.6, 0.3, 0.3),
                  ("m3", 29.0, T_W + 0.2 + 2 * (G1 - G0) - 0.6, TOTAL - (T_W + 0.2 + 2 * (G1 - G0) - 0.6), 0.3, 2.0)],
        "curve": [(0, -9), (W(0, 11), -11), (W(1, 0), -12), (T_IRIS - 0.3, -14), (T_IRIS + 0.3, -5), (T_IRIS + 1.0, -8),
                  (T_W, -6), (T_W + 0.3, -4), (W(3, 13), -4), (T_L, -4), (W(4, 4), -1), (W(4, 10), -3), (T_INK, -6), (W(5, 0), -9),
                  (W(5, 7), -5), (W(5, 9), -7), (TOTAL - 1.4, -8), (TOTAL, -40)],
        "duck_depth": [(0, 1.0), (W(4, 3), 1.0), (W(4, 4), 0.5), (W(4, 10) + 0.3, 0.5), (W(4, 10) + 0.8, 1.0), (TOTAL, 1.0)],
        "hit_duck": [(W(4, 4), -4), (W(5, 7), -3)],
        "amb": [(K4 + "amb_room.mp3", 0, T_IRIS + 0.6, -16, 0.8, 0.8), (K4 + "amb_hope.mp3", T_IRIS, TOTAL - T_IRIS, -24, 1.5, 1.5)],
        "sfx": s,
    }


def c4(W, TOTAL):
    T_BREAK = W(0, 4) + 0.45; T_C = W(2, 0) - 0.25; T_D = W(3, 0) - 0.25; T_E = W(4, 0) - 0.3; T_INK = W(5, 0) - 0.4; BOOM = W(4, 9)
    s = [(K4 + "impact.mp3", W(0, 0), -5, {"trim": 1.4}), (K1 + "subhit.mp3", W(0, 0), -3, {"trim": 0.5}),
         (K1 + "pop.mp3", W(0, 1) + 0.1, -8, {"trim": 0.5, "semis": -3}), (*TAP[:1], W(0, 4), -4, TAP[1]),
         (K4 + "glass.mp3", W(0, 4) + 0.1, 0, {"trim": 1.0}), (K4 + "impact.mp3", T_BREAK, -4, {"trim": 1.2}),
         (K4 + "fall.mp3", T_BREAK + 0.4, -14, {"trim": 1.2, "semis": 3}),
         (K4 + "land.mp3", T_BREAK + 0.6, 2, {"trim": 0.6}), (K1 + "heartbeat.mp3", W(1, 4), -8, {"trim": 1.4, "wet": 0.3})]
    for k in range(4): s.append((K1 + "tick.mp3", W(1, 4) + k * 0.5, -14, {"trim": 0.12, "semis": -2}))
    for i in range(3): s.append((K4 + "swish.mp3", T_C + 0.2 + i * 0.12, -6, {"trim": 1.0, "p0": [-0.5, 0, 0.5][i], "semis": i * 2}))
    s += [(K4 + "passby.mp3", W(2, 11) - 0.05, -6, {"trim": 1.0}), (K4 + "land.mp3", W(2, 11) + 0.6, 2, {"trim": 0.6}),
          (K1 + "whoosh.mp3", T_D + 0.1, -8, {"semis": 2})]
    for i in range(4): s.append((K1 + "pop.mp3", W(3, 0) + 0.3 + i * 0.07, -12, {"trim": 0.5, "semis": i * 2, "p0": [-0.6, 0.6, -0.5, 0.5][i]}))
    s += [(K4 + "swish.mp3", W(3, 2) - 0.1, -4, {"trim": 1.0, "p0": 0.4, "p1": -0.4}), (K1 + "pop.mp3", W(3, 2) + 0.2, -9, {"trim": 0.5}),
          (K4 + "swish.mp3", W(3, 5) - 0.15, -4, {"trim": 1.0, "p0": 0.4, "p1": -0.4, "semis": 2}), (K1 + "pop.mp3", W(3, 6) + 0.2, -9, {"trim": 0.5, "semis": 3}),
          (K4 + "land.mp3", W(3, 7) + 0.2, 2, {"trim": 0.6}), (K1 + "pop.mp3", W(3, 9) + 0.2, -9, {"trim": 0.5, "semis": 5}),
          (*TAP[:1], W(3, 11) + 0.25, -6, TAP[1]), (K1 + "ding.mp3", W(3, 11) + 0.4, -10, {"semis": 5}),
          (K1 + "whoosh.mp3", W(3, 12) - 0.1, -8, {"p0": -0.2, "p1": 0.6}), (K1 + "pop.mp3", W(3, 12) + 0.25, -6, {"trim": 0.5}),
          (K1 + "coin.mp3", W(3, 13) + 0.15, -6, {"trim": 0.8}), (K4 + "passby.mp3", W(3, 13) + 0.45, -12, {"trim": 0.9, "semis": 3})]
    for k in range(int((BOOM - W(4, 0)) / 0.12)): s.append((K1 + "tick.mp3", W(4, 0) + k * 0.12, -20 + k * 0.25, {"trim": 0.08, "semis": 4 + (k % 3)}))
    s += [(K1 + "riser.mp3", BOOM, -10, {"trim": 1.75}), (K4 + "impact.mp3", BOOM, -7, {"trim": 1.5}), (K1 + "confetti.mp3", BOOM, -1, {"p0": -0.6, "p1": 0.6}),
          (K4 + "cheer.mp3", BOOM + 0.05, -1, {"trim": 1.0}), (K4 + "flashw.mp3", BOOM, -6)]
    for i in range(8): s.append((K1 + "ding.mp3", W(4, 3) + i * 0.32 + 0.2, -15 + i * 0.4, {"semis": [0, 2, 4, 5, 7, 9, 11, 12][i], "p0": [-0.4, 0.4][i % 2]}))
    s += [(K4 + "passby.mp3", T_INK + 0.35, -10, {"trim": 1.0}), (K4 + "sting.mp3", W(5, 1), -5), (K4 + "sparkles.mp3", W(5, 1) + 0.6, -16, {"trim": 2.0})]
    return {"music": [("m4", 6.5, 2.35, 10.9 - 2.35, 0.05, 0.3, "lowpass=f=700"), ("m4", 12.0, 10.75, TOTAL - 10.75, 0.05, 1.5)],
            "curve": [(0, -60), (2.3, -60), (2.4, -9), (T_C, -9), (10.6, -6), (10.8, -4), (T_E, -6), (BOOM - 0.1, -3), (BOOM + 0.2, 0), (22.6, -3),
                      (T_INK, -5), (W(5, 1), -3), (TOTAL - 1.0, -6), (TOTAL, -40)],
            "duck_depth": [(0, 1.0), (BOOM - 0.2, 1.0), (BOOM, 0.5), (BOOM + 2.0, 0.5), (BOOM + 2.4, 1.0), (TOTAL, 1.0)],
            "hit_duck": [(W(0, 0), -6), (T_BREAK, -3), (BOOM, -3)], "amb": [], "sfx": s}


def c5(W, TOTAL):
    T_L = W(1, 0) - 0.2; T_R = W(2, 0) - 0.2; T_HIT = W(2, 3); T_D = W(3, 0) - 0.35; T_E = W(4, 0) - 0.15; T_INK = W(5, 0) - 0.4
    s = [(K4 + "swish.mp3", 0.05, -6, {"trim": 1.0, "p0": -0.7}), (K4 + "swish.mp3", 0.12, -6, {"trim": 1.0, "p0": 0.7, "semis": 2}),
         (K1 + "pop.mp3", 0.45, -10, {"trim": 0.5, "p0": -0.5}), (K1 + "pop.mp3", 0.57, -10, {"trim": 0.5, "p0": 0.5, "semis": 3})]
    for k in range(8): s.append((K1 + "tick.mp3", T_L + 0.3 + k * 0.5, -18, {"trim": 0.12, "semis": -4, "p0": -0.5, "wet": 0.3}))
    s += [(K1 + "dissolve.mp3", W(1, 3), -12, {"trim": 1.0, "p0": -0.5, "wet": 0.4}), (K1 + "pop.mp3", W(1, 3) + 0.2, -12, {"trim": 0.5, "semis": -5, "p0": -0.4})]
    t = T_R + 0.3; gap = 0.3
    while t < T_HIT: s.append((K1 + "tick.mp3", t, -16, {"trim": 0.08, "semis": 5, "p0": 0.5})); t += gap; gap = max(0.07, gap * 0.85)
    for i in range(1, 4): s.append((K1 + "pop.mp3", T_R + 0.3 + i * 0.75 + 0.15, -10, {"trim": 0.5, "semis": i * 2, "p0": 0.5}))
    s += [(K4 + "glass.mp3", T_HIT + 0.02, -2, {"trim": 1.0, "p0": -0.5}), (K4 + "impact.mp3", T_HIT, -7, {"trim": 1.4}), (K1 + "subhit.mp3", T_HIT, -5, {"trim": 0.5}),
          (K4 + "passby.mp3", W(2, 5) + 0.3, -8, {"trim": 1.0, "p0": 0.5, "p1": 0.8, "semis": 2}),
          (K4 + "passby.mp3", T_D + 0.1, -6, {"trim": 1.0})]
    for i in range(4): s.append((K1 + "pop.mp3", W(3, 1) + 0.3 + i * 0.07, -12, {"trim": 0.5, "semis": i * 2, "p0": [-0.6, 0.6, -0.5, 0.5][i]}))
    s += [(K4 + "swish.mp3", W(3, 3) - 0.1, -4, {"trim": 1.0, "p0": 0.4, "p1": -0.4}), (K4 + "land.mp3", W(3, 4) + 0.2, 2, {"trim": 0.6}),
          (K4 + "swish.mp3", W(3, 8) - 0.25, -4, {"trim": 1.0, "p0": 0.4, "p1": -0.4, "semis": 2}),
          (*TAP[:1], W(3, 10) + 0.05, -6, TAP[1]), (K1 + "ding.mp3", W(3, 10) + 0.2, -10, {"semis": 5}),
          (K1 + "whoosh.mp3", W(3, 11) - 0.1, -8, {"p0": -0.2, "p1": 0.6}), (K1 + "pop.mp3", W(3, 12) + 0.2, -6, {"trim": 0.5})]
    s += [(K1 + "riser.mp3", T_E + 0.05, -10, {"trim": 1.75}), (K4 + "impact.mp3", T_E + 0.1, -7, {"trim": 1.5}), (K1 + "confetti.mp3", T_E + 0.12, -1, {"p0": -0.6, "p1": 0.6}),
          (K4 + "cheer.mp3", T_E + 0.15, -1, {"trim": 1.0}), (K4 + "flashw.mp3", T_E + 0.1, -6)]
    for k in range(18): s.append((K1 + "tick.mp3", T_E + 0.25 + k * 0.12, -20, {"trim": 0.08, "semis": 6}))
    for i in range(10): s.append((K1 + "ding.mp3", W(4, 1) + i * 0.3 + 0.2, -15 + i * 0.3, {"semis": [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i], "p0": [-0.4, 0.4][i % 2]}))
    s += [(K4 + "passby.mp3", T_INK + 0.35, -10, {"trim": 1.0}), (K4 + "sting.mp3", W(5, 6), -5), (K4 + "sparkles.mp3", W(5, 6) + 0.6, -16, {"trim": 2.0})]
    D = T_E - 15.5   # music starts D seconds in, so its drop (15.5s) lands on "Gente"
    return {"music": [("m5", 0.0, 0.0, D + 0.4, 0.0, 0.4), ("m5", 0.0, D, TOTAL - D, 0.4, 1.5)],
            "curve": [(0, 2), (T_L, 1), (T_R, 2), (T_HIT, 3), (T_D, 1), (T_E - 0.25, 2), (T_E - 0.12, -40), (T_E - 0.02, -2), (W(4, 11), -3),
                      (T_INK, -5), (W(5, 6), -3), (TOTAL - 1.0, -6), (TOTAL, -40)],
            "duck_depth": [(0, 1.0), (T_E - 0.1, 1.0), (T_E, 0.5), (T_E + 2.5, 0.5), (T_E + 3.0, 1.0), (TOTAL, 1.0)],
            "hit_duck": [(T_HIT, -4), (T_E + 0.1, -3)], "amb": [], "sfx": s}


def c6(W, TOTAL):
    L = [None] * 4
    vo = json.load(open("build/c6-vo.json"))["lines"]
    T_SEP = 19.45; T_CTA = W(3, 7) - 0.35
    SEND = (K1 + "pop.mp3", {"trim": 0.4, "semis": 7, "p0": 0.4})      # my message: high soft pop, right side
    RECV = (K1 + "ding.mp3", {"semis": 9, "p0": -0.4})                 # friend message: soft ding, left side
    s = [(SEND[0], 0.15, -12, SEND[1]), (SEND[0], 0.75, -12, {**SEND[1], "semis": 8}), (SEND[0], 1.45, -12, SEND[1]),
         (SEND[0], vo[0]["start"] - 0.25, -12, SEND[1]), (RECV[0], vo[1]["start"] - 0.25, -16, RECV[1]),
         (RECV[0], W(1, 7) - 0.1, -16, {**RECV[1], "semis": 11}), (RECV[0], W(1, 11) - 0.1, -16, {**RECV[1], "semis": 12}),
         (K1 + "tick.mp3", vo[0]["start"] - 0.05, -14, {"trim": 0.1, "p0": 0.4}), (K1 + "tick.mp3", vo[1]["start"] - 0.05, -14, {"trim": 0.1, "p0": -0.4}),
         (K1 + "swell.mp3", T_SEP + 0.1, -6, {"trim": 2.0}), (K4 + "flashw.mp3", T_SEP + 0.15, -5), (K4 + "passby.mp3", T_SEP + 0.1, -10, {"trim": 1.0}),
         (SEND[0], 19.95, -9, {**SEND[1], "semis": 10}), (K1 + "pop.mp3", 20.2, -6, {"trim": 0.5, "semis": 4}), (K1 + "confetti.mp3", 20.3, -3, {"p0": 0.2, "p1": 0.7}),
         (SEND[0], 20.55, -11, SEND[1]), (K1 + "coin.mp3", 21.5, -8, {"trim": 0.8, "p0": 0.3}),
         (SEND[0], vo[2]["start"] - 0.25, -12, SEND[1]), (K1 + "tick.mp3", vo[2]["start"] - 0.05, -14, {"trim": 0.1, "p0": 0.4}),
         (RECV[0], vo[3]["start"] - 0.25, -16, RECV[1]), (K1 + "tick.mp3", vo[3]["start"] - 0.05, -14, {"trim": 0.1, "p0": -0.4})]
    for k in range(int(2.2 / 0.1)): s.append((K1 + "tick.mp3", 20.8 + k * 0.1, -22, {"trim": 0.07, "semis": 6, "p0": 0.3}))
    for i in range(6): s.append((K1 + "ding.mp3", W(2, 5) + i * 0.38 + 0.15, -16 + i * 0.4, {"semis": [0, 2, 4, 7, 9, 12][i], "p0": [-0.3, 0.3][i % 2]}))
    s += [(K4 + "swish.mp3", T_CTA, -6, {"trim": 1.0, "semis": 3}), (K4 + "sting.mp3", T_CTA + 0.4, -6), (K4 + "sparkles.mp3", T_CTA + 0.8, -16, {"trim": 2.0})]
    return {"music": [("m6", 0.0, 0.0, 19.0, 0.4, 0.4), ("m6", 25.5, 19.1, 10.2, 0.05, 0.4), ("m6", 27.0, 28.9, TOTAL - 28.9, 0.4, 1.0)],
            "curve": [(0, -12), (T_SEP - 0.3, -12), (T_SEP + 0.2, -60), (T_SEP + 0.55, -60), (T_SEP + 0.65, -3), (vo[2]["start"], -6), (T_CTA, -5), (T_CTA + 0.5, -2), (TOTAL - 1.0, -4), (TOTAL, -40)],
            "duck_depth": [(0, 1.0), (TOTAL, 1.0)], "hit_duck": [(20.3, -3)], "amb": [], "sfx": s, "vo_gain": 1.0}


for n in sys.argv[1:] or ["1", "2", "3"]:
    mix(int(n), {1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6}[int(n)])
