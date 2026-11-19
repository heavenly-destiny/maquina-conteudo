"""Sound design v4 — film-style mix, sample-exact (numpy).

Adds on top of mix3:
  * continuous AMBIENCE bed per mood (room + slow clock / tense wind / airy hope), crossfaded at mood boundaries
  * LAYERED hits (transient + body + sub + tail) instead of single samples
  * STEREO: every moving sound pans with the motion on screen (equal-power pan curve)
  * PITCH variation on repeated sounds (no machine-gun repeats)
  * REVERB send per mood (wet in melancholy/suspense, dry in triumph)
  * music DUCKS under big hits (SFX-keyed), in addition to the voice duck
Run: venv/bin/python mix4.py
"""
import json, subprocess
import numpy as np

SR = 48000
T = json.load(open("timing.json"))
TOTAL = T["total"]; N = int(TOTAL * SR)
rng = np.random.default_rng(11)


def load(path, ss=0.0, t=None, af=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(t)] if t else []) + ["-i", path] + (["-af", af] if af else []) + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()


def place(bus, clip, start, gain_db=0.0):
    i = int(round(start * SR)); clip = clip * (10 ** (gain_db / 20))
    if i < 0: clip, i = clip[-i:], 0
    clip = clip[: max(0, len(bus) - i)]; bus[i : i + len(clip)] += clip


def pan(clip, p0, p1=None):
    """equal-power pan from p0 to p1 over the clip (-1 left .. +1 right)."""
    p1 = p0 if p1 is None else p1
    p = np.linspace(p0, p1, len(clip)); a = (p + 1) * np.pi / 4
    mono = clip.mean(axis=1)
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1) * np.sqrt(2)


def pitch(clip, semis):
    r = 2 ** (semis / 12); idx = np.arange(0, len(clip) - 1, r)
    return np.stack([np.interp(idx, np.arange(len(clip)), clip[:, c]) for c in (0, 1)], axis=1).astype(np.float32)


def reverb(clip, decay=1.6, wet=0.35):
    n = int(decay * SR); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir /= np.sqrt(np.sum(ir ** 2))
    m = len(clip) + n; F = 1 << int(np.ceil(np.log2(m)))
    out = np.stack([np.fft.irfft(np.fft.rfft(clip[:, c], F) * np.fft.rfft(ir, F), F)[:m] for c in (0, 1)], axis=1)
    dry = np.vstack([clip, np.zeros((n, 2))])
    return (dry * (1 - wet) + out * wet).astype(np.float32)


def fade(clip, fin=0.0, fout=0.06):
    c = clip.copy(); a, b = int(fin * SR), int(fout * SR)
    if a: c[:a] *= np.linspace(0, 1, a)[:, None]
    if b: c[-b:] *= np.linspace(1, 0, b)[:, None]
    return c


def loop_to(clip, seconds, xf=0.5):
    out = clip.copy(); k = int(xf * SR)
    while len(out) < seconds * SR:
        nxt = clip.copy(); out[-k:] = out[-k:] * np.linspace(1, 0, k)[:, None] + nxt[:k] * np.linspace(0, 1, k)[:, None]
        out = np.vstack([out, nxt[k:]])
    return out[: int(seconds * SR)]


db = lambda x: 10 ** (x / 20)
t_axis = np.arange(N) / SR

# ---------------- voice ----------------
vo = load("assets/vo/vo-full.wav")[:N]; vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))

# ---------------- music (as in mix3: placed by measured energy) ----------------
music = np.zeros((N, 2), np.float32)
s0, s1 = T["xfade_suspense"], T["cue_a_end"]
A = load("assets/music/cueA.mp3", 0.4, s1); Ad = load("assets/music/cueA.mp3", 0.4, s1, "lowpass=f=800,highpass=f=60")
x = np.clip((np.arange(len(A)) / SR - s0) / 1.0, 0, 1)[:, None]
place(music, A * (1 - x) + Ad * x * 1.25, 0)
C_START = 23.2
place(music, fade(load("assets/music/cueB.mp3", 6.95, C_START + 0.8 - T["hope_in"]), 0, 0.8), T["hope_in"])
place(music, fade(load("assets/music/cueB2.mp3", 10.5, TOTAL - C_START), 0.8, 0.06), C_START)

K = [(0.0, -7), (0.8, -9), (s0 - 0.3, -9), (s0 + 0.6, -12), (s1 - 0.4, -13), (s1, -60), (T["hope_in"], -60), (T["hope_in"] + 1.2, -9),
     (T["push_triumph"] - 0.3, -6), (T["steps"][0], -3), (T["burst"] + 0.2, -1), (T["xfade_relief"] + 0.3, -7),
     (T["push_logo"] - 0.5, -6), (T["logo"], -3), (TOTAL - 1.6, -5), (TOTAL, -40)]
