---
name: forja-cortes-niveis
description: Cuts get an edit level the user picks (simple caption+breath removal up to transitions/b-roll) with a time estimate, plus an integrated HyperFrames-like editor
metadata:
  type: project
---

On 19/11/2026 tanpz said cuts are usually simple, with no motion. Most are just transitions and sometimes a b-roll. Everything depends on how the person wants the cut to look.

What Forja must do:
- Before generating cuts, the person picks an edit level:
  - Simples: caption plus removing breaths and silences. This is the basic edit and the fastest.
  - Médio: adds transitions.
  - Completo: adds b-roll, zooms and SFX.
- Always show a time estimate for the chosen level before starting. Some levels are very fast, others take longer.
- Integrated editor, like HyperFrames Studio, so the person can customize the video after it is edited.

Related: [[board-antes-de-criar]] (settings board before any generation), [[maquina-v2-produto]] (editor integrated to edit a stretch of video).
