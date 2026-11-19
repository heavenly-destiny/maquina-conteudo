---
name: dois-modos-hoje-e-refinado
description: "No protótipo da Quebra da Matrix, toda mudança só pode aparecer no modo Refinado — o modo Como está hoje é cópia fiel da produção"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-12T21:36:54.972Z
---

O protótipo tem dois estados, alternados pela barra do topo:

- **"Como está hoje"** — cópia fiel das 38 telas de produção. Mesma estrutura,
  mesma copy, mesmos tokens. **Não se mexe nisso.**
- **"Refinado"** — onde toda proposta vive.

O mecanismo é CSS: `body[data-mode="hoje"] .only-refino{display:none}` e
`body[data-mode="refino"] .only-hoje{display:none}` (especificidade 0,2,1,
escolhida de propósito pra ganhar de regras de componente como `.nav a{display:flex}`).

**Regras práticas:**
- Pra **remover** algo, marque o elemento `only-hoje` — nunca apague o markup.
- Pra **adicionar** algo, marque `only-refino`.
- Mudança de CSS global (token, cor, espaçamento) tem que estar escopada em
  `body[data-mode="refino"]`, senão vaza pro modo fiel.
- Atributo `style=` inline em produção só é derrubável com `!important` dentro
  do escopo do refino.
- Cuidado com markup morto: um filho `only-refino` dentro de um pai `only-hoje`
  **nunca renderiza**, porque o pai some no refino.

**Why:** o valor do protótipo é ser um comparativo lado a lado. Se o "hoje"
deixa de ser fiel, o Iuri perde a régua pra julgar a proposta — e o time perde
o argumento de "olha o que mudou".

**How to apply:** depois de qualquer edição, conferir que a mudança aparece só
num modo. Vale varrer se alguma classe alterada aparece em contexto `only-hoje`.
Ver [[prototipo-e-o-entregavel]].
