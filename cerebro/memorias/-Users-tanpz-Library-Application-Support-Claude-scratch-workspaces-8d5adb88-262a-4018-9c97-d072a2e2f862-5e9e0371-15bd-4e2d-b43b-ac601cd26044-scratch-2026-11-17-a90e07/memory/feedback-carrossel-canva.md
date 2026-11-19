---
name: feedback-carrossel-canva
description: "Carousel editor must keep the original photo untouched and make every text editable; only the edited text's box is patched"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-19T20:55:56.603Z
---

On 19/11/2026 tanpz said the carousel editor was "bem ruim": "mexeu na foto toda e não tem como editar nada".

Causes:
- A texture filter discarded 13 of the 16 OCR lines.
- OpenCV dropped the PNG transparency, so the hidden glow showed up.
- Inpainting smeared the colored bars.

The fix works like Canva's "edit text":
- The editor shows the ORIGINAL image.
- Every OCR line is a clickable layer that stays invisible until it is touched.
- When a layer is edited or removed (`mexido` / `oculto`), only its `orig` box is covered with the cleaned background (with the stage color under it), and the new text is drawn on top.
- carrossel.py keeps the alpha channel. It fills flat boxes with the median ring color and inpaints whole boxes on gradients. Lines are only merged when their backgrounds have the same color.

**Why:** he needs to edit any text without the rest of the picture changing.

**How to apply:** never re-render the whole slide from a cleaned background. Check by editing two texts and deleting one, then comparing with the original at 390 and 1440 px.

Extra requests (19/11/2026):
- "Não é só texto, tem que dar pra mexer nos elementos na foto inteira": every visual element (product, bars, logo) must be a draggable and resizable layer, like Canva Magic Grab.
- "Essa aba de carrosséis também modela carrosséis por nicho da pessoa seguindo tudo": from a reference carousel, generate a version adapted to the user's niche. Keep the structure, design, text rhythm and length per slide; rewrite the copy for the niche and swap images when needed.
- "A foto que enviar tem que ficar exatamente igual, você tá colocando um fundo diferente" (19/11/2026): the uploaded photo stays identical, transparency preserved, no invented background. Stage shows a transparency checkerboard behind the slide (outside the exported node); patches are drawn in a canvas with clearRect + cleaned background (alpha kept, no #1a0a0d); PNG export is at the original pixel size with alpha. Check: export pixels in unedited areas must equal origem exactly (alpha=0 included).
- Elements built 19/11: carrossel.py cuts elements/NN-eK.png (alpha islands on transparent PNG, border-color diff on flat bg, rembg on photos; stacked flat bars split one per bar) + fundos/NN-limpo.png; dragging an element carries the texts whose center sits on it.

Bug relatado em 19/11/2026 ("bugando", com um print de um slide de foto em que o personagem foi movido). Havia texto duplicado e borrão grande. Causas:
- o elemento mexido tapava a caixa inteira dele;
- textos dentro dessa caixa eram redesenhados por cima do original, que não tinha sido tapado;
- o texto ia junto com o elemento quando o centro dele caía em qualquer ponto da caixa;
- o inpaint do OpenCV borrava buracos grandes.

Correção:
- o remendo agora segue o formato do recorte (alfa engordado), e não a caixa;
- texto parado só é redesenhado se estiver em cima do formato do elemento, e nesse caso a caixa original dele é tapada antes;
- só vai junto o texto que está inteiro dentro da caixa e em cima de pixel opaco do elemento;
- o fundo é preenchido pelo LaMa ONNX (tools/modelos, fora do git), com o OpenCV como reserva.

Como conferir: mover o personagem principal de um slide de foto não pode duplicar nenhum texto, e o buraco tem de sair sem borrão.
