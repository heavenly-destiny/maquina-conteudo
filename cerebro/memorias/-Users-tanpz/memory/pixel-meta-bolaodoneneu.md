---
name: pixel-meta-bolaodoneneu
description: "Setup do Meta Pixel para bolaodoneneu.com — decisões tomadas, onde ficam os arquivos e o que está pendente de teste."
metadata: 
  node_type: memory
  type: project
  originSessionId: 7b5e2fb5-3d54-4179-b3b1-ec4718ab4cf8
  modified: 2026-09-05T11:00:00.000Z
---

Pixel Meta `799360383237025` para o bolão do Neneu. Arquivos em `~/Documents/pixel-bolaodoneneu/`. A versão **em produção** é `NO-AR-2026-09-04b.js` (baixada do site em 05/09/2026); `PIXEL-2026-09.html` ficou desatualizado, não usar como fonte.

Arquitetura: `bolaodoneneu.com` (landing, `/novo_site/`) + `adm.bolaodoneneu.com` (CodeIgniter, controllers `c_produto`/`c_jogo`/`c_login`/`c_deposito_conta`), numa VPS. GTM `GTM-TPHN5C28` (conta "Bolao do Neneu"), GA4 `G-9HZSPLRRHQ`, 7 tags `mt_*`.

**Decisões dele, não repropor:**
- `Purchase` = o depósito, não a aposta. A aposta dispara `ApostaConfirmada` sem valor.
- Não quer editar PHP: o valor sai do input `valorInforme` do modal (com âncora em sessionStorage na hora de gerar o PIX).
- CAPI desligada por escolha dele.

**Gatilhos (respostas AJAX do próprio site, não texto de popup):** `action_criar_conta_user` com `st:true` (boolean confirmado) = CompleteRegistration · `deposito_imediato_form` = InitiateCheckout · `gerar_pagamento_deposito_imediato` = AddPaymentInfo (com valor) · `consultar_pagamento_deposito_imediato` com `status:'approved'` = Purchase. Cada evento também vai pro dataLayer como `mt_<Evento>`.

**Auditoria completa 05/09/2026 (logado, com depósito real de R$6 pago):** tudo funcionando —
PageView e `_fbc` do fbclid na landing inteira; Lead no clique de WhatsApp; ViewContent na lista; ViewContent+AddToCart (`content_ids` = id do produto) no bolão; InitiateCheckout na abertura do modal **por qualquer rota** (o furo antigo do `/c_jogo/create` está corrigido); AddPaymentInfo com valor no GERAR PIX; Purchase com `value`/`BRL`/`order_id` — confirmado "Processado" no Test Events da Meta (test_event_code TEST88917) e o dataLayer virando `purchase` no GA4. Pixels legados e o `GTM-KMCNP6VG` de terceiro sumiram das páginas.

**Pendências reais (05/09/2026):**
- `adm.bolaodoneneu.com/c_login` (a tela de login, e o `/` do adm) **não tem pixel nem GTM**. Anúncio que cai direto ali não gera PageView nem grava `_fbc`.
- Hits do GA4 saem duplicados para a propriedade `G-YZWGWV6K3C`, que não está no HTML nem no container — é destino vinculado no admin do Google tag. Conferir se é dele.
- `fbq("set","autoConfig",true)` está ligado no script: gera `SubscribedButtonClick` em todo clique de botão. Trocar para `false` se quiser cortar o lixo.
- Teto `VALOR_MAX = 10000`: acima disso o valor é considerado inválido e o Purchase cai no último valor guardado (pode reportar valor errado em depósito alto).
- Stepper `+/-` do modal não emite evento de input; só o campo lido na hora e a âncora do PIX salvam o valor.
- Gerenciador de Eventos atrasa ~30 min: para validar na hora, usar Eventos de teste (Site > URL do site) — os eventos com test_event_code não entram no relatório.

**Segurança:** o token de CAPI foi colado em texto puro no chat em ago/2026; ele nunca confirmou que invalidou no Events Manager.

Ver [[instalar-skills-sempre-global]] e [[dashboard-metricas-bolao]].
