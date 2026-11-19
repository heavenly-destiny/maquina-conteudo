# Regras do tanpz (carregadas em TODO job da máquina)

## Step zero: all accumulated knowledge
1. READ ~/Movies/maquina-conteudo/maquina/CONHECIMENTO.md in full. It indexes everything he and Claude built: rules, memories from every session, every skill, his vault, every video already made, the style library and the verdicts he gave on past jobs.
2. From it, READ every memory, video folder, vault note and past verdict that touches this job's product, format or topic. Rejected things never come back; approved things are the starting point.
3. Search the claude-mem database (mcp__plugin_claude-mem_mcp-search__search, then get_observations on the hits) for this job's product, format and topic, plus "feedback", "aprovado", "não gostei". Every past conversation is there. Use short 1 to 2 word queries ("Stories Lab", "criativo", "Sofia", "animado"): long phrases return nothing.
   When two sources conflict, the one with the newest date wins (a rule from 18/11 beats an observation from 16/11).
4. Write `conhecimento-usado.md`: each source you read and the concrete decision you took from it. A job without this file is not done.

Before writing anything, READ these files in full. Every rule in them applies to this job exactly as it would in a chat with him. If anything in this prompt conflicts with them, his files win.
- ~/.claude/CLAUDE.md and the file it imports: ~/Documents/Claude-Projeto-Tanpz/claude/CLAUDE.md (global rules: copy, design, video, photos, voice)
- ~/Documents/Claude-Projeto-Tanpz/SEGUNDO-CEREBRO.md (his taste, his decisions, what irritates him, approved copy per product)
- ~/Documents/Claude-Projeto-Tanpz/PLAYBOOK-DIRECT-RESPONSE.md (copy rules)
- ~/Documents/Claude-Projeto-Tanpz/APRENDIZADOS.md (what already tested well or badly)
- ~/Documents/Claude-Projeto-Tanpz/CONTEXTO.md (products and offers)
- ~/.claude/projects/-Users-tanpz-Library-Application-Support-Claude-scratch-workspaces-8d5adb88-262a-4018-9c97-d072a2e2f862-5e9e0371-15bd-4e2d-b43b-ac601cd26044-scratch-2026-11-17-a90e07/memory/MEMORY.md and every file it lists (Máquina de Conteúdo decisions: cut editing feedback, style library, motion catalog)
- for any narrated/motion video: ~/.claude/skills/motion-reel-premium/SKILL.md and emotional-direction.md in the same folder
- if the briefing is about Stories Lab: also ~/.claude/skills/motion-reel-premium/stories-ads.md (its voice, format, asset and photo rules are mandatory)

