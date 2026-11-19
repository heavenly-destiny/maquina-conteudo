"""Portão de qualidade de um corte: arquivo existe, duração ok, sem pausa, sem muleta/hesitação."""
import re, subprocess, os
from pathlib import Path

WHISPER = os.path.expanduser("~/.cache/whisper/ggml-large-v3-turbo.bin")
MULETA = re.compile(r"\b(é{2,}|ééé|hmm+|hum+|ãh+|ah+\.\.\.|é\.\.\.|um\.\.\.|tipo,)", re.I)


def _run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def checar(final, voz):
    final, voz = Path(final), Path(voz)
    if not final.exists():
        return {"ok": False, "problemas": ["final.mp4 não foi gerado"]}
    d = float(_run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)]).stdout or 0)
    prob = []
    if not 15 <= d <= 120:
        prob.append(f"duração {d:.1f}s fora de 15-120s")
    sil = _run(["ffmpeg", "-nostats", "-i", str(final), "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"]).stderr
    pausas = re.findall(r"silence_start: ([\d.]+)", sil)
    if pausas:
        prob.append("pausa >0,3s em " + ", ".join(f"{float(x):.1f}s" for x in pausas))
    txt = ""
    if voz.exists():
        tmp = voz.with_name("verif16k.wav")
        _run(["ffmpeg", "-y", "-v", "error", "-i", str(voz), "-ar", "16000", "-ac", "1", str(tmp)])
        txt = _run(["whisper-cli", "-m", WHISPER, "-l", "pt", "-nt", "--prompt", "Hmm, é... ééé, tipo, né, um...", "-f", str(tmp)]).stdout.strip()
        tmp.unlink(missing_ok=True)
        ach = MULETA.findall(txt)
        if ach:
            prob.append("possível hesitação na fala: " + ", ".join(sorted(set(ach))))
    return {"ok": not prob, "problemas": prob, "duracao": d, "texto": txt}


if __name__ == "__main__":
    import sys, json
    print(json.dumps(checar(sys.argv[1], sys.argv[2]), ensure_ascii=False, indent=1))
