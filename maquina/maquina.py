#!/usr/bin/env python3
"""Máquina de Conteúdo: vídeo cru -> cortes 9:16 prontos.

uso:
  maquina.py novo BRUTO.MOV        cria o job, transcreve e planeja os cortes (para pro tanpz escolher)
  maquina.py rodar JOB             continua um job de onde parou
  maquina.py editar JOB N [N...]   edita só os cortes escolhidos
  maquina.py refazer JOB N "nota"  refaz o corte N com a nota do tanpz
  maquina.py legendas JOB          escreve legenda + hashtags dos cortes
  maquina.py status [JOB]          mostra o estado

Cada job fica em ~/Movies/maquina-conteudo/jobs/<data>-<nome>/ com estado.json.
O cérebro de cada etapa é o `claude -p` seguindo os prompts em maquina/prompts/.
"""
import json, os, subprocess, sys, time, datetime, threading, concurrent.futures as cf
from pathlib import Path
import plataforma

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent  # a pasta do repositório (no Mac do tanpz: ~/Movies/maquina-conteudo)
TOOLS = RAIZ / "tools"
JOBS = RAIZ / "jobs"
H = Path.home()
CEREBRO = RAIZ / "cerebro"  # base: tudo que já foi ensinado (regras, memórias, skills, vault). Vem no repositório e nunca é apagada.
PERFIL = RAIZ / "perfil"    # camada de quem usa: perfil e correções. Fica só neste Mac (fora do git) e soma por cima da base.
ORIG = {  # onde cada parte da base mora no Mac do tanpz; em outro Mac usa a cópia em cerebro/
    "~/Documents/Claude-Projeto-Tanpz": (H / "Documents/Claude-Projeto-Tanpz", CEREBRO / "regras"),
    "~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine": (H / "Documents/PROJETOS TANPZ /tanpz/tanpz_machine", CEREBRO / "vault"),
    "~/Documents/banco-motion": (H / "Documents/banco-motion", CEREBRO / "banco-motion"),
}
base = lambda k: ORIG[k][0] if ORIG[k][0].exists() else ORIG[k][1]
APOIO = base("~/Documents/Claude-Projeto-Tanpz")  # regras, playbook e aprendizados
VAULT = base("~/Documents/PROJETOS TANPZ /tanpz/tanpz_machine")
WHISPER = Path.home() / ".cache/whisper/ggml-large-v3-turbo.bin"
PARALELO = int(os.environ.get("MAQUINA_PARALELO", "2"))  # ponytail: 2 renders juntos; mais que isso o Mac engasga
MODELO_PLANO = os.environ.get("MAQUINA_MODELO_PLANO", "opus")
MODELO_CORTE = os.environ.get("MAQUINA_MODELO_CORTE", "sonnet")
# só o que a edição precisa: ler/escrever na pasta e rodar as ferramentas de vídeo
FERRAMENTAS = ["Read", "Write", "Edit", "Glob", "Grep",
               "Bash(ffmpeg:*)", "Bash(ffprobe:*)", "Bash(whisper-cli:*)", "Bash(python3:*)",
               "Bash(ls:*)", "Bash(cp:*)", "Bash(ln:*)", "Bash(mkdir:*)", "Bash(cat:*)", "Bash(head:*)", "Bash(tail:*)",
               "Bash(clean-voice:*)", "Bash(render-corte:*)",
               "Bash(npx:*)", "Bash(yt-dlp:*)", "Bash(voz:*)", "Bash(som:*)", "Bash(node:*)", "Bash(npm:*)", "Bash(curl:*)", f"Bash({TOOLS}/.venv/bin/python:*)",
               # o mesmo arsenal do chat: skills, MCPs conectados, pesquisa e subagentes
               "Skill", "WebSearch", "WebFetch", "Agent", "Task", "TodoWrite", "mcp__21st", "mcp__v0", "mcp__glyph",
               "mcp__plugin_claude-mem_mcp-search"]  # banco de memória de todas as conversas


def sh(cmd, **kw):
    return subprocess.run(cmd, shell=isinstance(cmd, str), check=True, capture_output=True, text=True, **kw).stdout


