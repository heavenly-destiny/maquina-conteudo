---
name: feedback-answer-from-cerebro
description: "In the tanpz_machine project, answer questions using the Obsidian vault's own content (grep/search the notes), not general knowledge alone"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1bf999db-8657-4702-8a3e-8666224d567b
  modified: 2026-07-31T00:29:02.771Z
---

When the user asks a question while working in `/Users/tanpz/tanpz_machine` (the "cérebro" — their Obsidian second-brain vault), ground the answer in the vault's actual notes rather than answering from general/parametric knowledge alone.

**Why:** the user explicitly said "any question I ask you within this folder, answer with the knowledge from it [the cérebro]." The vault contains curated, source-grounded knowledge (podcast transcripts, book chapters, marketing frameworks) that the user has spent significant effort building and cross-linking — it should be treated as the authoritative source for this project, not just background context.

**How to apply:**
- Search `marketing/`, `podcasts/`, `livros/`, `paginas/` (grep by keyword, or read the relevant atomic notes) before answering a question about marketing, offers, funnels, copywriting, traffic, or any topic the vault covers.
- Cite which note(s) the answer is drawn from (e.g., "segundo `marketing/framework-mecanismo-de-vsl.md`...") so the user can trace it back and the answer stays falsifiable against the source.
- If the vault genuinely doesn't cover the question, say so explicitly rather than silently falling back to general knowledge — the user should know when an answer is vault-grounded vs. not.
- This applies to substantive questions about the vault's subject matter (marketing, funnels, offers, the podcasts/books processed into it). Doesn't override normal engineering/file-management work in the same directory.
