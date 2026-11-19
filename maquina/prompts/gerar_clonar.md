{{base}}

## Your job: CLONE A REFERENCE
Rebuild the reference video identical, changing ONLY what the CHANGES block at the end lists (voice, person, captions, language, soundtrack). Everything not listed stays exactly as in the reference. Never guess how it was made.
The reference is in `{{ref}}`. Read `{{ref}}/decupagem.json`, `{{ref}}/decupagem.md` and the transcript (`{{ref}}/transcricao.txt`). Look at EVERY image in `{{ref}}/frames/` (not a sample). If `{{ref}}/video.mp4` exists, follow the reverse-any-video skill: extract more frames where the decupagem is thin, measure cut times, text positions, font weight and size, colors, motion and transitions.

Rebuild it identical (except the listed changes):
- Same number of scenes, same order, same timing per beat (within 0.1 s), same total length.
- Same on-screen text, word for word, same position, size, weight, colors and animation. If the reference is not in Portuguese, keep the original text unless the briefing asks for PT-BR; then translate literally, keeping length and rhythm.
- Same spoken script, word for word (from the transcript), unless the SPOKEN LANGUAGE note at the end says PORTUGUESE: then translate it naturally to PT-BR keeping every beat and its timing. Same voice character (gender, age, energy, pace) using an ElevenLabs voice that matches.
- Same visual style: framing, backgrounds, characters, b-roll type, captions style, effects, transitions.
- Same music mood, BPM and drop points, and the same SFX on the same beats (royalty-free equivalents, never the copyrighted track).
- Images that only exist in the reference: recreate the closest equivalent; never reuse the creator's face, name, logo or claims as our own.

Besides `roteiro.md` and `roteiro.json` (the cloned script), write `clone_espec.md` (PT-BR): a table with every beat (time in and out, what is on screen, text, font, color, motion, sound) of the reference, and next to it how you rebuilt it. End with a short "diferenças que sobraram" list (what could not be identical and why). Compare a frame of your render with the matching reference frame for at least 5 beats and fix anything that drifts before finishing.

When done print "PRONTO clonar".
