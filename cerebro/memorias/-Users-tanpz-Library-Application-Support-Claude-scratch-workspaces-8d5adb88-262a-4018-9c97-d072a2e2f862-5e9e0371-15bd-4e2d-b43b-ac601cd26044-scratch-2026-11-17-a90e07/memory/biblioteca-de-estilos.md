---
name: biblioteca-de-estilos
description: "Edit style is chosen per category (criativo direct response / conteúdo orgânico / motivacional), each built from reference videos the user sends"
metadata:
  node_type: memory
  type: project
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-17T21:53:31.523Z
---

Since 2026-11-17 the user is sending reference videos per category. Each edit must follow the style of its category, and the user may name the style per job.
- Categories: criativo-direct-response (ads / venda), conteudo-organico (technical/organic content), motivacional (motivational / life advice). More may be added.
- Library lives in ~/Movies/maquina-conteudo/estilos/<categoria>/ with referencias/ (downloaded refs) and a style spec distilled from them (cuts, captions, motion, transitions, SFX, music, pacing).
- Build specs by reverse-engineering each reference frame by frame (reverse-any-video / watch skills), copying technique, not brand.

**Why:** one look does not fit ads, organic and motivational content.
**How to apply:** before editing any cut, ask or infer its category and load that style spec; see [[feedback-edicao-cortes]], [[maquina-de-conteudo]].

Update 2026-11-17: the user's first batch of references arrived. It was 24 Instagram reels plus 1 carousel, sent to his own WhatsApp chat "Tanpz (você)" in the Mac Chrome ("Browser 1", not the Windows ones).
- Files: estilos/instagram-refs/ (videos, sheets, analise.json).
- Specs written: conteudo-organico/spec.md, criativo-direct-response/spec.md, motivacional/spec.md, tecnicas-motion.md, carrossel.md.
- Patterns he wants:
  - Captions: word-by-word kinetic text with blur, with the keyword shown through a 2-3x scale contrast and an accent color or italic serif.
  - Color: one accent color.
  - Motion: glass cards that recreate the tool's UI, plus proof cards synced to the spoken word.
  - Pacing: no intro.
- How to fetch the links: future WhatsApp batches are links he sends to himself. Read them by scrolling the chat and collecting the `[data-pre-plain-text]` anchors. Strip query strings, or the output gets blocked. yt-dlp downloads reels without login.
