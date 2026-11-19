---
name: feedback-maquina-mesmas-regras
description: Máquina de Conteúdo jobs must follow exactly the same rules as chat sessions; no separate rule set
metadata:
  type: feedback
---

Every headless job of the Máquina de Conteúdo follows the same rules as tanpz's chat sessions: CLAUDE.md, SEGUNDO-CEREBRO, PLAYBOOK, APRENDIZADOS, CONTEXTO, this memory folder, and the product's skill (Stories Lab: motion-reel-premium + stories-ads.md, Sofia voice, excited emotion tags, dense motion).

**Why:** 18/11/2026 the Stories Lab test creative came out with the neutral default narrator and weak animation. He said: "a máquina tem que ter todas as regras que a gente tem aqui... não é pra ter nada de diferente lá."

**How to apply:** rules live in maquina/prompts/_regras.md, which `prompt()` in maquina.py prepends to every job prompt and which points to his live files, so new rules apply on their own. Never hardcode a separate rule copy in a job prompt. `bin/voz` forces Sofia whenever pedido.json mentions Stories Lab. Related: [[maquina-de-conteudo]], [[feedback-edicao-cortes]].

Update 18/11: the animado test was a generic template (red orb mascot I invented, same layout every line, gray cards, estimated captions, flat voice). I then wrongly locked the machine to the Stories Lab "Ganchos ilustrados" project as THE animated style; he rejected that hard ("a gente vai produzir de tudo quanto é tipo de coisa"). Correct model: there is no single template. Each job picks its style from its reference (chosen inspiration from the Inspirar tab, else the closest item in the style library), says which it modeled, and varies format between videos. Past projects (sl-ganchos, sl-criativos, zupi...) are a toolbox of technique; their look/copy only for their own product. Creative jobs run on opus.

Root cause found 18/11: maquina.py FERRAMENTAS allowlist had no Skill tool, no MCP (21st), no WebSearch/Agent, so headless jobs could not use any skill or MCP he set up. Fixed: allowlist now includes Skill, WebSearch, WebFetch, Agent, Task, mcp__21st, mcp__v0, curl, plus bin/som (ElevenLabs SFX/music). Verified with a headless test (loaded motion-reel-premium, 21st search returned results, read his voice rule). When adding a capability here, also add it to FERRAMENTAS, or the machine silently cannot use it. ElevenLabs/Canva claude.ai connectors are not visible to the CLI; ElevenLabs goes through bin/voz and bin/som (REST + .env key).

## Todo o conhecimento, não só regras (18/11)
tanpz: "todas as conversas, tudo que a gente fez, todas as decisões... todos os vídeos... todo o banco de dados". A máquina errou porque cada job roda numa pasta própria com memória vazia, o claude-mem não estava liberado e eu listava à mão só alguns arquivos.
**Como ficou:** `maquina/conhecimento.py` gera `CONHECIMENTO.md` antes de todo job (regras, memórias de TODAS as sessões, skills, vault, vídeos feitos, estilos, gerações com veredito em `geracoes/<id>/feedback.md`). `_regras.md` passo zero obriga ler o índice, buscar no claude-mem (consultas curtas, Chroma às vezes offline) e escrever `conhecimento-usado.md`. Depois do job roda `_revisar.md` (opus); reprovou, refaz uma vez com as correções; status `revisar` no painel mostra os problemas.
**How to apply:** veredito que ele der no chat sobre uma geração vira `geracoes/<id>/feedback.md` na hora. Fonte nova de conhecimento entra em `conhecimento.py`, nunca só no prompt.

## Copy aprovada antes da voz (18/11)
tanpz escolheu "para pra eu aprovar". Animado, criativo e modelar param no roteiro (status `aprovar-copy`); ele aprova no painel (botão Aprovar copy, rota /api/aprovar-copy) e só então a máquina gera voz, música e vídeo sem mudar palavra. Refazer zera a aprovação. Roteiro puro não tem voz, não para.
