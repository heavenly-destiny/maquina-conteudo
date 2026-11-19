---
name: maquina-voz-e-recorte
description: Antônio voice_id on ElevenLabs and how to cut out photos/video locally in Máquina de Conteúdo jobs
metadata:
  node_type: memory
  type: reference
  originSessionId: b54b9ea2-c2b5-4482-8749-adc80bc5f059
  modified: 2026-11-18T18:18:57.637Z
---

- Antônio (pt-BR, "Deep, Warm, Calm Storyteller") = ElevenLabs voice_id `oQtRiHTYSl1XeCm4tuUw`. Used for tanpz's own profile videos (first person). Call: `voz "[tag] texto" fala-01.mp3 oQtRiHTYSl1XeCm4tuUw`. VOZ_PADRAO in maquina/.env is still empty (falls back to James Deep Narrator pt). No clone of tanpz's own voice exists in the account (checked 18/11/2026).
- Background removal that works in non-interactive jobs: `node ~/.claude/skills/hyperframes/scripts/plugin-cli.mjs remove-background in.(jpg|mp4) -o out.(png|webm)`. Person-only model: fails on objects (monitor, props), so draw those in CSS. swift/swiftc and pip installs are blocked in jobs; PIL is not installed (use ffmpeg for contact sheets).
- tools/assets/sfx/whoosh.mp3 is 12 s with several whooshes and tick.mp3 is a sequence of key clicks: trim a window before using (see [[maquina-de-conteudo]] job 20261118-144527-modelar mix.py).
