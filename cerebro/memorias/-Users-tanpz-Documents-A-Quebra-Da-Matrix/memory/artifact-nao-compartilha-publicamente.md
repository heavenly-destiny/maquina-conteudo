---
name: artifact-nao-compartilha-publicamente
description: O artifact do protótipo não aceita link público desde 14/08/2026; o que já foi descartado como causa
metadata: 
  node_type: memory
  type: project
  originSessionId: c7f23ab2-3514-4be3-903c-82f102c194c3
  modified: 2026-08-14T17:34:39.838Z
---

Em **14/08/2026** o menu de share do artifact passou a recusar o link público:
*"This version can't be shared publicly. Publish a new version or change the shared version,
then try again."* Antes disso o mesmo protótipo compartilhava normalmente.

Descartado por teste, um a um:

- **Não é a conta** — uma página vazia publicada na mesma sessão compartilha sem erro.
- **Não é o artifact antigo** — cópia idêntica publicada como artifact novo dá o mesmo erro.
- **Não é capability declarada** — republicar com `capabilities: {}` não mudou nada.
- **Não é tamanho** — página neutra de texto com os mesmos 454 KB compartilha normal.
- **Não é a imagem base64** — a cópia sem a PNG de 49 KB continua bloqueada.
- **Não é a tela de login** — a cópia que abre direto no app continua bloqueada, e o mock
  estático de login (sem `<form>`, sem `type="password"`) também não destravou.
- **Não é uma tela específica** — as duas metades do protótipo, com sete views cada,
  bloquearam as duas.

Sobra o esqueleto comum a todas as cópias: CSS, JS, barra do topo, sidebar e o `<aside>` de
notas do time. A investigação parou aí porque a Vercel resolveu a necessidade real — ver
[[deploy-do-prototipo-na-vercel]].

**Why:** cada rodada de bissecção custa um teste manual dele no navegador; não vale gastar
isso enquanto existe um link público funcionando por outro caminho.

**How to apply:** não tentar "republicar para destravar" — já foi tentado várias vezes e não
funciona. Se ele pedir para retomar a caça, o próximo passo é bissectar o esqueleto: uma cópia
só com CSS+JS+shell e zero views, outra só com o texto das views sem CSS nem JS.
