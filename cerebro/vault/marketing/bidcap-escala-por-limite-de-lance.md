---
tipo: framework
tags: [marketing, tráfego, facebook-ads, escala]
---

# Bidcap: escalar soltando o controle do lance pro Facebook

Estratégia de tráfego pago no Facebook onde o gestor abre mão de decidir onde e quanto gastar, e delega isso ao algoritmo via limite de lance (bid cap) no nível do conjunto de anúncios.

Mecânica prática: reúne-se num único conjunto todos os criativos que "não foram horríveis" (excluem-se apenas os que já deram prejuízo grande em testes anteriores) — idealmente 40 a 60 criativos para começar, até ~20 por conjunto. O lance é configurado como o custo de aquisição atual + ~10%. Solta a campanha e deixa rodar sem mexer por pelo menos 3 dias. Depois disso: pausa-se o que deu prejuízo real (ex.: ROAS 0.7 tendo gastado 2-3 tickets do produto); para o que só empatou, reduz-se o limite de lance do conjunto (sem pausar o criativo), abrindo espaço de verba pros que já provaram lucro.

A vantagem central: quando se isola cada criativo com verba fixa ("um ticket por criativo"), o gestor força o Facebook a gastar mesmo no que é ruim. Quando se junta muitos criativos com lance limitado, o algoritmo distribui a verba desproporcionalmente pro que converte melhor — e se a oferta ou o criativo forem ruins, a campanha simplesmente não gasta (o próprio Facebook avisa isso). Essa estratégia só funciona com [[volume-de-criativos-supera-otimizacao-individual|volume insano de criativos]] — poucos criativos com bidcap trava e não sai do lugar.

- **Variante "orçamento total" (relato independente de operação de low ticket)**: em vez de orçamento diário, configura-se orçamento *total* de campanha = (10x o ticket do produto) × 30 dias, também com BidCap (uma conta mirando CPA ideal, outra mirando o valor do ticket). Pra escalar dentro desse modelo, não se mexe no orçamento total — reduz-se o prazo (de 30 pra 20 dias, por exemplo), forçando a campanha a gastar mais rápido por dia mantendo o mesmo teto; quando o prazo acaba, renova.
- **Cuidado ao multiplicar orçamento manualmente** (relato complementar, fora do BidCap): pular de um valor pro dobro de 10x de uma vez (ex.: R$10 → R$100) tende a "quebrar" a performance porque joga pra um público muito maior, ainda não pré-validado. Multiplicações de ~2-3x (ex.: R$300 → R$1.000) preservam melhor a performance — por isso escalar deve vir mais de somar campanhas/criativos/contas em paralelo do que de multiplicar bruscamente uma campanha só.

Fonte: [[../podcasts/segredos-da-escala-155/01-bidcap-escala-por-limite-de-lance]]

Fonte adicional: [[../podcasts/segredos-da-escala-159/16-orcamento-total-com-bidcap]]
