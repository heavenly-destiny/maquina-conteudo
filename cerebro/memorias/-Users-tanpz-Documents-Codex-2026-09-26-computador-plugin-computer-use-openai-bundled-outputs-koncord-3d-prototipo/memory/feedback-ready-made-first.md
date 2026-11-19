---
name: feedback-ready-made-first
description: KONCORD 3D — always use ready-made free assets/animations/sounds and look up references before building anything
metadata:
  node_type: memory
  type: feedback
  originSessionId: f3219c15-9f10-48ec-a85d-4f0861501ba0
  modified: 2026-09-27T21:15:02.294Z
---

For KONCORD 3D, never build models, animations, sounds or UI patterns from scratch when a ready-made free one exists. Search first (Poly Haven, Quaternius, Kenney, OpenGameArt, Microsoft Rocketbox, GitHub mirrors), download, adjust in Blender, register the license in ASSETS.md. Before designing anything (piers, HUD, dialogs, menus), look up real references and match or beat them.

**Why:** the user repeated this many times ("tudo isso já existe pronto na internet", "busque referências", "adota essa cultura pra eu não precisar ficar repetindo") and gets frustrated when primitive boxes or invented UIs appear.

**How to apply:** for every new visual item, first step is a search for a CC0/MIT asset or a design reference; only write geometry/UI by hand if nothing fits, and say so. Also: user wants ultra-realistic, clean minimalist glass HUD, and "não deixar passar nada" — record every request in entregas/BACKLOG-NOITE.md immediately.

**Model proven games (added 2026-09-27):** never invent designs from my head. For every system (character creator, HUD, menus, maps, rooms, lighting, game rooms, nightclub) find a successful game that already does it (The Sims 4/inZOI/Black Desert for customization, GTA/Fortnite/Valorant for HUD and menus, AAA 2026 for lighting), download its reference images/videos, analyse each detail and replicate it, then improve. The owner's target: a next-gen "The Sims" with 2026 AAA graphics, same depth of customization, running perfectly smooth (60 locked, 240+ ideal); install size can be up to 15 GB.


**Code systems too (added 2026-09-28):** before writing any feature system (phone apps, social feed, stories, games, UI kits), search GitHub/open source for a ready system first (e.g. NPWD for FiveM phones), check the license (MIT/BSD/CC0 usable; GPL = reference only, never copy), and reuse or copy its app list/UX. The owner said "sempre busque coisas prontas... viu como já economiza muito tempo??" after this saved time.
