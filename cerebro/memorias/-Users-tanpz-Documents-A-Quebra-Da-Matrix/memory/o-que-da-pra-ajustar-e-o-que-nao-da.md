---
name: o-que-da-pra-ajustar-e-o-que-nao-da
description: "Veredito do conselho (12/08/2026) sobre os limites do mandato do time na Quebra da Matrix — o que é ajustável, o que é do Iuri, e a camada comercial órfã"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-13T00:39:12.234Z
---

Conselho rodado em **12/08/2026** (5 lentes: Contrário, Primeiros Princípios,
Expansionista, Forasteiro, Executor) sobre a pergunta *"o que dá pra ajustar
no produto e o que não dá?"*.

## Veredito

**Tela, estado e rota são do time. Economia — o que o produto premia e o que ele
cobra — é do Iuri. E o que trava o projeto é uma terceira camada, a comercial,
que não é de ninguém.**

## Dá pra ajustar (time decide sozinho)

Estados (vazio, erro, carregando) · rotas e navegação dentro da feature ·
hierarquia visual, densidade, cor, tipografia · microcopy e mensagens de
validação · ordem, filtro e busca dentro de uma feature · correção de bug.

**E mais do que o time pensa:** o app **derivou do desenho original sem registro**
— a sidebar foi de 8 pra 9 itens, "Fórum e Comunidade" virou "Comunidade",
"Área de Conteúdos" virou "Conteúdos" (P9). O *"não mexe"* está protegendo deriva
de construção, não intenção do Iuri. O jeito de obter licença é **mostrar a
deriva**, não pedir permissão.

## Não dá (é do Iuri)

O que o produto **premia** (XP por ação — a Q9 é dele) · o que cada plano libera
e quanto custa · nomes das seções e ordem da sidebar (dito explicitamente) ·
se existe placar/ranking (o produto irmão **matou** o dele — P1 sem resposta) ·
chat interno no Mercado (§14, é jurídico) · qualquer coisa que vire promessa
contratual (Indique e Ganhe, prêmios físicos).

**O time já passou dessa linha:** D27, D28, D32 e D35 definem o que o produto
premia. Desenhou economia sem poder definir o valor da moeda.

## A camada órfã (onde o projeto está travado)

Matriz de planos · cobrança · painel administrativo · CNPJ e razão social nos
Termos (M10). **Ninguém foi encarregado disso.**

E tem uma armadilha: pela ordem que o próprio Iuri declarou na transcrição
(*plataforma → oferta → lançamento → VSL*), a matriz de planos **ainda não tem
como existir** — ela depende da oferta, que vem depois. Cobrar a resposta é
cobrar o impossível. **O hedge é desenhar binário (liberado/travado), não matriz
de 3 colunas** — sobrevive à P6 dar "Gratuito × Pago".

## O risco mais letal

Refinar UI sobre um app que é casca: sem tela de post aberto, sem perfil público,
sem `/planos`, sem admin, sem aulas, sem CNPJ — e com a Vitrine exibindo ganho
por clique e taxa de reembolso enquanto o **§15** diz que a AQDM não rastreia isso
e o **§3** proíbe número estimado. Não é dívida de UI: é risco jurídico e
ausência de produto.

## Números que sustentam

- **3 de 36 decisões** (D01–D36) mudam de fato alguma tela. O resto é restrição,
  processo ou adiamento explícito.
- No lote D27–D36 ("fechamento da Comunidade"): 1 verde, 7 amarelas, 2 brancas —
  9 pendências novas ao "fechar" uma feature.
- **77 regras ⬜ e 86 estados abertos** espalhados por 13 arquivos, contra a D02
  (*"uma feature por vez"*), que é 🟢.
- Nenhuma próxima reunião marcada em lugar nenhum do cofre.

**Why:** o time estava tratando como ajustável o que é refém (features rio abaixo
da oferta) e como intocável o que na verdade derivou sozinho (nomes e estrutura).

**How to apply:** antes de propor mudança, classificar em qual das três camadas
ela cai. Se for economia ou comercial, não desenhar — perguntar. Se for tela,
seguir e registrar o porquê. Ver [[proximo-passo-tela-de-post-aberto]] e
[[iuri-nao-gosta-de-muitas-cores]].
