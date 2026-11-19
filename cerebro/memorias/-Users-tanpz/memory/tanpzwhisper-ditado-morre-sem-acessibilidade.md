---
name: tanpzwhisper-ditado-morre-sem-acessibilidade
description: "Quando o ditado do TanpzWhisper para de responder ao Option direito, a causa é a permissão de Acessibilidade caída — falha silenciosa, sem log nem HUD."
metadata: 
  node_type: memory
  type: project
  originSessionId: 98d03e0b-59b8-4be1-ba1f-3670bbb36460
  modified: 2026-11-16T21:07:25.972Z
---

O TanpzWhisper para de reagir ao hotkey (nenhum HUD, ícone da menu bar sem mudança) quando o macOS
derruba o grant de Acessibilidade do app. `NSEvent.addGlobalMonitorForEvents` não erra nem loga
nesse caso: ele simplesmente nunca recebe evento. Aconteceu em 2026-08-14 com o app rodando normal
(processo saudável, `sample` mostrava run loop ativo) depois de horas de ciclos de sleep/wake.

Receita de conserto:

```
tccutil reset Accessibility com.tanpz.TanpzWhisper
kill $(pgrep -f "MacOS/TanpzWhisper"); open -a /Applications/TanpzWhisper.app
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
```
e ligar o toggle na lista (etapa de GUI, não dá por CLI).

Dois detalhes que economizam tempo no diagnóstico:

- `CGGetEventTapList` **não** lista monitores `NSEvent` — usam outro mecanismo. Ausência do PID
  do app nessa lista não prova nada; foi a pista falsa que me custou tempo nesse dia.
- Rebuild não pede novo grant: o `build.sh` assina com a cert "Tanpz Local Code Signing", então o
  designated requirement fica preso ao certificado, não ao cdhash. Só o fallback ad-hoc custa
  re-aprovação.

Desde 2026-08-15 o app tem auto-conserto: `syncMonitors()` em `App.swift` com poll de 2s em
`AXIsProcessTrusted()`, que instala/remove os monitores conforme a permissão aparece ou cai. Se o
ditado morrer de novo sem que o grant tenha caído, a causa é outra.

Em 2026-08-31 apareceu a segunda causa, com o grant intacto: o log mostrava
`start ignorado: estado working` a cada tecla. O `stop()` drenava o analyzer inline
(`finalizeAndFinishThroughEndOfInput`, até 5s de timeout) segurando o estado em `.working`, e o
`guard state == .idle` de `start()` descartava em silêncio toda tecla apertada nessa janela — o
HUD abria e o áudio nunca era capturado. O conserto foi mover o estado de sessão para uma classe
`Session` dentro do `Dictation.swift`: `stop()` devolve o engine na hora (`session = nil`) e a
drenagem/reescrita/colagem seguem em segundo plano numa sessão própria, então a próxima tecla
começa na mesma hora. Quem escreve em `state`/`partial` depois da drenagem confere a identidade da
sessão antes, senão a sessão velha apagava o HUD da nova.

Terceira causa, 2026-11-16: o processo simplesmente não estava rodando (sem crash report, sem
log havia 3+ dias, uptime de 16 dias). O app não está nos itens de login, então se morre ou é
fechado não volta. Checar `pgrep -lf MacOS/TanpzWhisper` antes de qualquer outra coisa.

No zsh, `log` é builtin (dá "too many arguments" ou não imprime nada): usar sempre `/usr/bin/log show`.

Para testar sem falar: `CGEvent` de `flagsChanged` com keyCode 61 e flags `0x80040` (descer) /
`0x100` (subir) dispara o hotkey de verdade; vale desligar `autoPaste` nos defaults antes, senão o
teste cola texto na janela em foco.

Relacionado: [[tanpzwhisper-build-sem-xcode]]
