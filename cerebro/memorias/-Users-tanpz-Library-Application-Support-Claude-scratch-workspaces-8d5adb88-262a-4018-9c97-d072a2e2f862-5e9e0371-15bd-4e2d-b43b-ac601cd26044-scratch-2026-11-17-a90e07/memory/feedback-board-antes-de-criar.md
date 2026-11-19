---
name: feedback-board-antes-de-criar
description: Forja never generates straight from send; every video goes through a settings board (caption, soundtrack, duration, layout); music lives there, not in Inspirar
metadata:
  type: feedback
---
In Forja, pressing send on Cortar/Animado/Criativo/Modelar opens a settings board first (Configurar for cuts, ConfigurarVideo for generated videos: caption template with live preview, soundtrack style + reference track, duration, style). Only the board's button creates. Music picking lives in the board's Trilha, never as a tab in Inspirar. Choices travel to the job (cut config.json; /api/gerar legenda+trilha, injected by gerar.escolhas_video).

**Why:** tanpz (19/11): "se eu só clicar em mais, o vídeo já sai cortando... cadê um board pra pessoa escolher a legenda?" and "música no inspirar não faz sentido nenhum".

**How to apply:** any new creation mode gets the board before it runs. Clonar mode was removed on 19/11; Modelar covers it. Related: [[feedback-trilha-obrigatoria]], [[maquina-v2-produto]].

Update 19/11: no "Clonar" mode. Modelar = same video with every effect of the reference (scenes, timing, transitions, motion, captions, music mood, SFX), adapted to any brand/subject; modelar uploads decupagem in Fiel. Never write "100% igual" in the UI.
