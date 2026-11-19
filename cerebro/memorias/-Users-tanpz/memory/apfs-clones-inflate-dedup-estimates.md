---
name: apfs-clones-inflate-dedup-estimates
description: "On this Mac, Finder copies are APFS clones, so du-based duplicate-cleanup estimates massively overstate the disk space actually recoverable."
metadata: 
  node_type: memory
  type: project
  originSessionId: d69a88fa-8c02-43d9-b7bc-499bb4927c68
  modified: 2026-07-25T22:06:54.298Z
---

Neste Mac (APFS, `/System/Volumes/Data`), cópias feitas pelo Finder usam `clonefile()`: duplicar um arquivo de 200 MB consome **0 MB** de disco real. `cp` na linha de comando, por outro lado, consumiu os 200 MB completos no teste.

**Why:** Em 25/07/2026 apaguei 311 arquivos (43,18 GB segundo `du`) da pasta `~/VIRNA UISLA MIDIA/VIDEOS GERAL`, que eram duplicatas byte-a-byte de `~/VIRNA UISLA MIDIA/ARQUIVOS BRUTO VSL`. Após esvaziar a Lixeira, o disco liberou apenas ~9 GiB. A pasta tinha sido criada por cópia no Finder, então os arquivos compartilhavam blocos físicos com a origem — `du` reportava o tamanho lógico de cada cópia, não o espaço real ocupado.

**How to apply:** Antes de prometer ganho de espaço em qualquer plano de deduplicação nesta máquina, medir `df` real antes/depois numa amostra em vez de somar `du`. Duplicatas dentro do mesmo volume APFS provavelmente rendem quase nada. Vale especialmente para `CRIATIVOS DR` (101 duplicatas internas) e `VSL ARQUIVOS` (44 GB, possível clone de `VIRNA UISLA MIDIA`) — deduplicar essas pastas tende a liberar pouco e, no caso de `CRIATIVOS DR`, é arriscado porque ela concentra 100 das 260 referências de mídia dos projetos do CapCut.
