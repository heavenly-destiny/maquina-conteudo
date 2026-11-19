# Aprendizados (diário de testes)

Regra: depois de cada teste (criativo, página, oferta, campanha, mineração), Claude registra uma linha aqui. Antes de criar algo novo de marketing, Claude lê este arquivo. O mais novo fica em cima.

Formato:
`AAAA-MM-DD | Produto | O que testou | Resultado (números) | Venceu ou perdeu | Por quê | Próximo passo`

## Regras que já se provaram
(Quando o mesmo padrão vencer 2 ou mais vezes, ele sobe para cá como regra.)
- Formato nativo novo vence layout de anúncio: chat com notas de voz e split-screen race (Stories Lab, 16/11/2026, 2 testes que venceram).
- Cobrir o rosto ou o celular da criadora no UGC perde. Intercut com cena full-screen de app ganha (16/11/2026, 2 testes: v1 perdeu, v3 venceu).
- Campanha de Meta otimizada para o evento final (depósito, cadastro) traz resultado. Campanha que otimiza para clique não traz cadastro (Bolão, 10/10/2026, 1 teste; confirmar em outro).
- Foto orgânica de iPhone ou Pinterest vence IA e stock polido (Stories Lab, 16/11/2026, 1 teste; já é preferência declarada).

## Registro
- 2026-11-17 | Stories Lab (Meta, HEAVY 02) | campanhas na semana 11 a 17/11 (relatório diário de 18/11) | 7 dias: R$3.944,79, 625 vendas, CPA R$6,31, ROAS 3,28. Vencedores: [ ESSA É TOP ] CBO LOW 2 (CPA R$3,69, ROAS 5,55) e AS VEZES NO ROI BOA (CPA R$5,05, ROAS 3,84), as duas desligadas; B ativa (CPA R$6,77, ROAS 3,54). Perdedores: F1 ACADEMIA G1 (CPA R$26,40, ROAS 0,68) e G-1 TODOS CTS (CPA R$35,85, ROAS 0,65), já desligados. Ontem só R$179 gastos (média R$563/dia), 14 vendas, ROAS 2,78 | venceu: criativos "1 - validou" e V4 | CPA baixo com CTR de só 1,2 a 1,8%: o criativo converte mesmo sem clique alto | reativar os 2 vencedores com orçamento inicial e escalar B. Relatório em relatorios/campanhas-2026-11-18.html
- 2026-11-17 | Máquina de Conteúdo | piloto de cortes 9:16 (cartões genéricos, voz crua, corte no meio da frase) | sem número; "ridículo" | perdeu | falta de edição por categoria | refazer com estilo de edição por categoria e legenda de uma cor
- 2026-11-17 | Mineração gringa (figurinhas/templates) | ~1.500 anúncios em 8 países | top 3: Viral Content Treasure Chest (US, 334 dias, US$97), The Aesthetic Vault (US, 35 anúncios, nicho esteticista, US$64), Open Invite Co (UK, 88 anúncios, renda extra com convites) | sem teste | fora do BR escala template de Canva, não figurinha avulsa; LATAM espanhol faz low ticket na Hotmart (US$7 a 12) | testar kits de nicho do Stories Lab no BR e versão em espanhol na Hotmart. Relatório em mineracoes/2026-11-17-figurinhas-gringa/mineracao.html
- 2026-11-16 | Stories Lab | template creme + celular + legenda (criativo 4) | rejeitado, sem número | perdeu | "parece todos os outros, cadê inovação" | novo formato
- 2026-11-16 | Stories Lab | split-screen race (criativo 5) | aprovado, sem número | venceu | formato nativo novo | usar como base dos próximos
- 2026-11-16 | Stories Lab | refazer o criativo 4 como chat de amigos com notas de voz | escolhido, sem número | venceu (decisão) | formato nativo | produzir
- 2026-11-16 | Stories Lab | hook "+3,4 mil seguidores em 7 dias" na abertura dos aprovados | sem resultado registrado | em aberto | hook forte; corpo precisa reter | medir hook rate de 3 s e CTR no teste A-B
- 2026-11-16 | Stories Lab | fotos IA vs Unsplash vs Pinterest orgânico | IA "muito artificial", Unsplash "muito profissional" | venceu: Pinterest | orgânico de iPhone | seguir a regra de foto orgânica
- 2026-11-16 | Stories Lab | UGC v1 (overlays no rosto) | "ridículo" | perdeu | cobriu rosto e celular | não repetir
- 2026-11-16 | Stories Lab | UGC v3 (intercut + PiP) | "agora tá batendo certo" | venceu | fórmula aprovada | base do v8
- 2026-11-16 | Stories Lab | UGC v7 vs v8 | v7: 49 a 81% do tempo no app/PiP, até 11 s sem rosto; v8: volta ao rosto a cada ~2 s | venceu: v8 | pedido dele de "mesclar" | manter v8
- 2026-11-16 | Stories Lab | página nova, carga | PageView da Meta: ~12 s para ~5 s (4G throttled) | venceu | preconnect, preload, slAfterPixel | medir de novo depois de lançar
- 2026-10-21 | Bolão | campanhas isoladas de R$25/dia por criativo | CA 7D-03 publicou 2; CA 7D-02 bloqueada por verificação do anunciante | parcial | documento de anunciante | regularizar conta antes de testar
- 2026-10-14 | Bolão | estrutura de campanha, semana 07 a 13/10 (CA 7D-02) | cadastro R$10,42 (campanhas de cadastro); conversa R$2,84 (DIRETO CONVERSAS R$1,93; DIRETO ZAP R$6,58); depósito R$1,36; CPC R$0,45; CPM R$17,53 | sem veredito | misturou cadastro e mensagem | separar em campanhas
- 2026-10-13 | Bolão | cadastro via Videos | R$7,43 por cadastro no Meta; R$8,47 com imposto de 14% | — | medido | comparar com DEPOSITOS
- 2026-10-12 | Bolão | Videos CTA (visual sugestivo) | publicado, desfecho não registrado | em aberto | risco alto de reprovação | verificar status
- 2026-10-10 | Bolão | otimização para DEPOSITOS vs cliques | só DEPOSITOS gerou cadastro: 6 a R$57,84 por cadastro | venceu: DEPOSITOS | cliques atraem quem clica | otimizar para depósito
- 2026-10-10 | Bolão | "Imagens Mascote" | rejeitado pela Meta (motivo não lido) | perdeu | reprovação | ler o motivo antes de reenviar
- 2026-09-02 | Bolão | pixel Purchase = depósito (auditoria) | depósito real de R$6 validou o evento no Test Events | venceu | gatilho AJAX | manter
- 2026-08-25 | DZI | roteiro local vs VSL gravada | sem número | VSL gravada venceu | arquivo local divergente (5 alimentos vs 8) | usar a VSL gravada como fonte
- 2026-08-13 | TanpzWhisper | Claude vs modelo local para limpar ditado | Claude 8,8 s; local 1 a 2 s | venceu: local | velocidade | manter local
- 2026-11-17 | Stories Lab motion M01 (lock screen, 10s, HyperFrames) | formato novo: notificações da tela de bloqueio contam a história (3 views, copia a figurinha "Bom dia" mais usada do app, 1.284 views + pilha de notificações, CTA rosa) | sem teste ainda | sem resultado | stack de notificação do 21st.dev adaptada em GSAP; figurinhas reais via localStorage.sl_topstk do app logado; voz edge-tts Thalita (grátis) porque a ElevenLabs estava sem crédito | refazer voz (Sofia) e trilha na ElevenLabs quando reconectar a conta com crédito. Arquivo: ~/Documents/sl-motion/m01/renders/SL-M01-lockscreen-10s.mp4
- 2026-11-17 | Stories Lab | funil UTMify "IC baixo" (183 cliques, 162 LPV, 20 IC, 15 vendas) | IC da Meta bate com os cliques no checkout medidos pelo site (21 hoje); clique no checkout por visita caiu de 16 a 22% (08 a 15/11) para 10 a 12% (16 e 17/11), mas 70 a 75% de quem clica compra na Hubla (antes ~44% na PerfectPay); venda por visita ~9% (13/11) para ~7% (17/11) | não é pixel quebrado | página nova de 16/11 + troca para Hubla: quem chega nos planos clica menos (de ~50% para 25%) | olhar a seção de planos, não o rastreamento
- 2026-11-17 | Stories Lab | seção Experimente (testar figurinha na própria foto) | o tanpz mandou tirar do site | removida | decisão dele | não recolocar sem pedido
- 2026-11-17 | Stories Lab | página de vendas, seção Reações ("Agora imagina isso no seu Instagram") | o tanpz mandou tirar | removida | decisão dele | não recolocar sem pedido. Dor nova ditada por ele: "um app pra cada coisa" (vários apps de edição e filtro, nenhum bom; tudo num app só)
- 2026-11-17 | Stories Lab | onde o IC caiu (13/11 página antiga x 17/11 página nova) | chegam aos planos ~40% nos dois; clicam no checkout 53% x 25% de quem chega nos planos; 60 s+ na página 25% x 15% | página antiga ganhou | mudou: botão "Quero o Premium" virou "Eu quero stories que todo mundo comenta", "1 ano de acesso" e "menos de R$1 por dia" no card, botão do topo vai direto ao preço, sem "como funciona", back-redirect desligado | testar a página antiga contra a nova
- 2026-11-18 | Stories Lab | ajustes de planos ditados pelo tanpz para subir o IC | sem resultado ainda | em teste | tirou "menos de R$1 por dia", "1 ano de acesso" e o banner do mini curso do card; caixa verde só "Pagamento único, sem mensalidade"; botão "Quero o Premium" (sem preço); "Tudo que faltava" subiu no lugar da prova social; pop-up de saída de volta com Premium R$19,90 | medir clique nos planos / chegada nos planos (base: 25% em 17/11, 53% em 13/11)

