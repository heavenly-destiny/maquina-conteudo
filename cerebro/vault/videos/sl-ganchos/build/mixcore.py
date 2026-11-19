"""Film-style mix for the 3 Stories Lab creatives (numpy, sample-exact). Same recipe as motion-reel-premium mix4:
music spliced by measured energy + mood base curve + voice duck + hit duck, SFX placed by measured PEAK, panned, pitched,
reverb per mood, ambience bed, loudnorm -14 LUFS. Event times are derived from the same VO word times the HTML uses.
Run from videos/sl-criativos: venv/bin/python build/mix.py 1 2 3"""
import json, subprocess, sys
import numpy as np

SR = 48000
K1 = "assets/sfx/"; K4 = "assets/sfx4/"; KG = "assets/sfxg/"
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
        place(music, fade(load(src if "/" in src else f"assets/music/{src}.mp3", ss, dur, af), fi, fo), at)
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


if __name__ == "__main__":
    import re
    for n in sys.argv[1:]:
        src = open(f"build/c{n}.txt").read()
        times_py = src.split("===TIMES===")[1].split("===CSS===")[0]
        sfx_py = src.split("===SFX===")[1]
        def cfg(W, TOTAL, _t=times_py, _s=sfx_py):
            g = {"W": W, "TOTAL": TOTAL, "K1": K1, "K4": K4, "KG": KG, "np": np}
            exec(_t, g); exec(_s, g)
            return g["CFG"]
        mix(int(n), cfg)
