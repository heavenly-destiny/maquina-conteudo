# aslaniedits (Milad Aslani): famílias de estilo

Fonte: perfil @aslaniedits (51 posts no cabeçalho; a grade mostrou 48). Baixei os 48 e analisei cada um quadro a quadro (folhas de contato em `sheets/`, aberturas em `dense/`, espectrogramas em `spec/`, transcrição em `trans/`, números em `stats_novos.txt`). 6 eram só gravação de monitor com o editor aberto e ficaram de fora; sobraram 42 vídeos finais.
Traço comum: quase nada de voz. O vídeo é música + SFX + texto cinético sobre um presenter parado (spec ads B2B). Só 4 têm narração (DcZCi4Pzqg4, DaVsaAFzEd1, DLw_JtTzhz0, DKj2cIHT6m9). Alguns rostos vêm pixelados pelo próprio autor. Áudio entre -14 e -15 LUFS em quase todos.

## 1. glass-phone-presenter
- Como reconhecer: pessoa sentada num estúdio de cor única (azul marinho, preto com spot). Atrás dela, uma moldura de iPhone de vidro com a frase. Palavra-chave em 3 camadas: sans fina pequena, script itálica no acento e sans extra-bold gigante. Adesivos (X, cursor, selo verificado) flutuando em volta.
- Receita: moldura de 62% da largura, borda 2px rgba(255,255,255,.18), backdrop blur 8px, radius 64px. Apoio fade 200ms; script com wipe de clip-path em 400ms power2.out; palavra gigante com blur 20 a 0 e y 30 a 0 em 350ms expo.out. A palavra-chave tem uns 3x o tamanho do apoio e o ponto final vai na cor do acento. Troca de frase a cada 2 a 2,5s. Transição: a moldura vira ícone de app (morph de width, height e radius em 500ms power3.inOut), ou entra um swoosh de traço branco curvo, ou um zoom-blur de 200ms.
- SFX: whoosh em cada frase, bloop tonal em cada elemento de loading ou bolha, riser de 600ms antes da cena forte e 150ms de silêncio seco antes da virada. A música é baixa (-28 dB de mediana) e o SFX fica na frente.
- Melhores exemplos: Dfp71y-s_R- (spot preto + lima), De9DKKssi7a (azul, vermelho e esfera com cards de tarefa).

