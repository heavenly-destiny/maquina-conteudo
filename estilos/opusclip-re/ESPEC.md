# OpusClip + Higgsfield: engenharia reversa e especificação para a Máquina de Conteúdo

Levantado em 18/11/2026, só com material público (sem conta, sem login).

## Legenda das fontes

| Código | Fonte |
|---|---|
| H:slug | Central de ajuda oficial: `https://help.opus.pro/docs/article/<slug>.md` (cópias em `docs/`) |
| API | `https://help.opus.pro/api-reference/endpoints/create-project.md` e `.../brand-template.md` |
| PRECO | `https://www.opus.pro/pricing` |
| BLOG40 | `https://www.opus.pro/blog/opusclip-4-0` (OpusClip 4.0, 02/11/2026) |
| V1 mm:ss | Tutorial oficial, embutido na central de ajuda: youtube.com/watch?v=dvO5NsYovM4 ("OpusClip Tutorial 2026", 31 min). UI de meados de 2025/2026, antes das Recipes |
| V2 mm:ss | youtube.com/watch?v=J34WVQGt_-w ("Automatically Edit ANY Video! OpusClip 4.0 Tutorial"). UI nova, com Recipes |
| V3 mm:ss | youtube.com/watch?v=y2VOBHedcjg ("OpusClip Onboarding", conta nova) |
| T:nome | Vídeo oficial de prévia de cada template: `https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/<nome>-transcode.mp4` (cópias em `templates/`) |
| HF | Prints do site público higgsfield.ai, 18/11/2026 |

Prints de prova em `prints/` (nome = o que mostra). Vídeos brutos e transcrições em `videos/`.

Atenção: o OpusClip está no meio de uma troca de UI. A versão 4.0 (nov/2026) trocou "Brand template + Quick presets" por **Recipe + Brand Kit** (H:how-to-use-recipes, V2). Onde as duas versões diferem, as duas estão descritas.

---

## (a) Fluxo do OpusClip, tela por tela

### 0. Onboarding (primeira vez)
- Login Google/email, sem cartão; trial de 7 dias com 10 créditos (V3 0:30–1:10).
- O questionário aparece **depois** de clicar "Get clips in 1 click" no primeiro vídeo, num modal escuro com barra de progresso de 5 a 6 segmentos, enquanto o primeiro projeto processa ao fundo ("Your first project is currently processing 24% (ETA 5m)") (V3 3:00–4:30, `prints/opus-onboarding-perguntas-1.jpg`, `-2.jpg`):
  1. "Which best describes your role when using OpusClip?" (cards com ícone, 2 colunas): Media professional, Agency professional, Business marketer, Hobbyist creator, Educator, Professional content creator, Event organizer, Other.
  2. (se for negócio) "What is the size of the organization you work at?" (opções não confirmadas, V3 3:20 só na fala).
  3. "What is your current social media reach by followers?": 0–1,000; 1,000–9,999; 10,000–99,999; 100,000–499,999; 500,000+.
  4. "What kind of content do you primarily want to clip on Opus?": I do both equally / Original content (created by me or by my client) / Other content I found (remixing or curating existing content).
  5. "How did you first hear about us?": Saw an OpusClip watermark on a video, Recommended by a friend or colleague, OpusClip YouTube channel, Search engine, ChatGPT or other AI chatbot, Email newsletter, A blog or other website, An OpusClip ad on social media, In-person event, Influencer or other social media creator, Other.
- Não pergunta nicho nem pede áudio/voz. O questionário **não muda a UI** (crítica do próprio V3 5:30).
- Depois sugere conectar YouTube para auto-import (V1 4:00) e mostra vídeos "Master OpusClip" no rodapé do dashboard (V3 6:30).
- Assistente de Brand template em 3 passos: 1 proporção, 2 estilo de animação da legenda, 3 logo (opcional) + "save my templates"; título "Set up your first brand template to increase brand exposure by 60%" (V1 5:00, `prints/opus-sidebar-wizard-brand-template.jpg`).

### 1. Dashboard / Home
`prints/opus-dashboard-e-envio-modelo-genero.jpg` (V1 0:25), `prints/opus-sidebar-wizard-brand-template.jpg` (V1 5:00)
- Sidebar esquerda (recolhível): seletor de workspace + "Invite members"; **Create**: Home, Brand template (4.0: Brand kit), Asset library; **Post**: Calendar, Analytics, Social accounts; rodapé: Subscription, Learning center, Affiliate program, Help center.
- Topo direito: sino, saldo de créditos (raio + número), "Add more credits".
- Centro: card com campo "Drop a YouTube link" (o placeholder troca a plataforma: "Drop a Zoom link"), links "Upload" e "Google Drive", botão branco cheio "Get clips in 1 click", link "Click here to try a sample project".
- Fileira de atalhos com ícone: Long to shorts, AI Captions, Video editor, Enhance speech, AI Reframe, AI B-Roll, AI hook.
- Abas de projetos: All projects (n), Saved projects (n), Favorite clips (n); à direita uso de armazenamento "0 GB / 100 GB", chips "Auto-save" e "Auto-import Beta".
- Cards de projeto: thumb 16:9, selo de plano, título, modelo usado ("ClipBasic"), "29 days before expiring", e progresso ao vivo "24% (ETA 25m)".

