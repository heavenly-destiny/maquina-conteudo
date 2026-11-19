# Acervo de músicas (Reels)

Atualizado em 2026-11-18. Dados em `musicas.json` (`estilos` + `musicas`), painel em Inspirar > Músicas, API `GET /api/musicas`.

## Regra de direitos (leia primeiro)
- **Não guardamos música inteira.** Só links (TikTok, Spotify, YouTube, Deezer) e, quando existe, a **prévia oficial de ~30 s** do Deezer/iTunes em `previews/`, só para ouvir e sentir o clima.
- **Vídeo renderizado pela máquina sempre sai com trilha + efeitos sonoros embutidos**, mas com uma trilha **livre de direitos**: a máquina gera uma cama parecida com o ElevenLabs Music (`eleven_music_v2_5`) usando o `prompt_trilha` do estilo (mood, BPM, instrumentos, onde cai o drop). A música da lista é referência de clima, BPM e momento do drop.
- **Quando o próprio tanpz posta no Instagram**, pode anexar o áudio em alta nativo dentro do app (o algoritmo premia isso). Isso é feito no celular, na hora de postar, não no render.

## Como escolher
1. Defina o **estilo do vídeo** (tabela abaixo). Escolha 1 faixa de referência pelo mood e energia.
2. Alinhe o **drop** (`momento_do_drop_s`) com a virada do roteiro: revelação, prova, CTA.
3. Em render, use o `prompt_trilha` do estilo (ajuste BPM da referência). No post nativo, procure a faixa em alta pelo nome.
4. `tendencia`: prefira "subindo" e "no pico"; "caindo" só se combinar muito bem.
5. BPM e drop marcados como `estimado` são palpite; `deezer` é dado real.

## Por estilo de vídeo

### Motivacional / reflexivo (talking head emocional)
- Trilha base (ElevenLabs): `Cinematic emotional piano and strings, slow build over 45 seconds, soft sustained pad, warm low cello, gentle riser to a hopeful swell at the end, no vocals, room left for a speaking voice` (70 bpm, drop ~35 s)
- Time / Pink Floyd · nostálgico, grandioso · energia 3 · 123 bpm
- November / Past Day · calmo, reflexivo · energia 2
- Coming Up Roses / Harry Styles · esperançoso, suave · energia 2
- the cure / Olivia Rodrigo · pop-rock, emotivo · energia 4
- Eu Me Rendo - Ao Vivo / Felipe e Rodrigo · sertanejo, romântico · energia 2
- Eu Não Sou Terapia - Ao Vivo / Danilo e Davi · sertanejo, direto · energia 3

### Storytime
- Trilha base (ElevenLabs): `Intimate piano with light ambient pad, nostalgic and warm, minimal percussion, subtle tension in the middle then resolution, instrumental, under a spoken narration` (75 bpm, drop ~20 s)
- November Rain / Guns N' Roses · épico, nostálgico · energia 3 · 80 bpm
- Linger / The Cranberries · melancólico, doce · energia 2 · 189 bpm
- back to friends / sombr · indie, melancólico · energia 3
- Die With A Smile / Lady Gaga, Bruno Mars · romântico, épico · energia 3 · 157 bpm
- Flash / Hugo & Guilherme · sertanejo, romântico · energia 3
- Cornfield Chase / Hans Zimmer · inspirador, amplo · energia 3

### Tutorial / dica rápida
- Trilha base (ElevenLabs): `Light lo-fi hip hop beat, mellow keys, soft vinyl texture, steady drums, bright and focused, loopable, instrumental, leaves space for voice` (85 bpm, drop ~0 s)
- Sunshine (Instrumental) / Twista · leve, otimista · energia 3
- Blue Moon / Zara Larsson · suave, feminino · energia 2
- Mighty Love / Joakim Karud · lo-fi, leve · energia 2
- Inspired / Kevin MacLeod · leve, otimista · energia 2
- Dreams / Joakim Karud · lo-fi, calmo · energia 2 · 95 bpm

### Antes e depois / transição
- Trilha base (ElevenLabs): `Cinematic build with rising snare roll and riser, then an impact drop with bass hit and bright synth lead, energetic and satisfying, instrumental` (120 bpm, drop ~6 s)
- Time / Pink Floyd · nostálgico, grandioso · energia 3 · 123 bpm
- Mr. Brightside / The Killers · explosivo, nostálgico · energia 5 · 148 bpm
- Angel Of My Dreams / JADE · sedoso, sofisticado · energia 3
- Everlong / Foo Fighters · intenso, crescente · energia 4 · 158 bpm
- Nicole Kidman / ADÉLA · pop, confiante · energia 4
- WINDOWS IN BRAZIL (Sped Up) / VHM4D, ahh · phonk-pop, acelerado · energia 5

