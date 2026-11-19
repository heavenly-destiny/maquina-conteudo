---
name: hora-de-fazer-dinheiro
description: "Atalho \"hora de fazer dinheiro\": hook global que toca Happy Nation e dispara 30s de notificações de venda da Kiwify; a permissão de notificação é um passo de GUI que pode cair a cada recompilação."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9134db99-8a3f-4881-ab02-6a223bb8cbb7
  modified: 2026-08-31T22:57:20.373Z
---

Criado em 2026-08-31. Falar "hora de fazer dinheiro" em qualquer prompt dispara um hook
`UserPromptSubmit` global (`~/.claude/settings.json`, `async: true`) que roda
`~/.claude/scripts/hora-de-fazer-dinheiro.sh`: toca Happy Nation no Spotify e, por 30 segundos,
solta banners de venda com o som de notificação da Kiwify (`~/.claude/assets/venda-yt.wav`, baixado
do YouTube — só o cliente `mweb` do `yt-dlp` passou, os outros deram 403).

Os banners vêm de `/Applications/Kiwify.app`, um app mínimo em Swift que existe só para emprestar
nome e ícone à notificação — `osascript display notification` sempre mostra o ícone do Script
Editor, não dá para trocar por parâmetro. Ele aparece nos Ajustes do Sistema como **"Kiwify
Vendas"** (bundle `com.tanpz.kiwify-pix`), nome escolhido para não se confundir com a linha do app
real da Kiwify que aparece via Espelhamento do iPhone.

Duas armadilhas que custaram tempo:

- A permissão de notificação **nunca é pedida sozinha** para esse app: as três variações testadas
  (cert local e ad-hoc, três bundle ids diferentes) responderam
  `Notifications are not allowed for this application` sem mostrar diálogo. O tanpz teve que ligar
  a linha "Kiwify Vendas" na mão nos Ajustes. Como a assinatura é ad-hoc, recompilar o app pode
  derrubar esse grant — se os banners voltarem sem o ícone verde, é isso, e o script cai sozinho
  num banner comum via `osascript`.
- `awk` no locale pt_BR imprime `0,105` e o `afplay` lê isso como volume zero, ou seja, silêncio
  sem erro nenhum. O script força `LC_NUMERIC=C` na conta da rampa de volume.

Relacionado: [[tanpzwhisper-build-sem-xcode]]
