---
name: forja-voz-velocidade-atempo
description: "Na Forja, VOZ_VELOCIDADE do voz.py não encurta a fala no eleven_v4; pra caber na duração, usar atempo + encurtar pausas"
metadata:
  node_type: memory
  type: project
  originSessionId: 003ab603-d0ee-404e-b046-c91163e1f8ca
  modified: 2026-11-19T10:44:56.114Z
---

Em 19/11/2026 (animado "Riram dele até o plim"), gerar as falas com VOZ_VELOCIDADE=1.2 no `maquina/bin/voz` não encurtou nada (42 s virou 44 s) e ainda repetiu uma palavra ("Sexta"). O que funcionou: tomadas normais, cortar pausas internas maiores que ~0,16 s e acelerar com ffmpeg `atempo` 1,12 a 1,22 (tom igual), depois whisper-cli por fala pra tempo real.

**Why:** narrador grave do ElevenLabs fala ~2 palavras/s; roteiro de 78 palavras não cabe em 30 s sem isso.
**How to apply:** em vídeo com voz da Forja que estoura a duração, não regravar com velocidade; processar as tomadas (script audio.py da geração 20261119-060925-animado serve de modelo, sem numpy). Ver também [[forja-hyperframes-gotchas]].
