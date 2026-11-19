#!/bin/zsh
f=$1; d=${f:h:h}; id=${f:t:r}; mkdir -p $d/sheets $d/thumbs
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
ffmpeg -v error -y -ss 1 -i $f -frames:v 1 -vf scale=360:-2 $d/thumbs/$id.jpg
fps=$(python3 -c "print(12/max(float('$dur'),1))")
ffmpeg -v error -y -i $f -vf "fps=$fps,scale=-2:300,tile=6x2:padding=4" -frames:v 1 $d/sheets/$id.jpg
