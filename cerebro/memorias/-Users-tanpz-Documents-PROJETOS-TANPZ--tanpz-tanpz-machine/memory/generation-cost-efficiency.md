---
name: generation-cost-efficiency
description: "ElevenLabs connector (new account 17/11) is pre-approved for all generation (voice, music, SFX, image, video, mascot), but always pick the cheapest option that keeps quality"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-17T21:17:01.923Z
---

On 2026-11-17 the user switched the ElevenLabs connector to another account (Pay-as-you-go, ~34k credits/month, renewing around the 22nd; it has the cloned voice "VIRNA UISLA", and all 3 voice slots are in use). They then gave standing permission to use it for everything the motion work needs: voice, music, SFX, images, video and the 3D mascot. I do not need to ask before each generation.

The condition is to always choose the most efficient and economical route. Before generating, judge whether a cheaper option gives a good result without losing much quality.

**Why:** the user said to "usar sempre a forma mais eficiente possível e com economia… resultado bom com um custo mais barato, sem perder muita qualidade". The new account's credit budget is small: one Kling 3 Pro clip costs ~5k, about 15% of the month.

**How to apply:**
- Run `estimate_only` and compare a cheap model against a premium one.
- Pilot one cheap take before any batch.
- Reuse existing assets first (SFX library, site photos, HTML/CSS UI, previous renders).
- Pay for premium only on hero shots or when the cheap pilot fails.
- When a single item is expensive (a video clip, a music bed), tell the user the cost in one line.

Related: [[motion-reel-premium-style]], [[skill-evolution-loop]].
