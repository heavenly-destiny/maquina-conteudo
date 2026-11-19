---
name: feedback-copy-rapida
description: Copy stage of the Forja must finish in ~2 min; no review loop at the copy stage; Clonar has a speech language choice
metadata:
  type: feedback
---
Copy tem que sair rápido: "não existe criar copy em 20 minutos" (tanpz, 19/11/2026).

**Why:** the copy stage took ~14 min because of two review rounds plus an opus redo. He approves the copy himself in the panel, so the review there was redundant.

**How to apply:** gerar.py skips the review loop when so_copy(ped). PARA_NA_COPY tells the agent to be fast and check its own copy. Review stays only on the final video. After the change, Clonar copy took 1m45s. Clonar also has "Fala original | Em português" (pedido.json idioma), and the choice is the user's per video. See [[maquina-v2-produto]].
