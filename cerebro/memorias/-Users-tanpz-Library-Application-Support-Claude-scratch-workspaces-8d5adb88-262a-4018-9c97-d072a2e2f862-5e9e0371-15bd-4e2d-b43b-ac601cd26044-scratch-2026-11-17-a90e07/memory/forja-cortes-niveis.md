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
- Timing: each cut saves `nivel` and `levou` (seconds). /api/tempos averages the last 20 per level; defaults are simples 8, medio 11, completo 15 min. A real Simples test on 19/11 (cut 02, jobs/teste-simples) took 8 min: about 2 min for the EDL, 2 min for build and 3.5 min for the HyperFrames render. The render is the bottleneck; a faster Simples would need a caption render done only with ffmpeg.
- Old jobs without a nivel are treated as completo.
- Integrated editor: built 19/11 (see below).

**Fast Simples render (19/11, approved with "Sim, acelera"):** Simples no longer renders in HyperFrames.
- maquina writes `nivel.txt` into the cut folder.
- render.sh sees `simples` and runs `tools/organico/simples.py`. It makes one Chrome headless screenshot of the panel (title), draws the captions in PIL from `edit/caps.json` (organico.build writes that file), and has ffmpeg composite everything.
- The render step dropped from about 4 min to 51 s, and it looks the same frame by frame.
- If it fails, it falls back to HyperFrames.
- Default estimate for Simples is now 5 min.
- Local ffmpeg has no libass or drawtext, which is why the captions are drawn in Python.

**Cut editor (19/11, "Editor de vídeo"):** HyperFrames Studio was tested and rejected. Captions come from a script, so they are not editable. The UI is English and HeyGen-branded. Its edits skip the fast Simples render.
- Our own text-based editor (Descript/OpusClip style): app/src/telas/Editor.tsx. It opens from the "Editar vídeo" button on a cut's detail.
- What it can do:
  - Edit the title panel lines.
  - Click a word to seek to it. Shift-click, or the "Trecho" button on mobile, selects a range.
  - Cortar removes the selected words from the video. Destaque toggles the red serif keyword. Corrigir changes the caption text. Desfazer undoes (also ⌘Z).
- Data: <cut>/ajustes.json {remover:[keys], texto:{key:txt}, kw:{key:bool}, painel:{orig:novo}}. A word key is "source:start_in_raw".
  - cut.py: words get `key`; removed words become holes (prev end to next start, ±0.06).
  - organico.build: applies texto, kw and painel. W() falls back to the next word if an animation word was removed. caps.json words carry `k`.
- API: GET /api/corte-edicao?job&n, POST /api/corte-ajustar. The POST runs `maquina.py ajustar`, which calls render-corte with no Claude. About 2 min on Simples. If it fails, the previous video stays and the cut gets `erro_ajuste`.