- 18/11/2026 (Stories Lab, página de vendas): publicado no storieslab.app o pacote CRO de 18/11. Inclui: hero novo, dor v2, seção "Tudo que faltava" com mini iPhones, categorias com fotos do Pinterest, bônus compactos, barra fixa "De R$197 por R$27" direto pro checkout e pop-up de saída. Medir cliques nos planos ÷ alcance dos planos (base: 25% em 17/11, 53% em 13/11) e o IC na UTMify.

- 18/11/2026, Stories Lab, deploy do card Premium novo (storieslab.app): card branco com borda rosa fina e brilho girando na borda, selo "Mais escolhido" maior e pulsando, lista com 6 itens (entraram "Aplicativo mobile" e "Mini curso em vídeo"). Saíram do card: "Você economiza", "+20 mil usuárias", "7 dias de garantia" embaixo do botão e a pílula "Pagamento único · sem mensalidade". Card foi de 945 para 620 px no celular. "Como você recebe seu acesso" agora vem logo depois dos planos (antes da garantia e do FAQ). Métrica a acompanhar: cliques nos planos ÷ alcance dos planos (base 25%) e IC na UTMify.

- 18/11/2026 (2º deploy do dia), Stories Lab: página enxugada. Saíram: os 3 cards de recurso (filtros, novidades, mini curso), as legendas dos 3 celulares, o botão "Eu quero estar entre elas", "Leva menos de 2 minutos..." e a pílula de pagamento no card Premium. Prova social virou uma linha de prints passando de lado (928 para 442 px no celular). FAQ virou um card único (1061 para ~720 px). Bônus: "E ainda você leva +7 bônus hoje". iPhone do topo com borda de titânio, Dynamic Island e ícones reais. Velocidade: preço do Premium aparece em ~0,3 s (antes >1 s); fotos do mural e prints carregam antes e mais leves. Testou e rejeitou trocar "+24.000" por "Figurinhas, presets e câmera" ("muito texto"). Acompanhar: cliques nos planos ÷ alcance dos planos (base 25%) e IC na UTMify.

