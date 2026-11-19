---
name: verificar-antes-de-entregar
description: "tanpz não quer conferir meu trabalho — devo criticar e corrigir o que fiz antes de entregar, sem pedir revisão."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2369e71a-b6f2-4e5c-8025-b3dc30e281a1
  modified: 2026-08-26T12:30:44.488Z
---

Não entregar dizendo "me diz o que ficou torto". Antes de dar qualquer coisa
por pronta, revisar criticamente o próprio trabalho e consertar o que estiver
ruim — mesmo que ninguém tenha reclamado.

**Why:** em 2026-08-26 subi um painel de chamada cujos botões transbordavam a
barra lateral, e pedi pro tanpz entrar numa call pra conferir. Ele mandou o
print do defeito. Antes disso, também construí uma lista de membros que já
existia, porque concluí ausência a partir de um grep que nunca olhou o
diretório certo. Nos dois casos o erro estaria visível se eu tivesse olhado.
Pedir revisão é passar meu trabalho pra ele.

Em 2026-08-27 fiz pior: escrevi explicitamente "não consegui ver isso sozinho"
e subi assim mesmo. Quebrou. Dizer que não verifiquei não substitui
verificar — se não dá pra ver, o passo é conseguir ver, não avisar e seguir.

**How to apply:**
- Antes de entregar UI: abrir e olhar, medir largura real, conferir os dois
  temas, tela estreita. Screenshot e ler o screenshot.
- Antes de dizer que algo não existe: procurar em `src/` **e** `components/`,
  e por mais de um nome. Busca parcial não prova ausência.
- Reler o próprio código caçando o defeito antes que ele apareça — em Solid,
  props avaliadas na hora congelam; em shell, `pipefail` com consumidor que
  fecha cedo dá falso negativo; sob `launchd`, PATH e TCC mudam.
- Testar o caminho de falha, não só o de sucesso. Alerta que nunca falha e
  canário que morre calado não valem nada.
- Quando não der para verificar sozinho, **destravar em vez de avisar e
  subir**. No Koncord isso já está resolvido: o tanpz aceitou fazer login na
  aba do Chrome que eu controlo (`claude-in-chrome`), então dá pra abrir o
  app, clicar, tirar print e ler o print. Se a aba estiver deslogada, pedir
  pra ele logar de novo ali — não subir às cegas.
- Print da tela é prova; `getComputedStyle` e teste sintético em `about:blank`
  não são. Duas vezes eu "provei" que estava certo e estava errado.
- Animação em aba sem foco: `getComputedStyle().transform` devolve valor
  velho, porque quem roda é o compositor. Medir por `Animation.currentTime`.

Relacionado: [[projeto-concord]]
