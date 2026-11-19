#!/bin/zsh
f=$1; d=${f:h:h}; id=${f:t:r}; mkdir -p $d/transcricoes; o=$d/transcricoes/$id
[ -f $o.txt ] && exit 0
T=$(mktemp -d); ffmpeg -v error -y -i $f -ar 16000 -ac 1 $T/a.wav
whisper-cli -m ~/.cache/whisper/ggml-large-v3-turbo.bin -l auto -t 4 -nt -otxt -of $o -f $T/a.wav >/dev/null 2>&1; rm -rf $T