def dur(p):
    return float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))


class Job:
    def __init__(self, pasta):
        self.p = Path(pasta)
        self.f = self.p / "estado.json"
        self.e = json.loads(self.f.read_text()) if self.f.exists() else {}
        self.sujos = set()

    trava = threading.Lock()

    def salvar(self, n=None):
        """n = corte que este processo mexeu. Outros cortes vêm do disco, porque o painel pode estar
        refazendo um corte em outro processo ao mesmo tempo."""
        with Job.trava:  # cortes rodam em paralelo; sem trava dois salvamentos se atropelam
            if n is not None:
                self.sujos.add(int(n))
            if self.f.exists() and self.sujos:
                disco = {int(c["n"]): c for c in json.loads(self.f.read_text()).get("cortes", [])}
                for c in self.e["cortes"]:  # atualiza no lugar: as threads seguram referência pros dicts
                    n_ = int(c["n"])
                    if n_ not in self.sujos and n_ in disco:
                        c.clear()
                        c.update(disco[n_])
            tmp = self.f.with_suffix(f".{threading.get_ident()}.tmp")
            tmp.write_text(json.dumps(self.e, ensure_ascii=False, indent=1))
            tmp.replace(self.f)

    def log(self, msg):
        linha = f"{datetime.datetime.now():%H:%M:%S} {msg}"
        print(linha, flush=True)
        with open(self.p / "log.txt", "a") as fh:
            fh.write(linha + "\n")


def conta_claude():
    """Claude da pessoa que configurou a máquina (maquina/.env); vazio = login do Mac."""
    f = AQUI / ".env"
    d = {}
    if f.exists():
        for l in f.read_text().splitlines():
            k, _, v = l.partition("=")
            if k.strip() in ("CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY") and v.strip():
                d[k.strip()] = v.strip().strip('"\'')
    return d


def claude(prompt, pasta, modelo, log_nome):
    """Roda o claude headless numa pasta. Devolve o texto final."""
    cmd = [plataforma.exe("claude"), "-p", prompt, "--model", modelo, "--permission-mode", "acceptEdits",
           "--allowedTools", *FERRAMENTAS, "--add-dir", *[str(x) for x in (RAIZ, APOIO, PERFIL, CEREBRO, H / ".claude", VAULT, H / "Documents/Stories Lab Criativos", base("~/Documents/banco-motion")) if Path(x).exists()], "--output-format", "text"]
    env = {**os.environ, "PATH": plataforma.junta_path(AQUI / "bin"), "FORJA_PY": sys.executable,
           "FORJA_VOZ_PY": str(plataforma.venv_python(RAIZ / "tools/.venv-voz"))}  # clean-voice e render-corte
    env.update(conta_claude())  # conta conectada no onboarding (token da assinatura ou chave de API)
    r = subprocess.run(cmd, cwd=pasta, capture_output=True, text=True, timeout=60 * 60, env=env)
    (Path(pasta) / log_nome).write_text(r.stdout + "\n--- stderr ---\n" + r.stderr)
    if r.returncode:
        raise RuntimeError(f"claude saiu com {r.returncode}: {r.stderr[-400:]}")
    return r.stdout


def prompt(arquivo_, **v):
    t = (AQUI / "prompts" / f"{arquivo_}.md").read_text()
    if not arquivo_.startswith("_"):  # toda tarefa leva as regras do tanpz, iguais às do chat
        import conhecimento
        conhecimento.gerar()  # índice de tudo que já existe, refeito na hora: nada novo fica de fora
        t = (AQUI / "prompts" / "_regras.md").read_text() + t
        t = perfil_txt() + t
    for k, x in v.items():
        t = t.replace("{{" + k + "}}", str(x))
    return caminhos(t)


def caminhos(t):
    """troca os caminhos do Mac do tanpz pelos deste Mac (a base em cerebro/ quando o original não existe)"""
    for k in ORIG:
        t = t.replace(k, str(base(k)))
    t = t.replace("~/Movies/maquina-conteudo", str(RAIZ))
    if not (H / ".claude/projects").exists() or not any((H / ".claude/projects").glob("*-tanpz-*")):
        t = t.replace("~/.claude/projects/", str(CEREBRO / "memorias") + "/")
    return t


