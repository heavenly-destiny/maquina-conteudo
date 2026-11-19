---
name: motion-reel-premium
description: Use when asked to make an agency-grade narrated motion ad, a Stories/Reels ad creative (9:16) for the user's own app, product reel, fintech/app commercial, "comercial não oficial", spec ad or Instagram reel with kinetic text, 3D UI cards, floating notifications, a 3D mascot and AI voice-over — or when the user shares a reference reel of that kind and wants "the same quality". Also when a motion video built with Hyperframes looks generic, dark-neon, glitchy or "template".
---

# Motion Reel Premium

Creative-direction layer for narrated 30–40s product reels in the style of top Brazilian spec-ad creators (reference: "Inter — Simplifica a vida", comercial não oficial, 37s). It sits ON TOP of the Hyperframes pipeline: route the build through `/hyperframes` → `general-video` (narrated, multi-scene), and use this skill to decide what every scene looks like, how it moves and how it sounds.

**This skill is technique, not a look (user rule).** Take the 3D, motion density, transitions, sound design and word-locked timing from it. The colors, fonts and assets below (cream canvas, orange, the zupi coin and fox) belong to the reference pieces only. Every new piece gets its own visual identity from its brand or content; never reuse the zupi palette or zupi assets on another piece.

**Core principle:** one visual family, held for the whole piece. In the reference: warm light canvas, brand color as the only accent, soft optical physics (blur, depth, glow) instead of effects, and every visual beat locked to a spoken word.

**Stories / Reels ads for the user's own app (9:16, paid traffic):** read `stories-ads.md` first. It covers the vertical canvas, safe zones, Story-native captions and reply banners, real-app capture and the asset rules, with a working 3-creative build in `examples/sl-stories/`.

**Editing creator (UGC) footage into ads:** read the "Editing creator (UGC) footage" section of `stories-ads.md`, including the v4–v8 rounds. The rules are: never cover her face or the phone she shows, intercut her with motion of 2s or less, cut back to her face, show literally what she says, use female-only imagery, and use a studio voice chain. The working code is in `examples/sl-ugc/`.

**Retention every second (user rule, always).** The hook earns 3 seconds, and every later second has to earn the next. Open a curiosity loop early (an unexplained number, a blurred result, "vou te mostrar como") and close it only near the CTA. Re-hook every 3–5s with a new question, reveal, number jump or pattern interrupt (hard cut, zoom, sound hit, format switch). Check each beat in the shot list: "why does she keep watching at this exact second?" If nothing new is promised or revealed for more than 5s, cut it or add a beat.

**Every line is shown literally (user rule, always).** Write a shot list where each VO line gets the concrete scene it describes, built from real material: real app screens, real Pinterest results, real stickers. Placeholder squares, skeleton loaders or abstract shapes never stand in for a line. Check: with the sound off, does the picture say the line? Example: "perdia meia hora no Pinterest e nem ficava bom" means a Pinterest feed of real cheesy results scrolling, a clock running to 30 min, and then the chosen sticker pasted on the story with a white box, pixelated and crooked, plus a 🥴.

**Everything said is drawn and acted on screen, built at the moment it is said (user rule, 18/11/2026, all motion: ads, content, everything).** Not only real screens: illustrate the speech. A sad person = an animated character that is visibly sad (drooping, tear, grey cloud). "Climb a mountain" = a mountain drawn on screen and a figure climbing it while the line plays. Draw these as SVG/CSS characters and scenes animated with GSAP (or generate them when a drawing will not hold up). Each element is constructed in sync with its word (lines drawing in, shapes assembling), never a static picture that just appears. Fluid motion and fluid transitions everywhere. Palette: pick a strong palette per piece that fits its brand and mood (pieces do not all share one palette). Check: mute the video; can someone retell every line from the drawings alone?

**Never still, everything illustrated, every action has its sound (user rule, 18/11/2026, every piece).** The frame is never frozen except in a deliberate suspense beat (and that beat carries its own sound design). Any avatar, character or person mentioned is an illustrated, animated character. Text being typed on screen gets a subtle keyboard sound per keystroke burst. A cursor that appears and clicks gets a click sound on the exact click frame. Taps, swipes, pops and lands all get their own soft foley.

