# Acervo de formatos virais

Referência para a máquina reconhecer e adaptar qualquer formato a qualquer nicho. NÃO é regra do conteúdo pessoal do tanpz.
Exemplos reais em `formatos/<formato>/videos/<id>.mp4`, folha de 12 frames em `sheets/`, transcrição em `transcricoes/`, análise item a item em `analise.json` (gancho, estrutura, visual, som, por que prende, receita).

Ferramentas padrão de toda receita:
- **Imagens/personagens**: imagem gerada com folha de personagem (frente, perfil, 3 expressões) e o MESMO prompt-base + imagem de referência em todas as cenas. Sem isso o personagem muda de cara e o vídeo fica amador.
- **Motion e legenda**: HyperFrames (HTML/GSAP). Legenda palavra a palavra, cortes, cartelas, caixinha do Instagram, HUD de números, divisória de tela.
- **Voz**: ElevenLabs (paga). Narrador neutro rápido para curiosidade; grave para motivacional; 1ª pessoa coloquial para storytime; feminina empolgada para Stories Lab.
- **Trilha e SFX**: trilha por emoção (tensão onde tem tensão), SFX em toda ação visível (pop, whoosh, impacto).
- **Ritmo geral**: gancho visual + frase em até 1,5 s, troca de imagem a cada 1,5 a 3 s, nada parado mais de 3 s, final que fecha a curiosidade (ou corta no ápice com "parte 2").

---

## 1. Historinha com bonequinhos

Como reconhecer: personagem desenhado/animado (não gente filmada) vivendo uma micro-história de 15 a 75 s, com começo, tensão e virada. Às vezes sem voz (só visual), às vezes narrado com legenda.

### 1a. Pixel art, objeto com rosto, sem fala
Exemplos: `UPPhwIMrkSg` (23,8M), `SrMiqBGpsjU` (21,2M). Giz de cera branco que ninguém escolhe vira herói no papel preto.
- Receita: 6 a 8 cenas pixel art 9:16; o "excluído" do nicho; rejeição, frustração, contexto muda, só ele resolve, celebração. Movimento em steps (8 a 12 fps, sem easing suave). Mão humana entra de fora do quadro. Chiptune + SFX 8-bit. Sem voz, sem legenda.
- Tempo: 15 s. Cena 1,5 a 2,5 s.
- Amador: pixel "borrado" (imagem escalada sem nearest-neighbor), easing suave em pixel, personagem que muda de tamanho de pixel entre cenas, texto explicando a moral.
- Adaptações:
  - App de figurinhas: a figurinha branca minimalista que ninguém usa; no story escuro ela é a única que aparece bonita.
  - Comunidade de IA: o prompt "sem graça" que ninguém copia; no trabalho de verdade só ele entrega.
  - Emagrecimento: a garrafinha d'água esquecida na geladeira cheia de refrigerante; no fim ela é a escolhida.

### 1b. Pixel art narrado (caso real bizarro)
Exemplo: `KL25VlV9U28` (28,8M), Posit Pixel. Adesivo de fruta preso no nariz por 7 anos.
- Receita: 70 a 90 palavras; 1ª frase já é a ação; uma imagem pixel por frase (8 a 12), 1 ou 2 cortes "por dentro" (anatomia, celular, extrato). Voz narradora rápida. Legenda branca bold com sombra, 2 a 3 palavras, centro. Ken Burns leve.
- Tempo: 30 s.
- Amador: começar com "você sabia", narrador lento, legenda longa.
- Adaptações: emagrecimento (a mulher que "fazia tudo certo" e o vilão era o suco de caixinha); IA (o freelancer que perdeu o cliente por um prompt errado); figurinhas (a loja que triplicou vendas trocando só o story).