def perfil():
    try:
        return json.loads((PERFIL / "perfil.json").read_text())
    except (OSError, ValueError):
        return {}


def perfil_txt():
    """camada de quem usa, lida antes de tudo. Soma por cima da base: nunca apaga o que já foi ensinado."""
    p = perfil()
    if not p and not (PERFIL / "CORRECOES.md").exists():
        return ""
    return (f"# Who is using this machine\n"
            f"This copy of the machine belongs to {p.get('nome') or 'its owner'}. READ {PERFIL / 'PERFIL.md'} and {PERFIL / 'CORRECOES.md'} first. "
            "Their taste, niche, voice and every correction they made override the base TASTE rules for their own content "
            "(wherever the base files say 'tanpz', apply it to this person's taste). The base TECHNIQUE (editing, retention, captions, "
            "audio, quality bar, copy craft) always stays: the base knowledge is never dropped, their layer only adds on top.\n\n")


def aprender(nota, contexto=""):
    """toda correção de quem usa entra na camada dele (perfil/CORRECOES.md): a máquina aprende o estilo da pessoa"""
    nota = str(nota).strip()
    if not nota:
        return
    PERFIL.mkdir(exist_ok=True)
    f = PERFIL / "CORRECOES.md"
    if not f.exists():
        f.write_text("# Correções e preferências (aprendidas no uso)\n\nCada linha é um pedido de quem usa. Vale para os próximos vídeos.\n\n")
    with f.open("a") as o:
        o.write(f"- {datetime.date.today()} {('[' + contexto + '] ') if contexto else ''}{nota}\n")


# ---------- configurações da tela Configurar ----------
# Econômico = o mais barato que segura o resultado (regra do tanpz). Env MAQUINA_MODELO_* ainda manda se setado.
MODELOS = {"economico": ("sonnet", "sonnet"), "equilibrado": ("opus", "sonnet"), "maximo": ("opus", "opus")}


def modelos(j):
    m = (j.e.get("config") or {}).get("modelo")
    if m not in MODELOS:
        return MODELO_PLANO, MODELO_CORTE
    return (os.environ.get("MAQUINA_MODELO_PLANO") or MODELOS[m][0], os.environ.get("MAQUINA_MODELO_CORTE") or MODELOS[m][1])


DUR_TXT = {"auto": "you decide the best length for each cut", "<30": "under 30 s", "30-59": "30 to 59 s",
           "60-89": "60 to 89 s", "90-180": "90 s to 3 min", "180-600": "3 to 10 min"}
LAYOUT_TXT = {"cheia": "TELA CHEIA vertical (BRIEF-CORTE 'Gravação em pé / tela cheia')",
              "dividida": "TELA DIVIDIDA (motion em cima, vídeo embaixo)",
              "encaixar": "ENCAIXAR (video fitted in the middle at full width, same video blurred and darkened filling the 9:16 background)"}


# nível de edição escolhido no Configurar (tanpz 19/11: a maioria dos cortes é simples; tempo depende do nível)
NIVEIS = {
    "simples": ("SIMPLES (fast, the basic edit): EDL with retakes, fillers and pauses removed + the captions he chose. "
                "build.py has ONE scene for the whole video, scenes([(\"s1\", 0, None)]), holding only the hook headline (head) "
                "in the top panel (Dividida) or nothing (Tela cheia / Encaixar). NO cards, chats, counters, takeovers, zoom_on, confetti "
                "or b-roll. Checks: sync, silencedetect, the whisper filler prompt and one look at sheet.jpg; skip the 5 to 6 frame review. "
                "This level overrides every scene/takeover/zoom rule of the brief."),
    "medio": ("MÉDIO (transitions): EDL clean like SIMPLES, plus 3 to 5 scenes, each ONLY a short headline (2 to 4 words, one keyword True) "
              "that changes with the idea; build() adds the transitions and their SFX between scenes. 1 or 2 takeovers on the strongest "
              "punchlines and zoom_on on 2 or 3 keywords. NO UI cards, chats, counters, confetti or b-roll. Overrides the brief's scene rules."),
    "completo": "COMPLETO (full edit): follow the whole brief: every scene literally shows what he says (cards, chat, counters, b-roll), "
                "3 to 5 takeovers, zoom_on, confetti and SFX.",
}


