---
name: koncord-os
description: "Koncord OS — o app único que junta escritório espacial (tipo Gather), quadros, notas e conversa; primeira fatia no ar, o resto é integração do que já existe."
metadata: 
  node_type: memory
  type: project
  originSessionId: c9ccf014-a7d7-44e8-b499-df8d74e6b38b
  modified: 2026-09-14T00:56:59.485Z
---

Projeto em `~/Developer/koncord-os`, no ar em **https://koncord.pro** — ele É a raiz do
domínio desde 2026-09-11, na mesma VPS do [[projeto-concord]] e do [[affine-board-vps]].

**A raiz mudou de dono, e isso tem três armadilhas.** O cliente do chat (`web:5000`) era o
`reverse_proxy` final do bloco `{$HOSTNAME}`. Agora quem é o final é o Koncord OS, e o chat
ficou num matcher nomeado `@chatui` com os caminhos dele (`/app*`, `/assets*`, `/login*`,
`/server*`, `/channel*`, `/settings*`, `/friends*`, `/discover*`, `/invite*`, `/bot*`,
`/pwa*`, `/icons*`, `/manifest*`, `/sw.js`, `/workbox*`). As três colisões que obrigaram a
renomear coisa do meu lado: `/ws` é o websocket de eventos do chat (o meu virou `/os-ws`),
`/api*` é a API do chat (a minha virou `/os-api/*`), e `/app*` é o cliente do chat (meus
estáticos viraram `/os.js` e `/os.css`). **Se aparecer rota nova do chat quebrada, é aqui.**

O chat e as notas são iframes dentro do app — como é tudo na mesma origem `koncord.pro`,
a sessão do chat continua valendo dentro do iframe, sem novo login.

**A tese, que evita reescrever o mundo:** tanpz pediu "tudo em um" — Miro, Gather, Notion,
Obsidian, ClickUp, Zoom. Quase tudo disso já roda nessa máquina: o Koncord (Stoat) faz chat,
voz e vídeo; o AFFiNE faz doc, canvas edgeless e kanban. O que **não existia** era o
escritório espacial. Então o Koncord OS é uma casca com o design único mais o módulo novo —
não cinco produtos reescritos.

**Padrão de "aprimorando tudo" já rodou 3-4 vezes** (S1897/S1898, gather.md, DESIGN.md,
este passe em 2026-09-13) — auditoria geral sem critério de "pronto" em cima do mesmo
projeto de poucos dias. O conselho (skill `council`) bateu o martelo nisso: só vale caçar
bug/redesenhar quando tem alvo concreto (print, elemento nomeado) ou surge dentro de uma
tarefa real de ponta a ponta — não como faxina especulativa nos 5 módulos de uma vez.

**git init só aconteceu em 2026-09-13** (`f635433`). Desde 2026-09-26 tem remoto: repositório
PRIVADO `heavenly-destiny/koncord-os` no GitHub (`git push` depois de cada entrega). Segredos
(`.dm-chave`, `.dev.vars`, `.env.deploy`) e `.wrangler/` ficam fora pelo `.gitignore`.

**Formas do Carta (retângulo/oval) eram desenhadas com rough.js** (traço "à mão", cor
hardcoded #6A6A78/#E8E8E8, contra a própria regra do DESIGN.md de não soltar hex fora do
`:root`) — removido em 2026-09-13, voltou a usar a borda CSS tokenizada (`--fg2`, `--r1`)
que já existia como fallback. Se "os desenhos" ficarem feios nas formas de novo, não é
rough.js — foi removido de vez.

**XSS persistente achado e fechado em 2026-09-13 (commit `49c0fd6`), no Rota e no Bordo —
os dois módulos onde dado de um usuário aparece pra outro.** Nome de responsável, log de
atividade e chip de filtro da Rota iam pro innerHTML sem `esc()`; a descrição da tarefa
usava innerHTML puro num campo que nunca teve barra de formatação. No Bordo era pior: o
editor de blocos guardava o innerHTML INTEIRO do que fosse colado, sem filtro, e
reproduzia puro pra quem abrisse o mesmo documento (sincroniza entre clientes). Corrigido
com allowlist (`sanearBloco` em bordo.js — só `<b>` e o `<a class=link>` do `[[link]]`
sobrevivem) rodando tanto ao salvar quanto ao desenhar. Testado com 6 payloads (img
onerror, svg onload, onclick, script, `javascript:` href) num harness isolado antes de
subir — zero executou. **Se herdar outro campo de texto compartilhado entre usuários
(campo novo na Rota, no Bordo, ou em qualquer sync futuro), a pergunta é sempre "isso
passa por `esc()`/`sanearBloco` antes do innerHTML?" — não assumir que já passa.**

