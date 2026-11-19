#!/usr/bin/env python3
"""Mixa voz + trilha (duck pelo envelope da voz, drop-out opcional) + SFX nos instantes do sfx.json.
Uso: .venv/bin/python mix.py render_dir bed.mp3 bed_offset_s [music_db]
Le render_dir/voice.wav e render_dir/sfx.json; escreve render_dir/public/mix.wav (-14 LUFS)."""
import json, subprocess, sys, os
import numpy as np

SR = 48000
SFX_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "sfx")


def load(path, ss=0.0):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def db(x):
    return 10 ** (x / 20)


def click():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    s = (rng.standard_normal(n) * np.exp(-t * 260) * 0.5 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 400) * 0.4).astype(np.float32)
    return np.stack([s, s], 1)


def main(rdir, bed, off, music_db=-16.0):
    voice = load(os.path.join(rdir, "voice.wav"))
    n = len(voice)
    music = load(bed, off)[:n]
    if len(music) < n:
        music = np.pad(music, ((0, n - len(music)), (0, 0)))
    sfx = json.load(open(os.path.join(rdir, "sfx.json")))

    # envelope da voz (RMS 50ms) -> duck ate -9 dB, ataque 60ms, release 350ms
    v = np.abs(voice).mean(1)
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, "same"))
    speech = (20 * np.log10(env + 1e-9) > -42).astype(np.float32)
    g = np.empty(n, np.float32)
    a, r, cur = 1 - np.exp(-1 / (0.06 * SR)), 1 - np.exp(-1 / (0.35 * SR)), 0.0
    for i in range(0, n, 48):  # passo de 1ms
        tgt = speech[i]
        cur += (tgt - cur) * (a if tgt > cur else r) * 48
        cur = min(max(cur, 0), 1)
        g[i:i + 48] = cur
    gain = db(music_db) * db(-9 * g)

    # drop-out: marcadores "drop" no sfx.json -> trilha some 1.1s e volta com swell
    for d in [s for s in sfx if s["name"] == "drop"]:
        i0, i1 = int(d["t"] * SR), int((d["t"] + 1.1) * SR)
        ramp = int(0.08 * SR)
        gain[i0:i0 + ramp] *= np.linspace(1, 0.03, ramp)
        gain[i0 + ramp:i1] *= 0.03
        gain[i1:i1 + ramp] *= np.linspace(0.03, 1, ramp)
    mix = voice + music * gain[:, None]

    # fim: fade da trilha
    f = int(1.2 * SR)
    mix[-f:] = voice[-f:] + music[-f:] * (gain[-f:] * np.linspace(1, 0, f))[:, None]

    cache = {"click": click()}
    for s in sfx:
        if s["name"] == "drop":
            continue
        if s["name"] not in cache:
            cache[s["name"]] = load(os.path.join(SFX_DIR, s["name"] + ".mp3"))
        x = cache[s["name"]] * db(-12 + s["gain"])
        p = s.get("pan", 0.0)
        x = x * np.array([np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)], np.float32) * 1.414
        i0 = int(max(0, s["t"]) * SR)
        i1 = min(n, i0 + len(x))
        mix[i0:i1] += x[: i1 - i0]

    # vídeo mostrado no monitor: entra o áudio ORIGINAL do arquivo, a voz (mic da sala) sai (regra 18/11)
    mp = os.path.join(rdir, "mostrar.json")
    for mo in (json.load(open(mp)) if os.path.exists(mp) else []):
        orig = load(mo["file"], mo["ss"])[: int(mo["dur"] * SR)]
        i0 = int(mo["at"] * SR); i1 = min(n, i0 + len(orig)); orig = orig[: i1 - i0]
        fd = min(int(0.08 * SR), (i1 - i0) // 4)
        env_ = np.ones(i1 - i0, np.float32); env_[:fd] = np.linspace(0, 1, fd); env_[-fd:] = np.linspace(1, 0, fd)
        mix[i0:i1] = mix[i0:i1] * (1 - env_)[:, None] + orig * 0.9 * env_[:, None]

    tmp = os.path.join(rdir, "mix_raw.f32")
    (mix / max(1.0, np.abs(mix).max() / db(-1.5))).astype(np.float32).tofile(tmp)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp,
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), os.path.join(rdir, "public", "mix.wav")], check=True)
    os.remove(tmp)
    print("ok mix", n / SR, "s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]) if len(sys.argv) > 4 else -16.0)
