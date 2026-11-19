---
tipo: tema
tags: [marketing, testes, otimização, vsl]
---

# Onde há mais tráfego, há mais saturação: priorização de testes num funil de VSL

Princípio para decidir o que testar primeiro dentro de um funil: quanto mais cedo no funil (mais volume de tráfego passando por ali), mais rápido aquele elemento satura. Um criativo satura mais rápido que uma headline, que satura mais rápido que uma lead, que satura mais rápido que o bloco de história.

Consequência prática: o bloco de história de uma VSL quase nunca é testado — não porque testes ali não gerem diferença (há relatos de A/B de história com ganho real de conversão), mas porque oferta e mecanismo dão retorno de teste mais rápido e direto, então sempre vencem a fila de prioridade. Um funil de VSL, na prática, é uma "junção de microfunis": cada bloco (lead, história, tese, oferta) já é ele mesmo um funil com sua própria taxa de queda dentro do funil maior.

Regra de diagnóstico derivada: se uma VSL retém bem até o pit mas não converte, o problema quase sempre está no mecanismo ou na construção de produto (ver [[construcao-de-produto-em-pilares-tangibiliza-mecanismo]]) — não vale gastar ciclo de teste na história quando o problema real está em outro bloco.

Ver também: [[validacao-sequencial-de-uma-variavel-por-vez]] (mesma disciplina de isolar variáveis, aplicada à ordem de validação de camadas do negócio) e [[bater-controle-por-versionamento-incremental]] (o que fazer depois que a VSL já está validada e escalando).

Fonte: [[../podcasts/segredos-da-escala-157/12-priorizacao-de-testes-por-saturacao-de-trafego]]
