#!/bin/zsh
fmt=${1%% *}; id=${1#* }
D=~/Movies/maquina-conteudo/estilos/formatos/$fmt; mkdir -p $D/videos $D/thumbs
[ -f "$D/videos/$id.mp4" ] && [ "$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 $D/videos/$id.mp4)" -ge 1000 ] && exit 0; rm -f $D/videos/$id.mp4
yt-dlp --no-update -q --no-warnings -f "bv*[vcodec^=avc1][height<=1280][width<=1280]+ba[ext=m4a]/b[vcodec^=avc1]/bv*[height<=1080]+ba/b" --merge-output-format mp4 --write-info-json -o "$D/videos/$id.%(ext)s" "https://www.youtube.com/shorts/$id" || echo "FALHOU $id"
