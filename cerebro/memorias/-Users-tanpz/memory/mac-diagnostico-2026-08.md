---
name: mac-diagnostico-2026-08
description: Baseline do MacBook Air M5 após limpeza de 07/08/2026 — o que foi removido e o que sobrou de propósito.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4efe6b26-b487-44b2-96ff-f0c17cdb71ab
  modified: 2026-08-07T14:32:22.508Z
---

Máquina: MacBook Air M5, 16 GB, macOS 27.0 **beta** (build 26A5388g). FileVault e SIP ligados, bateria 62 ciclos/100%. **Sem Time Machine configurado** — não existe rede de segurança para nada apagado.

Diagnóstico completo em 07/08/2026. Baseline pós-limpeza: **268 GB livres**, caches em ~960 MB, swap ~100 MB, 1 LaunchAgent (`com.tanpz.mac-healthcheck`, a cada 3 dias).

Removidos: CrossOver + Bottles (7,3 GB), Steam + CS:GO (1,8 GB), Quick Checkers, resíduos de Roblox/Cursor/Antigravity IDE/GitKraken/CleanMyMac/Hidden Bar. Banco BTM resetado (`sfltool resetbtm`) para limpar itens de login fantasmas. Firewall + stealth mode ligados; Power Nap desligado na bateria.

Achado principal: o LaunchAgent `com.tanpz.crossover-autoclean` disparava um shell **a cada 30 segundos** (2.880×/dia), retornando erro, para um app não usado — eliminado.

**Why:** Sem Time Machine, cada limpeza é irreversível, e vale saber o que já foi varrido para não reinvestigar nem prometer reversibilidade que não existe.

**How to apply:** Mantido de propósito, não reabrir: [[backdrop-wallpaper-custo-cpu]]; vídeos de projeto (INFLU LAB, influ-webinario, influencers-lab) são material de trabalho. Antes de esvaziar a Lixeira, ver [[capcut-referencia-duplicatas-por-caminho]].


2026-09-28: disco tinha caído para 28 GB livres. A pedido do tanpz, apaguei (rm, sem Lixeira) Modo Cueva/Caverna/Dublagem, todos os vídeos soltos de Downloads/Documents, Movies/CapCut, zips ACERVO, dmgs, `.codex/.tmp/marketplaces`, `.cache/uv`, `~/Library/Caches` e o cache do npm. Resultado: 163 GB livres. Vídeos de projeto ficaram porque ele não respondeu sobre eles; WhatsApp tem que ser limpo pelo próprio app.