## 2. pixel-type-tech
- Como reconhecer: fonte pixel ou mono bitmap, uma palavra por vez, texto que se decodifica (letras aleatórias até formar a palavra), colchetes e pontos nos cantos, blocos de pixel como transição e um acento neon único (lima #dafc07) ou o fundo vinho.
- Receita: Pixelify Sans ou Silkscreen. As palavras trocam em corte seco a cada 0,25 a 0,35s, com flash de opacidade de 40ms. O scramble usa o ScrambleTextPlugin do GSAP em 600ms. Etiqueta lima girada -8° cai com back.out(2) em 350ms. A lista tipo seletor rola 1 item por vez (300ms power3.inOut); o item ativo fica em escala 1,4 e o resto em 30% de opacidade. Block wipe com ease steps(6). Pixels se juntam num grafo radial e viram logo.
- SFX: rajadas de click de teclado ou bitmap (1 por troca de palavra, até 4/s), blips de sintetizador curtos no scramble e bed quase mudo (-30 dB).
- Melhores exemplos: DfZivEts0Fz (fundo branco + lima, o mais limpo), DfWvqYMM7uA (vinho, para Claude/IA).

## 3. word-behind-person
- Como reconhecer: uma palavra gigante condensada (Anton/Bebas) atrás da pessoa recortada, às vezes com uma script em contraponto ('LEG' + 'Day', 'In' + '2027'). Cards de print ou de pílula colados do lado.
- Receita: 3 camadas (fundo, palavra, pessoa recortada). A palavra entra com blur e escala de 1,2 a 1 em 300ms e ocupa uns 80% da largura. Cor: vermelho #c41a1a no estúdio branco, branco ou lima em fundo de foto. Cards entram com rotação de ±6° e back.out. Grade com mais contraste e saturação.
- Melhores exemplos: DeC-xCeMrS6 ('sell', 'LEG Day'), Dew85IgsLQg ('Usa', '2027'), DdM5y4KMuq4 ('GYMS' + 'California'), Ddtgn8cs3sZ ('sell' + card 'fixes').

## 4. brand-cinematic-lightball
- Como reconhecer: preto e um amarelo só, uma bola de luz que funciona como cursor e transição, faixas verticais tipo persiana com texto em pé e uma revelação de logo com objeto 3D.
- Receita: a bola tem 40px, glow box-shadow de 60px, e um rastro de blur 8px com scaleX 3 enquanto se move. O texto acende por uma máscara que segue a bola. As faixas são 4 divs entrando de cima e de baixo alternadas, com stagger .08 e power4.out de 600ms. Riser de 1,5s antes, boom grave na revelação, quase sem cortes (0,18/s) e 3 atos em 11s.
- Melhores exemplos: DaIq2aZTlln (13 mil curtidas, o mais curtido do perfil), DaqdWstTiix (texto preso ao carro 'Fast' + astronauta 'Motion without Limits'), Dbde32ZNy_B (as 3 intros juntas). Serve de vinheta ou abertura de marca (Máquina, Stories Lab).

## 5. raw-vs-edited (formato)
- Como reconhecer: pílula branca 'Raw' / 'Edited' no topo e o mesmo take mostrado cru e depois editado, em pares de 2 a 3s.
- Receita: corte seco no beat. No Raw, o áudio fica fino (highpass); no Edited, música cheia e grade forte. Serve para qualquer material cru do tanpz e mostra o valor da edição (por exemplo, a Máquina transformando um vídeo).
- Melhores exemplos: DeC-xCeMrS6, DaVsaAFzEd1 ('antes' = só um card de microfone com a narração, 'depois' = o ad pronto), Dc0fP_HsxUm (só grade de cor), DGSMiOiM9ri (grade com painel de nós), DaBDvuNzxMc.

## 6. showreel-mix (formato)
- Como reconhecer: tela dividida em 2 colunas e um selo do editor no meio. Cada lado troca de trabalho a cada ~1s, defasado do outro.
- Receita: grid 540x1920 x2, clips de 0,9 a 1,2s, defasagem de 0,5s e 2 a 3 hits de SFX por segundo.
- Exemplos: Dew85IgsLQg, DfjpVDUM017, DdO3WCKsH24, DdGzvYQseOn (pôsteres de marca), Ddgax1nMt52, Da22K69TdGS, DSz5fQtkwcM (grade 2x2).

## 7. comment-reply-reveal (formato, o mais usado em out-dez/26)
- Como reconhecer: card branco de comentário do Instagram no topo, com a objeção ('My videos feel boring', 'Why are you editing in After Effects?') e a resposta curta ('I can fix that', 'Let me cook.'), sobre o take CRU. Depois de 1,2 a 1,5s, flash e o mesmo take EDITADO. Alterna cru e editado até o fim, em loop.
- Receita: o card é um div branco com radius 14px, sombra 0 8px 24px rgba(0,0,0,.08), avatar cinza e texto de 26px; resposta cinza menor com '•'. Troca: flash branco de 80ms, motion blur no presenter e scale 1 a 1,25. No editado entra a caption da família escolhida (palavra atrás da pessoa, glow caption, HUD branco, pílula ciano). Na volta ao cru, o grade fica lavado e não há texto. SFX: whoosh no flash e pop em cada card. A música é uma canção com vocal.
- Melhores exemplos: Dd055P_Mv1P (pílula ciano + 'mistake'), DdjDl5ksSfD ('Scripts' com pixel burst vermelho), Dcs61-6Mu81 (glow amarelo 'BOMB'), DdM5y4KMuq4, Dc8YWxAMwwT, DdYnM7ZMhwB (máquina de escrever 'LEG DAY').
- Para o tanpz: a objeção do público vira o comentário ('figurinha é coisa de criança?', 'dá pra fazer sem saber editar?') e a resposta é o story pronto.

## 8. glow-caption-pixel
- Como reconhecer: legenda no peito da pessoa com 2 linhas: uma palavra em script dentro de pílula com contorno e uma palavra black larga com gradiente de 3 cores e glow forte. Entra e sai por blocos de pixel na cor da paleta.
- Receita: escolher 3 cores análogas, nunca aleatórias. Exemplos tirados do próprio vídeo: dourado #EB8858 #EDBF1E #FFC000, verde #B5FF02 #1EED98 #D3FF6B e roxo #9638FF #B06AFF #BFBDFF. Palavra com background-clip:text linear-gradient(c1,c2,c3) e filter drop-shadow(0 0 14px c2) drop-shadow(0 0 40px c1). Pílula script com border 2px c2. Entrada: 10 quadrados de 22px nas cores, steps(3), 300ms, depois a palavra com blur 10 a 0. Um hit por troca.
- Melhores exemplos: Dcf4I_dzZHv (aula com os hex na tela), Dcs61-6Mu81 ('energy BOMB'), DdO3WCKsH24 ('What is Yohimbine' em pixel amarelo).

## 9. ui-widget-motion
- Como reconhecer: widgets e janelas de app estilo iOS (vidro, radius grande, glow colorido) contando uma história sem pessoa: notificação, mensagem, terminal digitando, gráfico subindo, barra de progresso, perfil.
- Receita: uma timeline contínua, sem cortes, em que cada elemento faz morph para o próximo (FLIP, 500ms power3.inOut). O cursor SVG segue um path bezier e o clique é scale .9 + ripple. Terminal com TextPlugin linha a linha. Número com gsap snap, gráfico com stroke-dashoffset. Fundo branco com 1 acento (lima #c9f84a) ou fundo escuro com fita de luz neon girando atrás do widget (SVG rect rx 120, stroke 18, blur 10, rotate). SFX: click e tick de digitação a 1,5 a 2 hits/s.
- Melhores exemplos: DbPEXWMTa5D (brief do cliente até o 'Send', ideal para a demo da Máquina), DcZCi4Pzqg4 (widget 'temperature 99°' + cards de vídeo, com narração), DZ550QyTO8W (barra de progresso + 'comente Progress').

## 10. noir-ink-kinetic
- Como reconhecer: P&B com textura de papel e sombra de cortina, um único vermelho (#de0d57) ou amarelo neon, título condensado caixa alta com uma palavra em script sobreposta e girada, recortes de figura (samurai, homem de terno sem rosto, cérebro), pétalas e poeira, mancha de tinta como transição.
- Receita: fundo #efeeef + grão + gradiente diagonal de sombra. Título Anton/Bebas em caixa alta, e a palavra-chave em script (Allura/Great Vibes) rotate(-6deg) por cima. Texto por palavra com blur 12 a 0 em 300ms. Ink reveal com vídeo de tinta em mask-image. Push-in lento constante (1 a 1,06 por cena). Com narração: corte para o insert P&B exatamente na palavra-conceito, 1,5 a 2,5s, e volta ao talking head. Legenda do talking head em condensada branca 64px no peito, mais uma palavra em script amarela com glow.
- Melhores exemplos: DLw_JtTzhz0 (recorte de podcast, formato ideal para os vídeos falados do tanpz), DKj2cIHT6m9 (ad narrado 'If you don't tell your story right').

## 11. athlete-neon-intro
- Como reconhecer: apresentação de pessoa (time, atleta, expert): fundo desfocado e escurecido, 2 fitas de luz neon em V atrás da pessoa e nome + marca embaixo em itálico largo. Cada pessoa tem uma cor.
- Receita: máscara da pessoa, fundo com blur 12px e brightness .5. Fitas são SVG com stroke grosso + blur 6px + drop-shadow neon animando stroke-dashoffset em 600ms. Card inferior com gradiente de preto 0 a 90%. Opcional: eco de movimento (4 cópias atrasadas 2-4 frames em screen) e flash branco.
- Melhores exemplos: DcTsz-DTDL_ (before/after com as 5 cores), DaQyebBTsx- (HYPERTREX, eco + grade teal).

## 12. saas-explainer-minimal
- Como reconhecer: explainer de serviço em cenas de 1,5 a 2s: frase curta em fundo sólido (preto, vermelho, azul) com feixe de luz em triângulo, depois branco com objetos 3D de vidro azul, número gigante ('+6M views'), avatares 3D cartoon orbitando.
- Receita: texto com blur 10px e x 60 a 0 em 350ms expo.out. Transição por clip-path de triângulo de luz que cresce. Objetos PNG 3D com rotate e motion blur durante o movimento. Whoosh em cada chicote.
- Melhor exemplo: DcigZUDzKhj.

## 13. mascot-logo-reveal
- Como reconhecer: mascote simples (cabeça preta de gato/morcego) com olhos vermelhos brilhantes que piscam e mudam de forma; nome ao lado decodificando até a marca; flash invertido.
- Receita: SVG com 2 elipses + drop-shadow vermelho. Loop com piscada (scaleY .1 em 80ms), olhar x ±6px e morph de rx/ry. Nome com ScrambleText e um blip por piscada.
- Melhor exemplo: Dax55qVzyAv. Encaixa no logo M da Máquina (personagem 'vivo').

## 14. particle-dark-promo (16:9)
- Como reconhecer: fundo preto, partículas roxas formando objetos (foguete, globo) que se desfazem, frases curtas brancas, arcos finos nos cantos.
- Receita: canvas com ~3000 pontos amostrados de um PNG, lerp para a próxima forma em 900ms, composite 'lighter'.
- Exemplo: Db1BsQYz6Fi.

## 15. cinematic-broll (16:9)
- Como reconhecer: filme horizontal de esporte ou carro sem texto (só um título): grade de filme (teal/laranja ou verde/laranja quente), macros, slow-motion e speed ramp, cortes no beat (até 7 por segundo).
- Receita: clips de 0,1 a 0,4s no beat, speed ramp de 1x para 0,3x no pico, grão e grade de filme.
- Exemplos: DdBhL7zMSSC (academia), DcB4NxETLjU (Porsche Singer), Da8K2sZt3LP (ski Red Bull). Pouco útil para reels 9:16 de venda.

## 16. process-breakdown (formato)
- Como reconhecer: bastidor sem gravar a tela. Mini-telas lado a lado mostram a construção camada por camada, cada uma com uma pílula de timeline e o nome da etapa ('Bg & Car PNG', 'Camera movements', 'Resualt').
- Receita: mockup de celular radius 40 + pílula 300x40 com a agulha correndo left 0 a 100%; a pílula muda de cor na etapa final.
- Exemplos: DbqpG6tTXQ4, DbnsjQNMF11.

## Top 5 para os reels do tanpz (dos 42)
1. DLw_JtTzhz0, noir-ink-kinetic: recorte de vídeo falado com legenda condensada + script e inserts P&B na palavra-chave. Molde direto para os cortes da Máquina.
2. DbPEXWMTa5D, ui-widget-motion: brief do cliente, terminal, gráfico e 'Send' numa timeline só. Vira o vídeo de demo da Máquina ou do Azufy.
3. Dd055P_Mv1P, comment-reply-reveal: objeção no card de comentário e resposta no editado. Pronto para Stories Lab ('dá pra fazer sem saber editar?').
4. Dfp71y-s_R-, glass-phone-presenter preto + lima: tanpz sentado com a frase na moldura de iPhone.
5. Dcf4I_dzZHv, glow-caption-pixel: legenda brilhante com 3 cores análogas e pixel burst, a caption mais 'premium' para talking head.
Reserva: DKj2cIHT6m9 (noir narrado), DcZCi4Pzqg4 (widgets com narração), DfZivEts0Fz (pixel-type branco), DeC-xCeMrS6 (raw vs edited).
