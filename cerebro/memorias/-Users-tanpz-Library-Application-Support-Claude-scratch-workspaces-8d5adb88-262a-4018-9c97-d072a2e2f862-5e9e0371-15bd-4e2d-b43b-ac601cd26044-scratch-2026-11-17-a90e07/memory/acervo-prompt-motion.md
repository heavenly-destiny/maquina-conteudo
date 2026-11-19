---
name: acervo-prompt-motion
description: Catalog of all 240 prompt-motion.com motions (prompt, thumb, analysis, 1-5 usefulness) saved locally + published artifact
metadata:
  type: reference
---

On 2026-11-17 the whole prompt-motion.com library (240 entries) was scraped and analyzed for the user's 9:16 split-screen cuts.
- Local: ~/Movies/maquina-conteudo/estilos/prompt-motion/ (README.md = 27 detailed prompts rated 4+, catalogo/data.json = all entries with prompt + titulo_pt/o_que_faz/tecnica/melhor_para/encaixe/retencao/relevancia/esforco, html/ raw pages, posters/ thumbs/).
- Published catalog: https://claude.ai/artifact/X1dSdk9hEm9dL6MgSxhAgv
- 207/240 prompts are a generic one-liner ("make a 15s showreel, go all out"); their analysis was inferred from title/tags, not from watching the video. Video URLs (media.prompt-motion.com/.../video.*.mp4) are in data.json if frame-level study is needed.

**How to apply:** when picking motion for a cut, query data.json by melhor_para + relevancia; borrow technique only, per [[feedback-edicao-cortes]]; see [[biblioteca-de-estilos]].
