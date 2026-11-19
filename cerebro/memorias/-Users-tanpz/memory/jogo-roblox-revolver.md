---
name: jogo-roblox-revolver
description: "Projeto de FPS de revólver no Roblox; documento-mestre em ~/Documents/Jogo Roblox Revolver, referência é \"Arena de Revólveres\""
metadata:
  node_type: memory
  type: project
  originSessionId: be10eec9-5ed1-4f57-a804-b3286522bd4f
  modified: 2026-11-16T16:47:46.141Z
---

tanpz quer construir um FPS de arena no Roblox que seja melhor que a referência **"[CLASSIFICADO] Arena de Revólveres"** (criador demilian): revólver de 6 balas + faca, deslize/corrida na parede, skins cosméticas por raridade, caixas com roleta, passe de batalha, ranqueado.

- Pasta: `~/Documents/Jogo Roblox Revolver/` — `DOCUMENTO-MESTRE.md` (v0.1, 2026-11-16) e `referencias/` com 27 quadros das gravações de tela.
- Roblox (player) e Roblox Studio 0.747 instalados em `/Applications` em 2026-11-16.
- Ordem combinada: documento-mestre primeiro, código depois. Plano em 8 fases (0 = protótipo de tiro).

**Why:** tanpz pediu explicitamente para montar todo o documento (o que é, menus, features, animações, skins) antes de criar o jogo.

**How to apply:** antes de codar, ler o documento-mestre e checar a seção 17 (decisões em aberto: diferencial, nome, quem modela skins, celular ou PC primeiro). Nomes e artes da referência não podem ser copiados; só a estrutura. Algo instalado no Mac move instaladores `.dmg` para `~/Applications` e apaga o `.dmg` sozinho — não estranhar.

**Estado em 2026-11-16:** DOCUMENTO-MESTRE na v0.2, com as análises quadro a quadro 01–06 (`analise/`) incorporadas: animações de partida (seção 9), telas transcritas (7), economia (11). As seis análises (01–06) estão incorporadas; a seção 10 cobre as animações de menu. Próximo passo é o tanpz responder as decisões da seção 19 e começar a fase 0. Fatos conferidos: headshot = abate 10 + bônus 5; facada dá 55 e não mata; abate dispara empinada + giro de 360° do revólver; barril vermelho e branco detonado por facada lança o jogador para cima. Gravação não mostra som, celular, corrida na parede nem pulo.

**Lição desta sessão:** tanpz quer vídeo analisado quadro a quadro. Amostrar por mudança de cena deixou buracos e eu afirmei "não gravado" sobre telas que estavam lá. Sempre varrer o vídeo inteiro em folhas de contato antes de dizer que algo falta. Ver [[verificar-antes-de-entregar]].

**Código (2026-11-16):** protótipo em `~/Developer/roblox-revolver` (Rojo 7.7 via brew; abrir `Revolver.rbxlx` no Studio, F5. **Desde 2026-11-16 o Revolver.rbxlx é salvo pelo Studio e guarda ServerStorage.Biblioteca (modelos da Creator Store): nunca mais `rojo build -o Revolver.rbxlx`; para checar build use outro arquivo. Fluxo da biblioteca: `tools/lib.py` + `Kit.lib`, ver [[roblox-preferir-biblioteca-roblox]]**). Decisão do tanpz: PC primeiro. Tem FFA com 5 bots, revólver com as animações do documento, faca, deslize, barril, HUD, tela de morte, fim de partida, 19 skins por cor, caixa com roleta, perfil em DataStore. Tudo montado por código, sem assets e sem som. Verificação possível daqui é só `tools/luau-lsp analyze` (ver LEIA-ME); eu não consigo apertar Play — o tanpz costuma estar usando o Mac em outra janela, então não automatizar a tela dele. Ao escrever, o código nunca tinha rodado no Studio: o primeiro retorno dele define o que consertar.

**Armadilha do Studio neste Mac:** com região pt_BR o Roblox Studio 0.747 não lê decimais com ponto (`Malformed number`, até em scripts da própria Roblox). Abrir sempre por `~/Developer/roblox-revolver/Abrir no Studio.command`, que usa `open --env LC_NUMERIC=C`. O Studio também ignora o arquivo passado na linha de comando: abrir por Arquivo › Abrir do arquivo. Erros de script dá para ler em `~/Library/Logs/Roblox/*Studio*_last.log` (linhas `CreatorError`), sem pedir print.

**Assets (2026-11-16):** tanpz quer tudo grátis e velocidade; aprimorar depois. Modelos CC0 do OpenGameArt (node 187893) em `assets/`, já convertidos para FBX separados por material em `assets/fbx/`. Subir para o Roblox depende de chave Open Cloud em `.roblox-key` (Assets API, leitura e escrita); userId dele 5360042968. Plugin Rojo instalado e `rojo serve` na porta 34872 para sincronizar ao vivo.

**Estado 2026-11-16 (tarde):** tanpz mandou construir tudo sem perguntar ("só pare quando entregar o jogo completo"). Feito e passando no verificador, mas maior parte nunca rodou: lobby 3D, 3 modos + votação, 3 mapas, bots R15 animados, sons (aprovados), pulo duplo/parede, missões, login, passe 30 níveis, Elo/perfil, efeitos de morte, configurações. Falta: loja com Robux (exige publicar o lugar e criar produtos), celular, música, Captura da Bandeira. Próximo passo útil: ele dar Play e eu ler erros do log.

