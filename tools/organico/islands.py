"""Transcreve cada ilha de fala separada (entre pausas >= 0.25s), com tempo absoluto.
O whisper inteiro esconde tomada repetida; ilha por ilha ela aparece. uso: islands.py src.wav offset"""
import sys, subprocess, re, tempfile, os
wav, off = sys.argv[1], float(sys.argv[2])
o = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-32dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", o)]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))
isl, cur = [], 0.0
for s, e in zip(st, en + [dur]):
    if s - cur > 0.12: isl.append((cur, s))
    cur = e
if dur - cur > 0.12: isl.append((cur, dur))
tmp = tempfile.mkdtemp()
for a, b in isl:
    p = os.path.join(tmp, "i.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-ss", f"{max(0, a - 0.05):.2f}", "-t", f"{b - a + 0.1:.2f}", p])
    tx = subprocess.run(["whisper-cli", "-m", os.path.expanduser("~/.cache/whisper/ggml-large-v3-turbo.bin"), "-l", "pt", "-nt", "-f", p], capture_output=True, text=True).stdout.strip().replace("\n", " ")
    print(f"{a + off:8.2f} {b + off:8.2f}  {tx}")