### 2. Envio do vídeo (configuração antes de processar)
UI antiga (V1 0:30–3:40, `prints/opus-dashboard-e-envio-modelo-genero.jpg`, `prints/opus-duracao-corte-autohook-timeframe.jpg`, `prints/opus-quick-presets-legenda-20-templates.jpg`):
- Botão "Get clips in 1 click" fica fixo no topo.
- Linha: "Speech language: English ▾", "Upload .SRT (optional)", "Credit usage: ⚡181".
- Thumb do vídeo + aviso de direitos autorais.
- Abas "AI clipping" | "Don't clip".
- Linha de dropdowns: Clip model, Genre, Clip Length, toggle Auto hook.
- "For best results, choose genres that fit your content": chips (versão com chips) ou dropdown.
- "Include specific moments" + campo de prompt + "Not sure how to prompt? learn more".
- "Processing timeframe" com selo verde "Credit saver" + slider de dois pontos (início/fim) + caixas de tempo.
- "Quick presets" | "My templates": grade de templates de legenda com setas ‹ › e "Choose aspect ratio ▯ 9:16 ▾".
- "Save settings above as default" (V1 3:30).

UI 4.0 com Recipes (V2 0:15–3:45, `prints/opus40-*.jpg`):
- Topo: nome do arquivo, sino, créditos, "Add credits".
- Card do vídeo: thumb "1080p", "Speech language: Auto ▾", "Genre: Auto ▾", lixeira; à direita "Adjust range" + "Credit saver" + tira de frames com dois pontos + tempos; embaixo "Layout ▭ 16:9, 1 layout ▾" e "Upload SRT".
- Dois seletores: **Recipe** (ex.: "Auto-edit talking videos ▾") e **Brand kit** ("No brand kit ▾"). Texto: "Your Recipe sets which edits run. Your brand kit sets the look, like your logo, intro, outro and caption style."
- "Recipe settings ˄" com seções e toggles (ver tabela (b)).
- Coluna direita **Summary**: cada edição ligada com seu custo ("Video processing 4 credits", "Captions Free", "AI video B-roll ⚡105 credits", "Auto SFX ⚡35 credits"…), **Total**, botão branco "Create", "By continuing, you confirm you have rights to use this video", e "Save your Recipe updates? Save".
- Modal **Manage Recipes** ("Save your auto-edit Recipes for repeat use"): abas "OpusClip Recipes" | "My custom Recipes", filtro, "+ Create new Recipe"; cards com thumb colagem, nome, descrição de 2 linhas, tag ("Clipping") e botão "Use Recipe" no hover.

### 3. Processamento
- Barra/percentual com ETA no card do projeto; e-mail ao terminar (H:email-notification-settings). Enquanto isso o usuário navega (V3 4:30–11:00).

### 4. Resultados (lista de cortes)
`prints/opus-agendar-post-e-grade-resultados-score.jpg` (V1 16:30), `prints/opus-detalhe-corte-score-hook-flow-value-trend.jpg` (V1 17:30)
- Barra superior: voltar, alternar **Grid / List**, nome do projeto, busca "Find keywords or moments… ⌘K", botão "Select", "Filter", ordenação.
- Faixa "Original clips (50)".
- Banner "Auto hook: A text hook has been added to the first 5 seconds of your top 10 ranked videos. If you don't need it, you can click 'Disable'…".
- **Grid**: cards 9:16 em 5 colunas; badge de duração "00:00 00:47" no canto; embaixo **nota grande verde (99, 98, 97)** + ícones calendário (agendar), download, X (descartar); título de 2 linhas gerado pela IA. Ordem padrão: maior score primeiro; opção cronológica (H:get-clips-faq-1).
- **List / detalhe do corte**: título "#2 …" com lápis (reescrever título com IA, setas ↑↓ para pular entre cortes, V1 18:00); à esquerda coração e polegar pra baixo, score "98/100" e notas por letra **A em Hook, Flow, Value, Trend**; player "LOW-RES PREVIEW"; ao lado "Scene analysis" (porquê do corte em 3 linhas) + transcrição com timestamps "[113:57 – 114:28]" e checkbox "Transcript only"; coluna de ações: Publish on Social, Export XML, Download HD, (4.0: Upscale & download), Edit clip, AI hook, Enhance speech, Add B-Roll, "9:16", Duplicate (4.0: AI tools ›).
- Re-prompt no topo para pedir mais cortes (H:select-keywords). Curtir/descurtir; descurtidos somem (H:get-clips-faq-1).

### 5. Editor do corte
`prints/opus-editor-transcricao-ai-enhance.jpg`, `prints/opus-editor-presets-brand-broll-tracker.jpg`, `prints/opus-layout-split-atalhos.jpg`, `prints/opus40-editor-e-resultado.jpg`
- Topo: voltar, título, desfazer/refazer, "Save changes", "Export", créditos.
- **Esquerda: transcrição como editor de texto.** "Add a section" no começo e no fim (puxa outro trecho do vídeo original), "Transcript only". Palavras-chave destacadas em cor, fillers em cinza, pausas como chips "0.74s" (4.0). Selecionar palavras abre menu: **Add** (AI B-Roll, Stock B-Roll, Emoji, AI hook), **Timing**, **Highlight**, lixeira (remover só legenda ou legenda + vídeo) (V1 19:00). 4.0: botão "Speech cleanup" e "Extend a clip".
- **Centro: preview** com barra "9:16 · Layout: Fill · Tracker: ON" (4.0 + "Color correction: ON"), botões de crop. Duplo clique na cena ou tecla X abre o crop manual (H:how-to-manually-reframe-content).
- **Direita: trilho de ícones** (V1 21:00): AI enhance, Captions, Media, Brand template (4.0: My library, Brand kit), B-Roll, Transitions, Text, Music, AI hook (4.0 também Hook, Graphics, Audio).
- **Embaixo: timeline** com "Hide timeline", split, lixeira, volume, snap, play, tempo "00:08.20 / 00:58.06", zoom; trilhas de texto/hook (verde), B-roll, vídeo com o nome do layout em cada segmento (Fill / Split / Fit), áudio (4.0 com waveform); "+" para intro e outro nas pontas.
- Painel **AI enhance**: Remove filler words, Remove pauses, Auto censor, Speech enhancement, Auto Generate AI B-Roll, Auto generate stock B-Roll, Auto generate AI hook, AI emoji, AI keywords highlighter, Auto transitions, Speaker colors (V1 20:30–21:30).
- Atalhos (V1 30:50): + / − zoom, \ ajustar timeline, ← → frame, D ou Ctrl+B dividir, Backspace apagar, 1/Home início, End fim, X crop.

