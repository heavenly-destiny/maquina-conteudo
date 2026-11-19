#!/usr/bin/env python3
"""inspirar.py <id>: baixa um vídeo viral, transcreve, tira frames e gera a decupagem em RAIZ/inspiracoes/<id>/."""
import glob, json, re, subprocess, sys, time
from pathlib import Path
import maquina as m

INS = m.RAIZ / "inspiracoes"
MODOS_TXT = {
    "rapida": "MODE: RÁPIDA. Sheets are 1 frame per second. Read every sheet and the transcript; you may group short shots into one beat (5 to 12 beats), still covering 0 to the end.",
    "completa": "MODE: COMPLETA. One beat per shot, every sheet read.",
    "fiel": ("MODE: FIEL (100%, used to clone). Sheets are up to 10 frames per second. Also read `som.txt` (voice and background separated, every sound "
             "effect with its time and kind, every music rise or drop) and `movimento.txt` (motion every 0.1 s; stretches with motion and no cut are "
             "animations). One beat per shot AND inside each beat list every animation: what moves, from where to where, how (slide, scale, fade, "
             "blur, mask, typewriter, bounce), easing feel, start and end time. Put every sound effect in the beat where it happens with its time. "
             "Add to decupagem.json: \"animacoes\": [{\"t\": \"\", \"elemento\": \"\", \"movimento\": \"\", \"duracao\": \"\"}] and "
             "\"efeitos_sonoros\": [{\"t\": \"\", \"som\": \"\"}], \"musica\": \"mood, BPM feel, where it enters, drops and ends\"."),
}


def salvar(p, e):
    tmp = p / "estado.tmp"
    tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
    tmp.replace(p / "estado.json")


def fase(p, e, f):
    e["fase"] = f
    salvar(p, e)


def analisar_inteiro(p, v, modo="completa"):
    """o vídeo inteiro, sem pular nada (tanpz 19/11): todo corte com o tempo exato, quadros a cada 0,25-1 s em folhas
    numeradas, um quadro logo depois de cada corte e a curva de volume a cada 0,5 s (pra achar drop, hit e silêncio)."""
    import shutil
    d = m.dur(v)
    for x in ("frames", "folhas", "cortes"):
        shutil.rmtree(p / x, ignore_errors=True)
        (p / x).mkdir()
    # 1. cortes exatos
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(v), "-vf", "scdet=threshold=8,metadata=print:file=-", "-an", "-f", "null", "-"],
                       capture_output=True, text=True)
    cortes = [round(float(x), 2) for x in re.findall(r"lavfi\.scd\.time=([\d.]+)", r.stdout)]
    (p / "cortes.txt").write_text(f"duracao {d:.2f}s, {len(cortes)} cortes\n" + "\n".join(f"{t:.2f}s" for t in cortes) + "\n")
    for k, t in enumerate(cortes[:80], 1):  # o primeiro quadro de cada plano novo
        m.sh(["ffmpeg", "-y", "-v", "error", "-ss", f"{min(t + 0.06, d - 0.05):.2f}", "-i", str(v), "-frames:v", "1", "-vf", "scale=480:-2",
              "-q:v", "4", str(p / "cortes" / f"c{k:02d}_{t:06.2f}s.jpg")])
    # 2. quadros do vídeo inteiro: 4 por segundo em vídeo curto, até ~300 quadros no total
    # rápida: 1 quadro/s (até 60); completa: até 4/s (até 300); fiel: até 10/s (até 900), pega animação de motion quadro a quadro
    teto, maxq = {"rapida": (1.0, 60), "fiel": (10.0, 900)}.get(modo, (4.0, 300))
    fps = max(0.2, min(teto, maxq / max(d, 1)))
    m.sh(["ffmpeg", "-y", "-v", "error", "-i", str(v), "-vf", f"fps={fps:.3f},scale=320:-2", "-q:v", "5", str(p / "frames/f%04d.jpg")])
    fr = sorted((p / "frames").glob("f*.jpg"))
    por = 12  # 4x3 por folha
    linhas = [f"{fps:.2f} quadros por segundo; cada folha tem {por} quadros (4 colunas x 3 linhas), lidos da esquerda pra direita, de cima pra baixo"]
    for k in range(0, len(fr), por):
        n = k // por + 1
        m.sh(["ffmpeg", "-y", "-v", "error", "-start_number", str(k + 1), "-i", str(p / "frames/f%04d.jpg"), "-frames:v", "1",
              "-vf", f"tile=4x3:padding=6:color=white", "-q:v", "4", str(p / "folhas" / f"folha{n:02d}.jpg")])
        linhas.append(f"folha{n:02d}.jpg: {k / fps:.2f}s a {min(len(fr), k + por) / fps:.2f}s")
    (p / "folhas" / "indice.txt").write_text("\n".join(linhas) + "\n")
    shutil.copy(p / "folhas" / "folha01.jpg", p / "sheet.jpg") if (p / "folhas" / "folha01.jpg").exists() else None
    # 3. volume a cada 0,5 s
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", str(v), "-vn", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    vol, ult = [], -1.0
    for t, mm in re.findall(r"t:\s*([\d.]+).*?M:\s*(-?[\d.]+|-inf)", r.stderr):
        if float(t) - ult >= 0.5:
            vol.append(f"{float(t):6.1f}s {mm} LUFS"); ult = float(t)
    (p / "volume.txt").write_text("\n".join(vol) + "\n")
    if modo == "fiel":  # voz x música separadas, cada efeito sonoro e cada trecho animado (tudo local)
        subprocess.run([str(m.RAIZ / "tools/.venv-voz/bin/python"), str(m.RAIZ / "tools/decupar_fiel.py"), str(p), str(v)], check=True,
                       capture_output=True, text=True, timeout=1800)
        shutil.rmtree(p / "sep", ignore_errors=True)


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
        m.sh(["whisper-cli", "-m", str(m.WHISPER), "-l", "auto", "-t", "8", "-ml", "42", "-sow", "-oj", "-f", str(p / "audio.wav"), "-of", str(p / "wh")])
        segs = json.loads((p / "wh.json").read_text())["transcription"]
        (p / "transcricao.txt").write_text("\n".join(
            f"[{s['offsets']['from'] / 1000:7.2f}-{s['offsets']['to'] / 1000:7.2f}] {s['text'].strip()}" for s in segs))

        modo = ped.get("modo") or "completa"
        analisar_inteiro(p, v, modo)

        fase(p, e, "analisando")
        m.claude(m.prompt("decupar", pasta=p, modo=MODOS_TXT[modo]), p, m.MODELO_PLANO if modo == "fiel" else m.MODELO_CORTE, "log.txt")
        json.loads((p / "decupagem.json").read_text())  # valida
        e.update(status="pronto", fase="")
    except Exception as ex:
        e.update(status="erro", fase="", erro=str(getattr(ex, "stderr", "") or ex)[-500:])
    salvar(p, e)
    m.avisar(f"Inspiração {e['status']}")


if __name__ == "__main__":
    rodar(sys.argv[1])
