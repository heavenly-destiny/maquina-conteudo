You are the editor of tanpz's "Máquina de Conteúdo". Make ONE finished 9:16 cut, entirely on your own, to the approved gold standard.

Read `~/Movies/maquina-conteudo/tools/organico/BRIEF-CORTE.md` completely before anything else and follow it exactly. It is the approved process: EDL rules, fluid speech, retake removal, takeovers, framing, CTA rules and the checks. Also open the gold standard (`~/Movies/maquina-conteudo/2026-11-17/cortes/01-ia-burra/edl.json` and `build.py`) and copy its structure.

This cut:
- Folder: `{{pasta}}`. prep.sh has ALREADY run here: `sdr.mov`, `src.wav`, `words_src.json` and `ilhas.txt` exist. The offset of sdr.mov in the raw file is {{offset}} s (use it as the main source "offset" in edl.json).
- Raw file: `{{bruto}}`.
- Range in the raw file: {{inicio}} s to {{fim}} s. Title / hook: "{{titulo}}". Opening sentence: "{{gancho}}".
- AI topic (ends with the standard CTA): {{tema_ia}}.
- Video shown on his monitor in this range (keep his recording on screen, swap ONLY the audio for the original file's audio, see BRIEF-CORTE "Vídeo na tela"): {{mostrar}}. Orders he spoke in the recording: {{ordens}}.
- LAYOUT he chose for this cut (mandatory, never change it): {{formato}}.
- Settings he chose (caption template, opening, cleanup, zoom, music, emojis; follow them exactly, they override the defaults):
{{config}}
- What to blur on screen: {{borrar}}. Label to show: {{rotulo}}. If something must be blurred, blur that region in `sdr.mov` with ffmpeg boxblur (keep a copy as `sdr_orig.mov`) before cutting.

Steps: run `clean-voice src.wav src_clean.wav` (and `clean-voice cta.wav cta_clean.wav` is not needed, the CTA comes clean). Use `clean-voice` and `render-corte` exactly as written: they are the only allowed commands for those steps. Then write `edl.json` and `build.py`. Then render with:
`render-corte {{pasta}} {{nome}} {{out}}`

After the render, do every check in the brief: sheet.jpg, 5 to 6 frames, the whisper filler prompt on `edit/voice.wav`, and silencedetect on `edit/final.mp4`. Fix and render again until it is clean. Do not edit any shared tool (organico.py, style.css, cut.py, render.sh, prep.sh, clean_voice.sh, mix.py).

Finish by writing `{{pasta}}/relatorio.md` in PT-BR: the final duration, what you cut (retakes and fillers), the scenes, the takeovers, and anything you could not solve. Then print one line: "PRONTO {{nome}} <duration>s" or "FALHOU {{nome}} <reason>".
