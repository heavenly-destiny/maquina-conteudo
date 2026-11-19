{{base}}

## Your job: DIRECT-RESPONSE 9:16 AD CREATIVE
Pick the reference for THIS ad: the chosen inspiration if any, otherwise the closest one in estilos/criativo-direct-response, estilos/anuncios (scaled ads) or, only when the product is Stories Lab, its approved creatives (tanpz_machine/videos/sl-criativos/aprovados and ~/Documents/Stories Lab Criativos). Say which one you modeled. Every new creative needs a NEW format. Follow the skill `motion-reel-premium` (Stories ads reference) and the style spec `{{spec}}`. Also read `{{apoio}}/PLAYBOOK-DIRECT-RESPONSE.md` hook rules again before writing.

Step 1. Write the script files above (`roteiro.md`, `roteiro.json`). Cinema structure: hook (0 to 3 s) with the biggest promise or pain, tension, turn, proof, CTA "Saiba mais". Short lines, aggressive promise, objections broken. Real, organic-looking visuals only (no stock luxury); if a photo is needed, ls `{{raiz}}/estilos` for references and never repeat an image inside the creative.

Step 2. Voice: for each line run `voz "[emotion tag] texto da fala" fala-01.mp3 <voz>` (voice and tags per the rules above: Stories Lab = sofia) (and so on). The `voz` command is on PATH. If it fails with FALTA_CHAVE_ELEVENLABS, STOP and print FALTA_CHAVE_ELEVENLABS. Never use any other voice engine. Join the lines into `voz.mp3` with ffmpeg.

Step 3. Build a 1080x1920, 30 fps HyperFrames video in `video/` (skills `/hyperframes` and `motion-reel-premium`): kinetic captions in sync with the voice, 3D/glass UI cards, spring motion without exaggeration, music bed from `{{musicas}}` lower than the voice, whooshes from `{{sfx}}`. Max 35 seconds unless the target says otherwise.

Step 4. Render `final.mp4` here (`npx hyperframes render`). Check: duration, audio present, 3 extracted frames looked at (no cut text, no overlap, no empty frame). Fix and re-render if needed.

When done print "PRONTO criativo".
