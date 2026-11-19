---
name: npm-global-prefix-home
description: npm global instala em ~/.npm-global (não /usr/local) — instalar CLI global sem sudo funciona.
metadata: 
  node_type: memory
  type: project
  originSessionId: 2276b90e-026a-49c0-b8ef-7122bc0c7293
  modified: 2026-08-14T18:15:57.727Z
---

Em 2026-08-14 o prefixo global do npm foi mudado de `/usr/local` para `~/.npm-global`, com `export PATH="$HOME/.npm-global/bin:$PATH"` acrescentado ao `~/.zshrc`.

**Why:** `npm i -g` falhava com `EACCES: permission denied, mkdir '/usr/local/lib/node_modules/...'` e o usuário não roda sudo nessas instalações. Foi o que quebrou a primeira tentativa de instalar o Codex CLI.

**How to apply:** `npm i -g <pacote>` agora funciona direto, sem sudo. Se um binário recém-instalado por npm não aparecer no PATH da sessão atual, exportar `PATH="$HOME/.npm-global/bin:$PATH"` antes do comando — shells já abertos não pegaram o `.zshrc` novo. Para binários que existem em fórmula do Homebrew, `brew install` continua sendo a via preferida (foi assim com codex, pyright e gh). Ver [[setup-plugins-claude-2026-08]].