def nivel(j):
    n = (j.e.get("config") or {}).get("nivel")
    return n if n in NIVEIS else "completo"  # jobs antigos eram todos completos


def trilha_txt(c):
    """trilha que ele escolheu no Configurar. Todo vídeo sai com trilha + efeitos, salvo 'nenhuma'."""
    if c.get("trilhaEstilo") == "nenhuma" or c.get("musica") is False:
        return "NO music bed (he will add trending Instagram audio himself); keep the sound effects."
    t = c.get("trilha")
    if not t:
        return ("mandatory music bed + SFX; pick the best style from estilos/musicas/musicas.json "
                "(see estilos/musicas/MUSICAS.md) for this video's mood.")
    txt = (f"mandatory music bed + SFX in the style '{t.get('estilo')}' (~{t.get('bpm')} BPM, drop around {t.get('drop_s')}s). "
           f"Music prompt for generation: {str(t.get('prompt_trilha') or '').rstrip('.')}.")
    f = t.get("faixa")
    if f:
        txt += (f" Reference track he picked (match its mood, tempo and drop; do NOT use the copyrighted audio itself): "
                f"{f.get('titulo')} by {f.get('artista')}.")
    return txt


def config_txt(j):
    """bloco que entra nos prompts. Sem config = regras de sempre."""
    c = j.e.get("config")
    if not c:
        return "none (use the standard rules)"
    leg = c.get("legendaEstilo")
    linhas = [
        f"- EDIT LEVEL: {NIVEIS[nivel(j)]}",
        f"- Length of each cut: {DUR_TXT.get(c.get('duracao'), DUR_TXT['auto'])}.",
        f"- What to highlight (his words, top priority when choosing moments): {c.get('destaque') or 'nothing specific'}.",
        f"- Video type: {c.get('genero') or 'auto'}.",
        f"- Layouts he picked: {', '.join(LAYOUT_TXT.get(x, x) for x in c.get('layouts') or ['dividida'])}.",
        f"- Caption template: {json.dumps(leg, ensure_ascii=False) if leg else c.get('legenda', 'maquina')} "
        "(font, weight, case, size in px on 1080x1920, colors, outline, shadow, animation, words per screen, vertical position %; follow it exactly).",
        "- Opening: " + {"titulo": "title on screen in the first seconds", "animado": "animated hook headline",
                         "nenhum": "no title, start straight on the speech"}.get(c.get("gancho"), "title on screen in the first seconds") + ".",
        f"- Remove filler words and long pauses: {'yes' if c.get('limpar', True) else 'no'}.",
        f"- Highlight key words in the caption: {'yes' if c.get('palavraChave', True) else 'no'}.",
        f"- Emojis in the caption: {'yes' if c.get('emojis') else 'no'}.",
        f"- Automatic zoom / reframe on emphasis: {'yes' if c.get('zoom', True) else 'no'}.",
        "- Soundtrack: " + trilha_txt(c),
    ]
    return "\n".join(linhas)


# ---------- etapas ----------

def novo(bruto):
    bruto = Path(bruto).expanduser().resolve()
    nome = f"{datetime.date.today()}-{bruto.stem}"
    p = JOBS / nome
    p.mkdir(parents=True, exist_ok=True)
    j = Job(p)
    if not j.e:
        j.e = {"bruto": str(bruto), "duracao": round(dur(bruto), 2), "etapa": "transcrever", "cortes": []}
        sc = bruto.parent / f"{bruto.name}.config.json"  # escolhas da tela Configurar
        if sc.exists():
            j.e["config"] = json.loads(sc.read_text())
        j.salvar()
    j.log(f"job {nome} ({j.e['duracao'] / 60:.1f} min)")
    return j


