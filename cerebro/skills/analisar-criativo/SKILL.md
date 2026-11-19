---
name: analisar-criativo
description: Use when tanpz asks to analyze, review, critique or break down a video, ad creative, reel, image, VSL or sales page ("analisa esse criativo/vídeo/página"). Full frame-by-frame analysis with what is good, what is bad and what to change.
---

# Analisar criativo, vídeo ou página

Regra: 100% do material. Nunca pular frame, nunca resumir por amostragem.

## Vídeo / criativo
1. Baixar o arquivo (yt-dlp ou o arquivo enviado). Skill `watch` se tiver legenda nativa; senão transcrever o áudio.
2. Extrair TODOS os frames: `ffmpeg -i video.mp4 -vsync 0 frames/%05d.png`. Para ler, montar folhas de contato (grade 4x4 com timestamp) para cobrir tudo sem pular. Mudança de cena: `ffmpeg -i video.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -` para mapear cortes.
3. Subagentes rápidos podem descrever blocos de frames em paralelo; o modelo principal junta e analisa.
4. Mapear, segundo a segundo:
   - Gancho (0 a 3 s): o que prende, padrão quebrado, curiosidade aberta.
   - Roteiro: estrutura, promessa, dor, desejo, objeções, prova, CTA.
   - Legenda: fonte, tamanho, cor, posição, animação, palavras destacadas.
   - Edição: ritmo, duração média de corte, zooms, B-rolls, transições.
   - Motion: o que se move, direção, easing, timings.
   - Áudio: tom de voz, velocidade, trilha, efeitos sonoros.
   - Formato: 9:16, duração, se parece orgânico ou anúncio.

## Página de vendas / VSL
- Print completo em celular (390 px) e desktop (1440 px).
- Cada dobra: headline, promessa, prova, oferta, preço e ancoragem, bônus, garantia, objeções, urgência, CTA.
- Checar contra os blocos da skill `vsl-alta-conversao`.
- Técnico: velocidade de carregamento, pixels, checkout, bumps e upsells.

## Entrega
1. Resumo em 3 linhas: por que isso vende.
2. Tabela: Momento/seção | O que acontece | Por que funciona | O que falha | O que eu mudaria.
3. Formato de cada ponto: "forte porque X; falha porque Y; trocaria por Z, que tende a converter mais porque W."
4. Top 3 mudanças de maior impacto.
5. Se for para modelar: o roteiro/estrutura pronto para recriar com o nosso produto.
