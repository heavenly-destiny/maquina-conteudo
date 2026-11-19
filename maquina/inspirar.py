#!/usr/bin/env python3
"""inspirar.py <id>: baixa um vídeo viral, transcreve, tira frames e gera a decupagem em RAIZ/inspiracoes/<id>/."""
import glob, json, re, subprocess, sys, time
from pathlib import Path
import maquina as m

INS = m.RAIZ / "inspiracoes"


def salvar(p, e):
    tmp = p / "estado.tmp"
    tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
    tmp.replace(p / "estado.json")


def fase(p, e, f):
    e["fase"] = f
    salvar(p, e)


def rodar(id_):
    p = INS / id_
    ped = json.loads((p / "pedido.json").read_text())
    url = ped.get("url", "")
    e = {"status": "gerando", "fase": "baixando", "desde": time.time(), "erro": ""}
    salvar(p, e)
    try:
        if ped.get("arquivo"):  # subiu o arquivo no painel: já está aqui
            src = next(x for x in p.glob("video.*") if x.suffix.lower() in (".mp4", ".mov", ".m4v"))
            if src.name != "video.mp4":
                m.sh(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-c:v", "libx264", "-crf", "20", "-c:a", "aac", "-movflags", "+faststart", str(p / "video.mp4")])
                src.unlink()
            url = ""
        if not url:
            pass
        elif "instagram.com" in url:
            url = url.split("?")[0]
        cmd = ["yt-dlp", "--no-playlist", "--write-info-json", "-f", "bv*[height<=1080]+ba/b", "--merge-output-format", "mp4",
               "-o", str(p / "video.%(ext)s")]
        if "youtu" in url:
            cmd += ["--extractor-args", "youtube:player_client=android,mweb"]
        if url:
            m.sh([*cmd, url])
        for j in glob.glob(str(p / "video.info.json")):
            Path(j).replace(p / "info.json")
        v = p / "video.mp4"
        m.sh(["ffmpeg", "-y", "-v", "error", "-ss", "1", "-i", str(v), "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "4", str(p / "capa.jpg")])

        fase(p, e, "transcrevendo")
        m.sh(["ffmpeg", "-y", "-v", "error", "-i", str(v), "-vn", "-ac", "1", "-ar", "16000", str(p / "audio.wav")])
        m.sh(["whisper-cli", "-m", str(m.WHISPER), "-l", "auto", "-t", "8", "-oj", "-f", str(p / "audio.wav"), "-of", str(p / "wh")])
        segs = json.loads((p / "wh.json").read_text())["transcription"]
        (p / "transcricao.txt").write_text("\n".join(
            f"[{s['offsets']['from'] / 1000:7.2f}-{s['offsets']['to'] / 1000:7.2f}] {s['text'].strip()}" for s in segs))

        (p / "frames").mkdir(exist_ok=True)
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(v), "-vf", "select='gt(scene,0.3)',scale=360:-2",
                            "-vsync", "vfr", "-frames:v", "12", "-q:v", "4", str(p / "frames/f%02d.jpg")], capture_output=True)
        if len(list((p / "frames").glob("*.jpg"))) < 4:  # pouco corte: amostra uniforme
            for f in (p / "frames").glob("*.jpg"):
                f.unlink()
            d = m.dur(v)
            m.sh(["ffmpeg", "-y", "-v", "error", "-i", str(v), "-vf", f"fps=10/{d:.2f},scale=360:-2", "-frames:v", "10",
                  "-q:v", "4", str(p / "frames/f%02d.jpg")])
        m.sh(["ffmpeg", "-y", "-v", "error", "-pattern_type", "glob", "-i", str(p / "frames/f*.jpg"),
              "-vf", "tile=6x2:padding=4", "-frames:v", "1", "-q:v", "4", str(p / "sheet.jpg")])

        fase(p, e, "analisando")
        m.claude(m.prompt("decupar", pasta=p), p, m.MODELO_CORTE, "log.txt")
        json.loads((p / "decupagem.json").read_text())  # valida
        e.update(status="pronto", fase="")
    except Exception as ex:
        e.update(status="erro", fase="", erro=str(getattr(ex, "stderr", "") or ex)[-500:])
    salvar(p, e)
    m.avisar(f"Inspiração {e['status']}")


if __name__ == "__main__":
    rodar(sys.argv[1])
