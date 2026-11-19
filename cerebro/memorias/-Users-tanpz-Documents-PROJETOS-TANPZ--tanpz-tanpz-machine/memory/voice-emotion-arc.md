---
name: voice-emotion-arc
description: "Every video gets emotional direction first; voice, music, SFX and motion all follow one per-beat mood map (not just \"excited\")"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T07:29:04.612Z
---

Every narrated video (ads, reels, VSLs, stories) starts with an emotional arc. Each beat gets one mood and an intensity: excitement, suspense, melancholy, hope, triumph, intimacy, urgency, humor, authority, curiosity or pain. The voice tone and pace, the music section, the SFX palette and the motion energy all come from that mood, and they change together at the exact moment the story turns.

Examples:
- **Suspense:** a slow, tense voice with pauses, a low drone or pulse, sub hits, a slow push-in.
- **Melancholy:** a soft, slow voice, minor piano, almost no SFX, slow easing and a desaturated grade.
- **Relief or triumph:** warm and confident, or building; the music comes back fuller and ends on a hit.

**Why:** the user wants videos that truly connect with people. The narrator must "know the exact moment and how to speak", with the right tonality, and that is not always upbeat. Suspense needs suspense music, melancholy needs a calmer voice. Animated-only delivery was explicitly called out as not enough.

**How to apply:** follow `emotional-direction.md` in the `motion-reel-premium` skill. Write `emotion-map.json` before generating anything, use `eleven_v4` with specific bracket directions per line (`[slowly, with tension]`, `[softly, voice slightly breaking]`), put a real pause before the turn, prompt the music by sections from the map (or generate separate cues and crossfade them when the moods are far apart), and match the SFX and motion intensity to the map. Related: [[sound-design-sync]], [[motion-reel-premium-style]].