### 6. Exportar e postar
- Export: download (HD; 4K só Business), XML para Premiere/DaVinci, agendar (H:get-clips-faq-1, V1 31:00).
- Modal **Schedule post** (`prints/opus-agendar-post-e-grade-resultados-score.jpg`, V1 14:00–15:30): coluna esquerda "+ Add account", filtro "All platforms", contas com check; centro **Regenerate copy** ("Ask AI to rewrite with your preferred tone, style, or hashtags", chips **Tone, Format, Mimic, Hashtag**, "Create Default", "Regenerate All"); abas Feed | Inbox; legenda com hashtags já geradas; ícones # @ IA; thumb do corte; botões "Select time" e "Publish now".
- **Calendar**: mês com posts; clicar no dia → "Select project" (abas Projects | Likes, "Upload own video") → escolher corte → modal acima. Fuso horário no topo (V1 14:00–15:30, H:schedule-clips).
- Plataformas: YouTube, Instagram Reels, TikTok, Facebook Page, LinkedIn Business, X, Pinterest, Threads, Bluesky (H:add-social-accounts).
- Extras: hashtags em alta do TikTok com contagem, marcar colaborador no Instagram, link do vídeo completo no YouTube (H:9747769-customize-my-posts). Analytics por post (V1 15:40; PRECO diz "coming soon" no Pro).

---

## (b) Tabela de todas as configurações

### b1. Entrada
| Configuração | Opções | Padrão | Onde | Fonte |
|---|---|---|---|---|
| Fonte do vídeo | Link: Apple Podcast, YouTube, Google Drive, Vimeo, Zoom, Zoom Clips, Rumble, Twitch, Facebook, LinkedIn, X, Dropbox, Riverside, Loom, Frame.io, StreamYard, Kick, Medal.tv, MP4 público; Upload local | campo de link | Home | H:video-sources-supported |
| Tamanho do upload | até 10 GB (Free/Starter), 30 GB (Pro) | | Home | PRECO |
| Duração máxima | 10 h | | | H:video-length |
| Auto-import | último vídeo/live do YouTube verificado | desligado | Home "Auto-import Beta" | H:auto-import, V1 16:00 |
| Idioma da fala | 25+ (en, de, es, fr, pt; demais em beta) | Auto (4.0) / English (antiga) | linha acima do vídeo | H:video-languages-supported, V2 |
| SRT próprio | upload .srt | opcional | ao lado do idioma | V1 0:40 |
| Modo | AI clipping / Don't clip (4.0: toggle "Clipping" na Recipe) | AI clipping | abas | V1 0:55 |
| Clip model | Auto ("Let AI choose the optimal model"), ClipAnything ("Our smartest model. Great for any videos"), ClipBasic ("Great for clipping talking videos") | Auto (UI); ClipBasic (API) | dropdown | V1 0:55, API |
| Genre | chips: Let AI detect, Podcast, Lifestyle, Sports, Marketing & Webinar, Entertainment, News, Informative & Educational, Show more; dropdown inclui Auto, Q&A, Commentary, Marketing, Webinar, Motivational speech, Podcast, Academic… | Auto / Let AI detect | dropdown ou chips | V1 0:25–1:10, `prints/opus-dashboard-e-envio-modelo-genero.jpg` |
| Clip Length | Auto (0m–3m), <30s, 30s–59s, 60s–89s, 90s–3m, 3m–5m, 5m–10m, 10m–15m | Auto (0m–3m); com ClipAnything aparece "Auto (<90s)" | dropdown | V1 1:25, H:select-clip-length |
| Auto hook | toggle; 4.0: dropdown Viral hook / Headline | ligado no upload manual, desligado no auto-import e na API | ao lado do Clip Length | H:auto-headline, V1 1:30 |
| Include specific moments | prompt livre (ClipAnything) ou palavras-chave (ClipBasic); só em inglês | vazio | campo | H:select-keywords, H:clip-anything-prompt-manual |
| Processing timeframe | slider início/fim, selo "Credit saver" | vídeo inteiro | abaixo do prompt | V1 2:00 |
| Quantidade de cortes | **não é escolhida**; depende da duração: 0–3 min 1–2; 3–10 min 3–14; 10–30 min 5–21; 30–60 min 23–32; 60–120 min 32–42; >120 min 42–55 | | | H:how-many-clips |
| Proporção | 9:16, 1:1, 16:9, 4:5 (Free/Starter só 9:16) | 9:16 | "Choose aspect ratio" | V1 3:30, PRECO |
| Template / Brand kit | Quick presets, My templates, ou "No brand kit" | preset do usuário | abaixo | V1 3:00, V2 |
| Salvar como padrão | "Save settings above as default" / salvar Recipe | | | V1 3:30, H:create-and-save-a-custom-recipe |

### b2. Recipes (4.0)
Recipes prontas: Clip long video, Clean up recording, Auto-edit talking videos, Captions, Reframe, Social edits, AI B-roll, Translate & dub (H:how-to-use-recipes, V2 0:15).