- 18/11/2026, Stories Lab, rastreamento: auditoria no ar. Pixel Meta 1483927196916716 (via UTMify) dispara PageView, ViewContent e InitiateCheckout no clique; UTMify manda IC pela API; admin recebe visita, seções, tempo e clique. Causa de vendas "sem rastreio" na UTMify: 3 de ~33 vendas de anúncio (16-18/11) chegaram na Hubla com UTM do anúncio mas sem o lead da UTMify ("jLj..."), porque a pessoa clicou antes da UTMify registrar a visita (~3 s). Corrigido no clique (completa o lead se já existir). Outras vendas sem anúncio são esperadas: recuperação da Hubla por WhatsApp (utm hubla/whatsapp), compras dentro do app (utm_source=app), orgânico. Lighthouse celular: nota 63, FCP 2,5 s; LCP 9,3 s é falso (carrossel do iPhone troca a foto). storieslab.shop redireciona para storieslab.app com UTMs; storylab.shop não é nosso.

## 18/11/2026 · Stories Lab · topo com 3 celulares (publicado)
- O que mudou: o topo saiu de 1 iPhone para 3. No meio continua o reel de stories, à esquerda o Estúdio de Fotos tocando o vídeo real e à direita a câmera fazendo foco, flash e trocando 7 fotos do acervo. Os três flutuam de leve. No computador, os celulares ficam ao lado do título e a faixa de stories passa numa linha só, na largura toda.
- Antes de subir: o mockup em leque com cards e figurinhas soltas foi recusado ("GOSTEI NAO"). Ele topou a versão só com os 3 celulares.
- Medir: taxa de clique nos planos (cliques ÷ alcance dos planos; base 25%) e IC na UTMify, antes e depois de 18/11.

