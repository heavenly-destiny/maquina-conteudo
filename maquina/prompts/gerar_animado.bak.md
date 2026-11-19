{{base}}

## Your job: ANIMATED EXPLAINER with a 2D mascot
Step 1. Write the script files above (`roteiro.md`, `roteiro.json`). Each line in `falas` gets a mascot reaction in `cena` (use the exact reaction name).

Step 2. Mascot assets: run `ls {{mascote}}` first. Reactions are PNG files named `feliz`, `surpreso`, `pensando`, `apontando`, `comemorando`, `preocupado`, `explicando`. Use ONLY the files that exist. If a needed reaction is missing, map it to the closest existing one; if the folder is empty or missing, build the mascot as clean inline SVG instead and say so in `roteiro.md`.

Step 3. Voice: for each line run `voz "[emotion tag] texto da fala" fala-01.mp3 <voz>` (voice and tags per the rules above: Stories Lab = sofia) (then fala-02.mp3...). The `voz` command is on PATH. If it fails with FALTA_CHAVE_ELEVENLABS, STOP and print FALTA_CHAVE_ELEVENLABS. Never use any other voice engine. Measure each mp3 with ffprobe and concatenate them with ffmpeg into `voz.mp3`; the line durations drive the scene durations.

Step 4. Video: use the skills `/hyperframes` and `/faceless-explainer` (hyperframes:faceless-explainer) to build a 1080x1920, 30 fps HyperFrames composition in `video/`. The mascot changes reaction on each line with a spring pop (scale 0.9 to 1, slight overshoot), big kinetic captions word by word in sync with the voice (2 to 4 words, keyword 2.5x larger in one accent color), a new visual beat every 2 to 3 seconds (glass cards, simple UI, numbers), low music bed from `{{musicas}}` (pick one, lower than the voice) and short whooshes from `{{sfx}}` on scene changes. Style spec above sets palette and type. No logo intro; the first second already carries the hook.

Step 5. Render to `final.mp4` in the working folder (use `npx hyperframes render`, see the hyperframes-cli skill). Check it: ffprobe duration within 10% of the target, audio stream present, then extract 3 frames with ffmpeg and look at them (text cut off? mascot overlapping captions? empty frame?). Fix and re-render if anything is off.

When done print "PRONTO animado".
