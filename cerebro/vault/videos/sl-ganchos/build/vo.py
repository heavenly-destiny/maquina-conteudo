"""Generate VO per line with edge-tts (word boundaries), trim silence, lay out with mood gaps.
Writes assets/vo/c{n}.wav + build/c{n}-vo.json (same shape the lib expects). Run: venv/bin/python build/vo.py 1 2 3 4 5"""
import asyncio, json, os, subprocess, sys
import numpy as np
import edge_tts

sys.path.insert(0, os.path.dirname(__file__))
from roteiro import C, PROSODY  # noqa: E402

VOICE = "pt-BR-ThalitaMultilingualNeural"
SR = 48000
TAIL = 2.6


async def tts(text, rate, pitch, path):
    com = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch, boundary="WordBoundary")
    words, audio = [], bytearray()
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append([ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7])
    open(path, "wb").write(audio)
    return words


def load(f):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(b, np.float32).copy()


def bounds(x):
    h = int(0.01 * SR); e = np.sqrt(np.mean(x[: len(x) // h * h].reshape(-1, h) ** 2, 1)); on = np.where(20 * np.log10(e + 1e-9) > -40)[0]
    return max(0, on[0] * h - int(0.04 * SR)), min(len(x), (on[-1] + 1) * h + int(0.12 * SR))


for n in [int(a) for a in sys.argv[1:]] or list(C):
    t = 0.0; out = []; lines = []
    for i, (text, mood, gap) in enumerate(C[n]["lines"]):
        rate, pitch = PROSODY[mood]
        mp3 = f"assets/vo/c{n}l{i + 1}.mp3"
        words = asyncio.run(tts(text, rate, pitch, mp3))
        x = load(mp3); a, b = bounds(x); x = x[a:b]
        t += gap; s = t
        lines.append({"text": text, "mood": mood, "start": round(s, 3), "dur": round(len(x) / SR, 3),
                      "words": [[w, round(s + ws - a / SR, 3), round(s + we - a / SR, 3)] for w, ws, we in words]})
        out.append((s, x)); t += len(x) / SR
    total = round(t + TAIL, 2); buf = np.zeros(int(total * SR), np.float32)
    for s, x in out:
        i = int(s * SR); buf[i : i + len(x)] += x
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", f"assets/vo/c{n}.wav"], input=buf.tobytes(), check=True)
    json.dump({"total": total, "lines": lines}, open(f"build/c{n}-vo.json", "w"), ensure_ascii=False, indent=1)
    print(n, total, [(round(l["start"], 2), len(l["words"])) for l in lines])
