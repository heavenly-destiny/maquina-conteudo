#!/bin/zsh
# liga a Forja se estiver desligada e abre no navegador. Desligou o Mac? É só clicar de novo no atalho.
cd "$(dirname "$0")"
PY=$(command -v python3.11 || command -v python3)
if ! curl -s -o /dev/null --max-time 1 http://127.0.0.1:4747/api/estado; then
  # sai com 3 quando se atualiza sozinha: aí liga de novo com o código novo
  nohup zsh -c "while true; do '$PY' painel.py; [ \$? -eq 3 ] || break; sleep 1; done" > painel.log 2>&1 &
  for i in {1..30}; do curl -s -o /dev/null --max-time 1 http://127.0.0.1:4747/api/estado && break; sleep 0.3; done
fi
open -a "Google Chrome" "http://127.0.0.1:4747/?app=1" 2>/dev/null || open "http://127.0.0.1:4747/?app=1"
