#!/usr/bin/env python3
"""Monta o corte HORIZONTAL (1920x1080, 30fps) a partir de trechos do bruto SDR.

Uso: cut.py edl.json outdir
edl.json = {
  "sources": {"main": {"file": "sdr_main.mov", "offset": 1290, "wav": "main.wav", "words": "words_main.json"}},
  "zooms": {"wide": [0,0,1920,1080], "punch": [x,y,w,h]},
  "segments": [["main", a, b, "wide"], ...]   # tempos absolutos do bruto; a/b sempre em silencio ou fronteira de palavra
}
Pausas > MAXGAP (detectadas na voz limpa "silwav", sem eco) dentro de um trecho viram corte (fica KEEP de respiro de cada lado). Frases nunca sao cortadas no meio:
os limites de cada trecho vem da EDL, escolhidos a mao em silencios reais.
Saida: outdir/video.mp4, outdir/words.json (tempo de saida, campo seg), outdir/cuts.json (instantes de corte).
"""
import json, os, re, subprocess, sys

MAXGAP, KEEP = 0.18, 0.08  # pausa de pensar/olhar pra baixo sai inteira (pedido tanpz 18/11)
VOICE = ("highpass=f=75,afftdn=nf=-30,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,"
         "deesser=i=0.4,acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=3")


def silences(wav, offset):
    out = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.15", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) + offset for x in re.findall(r"silence_start: ([\d.]+)", out)]
    en = [float(x) + offset for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(st, en))


def ranges(a, b, sil):
    """[a,b] menos as pausas longas internas."""
    rs, cur = [], a
    for s, e in sil:
        if s > a and e < b and e - s > MAXGAP:
            rs.append([cur, s + KEEP])
            cur = e - KEEP
    rs.append([cur, b])
    return [r for r in rs if r[1] - r[0] > 0.08]


def buracos(src, chaves):
    """trechos do bruto a tirar, um por palavra apagada no editor: do fim da anterior ao inicio da seguinte (com folga)."""
    out = {}
    for sk, S in src.items():
        ws = sorted(S["words"], key=lambda w: w["start"])
        for i, w in enumerate(ws):
            if f"{sk}:{w['start']:.2f}" in chaves:
                a = max(ws[i - 1]["end"] if i else w["start"] - 0.3, w["start"] - 0.06)
                b = min(ws[i + 1]["start"] if i + 1 < len(ws) else w["end"] + 0.3, w["end"] + 0.06)
                out.setdefault(sk, []).append([a, b])
    return out


def menos(rs, tira):
    """intervalos rs sem os buracos; pedaco menor que 0.08s some."""
    for a, b in tira:
        novo = []
        for s, e in rs:
            if b <= s or a >= e:
                novo.append([s, e]); continue
            if a > s: novo.append([s, a])
            if b < e: novo.append([b, e])
        rs = novo
    return [r for r in rs if r[1] - r[0] > 0.08]


def main(edl_path, out):
    base = os.path.dirname(os.path.abspath(edl_path))
    edl = json.load(open(edl_path))
    os.makedirs(out, exist_ok=True)
    src = {}
    for k, v in edl["sources"].items():
        src[k] = dict(v, sil=silences(os.path.join(base, v.get("silwav", v["wav"])), v["offset"]),
                      words=json.load(open(os.path.join(base, v["words"]))))
    # editor da Forja: palavras que a pessoa apagou viram buracos nos trechos (chave = fonte:inicio no bruto)
    aj = json.load(open(os.path.join(base, "ajustes.json"))) if os.path.exists(os.path.join(base, "ajustes.json")) else {}
    fora = set(aj.get("remover") or [])
    tira = buracos(src, fora)
    pieces, words, cuts, t = [], [], [], 0.0
    mapa = []  # (fonte, s, e, t) de cada pedaço, pra achar onde cai o vídeo mostrado
    for i, (sk, a, b, zoom, *opt) in enumerate(edl["segments"]):
        S = src[sk]
        x, y, w, h = edl["zooms"][zoom]
        # "inteiro": trecho em que um vídeo toca no monitor, sem cortar pausa (regra 18/11)
        for j, (s, e) in enumerate(menos([[a, b]] if "inteiro" in opt else ranges(a, b, S["sil"]), tira.get(sk, []))):
            # alinha no grid de frames (30fps): audio e video com a mesma duracao exata, sem deriva acumulada
            s = S["offset"] + round((s - S["offset"]) * 30) / 30
            e = s + max(3, round((e - s) * 30)) / 30
            p = os.path.join(out, f"p{i:02d}_{j:02d}.mov")
            vf = f"crop={w}:{h}:{x}:{y},scale=1920:1080:flags=lanczos,fps=30,eq=contrast=1.06:saturation=1.1,curves=all='0/0 0.5/0.49 0.8/0.72 1/0.86',format=yuv420p"
            af = f"afade=t=in:d=0.012,afade=t=out:st={e - s - 0.015:.3f}:d=0.015"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s - S['offset']:.6f}", "-t", f"{e - s:.6f}",
                            "-i", os.path.join(base, S["file"]), "-vf", vf, "-af", af,
                            "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-g", "30", "-keyint_min", "30",
                            "-frames:v", str(round((e - s) * 30)), "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", p], check=True)
            pieces.append(p)
            for wd in S["words"]:
                if s - 0.02 <= wd["start"] < e and f"{sk}:{wd['start']:.2f}" not in fora:
                    words.append({"text": wd["text"], "key": f"{sk}:{wd['start']:.2f}", "start": round(t + max(0, wd["start"] - s), 3),
                                  "end": round(t + min(wd["end"], e) - s, 3), "seg": i})
            cuts.append({"t": round(t, 3), "seg": i, "new_seg": j == 0})
            mapa.append((sk, s, e, t))
            t += e - s
    lst = os.path.join(out, "list.txt")
    open(lst, "w").write("".join(f"file '{os.path.basename(p)}'\n" for p in pieces))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "copy",
                    "-af", VOICE, "-c:a", "pcm_s16le", "-ar", "48000", os.path.join(out, "video.mov")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(out, "video.mov"), "-c:v", "copy", "-an",
                    "-movflags", "+faststart", os.path.join(out, "video.mp4")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(out, "video.mov"), "-vn",
                    os.path.join(out, "voice.wav")], check=True)
    for p in pieces + [lst, os.path.join(out, "video.mov")]:
        os.remove(p)
    json.dump(words, open(os.path.join(out, "words.json"), "w"), ensure_ascii=False)
    json.dump(cuts, open(os.path.join(out, "cuts.json"), "w"))
    # vídeo mostrado no monitor: original em tela cheia com o áudio original (organico.build + mix.py leem isso)
    mostra = []
    for m in edl.get("mostrar", []):
        for sk, s, e, t0 in mapa:
            if sk == m.get("src", "main") and s - 0.05 <= m["src_t"] < e:
                at = t0 + max(0, m["src_t"] - s)
                mostra.append({"file": m["file"], "at": round(at, 3), "ss": m.get("ss", 0), "dur": round(min(m["dur"], t0 + e - s - at), 3)})
                break
        else:
            raise SystemExit(f"mostrar fora dos segmentos: {m}")
    json.dump(mostra, open(os.path.join(out, "mostrar.json"), "w"))
    print(f"ok {t:.2f}s, {len(pieces)} pedacos, {len(words)} palavras")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
