---
name: onde-paramos
description: Estado do trabalho na Quebra da Matrix — protótipo (22/08) e a frente de infra aberta em 24/08
metadata: 
  node_type: memory
  type: project
  originSessionId: 5ec91551-7997-484c-997e-75361a128e34
  modified: 2026-08-23T06:29:34.950Z
---

# 22/08/2026 — o fluxo de criar projeto, e a chuva refeita

## O que entrou

**O fluxo de criação existe.** `Meus projetos → Criar novo → "Seu projeto já existe?"`,
três respostas na voz do membro, e um primeiro passo diferente pra cada uma: Briefing,
Validação, Descoberta. O briefing é **conversa, uma pergunta por vez**, e o respondido
vira ficha à vista — o documento se monta na frente de quem responde. No fim, "A
Concepção existe", com resumo, os seis chips e **Abrir o projeto**. O projeto entra na
lista com 1 de 6 documentos.

**Quem não tem projeto não passa mais pela tela de lista vazia:** o botão da saudação
vai direto pro fluxo.

**A marca parou de se formar.** Já nasce montada e vive **só em Meus projetos**; no
fluxo de criação sobra o vácuo de código, discreto.

**A chuva foi refeita na lógica do efeito Matrix** (ele mandou um jsfiddle depois de
duas tentativas minhas erradas): passo de célula de 14px a cada 62ms, rastro por preto
translúcido **no mesmo compasso do passo**, uma cor só, sem cabeça branca, letra
sorteada a cada passo, toda coluna com cabeça. E **a chuva e o Morpheus são o mesmo
código** — antes eram dois sistemas, um sumia e o outro nascia.

Tudo em `03 - Features/12 - Morfeu (IA)/Morpheus AI.md`, seção "A sessão de 22/08".
Decisões **D241 a D252**.

## Três coisas esperando o Iuri

1. **A via "não faço ideia" é proposta minha** (D244). O Miro deixou o primeiro passo
   em branco; eu pus repertório → tempo → capital → três caminhos.
2. **Bíblia virou Concepção na interface** (D246). O cofre ainda usa "bíblia" em várias
   notas — se ele referendar, é uma varredura.
3. **Otimizações ficou dentro de Tráfego** (D247), pra manter seis documentos. Se virar
   o sétimo chip, os cartões passam a contar "de 7".

## Duas armadilhas que custaram caro e vão voltar

**A sombra do rodapé é iluminação, não sujeira.** Eu a tirei pra chuva descer até o fim
e a silhueta dele foi junto. Hoje ela entra com a fusão: sem sombra na chuva, sombra
cheia com o rosto montado.

**Medir posição durante animação de entrada de seção dá posição errada.**
`getBoundingClientRect` devolve a posição transformada; a marca ficou cravada em cima do
título ao voltar do fluxo. A soma de `offsetTop` ignora transform.

## Nota de método, importante

**Captura de tela neste ambiente chega segundos atrasada.** Julguei animação errado
várias vezes. O que funciona: congelar o quadro do canvas num `<img>` e **medir os
pixels** com `getImageData`. Também: patch em protótipo de API do navegador via
`javascript_tool` **não funciona** — roda em mundo isolado, não vê o JS da página.

## 24/08 — a frente de infra abriu

O Iuri dividiu o projeto em **três frentes**: canais de geração de demanda, infra do
projeto e sistema/produto (o protótipo, que segue em paralelo). A infra virou tarefa do
Nathan **com o Davi, num documento só** — ele não quer dois checklists. Régua dele:
*"não se cria infraestrutura duas vezes"*. Call e checklist no cofre:
`06 - Reunioes/2026-08-24 — Infraestrutura do projeto e canais de demanda.md` e
`05 - Backlog/Infra do Projeto — checklist (Nathan + Davi).md`. Decisões D253 a D266.

Prazo: 60 dias até a **abertura** (não é lançamento), perpétuo logo depois. Estratégia de
marketing e vendas começa na quarta; ele viaja sexta.

## 25–26/08 — departamentos, e-mail e o whisper consertado

O quadro **DEPARTAMENTOS** do Miro (Marketing, Geração de leads, Sucesso do cliente,
Outros, Administrativo) virou nota destrinchada: `01 - Fundamentos/Departamentos e
Responsabilidades.md` — 10 áreas com dono, responsabilidades, entregável, **a fronteira
do que não é da área** e o que está travado. Cinco buracos anotados lá: contabilidade sem
dono (segura o A7, que segura os Termos), tráfego sem dono interno do número, "dividir
perfis" que não divide, comercial sem gatilho de virar dedicado, e financeiro "todos".
A tabela antiga de departamentos no checklist de infra ficou marcada como substituída.

No checklist de infra entrou o bloco de e-mail: **F7** (marketing — Brevo, cobra por
envio; ActiveCampaign se a automação apertar), **F7.1** (transacional — Resend) e
**F7.2** (SPF/DKIM/DMARC, 🔴). Depende do F6, o gateway: Kiwify e Hotmart já disparam
pós-compra.

Exportações pro Miro ficaram no Downloads: `infra-checklist-miro.csv` (um card por item,
etiqueta por dono/status) e `infra-checklist-miro-doc.md` (checkbox clicável em Miro Doc;
PDF no Miro é imagem chapada, não marca nada).

## O TanpzWhisper — se voltar a "aparecer e não funcionar"

O app é dele, fonte em `~/Developer/TanpzWhisper`, `./build.sh install` compila e
instala. Um `stop()` travado deixava o estado em `working` e **toda tecla seguinte era
ignorada** — o HUD ainda aparecia, então o app parecia vivo. Causa: `withTaskGroup`
espera todos os filhos, e o `finalizeAndFinishThroughEndOfInput()` do SpeechAnalyzer
ignora cancelamento quando trava. Corrigido em 26/08 (corrida de verdade no
`Timeout.swift`, `defer { state = .idle }` no `stop()`, `prewarm()` no launch — o
primeiro uso levava 1,9s pra começar a gravar).

**Deixei log**: `log show --info --predicate 'subsystem == "com.tanpz.TanpzWhisper"'`.
Sem `--info` não aparece nada — nível info não é persistido, e isso me custou horas de
diagnóstico no escuro. Detalhe do zsh: `log` é builtin, use `/usr/bin/log`.

## O que continua faltando

- As três camadas de som do Miro (entrada, ambiente e voz existem; falta o som da chuva)
- Rever o tour do Fórum depois de concluído, regulamento da temporada, revisão dos
  Termos, lista do painel administrativo
- **Push do cofre pro GitHub segue bloqueado**: falta `gh auth login` ou adicionar a
  chave SSH em github.com/settings/keys

## Onde está

- Deploy: https://a-quebra-da-matrix.vercel.app
- Artifact: https://claude.ai/code/artifact/ba3e398f-77a0-447e-8283-ddf468ec2ca8
- Marco do dia: `90 - Assets/prototipo/morpheus-fluxo-criar-22-08.html`

Ver também [[prototipo-e-o-entregavel]], [[dois-modos-hoje-e-refinado]],
[[como-o-iuri-decide]], [[usar-claude-in-chrome-para-navegador]].
