#!/usr/bin/env python3
"""Manda mp4s como DOCUMENTO na conversa "Tanpz (você)" do WhatsApp Web (Chrome).

Precisa de duas permissões (feitas uma vez pelo tanpz):
- Chrome > Ver > Desenvolvedor > "Permitir o JavaScript dos Eventos da Apple"
- Ajustes > Privacidade > Acessibilidade > Claude (já liberado em 18/11/2026)

uso: whatsapp.py ARQ1.mp4 [ARQ2.mp4 ...]
"""
import subprocess, sys, json, time, os, tempfile
from pathlib import Path

CHAT = "Tanpz (você)"
CLICK = Path(__file__).resolve().parent / "bin/click"


def osa(script):
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr.strip())
    return r.stdout.strip()


def aba():
    """Ativa a aba do WhatsApp e devolve (janela, aba)."""
    pos = osa('''tell application "Google Chrome"
repeat with wi from 1 to count of windows
repeat with ti from 1 to count of tabs of window wi
if URL of tab ti of window wi contains "web.whatsapp.com" then return (wi as text) & "," & (ti as text)
end repeat
end repeat
return ""
end tell''')
    if not pos:
        raise RuntimeError("WhatsApp Web não está aberto no Chrome")
    w, t = pos.split(",")
    osa(f'tell application "Google Chrome" to set active tab index of window {w} to {t}')
    osa(f'tell application "Google Chrome" to set index of window {w} to 1')
    osa('tell application "Google Chrome" to activate')
    time.sleep(0.6)
    return w, t


def js(w, t, code):
    code = code.replace("\\", "\\\\").replace('"', '\\"')
    out = osa(f'tell application "Google Chrome" to execute tab {t} of window {w} javascript "{code}"')
    try:
        return json.loads(out)
    except ValueError:
        return out


def clicar(x, y):
    subprocess.run([str(CLICK), str(int(x)), str(int(y))], check=True)


def enviar(arquivos):
    arquivos = [Path(a).resolve() for a in arquivos]
    for a in arquivos:
        if not a.exists():
            raise FileNotFoundError(a)
    w, t = aba()
    # abre a conversa certa e confere o título antes de qualquer envio
    js(w, t, f'(()=>{{const s=[...document.querySelectorAll("span[title]")].find(e=>e.title==={json.dumps(CHAT)});'
             f'if(s){{const r=s.closest("[role=listitem],[role=row]")||s;["mousedown","mouseup","click"].forEach(k=>r.dispatchEvent(new MouseEvent(k,{{bubbles:true}})))}};return "ok"}})()')
    time.sleep(1.5)
    titulo = js(w, t, 'JSON.stringify((document.querySelector("#main header span[dir=auto]")||{}).textContent||"")')
    if titulo != CHAT:
        raise RuntimeError(f"conversa aberta é '{titulo}', não '{CHAT}'. Nada enviado.")
    # pasta temporária só com os arquivos (hard link), pro seletor pegar tudo com cmd+A
    tmp = Path(tempfile.mkdtemp(prefix="envio-", dir=Path.home() / "Movies/maquina-conteudo"))
    for a in arquivos:
        os.link(a, tmp / a.name)
    geo = js(w, t, 'JSON.stringify((()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")==="Anexar");'
                   'const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,top:screenY+outerHeight-innerHeight,left:screenX}})())')
    clicar(geo["left"] + geo["x"], geo["top"] + geo["y"])
    time.sleep(1.2)
    doc = js(w, t, 'JSON.stringify((()=>{const m=[...document.querySelectorAll("[role=menuitem]")].find(x=>x.textContent.includes("Documento"));'
                   'if(!m)return null;const r=m.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})())')
    if not doc:
        raise RuntimeError("menu Anexar não abriu")
    clicar(geo["left"] + doc["x"], geo["top"] + doc["y"])
    time.sleep(2.5)
    osa(f'''tell application "System Events"
keystroke "g" using {{command down, shift down}}
delay 1
keystroke "{tmp}/"
delay 1
key code 36
delay 1.5
keystroke "a" using {{command down}}
delay 0.8
end tell''')
    osa(f'tell application "System Events" to tell process "Google Chrome" to click button "Abrir" of splitter group 1 of sheet 1 of window 1')
    time.sleep(3)
    n = js(w, t, 'JSON.stringify(document.querySelectorAll("[aria-label=Enviar],[data-icon=wds-ic-send-filled],[data-icon=send]").length)')
    if not n:
        raise RuntimeError("prévia do envio não apareceu")
    js(w, t, '(()=>{const b=document.querySelector("[aria-label=Enviar]")||document.querySelector("[data-icon=wds-ic-send-filled],[data-icon=send]").closest("[role=button],button");b.click();return "ok"})()')
    # espera subir: confere cada nome com dois tiques
    nomes = [a.name for a in arquivos]
    for _ in range(90):
        time.sleep(10)
        falta = js(w, t, 'JSON.stringify((()=>{const rows=[...document.querySelectorAll("#main [role=row]")];const n=%s;'
                         'return n.filter(x=>!rows.some(r=>r.innerText.includes(x)&&r.querySelector("[data-icon*=dblcheck],[data-icon*=msg-dblcheck]")))})())' % json.dumps(nomes))
        if not falta:
            break
    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()
    if falta:
        raise RuntimeError("não confirmou envio de: " + ", ".join(falta))
    return nomes


if __name__ == "__main__":
    print("enviados:", enviar(sys.argv[1:]))
