---
name: sound-design-sync
description: Every video gets music that follows the story arc and SFX synced frame-exact to the motion events
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T06:44:04.272Z
---

Every video Claude makes for this user needs a sound design pass:
- **Music** that follows the story arc: it starts on frame 0, drops out or filters for 1–2s on the turn, comes back fuller on the payoff, drives through the feature list, and ends with a hit on the logo. Scene cuts are quantized to the beat grid.
- **SFX** synced to the motion events: a whoosh peaking mid-transition, a pop on the frame a notification or badge settles, a ding on the check overshoot, and a riser ending on the logo. Each sound's `data-start` is derived from the same timeline constant as its animation.

**Why:** the user asked for "efeitos sonoros na hora certa, sincronizados" and "músicas com o necessário". Sound timing is part of the agency-quality feel of the reference reel, together with the voice ([[voice-emotion-arc]]).

**How to apply:** follow the Audio recipe steps 4–5 in the `motion-reel-premium` skill. Generate with ElevenLabs (`eleven_music_v2_5`, `eleven_text_to_sound_v2`) and carve the bed under the voice group in Hyperframes. After the render, check the timing at the transitions and pops, and fix the timeline constant rather than the audio file. Related: [[motion-reel-premium-style]].