### 1c. Stick figure / 2D cartoon storytime
Exemplos: `gQp-2HUy_EI` (66,5M, Alan Becker, sem fala), `2elDoIE5Zj8` (86M, storytime em 1ª pessoa "a primeira vez que eu...").
- Receita: personagem fixo de 2 cores (palitinho) ou cartoon flat; fundo de cômodo simples; 10 a 14 cenas. Sem fala: gag repetida 4 a 6 vezes com SFX. Com fala: voz 1ª pessoa coloquial com pausa de comédia, legenda caixa alta com contorno, 1 a 2 palavras. Uma cena de "tela de celular" no meio para quebrar padrão.
- Tempo: 30 a 60 s.
- Amador: vídeo horizontal com tarja, personagem sem expressão, cenários diferentes demais entre cenas.
- Adaptações: "a primeira vez que pedi pro ChatGPT fazer meu trabalho" (IA); "a primeira vez que postei story sem figurinha" (Stories Lab); "a primeira vez que tentei jejum" (emagrecimento).

### 1d. 2D flat vetorial explicativo (Kurzgesagt) e mascote fofo (Psych2Go)
Exemplos: `VYhUa3WC4nU` (3,9M, finanças "ser pobre é caro"), `qm5xRjWcJ4c` (120k, relacionamento).
- Receita: tese polêmica na 1ª frase; UMA metáfora visual que volta (cobra = dívida); paleta de 3 cores profundas; HUD animado em HyperFrames (barras, contadores, gráfico de pizza). Mascote redondo com 1 detalhe para temas sensíveis. Voz calma.
- Tempo: 60 a 75 s.
- Amador: gradiente de várias cores, ícones genéricos de banco de imagem, voz sem pausa.
- Adaptações: "dieta da moda engorda: veja a armadilha" (cobra = efeito sanfona); "postar todo dia sem estratégia te deixa invisível" (Stories Lab); "usar IA de graça te deixa mais pobre" (comunidade IA).

### 1e. 3D (CGI / Pixar gerado por IA / massinha)
Exemplos: `ob4_mDwWkM0` (30,2M, Zack D. Films "e se tivéssemos coração de beija-flor"), `MLMZK82lXqc` (82,3M, gatos estilo Pixar, mãe exausta), `S0afUuALZVg` (173,6M, massinha com bastidor embaixo).
- Receita CGI "e se": pergunta impossível + resposta científica visual; personagem fixo com roupa da marca; alterna "por fora" e "raio-x por dentro"; voz rápida; legenda curta.
- Receita Pixar IA: dor do público contada com bichos fofos antropomórficos; 8 a 12 imagens com o mesmo personagem; image-to-video curto ou Ken Burns; cartelas pretas de tempo ("À noite") para ritmo de série; balão de fala com ícone.
- Receita massinha: em cima a história, embaixo a mão fazendo (ou a tela do app fazendo).
- Tempo: 30 a 40 s.
- Amador: personagem que muda de rosto entre cenas (sem referência), olhos mortos, blur exagerado nas bordas, movimento de IA "derretendo".
- Adaptações: "E se você comesse só proteína por 30 dias?" (emagrecimento, CGI); gata mãe tentando postar story bonito enquanto os filhotes destroem a casa (Stories Lab, Pixar IA); robozinho de massinha aprendendo um prompt, bastidor = tela do ChatGPT (IA).

---

## 2. Caixinha de pergunta

Como reconhecer: o sticker de pergunta do Instagram (cabeçalho escuro, corpo branco, cantos arredondados) ou o balão "responder comentário" no topo, e a resposta abaixo.

### 2a. Print da caixinha sobre pessoa falando
Exemplos: `eF2V0YvJ95w` e `MJ52B_lagHo` (nutricionista, série "Quintas"), `_iFFsfWxjY0` (resposta única com humor).
- Receita: 6 a 8 perguntas reais, as mais absurdas primeiro; caixinha em HTML idêntica à nativa no terço superior (sobe com mola, 200 ms); resposta em selfie de 1 frase; legenda palavra a palavra colorida embaixo do queixo; corte seco entre perguntas. Série com nome fixo no cabeçalho da caixinha.
- Tempo: 4 a 6 s por pergunta; 30 a 60 s total.
- Amador: caixinha que não parece a nativa (fonte errada, sombra pesada), resposta longa, perguntas educadas demais.
- Adaptações: "Quinta da dúvida" do Stories Lab ("dá pra usar figurinha no story de loja?"); comunidade IA ("o ChatGPT vai roubar meu emprego?" "só se você não usar"); emagrecimento ("comer à noite engorda?").

