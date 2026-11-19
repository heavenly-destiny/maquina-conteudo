---
name: forja-mascote-calendario
description: Forja features asked 19/11 — OpusClip-style post calendar with network connection, and mascot creator with reaction sheet for comic-style videos
metadata:
  type: project
---

Two Forja features tanpz asked for on 19/11/2026.

**Calendário (OpusClip style).** The user schedules every post, picks the networks, and connects the networks.

Built on 19/11:
- Postar > Calendário: month grid; drag a video from the queue onto a day (on mobile: tap the video, then tap the day).
- A sheet to schedule it: day, time (12:00/18:00/21:00), networks, caption.
- "Programar a fila": fills 3 posts per day starting tomorrow.
- Storage is agenda.json, via /api/agendar and /api/desagendar.
- At the scheduled time it sends a Mac notification.

Still missing: really connecting the networks and posting automatically. Free routes only:
- YouTube Data API (Google OAuth)
- Instagram Graph API (business account plus a Meta app)
- TikTok Content Posting API (posts stay private until the app passes audit)

**Mascote / quadrinho.** For comic-style content (a little story with a mascot), the user:
1. picks a mascot format from models we provide;
2. fills in its characteristics;
3. gets AI-generated sheets with many reactions of that mascot, used later to animate it inside the video.

Not built yet. Plan: Gemini image (free tier, key already connected) for the base mascot, then a reaction grid sheet, sliced into individual transparent PNGs.

**Why:** Forja is a product sold by subscription and every generation cost is tanpz's, so use the cheapest model that holds quality.
**How to apply:** build the mascot creator as its own section with models, characteristics, sheet and per-reaction assets. See [[maquina-v2-produto]].

Mascot creator built 19/11 (maquina/mascote.py, telas/Mascotes.tsx, /api/mascote).
- It needs Gemini billing enabled to run; the free tier has an image quota of 0.
- The model ignores "4x4" and has returned a 6x3 grid with white gutters. Panels are detected from the chroma background, and a 1:1 aspectRatio is requested.
- Panels are named by reaction only when the count matches.
- Server fix: ThreadingHTTPServer request_queue_size was 5, which refused the 6th parallel image load. It is now 128.
- 19/11: the mascot creator must accept a photo. People want a mascot of themselves. The photo is the reference for the base character in the chosen style.
- 19/11 lesson: `brew install gallery-dl` upgraded Homebrew python3 to 3.15 and dropped PIL, cryptography and mlx (they were installed for 3.14). Reinstalled them with pip --user --break-system-packages. Never brew-install a formula that pulls a Python upgrade without reinstalling deps after.
- 19/11: Forja freeze root cause: /api/estado called brutos() which scans ~/Downloads; after the python 3.15 brew upgrade, reading Downloads hangs (TCC/iCloud). brutos now runs in a background thread; never touch ~/Downloads synchronously in a request.
