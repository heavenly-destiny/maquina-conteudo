---
name: screenshot-to-code-local
description: screenshot-to-code roda em ~/Developer/screenshot-to-code via ./start.sh; uvicorn precisa de --ws-max-size acima do default.
metadata: 
  node_type: memory
  type: project
  originSessionId: fc5b9044-fd68-4bf6-bb75-b10b27cd3026
  modified: 2026-08-09T03:31:18.220Z
---

Instalado em 2026-08-08 em `~/Developer/screenshot-to-code` (clone de github.com/abi/screenshot-to-code). Subir com `./start.sh` — sobe backend em :7001 e frontend em :5173 juntos.

O default de `--ws-max-size` do uvicorn (16MB) é menor que o que a UI aceita (5 arquivos × 20MB, e base64 infla ~33%). Estourar esse limite derruba o websocket e a UI só mostra "Error generating code..." — o log do backend mostra `WebSocketDisconnect: 1006` em `receive_params`, sem dizer que foi tamanho. O `start.sh` já passa 200MB.

Poetry e pnpm foram instalados em `~/.local/bin` porque o Node do tanpz vive em `/usr/local` e `npm install -g` dá EACCES sem sudo. Ver [[instalar-skills-sempre-global]].

A chave Gemini está em `backend/.env` desde 2026-08-08 (antes vivia só no localStorage da UI). O `.env` não é lido pelo `config.py` — quem chama `load_dotenv()` é o `main.py`, então testar a chave com `python -c "import config"` dá falso negativo; precisa carregar o dotenv antes. E `--reload` do uvicorn só observa `.py`: editar o `.env` exige reiniciar o backend na mão. `REPLICATE_API_KEY` (geração de imagem) só funciona via `.env`, nunca pela UI.

**A chave do diálogo de Settings da UI (localStorage) tem prioridade sobre o `.env`** — `generate_code.py:399`, `_get_from_settings_dialog_or_env`. Trocar a chave no `.env` não adianta enquanto o navegador tiver uma antiga salva; some com ela (`setting.geminiApiKey = null`) pra deixar o `.env` como fonte única.

Estado em 2026-08-09: rodando com **Gemini apenas**, chave `AQ.Ab8RN6KXO7gx…` (formato novo do AI Studio, projeto COM saldo). A `AIzaSyBOzq4…` é de outro projeto Google, sem crédito — não confundir. Teste ponta a ponta pelo websocket deu 3 de 4 variantes com código; a que falhou foi `503 high demand`, transitório do Google.

Em 2026-08-08 tanpz adicionou as 4 chaves (OpenAI, Anthropic, Gemini, Replicate) nos dois `.env`. As de OpenAI/Anthropic/Replicate **são válidas mas as contas estão com saldo zero** — OpenAI `credit_balance_exhausted`, Anthropic "credit balance is too low", Replicate 402, Gemini "prepayment credits are depleted". Testar chave com `/v1/models` (ou `/v1/account`) dá 200 mesmo sem saldo; só uma chamada de geração real revela a falta de crédito. Vale refazer esse teste antes de culpar o código por "Error generating code".

O projeto Gemini saiu do free tier e virou prepago **sem saldo**, então até os Flash pararam — o erro mudou de `limit: 0` para "prepayment credits are depleted". Antes disso, no free tier, `gemini-3.1-pro` retornava 429 com `limit: 0` — não existia pra conta gratuita. Como o app monta 4 variantes e o conjunto `GEMINI_ONLY_MODELS` (em `backend/routes/model_choice_sets.py`) usava 3.1-pro em 2 dos 4 slots, metade das gerações falhava. Troquei por 3.6-flash / 3-flash-preview / 3.5-flash, que a chave aceita. O RPM do free tier é 5 **por modelo**, então espalhar as variantes entre modelos diferentes também evita 429 por rate limit.
