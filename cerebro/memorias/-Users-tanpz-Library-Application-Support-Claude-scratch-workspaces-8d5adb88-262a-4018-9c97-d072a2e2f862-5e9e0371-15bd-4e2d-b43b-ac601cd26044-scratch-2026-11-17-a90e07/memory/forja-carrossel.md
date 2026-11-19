---
name: forja-carrossel
description: "Carousels in Forja need their own creator area (clone + edit), never the video decupagem modal"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-19T09:03:00.638Z
---

On 19/11/2026 tanpz opened a carousel reference in Inspirar. He saw the video decupagem modal: Rápida/Completa/Fiel and "10 quadros por segundo". He called it "bem ruim": "isso aí é de vídeo, e na verdade isso aí é de carrossel".

**Why:** a carousel is a set of slides, not frames over time. Video options make no sense for it.

**How to apply:**
- A carousel reference never gets the video modes or the fps text.
- Forja needs a dedicated carousel creator. It clones a reference carousel slide by slide (layout, fonts, colors, text, image slots) and opens it in a slide editor to edit text and images and export PNGs.
- He mentioned "o paper", the tool carousel creators use. Prefer a free alternative: HTML slides rendered to PNG locally.
- Carousel rules from [[maquina-v2-produto]] still apply: up to 10 linked slides, panorama continuity.
- 19/11: he wants Canva's "separate layers" magic inside Forja. It reads any image (a carousel slide), splits it into editable layers (text, objects, background), and lets him move elements and change text. Our Canva MCP connector has `separate-image-layers` (+ get-separate-image-layers-job), which is the first thing to test for the clone step. Free fallback: OCR + inpainting locally.
