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

**Built 19/11:**
- Configurar has a "Nível de edição" picker (Simples is the default / Médio / Completo).
  - Each card shows ~min per cut.
  - The line under the picker shows the total for 10 cuts. Cuts run 2 at a time (MAQUINA_PARALELO).
- Data flow: config.nivel → maquina.NIVEIS text goes into config_txt as "EDIT LEVEL" → prompts/cortar.md says the level overrides the brief.
- Model: Simples always uses sonnet for the cut.
  - Simples = one scene with the headline only, no cards, takeovers or zoom, light checks.
  - Médio = 3 to 5 headline-only scenes with transitions, 1 or 2 takeovers, a few zooms.
  - Completo = the full brief.
- Timing: each cut saves `nivel` and `levou` (seconds). /api/tempos averages the last 20 per level; defaults are simples 4, medio 7, completo 14 min (completo measured on IMG_9270).
- Old jobs without a nivel are treated as completo.
- Still pending: the integrated HyperFrames-like editor.
