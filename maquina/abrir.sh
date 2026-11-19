#!/bin/zsh
# liga o painel se estiver desligado e abre no Chrome
cd "$(dirname "$0")"
if ! curl -s -o /dev/null --max-time 1 http://127.0.0.1:4747/api/estado; then
  nohup /opt/homebrew/bin/python3 painel.py > painel.log 2>&1 &
  for i in {1..20}; do curl -s -o /dev/null --max-time 1 http://127.0.0.1:4747/api/estado && break; sleep 0.3; done
fi
open -a "Google Chrome" "http://127.0.0.1:4747/?app=1"  # a abertura toca 1x por dia; ?intro=1 força
