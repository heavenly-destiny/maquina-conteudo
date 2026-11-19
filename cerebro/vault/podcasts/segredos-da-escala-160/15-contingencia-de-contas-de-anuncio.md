---
tipo: ponto-de-podcast
tags: [podcast, tráfego-pago, contingência, contas-de-anúncio]
---

# A pilha de contingência: antidetect + proxy + mobile + farm de contas

Parte de [[Ecossistemas 7D]].

- Camadas básicas de contingência usadas antes mesmo de escalar:
  - **Antidetect**: simula uma "impressão digital" (fingerprint) de máquina diferente pro Facebook, pra que múltiplos perfis/contas não sejam associados entre si.
  - **Proxy**: simula IPs diferentes, reforçando a separação de identidade.
  - **Rede móvel/5G** em vez de Wi-Fi: acessar vários perfis pela mesma rede pública facilita o Facebook cruzar dados e identificar que são a mesma pessoa; internet móvel evita esse padrão de conexão compartilhado.
- **Farm de contas**: em vez de usar uma conta "fria" direto com orçamento agressivo, ela cria contas, aquece aos poucos (aumenta gasto e limite gradualmente) para simular um comportamento "normal" de anunciante aos olhos do Facebook — usar uma conta muito nova com dinheiro agressivo desde o início é um padrão que aumenta risco de bloqueio.
- **Compra de contas já aquecidas**: ela já comprou contas prontas, principalmente para não perder tempo de venda quando uma conta em escala é derrubada no meio do período — "deixar de vender" custa mais do que o custo de ter uma conta reserva pronta.
- Reconhece que cada conta se comporta de forma imprevisível apesar de toda a estrutura — a mesma estratégia otimiza em uma conta e não performa em outra, sem padrão identificável (ela chama isso de "o maior mistério que tem no Facebook").

Ver também: [[../../marketing/lateralizacao-de-dominios-e-contas]]
