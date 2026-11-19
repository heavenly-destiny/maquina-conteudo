---
name: maquina-repositorio
description: Máquina is a private GitHub repo friends install; base knowledge ships in cerebro/ and is never erased; each user's layer is perfil/
metadata:
  type: project
---

18/11/2026: ~/Movies/maquina-conteudo is a git repo → github.com/heavenly-destiny/maquina-conteudo (private). Friend installs with `git clone ... ~/Movies/maquina-conteudo && ./instalar.sh` (Mac only; brew, claude CLI, hyperframes, whisper model, voice venv, links skills, installs machine plugins).

Rules from tanpz:
- "toda inteligência precisa estar na ferramenta": cerebro/ carries ALL taught knowledge (regras/CLAUDE.md, SEGUNDO-CEREBRO, PLAYBOOK, APRENDIZADOS, every memory dir, all skills, vault md + video toolbox code, banco-motion, plugins.txt). METRICAS and CONTEXTO stay out (personal numbers/clients).
- "o conhecimento da base não pode ser apagado": user learning goes to perfil/ (PERFIL.md from onboarding, CORRECOES.md auto-appended by maquina.aprender on every refazer note). perfil/ is gitignored; atualizar.sh never touches it.
- Before every push: `./publicar.sh` re-copies the base, then scan for secrets (never print matches).

**How to apply:** after changing the machine or teaching new rules, run `~/Movies/maquina-conteudo/publicar.sh "msg"` so friends get it via `atualizar.sh`. See [[maquina-v2-produto]].
