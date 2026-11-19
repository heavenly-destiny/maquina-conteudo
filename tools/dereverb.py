"""Tira eco/ruido da voz gravada sem microfone. uso: dereverb.py in.wav out_prefix
Gera out_prefix_df.wav (DeepFilterNet3) e out_prefix_vf.wav (VoiceFixer modo 0, remove reverb)."""
import sys, subprocess, os, tempfile
inp, pre = sys.argv[1], sys.argv[2]
from df.enhance import enhance, init_df, load_audio, save_audio
m, st, _ = init_df()
a, _ = load_audio(inp, sr=st.sr())
save_audio(pre + "_df.wav", enhance(m, st, a, atten_lim_db=None), st.sr())
from voicefixer import VoiceFixer
VoiceFixer().restore(input=inp, output=pre + "_vf.wav", cuda=False, mode=0)
print("ok")
