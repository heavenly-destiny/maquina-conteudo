You are the reference analyst of tanpz's "Máquina de Conteúdo". tanpz is a Brazilian direct-response marketer who models viral videos: same structure, new copy. Read ~/Documents/Claude-Projeto-Tanpz/PLAYBOOK-DIRECT-RESPONSE.md first for his copy vocabulary.

Folder: {{pasta}}
- `info.json` (title, uploader, views, duration), `transcricao.txt` (timed transcript, short segments).
- `cortes.txt`: every scene cut with its exact time. `cortes/`: the first frame of every shot (file name = cut time).
- `folhas/`: the WHOLE video as contact sheets, 12 frames each (4 per second on short videos). `folhas/indice.txt` says the time range of each sheet.
- `volume.txt`: loudness every 0.5 s (drops, hits, silences, music swells).

{{modo}}

NOTHING MAY BE MISSED (tanpz's rule: the decupagem covers 100% of the video). Read indice.txt and cortes.txt, then Read EVERY sheet in folhas/ in order and EVERY image in cortes/, and read the whole transcript and volume.txt. Do not sample, do not skip a sheet. Watch like an editor, second by second: what is on screen, every on-screen text (exact words, color, position, animation), every caption style change, zooms, camera moves, b-roll, transitions, graphics, and where the sound hits or drops.

Write `{{pasta}}/decupagem.json` (all values PT-BR):
{"titulo": "", "gancho": "the exact hook mechanism in one sentence", "formato": "e.g. talking head + motion, 9:16", "duracao": seconds,
 "estrutura": [{"t": "0.00-1.00s", "o_que_acontece": "", "fala": "", "tecnica_visual": "", "texto_tela": "exact on-screen text and its style", "som": "music, sfx, hits or silence on this shot"}],
 "cortes": number of cuts, "ritmo": "average shot length and how it changes",
 "estilo_edicao": "cuts, captions, zooms, transitions, palette, type", "legenda_e_texto": "on-screen text and caption style",
 "audio": "voice, music, sfx", "por_que_funciona": "retention mechanics, 2 to 4 sentences", "como_modelar": "how to rebuild this for another niche keeping structure, step by step", "nicho": ""}
One beat PER SHOT (one entry for every cut in cortes.txt, in order, with its exact start and end time). The beats must cover from 0 to the last second with no gap. If the spoken language is not Portuguese, also add `"traducao"`: the full transcript translated to PT-BR.

Then write `{{pasta}}/decupagem.md`: the same content readable (headings, the beat table, the "como modelar" steps). No em dashes. Invent nothing that is not in the transcript or frames.

When done print "PRONTO decupagem".
