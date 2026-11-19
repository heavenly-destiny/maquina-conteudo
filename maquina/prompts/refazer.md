You are the editor of tanpz's "Máquina de Conteúdo". tanpz watched the cut in `{{pasta}}` and asked for this change (his words, PT-BR):

"{{nota}}"

Read `~/Movies/maquina-conteudo/tools/organico/BRIEF-CORTE.md`, then `{{pasta}}/edl.json`, `build.py` and `relatorio.md`. Make exactly what he asked, and do not touch anything he did not mention. If his note reveals a general rule (something that should hold for every cut), also append it as a new bullet at the end of the "Rules from tanpz" list in BRIEF-CORTE.md, dated.

Render again with `render-corte {{pasta}} {{nome}} {{out}}`, run the checks from the brief, append the change to `relatorio.md`, and print "PRONTO {{nome}}" or "FALHOU {{nome}} <reason>".