## 18/11/2026 · Stories Lab · 5 criativos de gancho ilustrados (G01–G05)
- Base: 5 fórmulas de gancho do Reel @faelsc_ (quebra de crença, explicação do problema, identificação, experiência, chamada direta). Copy aprovada antes de gerar.
- Formato novo: bonequinhas desenhadas (Open Peeps CC0) atuando cada frase, troca de rosto = emoção, piscada e respiração. Voz Sofia ElevenLabs eleven_v4. Trilha com corte seco no momento de suspense e drop na virada (pensar como filme).
- Pasta: ~/Documents/Stories Lab Criativos/4 - Ganchos ilustrados. Projeto: videos/sl-ganchos (build.py + cN.txt + mixcore.py).
- Resultado de campanha: PENDENTE (preencher hook rate 3s, CTR, CPA por criativo).
- 18/11, SL-G01..G05 (ganchos ilustrados): 1ª versão reprovada por foto repetida, grade de clones, "foto com bom dia no meio" e fotos de luxo. Refeito com acervo orgânico do Pinterest (337 fotos tipo iPhone em 21 temas, lotes separados por criativo), auditoria de repetição por script e figurinha casada com o tema da foto. Resultado de campanha: pendente (hook rate, CTR).
- 18/11, Stories Lab, rastreio: painel mostrou 2 IC para 5 vendas. Causa: o IC sai pela UTMify no clique do botão, mas a página ia pro checkout na hora e o navegador cancelava o envio pro Meta. Correção no ar: o clique segura até o IC sair (máx. 0,7 s). Observação: a UTMify só manda IC uma vez por pessoa. Conferir nos próximos dias se IC passa a ficar >= vendas.

- 18/11/2026 14:49, Stories Lab, parcial do dia (UTMify): gasto R$714,79, faturamento R$461,03 (15 compradores, 22 itens), ROAS 0,64, CPA R$47,65, Pix pendente R$172,81. Funil Meta: 282 cliques, 254 LPV (90%), 63 IC (25% da LPV; era 12% em 17/11, efeito do conserto do IC + página nova), 31 vendas iniciadas, 22 itens aprovados (Pix 71%). CTR médio 1,55%, CPC R$2,53, CPM R$39. Gargalo: verba espalhada em 31 campanhas de R$50; 21 campanhas sem venda comeram R$425 (60% do gasto). As 5 que venderam barato (TESTE MALUCO 1-16, PAGINA/VARIAÇÕES 1-16, B, B 1, LOW FIG CT 02 video) gastaram R$130 e fizeram R$326 (ROAS 2,5). Bump Vitalício: 7 de 14 (50%).

## 18/11/2026 · Stories Lab · order bumps espelhando a Camys
- Bumps no checkout em vez de upsell: a maioria paga com Pix, e o upsell dentro do app não converte. O Kit Influencer fica só no app.
- Nome do bump = nome exato que a Camys usa no checkout. É nome estratégico, em tom de amiga pra amiga ("Aumente o número de seguidores do seu perfil [Método prático]"). Não inventar marca.
- A imagem do bump tem que ser uma miniatura quadrada própria de bump, não um banner.
- Teste no ar desde 18/11, nas ofertas R$27 e R$19,90: Vitalício 14,90, FontLab 29,90, Seguidores 24,90, Reels 24,90, Presets 14,90. Medir a taxa de cada bump.
