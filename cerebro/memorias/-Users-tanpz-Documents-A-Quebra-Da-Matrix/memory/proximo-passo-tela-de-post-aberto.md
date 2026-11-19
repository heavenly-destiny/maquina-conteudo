---
name: proximo-passo-tela-de-post-aberto
description: "O próximo passo definido pelo conselho em 12/08/2026 — especificar e testar a tela de post aberto da Comunidade, o único trabalho com zero dependência"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0f1027e9-3aff-4d0f-8cc5-6d9c02310eb9
  modified: 2026-08-13T16:02:08.280Z
---

Saída do conselho de **12/08/2026**: entre tudo que está aberto, **a tela de post
aberto da Comunidade é o único trabalho com dependência zero.**

> [!important] Atualizado em 13/08/2026 — a tela **passou a existir em produção**
> Rota `/community/<handle>/status/<uuid>`: título "POST", post com
> `data · N visualizações`, composer "Postar sua resposta" e respostas **em um
> nível só**. O botão **Responder** do feed navega até ela.
>
> O trabalho mudou de natureza: não é mais **inventar** a tela, é **avaliar** a
> que existe e decidir o que muda. O modo "como está hoje" do protótipo já tem a
> cópia fiel dela (pane `data-sub="posthoje"`), então agora **há par de
> comparação** — o argumento visual deixou de ser "não existe nada" e passou a ser
> "olha o que falta nela". Ver [[onde-paramos]].

## Por que ela

- Ninguém consegue avaliar uma conversa inteira sem essa tela — e o que existe
  hoje é a versão mínima: sem marcar resposta útil, sem estados de vazio/erro
  além do "Seja o primeiro a comentar".
- **Toda a tese da Comunidade depende dela.** A D27 (resposta marcada como útil
  vira o centro) acontece nessa tela. Duas conquistas já implementadas em produção
  apontam pra ela: *Serviu pra Alguém* (+60) e *Referência* (+500).
- Não depende da C1/matriz de planos (qualquer plano lê post), nem da P1 (ranking),
  nem do Figma (M4/M5), nem de resposta do Iuri.

## Como entregar

**Dentro do protótipo, no modo refinado** — é para isso que ele existe
(rascunho visual → Iuri aprova → dev aplica). Ver [[prototipo-e-o-entregavel]].

A tela já existe parcialmente no protótipo (pane `data-sub="post"`). Falta
fechar: conversa completa · marcar resposta como útil · e os estados **vazio,
erro e carregando**, que hoje não estão cobertos.

Como a tela **não existe em produção**, ela não tem par no modo "como está hoje" —
o que já é o argumento visual: o Iuri alterna e vê que não há o que comparar.

## O teste

Mostrar pra **3 pessoas** e pedir que **marquem a resposta que ajudou, sem
explicar nada**.

- Acharam sozinhas → a **D27 vira 🟢**.
- Não acharam → a tese da Comunidade está errada, e isso foi descoberto numa
  manhã em vez de num protótipo de duas semanas.

## A jogada maior que passa por aqui

O Expansionista apontou que a aba **Resultado** deveria virar **formulário
estruturado**, não textarea: `o que testei · nicho · estágio · números
antes/depois · o que eu faria diferente`. A tese do produto já descreve a QDM
como laboratório de gente que *"testa, erra, valida e **anota**"*, e a spec da
aba já pede *"com número, não com print de saldo"* — a matéria-prima está lá.

Isso transforma a Comunidade num **acervo de testes** em vez de um feed, e vira
o dataset que faria o Morfeu ser **busca no que a tribo já testou** em vez de
gerador de resposta genérica. Custo de V1: um formulário.

**Why:** é o único trabalho que produz **decisão** em vez de pendência, e não
pede nada a ninguém. Todo o resto da fila depende de resposta do Iuri, do Luiz
ou de material que não chegou.

**How to apply:** fazer isso antes de qualquer novo refinamento visual.
Ver [[o-que-da-pra-ajustar-e-o-que-nao-da]] e [[prototipo-e-o-entregavel]].

> **Nota sobre o conselho de 12/08:** o conselheiro "Executor" chamou o protótipo
> de desperdício e mandou entregar em texto+print. **Está errado** — eu briefei os
> conselheiros sem explicar que o protótipo é o rascunho que vai pro dev. O resto
> do veredito dele (contagem de decisões, ordem de bugs, custo de errar) continua
> válido.
