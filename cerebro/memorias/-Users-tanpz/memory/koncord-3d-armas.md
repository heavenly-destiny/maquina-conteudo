---
name: koncord-3d-armas
description: "Koncord 3D (three.js, koncord.pro) — onde mora o projeto, deploy, e como testar armas/tiro sem segunda pessoa"
metadata:
  node_type: memory
  type: project
  originSessionId: b3179d9f-8182-4daa-8796-46945b0354d8
  modified: 2026-09-29T02:36:43.259Z
---

Koncord 3D mora em `~/Documents/Codex/2026-09-26/computador-plugin-computer-use-openai-bundled/outputs/koncord-3d/prototipo`
(não em ~/Developer). Deploy: `npx wrangler@4.139.0 deploy --env production` → koncord.pro. "Convés" (Phaser, koncord-os)
é outro projeto — quando tanpz diz "Koncord 3D", é este.

Armas (2026-09-28, commit e793b1f): `src/weapons.js` (hotbar 1/2/3, arma na mão, rastro, sons), `src/weapons-config.js`
(compartilhado com servidor), tiro decidido em `room-core.js` ("equip"/"shoot"), braço mirando em `combat-pose.js`
(`armed`), câmera de ombro em `realismo.js` (`shoulder`). Paredes ainda não bloqueiam tiro.

**Testar sem segunda pessoa:** abrir um WebSocket "dummy" na própria página (`/atelier-room`), mandar `profile` e `move`
pra posicionar um alvo. Em dev, `window.__weapons.debug.slow = 0.02` põe o tiro em câmera lenta pra conseguir ver o rastro
no print. A aba do Chrome fica `hidden` depois de cada reload (rAF para) — trazer a janela pra frente via osascript antes
do screenshot. Related: [[koncord-os]].
