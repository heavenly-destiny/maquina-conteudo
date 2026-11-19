---
name: maquina-de-conteudo
description: "User's \"Máquina de Conteúdo\" project — raw iPhone videos turned into edited vertical cuts, auto-posted with free tools only, daily 6am viral-inspiration scan"
metadata:
  node_type: memory
  type: project
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-17T21:03:46.499Z
---

User (Brazilian creator, niche: direct traffic / tráfego, building AI "brain" for Claude, plus motivational content) wants a private app "Máquina de Conteúdo":
- Ingest raw videos (AirDrop to ~/Downloads, usually 1920x1080 HEVC 60fps horizontal, filmed at desk) -> transcribe -> find cuts -> edit 9:16 with dynamic captions, motion graphics, B-roll -> caption/hashtags -> one-button post to Instagram Reels, TikTok, YouTube Shorts.
- Budget rule (2026-11-17): user refuses paid tools (rejected Upload-Post US$15-50/mo and Apify). Build posting and viral scraping with free routes only (official free APIs, yt-dlp, browser automation).
- Daily 6am tab "Inspirações": viral content in niche (BR + gringo), transcribe, translate to PT-BR, explain how it was edited.
- Later module: "Máquina de Criativos" (ad copy, modelagem).
- Mentoria launch planned end of Nov / early Dec 2026 — goal: high posting volume before it.
- Working files: ~/Movies/maquina-conteudo/<date>/. Whisper model: ~/.cache/whisper/ggml-large-v3-turbo.bin via whisper-cli.

**Why:** accelerate content before mentoria launch.
**How to apply:** never propose paid SaaS; use free routes; recommend 3–5 posts/day/platform; ask before actually publishing.

- Motion demo videos for IMG_9271 cuts were made in another session inside /Users/tanpz/Documents/PROJETOS TANPZ /tanpz/tanpz_machine (approved versions).

- 18/11: entrega dos cortes = mandar os mp4 prontos como ARQUIVO (documento) na conversa dele com ele mesmo no WhatsApp (WhatsApp Web via Claude in Chrome); ele mesmo posta. Logo depois dos cortes, começar a construir a Máquina de Conteúdo (o sistema).

How to send cuts as WhatsApp documents (worked 18/11/2026): hardlink the finals into `2026-11-17/enviar/`. Clicking Anexar/Documento through the Chrome extension does not open the file dialog, so post a REAL mouse click with the compiled CGEvent helper (scratchpad `click.swift`). Screen y = clientY + 215 on his MacBook. Then use osascript System Events (Accessibility granted to Claude on 18/11): cmd+shift+G, folder path, return, cmd+A, click "Abrir" of sheet 1. All 16 go as documents in one send. Pasting from the clipboard sends compressed media instead (wrong).

