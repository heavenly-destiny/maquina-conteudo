---
name: prototipo-e-o-entregavel
description: "O entregável do projeto A Quebra da Matrix é o protótipo HTML publicado como artifact, não as notas do cofre Obsidian"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-13T00:48:20.766Z
---

O trabalho de verdade do projeto **A Quebra da Matrix** mora no protótipo HTML,
não nas notas do Obsidian. O cofre (`/Users/tanpz/Documents/A Quebra Da Matrix`)
guarda decisões e pesquisa; o protótipo é o que o Iuri olha.

## Para que ele serve (o fluxo do projeto)

**Protótipo = rascunho visual → Iuri aprova → dev aplica.**

Não é entregável decorativo nem retrabalho: é o meio pelo qual a proposta é
apresentada e depois implementada. Por isso os dois modos existem — o "como está
hoje" é a **régua** que deixa o Iuri ver o que mudou, e é a referência de
antes/depois que o **dev** implementa contra.

Corolário: a Regra 9 do Iuri (*"não precisa fazer nada de UX, traz em texto e
print"*) é **piso, não teto**. Ela diz o que basta, não o que é proibido.
Proposta nova nasce **dentro do protótipo, no modo refinado** — não como
documento à parte.

- **Fonte:** `90 - Assets/prototipo/a-quebra-da-matrix.html` (~4.900 linhas, arquivo único)
- **Publicado em:** https://claude.ai/code/artifact/ba3e398f-77a0-447e-8283-ddf468ec2ca8
- **Republicar:** sempre passando esse `url` no Artifact, senão cria artifact novo

O protótipo clona as 38 telas capturadas em 11–12/08/2026 e cobre o app inteiro,
do login ao Morfeu (14 views, cada uma com sub-panes).

**Why:** o cofre e o protótipo divergiram — o protótipo já está à frente das notas
em alguns pontos (ex.: taxonomia da Comunidade). Quem trabalhar só pelas notas
propõe coisa que já foi feita ou já foi descartada.

**How to apply:** antes de propor mudança de feature, ler a view correspondente no
protótipo, não só a nota da feature. Ver [[dois-modos-hoje-e-refinado]].
