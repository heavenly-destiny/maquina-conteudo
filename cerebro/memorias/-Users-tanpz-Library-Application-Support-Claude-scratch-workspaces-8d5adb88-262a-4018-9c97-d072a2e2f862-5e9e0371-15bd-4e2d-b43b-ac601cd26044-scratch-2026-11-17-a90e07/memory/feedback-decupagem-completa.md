---
name: feedback-decupagem-completa
description: Forja decupagem must cover 100% of the video: every cut, frames of the whole video, one beat per shot
metadata:
  type: feedback
---
"A decupagem precisa ser completa, pega 100% do vídeo sem deixar passar nada" (tanpz, 19/11/2026).

**Why:** the old decupagem looked at 12 scene frames only. It missed the opening shot of the Big Mac reference (him biting the burger).

**How to apply:** inspirar.py analisar_inteiro writes cortes.txt (ffmpeg scdet), cortes/ (first frame of each shot), folhas/ (whole video at up to 4 fps, 4x3 sheets, indice.txt) and volume.txt (LUFS every 0.5 s). prompts/decupar.md makes the agent read every sheet and write one beat per shot with texto_tela and som, with no gaps. A 29 s video took about 3 min. Clonar and Modelar inherit this. See [[maquina-v2-produto]].

Update the same day: he wants 3 modes and free tools only for now (no Gemini). Rápida: 1 fps, about 2 min. Completa: 4 fps, every cut, about 3 min. Fiel 100%: 10 fps, with tools/decupar_fiel.py run in tools/.venv-voz (Demucs voice/background split, every SFX with time and kind, music rises and drops, motion every 0.1 s). The agent then lists every animation and SFX, opus, about 5 min. The mode is picked in Inspirar (localStorage modo-dec). A Clonar upload always uses Fiel.
