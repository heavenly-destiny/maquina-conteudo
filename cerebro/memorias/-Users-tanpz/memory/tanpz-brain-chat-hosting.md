---
name: tanpz-brain-chat-hosting
description: "Como o chat \"Tanpz Brain\" era hospedado via LaunchAgent (DESATIVADO em 2026-08-02)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 60a6a659-62b3-423d-b36e-e2b298258fa1
  modified: 2026-08-02T21:36:41.390Z
---

**DESATIVADO em 2026-08-02**: o usuário pediu pra desativar apps/serviços que iniciam junto com o login, e escolheu remover o LaunchAgent do Tanpz Brain (`com.tanpz.brain.plist` foi descarregado via `launchctl bootout` e deletado). O servidor não sobe mais sozinho no login e não está mais rodando em 127.0.0.1:8791. Os arquivos-fonte (`.brain-src/`, `tanpz-brain-chat.html`) continuam intactos no disco — só o serviço automático foi removido. Se o usuário quiser reativar, seria preciso recriar o plist e rodar `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.tanpz.brain.plist`.

O chat do Tanpz Brain (app HTML standalone que consulta o vault com busca semântica local sobre 654 notas) rodava via um LaunchAgent do macOS, não mais um `python -m http.server` manual num terminal. O backend de LLM é a **Groq (grátis)**, não Anthropic — o usuário pediu explicitamente pra não gastar e pra ser automático, sem precisar digitar chave nenhuma.

- Arquivo do app: `/Users/tanpz/tanpz_machine/tanpz-brain-chat.html` (corpus embutido, ~1MB)
- Fonte editável (não mexer direto no arquivo gerado acima): `/Users/tanpz/tanpz_machine/.brain-src/chat_template.html` + `chat_corpus.json` + `build.py`. Rodar `python3 build.py` nessa pasta regenera o `tanpz-brain-chat.html` final.
- Backend: Groq API (`https://api.groq.com/openai/v1/chat/completions`, formato OpenAI-compatible), modelo padrão `llama-3.3-70b-versatile` (alternativa rápida: `llama-3.1-8b-instant`). Tier gratuito.
- A chave Groq é lida de `~/.config/watch/.env` (`GROQ_API_KEY` — a mesma chave já usada pelo skill `watch` pra transcrição de áudio) e **embutida diretamente no HTML gerado** pelo `build.py`, então o app funciona sem o usuário nunca precisar inserir chave. O modal de settings continua existindo só como override manual opcional (localStorage tem prioridade sobre a chave embutida).
- LaunchAgent: `~/Library/LaunchAgents/com.tanpz.brain.plist` — sobe `python3 -m http.server 8791` (bind 127.0.0.1) apontando pra `/Users/tanpz/tanpz_machine/.brain-serve/` (diretório dedicado com só um `index.html` symlink pro chat, pra não expor o vault inteiro via directory listing)
- URL: http://127.0.0.1:8791/
- `RunAtLoad` + `KeepAlive`: sobe sozinho no login e reinicia se cair. Logs em `~/Library/Logs/tanpz-brain.log`.

**Por que**: a versão anterior exigia terminal aberto rodando o servidor manualmente, e usava a API paga da Anthropic com chave manual por navegador. O usuário pediu pra "terminar" o app com hospedagem persistente E backend gratuito/automático.

**Como aplicar**: se o app parecer offline, checar `launchctl list | grep tanpz.brain` e `curl http://127.0.0.1:8791/`. Pra reconstruir (notas novas no vault, ou trocar de modelo), editar os arquivos em `.brain-src/` e rodar `build.py` — o symlink já aponta pro arquivo certo, não precisa mexer no LaunchAgent. Se o navegador mostrar "Invalid API Key" mesmo com o build atualizado, provavelmente há uma chave antiga (de teste manual) sobrando em `localStorage.tanpz_brain_api_key` — ela tem prioridade sobre a chave embutida; limpar com `localStorage.removeItem("tanpz_brain_api_key")`. Existe também [[tanpz-brain-neural-map]] (mapa neural / grafo, `cerebro_grafo.html`) como um artefato **separado**, não integrado a este chat.

**Limite de tokens da Groq (grátis)**: o tier gratuito do `llama-3.3-70b-versatile` tem TPM (tokens/minuto) de só ~12000 **por requisição**. O retrieval manda no máximo 6 notas × 1200 chars como contexto (reduzido de 16×4000, que estourava o limite em ~22k tokens). O histórico da conversa guarda só perguntas/respostas enxutas (sem o bloco de contexto completo repetido a cada turno) e é limitado a ~4 trocas — o contexto do vault é injetado só na pergunta atual, nunca persistido no histórico. Se voltar a dar "Request too large", reduzir ainda mais `k` ou o slice em `.brain-src/chat_template.html` (função `sendMessage`) e rodar `build.py` de novo.
