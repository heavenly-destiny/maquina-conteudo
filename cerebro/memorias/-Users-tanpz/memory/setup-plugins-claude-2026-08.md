---
name: setup-plugins-claude-2026-08
description: Estado e critério do setup de plugins do Claude Code do tanpz depois da revisão de 2026-08-14.
metadata: 
  node_type: memory
  type: project
  originSessionId: 2276b90e-026a-49c0-b8ef-7122bc0c7293
  modified: 2026-09-21T20:21:27.188Z
---

Em 2026-08-14 o setup de plugins foi revisado: 25 plugins, ~33.245 tokens sempre carregados por sessão, 2,3 GB de cache. Medição feita com `claude plugin details <plugin>` (linha "Always-on"), não por estimativa.

Entraram: typescript-lsp, pyright-lsp, php-lsp (custo 0 token cada), context7, supabase, semgrep, e os binários `gh` e `codex` fora do sistema de plugins. Saíram: agent-browser e o plugin chrome-devtools-mcp, mais 3,2 GB de cache órfão.

**Why:** o critério adotado foi capacidade por token, não contagem de plugins. LSP e binários de CLI entram porque custam zero contexto; duplicata comprovada sai. O `marketing-skills` custa 13.004 tokens — 39% do orçamento fixo, mais que todos os outros somados — e mesmo assim ficou, junto com social-media-skills, taste-skill e hyperframes, porque marketing/VSL/design são o produto do tanpz, não acessório.

**How to apply:** antes de sugerir remover qualquer plugin, medir com `claude plugin details` e checar se ele serve ao negócio dele. Não propor cortar marketing-skills nem social-media-skills de novo — a decisão já foi tomada com o custo na mesa. O servidor MCP `chrome-devtools` roda direto via `npx` (registrado com `claude mcp add`), independente do plugin homônimo; ele ainda tem playwright e o Claude-in-Chrome nativo, então browser é área saturada. Ver [[npm-global-prefix-home]] e [[codex-plugin-uso]].

## Lista completa pra replicar em outra máquina (checado em 2026-09-21)

23 plugins habilitados em `~/.claude/settings.json` → `enabledPlugins`, cada um com marketplace em `~/.claude/plugins/known_marketplaces.json`:

- `claude-plugins-official` (anthropics/claude-plugins-official, oficial): superpowers, hyperframes, skill-creator, swift-lsp, vercel, supabase, typescript-lsp, pyright-lsp, php-lsp, context7, semgrep
- watch@claude-video (bradautomates/claude-video)
- claude-mem@thedotmack (thedotmack/claude-mem)
- superwhisper@superwhisper (superultrainc/superwhisper-claude-code)
- caveman@caveman (JuliusBrussee/caveman)
- ponytail@ponytail (DietrichGebert/ponytail)
- codex@openai-codex (openai/codex-plugin-cc)
- i-have-adhd@i-have-adhd (ayghri/i-have-adhd)
- taste-skill@taste-skill (leonxlnx/taste-skill)
- gsap-skills@gsap-skills (greensock/gsap-skills)
- last30days@last30days-skill (mvanhorn/last30days-skill)
- claude-hud@claude-hud (jarrodwatts/claude-hud)
- marketing-skills@marketingskills (coreyhaines31/marketingskills)
- social-media-skills@social-media-skills (charlie947/social-media-skills)

Marketplace `agent-browser` (vercel-labs/agent-browser) continua registrado em known_marketplaces mas o plugin tá desligado — não reinstalar.

Fora do sistema de plugins: `~/.claude/skills` tem 45 pastas soltas (ui-ux-pro-max, família hormozi/sub-*, codebase-memory, etc.) sem git remote — não vêm de marketplace, foram instaladas manual. Pra replicar, copiar a pasta inteira em vez de tentar reinstalar uma por uma.

CLI/binários: `gh` e `uvx`/`npx` via Homebrew/Node; `codex` vem do plugin codex@openai-codex. npm global (prefixo `~/.npm-global`, ver [[npm-global-prefix-home]]): supabase, typescript, typescript-language-server, vercel, intelephense.
