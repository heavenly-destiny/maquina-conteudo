---
name: minerar-ofertas
description: Use when tanpz asks to mine, find, research or "minerar" offers, products, funnels or scaled ads to model (Biblioteca de Anúncios da Meta, Reclame Aqui, organic feed). Produces a ranked table and a top 3 to model.
---

# Minerar ofertas

Objetivo: achar ofertas já escaladas para modelar. Entrega sempre em tabela + top 3.

## Fontes (usar todas que couberem)
1. Biblioteca de Anúncios da Meta (facebook.com/ads/library), país BR, todos os anúncios, palavras do nicho e termos de oferta ("garantia", "acesso imediato", "oferta", "só hoje", "R$").
   Scraper pronto: `~/Documents/lowticket-pesquisa` (scripts kw.js, lp.js, dom.js, agg.js; ler antes de reescrever qualquer coisa).
2. Reclame Aqui: muita reclamação recente = muito volume de venda. Ver nome do produto, plataforma e domínio.
3. Mineração orgânica no navegador: rolar o feed do Facebook, Instagram e Google, abrir todo anúncio com link, seguir até a página e o checkout. Quanto mais clica, mais o feed entrega ofertas parecidas.

## Sinais de oferta escalada (pontuar cada um)
- Dias ativo: anúncio com 30+ dias rodando é forte; 60+ muito forte.
- Quantidade de anúncios ativos da mesma oferta.
- Escala lateral: mesma oferta ou domínio em mais de uma página do Facebook (troca de conta e de página). Sinal muito forte.
- Mais de uma página de vendas levando para a mesma oferta; variações de página e de criativo.
- Checkout: plataforma, preço, order bumps, upsells.

## Processo (economizar token)
- Coleta em paralelo com subagentes rápidos (sonnet/haiku), um por fonte ou por palavra-chave. Cada um devolve só as linhas da tabela.
- O modelo principal deduplica por domínio/produto, pontua e ranqueia.
- Salvar prints dos criativos e das páginas numa pasta da mineração, com nome = oferta.

## Entrega
Tabela (markdown ou HTML local aberto no navegador):

| # | Oferta | Nicho | Página de vendas (link) | Checkout / preço | Criativos (links ou prints) | Anúncios ativos | Dias ativo (máx) | Páginas do FB rodando | Sinais | Potencial (0-10) |

Depois, TOP 3 para modelar. Para cada um: por que escala, ângulo e promessa usados, o que copiar, o que melhorar, e o primeiro passo (normalmente: engenharia reversa da página e dos 3 criativos mais antigos).

Ao final, registrar a mineração em `~/Documents/Claude-Projeto-Tanpz/APRENDIZADOS.md` (data, nicho, top 3).
