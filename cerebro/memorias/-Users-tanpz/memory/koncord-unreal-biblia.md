---
name: koncord-unreal-biblia
description: "KONCORD master design doc v3 (web + Unreal): where it lives, the rebuild pipeline, and the owner decisions it encodes"
metadata:
  node_type: memory
  type: project
  originSessionId: 220f35e5-8c00-4af5-a993-90bc1ebc200d
  modified: 2026-09-30T00:57:44.076Z
---

The KONCORD master document is `~/Documents/KONCORD/documento-mestre/KONCORD-DOCUMENTO-MESTRE-v3.pdf` (111 pages, finished 2026-09-29). The editable sources are in `fonte/`:
- `parts/*.html`
- `build_v3.py`, which needs the venv with pypdf, markdown and PIL, plus Chrome headless
- `world_spec.py`, which writes `world-spec.json` and validates the geometry (it must report 0 errors)
- `koncord_blockout_v3.py` (Blender)
- `gen_data.py`, which writes `items.csv` and `economy.json`
- `prompts.md`
- `shotlist.json`, the list of 77 concept images to generate in ChatGPT

The six code-audit inventories are in `inventario/`. The older v2 bible is in `~/Downloads`; v3 replaces it.

**Why:** tanpz asked for "the bible, nothing missing". In a single session he added many requirements: the map from image C replaces the web map, a Sims/FiveM-level creator, Habbo-style diegetic mini-games, sports including golf and tennis, a beach with fishing, pets, a streak/XP system, servers and worlds apart, an admin panel with live map editing, skins, bundles and a subscription. The UE project sits on another PC, and the PDF (with embedded attachments) is how work moves between the two machines.

**Key decisions encoded in v3:**
- **Coordinates:** world (e, n, z). Unreal is X = n·100, Y = e·100. three.js is x = e, z = −n. Neither mapping mirrors the world, so the old web chirality problem is gone.
- **Council verdict:** approved as a bible, not as a schedule. Validation gates G0–G5 apply:
  1. Fix the voice leak.
  2. Run a 60-bot load test and the character spike.
  3. Get 3 pilot companies actually using it (free for now).
- **Delivery order:** web is the launch product; UE ships after gate G4. The new map goes in behind a feature flag.
- **Fable review applied:** world-spec v3.1 geometry fixes, a 2-floor office, Kristais that cannot convert to Koins, and 18+ servers only.

**How to apply:** Any new KONCORD feature goes into this document first (law L12). Edit `parts/` and rebuild; don't patch the PDF. Still open for tanpz: Q1 (character tech, decided after the spike), Q6 (image A deviation) and Q8 (clock curve). Q7 was decided on 2026-09-30: no prices yet, the game is 100% free for now, and monetization is built but switched off with the flag `monetization_enabled=false`.

There is also an illustrated edition, `KONCORD-DOCUMENTO-MESTRE-v3-ilustrado.pdf` (127 pages). Build it with `ILUSTRADO=1 python build_v3.py`; it places 87 ChatGPT concept images from `imagens-conceito/` at the end of their sections. The image prompts are in `imagens-conceito/PROMPTS-IMAGENS.md`. Related: [[koncord-3d-armas]], [[koncord-leve-e-realismo-com-outro-grafico]].
