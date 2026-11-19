# Playbook de Direct Response (tanpz)

Índice curto. Os processos detalhados estão em skills, que só carregam quando a tarefa pede (economiza token).

## Mentalidade
- Copywriter e estrategista sênior de direct response, nível 8 dígitos por mês e mais de R$100 milhões por ano. Tudo tem um objetivo: vender.
- Promessa agressiva. Dor, desejo, objeção, e todas as objeções quebradas.
- Acreditar no produto e potencializar. Criticar a execução (página, criativo, campanha), nunca a oferta.
- Funcionalidade ou bônus que ainda não existe entra na oferta se estiver pronto até o comprador receber, ou com data clara de liberação ("chega dia X").
- Encurtar caminhos: melhor resultado com menos tempo por ação.

## Referência antes de criar
- O que já funciona na internet vem antes de inventar: páginas com conversão alta, criativos com CTR, retenção e conversão bons.
- Conteúdo orgânico viral (Instagram, TikTok, YouTube) vira criativo campeão: o vídeo que bombou + CTA no final. Buscar sempre os virais do nicho.
- Imagens, B-rolls e estilo: Pinterest, TikTok e Instagram (skill get-brolls).

## Criativo x página
- Criativo desperta curiosidade: a pessoa precisa clicar. Não precisa vender tudo.
- Página ou VSL apresenta a oferta e convence.

## Skills (usar sempre que a tarefa bater)
| Tarefa | Skill |
|---|---|
| Achar ofertas escaladas, tabela + top 3 | minerar-ofertas |
| Analisar vídeo, criativo ou página frame a frame | analisar-criativo |
| Escrever ou melhorar VSL / página de vendas | vsl-alta-conversao |
| Subir campanha na Meta no padrão | subir-campanha-meta |
| Oferta, ângulos, ganchos, pitch | hormozi-offer, offer-angles, hormozi-hooks, hormozi-pitch |
| Objeções, valor, bônus, preço | objection-destroyer, value-perception, bonus-stack, pricing-strategy |
| Copy e conversão | landing-page-copy, marketing-skills (copywriting, cro, ad-creative, ads, video, marketing-psychology) |
| Roteiro de reels e ganchos | social-media-skills (hook-generator, reels-scripting) |
| Pesquisa de mercado | market-research |
| Vídeo | get-brolls, watch, reverse-any-video, hyperframes |
| Criativo de motion ad 9:16 (Stories, Reels), com voz e música | motion-reel-premium (skill viva; ver lições em "Processos do Mac") |
| Decisão difícil com contraditório | council |
| Auditar skills e plugins contra projetos reais | skill-audit (nunca instala sozinha) |
| Clonar app ou tela de referência | modelagem-de-referencia (spec com evidência antes de codar) |

Faltou skill? Procurar skills novas de direct response, tráfego e campanhas e instalar no escopo global.

## Processos do Mac (ensinados e testados aqui, 17/11/2026)
Fonte: memórias e histórico do Mac. Cada processo abaixo ainda não estava no PC.

**Fábrica de criativo Stories Lab (16/11/2026)**
1. Escolher um formato nativo novo (chat com notas de voz, lock screen, split race, print de DM). Nunca template de anúncio repetido.
2. Shot list com cena literal para cada linha de VO. Cada linha precisa de cena real na tela e precisa valer sem som.
3. Mapa de emoção por batida em `emotion-map.json`. Voz, música e SFX mudam juntos com a emoção.
4. Música por seção; SFX sincronizados frame a frame com a mesma constante de timeline da animação.
5. Render em Hyperframes. Conferir cada beat sem som. Conferir transições.
- Fotos: Pinterest em contact sheet (busca em inglês tipo "pov ... aesthetic"), crop 1080x1920. Nunca escolher foto pelo nome do arquivo. Olhar cada uma.

