---
name: backdrop-wallpaper-custo-cpu
description: tanpz optou por manter o Backdrop (wallpaper em vídeo) mesmo sabendo que custa ~4-9% de CPU constante — não sugerir remover de novo.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4efe6b26-b487-44b2-96ff-f0c17cdb71ab
  modified: 2026-08-07T14:32:09.403Z
---

O app **Backdrop** (`/Applications/Backdrop.app`) roda wallpaper em vídeo e mantém `BackdropWallpaper` + `VTDecoderXPCService` ativos 24/7, custando entre 4% e 9% de CPU permanente e ~3,2 GB em disco (`~/Library/Application Support/Backdrop` + `com.apple.wallpaper/aerials`). É o maior dreno de bateria da máquina.

Em 07/08/2026, num diagnóstico completo, tanpz foi apresentado ao custo e **escolheu explicitamente manter** ("deixar como está").

**Why:** É o achado de performance mais chamativo do sistema, então é tentador reapresentá-lo como "problema" a cada diagnóstico. A decisão já foi tomada com o custo na mesa.

**How to apply:** Mencionar como custo conhecido no rodapé de um relatório, se for relevante — nunca propor remoção como se fosse novidade nem pedir a decisão de novo. Ver [[mac-diagnostico-2026-08]].

2026-09-29: tanpz pediu que só Alcove, Mullvad VPN e Vorssaint iniciem com o Mac. Tirei Backdrop e TanpzWhisper dos itens de início. Em seguida tanpz pediu o Backdrop de volta **em segundo plano**: o agente `com.cindori.Backdrop.Wallpaper.agent` fica ligado (wallpaper roda), só a janela do app não abre no login. O agente do Epic e o StartUpHelper do Spotify também ficaram desativados.
