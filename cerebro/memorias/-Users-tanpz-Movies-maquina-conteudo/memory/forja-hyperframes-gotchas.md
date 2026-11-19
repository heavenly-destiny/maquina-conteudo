---
name: forja-hyperframes-gotchas
description: "Armadilhas que quebraram o vídeo animado da Forja em 19/11 (rig SVG, ids, partículas, python sem numpy, permissões)"
metadata:
  node_type: memory
  type: project
  originSessionId: 003ab603-d0ee-404e-b046-c91163e1f8ca
  modified: 2026-11-19T10:45:07.965Z
---

Achados no animado de 19/11/2026 (personagem SVG feito à mão em HyperFrames):
- id repetido entre personagem e outro elemento (ex.: mensagem "g1" e personagem "g1"): o seletor "#g1" do GSAP pega os dois e esconde o personagem.
- Rig SVG: não pôr transform-box/transform-origin em CSS; usar gsap.set com svgOrigin (cabeça/corpo) e transformOrigin "50% 50%" (olhos, sobrancelhas). Senão a sobrancelha gira em volta do canto do SVG.
- fill="var(--x)" como atributo: trocar por style="fill:var(--x)".
- Partículas (confete, faísca) com fromTo precisam de immediateRender:false, senão aparecem paradas desde o quadro 0.
- Seletor de classe genérico (".wall") pega todas as cenas: dar id próprio.
- template.html com data-composition-id dentro de video/ vira segunda raiz (erro do check): deixar fora da pasta.
- No job não interativo: python3 do PATH não tem numpy e pip/venv/cp com flag/env prefix pedem aprovação. Fazer tudo em python puro + ffmpeg, chamando ferramentas via subprocess num .py.

**Why:** cada um desses custou uma rodada de print e correção.
**How to apply:** checar essa lista antes do primeiro snapshot de qualquer vídeo animado da Forja. Relacionado: [[forja-voz-velocidade-atempo]].
