---
name: koncord-leve-e-realismo-com-outro-grafico
description: "KONCORD leve should be the realismo game with only lighter/stylized graphics, not a rebuild; realismo is the validated base"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b3179d9f-8182-4daa-8796-46945b0354d8
  modified: 2026-09-29T06:33:05.421Z
---

The KONCORD 3D light web version must be exactly the realismo version (src/realismo.js and its modules: layout, features, UI, games, NPCs, character creator), changing only the graphics. Do not remove features and do not rebuild from scratch. Realismo is the validated base ("ja validamos muita coisa na versao base").

**Why:** On 2026-09-29, tanpz said I had misunderstood. I had built src/leve/ as a separate ~2k-line client (Quaternius people, new world.js). It dropped a lot of realismo behaviour, and I had redirected /realismo to /leve.

**How to apply:** Build the light/stylized look as a graphics layer or preset inside realismo, swapping assets, materials, post-processing and lighting, while every system stays the same. Before touching gameplay, UI or layout, check that realismo already behaves that way and keep it. Related: [[koncord-3d-armas]].
