"""Transcribe ElevenLabs takes (faster-whisper word times), score them against the approved script, and write
build/c{n}-vo.json (lines -> words with absolute times) + assets/vo/c{n}.wav for the chosen take.
Usage: venv/bin/python build/align.py score          -> transcribe every take, print match score + loudness
       venv/bin/python build/align.py pick 1a 2b ...  -> write vo json/wav for those takes"""
import difflib, json, os, re, subprocess, sys, unicodedata
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from roteiro import C  # noqa: E402

SR = 48000
TAIL = 2.6
VO = "assets/vo/"
CACHE = "build/whisper-cache.json"


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def load(f):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(b, np.float32).copy()


def transcribe(takes):
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    todo = [t for t in takes if t not in cache]
    if todo:
        from faster_whisper import WhisperModel
        m = WhisperModel("small", device="cpu", compute_type="int8")
        for t in todo:
            x = load(VO + f"c{t}.mp3")
            x16 = x[:: SR // 16000] if SR % 16000 == 0 else x
            segs, _ = m.transcribe(x16, language="pt", word_timestamps=True, vad_filter=False)
            cache[t] = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]
            json.dump(cache, open(CACHE, "w"), ensure_ascii=False)
    return cache


def script_words(n):
    out = []
    for li, (text, *_rest) in enumerate(C[n]["lines"]):
        for w in text.split():
            if norm(w):
                out.append((li, w))
    return out


def align(n, words):
    sw = script_words(n)
    a = [norm(w) for _, w in sw]; b = [norm(w[0]) for w in words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(sw)
    for i, j, k in sm.get_matching_blocks():
        for d in range(k):
            times[i + d] = (words[j + d][1], words[j + d][2])
    # interpolate gaps between known neighbours
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(times)):
        if times[i] is None:
            prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
            s = times[prev][1] if prev is not None else 0.0
            e = times[nxt][0] if nxt is not None else s + 0.3
            span = [k for k in range(i, nxt if nxt is not None else len(times)) if times[k] is None]
            step = (e - s) / (len(span) + 1)
            for q, k in enumerate(span):
                times[k] = (round(s + step * (q + 0.5), 3), round(s + step * (q + 1.3), 3))
            known = [i for i, t in enumerate(times) if t]
    return sw, times, sm.ratio()


def lufs_ish(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


if sys.argv[1] == "score":
    takes = sorted(f[1:-4] for f in os.listdir(VO) if re.match(r"c\d[ab]\.mp3$", f))
    cache = transcribe(takes)
    for t in takes:
        n = int(t[0]); _, _, r = align(n, cache[t])
        heard = " ".join(w[0] for w in cache[t])
        print(f"c{t} match={r:.3f} rms={lufs_ish(load(VO + f'c{t}.mp3')):.1f}dB dur={len(load(VO + f'c{t}.mp3')) / SR:.1f}s")
        print("   ", heard)
elif sys.argv[1] == "pick":
    cache = transcribe([t for t in sys.argv[2:]])
    for t in sys.argv[2:]:
        n = int(t[0]); sw, times, r = align(n, cache[t])
        x = load(VO + f"c{t}.mp3")
        lead = 0.25; total = round(len(x) / SR + lead + TAIL, 2)
        buf = np.zeros(int(total * SR), np.float32); i0 = int(lead * SR); buf[i0 : i0 + len(x)] = x
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", VO + f"c{n}.wav"], input=buf.tobytes(), check=True)
        lines = []
        for li, (text, mood, _gap) in enumerate(C[n]["lines"]):
            ws = [[w, round(times[k][0] + lead, 3), round(times[k][1] + lead, 3)] for k, (l2, w) in enumerate(sw) if l2 == li]
            lines.append({"text": text, "mood": mood, "start": ws[0][1], "dur": round(ws[-1][2] - ws[0][1], 3), "words": ws})
        json.dump({"take": t, "total": total, "lines": lines}, open(f"build/c{n}-vo.json", "w"), ensure_ascii=False, indent=1)
        print(f"c{n} <- {t} match={r:.3f} total={total}", [(round(l["start"], 2), round(l["start"] + l["dur"], 2)) for l in lines])
