---
name: ugc-edit-intercut-motion
description: "When editing creator/UGC footage, never cover her face or the phone she shows; \"mesclar\" means cutting between her and full-screen app motion scenes"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T23:40:08.205Z
---

When editing creator (UGC) ads, never put overlays on top of the person. "Mesclar com motion" means **intercutting**: her on camera, then a transition into a full-screen motion scene, then back to her. The motion scenes use the same style as the approved Stories Lab motion creatives: cream background, a 3D phone running the real app, taps, a "Copiada!" toast, stickers going onto a story, counters and kinetic captions.

**Why:** on 2026-11-16 the user rejected the first UGC edit ("ficou ridículo… você colocou as coisas na cara da mulher… tampou a cara dela"). It had floating phones, chips, counters and DMs stacked on top of her face and over the real phone she was showing. The user said this felt like I had forgotten the motion style they had taught me.

**How to apply:**
- Her shots stay clean. Use punch-ins and zooms. Captions go in the lower third, below the face. A small hook title at the very top above the head is fine. Nothing ever crosses the face.
- When she holds the phone up to the camera, leave it uncovered and push in on the phone so the viewer sees the real app. Never put a graphic in front of it.
- Lines about features or the result become full-screen motion scenes. Her voice carries on underneath as a J/L cut, and each scene enters and exits with a real transition (whip, zoom-blur, iris or slide).
- Real B-roll of the hands using the app counts as "showing the app", so keep it uncovered too.
- Show one pilot creative for approval before batch-producing the rest.

Related: [[show-every-line-literally]], [[creative-format-innovation]], [[creative-retention-every-second]], [[motion-reel-premium-style]].

**Formula approved on 2026-11-16 (v3: "agora tá batendo certo"):**
- No motion screen stays up longer than about 2s. Long beats get split.
- Use PiP mixing: her video shrinks into a rounded card at the top (scale 0.5) while motion plays below it. This works for lists, counters and "my stories" lines.
- The transition style changes every time: punch-in with a flash, zoom-through, a vertical swipe, the card shrinking and expanding, an iris out of her phone, the phone flying out, zoom-blur, a light leak, and pink ink for the CTA.
- Music: pick the track with the strongest beat. Align its offset so the beats land on the transitions. Low-pass it under the hook, then open it with a riser into the first transition. Give each transition type its own fixed SFX.
- Code: `videos/sl-ugc` (lib2.html + build/u1m.txt + make2.py).
- Show what she says, with a matching sound. When she names something, it appears literally. When she rejects it, mark it with an X plus an error buzzer (a user request on 2026-11-16). Examples: "horas no Canva" shows a Canva editor loading, a clock running to 2h47 and a red X with a buzzer ("nunca mais"); "carinha de Pinterest" shows a Pinterest feed scrolling, with her story popping out of it. The buzzer is synthesised in `sl-ugc/assets/sfx/error.wav`.
- v6 (2026-11-16, at the user's request):
  - **Cut-out:** an Apple Vision person matte (`sl-ugc/tools/personmask`) produces a VP9 alpha WebM. She sits on a brand-gradient background with story cards floating in 3D behind her, plus a warm grade and a drop shadow.
  - **Phone moments:** when she shows the phone, switch to the original footage, because the matte can drop a dark phone screen.
  - **Voice:** DeepFilterNet (uv venv, Python 3.11) followed by a studio EQ, de-esser and compressor chain.
  - **Motion:** more 3D-rotating inserts.
  - **Delivery:** UGC1–5 go in Documentos/Stories Lab Criativos/3 - UGC creator. WhatsApp copies are HEVC files under 10MB, sent to the user's own chat as documents.
- v8 (2026-11-16, user: "tá ficando muito tempo dentro do aplicativo, tem que mostrar mesclando"):
  - **The problem:** v7 spent 49–81% of the time in app/PiP/B-roll, with stretches of up to 11s without her face full-screen.
  - **The fix:** `window.HER = [[a,b],…]` in each `build/<u>m.txt`, handled by the lib2 core. Her real footage jumps in over the app for about 0.6–1.3s. The entrance rotates between zoom-punch, whip-left and swipe-up, and `make2.py` adds the matching SFX. Captions show in normal style during these windows.
  - **Target:** no app/PiP/B-roll run longer than about 2s without cutting back to her face.
  - **Placement:** pick the windows by hand on connective words, never on literal beats (counters, X, professions, theme lists).
  - **Check the footage:** only use a window if her face is actually on camera at that moment. In u3, 4–15s of the original footage is phone-only, so it has no cut-backs.
- v7 (2026-11-16, user: "não precisa ser o tempo todo sem o fundo… tem que mesclar"): the default is her real footage. The cut-out is used only on free talking-head shots, never the hook, PiP, B-roll, motion or phone moments. The background opens as a circle around her with a flash, and the 3D cards pop in with a bloom/swish sound. The user said that this result was "muito bom".