System v1 built 18/11/2026 in ~/Movies/maquina-conteudo/maquina/.
- Files: maquina.py (engine), painel.py + painel.html (panel at http://127.0.0.1:4747), verificar.py (quality gate), whatsapp.py, prompts/.
- Flow: a raw video gets transcribed, then `claude -p` plans the cuts. tanpz then picks which cuts to edit in the panel ("NAO PRECISA EDITAR TODOS", 18/11). Each chosen cut is edited by `claude -p` sonnet following BRIEF-CORTE, then the gate checks it (pauses, fillers). From the panel he can ask for a change on one cut or send cuts to WhatsApp.
- Jobs live in ~/Movies/maquina-conteudo/jobs/.
- Headless claude uses an allowlist plus the shims bin/clean-voice and bin/render-corte, because absolute script paths did not match permission rules.
- Pending (needs tanpz):
  - Enable Chrome "Permitir JavaScript dos Eventos da Apple" for whatsapp.py.
  - Run `claude setup-token` for unattended runs.
  - A LaunchAgent that starts the panel at login was blocked by auto mode.

## v2 (18/11/2026), after "MELHORA TODO SISTEMA", "UI UX", "DEIXA TUDO INTERATIVO", "DE FATO UM SISTEMA DE GERAÇÃO COMPLETO"
- Engine: per-cut `fase` (preparando/editando/checando/corrigindo) + `desde`; macOS notification when a cut or a plan finishes; `legendas` step (prompts/legendas.md, sonnet) writes legendas.json (caption + hashtags) after planning; `maquina.py legendas JOB` backfills.
- Panel: drag-and-drop upload to RAIZ/entrada (auto-starts the job), raw-clip preview of a planned cut (/bruto?job=), poster jpgs, hover preview, modal player with caption/hashtag copy, download, ajuste, prev/next keys, filter tabs, discard/undo (status "descartado", nothing deleted), selection bar for WhatsApp. Keyed DOM reconcile so the 4 s poll does not break hover/video.
- ~/Applications/Máquina.app runs maquina/abrir.sh (starts painel.py if port 4747 is down, opens Chrome). Not added to the Dock (that is his call).
- Backups: maquina_bak.py, painel_bak.py, painel_bak.html.

## v3 (18/11/2026): generation system plus an Apple-style app
- Asked for: an extremely minimalist, Apple/Awwwards-level app built from 21st.dev pieces; real liquid glass, sounds and animation; generation of scripts, DR creatives, animated mascot explainers and modeled virals; an Inspirar tab with full decupagem; 10 videos a day on every network; a cinematic opening with a movie voice greeting him by time of day.
- Frontend: React + Vite + Tailwind 4 + motion in maquina/app.
  - Build with `cd app && npx vite build`. painel.py serves app/dist at `/`; the old panel is at `/v2`.
  - Tabs: Início, Cortes, Criar, Inspirar, Postar.
  - Pieces: liquid glass dock from the 21st "Apple Tahoe Liquid Glass" component (app/src/glass.tsx), WebAudio UI sounds (app/src/sons.ts), modals portaled to body.
- Backend (built by a subagent):
  - gerar.py (roteiro/animado/criativo/modelar) writes to RAIZ/geracoes; inspirar.py (yt-dlp + decupagem) writes to RAIZ/inspiracoes.
  - bin/voz calls the ElevenLabs REST API. It needs ELEVENLABS_API_KEY in maquina/.env, which tanpz fills in himself.
  - Endpoints: /api/gerar, /api/inspirar, /api/refazer-geracao, /api/postado, /api/biblioteca (+ /api/bib-img), /api/tocar-intro.
- Opening: Máquina.app opens `?app=1`, the page posts /api/tocar-intro, and the server runs `afplay` on som/intro/<periodo>.mp3, because Chrome blocks autoplay.
  - Mix script: som/mixar.sh (riser + boom + voice at 2.2 s).
  - The TTS says "Tamps" to get the pronunciation; the screen shows "tanpz".
- Voice decision (18/11): tanpz asked for "a voz do Jarvis do Homem de Ferro".
  - We do not clone the real actor's voice.
  - He rejected the 3 designed voices ("não gostei, pode usar outra").
  - The pick is the library voice "James - English Butler" (xru6qZB94sJdkyqP12qN), eleven_v4, tag [calm, refined, composed, AI butler].
  - The old James Narrator mixes are kept in som/intro/antiga.
- Mark/icon: a red energy-core orb. The old red play icon looked like YouTube and was replaced.

## Lições 18/11 (testes animado + criativo)
- Jobs `claude -p` morrem se o modelo embrulhar comandos em `bash x.sh` ou laços (pede aprovação que ninguém dá). Regra adicionada em prompts/_gerar_base.md: comando direto, um por chamada; lógica vai em .py.
- Mascote do Animado: tools/assets/mascote/<reação>.png (8 poses, seedream-5.5, fundo transparente; preocupado/explicando passaram no birefnet). Custo único ~1.150 créditos ElevenLabs (~US$0,42).
- Login do claude CLI avisou que expira até 19/11/2026: jobs sem interação param. Fix do tanpz: `claude setup-token`.

## Redesign do painel (18/11/2026, depois do "tá tudo uma merda")
- Referência: RedotPay App Redesign (Egor Finko, pin Pinterest 891572057505414398). Topo preto→vinho, número grande do dia com "/meta" apagado, ações redondas (Cortar vermelho, resto vidro), cartão vinho com o que está rodando, lista limpa, dock embaixo. Paleta #730c1e #480415 #210207, fundo #0b0204, Inter.
- Logo: M de fita dobrada (hastes vermelhas + dobras escuras) em squircle vinho; monta com mola na abertura. Arquivos em app/public/marca e favicon.svg.
- Abertura: 1x por dia (?intro=1 força), sem partículas nem flash, logo monta + "Bom dia, tanpz." + "Tudo pronto pra hoje."; voz ÉPICA e GRAVE (pedido dele 18/11, "A VOZ TEM QUE SER EPICA, GRAVE"): Brian (nPczCjzI2devNBz1zQrb) com tag de narrador de trailer, tom baixado 1,5 semitom, graves +5dB e reverb de cinema (~84 Hz); braam no 0s quando a logo monta, trilha de trailer entra em 1,15s abaixando sob a voz. Fontes em som/v2 (brian-*, braam, trilha). APROVADA por ele em 18/11. Antônio (calmo) foi recusado: backup em som/intro/antiga-antonio; James em antiga-james.
- Sons de interface: mp3 reais ElevenLabs em app/public/sons (toque, aba, abrir, ok, enviar, erro), não mais sintetizados.
- Sem rótulo em caixa alta com espaçamento (parece kicker): títulos de seção são 17px semibold.
- **Why:** ele disse que parecia que eu "não aprendi nada"; tudo tem de sair de referência real e das regras dele.
- **How to apply:** qualquer tela nova do painel segue esse padrão; não reabrir a decisão.
