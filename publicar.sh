#!/bin/zsh
# Só no Mac do tanpz: copia TODA a base de conhecimento (regras, memórias, skills, vault, banco de motion,
# lista de plugins) pra cerebro/ e sobe pro GitHub. Quem instala recebe tudo; a camada pessoal dele (perfil/) nunca é tocada.
set -e
cd "$(dirname "$0")"
H=$HOME
A="$H/Documents/Claude-Projeto-Tanpz"
V="$H/Documents/PROJETOS TANPZ /tanpz/tanpz_machine"
FORA=(--exclude node_modules --exclude .git --exclude 'venv' --exclude '.venv*' --exclude __pycache__ --exclude .transcode-cache
      --exclude '*.mp4' --exclude '*.mov' --exclude '*.MOV' --exclude '*.wav' --exclude '*.webm' --exclude '*.m4a' --exclude '*.f32'
      --exclude '*.zip' --exclude '.DS_Store' --exclude '.env' --exclude '.env.*' --exclude '*.env' --exclude '*.pem' --exclude '*.key' --exclude 'credentials*' --exclude 'token*.json' --exclude '*_bak*' --exclude '*.bak' --max-size=40m)

mkdir -p cerebro/regras/claude cerebro/memorias cerebro/skills cerebro/vault cerebro/banco-motion
cp "$A/claude/CLAUDE.md" cerebro/regras/claude/CLAUDE.md
for f in SEGUNDO-CEREBRO PLAYBOOK-DIRECT-RESPONSE APRENDIZADOS; do cp "$A/$f.md" cerebro/regras/; done
rsync -aL --delete "${FORA[@]}" "$H/.claude/skills/" cerebro/skills/
rsync -aL "${FORA[@]}" "$A/claude/skills/" cerebro/skills/
for m in $H/.claude/projects/*/memory(N); do
  p=$(basename "$(dirname "$m")"); mkdir -p "cerebro/memorias/$p/memory"
  rsync -a --delete "$m/" "cerebro/memorias/$p/memory/"
done
rsync -a --delete "${FORA[@]}" "$V/" cerebro/vault/
[ -d "$H/Documents/banco-motion" ] && rsync -a --delete "${FORA[@]}" "$H/Documents/banco-motion/" cerebro/banco-motion/
/opt/homebrew/bin/python3 - <<'PY'
import json, pathlib
h = pathlib.Path.home() / ".claude/plugins"
mk = json.loads((h / "known_marketplaces.json").read_text())
pl = json.loads((h / "installed_plugins.json").read_text())
pl = pl.get("plugins", pl)
linhas = [f"marketplace {v['source'].get('repo')}" for v in mk.values() if v.get("source", {}).get("repo")]
linhas += [f"plugin {k}" for k in pl]
pathlib.Path("cerebro/plugins.txt").write_text("\n".join(linhas) + "\n")
PY

[[ "$1" == "--so-copiar" ]] && { echo "base copiada pra cerebro/"; exit 0; }
git add -A
git commit -qm "${1:-atualiza a máquina e a base de conhecimento}" || echo "nada novo pra subir"
git push -q && echo "subiu pro GitHub"
