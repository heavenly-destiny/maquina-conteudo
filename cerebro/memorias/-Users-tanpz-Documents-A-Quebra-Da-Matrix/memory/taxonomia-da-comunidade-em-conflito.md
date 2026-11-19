---
name: taxonomia-da-comunidade-em-conflito
description: A Comunidade tem duas taxonomias de post brigando entre o protótipo e a spec do cofre — decisão ainda não batida em 12/08/2026
metadata: 
  node_type: memory
  type: project
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-12T21:37:38.155Z
---

Em **12/08/2026** a Comunidade tem **duas taxonomias de post coexistindo**, e
ninguém escolheu uma:

| Onde | Taxonomia | Classe CSS |
|---|---|---|
| Timeline nova do refinado | `Geral · Dúvidas · Indicações · Vagas` | `.cat-chip` |
| Tela de post aberto + post fixado das Regras | `Pergunta · Resultado · Recurso` | `.int` |

Na prática o usuário clica num card marcado **"Dúvidas"** e abre uma tela que diz
**"Pergunta"**. E o post fixado ensina *"escolha a aba certa: pergunta, resultado
ou recurso"* — abas que não existem na tela.

**O conflito de escopo:** a taxonomia nova traz `Vagas` de volta pra Comunidade,
mas a tabela *"O que a Comunidade NÃO é"* diz **"Mural de vagas → isso é o
Mercado de Trabalho"**, e a **D28** do Log de Decisões justificou cortar a quarta
aba exatamente com *"aqui 3 bastam porque vaga é no Mercado"*.

Também virou **markup morto**: `.why-see` ("porque você está na tribo X") e
`.joinrow` (entrar na tribo pelo card — a **D33**) estão marcados `only-refino`
dentro de um `<article class="card post only-hoje">`, então nunca renderizam no
refinado. Duas decisões da spec que não aparecem em lugar nenhum.

**Why:** a taxonomia nova veio do rascunho do Iuri + referência Vibehub e é mais
forte (fórum de verdade, com título e corpo). Mas ou a D28 caiu e o Log está
desatualizado, ou a timeline entrou sem passar por essa checagem.

**How to apply:** não escrever copy nem desenhar tela nova da Comunidade antes de
bater essa decisão. Quando bater, atualizar o Log de Decisões e a spec do cofre
junto. Ver [[prototipo-e-o-entregavel]].