### 2b. Balão de comentário + teste ao vivo
Exemplo: `u_kppQ4c0yA` (3,8M). Comentário pede reação a um viral; ela testa e pede palpite.
- Receita: comentário real no 1º segundo; testar na frente da câmera; pedir palpite antes do resultado.
- Adaptações: "testei a figurinha que vocês pediram no story da minha mãe"; "testei o prompt do comentário"; "testei a receita fit do comentário".

### 2c. Respondendo com prova (prints, vídeos, álbum)
Exemplos: `i7EBz_QOCmo` (prints do celular), `JRjtlH2fa2g` (vídeos da filha), `6-2uRomCbwg` (publi: cada pergunta vira benefício do produto).
- Receita: caixinha como índice de compilação; cada resposta é prova visual de 3 a 4 s (print, gravação de tela, antes/depois de cliente). Em anúncio: escreva as objeções como perguntas de seguidor com nome e cidade.
- Adaptações: "mostra sua tela inicial" respondido com o app; "mostra resultado de aluno" com prints; "qual o cheiro da sua casa?" vira publi.

### 2d. Versões animadas
Exemplos: `f0Zl6c4wppg` (cartelas tipográficas "You asked? He answered."), `m6IIbNLD76o` (personagens buscam a resposta).
- Receita: pergunta em cartela cheia de 1,5 s (fonte condensada, cor da marca, entra com mola) ou caixinha voando até um mascote que "vai buscar" a resposta em 3 cenas. CTA final "manda sua pergunta".
- Referência de fluxo nativo: `_1NZOTO3Vc4` (como responder a própria caixinha no Instagram).
- Amador: caixinha estática sem animação de entrada, pergunta legível por menos de 1 s.

---

## 3. Tela dividida

Como reconhecer: duas áreas simultâneas (cima/baixo ou lado a lado), uma prende o olho e a outra entrega a informação. Legenda quase sempre na linha da divisão.

| Variante | Exemplo | Divisão | Uso |
|---|---|---|---|
| Reação em cima, vídeo embaixo | `REjNdfv7mUw` (46,2M) | 50/50 | reagir a viral, ao próprio antes, a cliente |
| Meme em cima, tela embaixo (iniciante x pro) | `nCAD6fyutJ0` (12,2M), `BNJmUDhF0mo` (20,9M) | 30/70 | tutorial de app/ferramenta |
| Clipe em cima, podcast embaixo | `C-XJM_Vvf_0` (971k, Flow) | 55/45 | cortes de podcast/live |
| Conteúdo em cima, gameplay/satisfatório embaixo | `9HDfau6he8c` (8,8M) | 50/50 | áudio longo (história, explicação) |
| Antes/depois sincronizado | `Kif27maJd0M` (7,5M) | 50/50 | comparação de versão, transformação |
| Minha versão x original | `tKaCeMPW6ro` (15,8M) | lado a lado | "fiz igual?" |
| Resultado em cima, bastidor embaixo | `S0afUuALZVg` (173,6M) | 50/50 | processo, making of |
| Grid de imagens em cima, apresentador embaixo | `OZAGgEOA00s` (3,6M) | 50/50 | ranking/escala |