O pedido original era "audita tudo, os 5 módulos, execute". O conselho (skill `council`)
recomendou cortar pra um alvo concreto; tanpz reafirmou "não corta nada, força máxima" duas
vezes e o passe cobriu os 5 de verdade, linha a linha, em 4 commits (`f635433` baseline →
`02b5375`), 2026-09-13:

- **Convés:** dois bugs achados. (1) `loop()` do boneco roda sempre, em qualquer view —
  trocar de aba segurando W deixava o boneco andando escondido e mandando posição pra rede;
  corrigido limpando `keys`/`destino` ao sair do Convés. (2) segurar Z/H disparava o toggle
  de gesto várias vezes por segundo (auto-repeat do teclado, sem guarda de `e.repeat`).
- **Rádio:** só tem o proxy `/app` (`temperar()` em server.js) pra revisar — o resto é o
  Stoat, que não mora nesta máquina. Achado: o proxy só fazia GET, sem repassar method/body;
  um POST que caísse ali virava GET mudo, corpo jogado fora sem erro. Corrigido.

Nada mais apareceu em Convés depois desse pente-fino — sessão, portão, websocket,
colisão, personagem, LiveKit, vestiário revisados sem achado adicional.

**Rádio estava REALMENTE quebrado e a primeira passada não pegou** — só chequei
`curl -o /dev/null` (o proxy responde 200), nunca abri no navegador de verdade. tanpz
mandou print: layout todo espremido, "Koncord" gigante estourando a caixa. Causa: `#chatFrame`
em index.html não tinha NENHUMA regra de CSS — `.view` é flex sem `flex` no filho, e iframe
sem width/height nasce no tamanho padrão do HTML, **300×150px**. O chat carregava inteiro
nessa caixinha, entendia que a tela era de celular (o concord-web tem breakpoint `_phone`) e
desenhava o layout mobile colapsado — o preto ao redor era só o fundo do painel vazio.
Corrigido: `#chatFrame{flex:1;width:100%;border:0}` (commit depois do `02b5375`). Confirmado
comparando `koncord.pro/app` sozinho (sempre renderizou certo, por isso o bug não aparecia
testando o chat isolado) com dentro do painel do Rádio (só ali quebrava).

**Lição pra próxima vez que alguma tela "parece bugada":** `curl`/status HTTP não prova que
a UI renderiza certo — só abrir no navegador prova. `mcp__claude-in-chrome__*` funciona nesta
máquina com o Chrome do próprio tanpz (cookie de sessão já vem logado); usar isso ANTES de
declarar algo consertado, não só depois de reclamação.

**Levantamento visual completo do Gather em `referencias/gather.md` (seção 4, 2026-09-13):**
design de mesa/cadeira/decoração, como eles separam Decorator (edição rápida, qualquer
Membro) de Studio (edição estrutural por Área, só 1 admin por vez, com rascunho→Publish),
Desk Manager (mesa reivindicada/atribuída), catálogo de objetos interativos (jogos, GitHub
Dock, Gong, embed de URL qualquer), e o sistema Layout/Tema/Tamanho. Sem conta — parede de
login em app.gather.town/demo pra criar espaço publicado; tudo saiu do site oficial e da
central de ajuda (support.help.gather.town). Prints em `koncord-os/referencias/gather-imgs/`.

**Replicado de verdade no Koncord** (commits `4f99b53` e `29c7ea6`, 2026-09-13): plaquinha
de nome subiu pra cima da cabeça (cor `--ac`, biquinho); Gongo do escritório (objeto novo,
som sintetizado por AudioContext, sem arquivo); **mesa reivindicada** — X numa mesa livre
reivindica com o teu nome, X na tua solta, X na de outro só avisa. Usa a coleção `mapa` que
já existia parada em `dados.js` (`mapa: null // usa o mapa que vem no código`) e o
`guardar()`/`fundir()` do `sincronia.js` que já existia — zero mudança de servidor.

