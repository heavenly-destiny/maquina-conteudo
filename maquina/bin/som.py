#!/usr/bin/env python3
"""som sfx "descrição" saida.mp3 [segundos]     -> efeito sonoro ElevenLabs
   som musica "descrição com seções" saida.mp3 segundos -> trilha ElevenLabs Music
Chave em ELEVENLABS_API_KEY ou maquina/.env (mesma do voz)."""
import json, os, sys, urllib.request, urllib.error
from pathlib import Path

def env(k):
    if os.environ.get(k):
        return os.environ[k]
    f = Path(__file__).resolve().parent.parent / ".env"
    for l in (f.read_text().splitlines() if f.exists() else []):
        if l.startswith(k + "="):
            return l.split("=", 1)[1].strip().strip('"\'')
    return ""

if len(sys.argv) < 4 or sys.argv[1] not in ("sfx", "musica"):
    sys.exit(__doc__)
chave = env("ELEVENLABS_API_KEY")
if not chave:
    print("FALTA_CHAVE_ELEVENLABS", file=sys.stderr); sys.exit(3)
tipo, texto, saida = sys.argv[1:4]
seg = float(sys.argv[4]) if len(sys.argv) > 4 else None
if tipo == "sfx":
    url, corpo = "https://api.elevenlabs.io/v1/sound-generation", {"text": texto, **({"duration_seconds": seg} if seg else {})}
else:
    url, corpo = "https://api.elevenlabs.io/v1/music", {"prompt": texto, "music_length_ms": int((seg or 30) * 1000)}
req = urllib.request.Request(url + "?output_format=mp3_44100_128", data=json.dumps(corpo).encode(),
    headers={"xi-api-key": chave, "Content-Type": "application/json", "Accept": "audio/mpeg"})
try:
    with urllib.request.urlopen(req, timeout=300) as r:
        Path(saida).write_bytes(r.read())
except urllib.error.HTTPError as e:
    print(f"ElevenLabs HTTP {e.code}: {e.read()[:300].decode(errors='replace')}", file=sys.stderr); sys.exit(1)
