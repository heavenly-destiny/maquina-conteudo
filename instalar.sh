#!/bin/zsh
# Instala a Máquina de Conteúdo neste Mac. Pode rodar quantas vezes quiser: só instala o que falta.
# Nunca apaga a sua camada pessoal (perfil/, .env, vídeos) nem as suas skills e plugins.
set -e
cd "$(dirname "$0")"
REPO="$PWD"
ok() { print -P "%F{green}✓%f $1"; }
passo() { print -P "\n%F{red}●%f %B$1%b"; }

[[ "$(uname)" == "Darwin" ]] || { echo "A Máquina roda em Mac."; exit 1; }

passo "Pasta"
ALVO="$HOME/Movies/maquina-conteudo"
if [[ "$REPO" != "$ALVO" ]]; then
  if [[ -e "$ALVO" ]]; then echo "Já existe $ALVO e não é esta pasta. Clone direto nela."; exit 1; fi
  mkdir -p "$HOME/Movies"; ln -s "$REPO" "$ALVO"
fi
ok "$ALVO"

passo "Programas (Homebrew)"
if ! command -v brew >/dev/null; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
[[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
for p in python@3.11 python node ffmpeg yt-dlp whisper-cpp git; do
  brew list --formula "$p" >/dev/null 2>&1 || brew install "$p"
done
ok "python, node, ffmpeg, yt-dlp, whisper, git"

passo "Claude Code"
command -v claude >/dev/null || npm install -g @anthropic-ai/claude-code
ok "claude $(claude --version 2>/dev/null | head -1)"

passo "Modelo de transcrição (1,6 GB, só na primeira vez)"
W="$HOME/.cache/whisper/ggml-large-v3-turbo.bin"
if [[ ! -s "$W" ]]; then
  mkdir -p "${W:h}"
  curl -L --fail -o "$W.parte" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin" && mv "$W.parte" "$W"
fi
ok "whisper large-v3-turbo"

passo "Limpeza de voz (DeepFilterNet)"
if [[ ! -x tools/.venv-voz/bin/python ]]; then
  "$(brew --prefix python@3.11)/bin/python3.11" -m venv tools/.venv-voz
  tools/.venv-voz/bin/pip install -q --upgrade pip
  tools/.venv-voz/bin/pip install -q -r tools/requirements-voz.txt
fi
ok "venv de voz"

passo "Render de vídeo (HyperFrames)"
command -v hyperframes >/dev/null || npm install -g hyperframes
hyperframes doctor >/dev/null 2>&1 || true
ok "hyperframes"

passo "Toda a base de conhecimento: skills"
mkdir -p "$HOME/.claude/skills"
n=0
for s in cerebro/skills/*(N/); do
  d="$HOME/.claude/skills/${s:t}"
  if [[ ! -e "$d" ]]; then ln -s "$REPO/$s" "$d"; n=$((n+1)); fi
done
ok "$n skills novas ligadas (as que você já tinha ficaram como estavam)"

passo "Plugins do Claude usados pela máquina"
PULA="caveman|ponytail|i-have-adhd|claude-hud|superwhisper|swift-lsp|typescript-lsp|pyright-lsp|php-lsp|codex|vercel|supabase|semgrep|context7"
if [[ -f cerebro/plugins.txt ]]; then
  grep '^marketplace ' cerebro/plugins.txt | while read -r _ r; do claude plugin marketplace add "$r" >/dev/null 2>&1 || true; done
  grep '^plugin ' cerebro/plugins.txt | while read -r _ p; do
    [[ "${p%@*}" =~ ^($PULA)$ ]] && continue
    claude plugin install "$p" >/dev/null 2>&1 || true
  done
fi
ok "hyperframes, gsap, marketing, social media, taste, claude-mem e os outros"

passo "Atalho"
chmod +x maquina/abrir.sh maquina/bin/* atualizar.sh 2>/dev/null || true
rm -f "$HOME/Desktop/Máquina.command"
cat > "$HOME/Desktop/Forja.command" <<A
#!/bin/zsh
"$ALVO/maquina/abrir.sh"
A
chmod +x "$HOME/Desktop/Forja.command"
ok "Forja na Mesa: clique pra abrir quando quiser"

passo "Ligando"
maquina/abrir.sh
ok "Pronto. Na primeira vez, conecte seu Claude, sua voz e conte quem você é."
