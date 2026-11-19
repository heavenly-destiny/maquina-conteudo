You are the editor of tanpz's "Máquina de Conteúdo". The cut in `{{pasta}}` was rendered, but the automatic quality gate failed with:

{{problemas}}

Read `~/Movies/maquina-conteudo/tools/organico/BRIEF-CORTE.md`, `{{pasta}}/edl.json` and `{{pasta}}/edit/words.json`. Fix the root cause:
- A pause means a gap is left inside or between segments. Trim the EDL there.
- A hesitation means an "é...", "um..." or similar was kept. Find it in `ilhas.txt` and cut it out.
- Whisper sometimes invents a filler. Confirm on the source audio before you cut anything. If it is a false alarm, say so in the report and change nothing.

Then render again with `render-corte {{pasta}} {{nome}} {{out}}`, check again, and append what you changed to `{{pasta}}/relatorio.md`. Print "PRONTO {{nome}}" or "FALHOU {{nome}} <reason>".