| Seção | Toggle | Sub-opção | Custo visto | Fonte |
|---|---|---|---|---|
| (topo) | Clipping | Clip length, prompt, gênero | | V2 1:00 |
| Essentials | Captions | grade de templates "Word Cut, Handwritten, Mozi, Simple, View 37 more" | Free | V2 1:00 |
| Essentials | Auto hook ⚡ Beta | Viral hook / Headline | 20 créditos p/ até 10 cortes | V2 1:00, H:add-a-viral-hook |
| Essentials | Motion graphics ⚡ Beta | | 6 créditos/min ou /corte | H:add-motion-graphics |
| Essentials | AI Emojis | | | V2 1:00 |
| Essentials | Auto B-roll ⚡ | AI video B-roll / AI image / Stock | 105 créditos no exemplo | V2 1:00, H:ai-broll |
| Sound sharp | Speech cleanup | "Remove pause & filler words" | Free | V2 2:00 |
| Sound sharp | Enhance audio ⚡ | | | V2 2:00 |
| Sound sharp | Auto SFX ⚡ | | 7 créditos/min | H:auto-sfx |
| Look good | Auto Zoom | | Free | V2 2:00 |
| Look good | Auto transitions | | Free | V2 2:00 |
| Look good | Auto Color Correction ⚡ | | | V2 3:00 |
| Translate | Voice dubbing ⚡ | idioma (ex.: Italian), "Dub videos into 20+ languages in your own voice, 10 credits/min" | 50 créditos no exemplo | V2 3:00 |
| Translate | Caption translation | idioma | | V2 3:00 |
| Clean up (Recipe própria) | Eye contact correction | | | H:how-to-use-recipes |

### b3. Legenda (editor de estilo)
Painel com 3 abas **Presets | Font | Effects** (V1 7:00–10:40, `prints/opus-fonte-peso-contorno-sombra.jpg`, `prints/opus-legenda-posicao-animacao-linhas.jpg`, `prints/opus-lista-animacoes-legenda.jpg`).

| Controle | Opções | Padrão (Karaoke) | Fonte |
|---|---|---|---|
| Fonte | dropdown com fontes do sistema + "Custom fonts" (OTF/TTF, 2 no Pro) | Montserrat | V1 7:30, H:custom-fonts |
| Cor do texto | color picker (bolinha) | branco | V1 8:30 |
| Tamanho | número em px | 40 px (no wizard 50 px) | V1 7:30 |
| Peso | Light, Regular, Bold, Black… | Black | V1 7:45 |
| Decoração | Itálico, Sublinhado | off | V1 8:00 |
| Uppercase | toggle | on | V1 8:00 |
| Font stroke (contorno) | cor + px | preto 8 px | V1 8:10 |
| Font shadows | toggle + cor + X, Y, blur | on, preto 2/2/2 | V1 8:45 |
| Position | Auto, Top, Middle, Bottom, Custom (arrastar; guia "Place visual elements within the safe zone") | Auto | V1 9:30 |
| Animation | None, Bounce, Underline, Box, Pop, Scale, Slide left, Slide up, Seamless bounce, … (lista continua, resto não confirmado) | Bounce (no exemplo) | V1 10:00 |
| Lines | Three lines / One line | depende do preset | V1 10:00 |
| Highlighted word color | color picker | verde #3CFF3C aprox. | V1 10:30 |
| AI keywords highlighter | toggle | on | V1 11:30 |
| AI emojis | toggle; editar por palavra (Add > Emoji) | on | H:ai-emojis-keywords |
| Speaker colors | cor por locutor | off | V1 21:30 |
| Auto censor | lista padrão + lista própria | off | V1 13:00 |
| Brand vocabulary | grafias próprias (nomes, marcas) | | V1 13:15, H:brand-vocabulary |
| Tradução da legenda | idioma | off | H:select-subtitle-language |
| Remover legenda | "No captions" ou toggle Captions da Recipe | | H:change-captions |

### b4. Layout / reframe
| Controle | Opções | Padrão | Fonte |
|---|---|---|---|
| Aspect ratio | 9:16, 1:1, 16:9, 4:5 | 9:16 | `prints/opus-layouts-e-fonte-legenda.jpg` (V1 6:00) |
| Layout (multi-seleção, IA escolhe por cena) | 9:16: Fill, Fit, Three, Four, Split, ScreenShare, Gameplay. 16:9/1:1/4:5: Fill, Fit | Fill + Fit ligados | H:how-to-use-brand-kit, V1 5:40 |
| Fit layout crop aspect ratio | Original ratio, 4:3, 1:1 (só 9:16) | Original | V1 6:30 |
| Layout de segmento com B-roll | Fill, Picture-in-Picture, Split (não em 16:9) | Fill | H:apply-the-layouts |
| Tracker | ON (automático no locutor) / manual (clicar no objeto) / OFF | ON | H:subject-tracking, V1 25:30 |
| Crop manual | duplo clique / X / botão crop; vários segmentos com Shift | | H:how-to-manually-reframe-content |
| ScreenShare | exige tela compartilhada + 1 locutor, senão cai em outro layout | | tooltip V1 6:00 |

