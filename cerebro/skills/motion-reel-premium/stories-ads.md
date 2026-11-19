# Stories ad creatives (9:16, paid traffic, real app)

Read this when the deliverable is a **Stories/Reels ad** for an app the user owns, aiming at high CTR and cheap CPC. It reuses everything in SKILL.md (emotion map, Level 3/4 mix, transitions), with these changes. The working build is in `examples/sl-stories/`: three Stories Lab creatives, 31–39s each.

## Format
- **Canvas 1080×1920, 30fps.** This is the one case where the master is vertical. Horizontal stays the default for everything else.
- **Safe zones:** the top ~14% (0–270px) and the bottom ~20% (1536–1920px) are covered by the Stories UI and the CTA. Keep captions at `top: 290px` and keep reading content between y 290 and 1500. Decorative elements may bleed into those zones.
- **Frame 0 is the thumbnail and the hook.** The first visual (a story card, the DMs) is already on screen at t=0, and the first caption box appears at about 0.2s.

## Look: native to the Stories feed
An ad that looks like a Story gets a better CTR than one that looks like an ad.
- **Captions are Story text:** a white rounded label (`.cap`) with dark 62px/800 text, words revealed on the VO word times, one key word in the brand pink, emoji at the end and lowercase spoken pt-BR ("cê", "kkkk", "gente…"). A dark variant is used for the intimate or secret beat.
- **Story frames:** an 860×1528 card with radius 44, a progress bar that fills while the scene plays, "teu story · agora" in the header, and the real stickers pasted on with a pop.
- **Reply banners** (`.dm`), in the style of "respondeu ao teu story", carry the promise ("que lindo!!", "onde cê fez esse story??"). They land with a ding on the VO word and, in the triumph beat, rain down with rising pitch.
- **The real app inside a phone** (`.phone` / `.screen` 690×1494): tap indicator plus ring (`tap()`), screen push (`push()`), bottom sheet (`sheet()`), a "Copiada!" toast, and screens built from real captures. An editor screen gets our own photo overlaid in the photo area with an animated before/after slider (`slider()`).

## Capturing the real app (logged-in account, no upsell)
- The Chrome window cannot be resized from the tool. Inject a same-origin iframe of the app at 390×844 fixed at the top-left (`transform: scale(0.9)`), which shares the logged-in session, then capture with `computer zoom region [0,0,351,760] scale 1` and crop the PNG to 690×1494.
- Hide upsell banners **only with CSS inside the recording iframe** (plus a MutationObserver). Never change production data, such as granting a feature or creating an order, just to get a clean screen. Tell the user that is what you did.
- "Most used" stickers are real data: the most-copied categories, and the most-copied stickers within each category. Download the transparent full-size files and paste those, never lookalikes.

## Assets rules (from the user)
- Do not use photos from the sales site. **Photos must look organic: real iPhone snapshots** (POV coffee in bed, legs on a yacht, iced coffee in the car, a dog smiling at the phone, a gym mirror selfie, a bedroom with the city at night). The user rejected AI photos ("muito artificial") and Unsplash ("muito profissional"). Take them from **Pinterest**, which the user explicitly approved for their ads: search in the user's logged-in Chrome, read `div[data-grid-item] img`, download `i.pinimg.com/originals/<aa>/<bb>/<cc>/<hash>.jpg` (fallback `/736x/`), make a contact sheet per slot, and center-crop the pick to 1080×1920 (`scale=…:force_original_aspect_ratio=increase,crop=1080:1920`).
- White text stickers disappear on light, organic photos (sheets, curtains). Use a dark top sticker there (`bomdia-126`), and keep white stickers for dark photos (night, gym).
- Use the official logo file from the user's project (found in `vendas/site/media/…/storieslab-logo.png`). Key out the cream background into an RGBA PNG.
- Voice: one female conversational voice for the whole set, `eleven_v4` with emotion tags per line, 2 takes per line.

