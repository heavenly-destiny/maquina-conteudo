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
