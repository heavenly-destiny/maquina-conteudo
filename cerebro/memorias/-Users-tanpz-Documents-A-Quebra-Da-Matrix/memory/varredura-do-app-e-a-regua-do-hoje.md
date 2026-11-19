---
name: varredura-do-app-e-a-regua-do-hoje
description: "Como levantar o estado real do app da Quebra da Matrix e onde vive a régua do modo 'como está hoje'"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c160100e-0a78-46c0-a23c-c0e0abf7a5ef
  modified: 2026-08-13T16:02:49.920Z
---

O usuário pediu, em 13/08/2026, que o app inteiro fosse mapeado **100%** — cada tela, cada
botão, cada clique, cada estado, cada animação — antes de qualquer mudança, e que o modo
**"Como está hoje"** do protótipo ficasse **idêntico** à produção.

## O método que funcionou

1. O login é do usuário: pedir que ele entre na aba aberta (nunca digitar credencial).
2. Navegar rota por rota e, em cada estado, **extrair o DOM renderizado** com JavaScript —
   texto, `href`, `aria-label` de cada botão, inputs, overlays de menu — em vez de depender
   só de print. `aria-label` é o que revela as ações reais (`Curtir` vira `Descurtir`).
3. Mandar cada captura para um **sink HTTP local** (`python3 -m http.server` custom na
   127.0.0.1) e gravar em disco: o retorno do `javascript_tool` trunca, o arquivo não.
4. Baixar os bundles de CSS inteiros (`link[rel=stylesheet]` + `fetch`) para ler tokens,
   `@keyframes` e transições **de verdade**, em vez de deduzir pelo visual.
5. Para exercitar interação com efeito colateral (curtir, salvar, republicar): fazer e
   **desfazer**, restaurando o estado. Nunca publicar post nem comentário.
6. Para ver o protótipo no navegador, servir por `http://127.0.0.1:<porta>` — a extensão
   **não abre `file://`**.

## Onde ficou a régua

`02 - Produto/Estado do App — varredura completa 2026-08-13.md`. Qualquer descrição do "hoje"
anterior a essa data pode estar errada: a produção mudou (rotas viraram UUID, tela de post
aberto passou a existir, Central de Ajuda foi preenchida).

**Why:** o valor do protótipo é ser comparação lado a lado. Se o "hoje" não for fiel, a
proposta perde a régua — e em 13/08 ficou provado que a produção muda debaixo da documentação.

**How to apply:** antes de propor mudança, conferir a varredura mais recente; se tiver mais de
alguns dias, refazer a varredura da tela em questão. Ver [[dois-modos-hoje-e-refinado]].