def transcrever(j):
    t = j.p / "transcricao"
    t.mkdir(exist_ok=True)
    if not (t / "texto.txt").exists():
        j.log("transcrevendo o vídeo inteiro")
        sh(["ffmpeg", "-y", "-v", "error", "-i", j.e["bruto"], "-vn", "-ac", "1", "-ar", "16000", str(t / "audio.wav")])
        sh(["whisper-cli", "-m", str(WHISPER), "-l", "pt", "-t", "8", "-oj", "-f", str(t / "audio.wav"), "-of", str(t / "wh")])
        segs = json.loads((t / "wh.json").read_text())["transcription"]
        linhas = []
        for s in segs:
            a = s["offsets"]["from"] / 1000
            b = s["offsets"]["to"] / 1000
            linhas.append(f"[{a:7.2f}-{b:7.2f}] {s['text'].strip()}")
        (t / "texto.txt").write_text("\n".join(linhas))
    j.e["etapa"] = "planejar"
    j.salvar()


def planejar(j):
    if not (j.p / "cortes.json").exists():
        j.log("planejando os cortes")
        claude(prompt("planejar", job=j.p, duracao=j.e["duracao"], config=config_txt(j)), j.p, modelos(j)[0], "log_planejar.txt")
    plano = json.loads((j.p / "cortes.json").read_text())
    # tanpz escolhe no painel quais cortes editar (18/11: "não precisa editar todos")
    j.e["cortes"] = [{**c, "status": c.get("status", "planejado")} for c in plano]
    j.e["etapa"] = "escolher"
    j.salvar()
    j.log(f"{len(plano)} cortes planejados")
    legendas(j)
    viral(j)
    avisar(f"Esse vídeo rende {len(plano)} cortes. Escolha quantos quer fazer")


def legendas(j):
    """legenda + hashtags de cada corte (pro post). Roda uma vez por job."""
    f = j.p / "legendas.json"
    if not f.exists():
        j.log("escrevendo legendas")
        try:
            claude(prompt("legendas", job=j.p), j.p, MODELO_CORTE, "log_legendas.txt")
        except Exception as ex:
            return j.log(f"legendas: ERRO {ex}")
    try:
        leg = {int(k): v for k, v in json.loads(f.read_text()).items()}
    except Exception as ex:
        return j.log(f"legendas.json inválido: {ex}")
    for c in j.e["cortes"]:
        if int(c["n"]) in leg:
            c.update(leg[int(c["n"])])
            j.salvar(c["n"])


def viral(j):
    """nota de viral (0-99) de cada corte, estilo OpusClip: gancho, ritmo, valor, tendência e o porquê. Roda uma vez por job."""
    f = j.p / "viral.json"
    if not f.exists():
        j.log("dando nota de viral")
        try:
            claude(prompt("viral", job=j.p), j.p, MODELO_CORTE, "log_viral.txt")
        except Exception as ex:
            return j.log(f"viral: ERRO {ex}")
    try:
        v = {int(k): x for k, x in json.loads(f.read_text()).items()}
    except Exception as ex:
        return j.log(f"viral.json inválido: {ex}")
    for c in j.e["cortes"]:
        if int(c["n"]) in v:
            c["viral"] = v[int(c["n"])]
            j.salvar(c["n"])


def slug(c):
    return f"{int(c['n']):02d}-{c['slug']}"


def prep(j, c):
    d = j.p / "cortes" / slug(c)
    d.mkdir(parents=True, exist_ok=True)
    # prep interrompido no meio deixa ilhas.txt sem offset.txt: refaz
    if not (d / "offset.txt").exists() or not (d / "ilhas.txt").exists() or not (d / "ilhas.txt").read_text().strip():
        a = max(0, c["inicio"] - 2)
        b = min(j.e["duracao"], c["fim"] + 2)
        sh(["bash", str(TOOLS / "organico/prep.sh"), j.e["bruto"], f"{a:.2f}", f"{b:.2f}", str(d)])
        (d / "offset.txt").write_text(f"{a:.2f}")
    return d