**Bug real achado nessa implementação**: `fundir()` (fusão de objeto, não-array) nunca
cruzava com a `base` pra saber que uma chave tinha sido apagada — só a fusão de LISTA
fazia isso. Soltar uma mesa bem na hora de um conflito de save podia ressuscitar o dono
antigo. Corrigido na função compartilhada (afeta Rota/Bordo/Carta também, não só mesa) +
teste novo em `testes/fusao.test.mjs`.

**Segunda rodada de replicação** (commit `7e5e4f2`, mesmo dia): confete no `F` (partícula de
verdade, gravidade+giro); status livre tipo Slack (clique no textinho do rodapé abre
prompt, emoji+frase por cima do estado fixo); `⌘O/⌘I/⌘U` trocam estado, `⌘⇧A/⌘⇧V` mic/
câmera pelo teclado; **seguir alguém** (clique no boneco no mapa ou na tira de presença,
mira na posição AO VIVO, anda ou Esc cancela); **Spotlight** (voz ignora distância pra
quem já tá na mesma sala — não puxa gente de fora pra dentro de chamada, isso seria outro
projeto) e **modo silencioso** (encolhe o próprio alcance de 5 tiles pra 2) — são opostos,
ligar um desliga o outro. Tudo testado ao vivo em koncord.pro antes de fechar a sessão.

**Ficou de fora, de propósito:** sala de reunião em roda (a "Media room" que vi ao vivo) —
o mapa do Convés já tá bem apertado, cravar uma zona nova sem redesenhar ia sair capenga;
catálogo de jogos embutidos e GitHub Dock — dependem de decisão externa (qual provedor de
jogo, token do GitHub), não dá pra inventar; editor tipo Decorator/Studio, arrastar objeto
em tempo real, gravação de reunião, aba de fantasia sazonal — projeto próprio cada um, MAP
ainda é objeto fixo no código, não dado editável em runtime.

**Depois entrei de verdade no espaço real do INFLU LAB** (`app.v2.gather.town`, tanpz
passou a URL) — não deu pra mover o boneco (controle preso em outra sessão dele), mas vi
o produto real, não maquete de marketing: mesa é retângulo liso, maioria das mesas do
time fica vazia, notificação de verdade de "sua mesa está pronta", barra lateral tipo
Slack (busca/mapa/chat/calendário/sino) que nenhum artigo de ajuda mostrava. Seção 4.8.

**O que a primeira fatia já faz:** boneco anda com WASD, câmera segue, zonas do mapa
(saguão, duas salas de reunião, foco, café), presença em tempo real por websocket, e
proximidade — perto de alguém a voz abre, dentro de uma sala a conversa fecha só entre quem
está lá. Volume cai com a distância no saguão. Botões de microfone, câmera e tela falam com
o LiveKit que já roda pro Koncord.

**Como está montado:** Express + `ws` + `livekit-server-sdk` num container só
(`/root/koncord-os`), sem porta publicada, ligado na rede `stoat_default` e servido pelo
Caddy que já existia. A chave do LiveKit é lida do `/root/stoat/livekit.yml` na hora de
escrever o compose — não fica no repositório.

**O que ainda não existe:** login (qualquer um entra digitando um nome), persistência
(posições vivem em memória), editor de notas dentro do app (hoje é link pro AFFiNE),
e o mapa é fixo no código, não editável pela interface.

## Como o tema é aplicado nos apps prontos (sem fork)

O servidor intercepta só o **documento HTML** do app de origem e injeta
`<link rel="stylesheet" href="/os-theme.css">` antes do `</head>` — função `temperar()`
no `server.js`, com `app.use('/app', temperar('http://web:5000'))`. Os estáticos
(`/assets*`) continuam indo diretos pelo Caddy. Atualizar o app de origem não perde o tema.

**A pegadinha que custou tempo:** o tema do chat **não** vem das variáveis do MDUI. Ele usa
`--colours-*` gravadas **inline no `<body>`** pelo próprio app em tempo de execução. Estilo
inline ganha de folha externa, então só funciona com `body{ --colours-x: y !important }` —
e é assim que o `os-theme.css` está escrito. São 118 variáveis; o arquivo cobre as
estruturais (fundo, texto, botões, itens de menu, campos, colunas laterais).