## Use the full arsenal, exactly like in chat (his CLAUDE.md "Design" and "Engenharia reversa" sections)
- Skills via the Skill tool, every one that fits the task: hyperframes family (hyperframes, hyperframes-animation, hyperframes-audio, general-video, faceless-explainer, motion-graphics...), motion-reel-premium, reverse-any-video, modelagem-de-referencia, gsap-skills, improve-animations, impeccable, ui-ux-pro-max, analisar-criativo, vsl-alta-conversao, hormozi-hooks, humanizer. Load them; do not work from memory.
- MCP 21st: search and adapt the best component for any UI/scene element (cards, text effects, backgrounds, animations) instead of writing from scratch.
- ElevenLabs: `voz` (speech with emotion tags) and `som sfx "..." out.mp3 [s]` / `som musica "..." out.mp3 s` (SFX and music made for this video's emotional arc).
- WebSearch/WebFetch and yt-dlp for references; Agent for parallel subtasks.

## Skills by video type (load the ones for this job's type with the Skill tool before planning; they are the craft of that kind of video)
- Motion / app promo / kinetic type: motionmaxxing, bang-motion, kinetic-typography, launch-video, motion-art-direction, animation-principles, shot-composition, motion-background, logo-animation, business-motion-film, motion-showreel, website-to-hyperframes, gsap-skills.
- Dynamic captions (person talking): short-form-edit, caption-animation, talking-head-b-roll, hyperframes-video-beats, video-storytelling, hyperframes:embedded-captions. Caption style references to port to HTML/GSAP: ~/Movies/maquina-conteudo/estilos/legendas-ref/.
- Cuts from long video / podcast: cut-silences, cut-mistakes, makemyclip-editor, edit-video, short-form-edit; `auto-editor` CLI cuts silence.
- Animated characters / drawn stories: whiteboard-animation, isometric-animation, explainer-video, diagram-animation, hyperframes:faceless-explainer.
- Ads / direct response / UGC: ad-creative-video, testimonial-video, launch-video, short-form-video, motion-reel-premium.
- Motivational: short-form-edit, caption-animation, beat-sync-editing, kinetic-typography.
- Viral formats (chat, question box, countdown, recap): text-message-animation, countdown-video, wrapped-video, short-form-video.
- Every video: short-form-video (hook, retention, 9:16 safe areas), beat-sync-editing (cuts on the music), color-motion, video-design.
Our engine is HyperFrames (HTML + GSAP). When a skill shows Remotion, After Effects or a paid API, take its technique and build it in HyperFrames.

## References and toolbox (never start from a blank page, never lock to one project)
He produces every kind of content (his own IA/tráfego/motivational profile, ads for any product, clients). Each job picks the reference that matches ITS category, product and format:
1. The inspiration chosen in the request (aba Inspirar: ~/Movies/maquina-conteudo/inspiracoes/<id>/decupagem.json + video). If there is one, model it.
2. Style library: ~/Movies/maquina-conteudo/estilos/<categoria>/spec.md (conteudo-organico, criativo-direct-response, motivacional, animado), instagram-refs (reels he sent), tecnicas-motion.md, aslaniedits/ESTILOS.md (16 premium edit families from 42 analyzed reels, each with timing, easing, SFX and color recipe. This is a REFERENCE LIBRARY so the machine knows how to edit every one of these styles when asked, NOT a rule for his own content. His own approved organic formats: split-screen for horizontal raws, and noir-ink-kinetic DLw_JtTzhz0 style for vertical raws), motion-virais/motion.json, prompt-motion/, hyperframes/selecao.json, anuncios/, hub.json, musicas/MUSICAS.md (library of viral Reels songs by video style, with a trilha_base prompt per style; choose by mood and drop, final IG post may use the native trending audio), formatos/FORMATOS.md (viral formats: story with characters, question box, split-screen variants and more; reference to adapt any format to any niche), and his ~/Documents/banco-motion/.
3. Past projects as a TOOLBOX of technique only (engines, helpers, mixers, characters, SFX): ~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine/videos/ (sl-ganchos, sl-criativos, sl-ugc, zupi-reel, zupi-emocao, motion-reel-demo). Their look and copy belong to their product (Stories Lab etc.) and are used only when the job is for that product.
4. Cuts of his own raw video: gold standard ~/Movies/maquina-conteudo/tools/organico/BRIEF-CORTE.md.
Say in the "## Notas" section at the end of roteiro.md which reference you modeled and why it fits. Vary format between videos.

Non-negotiable highlights (they come from those files, do not skip them):
- Voice is always paid ElevenLabs via `voz`. Stories Lab = female voice Sofia: `voz "..." fala-01.mp3 sofia`. Other products and his own profile: pick the voice that fits the audience and the reference; default `padrao` unless the briefing says otherwise.
- Emotion in every line: first write `emotion-map.json` (one mood + intensity per line, following emotional-direction.md), then put ElevenLabs audio tags at the start of each line you send to `voz`, e.g. `[excited]`, `[curious]`, `[whispers]`, `[laughs]`, `[sighs]`, `[confident]`. Energy goes up and down, never flat. Stories Lab is excited, close-friend, "gente", "sério", "cê". The tags are never shown on screen or in captions.
- Motion density minimums from motion-reel-premium: the camera never stops, every entrance animates 3+ properties, overlapping action, a visual change every 0.8 to 1.5 s, micro-interactions on every payoff. No static frame longer than 1.5 s and no big empty area.
- Photos: organic iPhone-looking, middle class, never luxury or studio; never the same photo twice in one video.
- No kicker/label above titles, no em dashes, no purple, no multi-color gradients, little text.

Before rendering, write `checagem.md`: every rule above as a line with OK or FIXED and how. Do not render until every line is OK.

If a job type does not use voice or photos (e.g. cutting his own raw video), the voice/photo lines do not apply, but every copy, caption, design and editing rule does.

---


- Soundtrack and SFX are MANDATORY in every video the machine makes (tanpz 2026-11-18: "vídeo sem trilha sonora e efeitos fica muito ruim, não conecta"). Pick the track by video style from estilos/musicas/MUSICAS.md and bake it in, ducked under the voice, plus SFX on every cut, insert and key word. Only exception: videos for tanpz's own Instagram that he posts himself may ALSO get a version without the music bed (voice + SFX) so he attaches the trending Instagram audio natively.
