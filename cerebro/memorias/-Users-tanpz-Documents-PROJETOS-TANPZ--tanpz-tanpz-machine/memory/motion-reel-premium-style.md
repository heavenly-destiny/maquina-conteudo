---
name: motion-reel-premium-style
description: User wants motion videos at agency quality like the Inter spec-ad reel; use the motion-reel-premium skill + Hyperframes + ElevenLabs
metadata:
  node_type: memory
  type: user
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T06:43:22.039Z
---

The user wants Claude to produce narrated motion ad reels at the quality of the Inter "comercial não oficial" reel by @ayrtonsena.stg: a warm cream canvas, one brand accent, kinetic text synced to the voice, 3D UI cards with counters, floating notifications, a 3D mascot, blur-smear push transitions, a continuous music bed, and a 16:9 master shown on a desk monitor and filmed in portrait.

For any such request, load the `motion-reel-premium` skill (~/.claude/skills/motion-reel-premium) and build with Hyperframes (CLI 0.9.56 installed globally). Generate voice, music, SFX, images and video with the ElevenLabs connector. A working demo project is at videos/motion-reel-demo in tanpz_machine. Voice rules: [[voice-emotion-arc]].

Premium look rules the user stressed (16/11): always use **real 3D elements in V-Ray photoreal style** (rendered objects, not flat CSS shapes) with depth, sharpness, layered shadows and specular light, because that is what reads as premium. The motion must be dense and fluid: the camera never stops, actions overlap, entrances animate 3+ properties, payoffs get micro-interactions (particles, ripples, light sweeps), and icons orbit. The skill's "Premium 3D" and "Motion density" sections have the rules.