Identidade única: o OS lê a sessão do chat no IndexedDB (`localforage` → chave `auth` →
`session.token`), chama `/api/users/@me` com o header `x-session-token` e usa nome, avatar
e um índice de cor derivado do id. O token nunca sai do navegador.

## Conta única: o Koncord virou provedor OIDC

O AFFiNE self-hosted aceita **OIDC** (Admin → Settings → OAuth). Então o Koncord OS
passou a ser o provedor de identidade, em `oidc.js`, servido em `https://koncord.pro/oidc`.

**A sacada que faz funcionar:** a sessão do chat vive no IndexedDB, não num cookie — nenhum
servidor consegue lê-la. Mas a página `/oidc/authorize` é servida em `koncord.pro`, a mesma
origem do chat. Ela lê a sessão no navegador, prova quem é chamando `/api/users/@me`, e só aí
o servidor emite o código. Sem isso, não haveria como fazer SSO a partir do Stoat.

E-mail é sintetizado como `<username>@koncord.pro`, porque o AFFiNE exige e-mail e o Stoat
não expõe um confiável.

**Duas armadilhas que custaram tempo:**
- O AFFiNE recusa o issuer com `ssrf_blocked_error: URL resolves to a private or reserved IP`
  mesmo o IP sendo público — precisa de `"allowPrivateNetwork": true` no JSON do provider.
- A config só passa a valer depois que o log diz `OAuth provider [oidc] registered`;
  `serverConfig { oauthProviders }` é o jeito de conferir de fora.

## Dados do time

`dados.js` guarda a Rota (tarefas) e o mapa num JSON por coleção, em `/root/koncord-os/dados`
(volume do container). Leitura e escrita exigem o header `x-koncord-session` com sessão válida
do Koncord — mesma identidade do resto, sem login separado.

## Deploy

Usar sempre `./deploy.sh`: ele roda `node --check` em todos os arquivos ANTES de enviar.
Já quebrou uma vez porque uma edição deixou uma chave sobrando no `public/os.js` e o app
subiu com a tela de entrada travada.

## Especificações dos apps de referência

Em `~/Developer/koncord-os/referencias/` tem `gather.md`, `miro.md` e `notion.md` —
extraídos dos apps reais em 2026-09-11, não de memória. O do Gather saiu do **bundle
JavaScript deles**: mapa de frames do sprite, ordem das 18 camadas de roupa, paletas em
hex e nomes do protocolo.

**Números que eu tinha inventado e estavam errados:** o raio de proximidade do Gather é
**5 tiles pra começar a conectar e 2 pra conexão plena**, com atenuação gradual entre os
dois — não os 130px/220px que eu tinha chutado. Tile é 32px e o personagem tem 30–36px,
mais alto que o tile de propósito: é isso que dá profundidade.

**Vocabulário interno do Gather:** `nook` = área privada e mesa; `whisper` = bolha.
E mesa lá é só **objeto + tile intransponível + área privada com flag de claim**.

**A fonte do Notion não é Inter** — é a fonte do sistema. O que faz parecer Notion são
neutros quentes (`#2c2c2b`, `rgba(55,53,47,…)`) e hover como opacidade, nunca cor nova.

**Do Miro:** sticky é 199×228dp com a sombra dentro da altura; desfazer guarda 30 ações e
zera ao recarregar; degrada a partir de 1.000 objetos.

A skill global **`modelagem-de-referencia`** (em `~/.claude/skills/`) obriga esse
levantamento antes de codar qualquer feature "igual ao X", em qualquer projeto.

## Rota: o modelo é o do ClickUp

A coluna **não é a verdade** — a verdade é o campo `status` da tarefa, e a coluna é o
resultado de agrupar por ele. Por isso o botão "Agrupar" troca entre status e fase sem
tocar nos dados, e arrastar o cartão **grava o campo**, não move de lista.
O formato antigo (coluna com array de strings) é migrado na carga por `migrar()`.

## Armadilhas e decisões de 2026-09-11

