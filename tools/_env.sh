# fonte comum dos scripts de shell (Mac e Git Bash no Windows)
T="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="$(dirname "$T")"
PY3="${FORJA_PY:-$(command -v python3 || command -v python)}"
if [ -x "$T/.venv-voz/bin/python" ]; then VPY="$T/.venv-voz/bin/python"; else VPY="$T/.venv-voz/Scripts/python.exe"; fi
WHISPER_MODEL="$HOME/.cache/whisper/ggml-large-v3-turbo.bin"
