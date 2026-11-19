---
name: modelagem-de-referencia
description: Use when building a product that should match or replicate existing apps (Miro, Notion, ClickUp, Gather, Figma, Linear, Slack, etc.) - extracts exact interaction, visual and data-model specs from the reference apps BEFORE writing any code, so the build is based on evidence instead of assumption.
---

# Modelagem de referência

Antes de construir qualquer coisa que se compare a um app existente, extraia a
especificação real desse app. Escrever código a partir de memória ou de intuição
produz um clone raso que erra justamente nos detalhes que fazem o original
funcionar.

## A regra

**Nenhuma linha de código de uma feature "igual ao X" antes de existir a
especificação do X.** Se o usuário pedir pra pular essa etapa, pule — mas diga
numa linha o que está sendo assumido sem evidência.

## O que extrair, sempre

Para cada app de referência, produza um documento com estas sete seções. Uma
seção sem dado deve dizer "não encontrei", nunca ser preenchida por dedução.

### 1. Modelo de dados
Quais são as entidades e como se relacionam. Esta é a seção que mais muda o
código e a que mais se erra de cabeça. Exemplo real: no ClickUp a coluna do
quadro não é a verdade — ela é um agrupamento sobre o campo `status` da tarefa,
e o agrupamento é trocável. Quem modela "coluna com lista de cartões" já nasce
errado.

### 2. Interações, gesto por gesto
Como cria, como seleciona, como move, como redimensiona, como conecta, como
apaga. Com **atalho de teclado exato** de cada ação. Inclua o que acontece no
hover, no arraste, no duplo clique, no clique longo.

### 3. Números
Dimensões padrão em px ou dp, limites de zoom, raio de proximidade, teto de
itens, profundidade do desfazer, quantidade máxima de cada coisa. São esses
números que fazem a cópia parecer a coisa ou parecer imitação.

### 4. Cores e tipografia
**Hex exato**, não "azul parecido". Nome da fonte, escala de tamanhos, escala de
espaçamento, raio de borda, sombra. Procure o design system público do produto
(Mirotone, Primer, Polaris, Material) — costuma ter os tokens publicados.

### 5. Layout da tela
Onde fica cada barra, o que é fixo, o que flutua, o que é contextual. Um mapa em
ASCII resolve e é fácil de conferir depois.

### 6. Limites e reclamações
O que o app **não** faz, e o que os usuários reclamam há anos em fórum. Isso vale
tanto quanto a lista de recursos: mostra onde existe espaço real pra ser melhor,
e evita copiar uma limitação achando que é decisão de design.

### 7. Fontes
URL de cada afirmação. Separe o que é documentação oficial do que é fórum ou
review — e marque o não-oficial como não-oficial.

## Como extrair

Em ordem de confiabilidade:

1. **Documentação de desenvolvedor** (SDK, API) — é onde estão os valores
   exatos: dimensões padrão, enums, defaults. Quase sempre melhor que a central
   de ajuda.
2. **Design system público** do produto — tokens de cor, fonte, espaçamento.
3. **Central de ajuda oficial** — comportamento e atalhos.
4. **Usar o app**, se houver acesso. Extraia a barra de ferramentas pelo DOM
   (`aria-label`, `title`) em vez de adivinhar por ícone. Teste os gestos de
   verdade: crie, arraste, redimensione, desfaça.
5. **Fórum da comunidade e reviews** — para limites não documentados e
   reclamações. Marque como não-oficial.

Rode uma frente por app, em paralelo, quando forem vários.

## Regras ao usar o app de outra pessoa

- Trabalhe num espaço descartável. Se não der, **não modifique nada**.
- Se modificar sem querer, desfaça na hora e avise.
- Nunca copie código-fonte, asset ou texto proprietário. Especificação de
  comportamento e medida é o que se extrai; implementação é sua.

## Depois da extração

Antes de codar, escreva uma seção de decisão respondendo:

- **O que copiamos igual**, porque já é o padrão que a pessoa espera (atalhos
  consagrados, gestos universais).
- **O que fazemos diferente**, e por quê.
- **O que não fazemos**, e o que entra no lugar.

E a pergunta que corta escopo: **isso aproveita alguma vantagem que só o nosso
produto tem?** Se a resposta for não, integrar o app pronto costuma bater
reescrever uma versão pior dele.