**Copy first, then generation (user rule, 18/11/2026).** Send the full script of every creative to the user in chat and wait for approval before generating any voice, music or asset.

**Voice is paid ElevenLabs only (user rule, 18/11/2026).** Never use a free voice (edge-tts or similar), not even as a placeholder. If the ElevenLabs connector is missing or fails, tell the user right away and wait.

**Think like a film producer (user's main rule, 18/11/2026).** Every piece is a tiny movie: a character, a situation, tension, a turn, a payoff. Ask why people binge series for hours and apply it: open a question, raise stakes, pay it off late. Every second is intentional: line, voice emotion, illustration, music section (suspense under tension), every SFX. If an element does not pull the viewer to the next second, cut it.

**Never repeat a photo or a pattern (user's absolute rule, 18/11/2026).** Every story, card, screen and tile has its own real photo matched to its theme; nothing repeats inside a creative or across a batch. No clone grids, no series of "photo with bom dia written in the middle", no recurring template look. Show the product's RANGE: many different themes and niches (manicure, bakery, pet, gym, birthday, beach, law, shop...) so the viewer sees it fits her. Pool: ~350 real photos in videos/sl-ganchos/assets/pool, Pinterest when more is needed. Audit every contact sheet for repetition before delivering; if you see it, fix it, never move on.

**Emotion comes first.** Before any generation, read `emotional-direction.md` and write `emotion-map.json`: one mood (excitement, suspense, melancholy, hope, triumph, intimacy, urgency, humor, authority, curiosity, pain) and one intensity per beat. Voice tone, music section, SFX palette and motion energy all come from that map and change together at the mood boundaries. The visual family stays fixed; the emotion moves.

## The style contract (fill every slot before building)

| Slot | Value in this style |
|---|---|
| Master canvas | **1920×1080, 30fps.** The vertical deliverable is made later by the monitor finish (see Finish). |
| Background | Warm cream (`#F6EEDF`–`#FBF6EE`) with one large soft radial glow in the brand color (40–60% opacity, 900–1400px blur), drifting slowly. Opening and closing scenes are a **solid brand-color field** with the same glow in a lighter tint. |
| Accent | The brand color only (for example orange `#FF7A00`→`#FF5500` as a gradient). Use it on the **one key word** of each line, on primary UI, and on the mascot. Success states are green (`#22C55E`). Everything else is near-black ink `#1E1E1E` or grey `#B8B2A8`. |
| Type | One geometric sans (Outfit, Plus Jakarta Sans or Sora), weight 600–700, tracking −1% to −2%. Headline 110–150px when centered; 64–80px in a top band when sharing the frame with an object. Ship the font file and declare `@font-face`. |
| Objects | Hyper-real 3D tokens: credit card, Pix/app icons, phone in hand, iOS notifications, UI cards with big radius (28–40px), soft long shadows and a light inner highlight. |
| Character | One 3D mascot (Pixar-like, soft materials) delivered as generated video clips with transparent or cream backgrounds, matched to the cream canvas. |
| Live beat | One 1–2s photoreal clip of a person enjoying the outcome (a night-out face, a smile), dark and cinematic, as contrast. |
| Voice | Warm, confident ad narrator in the target language, short sentences, deliberate pauses. |
| Music | Continuous bed, never silent, ducked under the voice. Peak around −1 dBFS; mix RMS around −17 dB. |

## Scene grammar (build the script from these beats)

| # | Beat | What is on screen | Motion recipe | Hyperframes rule |
|---|---|---|---|---|
| 1 | **Brand-field hook** (0–2s) | Solid brand field, one huge white word | The word enters with blur 20→0px and a slight scale of 1.04→1. The next words push in from the right with a horizontal smear; the line slides left as it grows (camera-follow typing). | `waterfall-entry`, `motion-blur-streak` |
| 2 | **Situation** (2–5s) | Cream canvas, two-tone headline ("rolê" ink + "**marcado**" accent gradient), phone in hand rising into frame, small app icons floating at depth | Headline words appear on VO timestamps. The phone rises 300px→0 with power3.out over 700–900ms. The floating icons have parallax at 3 depths, and the far ones are blurred. | `dynamic-content-sequencing`, `depth-of-field-blur` |
| 3 | **Token play** (5–9s) | Card and Pix token spin in 3D, then iOS notifications ("Compra aprovada R$ 89,90 · Bar da Esquina") cascade at several depths | rotateY flips (600–800ms, power2.inOut) with motion blur at peak speed. Notifications fly from behind the camera to rest, staggered 80–120ms, the near ones big and blurred. The last notification **zooms through the camera**, and that zoom is the cut. | `orbit-3d-entry`, `depth-scatter-assemble`, `coordinate-target-zoom` |
| 4 | **Turn** (9–12s) | Mascot extreme close-up, worried eyes, question on top ("E na segunda?") | Hard cut on the question word. The mascot clip plays. Then a pull-back to the full mascot standing on cream with a soft floor shadow. | generated video clip |
| 5 | **Payoff UI** (12–15s) | Top band headline builds word by word ("**Zero** ressaca financeira."), centered UI card (Limite R$ 2.750,00, gradient progress bar, slider) | The card enters with blur and scale 0.92→1. The number counts down while the slider moves in sync (1.2–1.6s, power2.inOut). A green check pops with spring overshoot. A status pill fades in ("Fatura sob controle"). The mascot bounces through as the exit. | `counting-dynamic-scale`, `stat-bars-and-fills`, `spring-pop-entrance` |
| 6 | **Brand claim** (15–16.5s) | "Porque quem é [logo]" over the mascot standing and breathing | The logo sits inline in the text baseline. Exit with a blur dissolve. | `waterfall-entry` |
| 7 | **Feature cycle** (16.5–22s) | Left column: 4 feature names. Right: one UI card per feature, plus a small round badge icon on the card corner. | The active item is ink at 100% with a brand dot. Inactive items are grey at 35%. On each VO cue (~1.3–1.6s) the highlight steps down and the right card swaps by blur-crossfade (300ms) with a slight y rise. The badge pops in each time. The list never moves. | `fixed-anchor-cycle` (sub-shape A), `discrete-text-sequence` |
| 8 | **All-in-one** (22–26s) | Centered line ("Pix, cartão, investimentos e sua **reserva de emergência**") with 3D icons orbiting at the four corners | The words build with a blur-in. The icons float and rotate slowly at depth. The key phrase in accent smears in from the right. | `waterfall-entry`, `sine-wave-loop` |
| 9 | **Human beat** (27–28s) | Photoreal night clip, with one white word top-left ("Você…") | A hard cut in, held under 1.5s. | footage clip |
| 10 | **Mascot sign-off** (28–31s) | Cream band headline ("O **porquinho** cuida do resto.") with the mascot close-up inside a rounded media frame | The frame scales in with blur. The mascot reacts. | `card-morph-anchor` |
| 11 | **Lockup** (31–34s) | Brand field, logo + tagline | Logo assemble or blur-in, tagline 200ms later, then a 1.5–2s hold. | `logo-assemble-lockup` |
| 12 | **Credit** (34–37s) | Brand field, "by @handle", tiny "COMERCIAL NÃO OFICIAL" | Fade in, hold. | — |

Cut beats to fit the script. Keep the order: hook → situation → tension → payoff → features → brand.

## Premium 3D (always)

Premium comes from real dimensionality. Every hero object is a **real 3D render**, not a flat CSS shape: credit card, coin, phone, shield, bell, calendar, app icons and the mascot.
- **Generate them** with `creative_generate_image` and `bytedance-seedream-5.5` (transparent background), one object per image. Prompt suffix (the user's standard): "V-Ray style photorealistic 3D render, physically based materials, glossy reflections, soft global illumination, subtle rim light, crisp sharp details, soft contact shadow, isolated on transparent background, brand color #XXXXXX". About 100 credits per object. Keep one prompt suffix for the whole set so the lighting matches.
- **Shadows in layers** on every floating object and card: a tight contact shadow (`0 8px 16px rgba(…,0.18)`), a long soft ambient shadow (`0 40px 90px rgba(…,0.22)`), and a colored bounce in the brand hue at ~10%. Shadows move with the object: they get bigger and softer as it rises.
- **Light:** a gloss or specular sweep crosses every card or token once after it lands (a white gradient band at 25% opacity sliding across, 0.6–0.8s), plus an inner top highlight (`inset 0 1px 0 #fff`).
- **Sharpness hierarchy:** the hero object is razor sharp, while near and far objects are blurred (depth of field). Sharpness is what the eye reads as premium, so never let the hero blur except during its own motion.
- **Real perspective:** a parent `perspective: 1400px`, objects with `rotationX/rotationY` tilts that keep drifting (±6–10°), and cards that enter from a tilted 3D pose (rotationX 25° → 0).

## Motion density (fluid, never static)

The first full reel was judged "too little motion". These are the minimums:
- **The camera never stops.** Every scene's inner wrapper has a continuous slow push (scale 1 → 1.04–1.06) plus a tiny sine drift over the scene's whole length.
- **Overlapping action.** The next element starts before the previous one settles (40–60% overlap). No moment has all objects frozen.
- **Every entrance animates at least 3 properties:** position or scale, plus blur, plus rotation or 3D tilt. Text words enter with `rotationX` 50° → 0 under perspective, y 30 → 0 and blur 16 → 0.
- **Secondary motion:** shadows breathe, glows pulse gently, tokens keep spinning slowly, and the mascot's frame floats.
- **Micro-interactions on every payoff:** a check gets a particle burst (8–12 dots radiating) plus a ring ripple; a counter gets a scale punch on its last digit; a list highlight uses a **sliding pill** behind the active item instead of a color snap.
- **Orbiting instead of floating** for the "all in one" icons: they travel on an elliptical path around the headline at different depths.
- **Reveals:** frames enter with a mask reveal (`clip-path: inset()` opening) plus scale, not a plain fade.
- **Lockup:** the logo assembles (the icon spins in, the letters stagger up), then a light sweep crosses it, and the tagline enters letter by letter.

## Motion constants

- **Transition family:** a horizontal **blur-smear push**: both scenes travel the full frame together (A x 0→−1920, B x +1920→0, 300ms, power3.inOut) while an SVG `feGaussianBlur stdDeviation="X 0"` on each scene's inner wrapper peaks at 60 mid-move and resolves to 0. The canvases are opaque, so a short ±240px offset only hides scene A behind B. Then a **zoom-through** (an object scales past the camera, 400–500ms, power2.in, cut at peak), or a **blur crossfade** (250–350ms). Every scene change uses one of these three.
- **Text in:** per word, blur 16→0px, opacity 0→1, x +30→0 (or y +20→0), 220–320ms, power3.out, starting **at the word's VO timestamp minus 60ms**.
- **Text out:** blur 0→12px and opacity →0, 200–250ms, power2.in. A swapped headline exits as the new one enters.
- **Objects in:** blur 12→0 with scale 0.9→1, 500–700ms, `expo.out`. Pops use `back.out(1.4)`.
- **Ambient:** the glow drifts 80–150px across a scene, and objects float ±6–10px on a sine (finite repeats). Every object always moves a little and is never fully frozen.
- **Depth:** 3 layers. The far layer gets blur 6–10px at 60% scale, the near layer is oversized and blurred 8–14px, and the hero layer stays sharp.
- **Rhythm:** a visual change every 0.8–1.5s and scenes of 2–4s, with no idle frame longer than ~1.5s except the final lockup.

## Audio recipe (ElevenLabs connector)

1. Pick or design the voice: `creative_list_voices` / `creative_design_voice` → `creative_save_designed_voice`. Use a warm, upbeat ad narrator in the script language.
2. **Write an emotion map before generating anything.** The voice shifts its emotion line by line along the story arc, and that is what connects with the audience. Every script line gets one emotion and one energy level, written into the prompt as `eleven_v4` inline audio tags:

   | Story beat | Emotion · energy · pace | Example line with tags |
   |---|---|---|
   | Hook / situation | playful, excited · high · quick | `[excited] Sexta à noite, rolê marcado.` |
   | Action / rhythm | rhythmic, cheeky · high · bouncy | `[playful] Cartão pra cá, [quick] Pix pra lá.` |
   | Turn / tension | teasing concern · low · slow, with a pause before it | `[pause] [slowly, with a hint of worry] E na segunda?` |
   | Payoff / relief | relieved, confident, smiling · medium-high | `[relieved, smiling] Zero ressaca financeira.` |
   | Feature list | energetic, crisp · high · fast, even beats | `[upbeat, crisp] Cartão virtual, modo vigilante, ghosting em golpe e login pelo rosto.` |
   | All-in-one claim | warm emphasis on the key phrase | `[warm] Tudo [emphasis] num app só.` |
   | Human beat | intimate, soft · low | `[softly, intimate] Você curte a noite.` |
   | Sign-off | warm, calm, confident · medium · slower | `[warm, confident] Inter. [pause] Simplifica a vida.` |

   Rules: the energy goes up and down (never flat, never all high), there is one real pause before the turn, and the slogan is the calmest line. Generate **one call per line** with `model_id: "eleven_v4"` and 2–3 takes. Choose the take whose emotion matches the map, and redo any take that sounds flat or overacted.
3. Get word timestamps with `creative_transcribe_audio` (or `npx hyperframes transcribe`). **Every visual beat keys off these timestamps.**
4. **Music follows the same story arc as the voice.** Generate it with `creative_generate_in_flow`, `node_type: "music"`, `model_id: "eleven_music_v2_5"`, and the exact length of the piece. The prompt describes the sections with their timestamps taken from the VO:

   | Story beat | Music |
   |---|---|
   | Hook / situation | Upbeat modern pop/electronic groove starts on frame 0, ~110–120 BPM, light and fun |
   | Turn ("E na segunda?") | **Drop-out.** The bed cuts or goes low-pass/filtered for 1–2s and leaves room for the question. One sub hit or stab on the question word. |
   | Payoff | The groove comes back fuller, as a mini-drop |
   | Feature list | Driving, steady rhythm with the same energy across every item |
   | Human beat → sign-off | Lifts warm, then a final hit on the logo and a short tail that rings out to the end |

   Pick the BPM, then **quantize every scene change to the beat grid** (at 120 BPM a beat is 0.5s), so the cuts land on the music. The bed is never silent except during the deliberate drop-out. Put it in `data-audio-group="music"` and carve it under the voice with `data-fx-carve='{"enabled":true,"sources":["voiceover"],"strength":0.8}'` (see `hyperframes-audio` → Voiceover carve) rather than ducking the whole bed.
5. **SFX are synced to the animation, not placed by ear.** Every SFX is an `<audio>` clip whose `data-start` comes from the **same timeline constant** as the motion it sounds, so moving the motion moves the sound with it:

   | Motion event | Sound | `data-start` |
   |---|---|---|
   | Blur-smear push / zoom-through | Soft airy whoosh, 0.4–0.6s | transition start − 0.08s (the peak of the whoosh lands mid-move) |
   | Notification, badge or card landing | Light UI pop or tick | the exact frame it settles (tween end of position/scale) |
   | Counter running | Very soft digital ticks, or none | counter start, trimmed to its duration |
   | Green check pop | Bright "ding" or success chime | check tween start + 0.10s (the overshoot peak) |
   | Mascot jump or bounce | Cartoon boing or soft thump | contact frame |
   | Into the lockup | Low riser, then a hit | the riser ends exactly on the logo's first frame |
   | Each word of the hook | Nothing. Words land on the voice, not on clicks. | — |

   Generate each sound once with `creative_generate_in_flow`, `node_type: "sfx"`, `model_id: "eleven_text_to_sound_v2"`, with its duration in the prompt, and reuse it. SFX sit 6–10 dB below the voice peaks, in their own `data-audio-group="sfx"`, never in the voice group. Two SFX never stack within 120ms. Never let an SFX land on a stressed VO word: shift it to the gap before or after.

   ```html
   <!-- one constant drives the motion and its sound -->
   <audio id="sfx-whoosh-1" data-audio-group="sfx" src="assets/sfx/whoosh.mp3" data-start="2.67" data-duration="0.6" data-volume="0.55"></audio>
   <script> const T_PUSH_1 = 2.75; /* tl.fromTo("#s1-in", …, T_PUSH_1) — whoosh data-start = T_PUSH_1 - 0.08 */ </script>
   ```
   After the render, listen to the transitions and the check pop. If a sound is early or late, fix the constant, not the audio file.
6. Use one `creative_create_flow` per project and pass its `flow_id` to every generation. Run `estimate_only: true` first and show the user the credit cost before the real run.
7. Mix to about −14 LUFS integrated for Reels.

## Asset recipe

- **Mascot & 3D tokens:** `creative_generate_image` with `gemini-3-pro-image` (it holds a character consistent across shots), in front, 3/4 and close-up poses on a cream background matching `#F6EEDF`. Use `bytedance-seedream-5.5` when a token needs a transparent background. Then run `creative_generate_video` with `connect_from` set to the image node for each 2–3s mascot action (`kling-3-pro` or `bytedance-seedance-v2.5`).
- **Human beat:** `creative_generate_video` with `veo-3.1-generate-001` or `kling-3-pro`, text-to-video: a night out, shallow depth of field, warm practical lights.
- **Copying a whole reference video?** `/reverse-any-video` rebuilds a given video file as an editable Hyperframes project, checked frame by frame. Use it together with this skill.
- **Fonts:** the files are in `fonts/` next to this skill (Outfit, Plus Jakarta Sans). Copy the one you use into the project's `assets/fonts/` and declare it with `@font-face`.
- **UI cards:** build these in HTML/CSS inside the composition (crisp at any scale, and the numbers can animate). Do not generate UI as images.
- **Brand assets:** use the official logo via `/media-use`. A third-party brand needs the "COMERCIAL NÃO OFICIAL" credit and stays a portfolio piece.

## Finish: the monitor-in-room vertical

**Default deliverable: the 16:9 master only.** Make the vertical monitor version only when the user asks for it. When they do, the 16:9 master is shown on a monitor in a real-looking desk scene, filmed in portrait with handheld drift. Two ways to do it:
- **Film it:** play the master full-screen on a monitor and shoot 4K portrait on a phone, slowly pushing in.
- **Composite it:** get a plate of a desk with a monitor (shot by the user, or generated with `creative_generate_image`), then run `bash scripts/monitor-composite.sh <master.mp4> <plate.png> <out.mp4> "<x0:y0:x1:y1:x2:y2:x3:y3 screen corners>"`. This maps the master onto the screen, adds a slight screen glow and a slow handheld drift, and outputs 1080×1920.
  - The plate prompt asks for a **"standard flat 27-inch 16:9 monitor (not ultrawide, not curved), about 55% of the image width, straight-on, screen black"**. An ultrawide monitor distorts the master. The image model returns 16:9 regardless; the script's center crop turns it portrait, and the monitor ends up wider than the frame, like the reference.
  - Measure the screen corners by scanning for the black screen pixels (an ffmpeg `crop=W:1` row scan plus a 1-px column scan), and inset them by 1–2px.
- **Vertical safe zone (only when a vertical version is requested):** the portrait crop shows only the center of the screen. Keep all reading text and key UI between **x 210 and 1710 px** of the 1920 master. Only decorative tiles may sit outside it.

## Build gotchas (the checks fail on these)

- **Contrast on the brand field:** white on bright orange is ~2.6:1 and fails `check`. Darken the field's center to around `#EA5A00` and its edge to `#B33200`, keep the glow at ≤35% opacity, and keep headline text pure `#FFFFFF`. On cream, brand-colored text that has to be read (amounts, arrows) uses a darker shade such as `#D94A00`. Only the key headline word keeps the bright gradient.
- **Sliders and progress bars:** animate `scaleX` (with `transform-origin: 0 50%`) and `x`, never `width` or `left`. Layout properties stutter in a frame-seeked render.
- **Frame 0 is the thumbnail:** the first word is already on screen at t=0 (opacity 0.75 and blur 10px resolving to sharp), never an empty field.
- **Credits and legal lines** ("COMERCIAL NÃO OFICIAL") get `data-layout-ignore` and at least 20px. Reading text is at least 28px on the 1080p master.
- **Directional blur** needs a proxy `{v}` tweened with `onUpdate → setAttribute("stdDeviation", v + " 0")`, seeded once before `tl.seek(0)`.
- A working reference build of beats 1 and 5 plus the push is in `examples/demo-hook-payoff.html`. Copy it as a starting point.
- **A full 26s reel built with this skill** is in `examples/zupi-reel/`: `timing.json` (the single source of every event time), `build.py` (fills the composition template with those times plus the VO word times), `mix.py` (voice, music bed with drop-out and sidechain duck, and peak-aligned SFX, normalized to −14 LUFS) and `index.template.txt`. Copy that structure for a new reel.

## Asset QA (do this before building)

- **Voice takes:** transcribe every take you plan to use. `eleven_v4` sometimes repeats a phrase ("E na segunda… e na segunda"). Trim leading and trailing silence, lay the lines out with the emotion-map gaps (a long pause before the turn), and write `vo-layout.json`.
- **Word timing:** whisper's word timestamps snap to coarse segments. Map each line's words proportionally onto that line's exact start and duration from the layout, rather than trusting the raw times.
- **Music:** measure RMS in 0.5s bins (`astats` with `asetnsamples`). Generated beds can start with seconds of silence, or put the drop-out somewhere else. Use an offset (`-ss`) so the bed plays from frame 0, and create the turn's drop-out in the mix (lowpass plus −12 dB between the dropout times), not by hoping the bed has one in the right place.
- **SFX peaks:** measure each file's loudest bin and align **that peak** to the motion event, not the file start. Generated whooshes often peak at 0s, and risers peak near the end.
- **Mascot clips:** sample the clip's background color and use it as the canvas `--cream`, so the clip cuts in seamlessly. Generate the clips image-to-video from the same mascot image so the character stays consistent.
- **Credits:** price everything with `estimate_only` first. Reference costs on Starter: a voice line ~40–100, the music bed ~900, an SFX ~17, a flash image ~406, a Kling 2.5 Turbo clip ~2,121, and a Kling 3 Pro clip ~5,090.
- **Cheapest model that holds the quality (user rule):**
  1. Before every paid generation, compare the estimate of the cheap option with the premium one, and judge whether the cheap one will look good enough at the size it appears on screen.
  2. Pilot a single cheap take before generating a batch.
  3. Reuse assets you already have (library SFX, site photos, earlier renders, HTML/CSS UI) before generating new ones.
  4. Pay for the premium model only on hero shots (mascot, 3D tokens seen up close) or when the cheap pilot clearly falls short.
  5. Never regenerate just to try a variation.

## Verify before render

Run `npx hyperframes snapshot` at the midpoint of every beat and check the contact sheet against this list:
- [ ] Every frame is a warm light canvas or a solid brand field. No dark or neon scenes outside the human beat.
- [ ] Exactly one accent color plus success green.
- [ ] Each headline has exactly one accent-colored key word.
- [ ] Every scene change is a whip, a zoom-through or a blur crossfade.
- [ ] At least one blurred near or far object is visible in the token and all-in-one beats.
- [ ] Each text appearance lands on its VO word (±80ms).
- [ ] The music is audible from frame 0 to the end.

## Level 3: fully animated and mixed like a film

These rules came from v3 of the emotion test, the strongest result so far. Every reel should meet them.

### Mix with volume automation (`examples/zupi-emocao/mix3.py`, numpy, sample-exact)
- **Music level = mood base curve + voice duck + pre-lap swells**, computed per sample:
  - **Base curve:** dB keyframes taken from the emotion beats. Music leads the intro (−7), sits low under sad or tense voice (−9 to −13), drops to silence (−60) just before the turn, rises with the hope light (−9), peaks on the triumph beat (−1), settles for relief (−7), swells into the logo (−3), and has a tail.
  - **Voice duck:** measured from the real voice envelope (50ms RMS, speech above −42 dB). Up to −8 dB under speech, 60ms attack and 350ms release, so the music breathes back up in every gap between lines.
  - **Pre-lap:** the music and a swell SFX start rising 0.3–0.5s before each mood boundary, so the ear arrives before the eye.
- **Every SFX has its own level relative to the bed** (−26 dB for a rumble bed up to +4 dB for the key hit) and is placed by its measured peak. Each mood has its own SFX palette: melancholy gets almost nothing (a dissolve), suspense gets rumble, engine, sub-hit, crack and heartbeat, hope gets a reverse swell, shimmer, coin and pops, triumph gets swell, whoosh, step pops, confetti and ding, and authority gets whoosh, riser and shimmer.
- Normalize at the end (peak −1.5 dB, then `loudnorm` to −14 LUFS).

### Particles: every mood has its own system (`particles()` in the example template)
Melancholy: ash falling slowly, desaturated. Suspense: a few dust motes twinkling in **light shafts**. Hope: golden sparks rising with glow. Triumph: rising sparks plus a **confetti burst** (radial out, then gravity and spin). Relief: soft large bokeh. Authority: calm sparkles plus slow shafts. Use a seeded PRNG so renders stay deterministic.

### Transitions change with the emotional turn
- Melancholy → suspense: **dive into the dark.** The camera pushes into the last object while brightness falls.
- Suspense → hope: **iris of light out of black.** A dark layer, then a `clip-path: circle()` opening with a warm flash.
- Hope → triumph: a blur-smear push with a swell.
- Triumph → relief: a **white bloom** flash that fades.
- Into the brand: a push.

### Words react to their meaning
"sumia" dissolves letter by letter, drifting up. "quebrou" **cracks**: the bottom half (a clip-path copy) shifts, the camera shakes and the light flickers. "pequeno" grows with an elastic ease. "1 ano" slams in from scale 1.9 with a white flash and confetti. Pick 2–4 key words per piece and give each one a reaction that shows the word.

## Level 4: sound design and transitions like a film (`examples/zupi-emocao/mix4.py`)

### Sound design
- **Ambience bed under everything**, changing with the mood and crossfaded at the boundaries. Melancholy gets quiet room tone (synthesize filtered noise when the generated one is too short or silent) plus a slow clock (`tick` at `atempo=0.5`). Suspense gets looped tense wind. Hope through the end gets airy morning ambience. Generated ambiences often come back 0.5–2s long, so loop them with 0.5s crossfades.
- **Layer every key hit:** transient + body + sub + tail. For example, "quebrou" = glass crack (transient, +10 dB) + cinematic impact (body/sub) + sub-hit + a card "land". The triumph burst = impact + confetti + small cheer + ding. A logo = riser into a sting + sparkles.
- **Stereo follows the picture:** an equal-power pan from start to end of each sound. Push whooshes cross the frame in the direction of motion, expenses drain off to the right, and confetti spreads L→R.
- **Repeated sounds get pitch steps** (+0/+2/+3 semitones on step pops, rising), so they never sound like a machine gun.
- **Reverb per mood:** wet (30–45%, 1.4–2.2s) in melancholy and suspense, dry in triumph.
- **Duck the music under big hits** (−3 to −6 dB, 30ms attack, 450ms release) as well as under the voice. Duck depth follows the mood: shallow in triumph (×0.45), so the music stays big; full in sad and tense moments, where the voice is fragile.
- **Soft foley on UI:** a card "land" when each card settles, and a quiet "swish" on key text. Generated foley is often very quiet (−37 to −41 dB peak), so measure it and add gain.
- **Check the dynamics curve** (1s RMS) after mixing. Transition whooshes must never be louder than the triumph beat; triumph is the loudest moment of the piece.

### Transitions (one per emotional turn, built in a top-level `#fx` overlay clip)
- **Melancholy → suspense:** speed lines (`repeating-conic-gradient` with a radial mask) while the camera dives and brightness falls, plus a descending whoosh.
- **Suspense → hope:** an iris out of black, with **light rays** (conic gradient, masked), a radial **spark burst**, a bloom pad and a reverse swell.
- **Hope → triumph:** a **match cut**. An object from scene A (the coin) rises, spins and flies through the camera (scale ×16 with motion blur), and scene B is revealed behind it. A pass-by whoosh follows it.
- **Triumph → relief:** a **light leak** (two warm 2600px radial gradients drifting across) plus a white bloom.
- **Into the brand:** **ink spread**, where the brand-colored scene opens as a `clip-path: circle()` from the mascot frame's center.
- Gotcha: when tweening `filter` on a scene that has no filter yet, use `fromTo` with explicit start values (`brightness(1) blur(0px)`). A plain `.to` can start from `brightness(0)` and flash black.

**Organic photos only (user's absolute rule, 18/11/2026).** Buyers are ordinary middle-class people. Every photo looks like a normal person shot it on an iPhone: home kitchen, small salon, car selfie, gym mirror, street, desk, homemade cake, pet on the sofa. Never mansions, luxury interiors, studio/editorial shots, heavy edits or "perfect" Pinterest aesthetics. The viewer must think "I've posted a photo like that".
