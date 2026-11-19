#!/usr/bin/env python3
"""Converte JSON do whisper-cli (-ojf -dtw) em lista de palavras [{text,start,end}] com tempo absoluto.
Uso: dtw_words.py in.json offset out.json"""
import json, sys
d = json.load(open(sys.argv[1]))["transcription"]; off = float(sys.argv[2])
toks = [t for s in d for t in s["tokens"] if not t["text"].startswith("[_") and t.get("t_dtw", -1) >= 0]
words = []
for t in toks:
    tx, ts = t["text"], t["t_dtw"] / 100 + off - 0.06
    if tx.startswith(" ") or not words:
        words.append({"text": tx.strip(), "start": round(ts, 3)})
    else:
        words[-1]["text"] += tx
words = [w for w in words if w["text"] and w["text"] not in ",.?!"]
for i, w in enumerate(words):
    nxt = words[i + 1]["start"] if i + 1 < len(words) else w["start"] + 0.5
    w["end"] = round(min(nxt, w["start"] + 0.9), 3)
json.dump(words, open(sys.argv[3], "w"), ensure_ascii=False)
print(" ".join(f'{w["start"]:.2f}:{w["text"]}' for w in words))
