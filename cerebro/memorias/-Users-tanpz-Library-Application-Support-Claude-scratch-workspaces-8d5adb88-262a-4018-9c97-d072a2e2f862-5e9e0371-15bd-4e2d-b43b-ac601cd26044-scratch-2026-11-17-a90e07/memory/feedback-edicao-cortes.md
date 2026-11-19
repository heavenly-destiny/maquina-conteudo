---
name: feedback-edicao-cortes
description: "How the user wants short-form cuts edited — split-screen with horizontal footage, single-color captions, complete sentences, music+SFX, use motion-reel-premium skill"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-17T21:22:56.862Z
---

First pilot (2026-11-17) was rejected hard ("ridículo"). Rules for cuts going forward:
- Horizontal source stays horizontal: never crop to vertical. Output is 9:16 split-screen: horizontal video full width in one half, motion graphics / B-roll in the other half.
- Captions: ONE color, good font chosen from real references. No multi-color word highlighting.
- Cuts must keep complete thoughts: never jump mid-sentence or splice fragments that make no sense.
- Use the user's own motion skill (motion-reel-premium) and its full toolkit; generic overlay cards are not acceptable.
- Add background music and sound effects; raw voice alone sounded bad.
- Look at references before designing; don't deliver something at the pilot-1 level at all.

**Why:** user publishes these to grow before mentoria launch; quality bar is premium short-form.
**How to apply:** check every cut against these rules before rendering; see [[maquina-de-conteudo]].
- The motion-reel-premium skill is a TECHNIQUE reference (3D, motion density, transitions, sound design, timing), not a look. Never copy the zupi cream/orange palette or zupi assets (orange "Z" coin is zupi brand). Each piece gets its own visual identity; for the user's AI/tech cuts derive it from his setup (dark room, violet/blue LED wall) unless he gives brand colors.

Rule from 2026-11-17: the split screen is exactly half and half, 960 px each. Crop the sides of the horizontal source with object-fit cover and set object-position so the face sits around 40% of the frame width. Never use a full-width strip with dead space under it.
**Why:** the user said the top half was much bigger than the video.

Pilot v3 approved on 2026-11-17 ("agora eu gostei").
- Palette: the red palette is his: dark wine background with a #e11d2a accent ("combina muito com o meu perfil").
- Split-screen captions: put them ON the dividing line (y≈960), centered, over a soft dark shadow.
- What v3 still lacked:
  - more motion in the panel, with things built from what he says;
  - better transitions;
  - click and UI sound effects.

Update 2026-11-17 (voice): the user records without a microphone, so the raw voice has room echo. Always clean the voice before mixing, using `tools/clean_voice.sh in.wav out.wav`. It runs DeepFilterNet3 (tools/.venv-voz, torch 2.1.2), then EQ, compressor and loudnorm -16. An ffmpeg-only chain was NOT enough: the user still heard heavy echo. VoiceFixer sounded worse. Keep the raw file as voice_raw.wav.

Update 2026-11-17 (v4 feedback): the caption on the split line must have NO box or band behind it, only a soft shadow on the letters. A box looked "ridículo". During full-screen takeovers the speech caption disappears and only the takeover's own text stays. All motion content must fit above the caption zone (stay under y≈830 of the 960 panel). Measure element bounds in the browser before rendering, so nothing gets cut at the seam.

Update 2026-11-17 (lip sync): the user saw the lips running late near the end. Cause: cut.py rounded each piece's video to whole frames while the audio stayed exact, so ~0.5s of drift built up over 29 pieces. cut.py now snaps every segment to the 30fps grid and sets -frames:v. Always check that video.mp4 and voice.wav durations match after cutting.
The user also wants more full-screen takeovers spread through the cut, about one every 5-8s on punchlines. Never put one over the frontal face part at the end.

Update 2026-11-17 (retakes): the user often starts a phrase, stops, and records it again; the last full take is the good one. Example: "Ninguém é tão bom." followed by "Ninguém é tão bonzinho assim." Whisper large-v3-turbo merges these and hides the repeat. Before any edit, split the raw audio on pauses (silencedetect), transcribe each speech island on its own, and remove false starts and repeated phrases, keeping only the last complete take.

Update 2026-11-17 (music): cuts for the user's own profile go out WITHOUT background music, because he adds it himself on Instagram, very low. Voice and SFX only; organico/render.sh mixes the bed at -120 dB.

- Fala fluida, sem pausa (tanpz 18/11): toda pausa de pensar, olhar pra baixo ou travar sai. Também saem as muletas ("basicamente", "enfim", "né?", "cara", perguntas retóricas enroladas como "você precisa fazer o que, cara?"). **Why:** "tem que sair fluido o vídeo… não ficar pausando". **How to apply:** cut.py detecta pausa na voz limpa (campo "silwav" na EDL = clean_voice.sh do src.wav), MAXGAP 0.18 / KEEP 0.08; EDL corta muletas; depois roda silencedetect -35dB d=0.25 na voz final e não pode sobrar pausa fora de junção.
- Tela cheia: subtítulo pequeno + palavra grande em uma linha (ex.: "ela já conhece" / TUDO / "sobre você"). Frase longa em .tk-it.big quebra em 3 linhas e encavala no subtítulo.
- Sem flash branco nos cortes do vídeo dele (ficou "esbranquiçado, feio", 18/11); removido do organico.py. Cor do vídeo com curva de realce (cut.py), sem gamma clareando.
- Número/dado aparece uma vez só: nunca cena + tela cheia com o mesmo número (95% duplicado "atropelou", 18/11).
- CTA termina em "muito melhores" (corta o resto da fala final), 18/11.
- 18/11: corte 01-ia-burra (64,3s) APROVADO ("Aprovado, bora") = padrão-ouro dos outros cortes. Brief: ~/Movies/maquina-conteudo/tools/organico/BRIEF-CORTE.md.
- CTA "manda pra sua IA" só em corte cujo tema é IA. Corte de oferta/funil/tráfego (15-17) termina na fala de fechamento dele, sem esse CTA ("não faz sentido nenhum", 18/11).
