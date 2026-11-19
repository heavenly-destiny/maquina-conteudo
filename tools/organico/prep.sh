#!/bin/bash
# Prepara um corte: trecho SDR 1080p do bruto, audio, palavras com tempo absoluto e falas por ilha (pra achar tomada repetida).
# uso: prep.sh BRUTO.MOV INICIO_s FIM_s PASTA
set -e
source "$(dirname "$0")/../_env.sh"
SRC="$1"; A="$2"; B="$3"; D="$4"; mkdir -p "$D"; cd "$D"
DUR=$("$PY3" -c "print($B-$A)")
if [ ! -f sdr.mov ]; then
  if command -v avconvert >/dev/null; then avconvert -s "$SRC" -p Preset1920x1080 --start "$A" --duration "$DUR" -o sdr.mov --replace >/dev/null
  else ffmpeg -y -v error -ss "$A" -t "$DUR" -i "$SRC" -vf "scale=-2:1080:flags=lanczos,format=yuv420p" -c:v libx264 -crf 14 -preset fast -c:a aac -b:a 192k sdr.mov; fi  # Windows: sem avconvert
fi
ffmpeg -y -v error -i sdr.mov -vn -ac 1 -ar 16000 src.wav
whisper-cli -m "$WHISPER_MODEL" -l pt -t 8 -nfa -dtw large.v3.turbo -ojf -f src.wav -of wh >/dev/null 2>&1
"$PY3" "$T/dtw_words.py" wh.json "$A" words_src.json > /dev/null
"$PY3" "$(dirname "$0")/islands.py" src.wav "$A" > ilhas.txt
echo "ok $D"; cat ilhas.txt
