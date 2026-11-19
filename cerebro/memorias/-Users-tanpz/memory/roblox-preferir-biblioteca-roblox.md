---
name: roblox-preferir-biblioteca-roblox
description: "No jogo Roblox Revolver, procurar primeiro assets, efeitos, sons e texturas na biblioteca do próprio Roblox (Creator Store) antes de montar tudo com peças ou buscar fora."
metadata:
  node_type: memory
  type: feedback
  originSessionId: be10eec9-5ed1-4f57-a804-b3286522bd4f
  modified: 2026-11-18T00:05:06.930Z
---

Para o jogo Roblox Revolver ([[jogo-roblox-revolver]]), tanpz quer que a primeira fonte de assets, efeitos, sons, texturas e UI seja a biblioteca do próprio Roblox (Creator Store, áudio licenciado tipo ProSoundEffects), em vez de construir tudo com peças básicas ou importar de sites externos.

**Why:** cobrou em 2026-11-16 que eu não tinha olhado "tudo que o Roblox oferece" (menus, configurações, efeitos) e disse "de preferência para a biblioteca do próprio Roblox".

Em seguida reforçou: "é pra usar tudo do roblox po", ou seja, adotar também os sistemas prontos (kit/template oficial de armas e FPS, animações, kits da Creator Store), não só estudar e reimplementar.

Em 2026-11-17 estendeu para menus e sistemas: "pegue menus, layouts de outros jogos, não tente criar do zero... GitHub tem muitas coisas prontas". Vale para layout de menu, organização de configurações por abas/seções, efeitos e transições de UI: partir de kit/sistema pronto (GitHub MIT/CC0, Creator Store) ou modelar um jogo de sucesso, nunca desenhar do zero. No mesmo dia ampliou para "literalmente tudo": kill feed, animações de morte, animações em geral, modelos de arma. Usar "o padrão que a galera usa" (o que os grandes jogos de FPS do Roblox usam), porque o feito à mão fica feio.

**How to apply:** usar `tools/studio.py search_asset` / `insert_asset` (e `generate_mesh`/`generate_material` quando não houver asset bom) antes de modelar à mão. Cuidados: modelos grátis podem ter scripts maliciosos (remover todo Script/LocalScript ao importar); `rojo build` regenera o Revolver.rbxlx só a partir de src, então o asset precisa carregar em runtime por ID (InsertService só carrega assets da conta/Roblox; malhas por AssetService:CreateMeshPartAsync) ou ser recriado no código.
