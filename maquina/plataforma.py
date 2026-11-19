"""O que muda entre Mac e Windows fica aqui. O resto do código não pergunta qual é o sistema."""
import json, os, shutil, subprocess, sys, time
from pathlib import Path

WIN = os.name == "nt"
MAC = sys.platform == "darwin"

# Windows abre arquivo em cp1252 por padrão; a máquina inteira é UTF-8. O lançador do Windows liga -X utf8
# no painel e todo processo filho herda pela variável abaixo.
os.environ.setdefault("PYTHONUTF8", "1")


def exe(nome):
    """caminho do programa (no Windows o npm instala claude.cmd, hyperframes.cmd)."""
    return shutil.which(nome) or nome


def venv_python(pasta):
    pasta = Path(pasta)
    return pasta / ("Scripts/python.exe" if WIN else "bin/python")


def junta_path(*dirs):
    return os.pathsep.join([*(str(d) for d in dirs), os.environ.get("PATH", "")])


def lixeira(a):
    """manda pra Lixeira do sistema; nunca apaga de vez."""
    a = Path(a)
    if WIN:
        tipo = "DeleteDirectory" if a.is_dir() else "DeleteFile"
        subprocess.run(["powershell", "-NoProfile", "-Command",
                        f"Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::{tipo}("
                        f"'{str(a).replace(chr(39), chr(39) * 2)}', 'OnlyErrorDialogs', 'SendToRecycleBin')"], check=True)
        return
    lx = Path.home() / (".Trash" if MAC else ".local/share/Trash/files")
    lx.mkdir(parents=True, exist_ok=True)
    dest = lx / a.name
    if dest.exists() or dest.is_symlink():
        dest = lx / f"{a.stem} {time.strftime('%H%M%S')}{a.suffix}"
    shutil.move(str(a), str(dest))


def notificar(msg, titulo="Forja"):
    if MAC:
        subprocess.run(["osascript", "-e", f'display notification {json.dumps(msg)} with title {json.dumps(titulo)} sound name "Glass"'],
                       capture_output=True)


def tocar(arq):
    """som da abertura tocado pelo sistema (o navegador bloqueia som sem clique). Só no Mac; no Windows o navegador toca."""
    if MAC:
        subprocess.Popen(["afplay", str(arq)])


def segundo_plano():
    """processo filho que sobrevive ao painel."""
    # prioridade baixa: corte, voz e render não roubam a CPU do painel (a tela fica rápida mesmo com 4 ffmpeg rodando)
    if WIN:
        return {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS | subprocess.BELOW_NORMAL_PRIORITY_CLASS}
    return {"start_new_session": True, "preexec_fn": lambda: os.nice(10)}