### POV / humor
- Trilha base (ElevenLabs): `Quirky playful bounce with pizzicato, funky bass and brass stabs, comedic timing with a sudden stop, instrumental` (110 bpm, drop ~2 s)
- Stop The Wedding! / Ashe · dramático, irônico · energia 3
- The Blue Danube Waltz / Royal Symphony Orchestra · clássico, cômico · energia 3
- Housewife / Tate McRae · pop, sassy · energia 4
- Hold On, We're Going Home / Drake, Majid Jordan · cool, noturno · energia 2 · 100 bpm
- Dame Hombro / Bulin 47, Kevin Wai, Breyco En Producidera · latino, dançante · energia 5
- Thriller / Michael Jackson · sombrio, dançante · energia 4 · 118 bpm

### Lista / ranking
- Trilha base (ElevenLabs): `Upbeat modern pop-electronic with steady pulse, short punchy stabs every beat, clean and rhythmic, instrumental` (118 bpm, drop ~0 s)
- I Knew It, I Knew You / Taylor Swift · leve, pop · energia 3
- Mr. Brightside / The Killers · explosivo, nostálgico · energia 5 · 148 bpm
- Everlong / Foo Fighters · intenso, crescente · energia 4 · 158 bpm
- Sunshine (Instrumental) / Twista · leve, otimista · energia 3
- Funkytown / Lipps Inc. · disco, festivo · energia 4 · 120 bpm
- Mentira ou Verdade / DJ Biel do Furduncinho · funk, brincalhão · energia 5

### Bastidores / rotina
- Trilha base (ElevenLabs): `Warm acoustic guitar and soft pop beat, cozy daily-life mood, light claps, feel-good, instrumental` (100 bpm, drop ~0 s)
- Last Christmas / Wham! · festivo, leve · energia 3 · 107 bpm
- It's Beginning to Look a Lot Like Christmas / Michael Bublé · festivo, caloroso · energia 3 · 130 bpm
- Christmas Market / Eoneun · aconchegante, calmo · energia 2
- November / Past Day · calmo, reflexivo · energia 2
- Coming Up Roses / Harry Styles · esperançoso, suave · energia 2
- I Knew It, I Knew You / Taylor Swift · leve, pop · energia 3

### Venda / oferta
- Trilha base (ElevenLabs): `Confident upbeat commercial pop with punchy drums, bright synth plucks, energetic call-to-action lift, drop on the offer reveal, instrumental` (125 bpm, drop ~3 s)
- Last Christmas / Wham! · festivo, leve · energia 3 · 107 bpm
- It's Beginning to Look a Lot Like Christmas / Michael Bublé · festivo, caloroso · energia 3 · 130 bpm
- Christmas Market / Eoneun · aconchegante, calmo · energia 2
- Stop The Wedding! / Ashe · dramático, irônico · energia 3
- Beauty And A Beat x Cola (Altégo Mix) / altego_music · energético, brilhante · energia 5 · 128 bpm
- Hold On, We're Going Home / Drake, Majid Jordan · cool, noturno · energia 2 · 100 bpm

### Podcast recut
- Trilha base (ElevenLabs): `Subtle soft ambient bed, light lo-fi chords, very low presence, steady and unobtrusive, instrumental` (80 bpm, drop ~0 s)
- Mighty Love / Joakim Karud · lo-fi, leve · energia 2
- Inspired / Kevin MacLeod · leve, otimista · energia 2
- Dreams / Joakim Karud · lo-fi, calmo · energia 2 · 95 bpm

### Luxo / ostentação / resultado
- Trilha base (ElevenLabs): `Dark trap and phonk beat with deep 808 bass, cowbell, slow and dominant, hard drop, instrumental` (140 bpm, drop ~4 s)
- Beauty And A Beat x Cola (Altégo Mix) / altego_music · energético, brilhante · energia 5 · 128 bpm
- Angel Of My Dreams / JADE · sedoso, sofisticado · energia 3
- Nicole Kidman / ADÉLA · pop, confiante · energia 4
- WINDOWS IN BRAZIL (Sped Up) / VHM4D, ahh · phonk-pop, acelerado · energia 5
- BbY WOW / KAROL G · latino, ousado · energia 4
- DESFILE BÉLICO / TOKIODK · agressivo, sombrio · energia 5

