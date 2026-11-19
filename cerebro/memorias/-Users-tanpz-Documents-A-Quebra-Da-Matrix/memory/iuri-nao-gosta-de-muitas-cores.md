---
name: iuri-nao-gosta-de-muitas-cores
description: "Restrição de design dada pelo Iuri em 12/08/2026 — o app não pode ter muitas cores; a regra derivada é cor=estado, categoria e identidade são neutras"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-13T20:00:55.788Z
---

O Iuri não gosta de muitas cores. Restrição dada em **12/08/2026**, e vale pro
app inteiro, não só pra uma feature.

**A regra que resolveu isso na Comunidade:**

> **Cor é estado. Categoria e identidade são neutras.**

O diagnóstico que motivou: o card do feed carregava *duas* pílulas coloridas ao
mesmo tempo (categoria + estado), e o verde de `Vagas` era exatamente o mesmo
`#43CC76` de `Resolvido` — a mesma cor significando duas coisas no mesmo card.

**Aplicado (só no refinado):**
- chips de categoria → neutros (a pessoa lê a palavra)
- `Resolvido` continua verde; `Sem resposta` perdeu o âmbar e virou neutro com peso
- 30 avatares com 10 cores → neutros. **Vermelho da marca é só o próprio usuário**
- chips de intenção e ícones de notificação → neutros

Efeito colateral bom: na tela de post aberto a única coisa colorida que sobrou é
o botão **"Marcar como útil"** em verde — que é literalmente a tese da feature.

**Ainda coloridos, cada um é uma decisão em aberto:** capas de curso (`.c1`–`.c6`,
6 gradientes), os 4 elos (Arquiteto/Capitão/Operador/Rebelde) na Temporada e no
Ranking, o âmbar de "trancado", e os 3 pontinhos do calendário do Mural.

## Reforçado em 13/08/2026

Ele repetiu a regra sem eu perguntar: *"tudo que a gente criar e adicionar não pode
fugir do termo do layout, também do design das cores… tem que ser algo bem
minimalista"*. Não é preferência de uma tela — é critério de aceite.

O que isso derrubou na prática, no mesmo dia:
- **verde de "ao vivo"** na linha do tempo do Mural → vermelho da marca, que é como o
  app marca "No ar agora"
- **vermelho no "Denunciar"** do menu do post → neutro. Só "Excluir" continua vermelho,
  porque só ele destrói
- **hover colorido** no Top 5 → o item só acende pro branco

**A única exceção aceita, e ele autorizou nominalmente:** o pódio do Top 5 — anel de
ouro, prata e bronze nos três primeiros, em tom dessaturado (`#C8A24A`, `#B9BAC0`,
`#A8734A`). Passa porque **posição é estado**, não decoração, e porque a convenção é
universal o bastante pra dispensar legenda.

E o pedido veio junto com o oposto: *"não precisa ser tão minimalista também, mas não
algo pesado igual tava"*. O ponto de equilíbrio dele: **hierarquia sim, ornamento não.**

**Why:** a crítica registrada dele na reunião de 11/08 foi *"pra mim tá muito
carregado, velho. Carregadão"* — cor demais é uma das causas, junto com densidade.

**How to apply:** ao propor qualquer UI nova, contar quantas famílias cromáticas
aparecem numa tela só. Se passar de duas (marca + uma semântica), justificar.
Ver [[dois-modos-hoje-e-refinado]].