## Script shape that sold (copy approved by the user)
Pain mirrored in her own words, then the reveal with the real app, then "it is not just stickers" (filters, animated stickers, scripts, a 30-day agenda), then the promise said by a friend ("teu story vira aquele que ninguém pula"), then the CTA "Toca aqui 👇" with a pulsing button and an arrow pointing down at the Stories CTA. Each creative is 30–40s with 5–6 VO lines and a different emotional arc:
- curious → secret → reveal → excited → triumph
- sad-comic → anticipation (stopwatch) → glow-up drop → confident
- melancholy → shame → hope (a friend's DM) → excited → triumph (replies rain) → intimate CTA

## Build pipeline (examples/sl-stories)
1. `vo.py`: choose the takes, trim silence at −40 dB, lay out gaps per mood, and write `cN-vo.json` with absolute word times. Transcribe every take **locally for free** with `faster-whisper` "small". Decode with ffmpeg to a numpy array, because the bundled PyAV rejects `metadata_errors`. Whisper hears "cê" as "você"; that is not a bad take.
2. `lib.template.txt` + `cN.txt` (`===CSS=== / ===HTML=== / ===JS===`) → `build.py` → `cN/index.html`, with an `assets` symlink to `../assets`. Each creative is its own Hyperframes project folder, so there is never more than one root composition per folder. `__REST_x__` becomes `total − x` for the last scene's duration.
3. `mix.py`: one config function per creative. Music is spliced so that **the drop lands on the reveal word**: measure RMS in 0.5s bins, find the drop, and offset the source. Repeat the groove on bar-length windows. SFX are aligned automatically by their **measured peak**. Event times come from the same word times the HTML uses.

## Gotchas found here
- **Cold-seek reveal:** an element authored hidden (`opacity: 0`) whose `fromTo` sets `opacity: 1` only in the from-vars stays invisible in cold render workers. Always put `opacity: 1` in the destination too (`check` flags this as `gsap_cold_seek_hidden_fromto_missing_reveal`).
- **Second tween on the same element:** when a screen is pushed in and later pushed out, the push-out `fromTo` must use `immediateRender: false`, or it snaps the element to x=0 at build time and the screen shows up too early.
- **Off-screen starts:** a `fromTo` from `{opacity: 1, y: +500}` makes the element visible at t=0 at that offset (a bottom sheet peeking in at frame 0). Use `immediateRender: false` for late entrances.
- Particle layers over text trigger `text_occluded`. Put `data-layout-ignore` on `.ptbox`.

## Aggressive variant (creatives 4 and 5: `c4.txt`, `c5.txt`)
- **Visual devices that make a follower promise literal:** a profile mockup with a follower counter that blinks frozen and then spins up like a slot machine (`counter()` + `fmtF`, e.g. "3,4 mil"), a waterfall of "começou a seguir você" notifications with rising-pitch dings, a story that shatters (5 clip-path shards + SVG crack lines drawn with `strokeDashoffset`), and a split screen with two counters racing, where the loser panel cracks on the overtake.
- **Mix gotcha:** big layered hits (glass at +8, cheer at +6) dominate the peak normalization and bury the voice (1s RMS fell to −35 dB). Keep every hit at 0 dB or below relative to the bed, and let the music drop carry the loudness.
- **Music with leading silence** (m4 started 6.5s in): start from the first audible second. For the tense beats, play the same bed through `lowpass=f=700` (a 7th `af` field in the segment tuple), then switch to the full bed on the reveal. To land a drop on a word: `D = word_time − drop_time_in_file`, then place the file at `t = D`.

## Format innovation (user rule): every new creative needs a NEW FORMAT
The user rejected a creative because it "looks like all the others" (cream background, phone in the middle, white caption at the top). Before scripting, pick a format the set has not used yet:
- **Friends' chat (`c6.txt`, approved idea):** the whole ad is a dark chat. Bubbles pop in (`add(side, cls, height, html, t)` with fixed heights so the scroll is deterministic), and the feed scrolls so each new message sits above the input bar. **Voice notes** use two different voices (Sofia + Teresinha `zgJtwLCCTv9gwvuazaOj`) at `atempo=1.15`, with a waveform that fills as the note plays and a **"TRANSCRIÇÃO" under the bubble, revealed word by word** — that is the sound-off caption. The header switches to "gravando áudio…" before the friend's notes. A "⏩ 7 DIAS DEPOIS" separator with a flash and the music drop is the time jump. Follower notifications fall over the chat, and the CTA is a bottom sheet over the dimmed chat. Sound: a soft high pop (right) for sent messages, a soft ding (left) for received ones.
- Other formats still unused: a lock screen where stacked notifications tell the story, a raw screen recording with Instagram's hand-drawn text, a split-screen race (`c5.txt`, approved).
- `vo.py` supports per-line `(name, gap, tempo, subfolder)`. Word times are divided by the tempo.

## Retention and hook-swap tests (user rule)
- The result-first hook is the strongest opening tested so far: a pink screen, the "+3,4 mil seguidores em 7 dias" counter, "começou a seguir você" notifications and the line "ganhei mais seguidor em 1 semana do que em 1 ano". Use it as a swappable 2–3s head in front of approved creatives for hook A/B tests (compare the 3s hook rate and CTR per pair).
- The body must keep the pull going. Keep one open loop running (how did she get there?), re-hook every 3–5s, and hold the full payoff until right before the CTA.

## Editing creator (UGC) footage into ads (examples/sl-ugc, approved formula = v3)
**Never put anything over her face or over the phone she shows.** The user's first UGC edit stacked chips, phones and DMs on top of her and they rejected it ("ficou ridículo"). "Mesclar com motion" means intercutting her with full-screen motion scenes and PiP.

- **Structure:** her on camera (clean, punch-ins) → transition → a motion beat of 2s or less → back to her or into PiP. No motion screen stays up longer than about 2s.
- **PiP mixing:** her video becomes a rounded card at the top (scale 0.5, y −370, `clip-path: inset(0 round 90px)`) over a cream background. Motion plays below it: lists of words as mini stories with the sticker on a photo, a clock running on "horas no Canva" with a red X, a row of her stories on "todos os meus stories". Captions sit just under the card (y 1100). Exit by expanding the card back to full frame, or by whipping everything up into the next shot.
- **When she shows the phone:** push the camera in on the phone (origin at the phone, scale 1.7, centre it). Then iris out of the phone into the motion app scene.
- **Transitions:** change the style every time. Use a punch-in with a flash on the open, a zoom-through with blur into motion, a vertical swipe back, the PiP card shrinking and expanding, an iris from her phone, the phone flying out to reveal the card, zoom-blur between B-roll shots, a light leak into the result, and pink ink into the CTA card.
- **Real B-roll of the hands using the app** is the "copia e cola" proof. Keep it uncovered, except for a small toast at the very top.
- **Sound:**
  - Pick the track with the strongest beat (spectral-flux autocorrelation).
  - Find the track offset that puts beats on the transition times (make2.py prints the mean beat error).
  - Low-pass the music under the hook and open it with a riser into the first transition.
  - Each transition type gets one fixed SFX: whoosh for zoom, swish for swipe, bloom for iris, passby for leak, sting for CTA. Add pop on elements, ding on DMs or "copiada", and ticks on counters.
- **Pipeline:**
  - `edl.py` holds the segments and caption fixes, keyed by word time.
  - `cut.py` produces the tight cut, the cleaned voice and the timeline JSON.
  - `build/<u>m.txt` has these sections:
    - TIMES (python, shared by JS and SFX);
    - CSS;
    - HTML (motion scenes and PiP layers);
    - JS, with window.MW (motion windows, where captions are hidden), window.PIP (PiP windows, where captions move under the card) and window.CAM (camera moves on her);
    - SFX (python list).
  - `make2.py` builds the HTML and the beat-synced mix.
- **iPhone HDR footage:** convert to SDR first with `avconvert -p Preset1920x1080`, and tag the output bt709.
- **Takes:** use faster-whisper "medium" word times to match takes to the copy. Auto-split at gaps over 0.32s. Check the real voice onset by RMS, because Whisper stretches the first word back to 0. Fix brand words per word time.

### UGC rounds v4–v8 (user feedback, 16/11/2026). Apply all of these on top of v3.
- **Show literally what she says.** When she names something, it appears on screen: "horas no Canva" shows a Canva editor loading, a clock running to 2h47, then a red X. "Carinha de Pinterest" shows a Pinterest feed scrolling with her story popping out. When she rejects something, a red X lands with an error buzzer (`assets/sfx/error.wav`). Never use placeholder squares.
- **Audience-matched imagery.** The creative is female, so nothing male can appear: no male hands, cars or car keys, and no men's trousers. Never pick a photo by its filename. Build a contact sheet and look at every image before using it. (A file called `latte.jpg` turned out to be a man's hand in a BMW, and the user was furious.)
- **Studio voice from iPhone audio.** In `cut.py`, run DeepFilterNet3 (a uv venv with Python 3.11) to remove noise and room. Then apply the `STUDIO` ffmpeg chain: highpass, low shelf, a cut at 320 Hz, presence at 3.2 kHz, air, deesser and acompressor. Mix to −14 LUFS.
- **Cut-out with a brand background (v6), used only sometimes (v7).** `tools/personmask.swift` uses the Apple Vision person matte to build a VP9 alpha WebM (`assets/<u>-cut.webm`). She sits on the brand gradient with 3D story cards floating behind her.
  - The default is her **original footage**. Use the cut-out only on free talking-head stretches (make2.py computes these as the gaps between MW/PIP/ORIG/BROLL), and only on every other one.
  - Never use the cut-out on the hook, PiP, B-roll, motion or phone moments. The matte drops dark phone screens.
  - The background opens as a circle around her with a flash, and the cards pop in with a bloom/swish sound. The user said "muito bom".
