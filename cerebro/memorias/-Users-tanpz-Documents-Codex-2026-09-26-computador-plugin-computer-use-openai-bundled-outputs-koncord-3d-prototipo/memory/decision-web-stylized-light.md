---
name: decision-web-stylized-light
description: 2026-09-29 — KONCORD web version is redone as extremely light stylized 3D (target ~1000 fps); photoreal graphics move to the Unreal version
metadata:
  type: project
---

On 2026-09-29 the owner decided: "pra versão web o jogo tem que ser extremamente leve pra rodar a 1000 fps, os gráficos realistas ficam pra versão do Unreal … mas os gráficos têm que ser bem bonitos, estilizados … tem que refazer tudo".

**Why:** the photoreal web build (Poly Haven scans, MetaHuman/Rocketbox people, bloom, SSR, N8AO) is heavy; realism now belongs to the Unreal 5.8 version (see entregas/KONCORD-3D-REFERENCIA-UE58.pdf).

**Style (owner, same day):** "tipo Roblox ou The Sims … bem bonito, gráficos bem desenhados"; picked "low-poly limpo" (Townscaper/Kenney). North-star reference: Welcome to Bloxburg (Roblox's Sims-like) — clean stylized shapes, warm lighting, Sims-level furniture detail.

**Latest style call (same night):** "gráfico tipo Overcooked" — chunky chibi people (Kenney Mini Characters), saturated palette, warm contrasty key light with soft shadows, high near-isometric camera. KayKit props already match.

**How to apply:** for the web build, every visual choice is judged by frame cost first and beauty second: stylized low-poly/toon, flat or gradient-mapped materials, baked or fake lighting, instancing, few draw calls, no heavy post. Backlog items about photorealism (129, 134, 136–141, 147–148, 175 realism parts, ActorCore/MetaHuman) no longer apply to the web build. Gameplay systems (room-core server, phone, chess, weapons, voice) are kept; the visual layer is redone. Browser rAF is capped at the monitor refresh — "1000 fps" is measured as frame time (<1 ms) or in the desktop app with vsync off. Related: [[feedback-ready-made-first]], [[feedback-detail-delight]].