**Estado 2026-11-16 (noite, segunda leva):** tanpz foi dormir pedindo "não para até terminar"; quer o jogo "viral", bonito, com armas no estilo CS2. Entrou, tudo passando no verificador e sem rodar no Studio: 4 armas-base com som e animação próprios (Xerife, Desert Eagle, Karambit, Butterfly; `Config.Weapons`), inspeção (F), estocada, ~60 skins com acabamentos, evolução de skin por abates, 8 auras, 5 caixas, 4 arenas fechadas feitas à mão (`src/server/Maps.luau`), parkour (`Parkour.luau`), movimentação nova (arrancada, escalada, embalo), bots com pathfinding. Mudanças estão na seção 20 do documento-mestre.

**Limite que expliquei a ele:** pediu armas "100% iguais ao CS2"; modelo e animação da Valve não entram (direito autoral, a Roblox derruba). Uso só modelos de licença livre: Desert Eagle do Umplix (CC0) e Butterfly do Ginsta (CC-BY 3.0, crédito obrigatório na descrição do jogo ao publicar). Originais em `assets/fontes/`, conversão por `tools/build_models.py`, que nomeia as malhas `<n>_<papel>_<grupo>` para o viewmodel saber cor e canal de animação.

**Calibração Blender → Roblox:** pelo pipeline de FBX deste projeto, +Y do Blender chega como +Z no Roblox e Z vira Y. Por isso todo modelo sai com a frente em +Y e o viewmodel gira 180°. Se o Roblox renomear as malhas no import, a Desert Eagle perde a animação do ferrolho e a Butterfly cai nas peças de bloco: conferir nas linhas `[Modelo]` do log.

**Como trabalhar aqui:** forks em paralelo (mapas, parkour, movimento) mais dois revisores só-leitura-e-conserto no fim funcionaram bem; os revisores acharam ~20 erros de execução que o verificador de tipos não pega.

**Terceira leva (2026-11-16, fim da manhã):** entraram Captura da Bandeira, controles de celular (`src/client/Touch.luau`, tela virtual 1280×720 em `Ui.canvas`), 2 músicas sintetizadas (`tools/music.py`), loja com Robux e ranking global. Loja e ranking só ligam com o jogo publicado: os ids em `Config.Products`/`Config.Vip` estão em 0 e o passo a passo está no LEIA-ME. Com isso não sobra feature pedida por fazer; o que falta é o tanpz dar Play, porque nenhuma das três levas rodou no Studio (só verificador de tipos e três revisões de código por leitura).

**Studio pelo MCP (2026-11-16):** o MCP do Studio está registrado no Claude Code (escopo user, `Roblox_Studio`). Para não depender das ferramentas MCP carregadas na sessão, use os scripts do projeto:
- `tools/studio.py <ferramenta> '<json>'` chama qualquer ferramenta do StudioMCP. Ele espera o Studio aparecer, porque o proxy às vezes devolve lista vazia.
- `tools/push.py [arquivos]` copia `src/` para dentro do Studio aberto. Precisa disso porque o Studio não tinha o código novo: o plugin Rojo não estava sincronizando.
- `tools/look.sh <nome> [arquivos]` envia, dá Play, entra na partida e salva o print no scratchpad.

Pegadinhas que custaram tempo:
- `execute_luau` e `user_keyboard_input` exigem `datamodel_type` (Edit/Client/Server).
- `screen_capture` exige `capture_id`.
- A tecla vai em `key_code` ("Two", "F"), e `wait` exige `wait_time_ms`.
- Enter não passa para o jogo: para entrar na partida, use `Remotes.PlayNow:FireServer()` no Client.

Imagens são geradas pelo Codex (pedido do tanpz) seguindo `assets/img/PROMPT-CODEX.md`. Depois, `tools/upload_imgs.py` sobe tudo via MCP `upload_image` e gera `src/shared/SkinTex.luau` e `Images.luau`.

**Visual pelas artes-conceito (2026-11-16):** mapas, lobby e parkour foram refeitos olhando `assets/img/conceito/*.png`. Para conferir, use `tools/mapshot.sh <mapa|lobby> <prefixo> [arquivos]` com `CAMS=` para câmeras extras, e `tools/menushot.sh` para as abas do menu (ele aperta M; ligar o `Menu.Enabled` na mão deixa as abas vazias).
- O lock do Studio é um **diretório** (`scratchpad/studio.lock`, criado com mkdir). Um arquivo com esse nome trava os scripts para sempre.
- Céu: panorama equiretangular cortado com ffmpeg v360. Ft = yaw 0, Lf = yaw 90, Bk = yaw 180, Rt = yaw -90, Up = pitch 90 + `transpose=2`. Lf e Rt trocados ou Up sem girar deixam costura.
- Iluminação: o servidor grava a luz do mapa em `ReplicatedStorage.MapLighting`. O cliente aplica `Config.LobbyLight` + LobbySky no lobby e a luz gravada na partida.
- Texto de SurfaceGui com TextScaled para em 100 px. Placa grande precisa de PixelsPerStud baixo (8–10) senão o texto fica minúsculo.
- A lava do parkour começa em x 6060: mais para trás ela aparecia embaixo do lobby.

Publicado em 2026-11-16 pelo tanpz (privado): placeId 83357254839497, universeId 10777257095, link https://www.roblox.com/games/83357254839497. A primeira publicação teve de ser manual (File › Publish), porque o MCP não cria jogo novo e o Publish fica cinza com o Studio em Play. Atualizações depois disso podem sair do Studio já ligado ao jogo.
