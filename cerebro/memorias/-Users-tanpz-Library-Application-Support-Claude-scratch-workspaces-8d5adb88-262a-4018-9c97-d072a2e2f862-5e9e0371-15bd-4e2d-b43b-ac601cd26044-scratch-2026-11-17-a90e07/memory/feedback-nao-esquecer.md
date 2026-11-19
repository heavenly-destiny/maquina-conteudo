---
name: feedback-nao-esquecer
description: tanpz refuses to repeat a rule twice; every rule/correction must be written where the work actually reads it (brief, prompt, CLAUDE.md), not only in memory
metadata:
  type: feedback
---

18/11/2026: "se você já aprendeu, não tem que ficar repetindo". Every correction he gives goes, in the same turn, into: (1) a memory file, (2) the file the work actually loads for that task (BRIEF-CORTE.md / prompts/*.md for the machine, the skill file for videos, SEGUNDO-CEREBRO.md for taste), and (3) a check in the verification step so a render that breaks it fails. Before any task, grep memory + SEGUNDO-CEREBRO + briefs for the topic and list the rules that apply.

**Why:** rules lived only in chat or memory, and the machine jobs and later turns did not apply them.
**How to apply:** treat "saved to memory" as not done until the rule is in the brief/prompt the job reads. See [[feedback-maquina-mesmas-regras]].
