#!/bin/zsh
# Puxa a versão nova da máquina e da base de conhecimento. Sua camada (perfil/, .env, vídeos) fica intacta.
set -e
cd "$(dirname "$0")"
git stash -q 2>/dev/null || true
git pull -q --ff-only
git stash pop -q 2>/dev/null || { git checkout -q -- . ; git stash drop -q; } || true
pkill -f "painel.py" 2>/dev/null || true
./instalar.sh
