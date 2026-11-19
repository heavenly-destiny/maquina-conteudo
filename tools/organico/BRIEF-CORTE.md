# How to make one cut in the organic style (approved by tanpz, 17/11/2026)

No music: the profile cuts go out without background music, because tanpz adds it himself on Instagram, very low (render.sh already mixes at -120 dB). Keep the SFX.

Goal: a 9:16 1080x1920 cut, with motion on top and his horizontal video below, split exactly at y=960. Captions sit on the dividing line with a shadow only. The look is wine + red #e11d2a. Everything is in PT-BR. Cut 01 (`~/Movies/maquina-conteudo/2026-11-17/cortes/01-ia-burra/`: edl.json, build.py, and the final `prontos/01-ia-burra.mp4`) is the APPROVED gold standard (tanpz approved 18/11). Copy its structure. Cut 11 (`piloto-11/build_v4.py`) is an older reference for scene ideas only.

A number or fact appears ONCE: never a scene with a number plus a takeover with the same number. No white flash on the video.

## Tools (all in ~/Movies/maquina-conteudo/tools)
- `organico/prep.sh RAW.MOV START END FOLDER`: makes sdr.mov (1080p SDR), src.wav, words_src.json (word times in raw-file seconds) and ilhas.txt (each stretch of speech transcribed on its own).
- `cut.py` is driven by `edl.json` in the cut folder. Each segment is `["main", a, b, "wide"|"punch"]` in absolute times of the raw file. Pauses longer than 0.35s inside a segment are removed automatically.
- `organico/organico.py`: the scene library. Its docstring and helpers list everything available: head, cursor, burst, stream, progress_card, rise, pop, drop_in, side_in, recede, out, click, check, confetti, stream_in, counter, progress, wire, bars, shake, stamp, takeover, zoom_on and build. The CSS classes ready in `organico/style.css` include: .ui (glass card), .bubble/.bubble.ai, .notif, .list/.row/.chk.sm, .fe good/bad + .vs, .skillchip, .term/.tl, .code, .repo, .share, .chart/.cb, .file/.fi, .node/.wire, .big/.u, .browser/.bar/.vp, .prog and .stamp.
- `organico/render.sh FOLDER NAME`: runs cut, voice cleanup, sync check, build.py, mix, render, mux, writes sheet.jpg, and copies the result to `$OUT/NAME.mp4` (set `OUT` to the job's `prontos` folder; the Máquina sets it for you).

## Steps
1. Run `prep.sh`. Use a few seconds of margin before and after the range in `2026-11-17/cortes.md`. If a sentence or thought continues past the end, extend the range: never end in the middle of a sentence. The raw file path is given in your task.
2. Read `ilhas.txt` and `words_src.json` and write the EDL. Rules from tanpz:
   - **He often restarts a sentence or repeats it. Keep only the LAST complete take.** Example: "Ninguém é tão bom." followed by "Ninguém é tão bonzinho assim." keeps only the second. If he says "essa corta" or anything similar, cut that out.
   - Cut false starts, "é...", "um...", pre-roll ("E aí", "Boa") and stammering.
   - **The speech must be fluid.** Every pause where he thinks, looks down or hesitates goes. Also cut filler words ("basicamente", "enfim", "né?", "cara") and rambling rhetorical questions ("você precisa fazer o que, cara?"). Run `tools/clean_voice.sh src.wav src_clean.wav` (and the same for `cta.wav` → `cta_clean.wav`), and add `"silwav": "src_clean.wav"` / `"silwav": "cta_clean.wav"` to the sources: cut.py detects pauses on the clean voice. Whisper word times stretch over pauses, so do not trust them for gaps. After cut.py, run `silencedetect=noise=-35dB:d=0.25` on `edit/voice.wav` (cleaned) and trim the EDL until no pause is left.
   - **Zero "é...", "um..." or half-started phrases.** Read `ilhas.txt`: an island like "De não..." followed by "É..." followed by "de não fazer…" means a retake, so cut from the end of the previous complete phrase straight to the last take. Whisper hides fillers, so after the render, transcribe the final audio with `whisper-cli --prompt "Hmm, é... ééé, tipo, né, um..."` (this prompt makes it write the fillers) and run `silencedetect=noise=-35dB:d=0.3`. Nothing can be left. If a cut drops a word from words.json, fix its time in words_src.json.
   - Full-screen takeovers: a small `tk-s` line plus ONE big word in `tk-w` (optional `tk-it` below). Never a long phrase in `.tk-it.big`, because it wraps and overlaps.
   - No panel can be empty: put the head's first word and the first card at the scene start (`A["sN"] + 0.1`), not on a late word.
   - Segment boundaries must fall in real silence (between islands). Never cut inside a word.
   - Alternate "wide" and "punch" between segments.
   - **CTA only when the cut is about AI** (tanpz 18/11): the "manda pra sua IA" CTA makes no sense in non-AI topics (offer analysis, funnel, ads, cuts 15-17). Those end on his own strongest closing line, no CTA.
   - AI-topic cuts end with the standard CTA. Hard-link `sdr_cta.mov`, `cta.wav`, `cta_clean.wav` and `words_cta.json` from `~/Movies/maquina-conteudo/tools/assets/cta/` into the folder. Add the source `"cta": {"file": "sdr_cta.mov", "offset": 963, "wav": "cta.wav", "silwav": "cta_clean.wav", "words": "words_cta.json"}` and the segments `["cta", 964.80, 972.45, ...], ["cta", 973.55, 976.15, ...]`. The video ENDS on "muito melhores" (976.15), approved by tanpz. Copy the CTA scene s10 exactly from cut 01 `build.py` (`~/Movies/maquina-conteudo/2026-11-17/cortes/01-ia-burra/build.py`).
3. Run `python3 ~/Movies/maquina-conteudo/tools/cut.py edl.json edit` and read `edit/words.json`. The times there are output times, and these are what you use. Reread the full text and confirm there is no repetition left.
4. Write `build.py`, modelled on cut 01:
   - One scene per idea, changing roughly every 4 to 8 s. Each scene LITERALLY shows what he is saying (a real UI card, list, chat, notification, number), never decoration. Pull every time from the speech with `W("palavra", after)`.
   - Headlines are short (2 to 4 words), with one keyword in `True` (red serif italic). Card text is short. No em dashes. Casual PT-BR. Correct the content (he says "AI", write "IA").
   - Use 3 to 5 `takeover()` calls on the strongest punchlines. Never one in the final CTA, where his face shows on camera.
   - Use clicks (`click`), streaming chat (`stream`/`stream_in`), counters, progress bars, confetti on payoffs, `zoom_on` on 3 to 5 keywords, and `emph` with the words that get the red caption.
   - The last scene is the CTA, copied from cut 01 (s10).
   - **Framing**: content must fit within local coordinates 0 to 820 in height, because everything below that touches the caption at the seam. Inline `top` values plus each element's height must stay ≤ 800. When cards stack, use `recede()`/`out()` on the old one before the new one comes in.
5. Run `render.sh FOLDER NAME`. It must print "sync ok". Then **look** at `sheet.jpg`. Also extract frames at 5 to 6 key moments (`ffmpeg -ss T -i edit/final.mp4 -frames:v 1 -vf scale=540:-2 x.jpg`) and read them. Check for: anything cut off at the seam, text overflowing the side, overlap, an empty panel for more than 1s, or a caption over a full-screen takeover. Fix and render again until it is clean.
6. Report: the name of the mp4, its duration, what you cut (retakes), the scenes and takeovers, and anything you could not solve.

## Do not
- Do not change organico.py, style.css, cut.py, mix.py, render.sh or prep.sh. If something is missing, write a local CSS override inside build.py (a `<style>` element in a scene's HTML) or report it.
- Do not use any color outside wine/red/white/gold (#ffd04a only for money). No purple, no green except the ✓ check.
- Do not show the student's name or data (cuts 15 to 17). If it shows on the screen in the video, blur the region in the sdr.mov (ffmpeg boxblur) before cutting.


## Vídeo na tela (regra do tanpz 18/11, obrigatória)
When he plays a video on his monitor ("esse vídeo aqui", gap in the transcript with music), the picture STAYS his recording (camera/monitor exactly as filmed, do not put the file on screen, do not zoom into it) and ONLY the AUDIO is replaced by the original file's audio. Never cut that span as a pause.
1. Find the time window: look at monitor frames (`ffmpeg -ss T -i RAW -vf crop=...`) around the transcript gap, find where the playback starts and ends.
2. Find the original file on disk (renders in `~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine/videos/*/renders/`, `~/Movies/maquina-conteudo/geracoes/*/final.mp4`, `~/Downloads`). Match it by comparing frames, take the newest render that matches.
3. In `edl.json`: keep that span as ONE segment with a 5th element `"inteiro"` (no pause trimming), e.g. `["main", 19.1, 45.6, "wide", "inteiro"]`, and add `"mostrar": [{"file": "/abs/path.mp4", "src_t": 19.1, "ss": 0.1, "dur": 26.4}]` (`src_t` = raw time where the window starts, `ss` = time inside the original file at that moment).
4. `cut.py` writes `edit/mostrar.json`; `organico.build()` hides captions and SFX in the window (no visual overlay) and `mix.py` swaps his mic for the original file's audio in that window. Nothing else to do in build.py.
5. Check: frames inside the window are his own recording (no overlay, no file on screen), and the audio there is the original file's soundtrack (correlation > 0.9).
Orders he speaks inside the raw video (listed by the planner as `ordens`) are orders from him: follow them.

## Gravação em pé / tela cheia (regra do tanpz 18/11, aprovado para orgânico)
- iPhone video comes as HDR (HLG, arib-std-b67). ALWAYS convert to SDR first (`avconvert -s IN -p Preset1920x1080 -o sdr.mov`, the way prep.sh does). If HDR reaches hyperframes it switches to the HDR path and DROPS every HTML layer (captions, inserts): the render comes out as bare video. Check: `ffprobe color_transfer` of the video in public/ must be bt709.
- A vertical file can hide a horizontal recording with black bars (letterbox) and be mirrored (selfie). Detect the real picture band, crop it, and hflip when on-screen text reads backwards. Then reframe to 9:16 following the face.
The layout is CHOSEN BY HIM in the panel when he sends cuts to edit ("Dividida" or "Tela cheia"); the prompt gives it as LAYOUT. Never decide it yourself.
TELA CHEIA works with a vertical raw (standing) OR a horizontal raw with a wider angle: crop/zoom to 9:16 keeping him centered (follow his face, smooth reframing). Only crop if the result keeps quality: crop height must be at least 1080 px of real source (4K raw ideal); if the crop would upscale more than ~1.3x, still deliver but write it in relatorio.md as a quality warning. Format = full-screen talking head like reference `~/Movies/maquina-conteudo/estilos/aslaniedits/videos/DLw_JtTzhz0.mp4` (family "noir-ink-kinetic" in aslaniedits/ESTILOS.md):
- His video full 1080x1920, slow push-in (1 to 1.06).
- Caption: condensed caps (Anton/Bebas), white, soft white glow, at chest height (~y 1250), 2 to 4 words per line, word by word with blur 12 to 0 in 300ms.
- Key word in script font in accent color with glow, slightly rotated.
- On the concept word: 1.5 to 2.5s insert (B&W image/clip or motion card) then back to him.
- Keep the same machine identity for sound and motion (SFX, music, generation and animation screens are approved).
Split-screen (motion top, video bottom) is the "Dividida" layout.
Check: layout of the output == LAYOUT he chose; Tela cheia has NO split line and the caption matches the reference style.