### Tensão / suspense
- Trilha base (ElevenLabs): `Dark cinematic pulse with low strings ostinato, deep drone, ticking rhythm that accelerates, ends on a hard stinger, instrumental` (90 bpm, drop ~25 s)
- Thriller / Michael Jackson · sombrio, dançante · energia 4 · 118 bpm
- Time (Inception) / Hans Zimmer · épico, emotivo · energia 4 · 60 bpm
- Lux Aeterna / Clint Mansell · tenso, urgente · energia 4 · 133 bpm
- Mind Heist / Hans Zimmer · sombrio, ritmado · energia 4
- Dream Is Collapsing / Hans Zimmer · urgente, grave · energia 4
- Murder In My Mind / Kordhell · agressivo, sombrio · energia 5

### Épico / inspiracional
- Trilha base (ElevenLabs): `Epic orchestral trailer music, heroic brass, driving strings and taiko drums, big choir-like swell and triumphant climax, instrumental` (100 bpm, drop ~12 s)
- November Rain / Guns N' Roses · épico, nostálgico · energia 3 · 80 bpm
- Time (Inception) / Hans Zimmer · épico, emotivo · energia 4 · 60 bpm
- Cornfield Chase / Hans Zimmer · inspirador, amplo · energia 3
- Heart of Courage / Two Steps From Hell · heroico · energia 5
- Victory / Two Steps From Hell · triunfal · energia 5
- Strength of a Thousand Men / Two Steps From Hell · poderoso · energia 5

### Hit do momento (BR)
- Trilha base (ElevenLabs): `Current Brazilian trend sound; use native trending audio only when he posts himself, in machine renders use the style bed instead` (100 bpm, drop ~0 s)
- the cure / Olivia Rodrigo · pop-rock, emotivo · energia 4
- BbY WOW / KAROL G · latino, ousado · energia 4
- back to friends / sombr · indie, melancólico · energia 3
- Die With A Smile / Lady Gaga, Bruno Mars · romântico, épico · energia 3 · 157 bpm
- Pós - Ao Vivo / Felipe e Rodrigo · sertanejo, emotivo · energia 3
- Postinho de Gasolina / João Gustavo e Murilo · sertanejo, divertido · energia 3

## Top 10 em alta agora (Instagram semana + Spotify BR/Global)

1. Stop The Wedding! / Ashe (subindo)
2. Pós - Ao Vivo / Felipe e Rodrigo (no pico)
3. Postinho de Gasolina / João Gustavo e Murilo (no pico)
4. Eu Me Rendo - Ao Vivo / Felipe e Rodrigo (no pico)
5. Geme Baixo / MC Jvila (no pico)
6. Mega Hair - Ao Vivo / Netto Brito (no pico)
7. Fala Pra Sua Saudade - Ao Vivo / Felipe e Rodrigo (subindo)
8. Flash (Minha Mente) 💠 / Hugo & Guilherme (subindo)
9. Flash / Hugo & Guilherme (caindo)
10. Time / Pink Floyd (no pico)

## Como atualizar
- Automático: o painel roda `atualizar.py` em segundo plano no máximo 1x por dia quando a lista é aberta e está com mais de 24 h. Também há o botão de atualizar na aba Em alta.
- Manual: `python3 atualizar.py` nesta pasta. Puxa ranking Spotify BR e Global (kworb), lista semanal do Instagram (SocialPilot), capas, BPM e prévias (Deezer). Faixas novas do top 20 entram sozinhas como "hit do momento".
- Curadoria manual (artigos semanais do Later/Hootsuite/Buffer/Metricool e TikTok Creative Center, que não têm acesso público automático): editar `musicas.json` à mão e rodar `python3 ../build_hub.py hub.json` na pasta `estilos`.
- Busca no painel: qualquer faixa do Deezer/iTunes pode ser adicionada ao acervo com "Usar no vídeo".

## Fontes
SocialPilot (semana 17 a 25/11/2026), Metricool (2/11/2026), HeyOrca (13/11/2026), kworb.net Spotify BR e Global (diário), Deezer API, curadoria própria para as trilhas clássicas por estilo (marcadas como "curadoria", não são ranking).