- **Cut back to her (v8).** The user said "tá ficando muito tempo dentro do aplicativo, tem que mostrar mesclando". v7 spent 49–81% of the time in app/PiP/B-roll, with stretches of up to 11s without her face.
  - Fix it with `window.HER = [[a,b],…]` in `build/<u>m.txt`. The lib2 core jumps her real footage (`#her`, z-index 26) over the app for 0.6–1.3s.
  - The entrance rotates between zoom-punch, whip-left and swipe-up. make2.py adds the matching SFX (whoosh or swish in, a pop, and a softer swish out).
  - Captions show normally inside these windows. The chunk start is clamped to `a` so the first word is not lost.
  - Target: no app/PiP/B-roll stretch longer than about 2s without her face.
  - Place the windows **by hand** on connective words, never on literal beats (counters, X, professions, theme lists).
  - Use a window only where her face is actually on camera. A take that films just the phone gets no cut-backs.
- **Delivery.** Final files go to `~/Documents/Stories Lab Criativos/3 - UGC creator/UGC1..5.mp4`, and the previous round moves to `_versoes-antigas/`.
  - For WhatsApp, make HEVC copies under 10 MB with `hevc_videotoolbox -tag:v hvc1` and bitrate `1.28*(9.4e6*8/dur − 160e3)`.
  - Send them to the user's own chat as **documents**: Anexar → Documento → file_upload.
- **Credits.** The connector is pre-approved for all generation, but use the cheapest model that holds quality. Run `estimate_only` first and pilot one take before any batch.

## Stickers: always the app's most-used (user rule, 17/11/2026)
- Pick stickers from the app's most-used list, never at random. In the logged-in app, `localStorage.sl_topstk` holds the top IDs per category.
- Full-size files come from the sticker CDN `/s/{slug}/{n}.webp` with the user's pass (from `localStorage.sl_me`). Fetch them in the page, pack them into one JSON download, decode locally. Never print or save the pass. The `/t/` thumbnails are public but only 193×240.
- No ElevenLabs credit or connector: do NOT fall back to a free voice (user rule, 18/11/2026). Tell the user right away and wait for the connector.
