---
name: usar-claude-in-chrome-para-navegador
description: "Qualquer trabalho de navegador nesta máquina é com Claude in Chrome, não com Playwright"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c7f23ab2-3514-4be3-903c-82f102c194c3
  modified: 2026-08-14T17:51:38.271Z
---

Dito em **14/08/2026**: usar **sempre o Claude in Chrome** (`mcp__claude-in-chrome__*`) para
abrir página, clicar, ler console ou tirar screenshot. Não usar o Playwright MCP, mesmo quando
ele parece mais direto.

**Why:** o Chrome dele já está logado no app de produção e é o mesmo navegador que ele está
olhando — o Playwright sobe um perfil separado, sem sessão, e ainda bloqueia `file://`.

**How to apply:** invocar a skill `claude-in-chrome` antes das ferramentas, carregar o conjunto
todo numa chamada só de ToolSearch, e criar aba nova em vez de reaproveitar a dele. Para abrir
o protótipo local, `file://` não funciona: subir `python3 -m http.server` na pasta e abrir por
`localhost` — lembrando que esse servidor não manda charset, então acento aparece quebrado ali
e isso não é bug do arquivo.
