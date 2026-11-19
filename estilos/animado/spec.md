# Estilo ANIMADO (explicativo desenhado, bonequinho/mascote, demonstração)

Não existe UM estilo animado. A máquina produz de tudo: cada vídeo escolhe o estilo pela referência que combina com o assunto e com o pedido do tanpz.

## Como escolher o estilo de cada vídeo (nesta ordem)
1. Se o pedido veio com uma inspiração (aba Inspirar), modele ELA: estrutura, ritmo, tipo de personagem, formato, transições, som. Ela está em ~/Movies/maquina-conteudo/inspiracoes/<id>/ (decupagem.json + vídeo).
2. Senão, procure a referência mais próxima do assunto em: estilos/animado/referencias/ (quando houver), estilos/motion-virais/motion.json, estilos/instagram-refs/, estilos/hub.json, estilos/prompt-motion/catalogo/data.json. Diga no roteiro.md qual referência modelou e por quê.
3. Escolha UM dos formatos e varie entre vídeos: bonequinho/mascote reagindo e explicando; desenho à mão / whiteboard sendo desenhado; demonstração de tela (chat, terminal, app, Gerenciador de Anúncios) com personagem; infográfico animado; história em quadrinhos animada. Nunca repita o mesmo formato em vídeos seguidos.

## Princípios que valem para qualquer estilo animado
- Personagem vivo: troca de expressão por emoção da fala, pisca, respira, reage ao que aparece. Nunca PNG parado trocando.
- Cada fala mostrada literalmente com material concreto (tela real, número real, objeto desenhado da fala). Sem cartão genérico vazio.
- Composição muda a cada beat; troca visual a cada 0,8-1,5 s; câmera viva.
- Legenda presa ao tempo REAL da voz (whisper palavra a palavra), uma cor de destaque.
- Arco de filme: gancho com curiosidade, tensão, virada, prova, CTA. Trilha acompanha (corte no suspense, drop na virada), SFX em cada evento.
- Voz ElevenLabs com emoção por fala, voz adequada ao público e ao produto.

## Caixa de ferramentas (técnica pronta para reaproveitar, NÃO é o visual)
- Motor de cena HyperFrames com helpers de personagem, legenda, câmera, toque, notificações e mix de filme: ~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine/videos/sl-ganchos/build/ (lib.html, align.py, mixcore.py, build.py)
- Personagens Open Peeps (CC0) com rostos por emoção: .../sl-ganchos/assets/peeps/ ; SFX e trilhas: .../sl-ganchos/assets/sfx*, music
- Outras técnicas: videos/zupi-reel, zupi-emocao, motion-reel-demo (3D, motion denso, sound design)
