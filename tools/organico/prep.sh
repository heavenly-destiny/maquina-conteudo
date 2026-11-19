#!/bin/bash
# Prepara um corte: trecho SDR 1080p do bruto, audio, palavras com tempo absoluto e falas por ilha (pra achar tomada repetida).
# uso: prep.sh BRUTO.MOV INICIO_s FIM_s PASTA
set -e
SRC="$1"; A="$2"; B="$3"; D="$4"; mkdir -p "$D"; cd "$D"
DUR=$(python3 -c "print($B-$A)")
[ -f sdr.mov ] || avconvert -s "$SRC" -p Preset1920x1080 --start "$A" --duration "$DUR" -o sdr.mov --replace >/dev/null
ffmpeg -y -v error -i sdr.mov -vn -ac 1 -ar 16000 src.wav
whisper-cli -m ~/.cache/whisper/ggml-large-v3-turbo.bin -l pt -t 8 -nfa -dtw large.v3.turbo -ojf -f src.wav -of wh >/dev/null 2>&1
python3 ~/Movies/maquina-conteudo/tools/dtw_words.py wh.json "$A" words_src.json > /dev/null
python3 "$(dirname "$0")/islands.py" src.wav "$A" > ilhas.txt
echo "ok $D"; cat ilhas.txt
