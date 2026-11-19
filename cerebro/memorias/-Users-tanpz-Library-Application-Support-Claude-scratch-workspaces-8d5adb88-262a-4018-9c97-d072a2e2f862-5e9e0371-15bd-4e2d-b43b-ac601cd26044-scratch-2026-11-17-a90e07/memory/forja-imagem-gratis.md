---
name: forja-imagem-gratis
description: "Forja image generation (mascot) runs on his Cloudflare Workers AI via the forja-imagem Worker, free; Gemini free tier and ElevenLabs API both blocked"
metadata:
  node_type: memory
  type: project
  originSessionId: 96c353dc-d159-49e2-ae78-8be2bf093218
  modified: 2026-11-19T20:55:49.628Z
---

On 19/11/2026 the mascot creator failed because the Gemini free tier allows zero image generations. The ElevenLabs image API (POST /v1/flows/image) needs a Pro plan, and his plan is lower. Pollinations is free but low quality and watermarked.

The fix is the Worker `forja-imagem` on his own Cloudflare account (code in maquina/worker-imagem, deployed with wrangler).
- The Worker is protected by a shared secret: CHAVE in Cloudflare, FORJA_IMG_CHAVE in maquina/.env.
- mascote.py uses flux-2-dev for the base character, about 15 s.
- It uses flux-2-klein-9b for each of the 32 reactions, about 5 s each. Each reaction is an edit of the base image, so the character stays the same.
- A 4x4 sheet in one image did NOT work: all poses came out identical.
- The Python user agent gets a 403 from Cloudflare, so send a custom User-Agent.

**Why:** the Forja uses only free tools, and payments are his decision.

**How to apply:** for any new Forja image feature, route it through this Worker. Friends who install the repo would need their own Worker and key; the installer does not do that yet. See [[maquina-repositorio]].
