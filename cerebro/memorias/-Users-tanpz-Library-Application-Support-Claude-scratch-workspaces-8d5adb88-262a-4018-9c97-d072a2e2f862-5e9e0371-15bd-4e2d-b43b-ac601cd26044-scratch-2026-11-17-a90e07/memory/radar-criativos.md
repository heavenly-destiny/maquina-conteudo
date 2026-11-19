---
name: radar-criativos
description: Free method to find scaled ads (Meta Ad Library) + viral shorts + HyperFrames catalog; data saved in estilos/
metadata:
  type: reference
---

Built 2026-11-17. Page: https://claude.ai/artifact/6fGgTYfENcifgVEjqGknrC
- Scaled ads: Meta Ad Library works without login. URL params `country=BR&media_type=video&active_status=active&sort_data[mode]=total_impressions&sort_data[direction]=desc&q=...`. Scale proxy = days running + "N anúncios usam esse criativo" (no spend data for commercial ads). `yt-dlp "https://www.facebook.com/ads/library/?id=ID"` downloads video + full ad copy (description); rate-limits (429) fast, sleep ~25s between ids. Hooks transcribed with whisper (first 30s). Files: ~/Movies/maquina-conteudo/estilos/anuncios/ (lista.tsv, videos/, hook/, analise.py).
- Viral shorts: `yt-dlp --flat-playlist "ytsearch40:q"` gives view counts; list in estilos/virais/virais.json (edit style NOT verified by watching).
- HyperFrames: `npx hyperframes catalog --json` = 448 free blocks/components; curated 53 in estilos/hyperframes/selecao.json + notas.py. `templates` cmd is Pro (paid), skip per [[maquina-de-conteudo]] free rule.

Update 2026-11-17: the Radar and the acervo were merged into one hub (same artifact URL) with five sections: Motion viral, Edição viral, Anúncios, HyperFrames and Acervo. The top filter picks by goal (Venda / Orgânico / Motivacional). The user called the first version "feio".
- Data: ~/Movies/maquina-conteudo/estilos/hub.json, built by build_hub.py. Page: estilos/biblioteca.html.
- Motion viral: estilos/motion-virais/motion.json holds 58 items, each verified by a 6-frame contact sheet in sheets/.
- YouTube bot block: yt-dlp needs `--extractor-args "youtube:player_client=android,mweb"`.
- Gap: viral Shorts that are pure motion design are rare. Most items are 16:9, and the views on Base44 and Duolingo are mostly paid promo.
