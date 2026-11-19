---
tipo: framework
tags: [marketing, tráfego-pago, testes, media-buying, escala]
---

# Metodologia de validação e escala de tráfego pago por CPA manual

Abordagem manual de tráfego pago, alternativa ao [[bidcap-escala-por-limite-de-lance|bidcap]] (que delega a decisão de verba ao algoritmo com alto volume de criativos). Aqui o gestor decide ativamente, criativo por criativo, com base em CPA e margem — batizado de "day trade" de tráfego pela origem deste framework.

**Validação (dias 1 a 3, por criativo)**:
- Orçamento inicial por conjunto = ~2x o ticket médio da oferta (garante consumo suficiente mesmo fora do pico de consumo de rede social).
- Dia 1: só compra dados, nenhuma decisão é tomada — amostra pequena demais.
- Dia 2: precisa ter vendido ao menos uma vez, senão o conjunto morre.
- Dia 3: precisa vender com ROI mínimo de 1,5, senão também morre.

**Pré-escala (dia 4 em diante)**: sobreviventes dobram o orçamento do conjunto original e são isolados numa estrutura separada com orçamento ~3x o ticket, pra validar se aguentam volume maior sem perder conversão. Só depois disso o gestor "empilha campanhas" (duplica a estrutura validada para somar volume).

**Escala contínua**: orçamento tratado como variável de teste em si (não só CPC/CPM/CTR) — testar valores de orçamento inicial diferentes (R$50 a R$1.200+) é parte do processo. O ajuste diário é manual, em cima do CPA vs. margem: CPA dentro da margem, aumenta orçamento; margem cai, reduz — pode significar saltos grandes num mesmo dia (ex.: de R$800 pra R$6.500) quando a conta está aguentando.

**Contraste com "escala baiana"**: estratégia concorrente de subir muitos conjuntos (50–250) com o mesmo criativo em orçamento baixo (R$3–7 cada), otimizando no nível da campanha, não do conjunto — mais próxima do espírito do [[bidcap-escala-por-limite-de-lance|bidcap]]/[[volume-de-criativos-supera-otimizacao-individual|volume de criativos]]. Nenhuma das duas abordagens é superior de forma permanente: performance de fonte de tráfego é volátil mês a mês, então testar e comparar continuamente é mais confiável que se casar com uma tese.

## Variante: três camadas fixas (ABO teste → CBO pré-escala → bidcap final)

Outra operação (perpétuo White de infoproduto) usa uma versão mais rígida do mesmo espírito, com três camadas nomeadas e orçamento fixo por camada em vez de ajuste diário caso a caso:

1. **ABO "gaveta" de teste**: todo criativo novo sobe isolado com meio ticket de orçamento (produto de R$200 → R$100), roda 2-3 dias; se gastou o ticket inteiro sem vender, é desativado (a menos que métricas intermediárias, como custo por checkout iniciado, estejam muito boas).
2. **CBO de pré-escala**: os que validaram (ROI acima de 2) sobem juntos (2-5 por vez) para uma CBO com 1,5-2x o ticket de orçamento, só para confirmar se aguentam volume maior — o Facebook decide sozinho a distribuição entre eles.
3. **Escala final com meta de custo/limite de lance**: campanhas validadas são recriadas usando "meta de custo por resultado" ou "limite de lance" (equivalente ao [[bidcap-escala-por-limite-de-lance|bidcap]]) em vez do objetivo padrão de maximizar conversões — aceitam orçamento bem maior e escalam mais estável.

Regra adicional dessa variante: nunca desativar um criativo que já está dando ROI só para "abrir espaço" pra campanha de escala — testado e revertido, porque já custou vendas boas no passado. E antes de concluir que uma oferta/VSL não valida, produzir pelo menos 10 criativos — com poucos (2-3) não dá pra saber se o problema é o criativo ou o funil.

## Variante: CBO com 3 hooks por criativo, gasto de 1 ticket em 2 dias

Outra operação (VSL de tráfego direto pra experts) usa uma estrutura mais simples pra validar de 10 em 10 criativos: sobe uma campanha CBO com 3 conjuntos de anúncio, cada um com os mesmos 3 hooks pro mesmo corpo de criativo, orçamento total equivalente a 1 ticket do produto (ex.: R$150 pra um produto de R$297), rodando por 2 dias — repete essa estrutura pra cada um dos 10 criativos da leva (30 variações no total: 10 corpos × 3 hooks).

Critério de validação: o criativo precisa gerar pelo menos 2-3 vendas dentro desse teste de 2 dias — um criativo que só empata ou fica com ROAS apertado (1.7-1.8) no teste não aguenta escala depois. Só criativos já validados avançam pra teste de lead nova (nunca sobe todos os 10 anúncios pra cada lead nova) — o criativo muda a própria taxa de conversão da VSL, não só o CPC: já registraram um criativo específico aumentar em 5 pontos percentuais a conversão do order bump, porque trazia um público mais qualificado pra dentro do funil.

Fontes:
- [[../podcasts/segredos-da-escala-160/11-processo-de-validacao-de-trafego-pago]], [[../podcasts/segredos-da-escala-160/12-orcamento-como-variavel-de-teste]]
- [[../podcasts/segredos-da-escala-140/14-metodologia-de-escala-de-trafego-abo-cbo]]
- [[../podcasts/segredos-da-escala-152/13-metodologia-de-teste-de-vsl-30-variacoes]]
