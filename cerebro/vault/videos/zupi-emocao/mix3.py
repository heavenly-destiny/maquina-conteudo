"""Sample-exact emotional mix with volume automation.

Music level = mood base curve (dB keyframes from timing.json beats)
            + VO-driven duck (detected from the actual voice envelope: down under speech, breathes up in gaps)
            + pre-lap swells before each mood boundary.
SFX are placed by their measured peak on the motion event, each with its own level relative to the bed.
Run with a Python that has numpy:  venv/bin/python mix3.py
"""
import json, subprocess
import numpy as np

SR = 48000
T = json.load(open("timing.json"))
L = json.load(open("vo-layout.json"))["lines"]
TOTAL = T["total"]
N = int(TOTAL * SR)


def load(path, ss=0.0, t=None, extra_af=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)]
    if t: cmd += ["-t", str(t)]
    cmd += ["-i", path]
    if extra_af: cmd += ["-af", extra_af]
    cmd += ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()


def place(bus, clip, start_s, gain_db=0.0):
    i = int(round(start_s * SR))
    if i >= len(bus): return
    clip = clip[: len(bus) - max(i, 0)] * (10 ** (gain_db / 20))
    if i < 0: clip = clip[-i:]; i = 0
    bus[i : i + len(clip)] += clip


db = lambda x: 10 ** (x / 20)
t_axis = np.arange(N) / SR

# ---------- voice ----------
vo = load("assets/vo/vo-full.wav")[:N]
vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))

# ---------- music bus (cues placed by measured energy) ----------
music = np.zeros((N, 2), np.float32)
s0, s1 = T["xfade_suspense"], T["cue_a_end"]
cueA = load("assets/music/cueA.mp3", ss=0.4, t=s1)
# the suspense half of cue A goes muffled: render a lowpassed copy and crossfade into it
cueA_dark = load("assets/music/cueA.mp3", ss=0.4, t=s1, extra_af="lowpass=f=800,highpass=f=60")
x = np.clip((np.arange(len(cueA)) / SR - s0) / 1.0, 0, 1)[:, None]
place(music, cueA * (1 - x) + cueA_dark * x * 1.25, 0.0)
B_OFF, C_START, C_OFF = 6.95, 23.2, 10.5
cueB = load("assets/music/cueB.mp3", ss=B_OFF, t=C_START + 0.8 - T["hope_in"])
fade = np.ones(len(cueB)); n8 = int(0.8 * SR); fade[-n8:] = np.linspace(1, 0, n8)
place(music, cueB * fade[:, None], T["hope_in"])
cueC = load("assets/music/cueB2.mp3", ss=C_OFF, t=TOTAL - C_START)
fin = np.ones(len(cueC)); fin[:n8] = np.linspace(0, 1, n8)
place(music, cueC * fin[:, None], C_START)

# ---------- automation ----------
# 1) mood base curve (dB) — keyframes, linearly interpolated
K = [
    (0.0, -7), (0.8, -9),                                  # intro: music leads, then settles for the sad voice
    (T["xfade_suspense"] - 0.3, -9), (T["xfade_suspense"] + 0.6, -12),   # suspense: thinner, the rumble takes over
    (T["cue_a_end"] - 0.4, -13), (T["cue_a_end"], -60),   # cut to silence before hope
    (T["hope_in"], -60), (T["hope_in"] + 1.2, -9),        # hope rises with the light
    (T["push_triumph"] - 0.3, -6), (T["steps"][0], -3),   # build into triumph
    (T["burst"] + 0.2, -1), (T["xfade_relief"] + 0.3, -7),# peak on "um ano", settle into relief
    (T["push_logo"] - 0.5, -6), (T["logo"], -3),          # pre-lap swell into the logo
    (TOTAL - 1.6, -5), (TOTAL, -40),                       # tail
]
kt, kv = zip(*K)
base_db = np.interp(t_axis, kt, kv)

