#!/bin/zsh
# uso: salvar.sh <nome> <url ou arquivo>  -> corta a sobra transparente e salva ../<nome>.png
B=${0:A:h}; T=$B/raw_$1.png
[[ $2 == http* ]] && curl -sL -o $T "$2" || cp "$2" $T
C=$(ffmpeg -v info -i $T -vf "alphaextract,bbox=min_val=20" -f null - 2>&1 | grep -o 'crop=[0-9:]*' | tail -1)
ffmpeg -v error -y -i $T -vf "$C,pad=iw+80:ih+80:40:40:color=0x00000000" -pix_fmt rgba $B/../$1.png && rm -f $T
