---
name: feedback-21st-sempre
description: 21st.dev and other paid libraries are mandatory for UI work; check the 21st tier first
metadata:
  type: feedback
---

tanpz (19/11/2026): "seria obrigatório usar sempre se temos e pagamos pra isso diversas bibliotecas". Every UI/interaction piece starts from 21st.dev (and his other paid libraries), adapted to the project tokens.

**Why:** he pays for them and hates hand-made components that already exist.
**How to apply:** call mcp__21st__get_usage at the start of UI work. On 19/11 the MCP (OAuth, url https://21st.dev/api/mcp) was logged into a FREE account (2 retrievals/day, no AI) although he pays; told him to re-auth with /mcp using the paid account. If still free, say so and use the 2 retrievals on the highest-impact pieces.

Update 19/11: he called the whole Forja "basicão, feio, tipografia fraca" and said only the red aurora background came from 21st.dev. Every screen (shell, sidebar, cards, library grid, sheets, inputs, buttons, typography, loaders, empty states) must be built from 21st.dev components adapted to our tokens, modeled on the reference site he sends. Never hand-roll a component 21st already has.

19/11: "não é só componente, é literalmente usar tudo". Ele quer Liquid Glass (Apple) dentro da Forja, fundo em shader, motion, efeitos. Implementado: src/Vidro.tsx (refração real, 21st manuarora700/liquid-glass), src/Fundo.tsx (mesh gradient WebGL vinho), .vidro/.vidro-liquido no index.css.
**Why:** acha a interface básica sem os efeitos de material e luz.
**How to apply:** toda tela nova usa Vidro/.vidro sobre o shader; nunca pôr filter/opacity fixo num pai de vidro (mata o backdrop); buscar no 21st também shaders, fundos, efeitos de texto e material, não só componentes.
