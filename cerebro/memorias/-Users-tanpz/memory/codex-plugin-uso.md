---
name: codex-plugin-uso
description: Codex CLI instalado e logado; como o plugin codex@openai-codex é usado e configurado nesta máquina.
metadata: 
  node_type: memory
  type: project
  originSessionId: 2276b90e-026a-49c0-b8ef-7122bc0c7293
  modified: 2026-08-14T18:16:20.266Z
---

Codex CLI 0.147.0 instalado via `brew install codex` (`/opt/homebrew/bin/codex`), logado com a conta ChatGPT desde 2026-08-14. O plugin `codex@openai-codex` está pronto (`/codex:setup` retorna `ready: true`). Config em `~/.codex/config.toml`: `model = "gpt-5.5"`, `model_reasoning_effort = "high"`.

**Why:** o trabalho pesado do Codex roda na cota do ChatGPT, não no contexto do Claude — só o output final volta (~450 tokens num review de 1 arquivo). São dois orçamentos separados, e usar o Codex aproveita uma cota que estaria parada. O review gate (`/codex:setup --enable-review-gate`) ficou **desligado** de propósito: o README do próprio plugin avisa que ele pode criar loop longo e drenar limite de uso rápido.

**How to apply:** `/codex:review --background` para diff multi-arquivo (`--wait` só para 1-2 arquivos); `/codex:adversarial-review` sempre com texto de foco depois das flags, senão desperdiça o comando; `/codex:rescue` só depois de eu errar duas vezes no mesmo bug. `/codex:transfer` exporta a sessão Claude inteira para uma thread Codex resumível — é o caminho para "Claude planeja, Codex constrói". Em teste controlado ele achou 3 bugs de valor monetário mas passou batido num `ZeroDivisionError` de lista vazia: pega erro de lógica, não substitui teste de input. Ver [[setup-plugins-claude-2026-08]].