**A pegadinha da persistência:** o nome pedido na entrada ("Subir a bordo") é só identidade
local do OS. Quem autoriza `/os-api/dados/*` é a **sessão do chat Koncord**, lida no
IndexedDB `localforage` → chave `auth` → `session.token`. Sem login no chat naquele
navegador, Carta/Rota/Bordo carregam o padrão e **não salvam nada** — em silêncio.
Sintoma: tudo volta ao estado inicial ao recarregar. Cura: entrar pela aba Rádio.

**Vendorizado em `public/vendor/` (só MIT):** `perfect-freehand.mjs` (traço da caneta) e
`rough.mjs` (formas desenhadas à mão — export *default*, diferente do perfect-freehand que
é export nomeado). O fonte do **tldraw é proprietário** e não pode entrar no projeto.

**Deploy:** `./deploy.sh`, que roda `node --check` em todos os .js antes do rsync. Nunca
subir direto — já quebrou o app com um `}` sobrando. O `rsync --delete` já apagou o
`compose.yml` do servidor uma vez (ele guarda o segredo do LiveKit).

**Por que o boneco travava (2026-09-11):** o `passa()` do Convés bloqueava avatar
contra avatar. Um socket meio-morto deixava um fantasma parado exatamente no tile
de spawn, e quem entrasse depois nascia em cima dele e não andava mais. Três
consertos: no Gather se ATRAVESSA gente (colisão só com parede), o spawn virou
área e não ponto, e o servidor agora dá ping a cada 30s e derruba quem não responde.

**Identidade visual (2026-09-11):** os cinco módulos passaram a compartilhar um
sistema só, documentado em `DESIGN.md` e definido nos tokens do topo de
`public/os.css` — superfícies `--s0`..`--s4`, texto `--fg`/`--fg2`/`--fg3`, laranja
`--ac` como única cor de marca, escalas de raio, elevação, tipo e movimento.
Regra: componente não escreve hex; se falta cor, cria no `:root`. O Convés deixou
de ser claro estilo Gather e entrou na mesma paleta escura. A seleção do quadro
virou laranja (era azul do tldraw) e o cartão de tarefa da Carta usa a superfície
do cartão da Rota, porque é a mesma tarefa.

**Armadilha que custou caro:** `botao.onclick = entrar` passava o MouseEvent como
argumento `ident`, então o nome e a cor digitados eram descartados e todo mundo
entrava como "convidado" com laranja. Handler de entrada sempre com seta:
`onclick = () => entrar()`.

**Design vem de componente de produção, não de improviso (2026-09-11):** o visual
do Koncord OS foi modelado em componentes reais do 21st.dev — `modern-animated-sign-in`
(porta), `sidebar-001` + `dashboard-sidebar` (trilho), `kanban-board` (Rota) — e a
tabela de origem está em `DESIGN.md`. A cota do `get_component` no plano free é de
**2 por dia**, então vale escolher qual código buscar e modelar o resto pela imagem
de preview.

**Personagem do Convés (2026-09-11):** o boneco é desenhado em código, não é sprite.
`desenharPersonagem(ctx, x, y, o)` em `public/os.js` é o ÚNICO desenho — usado no mapa
e na prévia do vestiário, pra prévia não mentir. O look (`pele`, `cabelo`, `corCabelo`,
`roupa`, `acess`) fica no localStorage, vai no `hello` e é validado no servidor por
`limparLook()`. A foto de perfil do chat não é mais usada no mapa: só o boneco e o nome.
**Não entra sprite de banco de imagens** — o que o tanpz mandou tinha marca d'água de
stock. Se for pra sprite, tem que ser CC0 (Kenney.nl) ou LPC com a licença respeitada.

**Skins prontas:** dez personagens completos em `SKINS` (pessoa, cavalo, gato, cachorro,
sapo, panda, robô, dino, astronauta, fantasma), desenhados por `desenharFocinho()`.
Skin diferente de `pessoa` ignora pele/cabelo/roupa — ela manda na cor do corpo.
As miniaturas do vestiário são o próprio `desenharPersonagem` num canvas pequeno,
então skin nova aparece sozinha na grade: basta somar em `SKINS` e um caso no focinho.

## Gravação com versão (2026-09-12)

`dados.js` guarda `{v, valor}` e recusa PUT com versão velha (409 + valor atual).
`public/sincronia.js` funde por id e regrava. Antes disso, duas pessoas no mesmo
quadro se apagavam em silêncio — e, pior, uma resposta de ERRO era tratada como
"não tem dado": o módulo abria vazio e o autosave seguinte gravava o vazio por cima
de tudo. Hoje falha de leitura liga só-leitura em vez de gravar.
`testes/fusao.test.mjs` cobre os seis casos e o `deploy.sh` não sobe sem ele passar.



