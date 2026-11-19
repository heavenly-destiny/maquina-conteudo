#!/bin/bash
# Do EDL ao mp4 final. Pasta do corte precisa de: edl.json, build.py (usa organico.py), sdr.mov, src.wav, words_src.json.
# uso: render.sh PASTA NOME_FINAL   (ex.: render.sh .../cortes/01-ia-burra 01-ia-burra)
set -e
source "$(dirname "$0")/../_env.sh"
D="$(cd "$1" && pwd)"; N="$2"; PY="$VPY"
cd "$D"
"$PY3" "$T/cut.py" edl.json edit | tail -1
cp edit/voice.wav edit/voice_raw.wav && "$T/clean_voice.sh" edit/voice_raw.wav edit/voice.wav >/dev/null 2>&1
a=$(ffprobe -v error -show_entries format=duration -of csv=p=0 edit/video.mp4); b=$(ffprobe -v error -show_entries format=duration -of csv=p=0 edit/voice.wav)
"$PY3" -c "import sys; d=abs($a-$b); print('sync ok' if d<0.04 else 'DESSINCRONIZADO %.3f'%d); sys.exit(d>=0.04)"
rm -f edit/public/video.mp4
"$PY" build.py
cp "$T/assets/fonts/InstrumentSerif-Italic.ttf" edit/public/assets/fonts/
# trilha: o editor da Forja pode escolher um estilo (ajustes.json "trilha"); sem escolha sai sem trilha (ele põe o áudio no Instagram)
TRILHA=$("$PY3" -c "import json,os;a=json.load(open('ajustes.json')) if os.path.exists('ajustes.json') else {};t=a.get('trilha') or '';f='$T/assets/music/estilo-'+t+'.mp3';print(f+' -16' if t and t!='nenhuma' and os.path.exists(f) else '$T/assets/music/bed-tech-01.mp3 -120')")
cd edit && "$PY" "$T/mix.py" . ${TRILHA% *} 0 ${TRILHA##* } | tail -1
# nivel Simples (maquina grava nivel.txt): painel parado + legenda, sai em segundos sem HyperFrames; se falhar, cai no render normal
if [ "$(cat ../nivel.txt 2>/dev/null)" = simples ] && "$PY" "$T/organico/simples.py" . output.mp4; then :
else PRODUCER_BROWSER_GPU_MODE=hardware npx hyperframes render public -o output.mp4 2>&1 | tail -1; fi
ffmpeg -y -v error -i output.mp4 -i public/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4
D2=$(ffprobe -v error -show_entries format=duration -of csv=p=0 final.mp4)
ffmpeg -y -v error -i final.mp4 -vf "fps=24/$D2,scale=240:-2,tile=12x2" -frames:v 1 ../sheet.jpg
OUT=${OUT:-$RAIZ/prontos}; mkdir -p "$OUT" && cp final.mp4 "$OUT/$N.mp4"
echo "pronto $N ($D2 s)"
