---
name: revisao-modelar-licoes
description: "What the 18/11 review of the \"modelar\" reel rejected (nota 6.5) and the fixes that passed. Use it as a checklist before rendering any Máquina reel."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0f3f6095-1084-412b-b292-6a8cf393dfda
  modified: 2026-11-18T19:03:53.292Z
---

The review of job 20261118-144527-modelar (18/11/2026) rejected v2 for these problems. Check every new reel for them before render:
- checagem.md marked OK without looking at the frames. Confirm each line against frames pulled from the rendered MP4 (conferir.py).
- A CTA held still for more than 1.5 s. Fix: CTA block at y 760 to 1160, a final hold of only 0.3 s, a continuous camera push from 1 to 1.08, comments arriving with ticks, and the DM opening into a card with 3 thumbnails of the video's own scenes. Keep the CTA pill on screen in the last frame.
- Split-screen cards that were too small. Each card should be about 47% of the width and 65% of the height. Any object drawn inside a card must be a sharp cut-out: vector, hard shadow, white paper border.
- A scene came back later, so the same photo appeared twice. Show a montage of the video's own frames instead. Make those frames with `hyperframes snapshot` with captions hidden.
- A tile showed a third-party face. Check the screens inside photos too: a phone on a tripod can show a person.
- Frame 0 must be a cover: put the hook text over the visual for the first 0.1 s.
- A phone frozen in a transition. The clip keeps playing, the phone turns in Y and morphs into the next card with no hard cut.


Third review (v3, nota 7.5) rejected new defects:
- Blurring a screen to hide a face reads as a placeholder or censorship. Put a sharp recreated reel inside the screen instead.
- A giant background word cut across two adjacent cards forms a nonsense word ("PRO" + "SKI" = "PROSKI"). Keep each word whole inside its own card.
- In a split screen, both sides need the same finish. A flat black silhouette next to a real-photo collage looks like clipart.
- Lines connecting two cards must sit above both cards (z-index) or they disappear.
- Centering the CTA block leaves the top of the screen empty until the DM arrives. Fill it from the first CTA frame.

**Why:** tanpz rejects anything that has a static frame, a repeated photo or a false OK in the checagem.
**How to apply:** HyperFrames refuses tweens on left and top ("snaps to integer px"), so use x and y. Animate clip-path inset to grow a card to full screen.

Related: [[maquina-voz-e-recorte]]
