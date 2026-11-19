"""Renders index.html from index.template.txt + timing.json + word-times.json (single source of timing)."""
import json

T = json.load(open("timing.json"))
W = {int(k): v for k, v in json.load(open("word-times.json")).items()}
r = lambda x: f"{x:.3f}"
pad = 0.3  # scenes overlap the transition window
S = {
    "__TOTAL__": r(T["total"]),
    "__S1D__": r(T["push_1"] + pad),
    "__S2S__": r(T["push_1"]), "__S2D__": r(T["cut_mascot"] - T["push_1"]),
    "__S3S__": r(T["cut_mascot"]), "__S3D__": r(T["xfade_payoff"] + 0.35 - T["cut_mascot"]),
    "__S3OD__": r(T["xfade_payoff"] + 0.1 - T["cut_mascot"]),
    "__S4S__": r(T["xfade_payoff"]), "__S4D__": r(T["push_2"] + pad + 0.12 - T["xfade_payoff"]),
    "__S5S__": r(T["push_2"]), "__S5D__": r(T["xfade_allinone"] + 0.35 - T["push_2"]),
    "__S6S__": r(T["xfade_allinone"]), "__S6D__": r(T["cut_human"] - T["xfade_allinone"]),
    "__S7S__": r(T["cut_human"]), "__S7D__": r(T["cut_frame"] - T["cut_human"]),
    "__S8S__": r(T["cut_frame"]), "__S8D__": r(T["push_3"] + pad + 0.12 - T["cut_frame"]),
    "__S9S__": r(T["push_3"]), "__S9D__": r(T["total"] - T["push_3"]),
    "__TIMING__": json.dumps(T),
    "__WORDS__": json.dumps(W, ensure_ascii=False),
}
html = open("index.template.txt").read()
for k, v in S.items():
    html = html.replace(k, v)
assert "__" not in html.split("<script>")[-1].replace("__timelines", ""), "unreplaced placeholder"
open("index.html", "w").write(html)
print("ok index.html")
