"""decupar_fiel.py <pasta> <video>: a parte do modo Fiel que o olho e a transcrição não pegam. Tudo local e grátis.
som.txt: separa voz e fundo (Demucs) e marca cada efeito sonoro (tempo, duração, grave/agudo, batida ou subida)
         e cada entrada, saída ou drop da música.
movimento.txt: quanto a imagem se mexe a cada 0,1 s; trechos com movimento sem corte = animação de motion, zoom ou câmera.
roda no .venv-voz (torch, numpy, soundfile)."""
import subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

pasta, video = Path(sys.argv[1]), Path(sys.argv[2])
venv_py = sys.executable


def sh(*c):
    subprocess.run(c, check=True, capture_output=True)


# ---------- som ----------
sep = pasta / "sep"
sh("ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "2", "-ar", "44100", str(pasta / "audio44.wav"))
sh(venv_py, "-m", "demucs", "--two-stems=vocals", "-n", "htdemucs", "-o", str(sep), str(pasta / "audio44.wav"))
stem = sep / "htdemucs" / "audio44"
fundo, sr = sf.read(stem / "no_vocals.wav")
voz, _ = sf.read(stem / "vocals.wav")
fundo, voz = fundo.mean(1), voz.mean(1)
hop = int(sr * 0.01)  # janelas de 10 ms
n = len(fundo) // hop


def rms(x):
    return np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)


db = lambda r: 20 * np.log10(r + 1e-9)
f_db, v_db = db(rms(fundo)), db(rms(voz))
# espectro em quadros de 2048 pra fluxo (onde nasce um som) e brilho (grave x agudo)
win = 2048
quad = [fundo[i * hop: i * hop + win] for i in range(n) if i * hop + win <= len(fundo)]
S = np.abs(np.fft.rfft(np.array(quad) * np.hanning(win), axis=1))
freqs = np.fft.rfftfreq(win, 1 / sr)
fluxo = np.r_[0, np.maximum(np.diff(S, axis=0), 0).sum(1)]
centro = (S * freqs).sum(1) / (S.sum(1) + 1e-9)
lim = np.median(fluxo) + 3 * np.std(fluxo)
efeitos, ult = [], -1
for i in range(1, len(fluxo) - 1):
    if fluxo[i] > lim and fluxo[i] >= fluxo[i - 1] and fluxo[i] >= fluxo[i + 1] and i - ult > 12 and f_db[i] > -45:
        base = f_db[i]
        fim = i
        while fim < len(f_db) - 1 and f_db[fim] > base - 12 and fim - i < 300:
            fim += 1
        ini = max(0, i - 40)
        subida = f_db[i] - f_db[ini] > 10 and np.all(np.diff(f_db[ini:i + 1]) > -3)  # cresce antes do pico = whoosh/riser
        c = centro[i]
        tipo = "subida (whoosh/riser)" if subida and i - ini > 15 else "batida grave (hit/boom/braam)" if c < 400 else \
            "pop/clique agudo" if c > 3500 and fim - i < 25 else "impacto médio (pop/swoosh/notificação)"
        efeitos.append(f"{i / 100:6.2f}s  dura {(fim - i) / 100:.2f}s  {tipo}  brilho {c:.0f} Hz  {f_db[i]:.0f} dB")
        ult = i
# música: nível do fundo a cada 0,5 s e mudanças fortes
blocos = [f_db[k:k + 50].mean() for k in range(0, n, 50)]
mus, ant = [], None
for k, b in enumerate(blocos):
    t = k * 0.5
    estado = "silêncio" if b < -50 else "baixo" if b < -32 else "música/fundo presente"
    if ant is not None and abs(b - ant) > 8:
        mus.append(f"{t:6.1f}s  {'SOBE' if b > ant else 'CAI (drop/corte da música)'} {ant:.0f} -> {b:.0f} dB")
    ant = b
linhas = ["# SOM (separado: voz x fundo). Fundo = música + efeitos.",
          f"voz presente em {np.mean(v_db > -40) * 100:.0f}% do vídeo; fundo presente em {np.mean(f_db > -45) * 100:.0f}%",
          "", f"## efeitos sonoros detectados no fundo ({len(efeitos)})", *efeitos,
          "", "## música: mudanças fortes de nível", *(mus or ["sem mudança forte"]),
          "", "## nível do fundo a cada 0,5 s (dB)", " ".join(f"{k * 0.5:.1f}:{b:.0f}" for k, b in enumerate(blocos))]
(pasta / "som.txt").write_text("\n".join(linhas) + "\n")
for f in (pasta / "audio44.wav",):
    f.unlink(missing_ok=True)

# ---------- movimento ----------
W, H = 96, 170
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps=10,scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
mov = np.r_[0, np.abs(np.diff(fr, axis=0)).mean((1, 2))]
cortes = [float(l.rstrip("s")) for l in (pasta / "cortes.txt").read_text().splitlines()[1:] if l.strip()]
eh_corte = lambda t: any(abs(t - c) < 0.15 for c in cortes)
lim_m = max(3.0, np.median(mov) * 2)
trechos, ini = [], None
for i, v in enumerate(mov):
    t = i / 10
    ativo = v > lim_m and not eh_corte(t)
    if ativo and ini is None:
        ini = i
    if (not ativo or i == len(mov) - 1) and ini is not None:
        if i - ini >= 2:
            trechos.append(f"{ini / 10:6.1f}s a {i / 10:5.1f}s  movimento {mov[ini:i].mean():.1f}  (sem corte: animação, zoom, câmera ou texto entrando)")
        ini = None
(pasta / "movimento.txt").write_text("\n".join(
    ["# MOVIMENTO a cada 0,1 s (diferença entre quadros; corte excluído)", f"## trechos animados ({len(trechos)})", *trechos,
     "", "## curva (t:movimento)", " ".join(f"{i / 10:.1f}:{v:.0f}" for i, v in enumerate(mov))]) + "\n")
print("ok", len(efeitos), "efeitos", len(trechos), "trechos animados")
