# Emotional direction

A video connects when voice, music, sound effects and motion all feel **the same emotion at the same moment**, and change together when the story turns. Decide the emotions first. Every other choice follows from them.

## Step 1: write the emotional arc (before any generation)

Read the script and split it into beats (usually one beat per line or two). Give each beat exactly one mood from the palette below, plus an intensity from 1 to 5. Write the result as `emotion-map.json` in the project:

```json
[
  { "line": 1, "text": "Sexta à noite, rolê marcado.", "mood": "excitement", "intensity": 4 },
  { "line": 3, "text": "E na segunda?", "mood": "suspense", "intensity": 3, "pause_before": 0.9 },
  { "line": 4, "text": "Zero susto no fim do mês.", "mood": "relief", "intensity": 4 }
]
```

Arc rules:
- **Contrast creates connection.** A piece needs at least one turn, where the mood changes direction (fun → doubt → relief, or sadness → hope → triumph). A flat arc, all hype or all calm, does not connect.
- **The turn gets silence.** Put a real pause (0.6–1.2s) in the voice before the turning line, and drop or filter the music there.
- **The ending matches the promise.** A brand line ends calm and confident, not shouting. A cause or story piece can end tender or hopeful.
- **Intensity rises in waves:** build, release, build higher. Don't hold intensity 5 for more than one beat.

## Step 2: the mood palette

Each mood fixes all five channels together. Use the row as the brief for that beat.

| Mood | Voice (`eleven_v4` tags · pace · energy) | Music | SFX | Motion | Transition into it |
|---|---|---|---|---|---|
| **Excitement / fun** | `[excited]`, `[playful]` · fast, bouncy · high | Upbeat pop/funk 110–125 BPM, claps, plucks, bright | Pops, swooshes, playful boings | Fast `expo.out` entries, overshoot pops, lots of objects, camera punch-ins | Blur-smear push |
| **Suspense / tension** | `[slowly]`, `[with tension]`, `[whispering]` for peaks · slow, clipped, long pauses · low-medium | Low drone, pulsing sub, ticking clock, no melody; filtered or stripped down | Sub hits, heartbeat, clock ticks, a reverse swell into the reveal | Slow push-in, darker vignette, objects freeze or drift slowly, a long hold before the reveal | Hard cut, or a slow zoom-in |
| **Melancholy / sadness** | `[softly]`, `[sadly]`, `[sighs]` · slow, legato, falling endings · low | Solo piano or soft strings, minor key, 60–80 BPM, lots of space | Almost none: soft room tone, rain, a distant ambience | Very slow easing (`sine.inOut`, 1.2–2s), desaturated grade, a single element on screen, slow drift down | Slow blur crossfade (0.6–1s) |
| **Hope / relief** | `[relieved]`, `[hopeful]`, `[warm]` · medium, an exhale before the line · rising | Music comes back fuller: warm pads, major key, a gentle build | Soft chime, a "breath" swell | Light opening up (the glow grows), objects rising, smooth `power2.out` | Blur crossfade into a brighter canvas |
| **Triumph / epic** | `[confident]`, `[building excitement]` · strong, measured · high | Full drums, a big hit on the downbeat, a choir or brass swell | Impact hit, riser into the hit, crowd or whoosh | Big scale-ups, camera pull-out reveal, synced beat punches, particle bursts | A zoom-through ending on the hit |
| **Intimacy / tenderness** | `[softly, intimate]`, `[warmly]` · close, slow, almost whispering · low | Acoustic guitar or soft keys, very quiet | Room tone, a soft breath | Gentle handheld drift, a shallow depth-of-field shift, close crops | Soft crossfade |
| **Urgency / scarcity** | `[urgent]`, `[quick]` · fast, punchy, no pauses · high | Driving 125–140 BPM, a ticking hi-hat, risers | Clock ticks, alarm blips, stingers | Hard cuts on the beat, counters running, a shake-free fast slide-in | Hard cut on the beat |
| **Humor / playful** | `[playful]`, `[laughs softly]`, `[teasing]` · uneven timing, a comic pause before the punchline | Bouncy pizzicato or a quirky synth | Cartoon boings, slide whistles, record scratches (sparingly) | Squash and stretch, comic timing (hold, then snap), a mascot reaction | A quick push or a whip |
| **Authority / trust** | `[calm, confident]` · steady, even, clear · medium | Minimal corporate pulse, a warm low end | Clean UI ticks | Stable, symmetric layouts, slow confident moves, no bounce | Blur crossfade |
| **Curiosity / wonder** | `[curious]`, `[intrigued]` · rising questions · medium | Sparkly arpeggios, light pads | Shimmer, sparkle | Reveal moves (mask wipes, zoom-outs), floating particles | A mask reveal or zoom-out |
| **Problem / pain (agitation)** | `[frustrated]`, `[tired]` · heavier, slower · medium-low | Music thins out, a dissonant pad | An error buzz, a low thud | Objects fall or stack up, red accents, shaky counters going the wrong way | Hard cut |

The tag words are suggestions. `eleven_v4` accepts free-text direction in brackets, so be specific: `[voice slightly breaking]`, `[a smile in the voice]`, `[almost whispering, building]`.

## Step 3: make the channels move together

- **Mood boundaries are timestamps.** When the mood changes at line N, the voice tone, the music section, the SFX palette, the motion speed and the grade all change at line N's start, or on the pause just before it.
- **Music follows the arc.** Prompt the bed by sections with timestamps taken from the emotion map (for example: "0–8s playful groove · 8–10s drop to a low filtered drone · 10–18s warm build · 18–26s full triumphant"). When two moods are very far apart (melancholy into triumph), generate **two cues** and crossfade them at the boundary instead of trusting a single generation.
- **Motion follows the arc.** Map intensity to motion: intensity 1–2 means slow `sine` easing, 1–2 elements and long holds. Intensity 4–5 means `expo` easing, overshoot, 4+ elements and beat punches. The visual language (canvas, type, accent) stays the same and only the energy changes.
- **SFX follow the arc.** A suspense beat gets sub hits and ticks, not pops. A sad beat gets almost no SFX at all.

## Step 4: verify the emotion before rendering

Listen to the VO alone and check that each line sounds like its mood. Regenerate any line that sounds flat or overacted. Then watch the snapshots in time order and check that the motion energy rises and falls with the map. The reaction you want from the viewer is "I felt that", not "that was well animated".

## Lessons from the first emotion test (zupi-emocao, in `examples/zupi-emocao/`)

- **Picking voice takes by measurement:** with mood tags, `eleven_v4` really changes its energy. Sad and tense lines came out at −25 to −28 dB mean volume, and triumphant ones at about −18 dB. For each line, keep the take whose loudness matches the mood (quieter for melancholy and suspense, louder for triumph), and transcribe it to confirm the words.
- **Music generations often ignore section timestamps.** A cue prompted to peak at 8–12s peaked at 11–13s, and a second try came out flat. Always measure the cue's RMS in 1s bins, then **place it by its energy**. Use the `-ss` offset to land the cue's measured climax on the triumph beat, and crossfade (0.8s) in the calm tail of another take for the ending. Splicing by measured energy beats regenerating and hoping.
- **Silence is part of the score.** Cut cue A to silence about 0.15s before the hope beat; the hope cue then enters with the light. That short gap is what makes the turn felt.
- **Motion speed comes from one `ENERGY` table** keyed by mood (duration, ease, blur, rise, 3D tilt). Every word entrance reads it, so the same visual language moves slowly when the moment is sad and fast when it is triumphant.
