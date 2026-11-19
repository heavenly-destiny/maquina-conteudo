"""Build HTML + audio mix for each UGC creative from build/<u>.json.
Run from videos/sl-ugc:  ../sl-criativos/venv/bin/python make.py u1 u2 ...  (numpy needed)"""
import json, os, shutil, subprocess, sys
import numpy as np

SR = 48000
K1 = "../zupi-emocao/assets/sfx/"; K4 = "../zupi-emocao/assets/sfx4/"
db = lambda x: 10 ** (x / 20)


def load(path, ss=0.0, t=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(t)] if t else []) + ["-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()


def place(bus, clip, start, gain_db=0.0):
    i = int(round(start * SR)); clip = clip * db(gain_db)
    if i < 0: clip, i = clip[-i:], 0
    clip = clip[: max(0, len(bus) - i)]; bus[i : i + len(clip)] += clip


def fade(c, fin=0.0, fout=0.05):
    c = c.copy(); a, b = int(fin * SR), int(fout * SR)
    if a: c[:a] *= np.linspace(0, 1, a)[:, None]
    if b: c[-b:] *= np.linspace(1, 0, b)[:, None]
    return c


def pitch(c, semis):
    r = 2 ** (semis / 12); idx = np.arange(0, len(c) - 1, r)
    return np.stack([np.interp(idx, np.arange(len(c)), c[:, k]) for k in (0, 1)], axis=1).astype(np.float32)


def pan(c, p):
    a = (p + 1) * np.pi / 4; m = c.mean(axis=1)
    return np.stack([m * np.cos(a), m * np.sin(a)], axis=1) * np.sqrt(2)


cache = {}
def S(name, trim=None):
    path = f"assets/sfx/{name}.wav" if os.path.exists(f"assets/sfx/{name}.wav") else (K1 if os.path.exists(K1 + name + ".mp3") else K4) + name + ".mp3"
    if path not in cache:
        c = load(path); e = np.abs(c).mean(axis=1); h = int(0.01 * SR)
        env = e[: len(e) // h * h].reshape(-1, h).max(axis=1); pk = np.argmax(env) * h / SR
        c = c / (env.max() + 1e-9) * 0.5  # peak-normalise every SFX so levels below are comparable
        cache[path] = (c, pk)
    c, pk = cache[path]
    if trim: c = c[: int(trim * SR)]; pk = min(pk, trim * 0.5)
    return c.copy(), pk


def sfx_list(d):
    s = []; T = lambda x: x
    add = lambda name, t, lvl, semis=0, p=0.0, trim=None: s.append((name, t, lvl, semis, p, trim))
    add("whoosh", 0.02, -16, 2)                       # hook title flies in
    add("pop", 0.1, -18, 3); add("pop", 0.27, -18, 6)
    for i, c in enumerate(d["cuts"][1:], 1):
        if c["new_clip"] or (c["new_seg"] and i % 3 == 0): add("swish", c["t"] - 0.02, -15, 0, (-0.3 if i % 2 else 0.3))
        elif c["new_seg"]: add("tick", c["t"], -24, 4, 0, 0.12)
    for k, e in enumerate(d["events"]):
        t, ty, end = e["t"], e["type"], e["t"] + e["dur"]
        if ty in ("chip", "stk"): add("pop", t, -14, 2 + (k % 4) * 2, (-0.25 if (e.get("x") or 540) < 400 else 0.25))
        elif ty == "count":
            add("pop", t - 0.1, -14, 0)
            for j in range(8): add("tick", t + j * 0.11, -20, 3 + j, 0, 0.12)
            add("coin", t + 0.95, -16, 2)
        elif ty == "notif": add("ding", t - 0.05, -13, 2)
        elif ty == "logo": add("sparkles", t, -16); add("pop", t, -13, 0); add("confetti", t + 0.05, -18)
        elif ty == "toast": add("ding", t + 0.05, -15, 7)
        elif ty == "broll": add("swish", t - 0.1, -15, 3, 0.2); add("swish", end - 0.05, -19, 6, -0.2)
        elif ty == "app":
            add("whoosh", t - 0.15, -15, 0)
            for x, y, dt in e.get("taps", []): add("tick", t + dt, -14, 5, 0, 0.15); add("ding", t + dt + 0.15, -15, 7)
            add("swish", end - 0.1, -19, 4)
        elif ty == "hearts": add("sparkles", t, -15); add("bloom", t, -20)
        elif ty == "nope": add("impact", t - 0.03, -15); add("swish", t - 0.06, -18, 5)
        elif ty == "x": add("pop", t - 0.1, -15, 2); add("glass", t + 0.35, -20)
        elif ty == "clock":
            n = int(e["dur"] / 0.16)
            for j in range(min(n, 10)): add("tick", t + j * 0.16, -21, 2 + (j % 2) * 5, 0, 0.12)
        elif ty == "prof":
            for j in range(6): add("pop", t - 0.1 + j * 0.12, -16, 1 + j * 2, (-0.3 if j % 2 else 0.3))
        elif ty == "share":
            add("whoosh", t - 0.15, -17)
            for j in range(4): add("ding", t + 0.4 + j * 0.22, -18, 3 + j * 2)
        elif ty == "dmreq": add("pop", t - 0.1, -15, 5); add("ding", t + 0.9, -14, 3)
        elif ty == "dms":
            for j in range(3): add("ding", t - 0.1 + j * e["dur"] / 4, -13, 2 + j * 3, (0.2 if j % 2 else -0.2))
        elif ty == "arrow": add("pop", t, -19, 8)
    tC = d["cta_at"] if d["cta_at"] is not None else d["talk_end"] - 0.8
    add("sting", tC, -14); add("whoosh", tC - 0.1, -16); add("confetti", tC + 0.15, -18)
    return s, tC


def mix(u):
    d = json.load(open(f"build/{u}.json")); TOTAL = d["total"]; N = int(TOTAL * SR); tax = np.arange(N) / SR
    vo = load(f"assets/{u}-voice.wav")[:N]; vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    # music: loop the track, level relative to the voice, ducked under speech
    m = load(f"assets/music/{d['music']}.mp3")
    while len(m) < N: m = np.vstack([m, m])
    m = fade(m[:N], 0.3, 1.2)
    vr = np.sqrt(np.mean(vo[np.abs(vo[:, 0]) > 1e-3] ** 2)) + 1e-9; mr = np.sqrt(np.mean(m ** 2)) + 1e-9
    m *= vr / mr
    hop = int(0.05 * SR); env = np.sqrt(np.mean(vo[: len(vo) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
    sp = (20 * np.log10(env + 1e-9) > -40).astype(float); dk = np.zeros_like(sp)
    for i in range(1, len(sp)):
        a = 0.55 if sp[i] > dk[i - 1] else 0.12; dk[i] = dk[i - 1] + a * (sp[i] - dk[i - 1])
    lvl = np.interp(tax, np.arange(len(dk)) * 0.05, -10 - dk * 8)          # -10 dB in gaps, -18 dB under speech
    s, tC = sfx_list(d)
    lvl = np.where(tax > d["talk_end"], -6.0, lvl)                            # music lifts for the end card
    m *= db(lvl)[:, None].astype(np.float32)
    fx = np.zeros((N, 2), np.float32)
    for name, t, lv, semis, p, trim in s:
        c, pk = S(name, trim)
        if semis: c = pitch(c, semis); pk /= 2 ** (semis / 12)
        if p: c = pan(c, p)
        place(fx, fade(c, 0, 0.04), t - pk, lv + 6)
    out = vo + m + fx * db(-4)
    out = (out / max(np.max(np.abs(out)), 1e-6) * db(-1.5)).astype(np.float32)
    raw = f"/tmp/ugc-{u}.f32"; open(raw, "wb").write(out.tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), f"assets/{u}-mix.wav"], check=True)
    os.remove(raw)
    return d


def html(u, d):
    lib = open("lib.html").read(); br = []
    for k, e in enumerate(d["events"]):
        if e["type"] == "broll":
            br.append(f'      <div class="broll" id="br{k}"><video id="brv{k}" class="clip" src="assets/{e["src"]}.mp4" muted playsinline data-start="{e["t"] - 0.08:.3f}" '
                      f'data-duration="{e["dur"] + 0.3:.3f}" data-media-start="{e["ss"]}" data-track-index="{k + 1}"></video></div>')
    out = (lib.replace("__DATA__", json.dumps(d, ensure_ascii=False)).replace("__TOTAL__", f"{d['total']:.2f}").replace("__U__", u)
           .replace("__CTA__", d["cta"]).replace("<!--__BROLL__-->", "\n".join(br)))
    os.makedirs(u, exist_ok=True); open(f"{u}/index.html", "w").write(out)
    if not os.path.exists(f"{u}/assets"): os.symlink("../assets", f"{u}/assets")
    for f in ("hyperframes.json", "package.json"):
        if not os.path.exists(f"{u}/{f}"): shutil.copy(f"../sl-criativos/c1/{f}", f"{u}/{f}")
    json.dump({"id": f"sl-{u}", "name": f"sl-{u}", "createdAt": "2026-11-16T12:00:00.000Z"}, open(f"{u}/meta.json", "w"))


if __name__ == "__main__":
  for u in sys.argv[1:] or ["u1", "u2", "u3", "u4", "u5"]:
    d = mix(u); html(u, d); print(u, "ok", d["total"])