base_db = np.interp(t_axis, *zip(*K))
hop = int(0.05 * SR)
env = np.sqrt(np.mean(vo[: len(vo) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
sp = (20 * np.log10(env + 1e-9) > -42).astype(float); d = np.zeros_like(sp)
for i in range(1, len(sp)):
    a = (1 - np.exp(-0.05 / 0.06)) if sp[i] > d[i - 1] else (1 - np.exp(-0.05 / 0.35)); d[i] = d[i - 1] + a * (sp[i] - d[i - 1])
voice_duck = np.interp(t_axis, np.arange(len(d)) * 0.05, d * -8.0)
# duck depth follows the mood: shallow in triumph (music stays big), deep in melancholy/suspense (voice is fragile)
depth = np.interp(t_axis, [0, T["push_triumph"] - 0.2, T["push_triumph"] + 0.2, T["xfade_relief"], T["xfade_relief"] + 0.4, TOTAL], [1.0, 1.0, 0.45, 0.45, 1.0, 1.0])
voice_duck = voice_duck * depth

# SFX-keyed duck: music dips under the big hits so they punch through
hit_duck = np.zeros(N)
for t, depth in [(T["quebrou"], -6), (T["burst"], -4), (T["hope_in"] + 0.2, -3), (T["logo"], -3)]:
    i = int(t * SR); att, rel = int(0.03 * SR), int(0.45 * SR)
    seg = np.concatenate([np.linspace(0, depth, att), np.linspace(depth, 0, rel)])
    hit_duck[i - att : i - att + len(seg)] = np.minimum(hit_duck[i - att : i - att + len(seg)], seg[: N - (i - att)])
music *= db(base_db + voice_duck + hit_duck)[:, None].astype(np.float32)

# ---------------- ambience beds (continuous, crossfaded per mood) ----------------
amb = np.zeros((N, 2), np.float32)
# melancholy: quiet room tone (filtered pink-ish noise) + slow clock (tick slowed to ~1 tick/s)
room = rng.standard_normal((int((s0 + 1.0) * SR), 2)).astype(np.float32)
room = np.cumsum(room, axis=0); room -= np.convolve(room[:, 0], np.ones(2400) / 2400, "same")[:, None]; room /= np.max(np.abs(room)) + 1e-9
place(amb, fade(room, 1.0, 1.0), 0, -44)
clock = load("assets/sfx/tick.mp3", af="atempo=0.5,lowpass=f=3000")
place(amb, fade(loop_to(clock, s0 + 0.8), 0.6, 0.8), 0.2, -26)
# suspense: tense wind looped + existing rumble, wet
tense = loop_to(load("assets/sfx4/amb_tense.mp3"), s1 - s0 + 0.6, 0.6)
place(amb, fade(tense, 0.8, 0.25), s0 - 0.2, -8)
# hope -> end: airy morning air, gentle
hope = loop_to(load("assets/sfx4/amb_hope.mp3", af="volume=14dB"), TOTAL - T["hope_in"], 0.6)
place(amb, fade(hope, 1.5, 1.5), T["hope_in"], -16)

# ---------------- SFX: layered, panned, pitched, with reverb per mood ----------------
sfx = np.zeros((N, 2), np.float32)
cache = {}
def S(name, src="sfx4"):
    if (name, src) not in cache: cache[(name, src)] = load(f"assets/{src}/{name}.mp3")
    return cache[(name, src)].copy()
def hit(name, t, peak, lvl, trim=None, src="sfx4", p0=0.0, p1=None, semis=0.0, wet=0.0, decay=1.4):
    c = S(name, src)
    if trim: c = c[: int(trim * SR)]
    c = fade(c, 0, 0.05)
    if semis: c = pitch(c, semis)
    c = pan(c, p0, p1)
    if wet: c = reverb(c, decay, wet)
    place(sfx, c, t - peak, lvl)

W = {int(k): v for k, v in json.load(open("word-times.json")).items()}
# melancholy — sparse, wet, soft
hit("land", 0.45, 0.0, +6, 0.6, wet=0.3)                                   # wallet settles
hit("swish", W[2][1][1] - 0.05, 1.0, +8, 1.6, p0=-0.3, wet=0.3)
for i, t in enumerate([W[2][3][1] - 0.6 + k * 0.45 for k in range(3)]):     # each expense drains away to the right
    hit("swish", t, 1.0, +4, 1.6, p0=0.2, p1=0.6, semis=-2 - i, wet=0.4)
hit("dissolve", T["sumia"] + 0.55, 0.30, -6, 1.0, "sfx", p0=0.0, p1=0.5, wet=0.45)
# transition: dive into the dark (descending whoosh peaks as brightness hits bottom)
hit("fall", T["xfade_suspense"] + 0.55, 2.55, -18, 3.2, p0=0.0, wet=0.3, decay=2.2)
# suspense — wet, low
hit("engine", T["engine"], 0.10, -12, 1.0, "sfx", p0=-0.4, p1=0.3, wet=0.4)
hit("impact", T["quebrou"], 0.10, -2, 2.0, wet=0.25, decay=2.0)            # body + sub
hit("glass", T["quebrou"] + 0.01, 0.05, +10, 1.0, p0=0.15)                  # transient
hit("subhit", T["quebrou"], 0.05, +2, 0.48, "sfx")
hit("land", T["quebrou"] + 0.3, 0.0, +4, 0.6, p0=0.0)                      # alarm card lands
hit("heartbeat", T["heartbeat"], 0.0, -5, 1.4, "sfx", wet=0.3)
hit("heartbeat", T["heartbeat"] + 0.95, 0.0, -8, 1.4, "sfx", semis=-0.5, wet=0.35)
# transition: iris of light — reverse swell into a bloom, sparkles rising
hit("swell", T["hope_in"] + 0.05, 1.95, -7, 2.0, "sfx")
hit("bloom", T["hope_in"] + 0.2, 0.15, -6, 1.0, wet=0.25)
hit("sparkles", T["hope_in"] + 0.5, 0.25, -12, 2.0, p0=-0.5, p1=0.5)
# hope
hit("land", T["hope_in"] + 0.95, 0.0, +6, 0.6)                             # box lands
hit("swish", W[5][4][1], 1.0, +6, 1.6, p0=-0.2)
hit("passby", T["coin_drop"] - 0.2, 0.35, -16, 0.9, p0=0.0, semis=3)        # coin falls through
hit("coin", T["coin_drop"], 0.0, +3, 0.8, "sfx")
for k in range(3):
    hit("pop", T["coin_drop"] + 0.45 + k * 0.32, 0.05, -12 - k, 0.5, "sfx", p0=0.45, semis=k * 2)
# transition: match-cut — the coin flies at the camera
hit("passby", T["push_triumph"] + 0.15, 0.35, -5, 1.0, p0=-0.2, p1=0.2)
hit("swell", T["push_triumph"] + 0.12, 1.95, -11, 2.0, "sfx")
# triumph — dry, punchy, wide
for k, t in enumerate(T["steps"]):
    hit("pop", t, 0.05, -9 + k, 0.5, "sfx", p0=[-0.4, 0.4, 0.0][k], semis=k * 3)
    hit("land", t, 0.0, +2 + k * 2, 0.6)
hit("impact", T["burst"], 0.10, -8, 1.5)
hit("confetti", T["burst"], 0.0, -2, 1.0, "sfx", p0=-0.6, p1=0.6)
hit("cheer", T["burst"] + 0.05, 0.0, +6, 1.0, p0=0.0)
hit("ding", T["burst"] + 0.1, 0.0, -9, 1.0, "sfx")
# transition: white bloom + light leak into relief
hit("flashw", T["xfade_relief"], 0.10, -4, 1.0, p0=0.6, p1=-0.6)
# relief
hit("land", W[7][2][1], 0.0, +5, 0.6, p0=-0.35)                            # reserve card
hit("sparkles", W[7][3][1] + 0.1, 0.25, -14, 2.0, p0=-0.1, p1=0.2)          # shield
hit("bloom", T["fox_in"], 0.15, -14, 1.0, p0=0.4)
# transition: orange ink spreads from the fox frame -> brand
hit("passby", T["push_logo"] + 0.15, 0.35, -8, 1.0, p0=0.4, p1=-0.2)
hit("riser", T["logo"], 1.65, -12, 1.75, "sfx")
hit("sting", T["logo"] + 0.05, 0.0, -4, 1.0)
hit("sparkles", T["tagline"], 0.25, -16, 2.0, p0=-0.3, p1=0.3)

mix = vo + music + amb + sfx
mix = (mix / max(np.max(np.abs(mix)), 1e-6) * db(-1.5)).astype(np.float32)
open("assets/mix-raw.f32", "wb").write(mix.tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "assets/mix-raw.f32",
                "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), "assets/mix.wav"], check=True)
print("ok assets/mix.wav")
