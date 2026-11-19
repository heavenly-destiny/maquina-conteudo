#!/bin/bash
# Limpa voz gravada sem microfone. Pop filter (estalo de P/B, clique de boca) sempre ligado: highpass 90 + dynamic EQ low-shelf + adeclick (tanpz 18/11). 1) DeepFilterNet3 (local, MIT/Apache) tira eco e ruido. 2) EQ de presenca, compressao, loudnorm.
# uso: clean_voice.sh in.wav out.wav
set -e
source "$(dirname "$0")/_env.sh"
T=$(mktemp -d)
"$VPY" -c "
from df.enhance import enhance, init_df, load_audio, save_audio
m,st,_=init_df(); a,_=load_audio('$1',sr=st.sr()); save_audio('$T/df.wav',enhance(m,st,a),st.sr())" 2>/dev/null
ffmpeg -y -v error -i "$T/df.wav" -af "highpass=f=90:p=2,adynamicequalizer=dfrequency=100:dqfactor=0.7:tfrequency=110:tqfactor=0.7:tftype=lowshelf:mode=cutabove:threshold=0.03:ratio=6:range=15:attack=1:release=60,adeclick,equalizer=f=220:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=3,equalizer=f=9000:t=h:w=1:g=1.5,acompressor=threshold=0.1:ratio=3:attack=8:release=150:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9" -ar 48000 -ac 1 "$2"
rm -rf "$T"
