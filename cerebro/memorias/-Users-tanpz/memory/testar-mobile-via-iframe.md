---
name: testar-mobile-via-iframe
description: "quando resize_window do claude-in-chrome não encolhe a janela real do Chrome do tanpz (fica travada no tamanho do display), testar responsividade mobile via iframe de largura fixa em vez de insistir no resize."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cd1a2687-60c7-4b2d-bc84-018b94d954b4
  modified: 2026-09-20T06:34:55.526Z
---

`mcp__claude-in-chrome__resize_window` não funciona na janela real do Chrome do tanpz — testei 5x em turnos diferentes (390x844, 400x900), `window.innerWidth` sempre volta o tamanho real do display (ex: 1710px). Parece janela maximizada/tiled pelo macOS que a extensão não consegue redimensionar. Cmd+Shift+M (device toolbar do DevTools) também não funciona via `key` action.

**O que funciona:** injetar um `<iframe>` de largura fixa (390x844) apontando pra URL a testar, via `javascript_tool` reescrevendo `document.body`. O iframe tem viewport próprio independente da janela pai — dispara os media queries do Tailwind de verdade (sm:, lg:), diferente de zoom/CSS transform que não mudam breakpoint.

```js
document.body.innerHTML = '';
document.body.style.cssText = 'margin:0;padding:20px;background:#333;display:flex;justify-content:center;';
const iframe = document.createElement('iframe');
iframe.src = 'URL_A_TESTAR';
iframe.style.cssText = 'width:390px;height:844px;border:2px solid #666;';
document.body.appendChild(iframe);
```

Pra rolar dentro do iframe (scroll normal do `computer` tool não atinge o conteúdo do iframe): `iframe.contentWindow.scrollTo(0, Y)` via `javascript_tool` — funciona mesmo cross-origin, porque `scrollTo` é um dos métodos de `Window` permitidos entre origens diferentes.

**Como aplicar:** da próxima vez que precisar testar mobile nesta máquina, ir direto pra essa técnica — não perder turno tentando `resize_window` ou DevTools de novo.
