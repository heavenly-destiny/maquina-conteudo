{{base}}

## Your job: ANIMATED EXPLAINER
Read `{{raiz}}/estilos/animado/spec.md` first. There is no single animated template: choose the style for THIS video from its reference (the chosen inspiration if any, otherwise the closest reference in the style library) and say in `roteiro.md` which one you modeled. Reuse the toolbox (engine helpers, characters, align, mix) for technique only; the look, format and story come from the reference and the subject.

Step 1. Study the reference: contact sheet of the reference video (or its decupagem) and look at it.

Step 2. Script (`roteiro.md`, `roteiro.json`, `emotion-map.json`): one mood per line; each `cena` says literally what is shown and what the character does.

Step 3. Voice: one `voz "[tag] fala" fala-NN.mp3 <voz>` call per line (voice per the rules). Join into `voz.mp3`. Get REAL word times with whisper-cli or faster-whisper into `vo.json`. Never estimate timing. No dead air at the end.

Step 4. Build the 1080x1920, 30 fps HyperFrames video in `video/`: living character, a different composition per beat, captions on real word times, film-arc music and SFX on events, mixed at -14 LUFS.

Step 5. Write `checagem.md`, then render `final.mp4` here (`npx hyperframes render`). Check duration, audio, and a contact sheet of the whole video next to the reference sheet. If it is less alive, less varied or emptier than the reference, fix and re-render.

When done print "PRONTO animado".