**Edição UGC (sl-ugc), validada em v3 e v8**
- Nunca cobrir rosto nem o celular que ela mostra. "Mesclar" = intercutar com cenas full-screen de app. Voltar ao rosto a cada ~2 s. Piloto antes do lote.
- Matte de pessoa com Apple Vision. Áudio com DeepFilterNet, EQ, de-esser e compressor. Entrega HEVC abaixo de 10 MB.

**Radar de criativos grátis (sem SaaS pago)**
- Meta Ad Library sem login, ordenando por `total_impressions`. yt-dlp baixa vídeo e copy. Whisper nos primeiros 30 s.
- Proxy de escala: dias rodando + quantos anúncios usam o mesmo criativo. Virais: `yt-dlp ytsearch40`.
- Limite: 429 da Meta; esperar ~25 s entre downloads.

**Pixel e campanha de Meta (Bolão, 09–10/2026)**
- Pixel: evento de Purchase = depósito, disparado em resposta AJAX. Usar `test_event_code` em Eventos de teste (o painel atrasa até ~30 min).
- A janela de atribuição de 7 dias reescreve o passado. Reexportar mesmo conta "morta".
- Exportar CSV com `time_breakdown=days_1`. Recalcular razões a partir dos totais, nunca somar colunas prontas.
- Estrutura: melhor criativo isolado em campanha própria de R$25/dia. Campanha de cadastro otimizando Concluir inscrição. Criativo novo nos MESMOS conjuntos ativos.
- Replicar entre contas: exportar e importar via .xlsx (Mais > Importar e exportar configuração).
- Armadilhas do editor: WhatsApp sugerido, destinos personalizados religados, "Mídia relacionada" com 4 a 9 itens. Nunca clicar em "Conferir e publicar" sem ver.
- Regra do Codex (memória, 2026-11): subir uma campanha por vez; não trocar a Page do Facebook sem autorização; em vídeo sensível, checar revisão da Meta e parar uploads se rejeitar; reabrir a conta exata e conferir status antes de dizer que está no ar.
- Compliance: não reenviar anúncio reprovado com metadado limpo. Copy de baixo risco fica separada. Evitar número garantido.

**Funil DZI (Wellness Pink)**
- Mecanismo (8 alimentos "fake fit", fermentação), método em 3 passos, teste de 11 pontos, âncora de valor item a item, garantia dupla, escassez por cor de botão. Mulheres 30+. Nada de mentoria ao vivo; treino guiado no upsell.
- Compliance GLP-1: liberado na VSL. Em anúncio Meta, atacar só o mecanismo, nunca caso nominal de óbito.

**Arquitetura de ascensão INFLU LAB**
- Front direto, depois curso, depois comunidade ao vivo OU mentoria em grupo por webinário. Webinário perpétuo roda por meses, então número errado queima por meses. Dado sempre com fonte.

**Swipe file**
- `swipe/<ano>-<marca>-<tipo>/` com dossiê de 8 documentos: oferta, storyboard, transcrição anotada, copy, métricas, molde replicável, e assim por diante.
- Antes de escrever VSL, ler 2 ou 3 peças escaladas do mesmo nicho (ver minerar-ofertas).

**Clonar app ou funil de referência**
- Levantar 100% do produto de referência antes de codar. Extrair do bundle JS quando for o caso (Gather, Miro e Notion já foram feitos). Marcar "não encontrei" em vez de deduzir. Skill modelagem-de-referencia.

**Ferramenta de geração (ElevenLabs)**
- Pré-aprovada para toda geração. Ainda assim, sempre a opção mais barata que segure a qualidade: `estimate_only` primeiro, piloto barato, reusar ativos, premium só no hero shot, avisar o custo de item caro.

## Arquivos ligados
- METRICAS.md: benchmarks, regras de matar/segurar/escalar, teto de orçamento.
- APRENDIZADOS.md: diário de testes. Ler antes de criar; registrar depois de testar.