## O mundo do Convés virou tilemap de verdade (2026-09-25)

O cliente que vale hoje é `conves-v2` (Vite + Phaser 4 + React), servido junto com o
WebSocket pelo Worker do Cloudflare — o Express da VPS descrito lá em cima é história.

**`ferramentas/montar-assets.py` é o único lugar que transforma o acervo LimeZu comprado
(`~/Documents/KONCORD/extraido`) em asset servível.** Roda à mão, só quando o acervo muda:

- `assets/mundo/tiles.png` + `tiles.json` — atlas de terreno (grama, água, asfalto,
  calçada). As famílias de terreno vêm em **22 peças sempre na mesma ordem**, mapeada em
  `ORDEM_22` (no/n/ne/l/se/s/so/o, cantos internos, diagonais, base, cheio). Lida peça a
  peça numa grade ampliada, não chutada.
- `assets/mundo/pisos/*.png` — 68 estampas de chão, blocos de **48x32** (3x2 casas) da
  `Room_Builder_Floors`. O bloco inteiro é o padrão; recortar uma casa quebra a estampa.
- `assets/mundo/paredes/*.png` — 54 papéis de parede, recortes de **16x32** a partir do
  começo de cada faixa da `Room_Builder_Walls` (y+0 sombra, y+1..4 tampa, y+5 risco,
  y+6..30 face). Repetem na horizontal sem emenda.
- `assets/limezu/exterior/**` + `catalogo.json` — 5.548 recortes de exterior somados aos
  5.381 de interior. O jogo carrega móvel pelo campo `arquivo` do catálogo, então item novo
  não precisa de código.

**A grade de colisão cobre o mundo inteiro, inclusive coordenadas negativas** (`MARGEM=20`
casas de fora em volta do prédio). `tileBloqueado()` decide: dentro do prédio manda
`construirBloqueio()`, fora manda a planta do mundo (`mundo/arredores.ts`). Dá pra sair
andando, atravessar o parque e voltar.

**Duas regras de terreno que não são óbvias:** (1) a grama só desenha beirada contra
TERRA — contra calçada/asfalto ela fica cheia, porque a beirada da família traz terra
junto e ficava uma faixa de barro encostando no meio-fio; (2) a água é o contrário, a
família dela já vem com a beira de grama, então desenha borda contra tudo.

**A direção do avatar estava trocada e o jeito de descobrir foi medir.** A ordem das
direções na linha do spritesheet é `right, up, left, down` — descoberto contando pixels da
camada `Eyes` (olho em x=11 = perfil direito, sem olho = costas, x=4 = perfil esquerdo,
dois olhos = de frente). Está em `DIRECOES` no `avatarLimezu.ts`.

**`button[data-compacto]` no index.css** é a fuga do alvo mínimo de 44px. O seletor exigia
`data-compacto="sim"` e todo uso novo escrito como `data-compacto=""` passava batido —
bolinha de cor saía esticada em 44x26. Hoje basta o atributo existir.

**Vite/rolldown já serviu bundle velho com o mesmo hash depois de uma edição.** Quando o
comportamento no ar não bate com o código, conferir se o hash do `dist/assets/index-*.js`
mudou antes de caçar bug no navegador — e `?v=N` na URL pra não comer index.html de cache.

**2026-09-25/26 — a lição que custou caro: verificar o MUNDO, não só o código.** Quatro
auditorias de código (uma delas com agentes lendo arquivo por arquivo) deram todas "o
caminho está correto" para coisas que estavam quebradas na prática. O que achou de verdade
foi varrer a grade e medir ao vivo no navegador:

- A **voz nunca tocou**: uma linha descartava a faixa de áudio do LiveKit (`if (track.kind
  !== 'video') return`) e nada fazia `attach`. Todo o áudio espacial escrito em cima disso
  era no-op. Semanas no ar assim, porque ninguém abriu com uma segunda pessoa.
- **Quatro cômodos sem nenhuma entrada** (Biblioteca, Foco, Estúdio, Almoxarifado) e a
  Cozinha com 2 tiles de 112 — o desenho visto de cima parecia perfeito.