# 2) VO-driven duck from the real voice envelope (50 ms RMS), attack 60 ms / release 350 ms
hop = int(0.05 * SR)
env = np.sqrt(np.mean(vo[: len(vo) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
speech = (20 * np.log10(env + 1e-9) > -42).astype(float)
duck = np.zeros_like(speech)
a_att, a_rel = 1 - np.exp(-0.05 / 0.06), 1 - np.exp(-0.05 / 0.35)
for i in range(1, len(speech)):
    a = a_att if speech[i] > duck[i - 1] else a_rel
    duck[i] = duck[i - 1] + a * (speech[i] - duck[i - 1])
duck_db = np.interp(t_axis, np.arange(len(duck)) * 0.05, duck * -8.0)  # up to -8 dB under speech

music *= db(base_db + duck_db)[:, None].astype(np.float32)

# ---------- SFX bus: (file, peak offset s, trim s, level dB, event time) ----------
sfx = np.zeros((N, 2), np.float32)
E = [
    # melancholy: only the dissolve as "sumia" falls apart
    ("dissolve", 0.30, 1.0, -10, T["sumia"]),
    # suspense
    ("rumble", 0.0, 2.0, -26, T["xfade_suspense"] + 0.2), ("rumble", 0.0, 2.0, -24, T["xfade_suspense"] + 2.1),
    ("rumble", 0.0, 2.0, -22, T["xfade_suspense"] + 4.0),
    ("engine", 0.10, 1.0, -11, T["engine"]),
    ("subhit", 0.05, 0.48, +4, T["quebrou"]), ("crack", 1.10, 0.9, -2, T["quebrou"] + 0.02),
    ("heartbeat", 0.00, 1.4, -5, T["heartbeat"]), ("heartbeat", 0.00, 1.4, -7, T["heartbeat"] + 0.95),
    # hope
    ("swell", 1.95, 2.0, -8, T["hope_in"] + 0.05), ("shimmer", 0.10, 1.0, -9, T["hope_in"] + 0.35),
    ("coin", 0.00, 0.8, +3, T["coin_drop"]),
    ("pop", 0.05, 0.5, -12, T["coin_drop"] + 0.45), ("pop", 0.05, 0.5, -13, T["coin_drop"] + 0.77), ("pop", 0.05, 0.5, -14, T["coin_drop"] + 1.09),
    # triumph
    ("swell", 1.95, 2.0, -10, T["push_triumph"] + 0.12), ("whoosh", 0.00, 0.6, -7, T["push_triumph"] + 0.15),
    ("pop", 0.05, 0.5, -10, T["steps"][0]), ("pop", 0.05, 0.5, -9, T["steps"][1]), ("pop", 0.05, 0.5, -8, T["steps"][2]),
    ("confetti", 0.00, 1.0, -4, T["burst"]), ("ding", 0.00, 1.0, -8, T["burst"] + 0.1),
    # relief
    ("shimmer", 0.10, 1.0, -12, T["xfade_relief"] + 0.1), ("pop", 0.05, 0.5, -14, T["fox_in"] + 0.1),
    # authority
    ("whoosh", 0.00, 0.6, -7, T["push_logo"] + 0.15), ("riser", 1.65, 1.75, -9, T["logo"]),
    ("shimmer", 0.10, 1.0, -11, T["logo"] + 0.8),
]
cache = {}
for name, peak, trim, lvl, t in E:
    if name not in cache:
        c = load(f"assets/sfx/{name}.mp3")[: int(trim * SR)]
        f = np.ones(len(c)); k = min(len(c), int(0.06 * SR)); f[-k:] = np.linspace(1, 0, k)
        cache[name] = c * f[:, None]
    place(sfx, cache[name], t - peak, lvl)

mix = vo * db(0) + music + sfx
peak = np.max(np.abs(mix))
mix = (mix / max(peak, 1e-6) * db(-1.5)).astype(np.float32)
open("assets/mix-raw.f32", "wb").write(mix.tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "assets/mix-raw.f32",
                "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), "assets/mix.wav"], check=True)
print("ok assets/mix.wav")
for name, _, _, lvl, t in E: print(f"  {t:6.2f}s  {name:9s} {lvl:+d} dB")
