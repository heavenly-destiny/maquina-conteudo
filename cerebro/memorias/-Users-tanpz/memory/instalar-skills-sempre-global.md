---
name: instalar-skills-sempre-global
description: "Preferência do usuário — instalar skills/CLIs do Claude Code sempre no escopo global (~/.claude), não por projeto"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 60a6a659-62b3-423d-b36e-e2b298258fa1
  modified: 2026-08-01T01:48:33.499Z
---

Quando o usuário pedir pra instalar uma skill, plugin ou CLI que integra com o Claude Code (ex: `uipro init`, ou similares que suportam escopo projeto vs. global), preferir o escopo **global** (`~/.claude/...`) por padrão, não o escopo local de um projeto específico (`.claude/` dentro do repo).

**Why**: o usuário disse explicitamente que quer que "tudo que instalar já instale pra usar em tudo que quiser" — ele pensa em skills como parte do seu ambiente Claude Code como um todo, não amarradas a um projeto específico. Isso veio depois de eu ter instalado o `ui-ux-pro-max-cli` primeiro no projeto `tanpz_machine` (`.claude/skills/`) e ele pedir pra reinstalar com `--global` pra funcionar em qualquer projeto.

**How to apply**: ao rodar instaladores de skill (via npx/CLI), checar se existe uma flag tipo `--global`/`-g` ou equivalente e usá-la por padrão, sem precisar perguntar — a menos que o pedido do usuário deixe claro que é algo específico daquele projeto (ex: uma skill que só faz sentido pro contexto daquele repo). Se a ferramenta não suportar escopo global nativamente, mencionar isso ao usuário em vez de assumir escopo local silenciosamente.
