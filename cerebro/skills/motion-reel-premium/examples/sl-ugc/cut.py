"""Cut creator footage into tight talking tracks + a timeline json per creative.
Run from videos/sl-ugc:  python3 cut.py u1 u2 ...   (no args = all)
Out: assets/<u>-talk.mp4 (silent picture), assets/<u>-voice.wav (cleaned voice), build/<u>.json (words, cuts, events)."""
import json, os, re, subprocess, sys
from edl import FIX, U

GAP, PRE, POST, TAIL = 0.42, 0.14, 0.18, 1.4
WORDS = json.load(open("brutos/words.json"))
os.makedirs("assets", exist_ok=True); os.makedirs("build", exist_ok=True)
norm = lambda s: re.sub(r"[^\wà-ú0-9]", "", s.lower())


def words_of(clip):
    fx = FIX.get(clip, {})
    out = []
    for w, s, e in WORDS[clip + ".MOV"]:
        t = w.strip()
        for k, v in fx.items():
            if abs(k - s) < 0.011: t = v
        out.append((t, s, e))
    return out


def subsegs(clip, a, b):
    ws = [w for w in words_of(clip) if w[2] > a + 0.06 and w[1] < b - 0.06]
    subs, cur = [], [a, None, []]
    for i, w in enumerate(ws):
        if cur[2] and w[1] - cur[2][-1][2] > GAP:
            cur[1] = min(cur[2][-1][2] + POST, w[1] - 0.04); subs.append(cur); cur = [w[1] - PRE, None, []]
        cur[2].append(w)
    cur[1] = b; subs.append(cur)
    return subs


DFN = os.path.expanduser("~/dfn/bin/deepFilter")  # uv venv (Python 3.11) with deepfilternet installed
STUDIO = ("highpass=f=75,bass=g=2:f=140:w=0.8,equalizer=f=320:t=q:w=1.1:g=-3,equalizer=f=3200:t=q:w=1.3:g=3,"
          "treble=g=2.5:f=9000,deesser=i=0.35,acompressor=threshold=-21dB:ratio=3.2:attack=4:release=90:makeup=3.5,"
          "alimiter=limit=0.9:level=disabled,loudnorm=I=-16:TP=-1.5:LRA=7")


def pro_voice(u):
    """iPhone voice -> 'studio mic': DeepFilterNet (noise + room) then EQ/de-ess/compression."""
    tmp = f"build/dfn-{u}"; os.makedirs(tmp, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"assets/{u}-voice-raw.wav", "-ac", "1", "-ar", "48000", f"{tmp}/{u}.wav"], check=True)
    subprocess.run([DFN, "--atten-lim", "32", f"{tmp}/{u}.wav", "-o", tmp], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{tmp}/{u}_DeepFilterNet3.wav", "-af", STUDIO, "-ac", "2", "-ar", "48000", f"assets/{u}-voice.wav"], check=True)


def cutout(u):
    """Person matte (Apple Vision) -> VP9 WebM with alpha for the brand-background look."""
    subprocess.run(["tools/personmask", f"assets/{u}-talk.mp4", f"assets/{u}-mask.mp4"], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"assets/{u}-talk.mp4", "-i", f"assets/{u}-mask.mp4", "-filter_complex",
                    "[1:v]format=gray,scale=1080:1920,boxblur=1:1[m];[0:v][m]alphamerge,format=yuva420p[v]", "-map", "[v]", "-c:v", "libvpx-vp9",
                    "-pix_fmt", "yuva420p", "-b:v", "6M", "-deadline", "realtime", "-cpu-used", "6", "-row-mt", "1", "-auto-alt-ref", "0", f"assets/{u}-cut.webm"], check=True)


def build(u):
    E = U[u]; parts = []; t = 0.0; words = []; cuts = []
    for k, seg in enumerate(E["segs"]):
        clip, a, b = seg[:3]; spk = seg[3] if len(seg) > 3 else "ela"
        for j, (s0, s1, ws) in enumerate(subsegs(clip, a, b)):
            cuts.append({"t": round(t, 3), "seg": k, "new_seg": j == 0, "new_clip": k > 0 and j == 0 and clip != E["segs"][k - 1][0], "spk": spk})
            parts.append((clip, s0, s1 - s0))
            for w, ws0, ws1 in ws:
                if w: words.append([w, round(t + max(ws0, s0 + 0.02) - s0, 3), round(t + ws1 - s0, 3), k, spk])
            t += s1 - s0
    TL = E.get("tail", TAIL); talk_end = round(t, 3); total = round(t + TL, 3)

    def at(anchor):
        key, occ = anchor; n = 0
        for w in words:
            if norm(w[0]) == norm(key):
                if n == occ: return w[1]
                n += 1
        raise SystemExit(f"{u}: anchor {anchor} not found")

    ev = [{"type": typ, "t": round(at(anc), 3), "dur": dur, **p} for typ, anc, dur, p in E["ov"]]
    data = {"u": u, "total": total, "talk_end": talk_end, "cta_at": round(at(E["cta_at"]), 3) if E.get("cta_at") else None, "words": words, "cuts": cuts, "events": ev, "hook": E["hook"], "cta": E["cta"], "music": E["music"], "title": E["title"]}
    json.dump(data, open(f"build/{u}.json", "w"), ensure_ascii=False, indent=1)

    cmd = ["ffmpeg", "-v", "error", "-y"]
    for clip, s, d in parts: cmd += ["-ss", f"{s:.3f}", "-t", f"{d:.3f}", "-i", f"sdr/{clip}.mov"]
    fv, fa = "", ""
    for i, (_, _, d) in enumerate(parts):
        fv += f"[{i}:v]scale=1080:1920,fps=30,setsar=1,eq=contrast=1.03:saturation=1.06,format=yuv420p[v{i}];"
        fa += f"[{i}:a]aresample=48000,afade=t=in:d=0.012,afade=t=out:st={max(0, d - 0.025):.3f}:d=0.025[a{i}];"
    cat = "".join(f"[v{i}][a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[vc][ac];[vc]tpad=stop_mode=clone:stop_duration={TL}[v];[ac]apad=pad_dur={TL}[a]"
    voice = "[a]aresample=48000[ao]"
    cmd += ["-filter_complex", fv + fa + cat + ";" + voice, "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-g", "15",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", f"assets/{u}-talk.mp4", "-map", "[ao]", "-ar", "48000", "-ac", "2", f"assets/{u}-voice-raw.wav"]
    subprocess.run(cmd, check=True)
    pro_voice(u)
    cutout(u)
    print(u, "total", total, "cuts", len(cuts), "events", len(ev))


if not os.path.exists("assets/IMG_4143.mp4"):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "sdr/IMG_4143.mov", "-vf", "scale=1080:1920,fps=30,eq=contrast=1.03:saturation=1.06,format=yuv420p",
                    "-an", "-c:v", "libx264", "-crf", "17", "-g", "15", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", "assets/IMG_4143.mp4"], check=True)
for u in sys.argv[1:] or list(U):
    build(u)