def fase(j, c, f):
    """etapa fina do corte, pro painel mostrar ao vivo"""
    c["fase"] = f
    j.salvar(c["n"])


def avisar(msg):
    plataforma.notificar(msg)


def cortar_um(j, c, nota=None):
    c["desde"] = time.time()
    fase(j, c, "preparando")
    d = prep(j, c)
    (d / "nivel.txt").write_text(nivel(j))  # render.sh usa o render rápido (simples.py) no nível Simples
    nome = slug(c)
    out = j.p / "prontos"
    vars_ = dict(pasta=d, nome=nome, bruto=j.e["bruto"], offset=(d / "offset.txt").read_text(),
                 inicio=c["inicio"], fim=c["fim"], titulo=c["titulo"], gancho=c.get("gancho", ""),
                 tema_ia="sim" if c.get("tema_ia") else "não", borrar=c.get("borrar", "") or "nada",
                 rotulo=c.get("rotulo", "") or "nenhum", out=out, nota=nota or "",
                 mostrar=json.dumps(c.get("mostrar") or [], ensure_ascii=False) if c.get("mostrar") else "nenhum (still check the transcript gaps against the monitor)",
                 formato=LAYOUT_TXT.get(c.get("formato") or ((j.e.get("config") or {}).get("layouts") or ["dividida"])[0], LAYOUT_TXT["dividida"]),
                 config=config_txt(j),
                 ordens="; ".join(o for x in j.e["cortes"] for o in (x.get("ordens") or []) if isinstance(o, str)) or "nenhuma")
    fase(j, c, "editando")
    # simples não precisa do modelo caro: só EDL + legenda
    claude(prompt("refazer" if nota else "cortar", **vars_), d, "sonnet" if nivel(j) == "simples" else modelos(j)[1],
           f"log_{'refazer' if nota else 'cortar'}_{int(time.time())}.txt")
    fase(j, c, "checando")
    v = verificar(d / "edit/final.mp4", d / "edit/voice.wav")
    if not v["ok"]:
        fase(j, c, "corrigindo")
        claude(prompt("corrigir", **vars_, problemas="\n".join(v["problemas"])), d, modelos(j)[1],
               f"log_corrigir_{int(time.time())}.txt")
        v = verificar(d / "edit/final.mp4", d / "edit/voice.wav")
    c.pop("fase", None)
    c["nivel"], c["levou"] = nivel(j), round(time.time() - c["desde"])  # alimenta a estimativa de tempo do Configurar
    avisar(f"Corte {slug(c)} {'pronto' if v['ok'] else 'precisa de conferência'}")
    return v


def verificar(final, voz):
    sys.path.insert(0, str(AQUI))
    from verificar import checar
    return checar(final, voz)


def cortar(j, so=None):
    # "cortando" também entra: se o processo morreu no meio, o corte ficaria preso pra sempre
    alvo = [c for c in j.e["cortes"] if (so and int(c["n"]) in so) or (not so and c["status"] in ("pendente", "erro", "cortando"))]
    if not alvo:
        return

    def run(c):
        try:
            final = j.p / "prontos" / f"{slug(c)}.mp4"
            if c["status"] != "pendente" and final.exists() and not so:
                v = verificar(final, j.p / "cortes" / slug(c) / "edit/voice.wav")  # já renderizado antes de cair
            else:
                c["status"] = "cortando"
                j.salvar(c["n"])
                j.log(f"corte {slug(c)}: começou")
                v = cortar_um(j, c)
            c["status"] = "pronto" if v["ok"] else "revisar"
            c["verificacao"] = v
            j.log(f"corte {slug(c)}: {c['status']} ({v.get('duracao', 0):.1f}s) {'; '.join(v['problemas'])}")
        except Exception as ex:
            c["status"] = "erro"
            c["erro"] = str(ex)[-500:]
            j.log(f"corte {slug(c)}: ERRO {ex}")
        j.salvar(c["n"])

    with cf.ThreadPoolExecutor(PARALELO) as ex:
        list(ex.map(run, alvo))


