#!/usr/bin/env python3
"""transcrever.py <id>: baixa (link) ou pega o arquivo enviado, transcreve local com whisper e deixa texto.txt, tempo.txt e legenda.srt em RAIZ/transcricoes/<id>/."""
import json, re, sys, time
from pathlib import Path
import maquina as m

TRA = m.RAIZ / "transcricoes"


def salvar(p, e):
    tmp = p / "estado.tmp"
    tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
    tmp.replace(p / "estado.json")


def srt_t(ms):
    h, ms = divmod(int(ms), 3600000)
    mi, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{mi:02}:{s:02},{ms:03}"


def rodar(id_):
    p = TRA / id_
    ped = json.loads((p / "pedido.json").read_text())
    e = {"status": "gerando", "fase": "baixando", "desde": time.time(), "erro": "", "titulo": ped.get("arquivo") or ""}
    salvar(p, e)
    try:
        url = ped.get("url", "")
        if url:
            if "instagram.com" in url:
                url = url.split("?")[0]
            cmd = ["yt-dlp", "--no-playlist", "--write-info-json", "-f", "ba/b", "-o", str(p / "video.%(ext)s")]
            if "youtu" in url:
                cmd += ["--extractor-args", "youtube:player_client=android,mweb"]
            m.sh([*cmd, url])
            info = json.loads(next(p.glob("*.info.json")).read_text()) if list(p.glob("*.info.json")) else {}
            e["titulo"] = info.get("title") or url
            for j in p.glob("*.info.json"):
                j.unlink()
        src = next(x for x in p.glob("video.*") if x.suffix != ".json")
        e["fase"] = "transcrevendo"
        salvar(p, e)
        m.sh(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(p / "audio.wav")])
        e["duracao"] = round(m.dur(p / "audio.wav"))
        m.sh(["whisper-cli", "-m", str(m.WHISPER), "-l", "auto", "-t", "8", "-ml", "42", "-sow", "--prompt", "Hello. Olá, tudo bem? Sim, vamos lá.", "-oj", "-f", str(p / "audio.wav"), "-of", str(p / "wh")])
        segs = [s for s in json.loads((p / "wh.json").read_text())["transcription"] if s["text"].strip()]
        (p / "texto.txt").write_text(re.sub(r"([.!?])\s+", r"\1\n", " ".join(s["text"].strip() for s in segs)).strip() + "\n")  # uma frase por linha
        (p / "tempo.txt").write_text("\n".join(f"[{s['offsets']['from'] / 1000:7.2f}-{s['offsets']['to'] / 1000:7.2f}] {s['text'].strip()}" for s in segs) + "\n")
        (p / "legenda.srt").write_text("\n".join(f"{i}\n{srt_t(s['offsets']['from'])} --> {srt_t(s['offsets']['to'])}\n{s['text'].strip()}\n" for i, s in enumerate(segs, 1)))
        for f in (src, p / "audio.wav", p / "wh.json"):  # só o texto importa: não guarda vídeo
            f.unlink(missing_ok=True)
        if not segs:
            raise RuntimeError("não achei fala nesse vídeo")
        e.update(status="pronto", fase="")
    except Exception as ex:
        e.update(status="erro", fase="", erro=str(getattr(ex, "stderr", "") or ex)[-500:])
    salvar(p, e)


if __name__ == "__main__":
    rodar(sys.argv[1])
