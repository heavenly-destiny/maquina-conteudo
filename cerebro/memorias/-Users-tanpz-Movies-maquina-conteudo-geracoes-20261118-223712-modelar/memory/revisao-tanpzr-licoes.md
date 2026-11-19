---
name: revisao-tanpzr-licoes
description: Defects that got the 18/11 @tanpzr Free Fire intro reel rejected (nota 6); checklist for any personal-brand reel of tanpz
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5a7a2118-f03b-45a0-a610-4f78e081ce6c
  modified: 2026-11-19T02:31:09.977Z
---

Review of job 20261118-223712-modelar (18/11/2026) rejected the render for:
- The voice mispronounced his name: Whisper heard "Tantiz" / "tão fiz". Transcribe the line with his name on its own before mixing. If it's wrong, regenerate it with a phonetic spelling ("Tampz", "Tâmpis").
- The "Prazer, tanpz" photo hid his face (cap shadow, hand in front, blurred logo on top). An intro needs his face from the front, sharp, before the logo.
- checagem.md said FIXED for "TUDO" being cut off, but frame 252 still touched the edges. Check every frame of the spring overshoot.
- The ghost outline words were duplicated by parallax and read as "PLAYELAYER", the same failure as "PROSKI".
- Near-empty frames (grey screen with cards entering from outside the frame), a small phone on frame 0, a placeholder DM avatar.

Fixes that worked in revision 2 (same day):
- The spelling "Tampz" in `voz` (Antônio) transcribes as TAMPS on its own. The original take only broke after atempo and mixing. Re-check the name in the FINAL mix: a riser or impact on top of the name drowned it until those hits moved to after the name.
- No raw video of him facing the camera exists (17/11 cuts and 18/11 IMG_9269/9271 are all side profile at the desk). The frontal talking head in jobs/reel-dlw is another person, never use it. Best substitute: IMG_9271/01 at 25 s (clear profile, eye visible, no hand, gamer PC behind).
- Measure big-word margins with a pixel script on the MP4 frames. The camera zoom (scale 1.12 on the cut) pushed the ellipse past the margin even though the element itself fit.
- Stories Lab C01, C02 and C05 share the same coffee/curtain photo. The illustrated hooks show the same woman at 1.2 s, so take frames at 7 to 10 s for variety.

Third review (render 2, nota 7.5, still rejected) caught what was left:
- Near-empty frames at scene starts: a word typed one at a time ("num" alone on black with the loading bar at 0%) and a single line on grey with 70% of the screen empty. Every scene's first frame needs its full block on screen.
- A decorative red cursor bar left alone in a corner, far from the text, reads as a bug. A cursor sits right after the last typed word or doesn't exist.
- CTA with the bottom two thirds black until the DM card arrives. Bring the DM or comments in from the first CTA frame.
- Check these with a 10 fps contact sheet over every scene transition, not 1 fps.

**Why:** tanpz rejects false OKs, hidden faces and anything that looks like a placeholder.
**How to apply:** run these checks before rendering any reel for his own profile. Related: [[revisao-modelar-licoes]]
