"""Emotion-driven mix: cue A (melancholy -> suspense, filtered darker in the suspense half), a beat of
silence before hope, cue B aligned so its climax lands on the triumph steps, SFX chosen per mood and
peak-aligned to the motion events in timing.json."""
import json, subprocess, sys

T = json.load(open("timing.json"))
TOTAL = T["total"]
A_IN = 0.4                      # cue A has 0.4s of leading silence
B_OFFSET = float(sys.argv[1])   # seconds into cue B that play at T.hope_in (measured, see README)

SFX = {  # file, peak offset, trim, gain
    "engine": ("assets/sfx/engine.mp3", 0.10, 1.0, 0.35),
    "subhit": ("assets/sfx/subhit.mp3", 0.05, 0.48, 1.8),
    "heartbeat": ("assets/sfx/heartbeat.mp3", 0.00, 1.4, 0.7),
    "shimmer": ("assets/sfx/shimmer.mp3", 0.10, 1.0, 0.45),
    "coin": ("assets/sfx/coin.mp3", 0.00, 0.8, 1.6),
    "pop": ("assets/sfx/pop.mp3", 0.05, 0.5, 0.35),
    "whoosh": ("assets/sfx/whoosh.mp3", 0.00, 0.6, 0.5),
    "riser": ("assets/sfx/riser.mp3", 1.65, 1.75, 0.4),
    "ding": ("assets/sfx/ding.mp3", 0.00, 1.0, 0.45),
}
ev = [
    # melancholy: no SFX on purpose
    ("engine", T["engine"]), ("subhit", T["quebrou"]),                 # suspense
    ("heartbeat", T["heartbeat"]), ("heartbeat", T["heartbeat"] + 0.95),
    ("shimmer", T["hope_in"] + 0.15), ("coin", T["coin_drop"]),          # hope
    ("pop", T["coin_drop"] + 0.45), ("pop", T["coin_drop"] + 0.77), ("pop", T["coin_drop"] + 1.09),
    ("whoosh", T["push_triumph"] + 0.15), ("ding", T["burst"] + 0.05),  # triumph
    ("whoosh", T["push_logo"] + 0.15), ("riser", T["logo"]),            # authority
]

a_len = T["cue_a_end"]
s0, s1 = T["xfade_suspense"], T["cue_a_end"]
C_START, C_OFFSET = 23.2, 10.5  # calm ending from the second B take, crossfaded in for relief + logo
b_len = C_START + 0.8 - T["hope_in"]
inputs = ["-i", "assets/vo/vo-full.wav",
          "-ss", str(A_IN), "-t", str(a_len), "-i", "assets/music/cueA.mp3",
          "-ss", str(B_OFFSET), "-t", str(b_len), "-i", "assets/music/cueB.mp3",
          "-ss", str(C_OFFSET), "-t", str(TOTAL - C_START), "-i", "assets/music/cueB2.mp3"]
f = [
    # cue A: soft under the sad voice; in the suspense half it goes muffled and darker, then cuts to silence
    f"[1:a]aresample=48000,lowpass=f=900:enable='between(t,{s0},{s1})',"
    f"volume='if(between(t,{s0},{s1}),0.75,0.6)':eval=frame,afade=t=out:st={a_len-0.35}:d=0.35[ma]",
    # cue B enters with the light, ends with the piece
    f"[2:a]aresample=48000,afade=t=in:st=0:d=0.4,afade=t=out:st={b_len-0.8}:d=0.8,"
    f"adelay={int(T['hope_in']*1000)}|{int(T['hope_in']*1000)},volume=0.8[mb]",
    f"[3:a]aresample=48000,afade=t=in:st=0:d=0.8,afade=t=out:st={TOTAL-C_START-1.5}:d=1.5,"
    f"adelay={int(C_START*1000)}|{int(C_START*1000)},volume=1.0[mc]",
    "[ma][mb][mc]amix=inputs=3:normalize=0[mus]",
    "[0:a]aresample=48000,asplit=2[vo][key]",
    "[mus][key]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=300[duck]",
]
labels = ["[vo]", "[duck]"]
for i, (n, t) in enumerate(ev):
    path, peak, trim, gain = SFX[n]
    inputs += ["-i", path]
    ms = int(max(0, t - peak) * 1000)
    f.append(f"[{i+4}:a]aresample=48000,atrim=0:{trim},afade=t=out:st={trim-0.08}:d=0.08,volume={gain},adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
f.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={TOTAL},atrim=0:{TOTAL},loudnorm=I=-14:TP=-1.0:LRA=11[out]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(f), "-map", "[out]", "-ar", "48000", "-ac", "2", "assets/mix.wav"], check=True)
print("ok assets/mix.wav  (cue B offset", B_OFFSET, ")")
