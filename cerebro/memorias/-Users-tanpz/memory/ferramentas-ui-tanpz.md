---
name: ferramentas-ui-tanpz
description: "Stack de ferramentas de UI que tanpz quer usar ao construir telas — 21st.dev, v0 e o skill ui-ux-pro-max."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 476e34e5-f498-4864-9d99-c18b3eb64b3f
  modified: 2026-09-22T23:06:04.540Z
---

Ao construir ou melhorar qualquer tela, tanpz quer que eu use **21st.dev** e **v0.app** para
buscar/gerar componentes e templates, e que eu **sempre** rode o skill `ui-ux-pro-max` antes de
decidir design. Também instalou (global) **impeccable** e **taste-skill** pra tirar "cara de IA"
do resultado.

**Why:** ele pediu explicitamente em 2026-08-12 — quer que eu baixe o que for preciso pra
complementar e melhorar, em vez de escrever tudo do zero. Reforçou forte em 2026-09-22 (projeto
koncord-os, redesign do Convés): eu fiz polish visual (gradiente, sombra, vignette) direto no
código, sem buscar referência nenhuma antes — resultado ficou "amador", e ele disse na cara que eu
"tô adiando, tô querendo construir tudo do zero" e que **NUNCA** devo construir algo visual sem
referência primeiro.

**How to apply:** ordem = **Pinterest (WebSearch/WebFetch) pra referência visual real primeiro**
→ `ui-ux-pro-max` decide o sistema (paleta, escala, hierarquia) → 21st/v0 buscam componente/
animação PRONTA pra copiar/adaptar (não reescrever do zero se já existe algo similar pronto) →
**reescrever pra usar os tokens do projeto**, nunca os do gerador → `impeccable` audita no fim.
Isso vale pra QUALQUER coisa visual — inclusive polish incremental (sombra, gradiente, animação de
personagem), não só telas novas. Antes de escrever CSS/canvas de design à mão, perguntar: "já
busquei referência disso?" — se não, buscar antes de codar. Os MCPs `21st` e `v0` estão
configurados em escopo global (`~/.claude.json`) e precisam de `/mcp` pra autenticar. O MCP do
`shadcn` só funciona apontado pra um projeto com `components.json`.

Relacionado: [[cofre-quebra-da-matrix]] · [[instalar-skills-sempre-global]] · [[nunca-entregar-pela-metade]]
