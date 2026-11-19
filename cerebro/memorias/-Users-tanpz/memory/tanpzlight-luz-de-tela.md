---
name: tanpzlight-luz-de-tela
description: "TanpzLight (~/Developer/TanpzLight) transforma a tela do Mac em luz de rosto; armadilhas do brilho por API privada e da janela borderless que não recebe teclado."
metadata:
  type: project
---

Criado em 2026-08-31. `~/Developer/TanpzLight`, instalado em `/Applications/TanpzLight.app` via
`./build.sh install` (mesmo molde do TanpzWhisper: `swiftc` direto num bundle, sem SwiftPM, assinado
com o cert "Tanpz Local Code Signing"). Enche todas as telas de branco, sobe o brilho ao máximo e
serve de luz de rosto no escuro. Setas mudam temperatura (2700K a 6500K) e nível; esc, Q ou clique
saem.

Três coisas que só aparecem tentando:

- Não existe API pública para **escrever** brilho. O app usa `DisplayServicesSetBrightness` /
  `DisplayServicesGetBrightness`, carregadas com `dlopen` de
  `/System/Library/PrivateFrameworks/DisplayServices.framework`. Funciona na tela interna do M5.
- Janela `.borderless` **não vira key window** por padrão, então nenhum atalho funciona — nem esc.
  Precisa de uma subclasse de `NSWindow` com `canBecomeKey` retornando `true`.
- `applicationWillTerminate` não devolveu o brilho de forma confiável, e um `kill` pula esse callback
  de qualquer jeito. O restore virou explícito no ponto de saída, com o delegate e um
  `DispatchSourceSignal` (SIGTERM/SIGINT/SIGHUP) como redes. Sem isso a tela fica presa no brilho
  máximo depois que o app morre.

Relacionado: [[tanpzwhisper-build-sem-xcode]], [[hora-de-fazer-dinheiro]]