def rodar(j):
    if j.e["etapa"] == "transcrever":
        transcrever(j)
    if j.e["etapa"] == "planejar":
        planejar(j)
    if j.e["etapa"] == "cortar":  # jobs antigos
        cortar(j)
    j.log(f"etapa: {j.e['etapa']}")
    status(j)


def refazer(j, n, nota):
    c = next(c for c in j.e["cortes"] if int(c["n"]) == int(n))
    c["status"] = "cortando"
    if nota:
        c.setdefault("notas", []).append(nota)
        aprender(nota, f"corte {slug(c)}")
    j.salvar(c["n"])
    j.log(f"refazendo {slug(c)}: {nota}")
    v = cortar_um(j, c, nota)
    c["status"] = "pronto" if v["ok"] else "revisar"
    c["verificacao"] = v
    j.salvar(c["n"])
    status(j)


def ajustar(j, n):
    """editor da Forja: refaz o corte com o ajustes.json (palavras apagadas, legenda, destaque, titulo) sem passar pelo Claude."""
    c = next(c for c in j.e["cortes"] if int(c["n"]) == int(n))
    d = j.p / "cortes" / slug(c)
    antes = c["status"]
    c["status"], c["fase"], c["desde"] = "cortando", "aplicando ajustes", time.time()
    c.pop("erro_ajuste", None)
    j.salvar(c["n"])
    j.log(f"ajustando {slug(c)} no editor")
    env = {**os.environ, "PATH": plataforma.junta_path(AQUI / "bin"), "FORJA_PY": sys.executable,
           "FORJA_VOZ_PY": str(plataforma.venv_python(RAIZ / "tools/.venv-voz"))}
    r = subprocess.run([str(AQUI / "bin/render-corte"), str(d), slug(c), str(j.p / "prontos")], capture_output=True, text=True, env=env, timeout=40 * 60)
    (d / f"log_ajustar_{int(time.time())}.txt").write_text(r.stdout + "\n--- stderr ---\n" + r.stderr)
    c.pop("fase", None)
    if r.returncode:  # o vídeo anterior continua em prontos: só avisa
        c["status"], c["erro_ajuste"] = antes, (r.stderr or r.stdout)[-300:]
        j.log(f"ajuste {slug(c)}: ERRO")
    else:
        v = verificar(d / "edit/final.mp4", d / "edit/voice.wav")
        c["status"], c["verificacao"] = ("pronto" if v["ok"] else "revisar"), v
        j.log(f"ajuste {slug(c)}: {c['status']} em {round(time.time() - c['desde'])}s")
    j.salvar(c["n"])
    avisar(f"Corte {slug(c)} {'ajustado' if not r.returncode else 'não deu pra ajustar'}")


def status(j=None):
    for p in ([j.p] if j else sorted(JOBS.glob("*"))):
        e = Job(p).e
        print(f"\n{p.name}  etapa={e.get('etapa')}")
        for c in e.get("cortes", []):
            print(f"  {slug(c):40s} {c['status']:9s} {c['titulo']}")


def achar_job(x):
    p = Path(x)
    return Job(p if p.is_dir() else JOBS / x)


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
    elif a[0] == "novo":
        rodar(novo(a[1]))
    elif a[0] == "rodar":
        rodar(achar_job(a[1]))
    elif a[0] == "editar":
        j = achar_job(a[1])
        fmt = next((x.split("=", 1)[1] for x in a[2:] if x.startswith("--formato=")), None)
        so = [int(x) for x in a[2:] if not x.startswith("--")]
        if fmt:  # formato escolhido na hora de gerar (dividida | cheia)
            for c in j.e["cortes"]:
                if c["n"] in so:
                    c["formato"] = fmt
            j.salvar()
        cortar(j, so=so)
        status(j)
    elif a[0] == "refazer":
        refazer(achar_job(a[1]), a[2], a[3])
    elif a[0] == "ajustar":
        ajustar(achar_job(a[1]), a[2])
    elif a[0] == "viral":
        viral(achar_job(a[1]))
    elif a[0] == "legendas":
        legendas(achar_job(a[1]))
    elif a[0] == "status":
        status(achar_job(a[1]) if len(a) > 1 else None)
