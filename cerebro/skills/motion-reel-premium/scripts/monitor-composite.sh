#!/usr/bin/env bash
# Maps a 16:9 master video onto a monitor screen inside a portrait photo plate,
# adds a soft screen glow and a slow handheld drift, outputs 1080x1920 H.264 + AAC.
# Usage: bash monitor-composite.sh master.mp4 plate.jpg out.mp4 "x0:y0:x1:y1:x2:y2:x3:y3"
#   corners = screen corners IN PLATE PIXELS, order: top-left, top-right, bottom-left, bottom-right.
set -euo pipefail
MASTER="$1"; PLATE="$2"; OUT="$3"; Q="$4"
IFS=: read -r X0 Y0 X1 Y1 X2 Y2 X3 Y3 <<<"$Q"
read -r PW PH < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$PLATE" | tr x ' ')
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MASTER")
P="x0=$X0:y0=$Y0:x1=$X1:y1=$Y1:x2=$X2:y2=$Y2:x3=$X3:y3=$Y3:sense=destination:interpolation=cubic"
# Oversize by 6% so the drift crop never shows edges.
OW=1146; OH=2038

ffmpeg -y -v error -loop 1 -t "$DUR" -i "$PLATE" -i "$MASTER" -filter_complex "
[1:v]scale=${PW}:${PH},setsar=1,format=rgba,split[m][w];
[m]perspective=${P}[warp];
[w]drawbox=c=white:t=fill,drawbox=c=black:t=6,perspective=${P},format=gray,gblur=sigma=1[mask];
[warp][mask]alphamerge[screen];
[screen]split[s1][s2];
[s2]gblur=sigma=40,colorchannelmixer=aa=0.35[glow];
[0:v]scale=${PW}:${PH},setsar=1,format=rgba[bg];
[bg][glow]overlay=0:0[bgg];
[bgg][s1]overlay=0:0,format=yuv420p,
scale=${OW}:${OH}:force_original_aspect_ratio=increase,crop=${OW}:${OH},
crop=1080:1920:x='(iw-1080)/2+18*sin(t*0.9)+9*sin(t*2.3)':y='(ih-1920)/2+14*sin(t*0.7+1)+7*sin(t*1.9)',
setsar=1[v]" \
  -map "[v]" -map 1:a? -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo "ok: $OUT"
