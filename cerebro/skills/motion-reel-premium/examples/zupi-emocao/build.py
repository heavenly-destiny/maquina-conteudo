"""Fills index.template.txt with timing.json + word-times.json (single source of timing)."""
import json
T = json.load(open("timing.json")); W = {int(k): v for k, v in json.load(open("word-times.json")).items()}
r = lambda x: f"{x:.3f}"
S = {
    "__TOTAL__": r(T["total"]),
    "__S1D__": r(T["xfade_suspense"] + 0.8),
    "__S2S__": r(T["xfade_suspense"]), "__S2D__": r(T["cue_a_end"] + 0.2 - T["xfade_suspense"]),
    "__S3S__": r(T["hope_in"]), "__S3D__": r(T["push_triumph"] + 0.42 - T["hope_in"]),
    "__S4S__": r(T["push_triumph"]), "__S4D__": r(T["xfade_relief"] + 0.5 - T["push_triumph"]),
    "__S5S__": r(T["xfade_relief"]), "__S5D__": r(T["push_logo"] + 0.8 - T["xfade_relief"]),
    "__S6S__": r(T["push_logo"]), "__S6D__": r(T["total"] - T["push_logo"]),
    "__DKS__": r(T["cue_a_end"] - 0.12), "__DKD__": r(T["hope_in"] + 1.4 - T["cue_a_end"] + 0.12),
    "__TIMING__": json.dumps(T), "__WORDS__": json.dumps(W, ensure_ascii=False),
}
h = open("index.template.txt").read()
for k, v in S.items(): h = h.replace(k, v)
open("index.html", "w").write(h); print("ok index.html")