- Receita geral: HyperFrames com dois `<video>` em containers `object-fit: cover`, divisória fina (2 px) da cor da marca ou nenhuma; legenda na divisória; a metade "conteúdo" troca a cada 3 a 5 s; a metade "rosto" fica fixa.
- Podcast com dois quadros (sem exemplo baixado com prova de views): host em cima, convidado embaixo, cada um em `cover` com o rosto no terço central; destacar quem fala com leve zoom 1,03.
- Motion em cima e pessoa embaixo (sem exemplo direto; o mais próximo é `C-XJM_Vvf_0` e `VKtLawjHbAU`): motion de dados/ícones em cima ilustrando a frase dita embaixo.
- Amador: cortar a cabeça da pessoa na divisão, duas legendas competindo, metade de cima com tarja preta de vídeo horizontal, gameplay com HUD poluído.
- Adaptações:
  - Stories Lab: em cima "iniciante" caçando figurinha no Drive com meme cansado, embaixo "PRO" colando em 2 toques no app.
  - Comunidade IA: em cima o tanpz reagindo, embaixo o resultado de um aluno (antes/depois do prompt).
  - Emagrecimento: antes/depois sincronizado do prato (mesmo enquadramento), rótulos pequenos no canto.

---

## 4. Outros formatos virais (com prova de views)

### 4a. POV em 1ª pessoa
`mMi2MZ_ZwiM` (48,5M) "POV: você é o Papai Noel". Câmera no peito, mãos do personagem em cena, texto "POV: ..." pequeno. Adaptação: "POV: você é a figurinha esquecida no Drive"; "POV: você é o ChatGPT recebendo o prompt do seu chefe"; "POV: você é a balança na segunda-feira".

### 4b. Green screen / notícia com prova em cima
`VKtLawjHbAU` (6M), Dylan Page. Vídeo/print da notícia em cima, ele embaixo; título em pílula branca na divisória; "aqui está o que você precisa saber". Adaptação: notícia do nicho (atualização do Instagram, lançamento de IA, estudo de nutrição).

### 4c. Explicador andando + dado animado
`jy8J7LrD1uA` (2,9M). Promessa útil "se X, faça Y", grava no lugar, números grandes verdes animados. Adaptação: "se seu story não tem visualização, faça isso" gravado andando com números de alcance animados.

### 4d. Faceless com voz de IA sobre fundo satisfatório
`3ankXKxthnQ` (811k), `tXChyYGZ_Cc` (139k). Confissão polêmica em 1ª pessoa, voz TTS, legenda 1 palavra no centro, parkour de Minecraft. Termina no ápice com "parte 2". Adaptação: história de cliente/aluno narrada; fundo = gravação satisfatória sem direitos (receita, slime, app rolando).

### 4e. Lista numerada falada
`KfHuvB2qssI` (11,9M) "5 coisas que você não sabia que precisava". Cada item 6 a 10 s com B-roll real e engraçado; legenda caixa alta gigante. Último item é o produto.

### 4f. Ranking / escala visual
`OZAGgEOA00s` (3,6M) "quando você considera limpo?". Grid 2x2 de níveis, seleção em verde, opinião embaixo; pede discordância. Adaptação: "quando um story está bonito?" com 4 níveis.

### 4g. Clipe curado com 1 frase
`BdeCOOCJAdk` (7,3M, 16 s). Momento real + caixa preta com uma frase. Zero produção.

### 4h. Discurso sobre B-roll de cinema
`fLeJJPxua3E` (5,6M). Discurso forte, B-roll por frase, trilha épica. Em 9:16 usar legenda grande central.

### 4i. Clipe horizontal com título em tarja
`B_7Iyi8zPj8` (8,6M). Horizontal no meio, título emocional com emoji em cima, legenda embaixo. Para reaproveitar vídeo horizontal sem esticar.

---

## Checklist antes de entregar qualquer formato
1. O gancho aparece em até 1,5 s (imagem + frase)?
2. Existe tensão e virada? A curiosidade só fecha no fim?
3. Personagem idêntico em todas as cenas (mesma referência)?
4. Legenda legível no celular (2 a 3 palavras, contraste, fora da área de UI do Reels)?
5. SFX em toda ação, trilha coerente com a emoção?
6. Foto/cena nunca repete dentro do vídeo nem no lote.
