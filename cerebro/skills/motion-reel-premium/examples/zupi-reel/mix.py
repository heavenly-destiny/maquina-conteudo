"""Builds assets/mix.wav from timing.json: voice + music bed (with drop-out and ducking) + SFX.
SFX times come from the same timing.json the composition uses, so motion and sound stay locked.
Each SFX has a measured peak offset (seconds from file start to its loudest moment); we align
that peak — not the file start — to the motion event."""
import json, subprocess

T = json.load(open("timing.json"))
TOTAL = T["total"]
MUSIC_IN = 8.0  # the generated bed is silent for its first 8s

# name: (file, peak_offset_s, trim_s, gain)
SFX = {
    "whoosh": ("assets/sfx/whoosh.mp3", 0.00, 0.6, 0.55),
    "pop": ("assets/sfx/pop.mp3", 0.05, 0.6, 0.45),
    "ding": ("assets/sfx/ding.mp3", 0.00, 1.0, 0.5),
    "tick": ("assets/sfx/tick.mp3", 0.20, T["counter_dur"], 0.22),
    "boing": ("assets/sfx/boing.mp3", 0.00, 1.0, 0.4),
    "riser": ("assets/sfx/riser.mp3", 1.65, 1.75, 0.55),
}

# event time = when the motion peaks; the sound's peak lands there
events = []
for k in ("push_1", "push_2", "push_3"):
    events.append(("whoosh", T[k] + 0.15))  # mid-move of a 0.3s push
events.append(("whoosh", T["zoom_through"] + 0.1))
events += [("pop", t + 0.35) for t in T["notif"]]  # notification settles 0.35s after it starts
events.append(("tick", T["counter_start"] + 0.2))
events.append(("ding", T["check"] + 0.12))  # overshoot peak of back.out
events += [("pop", t + 0.25) for t in T["features"]]  # badge pop settles
events.append(("boing", T["fox_hop_land"]))
events.append(("riser", T["logo"]))

inputs = ["-i", "assets/vo/vo-full.wav", "-ss", str(MUSIC_IN), "-t", str(TOTAL + 0.5), "-i", "assets/music/bed.mp3"]
f = []
d0, d1 = T["dropout"]
f.append(
    f"[1:a]aresample=48000,lowpass=f=450:enable='between(t,{d0},{d1})',"
    f"volume='if(between(t,{d0},{d1}),0.25,1)':eval=frame,"
    f"afade=t=out:st={TOTAL-0.9}:d=0.9,atrim=0:{TOTAL}[mus]"
)
f.append("[0:a]aresample=48000,asplit=2[vo][key]")
f.append("[mus][key]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=280:makeup=1[duck]")
labels = ["[vo]", "[duck]"]
for i, (name, t) in enumerate(events):
    path, peak, trim, gain = SFX[name]
    inputs += ["-i", path]
    start = max(0.0, t - peak)
    ms = int(start * 1000)
    f.append(
        f"[{i+2}:a]aresample=48000,atrim=0:{trim},afade=t=out:st={trim-0.08}:d=0.08,"
        f"volume={gain},adelay={ms}|{ms}[s{i}]"
    )
    labels.append(f"[s{i}]")
f.append(
    "".join(labels)
    + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={TOTAL},atrim=0:{TOTAL},"
    "loudnorm=I=-14:TP=-1.0:LRA=9[out]"
)
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(f), "-map", "[out]",
     "-ar", "48000", "-ac", "2", "assets/mix.wav"],
    check=True,
)
for name, t in events:
    print(f"{name:7s} peak @ {t:.2f}s")
print("ok assets/mix.wav")