### b5. Edição
| Recurso | Detalhe | Fonte |
|---|---|---|
| Remove fillers | checklist por tipo ("um", "uh", "you know", gaguejo) | H:speech-cleanup |
| Remove pauses | slider de limiar, padrão 0,5 s | H:speech-cleanup |
| Remove bad takes | "Detect now", marca em laranja, "Remove all" | H:speech-cleanup |
| B-roll | AI image, AI video (modelo + estilo "AI Style" ou preset), Stock; "Find spots" (~30 s), "Recent B-roll", prompt manual, upload | H:ai-broll |
| Transições | Auto: Flash black 0,5 s onde os dois lados têm ≥1 s e um ≥5 s. Estilos: Slide left/right/up/down, Flash black/white, Blur, Push in, Light, Wink, Stretch, Flip, Film burn, Glitch. Duração 0,2–5 s. "Apply to all" | H:add-transition-effects |
| Animação de clipe | cross fade, cross zoom, zoom in/out, fade in/out (Transitions > Animation) | H:add-transition-effects |
| Headline (Auto hook antigo) | uma linha no começo dos top 10; estilo: fonte, tamanho, peso, cor, fundo da palavra, raio, largura; posição automática evitando rosto | H:auto-headline |
| Viral hook | templates filtráveis por estilo ("Clean & corporate", "High-energy"), texto vem da transcrição, zoom + SFX próprios, "Hide captions", "Replace hook" | H:add-a-viral-hook |
| AI hook (voz) | roteiro até 2000 caracteres, 20+ vozes (ex.: Daniel), "Tone Stability", volume do original, 20/dia | H:ai-voiceover, V1 23:00 |
| Motion graphics | categorias Data (big number, bar chart, trend line, gauge), Social (follow button, like burst, review card), Promo (save the date, countdown, sale badge) | H:add-motion-graphics |
| Texto | até 5 camadas; fundo da palavra, raio 0–80 px, largura 1–100% | H:add-text-overlays |
| Música | biblioteca (NCS) com busca, abas All/Liked/Instrumental…, favoritar; upload ou link; volume 15% padrão, velocidade 0,5–2,5×, fade 0–5 s | H:add-music-to-your-clips, `prints/opus-musica-toggles-ia-calendario.jpg` |
| Auto SFX | biblioteca curada, ~30 s | H:auto-sfx |
| Auto Zoom | toggle (zoom de ênfase) | V2 2:00 |
| Zoom manual | crop diferente por segmento como "pattern interrupt" | V1 24:30 |
| Intro / outro | upload por proporção (Pro) | H:intro-outro-cards |
| Logo / overlay | 1 logo por kit, JPG/PNG/SVG/GIF/WebP, arrastar e redimensionar | H:how-to-use-brand-kit |
| Marca d'água | sai a partir do Starter | PRECO |
| Outros | Eye contact, Color correction, Upscale, Dubbing, Censor, Duplicate clip | llms.txt da ajuda |

### b6. Brand kit
Seções: Basic → Logos; Styles → Caption, Auto Headline; Layouts; Intro & Outro; Media → Music. Um kit cobre 9:16, 16:9, 1:1 e 4:5 (posição e tamanho por proporção). "Show Settings" mostra safe zones, legenda, headline, emojis. Planos: Free usa o padrão, Starter 1, Trial 2, Pro 4 (H:how-to-use-brand-kit).

### b7. Exportação / postagem
Download HD; 4K (Business); XML Premiere/DaVinci; bulk download (Pro); agendar e postar em 9 redes; título, descrição e hashtags por IA com "Regenerate copy" (Tone, Format, Mimic, Hashtag); calendário com fuso (PRECO, H:schedule-clips, V1 14:00).

---

## (c) Catálogo dos templates de legenda

Nomes vistos na grade "Quick presets" (V1 2:30–3:05, `prints/opus-quick-presets-legenda-20-templates.jpg`): Karaoke, Deep Diver, Pod P, Popline, Seamless Bounce, Beasty, Youshaei, Mozi, Glitch Infinite, Baby Earthquake, Blur Switch, Simple, Focus, With Backdrop, Baby Steps, Highlighter Box, Think Media, Blur In, Soft Landing, Grow, Breathe. Na 4.0 também Word Cut e Handwritten, e o total é "4 visíveis + View 37 more", então cerca de 41 (V2 1:00). IDs da API: preset-fancy-Karaoke, -Gameplay, -Beasty, -Deep_Diver, -Youshaei, -Pod_P, -Mozi, -Popline, -Simple, -Think_Media (API brand-template).

Os 10 primeiros abaixo foram medidos nos vídeos oficiais de prévia (T:nome, `prints/legenda-template-<nome>.png`). Fonte = aparência; o nome exato da fonte só está confirmado no Karaoke (Montserrat, V1 7:15). Posição em canvas 1080x1920, medida pelo centro do bloco de texto.

| Template | Fonte (aparência) | Caixa | Cor base | Destaque | Contorno / sombra | Animação por palavra | Palavras por tela | Posição (centro Y) |
|---|---|---|---|---|---|---|---|---|
| **Karaoke** | Montserrat Black (confirmado) | MAIÚSCULA | branco | palavra falada em amarelo #FFE11A e às vezes verde #3CFF3C, maior | contorno preto 8 px, sombra 2/2/2 | palavra ativa troca de cor e cresce (bounce) | 2 linhas, 3 a 4 palavras | ~1490 px (78%) |
| **Beasty** | display em quadrinho itálico, tipo Komika Axis | MAIÚSCULA | branco | palavra-chave amarela | contorno preto grosso | pop palavra a palavra | 1 a 3 palavras, 1 linha | ~1530 px (80%) |
| **Deep Diver** | sans bold arredondada (tipo Inter/Poppins Bold) | minúscula | palavra falada preta, futuras cinza #9A9A9A | revela palavra por palavra | **caixa pílula cinza claro #E6E6E6** atrás da frase, raio ~12 px | karaokê (cinza → preto) | frase curta, 1 linha | ~1520 px (79%) |
| **Youshaei** | sans bold (tipo Montserrat Bold) | MAIÚSCULA | verde-menta #45E0A8 | palavras ainda não ditas em cinza translúcido | sem contorno, sombra leve | karaokê (opaco ao falar) | 2 a 3 palavras | **~960 px (meio)** |
| **Pod P** | condensada pesada (tipo Anton/Bebas) | MAIÚSCULA | rosa-magenta #FF3EC8 | | sombra leve | troca palavra a palavra | 1 a 2 palavras | ~1500 px (78%), divide a linha com o logo |
| **Mozi** | sans black (tipo Montserrat Black) | MAIÚSCULA | branco | verde #3CFF3C e amarelo | contorno preto grosso | pop; **emoji grande embaixo** | 2 a 3 linhas | ~1150–1250 px (60–65%) |
| **Popline** | sans black + regular | MAIÚSCULA | branco | **palavra-chave maior + barra de sublinhado roxa #7B3CFF** | sombra | underline aparece na palavra-chave | 1 linha, 3 a 4 palavras | ~1530 px (80%) |
| **Simple** | condensada (tipo Oswald/Bebas) | MAIÚSCULA | branco | nenhum | sombra fina | troca seca palavra a palavra | **1 palavra** | **~960 px (meio)** |
| **Think Media** | condensada itálica (tipo Bebas Italic) | MAIÚSCULA | branco | verde e amarelo | sombra preta | palavra a palavra | 2 a 3 linhas empilhadas | ~1440 px (75%) |
| **Gameplay** (layout + legenda) | quadrinho itálico | MAIÚSCULA | branco | amarelo | contorno preto | pop | 2 a 3 palavras | **na emenda entre webcam e jogo, ~576 px (30%)** |

