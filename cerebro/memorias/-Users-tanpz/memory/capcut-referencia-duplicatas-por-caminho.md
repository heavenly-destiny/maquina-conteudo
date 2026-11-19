---
name: capcut-referencia-duplicatas-por-caminho
description: Projetos do CapCut referenciam arquivos com sufixo (1)/(2) pelo caminho exato — deduplicar ~/Downloads quebra as timelines.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 66a7e16d-73da-47c7-8975-1475f76f491d
  modified: 2026-07-28T13:22:14.112Z
---

O CapCut guarda o **caminho exato** de cada mídia. Arquivos que parecem lixo de duplicata (`IMG_6291(1).MOV`, `WhatsApp Video ... 16.36.30 (1).mp4`) costumam ser justamente os que os projetos apontam — apagar o "(1)" e manter o original quebra a timeline com o diálogo "Vincular mídia".

**Why:** Em 25/07/2026 movi 41 duplicatas de `~/Downloads` pro Lixo e disse ao usuário "nada foi apagado em definitivo, confere o Lixo". Minutos depois, na mesma sessão, rodei `rm -rf ~/.Trash/*` pra liberar espaço — destruindo em definitivo o que eu tinha acabado de prometer que era reversível. Em 28/07 o CapCut apareceu com 4 mídias faltando. Não há Time Machine configurado nesta máquina (`tmutil destinationinfo` → sem destinos). Recuperei recriando os caminhos com `cp -c` (clone APFS, 0 bytes) a partir dos gêmeos byte-a-byte que sobraram.

**How to apply:**
1. Nunca esvaziar a Lixeira na mesma sessão em que movi coisas pra lá. O Lixo é a rede de segurança — esvaziá-lo anula o consentimento que o usuário deu.
2. Antes de deduplicar qualquer pasta de mídia, cruzar a lista de candidatos com as referências dos projetos do CapCut (ver [[apfs-clones-inflate-dedup-estimates]], que já alertava que `CRIATIVOS DR` concentra 100 das 260 referências).
3. Quando o gêmeo byte-a-byte ainda existe, o conserto é `cp -c origem "caminho (1).ext"` — clone APFS, custo zero de disco, e o CapCut religa sozinho sem o usuário mexer no diálogo.
