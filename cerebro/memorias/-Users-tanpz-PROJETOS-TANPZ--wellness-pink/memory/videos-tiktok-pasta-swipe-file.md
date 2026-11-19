---
name: videos-tiktok-pasta-swipe-file
description: "Vídeos do TikTok vão na pasta VIDEOS TIKTOK do projeto e são renomeados com base no frame visto"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ecce85a7-638e-43ad-b80e-e56a38a48426
  modified: 2026-07-31T22:00:14.684Z
---

Todo vídeo baixado do TikTok (via `yt-dlp`) deve ser salvo em uma pasta chamada
`VIDEOS TIKTOK` dentro do projeto wellness pink (não em `~/Downloads`) **e renomeado com uma
descrição do que aparece no vídeo**, não só perfil + ID.

**Why:** o usuário baixa esses vídeos como swipe file de referência de criativo para o DZI
(hooks, ângulos, estrutura de vídeo curto). Nome só com perfil e ID é ilegível na hora de
procurar uma referência específica no meio de vários arquivos — ele precisa bater o olho na
pasta e saber qual vídeo é qual sem abrir.

**How to apply:** depois de baixar, extrair um frame, olhar com a tool Read, e renomear:

```
mkdir -p "VIDEOS TIKTOK"
yt-dlp -P "VIDEOS TIKTOK" -o "%(uploader)s-%(id)s.%(ext)s" "LINK"
ffmpeg -y -ss 2 -i "VIDEOS TIKTOK/ARQUIVO.mp4" -frames:v 1 -q:v 2 /tmp/frame.jpg
```

Renomear com **apenas a descrição visual em kebab-case** — sem uploader, sem ID, sem números
no fim. Exemplo real: `mulher-bebendo-galao-agua-academia.mp4`. O usuário pediu explicitamente
para tirar o sufixo de perfil + ID em 2026-07-27: o nome tem que ser só o que ele lê e
entende, sem ruído. Pegar o frame a partir de ~2s evita frame preto de abertura.

Vídeos vêm em HEVC/h265 do TikTok — se der problema no editor ou no upload pro Meta Ads,
converter com `ffmpeg -i entrada.mp4 -c:v libx264 -crf 18 -c:a copy saida.mp4`.

**Se o yt-dlp falhar com "Unable to extract universal data for rehydration":** não é bloqueio
de bot (isso já foi corrigido instalando `curl_cffi` na venv do yt-dlp via
`/opt/homebrew/Cellar/yt-dlp/*/libexec/bin/python3 -m pip install curl_cffi`) — é o parser do
yt-dlp não reconhecendo a estrutura da página pra esse vídeo específico. Contorno manual:
1. `curl -sL -c /tmp/tt_cookies.txt -A "<UA de navegador>" "<url do tiktok>" -o page.html`
2. Extrair `__DEFAULT_SCOPE__.webapp.video-detail.itemInfo.itemStruct.video.playAddr` do JSON
   dentro de `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">`
3. Baixar esse `playAddr` com `curl -b /tmp/tt_cookies.txt -e "<url do tiktok>" -A "<mesmo UA>"`
   (precisa dos cookies da sessão que carregou a página — sem eles dá 403 Access Denied)

O `playAddr` costuma vir em resolução mais baixa (ex.: 464x688) que o download normal do
yt-dlp. O `downloadAddr` do mesmo JSON teoricamente seria melhor qualidade, mas exige
autenticação que não replica via curl simples (403) — não vale o tempo tentar.

Relacionado: [[dzi-lancamento-clube-fundadoras]]
