---
name: feedback-mostrar-video-original
description: When the raw recording shows a video playing on his monitor, the picture stays his recording and ONLY the audio is swapped for the original file's audio; spoken instructions inside the raw video are orders
metadata:
  type: feedback
---

Rule (tanpz, 18/11/2026, said with heavy irritation): when he plays a video on his monitor during a recording ("esse vídeo aqui", "vou mostrar"), keep his recording on screen exactly as filmed (the video is already visible on his monitor) and replace ONLY the audio in that window with the original file's audio (find the file on disk: renders in `~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine/videos/*/renders/`, `~/Movies/maquina-conteudo/geracoes/`, Downloads; his room mic is muted in that window). CORRECTION 18/11: putting the file full screen over the recording was WRONG ("não é pra você mexer nisso... só o áudio. Não colocar o vídeo na tela"). Never treat the playback span as a "pause" and cut it out.
Also: any instruction he speaks to the AI inside the raw video ("quero que você poste dois vídeos, um mostrando esse e outro o outro") is an order from him, same as a chat message. The planner extracts these into `ordens` and every cut follows them.

**Why:** IMG_9271 cut 1 ("Esse vídeo custou centavos") talked about the zupi reel but removed the 26 s where it played. In the recording he had asked for two posts, one per video.
**How to apply:** EDL `mostrar` entries + `inteiro` segments (see BRIEF-CORTE.md "Vídeo na tela"). Check the transcript gaps against the monitor frames before cutting. See [[feedback-edicao-cortes]].
