---
name: maquina-v2-produto
description: tanpz's product vision for Máquina de Conteúdo v2 (18/11/2026): Higgsfield/OpusClip-style app, sidebar sections, profile onboarding, carousel generator, model choice
metadata:
  type: project
---

Vision dictated by tanpz on 18/11/2026 for the Máquina de Conteúdo (to sell/hand to other people):
- Layout like Higgsfield / OpusClip: very intuitive, big result blocks, every click and setting the user needs is inside the tool.
- Input: paste a link (to model/copy) OR upload the raw video file.
- Account setup (onboarding): connect own Claude + voice (done), plus profile: niche, a short audio describing what they do, their content style, so the AI tailors everything.
- Left sidebar with sections: Criativos (direct-response ad production only); Conteúdo (organic: Instagram, TikTok, YouTube, incl. long-form editing for YouTube/Instagram in the same place); Carrosséis (generator up to 10 images that connect seamlessly, swipe feels like one continuous image).
- Model picker for generation; default to the cheapest model (free if possible) that keeps the result.
- Layout choice at generation time (Dividida / Tela cheia; horizontal wide raw can be cropped to vertical if quality allows).
- Before EVERY generation the AI must load all skills, the whole brain (rules, learned mistakes) — see [[feedback-maquina-mesmas-regras]].
- Style library (aslaniedits etc.) is reference so the machine can edit any style; not rules for his own content.

**Why:** he wants a product-grade tool other people use, not a personal script.
**How to apply:** design from real Higgsfield/OpusClip references first; keep wine/red identity and approved screens (generation, animation, SFX approved 18/11). Related: [[maquina-de-conteudo]], [[feedback-painel-minimalista]].

Formats (18/11): the machine must know many video formats and adapt any of them to any niche: question box (caixinha de pergunta, mostly native Instagram), many split-screen variants, "historinha" story videos with little characters (pixel art, 2D, 3D, very hyped now), plus the aslaniedits families. Acervo collects examples of each format; the AI picks/adapts per user niche.

OpusClip reverse engineering (18/11): bring all OpusClip settings into the machine (caption templates, edit formats/layouts, reframe, etc.). Spec being built at ~/Movies/maquina-conteudo/estilos/opusclip-re/ESPEC.md.

Business model (18/11): later sold as a SUBSCRIPTION (bundled with his community and also standalone). Subscribers will NOT pay for any AI themselves — they use the system, so every AI cost is tanpz's. Therefore: per-video cost must be very low; always the fastest generation that keeps quality; pick cheapest models (free/open where possible); this conflicts with the current "each user connects own Claude" onboarding — revisit when designing hosting (decide later, he said "isso é de se pensar depois").
Integrated editor: user can edit a specific part of their video inside the app (OpusClip-like).

**Status 2026-11-18:** Configurar screen (OpusClip Recipe) live: file or pasted link opens it; choices go to `entrada/<video>.config.json`, then to `j.e["config"]`, then into the planejar/cortar prompts as `{{config}}`. Model picker: Econômico = sonnet/sonnet, Equilibrado = opus/sonnet, Máximo = opus/opus. Formats library (37 viral videos, estilos/formatos/FORMATOS.md) is in Inspirar under "Formatos". Next: results gallery with score, caption editor, profile onboarding, Carrosséis, integrated editor.

**Organization (tanpz, 2026-11-18):** Criativos organized by niche and by status (Em teste / Validados). Conteúdo has categories (Motivacional, Técnico, etc.) that appear as the person creates, not a fixed list. Every video must have a delete option inside the panel (goes to Trash, in-page confirm).

**Music library (tanpz, 2026-11-18):** the machine needs a library of the most viral Instagram Reels songs (estilos/musicas/). Songs are a reference (mood, BPM, drop); the final IG post uses the native trending audio, and renders use a similar royalty-free bed. No full copyrighted downloads.
Music is grouped by video style (one track type per style); the user picks the track in the app (Configurar) when generating.

- 18/11/2026: Músicas DONE (estilos/musicas: 85 faixas, 13 estilos, Em alta auto 24h, busca Deezer/iTunes). Configurar tem seção Trilha (A IA escolhe / estilo / faixa com prévia / Sem trilha) que vai pro prompt via maquina.trilha_txt(). WhatsApp send needs Chrome 'Permitir JavaScript dos Eventos da Apple' (he must turn on).