- **Ninguém via a skin de ninguém**: todo mundo aparecia com o boneco genérico.

Daí as três checagens em `conves-v2/ferramentas/`, que devem rodar depois de mexer na
planta ou nos NPCs — elas já pegaram 15 defeitos que nenhuma leitura pegou:

    npx tsx ferramentas/mapa-coerente.ts      # peça sobreposta, móvel na parede, cadeira inalcançável
    npx tsx ferramentas/alcance.ts            # todo cômodo tem como chegar
    npx tsx ferramentas/npcs-sem-colisao.ts   # dois NPCs na mesma casa, nas 24 horas

**Armadilha ao testar no navegador:** aba em segundo plano não roda um quadro do Phaser
(rAF suspenso) e o `worldView` da câmera fica do frame anterior. Já me fez "achar" um bug
de zoom que não existia. Para medir posição/caminho, leia o estado (`sc.caminho`,
`player.body.velocity`), não o resultado do movimento.

## 2026-09-26 — sentar, colisão, clique, DM, editor (commit `c52bc21`)

**DM de verdade:** a chave vive em `conves-worker/.dm-chave` (gitignored) e como
segredo `DM_CHAVE` do Worker. O navegador recebe por `https://koncord.pro/?dm=<chave>`
(salva em localStorage `koncord:dm` e some da URL). **A ferramenta do Chrome troca
segredo por marcador (`DM_KEY_1`) antes de chegar na página** — pra abrir o link,
usar `open -a "Google Chrome" "…?dm=$(cat .dm-chave)"` pelo terminal. Quem é
puxado precisa estar com o bundle novo, senão ignora o `puxado`.

**`wrangler dev` não sobe nesta máquina** (esbuild `spawn EBADF`, com ou sem
sandbox). Testar o front com `npx vite` sozinho: NPCs, cadeiras e colisão rodam
sem servidor. `wrangler deploy` funciona (fora do sandbox). Tem um `wrangler dev`
travado na 8787, aberto no Terminal do tanpz desde 24/09.

**Automação do Chrome engole o 1º clique depois de navegar** — não é bug do jogo.
Pra testar, clicar no "Entrar" via JS (`button.click()`).

**Coordenadas:** o boneco pisa uma casa ABAIXO do centro do sprite; colisão e
profundidade contam do centro. Por isso "linhas sólidas" da peça (manifesto
`backgroundTiles`) viram `linhasSolidas()` em mapaReal.ts relativo a `y`.

## Contas, papéis e sala no servidor (2026-09-26, commit após `dde4065`)

Resposta à auditoria de segurança. **Identidade = conta por convite + login e
senha** (tanpz exigiu login e senha, 2026-09-26): a dona gera o link `?convite=`
no painel "administrar" (Pessoas → administrar); quem abre cria login e senha
pela rota HTTP `/os-api/criar`. Depois entra de qualquer aparelho por
`/os-api/entrar`. Senha esquecida = link `?redefinir=` gerado pela dona.
Sem conta = visitante (sem DM, mesa ou edição). No dev, `/os-api` passa pelo
proxy do Vite (vite.config.ts) — nunca abrir CORS nessas rotas. A chave de
DM vira a conta de dona. **O chat Stoat está fora do ar pro público** —
concordchat.duckdns.org redireciona pra koncord.pro, que agora é o Worker — por
isso a conta não usa login do chat.

A conta de dona em produção é "tanpz", criada em 2026-09-26. Mesas e DMs antigas
(chaveadas por nome) ficaram no banco sem migrar, de propósito.

**Servidor importa `conves-v2/src/game/mapaReal.ts`** pra calcular a sala pela
posição e barrar passo que atravessa parede. Mudou a planta = o servidor precisa
de deploy também.

**Ambiente de teste:** `conves-teste` (workers.dev, DO próprio). Rotina:
`npm run deploy:teste && npm run e2e && npm run deploy` em conves-worker. Rodar o
e2e logo depois do deploy falha: a Cloudflare derruba as conexões do DO quando
a versão nova assume — esperar uns segundos.

**CI pronto mas não subido:** `.github/workflows/checagens.yml` está no disco; o
push foi recusado porque o token do `gh` não tem escopo `workflow`.