Outros (só pela miniatura da grade, animação deduzida do nome = **não confirmada**):
| Template | O que a miniatura mostra |
|---|---|
| Seamless Bounce | minúscula, branco, destaque verde, sem caixa |
| Glitch Infinite | "To get started", laranja/amarelo, serifada pesada |
| Baby Earthquake | minúscula, serifada fina, branco |
| Blur Switch | branco pequeno, "TO GET" + "STARTED" em ciano |
| Focus | serifada clássica, "TO GET STARTED" com "STARTED" maior |
| With Backdrop | itálico serif em fundo escuro |
| Baby Steps | rosa/magenta, maiúscula grande |
| Highlighter Box | palavra com **caixa roxa/rosa de marca-texto** atrás |
| Blur In | serifada, cinza para branco |
| Soft Landing | "To get started" com "started" em azul claro |
| Grow | maiúscula branca com destaque azul |
| Breathe | maiúscula enorme, "STARTED" verde neon |
| Word Cut | minúscula branca grande, contorno fino |
| Handwritten | manuscrita |

**Para recriar em CSS/HyperFrames (exemplo Karaoke):**
```css
.cap{position:absolute;left:50%;top:78%;transform:translate(-50%,-50%);
 font:900 80px/1.05 Montserrat;text-transform:uppercase;color:#fff;text-align:center;
 -webkit-text-stroke:16px #000;paint-order:stroke fill;text-shadow:4px 4px 4px #000;}
.cap .on{color:#FFE11A;transform:scale(1.12);display:inline-block;transition:transform .12s cubic-bezier(.34,1.56,.64,1);}
```
(os valores da UI são em px de um canvas de preview menor; em 1080x1920 multiplicar tamanho e contorno por ~2, não confirmado o fator exato.)

---

## (d) Catálogo de layouts (geometria em 1080x1920)

| Layout | Geometria | Legenda | Fonte |
|---|---|---|---|
| **Fill** | vídeo cobre 1080x1920, crop centrado no rosto, segue o locutor (Tracker) | ~78% da altura ou Auto | H:how-to-use-brand-kit, V1 6:20 |
| **Fit** | vídeo inteiro na largura (1080x608 se 16:9; 1080x810 se 4:3; 1080x1080 se 1:1), centralizado em y≈960; acima e abaixo o mesmo vídeo **desfocado** preenchendo | abaixo do quadro | V1 6:30, H:how-to-use-brand-kit |
| **Split** | duas metades empilhadas 1080x960 (topo y 0–960, base 960–1920), uma pessoa em cada | **na emenda, y≈960** | V1 25:50, `prints/opus-layout-split-atalhos.jpg` |
| **Three** | três locutores; geometria exata **não confirmada** (provável 3 faixas de 640) | não confirmado | V1 6:00 |
| **Four** | quatro convidados; provável grade 2x2 de 540x960, **não confirmado** | não confirmado | V1 6:00 |
| **ScreenShare** | tela compartilhada + rosto; geometria exata **não confirmada** | | tooltip V1 6:00 |
| **Gameplay** | webcam em cima 1080x576 (0–30%), jogo embaixo 1080x1344 (30–100%) | na emenda, y≈576 | T:Gameplay (medido) |
| **PIP (B-roll)** | B-roll em tela cheia, locutor numa janela pequena; posição não confirmada | | H:apply-the-layouts |
| **Split (B-roll)** | locutor e B-roll empilhados (não em 16:9) | | H:apply-the-layouts |

Troca por cena: dividir na timeline (D), clicar no segmento, Layout ▾ ou botão direito → escolher; cada segmento mostra o rótulo do layout na timeline (V1 25:50–28:00). Na prática o tutorial alterna Split → Fill (quem fala) → Split a cada poucos segundos como "pattern interrupt".

---

## (e) Layout do app Higgsfield
Prints: `prints/higgsfield-app-sidebar-cinema-studio.jpg`, `higgsfield-imagem-barra-prompt-vazio.jpg`, `higgsfield-video-barra-prompt-chips.jpg`, `higgsfield-seletor-modelos.jpg`, `higgsfield-menu-view-masonry.jpg`, `higgsfield-community.jpg` (HF, 18/11/2026).

