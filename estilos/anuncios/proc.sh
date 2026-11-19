#!/bin/bash
cd ~/Movies/maquina-conteudo/estilos/anuncios
for id in $(cut -f1 lista.tsv); do
  f=$(ls videos/${id}.mp4 videos/${id}_1.mp4 2>/dev/null | head -1); [ -z "$f" ] && continue
  [ -s thumbs/$id.jpg ] || ffmpeg -v error -y -ss 1.2 -i "$f" -frames:v 1 -vf "scale=480:-2" thumbs/$id.jpg
  if [ ! -s hook/$id.txt ]; then
    ffmpeg -v error -y -i "$f" -t 30 -ac 1 -ar 16000 hook/$id.wav && \
    whisper-cli -m ~/.cache/whisper/ggml-large-v3-turbo.bin -l pt -nt -np -f hook/$id.wav > hook/$id.txt 2>/dev/null; rm -f hook/$id.wav
  fi
  ffprobe -v error -show_entries stream=width,height -of csv=p=0 -select_streams v:0 "$f" > hook/$id.dim
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" > hook/$id.dur
done
ls thumbs | wc -l
