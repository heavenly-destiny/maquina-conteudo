#!/bin/zsh
# Mixa a abertura: riser (sfx_a) + boom (sfx_b) + voz em 2.2s, com leve tratamento digital de assistente.
# uso: zsh mixar.sh <voz.mp3> <saida.mp3>
ffmpeg -v error -y -i ${0:h}/sfx_a.mp3 -i ${0:h}/sfx_b.mp3 -i "$1" -filter_complex "\
[0:a]atrim=0:1.6,afade=t=in:d=1.2,afade=t=out:st=1.2:d=0.4,volume=0.30[r];\
[1:a]adelay=1000|1000,volume=0.5,afade=t=out:st=3.0:d=2.5[b];\
[2:a]highpass=f=90,aecho=0.85:0.5:14|28:0.18|0.10,equalizer=f=3500:t=q:w=1:g=2,adelay=2200|2200,volume=1.3[v];\
[r][b][v]amix=inputs=3:normalize=0:duration=longest,atrim=0:6.6,afade=t=out:st=6.0:d=0.6,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 44100 -b:a 192k "$2"