- **Tema**: fundo quase preto #0E0F11, cards #1A1B1E, cor de ação verde-limão #D4FF2A (Generate, Log in, Get started), rosa só para promoção. Títulos em grotesca condensada pesada, maiúscula, com brilho metálico.
- **Sidebar** (app /generate, ~200 px): topo seletor de produto "Cinema Studio ⇅" + botão recolher; itens com ícone colorido quadrado: Home, My elements, My favorites, Community; seção "Projects" com lupa e ordenar + "New project"; rodapé "Pricing 64% OFF" e "Log in" em limão. Nas páginas /ai/image e /ai/video logado-fora aparece navbar no topo (Image, Video, Audio, MCP, Agentic, Studios, Community, Contests, Learn, More).
- **Estado vazio**: leque de 3 a 4 cards inclinados com prévias + título grande ("BRING YOUR STORIES TO LIFE" / "START CREATING WITH HIGGSFIELD SOUL CINEMA") + subtítulo cinza. Banner "Don't know where to start? Go to the Academy" com "Learn now".
- **Barra de geração** (fica embaixo no centro, ~740 px, raio ~16 px, fundo #1C1D20):
  - Linha 1: textarea "Describe the scene you imagine" (vídeo: "Describe any visual idea. We will generate a video.").
  - Linha 2: chips pequenos com ícone: `+` (anexar), `@` (personagens/elementos), **modelo ›** (ex.: "GPT Image 2", "Seedance 2.0", "Cinema Studio 4.0"), **proporção** ("Auto", "16:9"), **qualidade** ("High"), **resolução** ("2K", "1080p"), **duração** ("8s", "5s"), **áudio** ("On"), **quantidade** "− 1/4 +".
  - À direita botão grande quadrado limão "GENERATE" com custo em créditos embaixo (preço riscado + preço atual).
  - No Cinema Studio, acima da barra, fileira de 5 cards de configuração com miniatura: References 0/50, Film setup, Camera, Color palette, Lighting (todos "Auto"); à esquerda alternador vertical Image | Video.
- **Seletor de modelo**: popover com busca, "Featured models", cada linha = ícone + nome + selo (TOP azul / NEW limão) + metadados em chips (resolução, faixa de duração). Ex.: Seedance 2.5 (1080p, 4–30s), Kling 4.0, Gemini Omni Flash 1.2 (4K), Wan 3.0 Prime, Higgsfield Genjutsu.
- **Galeria de resultados**: menu "View" no topo direito com Layout **Square / Masonry** (padrão Masonry), "Split by date" e slider "Card size". A galeria logada em si **não foi vista** (precisa de conta): blocos grandes, não confirmado.

---

## (f) Proposta para a Máquina de Conteúdo

Princípio: copiar o **fluxo** do OpusClip (link/arquivo → Recipe → resultados com nota → editor por transcrição → postar) e a **casca** do Higgsfield (sidebar fina, barra de geração com chips embaixo, galeria em blocos). Identidade nossa: vinho escuro + vermelho #e11d2a no lugar do limão. Tudo em PT-BR, pouco texto.

### f1. Sidebar
```
[M] Máquina ⇅                    [⟨]
  Início
  Criativos (direct response)
  Orgânico
     Instagram · TikTok · YouTube (vídeo longo)
  Carrosséis
  Inspirar (acervo)
  Postar (calendário)
─ Projetos  🔍 ⇅
  + Novo projeto
  (lista)
──────────
  Créditos / custo do mês
  Conta (perfil, marca, redes, chaves)
```

### f2. Início = barra de geração (modelo Higgsfield)
Logo no meio + a barra (já decidido: "Início só logo + chat"). A barra aceita **colar link ou arrastar arquivo bruto** e tem chips:
`+ arquivo` · `🔗 link` · **Tipo** (Cortes / Criativo / Carrossel / Roteiro, roteiro por último) · **Formato** (9:16 ▾) · **Layout** (Tela cheia / Tela dividida / Encaixar) · **Legenda** (miniatura do template ›) · **Duração** (Auto ▾) · **Modelo IA** (Econômico ▾) · botão vermelho "Gerar" com custo estimado embaixo.

### f3. Tela "Configurar" (modelo Recipe do OpusClip, em PT-BR)
Coluna esquerda = vídeo e opções; direita = **Resumo com custo** e botão "Gerar".
| Nosso controle | Opções PT-BR | Padrão | Copiado de |
|---|---|---|---|
| Idioma | Auto, Português, Inglês, Espanhol | Auto | Speech language |
| Trecho | slider início/fim com selo "Economiza" | vídeo todo | Processing timeframe |
| Receita | Cortes de vídeo longo, Limpar gravação, Editar fala pronta, Só legenda, Reenquadrar, Edição pra redes, Traduzir e dublar, + Minhas receitas | Cortes de vídeo longo | Recipes |
| Modelo de corte | Auto, Fala (talking head), Tudo (visual + áudio) | Auto | Clip model |
| Gênero | Deixa a IA ver, Podcast, Aula, Venda/Webinar, Motivacional, Lifestyle, Notícia, Entretenimento | Deixa a IA ver | Genre |
| Duração do corte | Auto (até 90s), <30s, 30–59s, 60–89s, 90s–3min, 3–5min, 5–10min, 10–15min | Auto | Clip Length |
| O que destacar | prompt livre ("ache os momentos em que falo de preço") | vazio | Include specific moments |
| Quantos cortes | a IA diz quantos o vídeo rende e o usuário escolhe quantos fazer (melhores primeiro) | todos que renderem | decisão do tanpz 18/11 |
| Formato | 9:16, 1:1, 4:5, 16:9 | 9:16 | Aspect ratio |
| Layout | Tela cheia (reenquadra no rosto), Tela dividida, Encaixar (fundo desfocado), Tela + rosto, Jogo; multi-seleção = IA escolhe por cena | Tela cheia + Tela dividida | Layouts |
| Legenda | grade de templates (f4) + "Sem legenda" | o template da marca | Captions |
| Gancho | Título no começo / Gancho animado / Nenhum | Título | Auto hook |
| Limpar fala | Tirar pausas e vícios ("é", "tipo", "né"), Tirar tomadas ruins | ligado | Speech cleanup |
| Emojis | toggle | desligado (estilo premium) | AI Emojis |
| Palavra-chave em destaque | toggle | ligado | AI keywords highlighter |
| B-roll | Nenhum, Banco grátis, Imagem IA, Vídeo IA | Banco grátis | Auto B-roll |
| Zoom automático | toggle | ligado | Auto Zoom |
| Transições | toggle + estilo | Flash preto 0,5 s | Auto transitions |
| Música e SFX | toggle (trilha da biblioteca + efeitos) | ligado | Music + Auto SFX |
| Marca | Kit da marca ▾ / Sem kit | kit padrão | Brand kit |
| Modelo de IA | Econômico (o mais barato que segura o resultado), Equilibrado, Máximo | **Econômico** | regra do tanpz |
| Resumo | lista do que vai rodar + custo em R$/créditos + "Salvar como receita" | | Summary |

### f4. Templates de legenda (galeria com prévia animada no hover)
Começar pelos 10 medidos em (c) e adaptar: Karaoke, Deep Diver (pílula), Popline (sublinhado), Highlighter Box, Simple (1 palavra), Mozi, Youshaei (meio, menta), Beasty, Think Media, Pod P. Editor com as abas **Presets | Fonte | Efeitos** e os mesmos controles de (b3): fonte, tamanho, peso, cor, itálico/sublinhado, MAIÚSCULA, contorno (cor + px), sombra (x, y, blur), posição (Auto/Topo/Meio/Baixo/Livre com safe zone), animação (Nenhuma, Pulo, Sublinhado, Caixa, Pop, Escala, Deslizar ←, Deslizar ↑), linhas (1 ou 3), cor do destaque. Para os cortes do tanpz: legenda de tela dividida **na divisão, com sombra, uma cor** (decisão dele, ver memória "Feedback edição de cortes").

### f5. Resultados (galeria em blocos grandes)
- Cards 9:16 grandes (Masonry/Quadrado + tamanho do card, como o "View" do Higgsfield).
- Em cada card: **nota 0–99 grande** + título curto + duração; no hover: Postar, Baixar, Editar, Descartar.
- Ao abrir: nota com 4 letras **Gancho, Fluxo, Valor, Tendência** + "Por que esse corte" (3 linhas) + transcrição com tempo + ações (Postar, Baixar HD, Editar, Trocar formato, Duplicar, XML).
- Ordenar por nota (padrão) ou ordem do vídeo; filtro; busca "achar momento".
- Re-prompt no topo: "quero mais cortes sobre…".

### f6. Editor do corte
Transcrição à esquerda (apagar texto = cortar vídeo; "+ Puxar trecho" no começo e no fim), preview no centro com barra "9:16 · Layout · Rastreio", trilho de ícones à direita (Limpar, Legenda, Mídia, Marca, B-roll, Transição, Texto, Música, Gancho), timeline embaixo com rótulo de layout por segmento e troca de layout por cena (botão direito). Atalhos iguais (D dividir, X recortar, ← → frame).

### f7. Postar
Calendário mensal + modal "Agendar": contas à esquerda, legenda e hashtags geradas, chips **Tom, Formato, Imitar, Hashtag** + "Gerar de novo", Feed/Story, "Escolher horário" e "Postar agora". Instagram, TikTok, YouTube primeiro.

### f8. Perfil do usuário (onboarding melhor que o do OpusClip)
O OpusClip pergunta função/alcance/origem e isso não muda nada. O nosso pergunta o que **muda o resultado**, em 4 passos curtos, enquanto o primeiro vídeo processa:
1. Nicho (cards: Infoproduto, Beleza, Fitness, Saúde, Finanças, Negócio local, Educação, Outro + campo livre).
2. Objetivo (Vender / Crescer seguidores / Autoridade) e redes (Instagram, TikTok, YouTube).
3. **Áudio curto se apresentando** (gravar 20–30 s no microfone): vira transcrição de tom de voz, vocabulário e "Vocabulário da marca" (nomes escritos certo).
4. Estilo de conteúdo: escolher 2 a 3 cards de referência (cortes, criativo de DR, carrossel) + template de legenda preferido + logo.
Isso alimenta as Receitas padrão e o gênero automático. Também conectar Claude e voz próprios (decisão de 18/11).

### f9. Carrosséis
Não existe no OpusClip. Usar a mesma barra: tema/link → até 10 imagens que se ligam (uma continua a outra), editor por slide, formato 4:5, postar no calendário.

---

## Não confirmado
- Nome real das fontes dos templates (só Montserrat no Karaoke).
- Lista completa das animações de legenda depois de "Seamless bounce".
- Lista completa e visual dos ~41 templates da 4.0 (vi 21 nomes + Word Cut e Handwritten).
- Geometria exata de Three, Four, ScreenShare e PIP.
- Opções da pergunta "tamanho da organização" no onboarding.
- Lista completa dos gêneros no dropdown (cortada no print).
- Nomes dos templates de Viral hook (só os filtros "Clean & corporate" e "High-energy").
- Agente de edição "AI Producer" (só citado no BLOG40 como plugin de ChatGPT/Claude; não vi a UI). Agent Opus (texto para vídeo) é produto separado.
- Galeria de resultados logada do Higgsfield (precisa de conta).
- Preços em dólar por plano além de Starter US$15 e Pro US$29/mês (PRECO).
