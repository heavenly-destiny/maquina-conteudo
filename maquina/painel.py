#!/usr/bin/env python3
"""Painel local da Máquina: http://127.0.0.1:4747
Lista vídeos crus novos, jobs e cortes; dispara job, refazer e envio pro WhatsApp."""
import json, os, re, subprocess, sys, threading, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent  # pasta do repositório
JOBS = RAIZ / "jobs"
DOWN = Path.home() / "Downloads"
ENTRADA = RAIZ / "entrada"  # vídeos arrastados pro painel
CACHE = AQUI / ".duracoes.json"
PORTA = int(os.environ.get("PORTA", 4747))
GER = RAIZ / "geracoes"
INS = RAIZ / "inspiracoes"
POSTADOS = RAIZ / "postados.json"
HUB = RAIZ / "estilos/hub.json"
TIPOS = ("roteiro", "animado", "criativo", "modelar")
REDES = ("instagram", "tiktok", "youtube", "outro")
DIST = AQUI / "app/dist"  # app novo (React); o painel antigo fica em /v2
SOM = AQUI / "som/intro"
TIPO_ARQ = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
            ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png", ".mp3": "audio/mpeg", ".json": "application/json; charset=utf-8",
            ".md": "text/markdown; charset=utf-8", ".mp4": "video/mp4"}


def duracao(p):
    try:
        c = json.loads(CACHE.read_text())
    except Exception:
        c = {}
    k = f"{p}:{p.stat().st_mtime}"
    if k not in c:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
        c[k] = float(r.stdout or 0)
        CACHE.write_text(json.dumps(c))
    return c[k]


def brutos():
    feitos = {json.loads((j / "estado.json").read_text()).get("bruto") for j in JOBS.glob("*") if (j / "estado.json").exists()}
    out = []
    achados = [*DOWN.glob("*.MOV"), *DOWN.glob("*.mov"), *ENTRADA.glob("*")]
    for p in sorted({*achados}, key=lambda x: -x.stat().st_mtime)[:30]:
        if p.suffix.lower() not in (".mov", ".mp4", ".m4v"):
            continue
        if p.parent == DOWN and p.stat().st_size < 200 * 2**20:  # ponytail: vídeo de mesa longo é grande; clipe curto de celular fica de fora
            continue
        d = duracao(p)
        if d >= 120:
            out.append({"path": str(p), "nome": p.name, "min": round(d / 60, 1), "feito": str(p) in feitos,
                        "data": p.stat().st_mtime})
    return out


def capa(v):
    """frame do segundo 1 em jpg leve, pra grade não carregar 17 vídeos"""
    j = v.with_suffix(".jpg")
    if not j.exists() or j.stat().st_mtime < v.stat().st_mtime:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "1", "-i", str(v), "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "4", str(j)])
    return f"/arquivo?p={j}&v={int(j.stat().st_mtime)}" if j.exists() else None


def quadro(j, bruto, c):
    """capa do corte ainda não editado: um frame do vídeo cru no meio do trecho"""
    if not bruto or not Path(bruto).exists():
        return None
    f = j / "capas" / f"{int(c['n']):02d}.jpg"
    if not f.exists():
        f.parent.mkdir(exist_ok=True)
        t = c["inicio"] + min(8, (c["fim"] - c["inicio"]) / 2)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", bruto, "-frames:v", "1", "-vf", "scale=-2:360", "-q:v", "4", str(f)])
    return f"/arquivo?p={f}&v={int(f.stat().st_mtime)}" if f.exists() else None


def trecho(linhas, a, b):
    out = []
    for l in linhas:
        m = re.match(r"\[\s*([\d.]+)-\s*([\d.]+)\]\s*(.*)", l)
        if m and float(m[2]) > a and float(m[1]) < b:
            out.append(m[3])
    return " ".join(out)


GENEROS = {"podcast": "Podcast", "aula": "Técnico", "venda": "Venda", "motivacional": "Motivacional", "lifestyle": "Lifestyle"}


def jobs():
    out = []
    for j in sorted(JOBS.glob("*"), key=lambda x: -x.stat().st_mtime):
        f = j / "estado.json"
        if not f.exists():
            continue
        e = json.loads(f.read_text())
        log = (j / "log.txt").read_text().splitlines()[-1:] if (j / "log.txt").exists() else []
        tx = (j / "transcricao/texto.txt").read_text().splitlines() if (j / "transcricao/texto.txt").exists() else []
        for c in e.get("cortes", []):
            nome = f"{int(c['n']):02d}-{c['slug']}"
            v = j / "prontos" / f"{nome}.mp4"
            c["video"] = f"/arquivo?p={v}&v={int(v.stat().st_mtime)}" if v.exists() else None
            c["capa"] = capa(v) if v.exists() else quadro(j, e.get("bruto"), c)
            c["nome"] = nome
            c["trecho"] = trecho(tx, c["inicio"], c["fim"])
            c["dur"] = c.get("verificacao", {}).get("duracao") or (duracao(v) if v.exists() else None)
            c.pop("verificacao", None) if c.get("verificacao", {}).get("ok") else None
        cat = lerj(j / "categoria.json", {}).get("categoria") or GENEROS.get(((e.get("config") or {}).get("genero") or "auto")) or "Sem categoria"
        out.append({"id": j.name, "categoria": cat, "etapa": e.get("etapa"), "duracao": e.get("duracao"), "cortes": e.get("cortes", []),
                    "ultimo": log[0] if log else "", "bruto": Path(e.get("bruto", "")).name})
    return out


TRAVA = threading.Lock()


def mexer(job, n, **campos):
    """muda campos de um corte direto no estado (descartar, voltar)"""
    with TRAVA:
        f = JOBS / job / "estado.json"
        e = json.loads(f.read_text())
        for c in e["cortes"]:
            if int(c["n"]) == int(n):
                c.update(campos)
        tmp = f.with_suffix(".painel.tmp")
        tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
        tmp.replace(f)


def lixeira(*arqs):
    """nunca apaga de vez: manda pra Lixeira do macOS (sufixo de hora se o nome já existe)"""
    lx = Path.home() / ".Trash"
    for a in arqs:
        a = Path(a)
        if not (a.exists() or a.is_symlink()):
            continue
        dest = lx / a.name
        if dest.exists():
            dest = lx / f"{a.stem}-{time.strftime('%H%M%S')}{a.suffix}"
        a.rename(dest)


JOB_OK = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$")


def _job_dir(nome):
    nome = str(nome or "")
    if not JOB_OK.match(nome) or ".." in nome:
        return None, "nome de vídeo inválido"
    p = JOBS / nome
    if not (p / "estado.json").exists():
        return None, "vídeo não existe"
    return p, None


def _ocupado(e):
    return e.get("etapa") in ("transcrever", "planejar", "cortar") or any(c.get("status") == "editando" for c in e.get("cortes", []))


def marcar_job(job, categoria):
    p, er = _job_dir(job)
    if er:
        return er, 404 if "existe" in er else 400
    cat = " ".join(str(categoria or "").split())[:30]
    with TRAVA:
        escrever(p / "categoria.json", {"categoria": cat})
    return None, 200


def marcar_geracao(id_, nicho, validacao):
    nome = Path(str(id_ or "")).name
    f = GER / nome / "pedido.json"
    if not nome or not f.exists():
        return "criativo não existe", 404
    if validacao is not None and validacao not in ("teste", "validado"):
        return "status inválido", 400
    with TRAVA:
        ped = lerj(f, {})
        if nicho is not None:
            ped["nicho"] = " ".join(str(nicho).split())[:30]
        if validacao is not None:
            ped["validacao"] = validacao
        escrever(f, ped)
    return None, 200


def excluir_corte(job, n):
    p, er = _job_dir(job)
    if er:
        return er, 404 if "existe" in er else 400
    with TRAVA:
        f = p / "estado.json"
        e = json.loads(f.read_text())
        try:
            n = int(n)
        except (TypeError, ValueError):
            return "corte inválido", 400
        c = next((c for c in e.get("cortes", []) if int(c["n"]) == n), None)
        if not c:
            return "corte não existe", 404
        if c.get("status") == "editando":
            return "esse corte está sendo editado agora", 409
        nome = f"{n:02d}-{c['slug']}"
        lixeira(*(p / "prontos").glob(f"{nome}.*"), *(p / "capas").glob(f"{nome}.*"))
        e["cortes"] = [x for x in e["cortes"] if int(x["n"]) != n]
        tmp = f.with_suffix(".painel.tmp")
        tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
        tmp.replace(f)
    return None, 200


def excluir_job(job):
    p, er = _job_dir(job)
    if er:
        return er, 404 if "existe" in er else 400
    with TRAVA:
        if _ocupado(json.loads((p / "estado.json").read_text())):
            return "esse vídeo está sendo processado agora", 409
        lixeira(p)  # o bruto (Downloads) não é tocado
    return None, 200


def disparar(args):
    subprocess.Popen([sys.executable, str(AQUI / "maquina.py"), *args], cwd=AQUI,
                     stdout=open(AQUI / "painel_jobs.log", "a"), stderr=subprocess.STDOUT, start_new_session=True)


def salvar_config(video, config):
    """configurações escolhidas na tela Configurar viajam junto do vídeo (maquina.py novo() lê)."""
    if not config:
        return
    try:
        c = json.loads(config) if isinstance(config, str) else config
        (video.parent / f"{video.name}.config.json").write_text(json.dumps(c, ensure_ascii=False))
    except (ValueError, TypeError):
        pass


def baixar_link(url, config):
    """link do YouTube/Instagram/TikTok: baixa em H.264 pra ENTRADA e cria o job igual ao upload."""
    ENTRADA.mkdir(exist_ok=True)
    r = subprocess.run(["yt-dlp", "--no-playlist", "-f", "bv*[vcodec^=avc1][height<=1920]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
                        "--merge-output-format", "mp4", "-o", str(ENTRADA / "link-%(id)s.%(ext)s"),
                        "--print", "after_move:filepath", url], capture_output=True, text=True, timeout=1800)
    linhas = [x for x in r.stdout.splitlines() if x.strip()]
    if r.returncode or not linhas:
        open(AQUI / "painel_jobs.log", "a").write(f"[link] falhou {url}: {r.stderr[-500:]}\n")
        return
    dest = Path(linhas[-1])
    salvar_config(dest, config)
    disparar(["novo", str(dest)])


def lerj(f, padrao):
    try:
        return json.loads(Path(f).read_text())
    except Exception:
        return padrao


def url_arq(f):
    return f"/arquivo?p={f}&v={int(f.stat().st_mtime)}" if f.exists() else None


def pastas(base):
    """pedido + estado + id de cada pasta, mais nova primeiro"""
    out = []
    for d in sorted(base.glob("*"), key=lambda x: -x.stat().st_mtime) if base.exists() else []:
        if (d / "pedido.json").exists():
            out.append((d, {**lerj(d / "pedido.json", {}), **lerj(d / "estado.json", {}), "id": d.name}))
    return out


def geracoes():
    out = []
    for d, g in pastas(GER):
        g["video"], g["capa"] = url_arq(d / "final.mp4"), url_arq(d / "capa.jpg")
        g["roteiro_txt"] = (d / "roteiro.md").read_text()[:20000] if (d / "roteiro.md").exists() else None
        g["roteiro_json"] = lerj(d / "roteiro.json", None)
        out.append(g)
    return out


def inspiracoes():
    out = []
    for d, g in pastas(INS):
        i = lerj(d / "info.json", {})
        g["decupagem"] = lerj(d / "decupagem.json", None)
        g["video"], g["capa"] = url_arq(d / "video.mp4"), url_arq(d / "capa.jpg")
        g["info"] = {"titulo": i.get("title"), "autor": i.get("uploader") or i.get("channel"), "views": i.get("view_count"),
                     "duracao": i.get("duration")}
        out.append(g)
    return out


def hoje():
    ini = time.mktime(time.localtime()[:3] + (0, 0, 0, 0, 0, -1))
    prontos = [*JOBS.glob("*/prontos/*.mp4"), *GER.glob("*/final.mp4")]
    dia = time.strftime("%Y-%m-%d")
    return {"feitos": sum(f.stat().st_mtime >= ini for f in prontos), "meta": 10,
            "postados": sum(str(x.get("quando", ""))[:10] == dia for x in lerj(POSTADOS, []))}


BIB = {"mtime": 0, "lista": []}


def biblioteca():
    """hub.json achatado numa lista só. Cache por mtime (o arquivo tem dezenas de MB de imagem base64)."""
    mt = HUB.stat().st_mtime if HUB.exists() else 0
    if BIB["mtime"] != mt:
        hub = lerj(HUB, {})
        def item(fonte, x, i):
            g = lambda *ks: next((x[k] for k in ks if x.get(k) not in (None, "")), None)
            return {"id": f"{fonte}:{g('id', 'slug', 'name') or str(g('url') or i).rstrip('/').split('/')[-1]}", "fonte": fonte,
                    "titulo": g("titulo", "title", "titulo_pt", "hook") or g("name") or g("autor", "adv"),
                    "autor": g("autor", "canal", "handle", "adv"), "url": g("url", "xpost"), "views": g("views"),
                    "formato": g("formato") or (f"{x['w']}x{x['h']}" if x.get("w") else g("dim")),
                    "duracao": g("duracao_s", "dur"),
                    "resumo": g("resumo", "por_que_referencia", "por_que", "porque", "o_que_faz", "desc", "estrutura"),
                    "tecnica": g("tecnica", "tecnica_chave", "estilo_edicao", "estilo", "tipo", "uso", "aplicar"), "img": x.get("img"),
                    **({"prompt": x.get("prompt"), "encaixe": x.get("encaixe"), "relevancia": x.get("relevancia"), "generico": x.get("generico")} if x.get("prompt") else {})}
        lista = [item(f, x, i) for f in ("meus", "motion", "virais", "ads", "hf", "acervo", "formatos", "musicas") for i, x in enumerate(hub.get(f, []))]
        locais = {v.stem: v for v in (HUB.parent).glob("*/videos/*.mp4")} | {v.stem: v for v in (HUB.parent / "previas").glob("*.mp4")} | {v.stem: v for v in (HUB.parent / "formatos").glob("*/videos/*.mp4")}
        for k, (it, x) in enumerate(zip(lista, (x for f in ("meus", "motion", "virais", "ads", "hf", "acervo", "formatos", "musicas") for x in hub.get(f, [])))):
            yt = re.search(r"(?:v=|shorts/|youtu\.be/)([\w-]{11})", str(it["url"] or ""))
            chave = yt[1] if yt else it["id"].split(":", 1)[1]
            it["arq"] = str(locais[chave]) if chave in locais else None  # prévia no hover: arquivo local ou mp4 remoto
            it["video"] = f"/api/bib-vid?i={k}" if it["arq"] else (x.get("video") or None)
        BIB.update(mtime=mt, lista=lista)
    return BIB["lista"]


# ---- músicas: acervo (estilos/musicas/musicas.json), busca Deezer/iTunes, atualização diária em segundo plano ----
MUS = HUB.parent / "musicas"
MUS_J = MUS / "musicas.json"
MUS_ST = {"rodando": False}
BUSCA_CACHE = {}
MUS_LOCK = threading.Lock()


def _http(url, t=10):
    import urllib.request
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=t).read()


def atualizar_musicas():
    if MUS_ST["rodando"] or not (MUS / "atualizar.py").exists():
        return False
    MUS_ST["rodando"] = True
    def run():
        try:
            subprocess.run([sys.executable, str(MUS / "atualizar.py")], cwd=MUS, timeout=900, stdout=open(AQUI / "painel_jobs.log", "a"), stderr=subprocess.STDOUT)
        finally:
            MUS_ST["rodando"] = False
    threading.Thread(target=run, daemon=True).start()
    return True


def musicas():
    d = lerj(MUS_J, {"musicas": [], "estilos": [], "atualizado_em": None})
    try:
        idade = time.time() - time.mktime(time.strptime(d["atualizado_em"], "%Y-%m-%dT%H:%M:%S"))
    except Exception:
        idade = 1e9
    if idade > 86400:  # velho: atualiza em segundo plano e segue servindo a lista antiga
        atualizar_musicas()
    L = [{**{k: v for k, v in m.items() if k not in ("score",)}, "preview": f"/api/musica-prev?id={m['id']}" if m.get("preview") and (MUS / m["preview"]).exists() else None} for m in d.get("musicas", [])]
    return {"atualizado_em": d.get("atualizado_em"), "atualizando": MUS_ST["rodando"], "estilos": d.get("estilos", []), "musicas": L}


def buscar_musica(q):
    q = re.sub(r"[^\w\s'&.\-]", " ", q, flags=re.U).strip()[:80]
    if len(q) < 2:
        return []
    hit = BUSCA_CACHE.get(q.lower())
    if hit and time.time() - hit[0] < 300:
        return hit[1]
    from urllib.parse import quote
    out = []
    try:
        for r in json.loads(_http("https://api.deezer.com/search?limit=12&q=" + quote(q)))["data"]:
            out.append({"deezer_id": r["id"], "titulo": r["title_short"], "artista": r["artist"]["name"], "capa": r["album"].get("cover_medium"), "preview": r.get("preview"), "link": r["link"]})
    except Exception:
        pass
    if not out:
        try:
            for r in json.loads(_http("https://itunes.apple.com/search?media=music&country=BR&limit=12&term=" + quote(q)))["results"]:
                out.append({"deezer_id": None, "titulo": r.get("trackName"), "artista": r.get("artistName"), "capa": (r.get("artworkUrl100") or "").replace("100x100", "300x300"), "preview": r.get("previewUrl"), "link": r.get("trackViewUrl")})
        except Exception:
            pass
    for r in out:
        r["spotify"] = "https://open.spotify.com/search/" + quote(f"{r['titulo']} {r['artista']}")
    BUSCA_CACHE[q.lower()] = (time.time(), out)
    return out


def usar_musica(d):
    """Adiciona uma faixa achada na busca ao acervo (só metadados + prévia oficial de 30 s)."""
    from urllib.parse import quote
    with MUS_LOCK:
        D = lerj(MUS_J, {"musicas": [], "estilos": []})
        titulo, artista = str(d.get("titulo", ""))[:120], str(d.get("artista", ""))[:120]
        if not titulo:
            return None
        for m in D["musicas"]:
            if m["titulo"].lower() == titulo.lower() and m["artista"].lower() == artista.lower():
                return m
        estilo = d.get("estilo") if d.get("estilo") in {e["id"] for e in D["estilos"]} else "hit-do-momento"
        n = sum(1 for m in D["musicas"] if m["id"].startswith("u")) + 1
        mid = f"u{n:03d}"
        bpm = None
        try:
            if d.get("deezer_id"):
                bpm = int(json.loads(_http(f"https://api.deezer.com/track/{int(d['deezer_id'])}")).get("bpm") or 0) or None
        except Exception:
            pass
        prev = None
        u = str(d.get("preview") or "")
        if re.match(r"https://[\w.\-]+\.(dzcdn\.net|mzstatic\.com)/", u):  # só prévia oficial desses hosts
            try:
                (MUS / "previews").mkdir(exist_ok=True)
                (MUS / "previews" / f"{mid}.mp3").write_bytes(_http(u, 20))
                prev = f"previews/{mid}.mp3"
            except Exception:
                pass
        q = quote(f"{artista} {titulo}")
        m = dict(id=mid, titulo=titulo, artista=artista, plataforma_origem="busca no painel", links={"instagram_audio": None, "tiktok": "https://www.tiktok.com/search?q=" + q, "spotify": "https://open.spotify.com/search/" + q, "youtube": "https://www.youtube.com/results?search_query=" + q, "deezer": d.get("link")},
                 por_que_viral="Adicionada por você pela busca.", formato_de_uso="", estilo_de_video=estilo, estilos=[estilo], mood="a definir", energia=3, bpm=bpm, bpm_fonte="deezer" if bpm else None,
                 momento_do_drop_s=None, drop_fonte=None, nichos_que_funcionam=[], uso_brasil="br", tendencia="estável", data_coleta=time.strftime("%Y-%m-%d"), fonte="busca Deezer/iTunes", origem="usuario",
                 posicoes={}, usado_por=[], rank=None, preview=prev, capa=d.get("capa") if str(d.get("capa", "")).startswith("https://") else None)
        D["musicas"].append(m)
        for e in D["estilos"]:
            if e["id"] == estilo:
                e["faixas"] = (e["faixas"] + [mid])[-12:]
        escrever(MUS_J, D)
        return m


def novo_id(base, sufixo):
    base.mkdir(exist_ok=True)
    n = f"{time.strftime('%Y%m%d-%H%M%S')}-{sufixo}"
    (base / n).mkdir()
    return n, base / n


def disparar_script(script, id_):
    subprocess.Popen([sys.executable, str(AQUI / script), id_], cwd=AQUI,
                     stdout=open(AQUI / "painel_jobs.log", "a"), stderr=subprocess.STDOUT, start_new_session=True)


def escrever(f, obj):
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=1))
    tmp.replace(f)


ENVIO = {"rodando": False, "msg": ""}


def enviar(job, ns):
    def run():
        ENVIO.update(rodando=True, msg="enviando…")
        try:
            sys.path.insert(0, str(AQUI))
            import whatsapp
            j = JOBS / job
            e = json.loads((j / "estado.json").read_text())
            arqs = [j / "prontos" / f"{int(c['n']):02d}-{c['slug']}.mp4" for c in e["cortes"] if int(c["n"]) in ns]
            whatsapp.enviar(arqs)
            e = json.loads((j / "estado.json").read_text())
            for c in e["cortes"]:
                if int(c["n"]) in ns:
                    c["status"] = "enviado"
            (j / "estado.json").write_text(json.dumps(e, ensure_ascii=False, indent=1))
            ENVIO["msg"] = f"{len(arqs)} enviado(s) no WhatsApp"
        except Exception as ex:
            ENVIO["msg"] = f"erro: {ex}"
        ENVIO["rodando"] = False
    threading.Thread(target=run, daemon=True).start()



# ---------- onboarding: cada pessoa conecta o próprio Claude e a própria voz ----------
ENV = AQUI / ".env"
CONFIG = AQUI / "config.json"
FERR = {"claude": "Claude Code", "ffmpeg": "ffmpeg", "node": "Node.js", "whisper-cli": "Whisper", "yt-dlp": "yt-dlp", "hyperframes": "HyperFrames (render)"}
INSTALA = {"claude": "npm install -g @anthropic-ai/claude-code", "ffmpeg": "brew install ffmpeg", "node": "brew install node",
           "whisper-cli": "brew install whisper-cpp", "yt-dlp": "brew install yt-dlp", "hyperframes": "npm install -g hyperframes"}
# o que não é comando: arquivo que precisa existir (instalar.sh resolve tudo de uma vez)
EXTRAS = [("modelo", "Modelo de transcrição", lambda: (Path.home() / ".cache/whisper/ggml-large-v3-turbo.bin").exists()),
          ("voz-local", "Limpeza de voz", lambda: (RAIZ / "tools/.venv-voz/bin/python").exists()),
          ("base", "Base de conhecimento (skills)", lambda: any((Path.home() / ".claude/skills").glob("motion-reel-premium")))]
CHAVES_CLAUDE = ("CLAUDE_CODE_OAUTH_TOKEN", "ANTHROPIC_API_KEY")


def ler_env():
    d = {}
    if ENV.exists():
        for l in ENV.read_text().splitlines():
            if "=" in l and not l.lstrip().startswith("#"):
                k, v = l.split("=", 1)
                d[k.strip()] = v.strip().strip('"\'')
    return d


def salvar_env(**kv):
    d = {**ler_env(), **kv}
    d = {k: v for k, v in d.items() if v}
    ENV.write_text("".join(f"{k}={v}\n" for k, v in d.items()))
    os.chmod(ENV, 0o600)


def testar_claude(env_extra):
    """Roda um prompt mínimo no claude com a conta dada. Nunca devolve a chave."""
    import shutil
    if not shutil.which("claude"):
        return False, "Claude Code não está instalado"
    env = {k: v for k, v in os.environ.items() if k not in CHAVES_CLAUDE}
    env.update(env_extra)
    try:
        r = subprocess.run(["claude", "-p", "Responda só: ok", "--model", "haiku", "--output-format", "text"],
                           capture_output=True, text=True, timeout=120, env=env, cwd=str(AQUI))
    except subprocess.TimeoutExpired:
        return False, "O Claude demorou demais pra responder"
    if r.returncode == 0 and r.stdout.strip():
        return True, ""
    msg = (r.stderr or r.stdout).strip().splitlines()
    return False, (msg[-1] if msg else "Não conectou")[:200]


def testar_eleven(chave):
    import urllib.request, urllib.error
    for url in ("https://api.elevenlabs.io/v1/user/subscription", "https://api.elevenlabs.io/v1/voices?page_size=1"):
        try:
            urllib.request.urlopen(urllib.request.Request(url, headers={"xi-api-key": chave}), timeout=20)
            return True, ""
        except urllib.error.HTTPError as e:
            corpo = e.read().decode(errors="ignore")
            if "invalid_api_key" in corpo or e.code == 401 and "missing_permissions" not in corpo:
                return False, "Chave inválida"
        except Exception as e:  # sem internet etc.
            return False, str(e)[:120]
    return True, ""  # chave válida mas sem permissão de leitura: ainda gera voz


def config_estado():
    import shutil
    env = ler_env()
    cfg = lerj(CONFIG, {})
    tipo = "assinatura" if env.get("CLAUDE_CODE_OAUTH_TOKEN") else "api" if env.get("ANTHROPIC_API_KEY") else ("login" if cfg.get("claude_ok") else None)
    fim = lambda v: ("…" + v[-4:]) if v else ""
    ferr = [{"id": k, "nome": n, "ok": bool(shutil.which(k)), "instalar": INSTALA[k]} for k, n in FERR.items()]
    ferr += [{"id": k, "nome": n, "ok": bool(f()), "instalar": f"{RAIZ}/instalar.sh"} for k, n, f in EXTRAS]
    claude_ok = bool(cfg.get("claude_ok"))
    return {"claude": {"ok": claude_ok, "tipo": tipo, "final": fim(env.get("CLAUDE_CODE_OAUTH_TOKEN") or env.get("ANTHROPIC_API_KEY") or "")},
            "voz": {"ok": bool(env.get("ELEVENLABS_API_KEY")), "final": fim(env.get("ELEVENLABS_API_KEY", ""))},
            "perfil": lerj(RAIZ / "perfil/perfil.json", {}),
            "ferramentas": ferr, "pronto": claude_ok and all(f["ok"] for f in ferr), "concluido": bool(cfg.get("concluido"))}


def config_post(u, d):
    cfg = lerj(CONFIG, {})
    if u == "/api/config/claude":
        tok = str(d.get("token", "")).strip()
        if not tok:  # usar o login que já existe neste Mac
            ok, erro = testar_claude({})
            if ok:
                salvar_env(CLAUDE_CODE_OAUTH_TOKEN="", ANTHROPIC_API_KEY="")
        else:
            if not re.match(r"^sk-ant-[A-Za-z0-9_\-]{20,}$", tok):
                return {"ok": False, "erro": "Esse código não parece do Claude. Ele começa com sk-ant-"}
            var = "ANTHROPIC_API_KEY" if tok.startswith("sk-ant-api") else "CLAUDE_CODE_OAUTH_TOKEN"
            ok, erro = testar_claude({var: tok})
            if ok:
                salvar_env(**{var: tok, ({*CHAVES_CLAUDE} - {var}).pop(): ""})
        if ok:  # tentativa errada não derruba a conexão que já funciona
            cfg["claude_ok"] = True
            escrever(CONFIG, cfg)
        elif "401" in erro or "invalid" in erro.lower():
            erro = "Código inválido ou vencido. Gere outro com claude setup-token"
        return {"ok": ok, "erro": erro}
    if u == "/api/config/voz":
        ch = str(d.get("chave", "")).strip()
        if not re.match(r"^[A-Za-z0-9_\-]{20,}$", ch):
            return {"ok": False, "erro": "Cole a chave inteira da ElevenLabs"}
        ok, erro = testar_eleven(ch)
        if ok:
            salvar_env(ELEVENLABS_API_KEY=ch)
        return {"ok": ok, "erro": erro}
    if u == "/api/config/perfil":
        p = {k: str(d.get(k, "")).strip()[:1500] for k in ("nome", "nicho", "quem", "estilo", "instagram")}
        if not p["nome"]:
            return {"ok": False, "erro": "Coloque seu nome"}
        pasta = RAIZ / "perfil"
        pasta.mkdir(exist_ok=True)
        escrever(pasta / "perfil.json", p)
        (pasta / "PERFIL.md").write_text(
            f"# Perfil de {p['nome']}\n\n- Nicho: {p['nicho'] or '-'}\n- Instagram: {p['instagram'] or '-'}\n"
            f"- Estilo de conteúdo: {p['estilo'] or '-'}\n\n## Quem é\n{p['quem'] or '-'}\n\n"
            "## Gosto e decisões (a máquina acrescenta aqui o que aprender)\n")
        return {"ok": True}
    if u == "/api/config/concluir":
        cfg["concluido"] = True
        escrever(CONFIG, cfg)
        return {"ok": True}
    return None

class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = urlparse(self.path)
        estatico = (DIST / u.path.lstrip("/")).resolve() if u.path != "/" else DIST / "index.html"
        if DIST.exists() and not u.path.startswith(("/api/", "/arquivo", "/bruto", "/v2")) and DIST in estatico.parents and estatico.is_file():
            return self._arquivo(estatico)
        if u.path in ("/", "/v2"):
            b = (AQUI / "painel.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b)
        elif u.path == "/api/config":
            self._json(config_estado())
        elif u.path == "/api/estado":
            self._json({"brutos": brutos(), "jobs": jobs(), "geracoes": geracoes(), "inspiracoes": inspiracoes(), "hoje": hoje(), "postados": lerj(POSTADOS, []), "envio": ENVIO, "agora": time.time()})
        elif u.path == "/api/biblioteca":  # sem a imagem base64: ela vem sob demanda em /api/bib-img
            self._json([{**{k: v for k, v in x.items() if k != "arq"}, "img": f"/api/bib-img?i={i}" if x.get("img") else None} for i, x in enumerate(biblioteca())])
        elif u.path == "/api/musicas":
            self._json(musicas())
        elif u.path == "/api/musicas/busca":
            self._json(buscar_musica(parse_qs(u.query).get("q", [""])[0]))
        elif u.path == "/api/musica-prev":
            f = MUS / "previews" / (re.sub(r"[^\w]", "", parse_qs(u.query).get("id", [""])[0]) + ".mp3")
            self._arquivo(f) if f.is_file() else self._json({"erro": "404"}, 404)
        elif u.path == "/api/bib-vid":
            x = biblioteca()[int(parse_qs(u.query)["i"][0])]
            if not x.get("arq"):
                return self._json({"erro": "404"}, 404)
            self._arquivo(Path(x["arq"]))
        elif u.path == "/api/bib-img":
            import base64
            x = biblioteca()[int(parse_qs(u.query)["i"][0])]
            cab, dados = x["img"].split(",", 1)
            b = base64.b64decode(dados)
            self.send_response(200)
            self.send_header("Content-Type", cab[5:].split(";")[0])
            self.send_header("Cache-Control", "max-age=86400")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
        elif u.path == "/bruto":  # vídeo cru do job, pra ver o trecho antes de editar
            e = json.loads((JOBS / Path(parse_qs(u.query)["job"][0]).name / "estado.json").read_text())
            self._arquivo(Path(e["bruto"]))
        elif u.path == "/arquivo":
            p = Path(parse_qs(u.query)["p"][0]).resolve()
            if RAIZ not in p.parents or not p.is_file():  # só serve arquivo de dentro da pasta da máquina
                return self._json({"erro": "proibido"}, 403)
            self._arquivo(p)
        else:
            self._json({"erro": "404"}, 404)

    def _arquivo(self, p):
        tam = p.stat().st_size
        rng = self.headers.get("Range")
        a, b = 0, tam - 1
        if rng and (m := re.match(r"bytes=(\d*)-(\d*)", rng)):
            a = int(m[1]) if m[1] else tam - int(m[2])
            b = int(m[2]) if m[1] and m[2] else tam - 1
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {a}-{b}/{tam}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", TIPO_ARQ.get(p.suffix.lower(), "application/octet-stream"))
        if p.suffix == ".mp4" and "baixar" in self.path:
            self.send_header("Content-Disposition", f'attachment; filename="{p.name}"')
        if p.name == "index.html" or p.suffix.lower() in (".jpg", ".png"):  # sem cache: build novo e capa re-renderizada aparecem na hora
            self.send_header("Cache-Control", "no-cache")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(b - a + 1))
        self.end_headers()
        with open(p, "rb") as f:
            f.seek(a)
            falta = b - a + 1
            try:
                while falta > 0:
                    pedaco = f.read(min(1 << 20, falta))
                    if not pedaco:
                        break
                    self.wfile.write(pedaco)
                    falta -= len(pedaco)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def _upload(self, nome, config=None, destino=None):
        nome = re.sub(r"[^\w.\- ]", "_", Path(nome).name)
        if Path(nome).suffix.lower() not in (".mov", ".mp4", ".m4v"):
            return self._json({"erro": "só vídeo .mov ou .mp4"}, 400)
        ENTRADA.mkdir(exist_ok=True)
        falta = int(self.headers["Content-Length"])
        tmp = ENTRADA / f".{nome}.parte"
        with open(tmp, "wb") as f:
            while falta > 0:
                b = self.rfile.read(min(4 << 20, falta))
                if not b:
                    break
                f.write(b)
                falta -= len(b)
        if falta:
            tmp.unlink(missing_ok=True)
            return self._json({"erro": "upload cortado"}, 400)
        if destino == "inspirar":  # modelar: o vídeo que a pessoa subiu vira a inspiração (não vai pra corte)
            id_, p = novo_id(INS, "insp")
            tmp.replace(p / f"video{Path(nome).suffix.lower()}")
            escrever(p / "pedido.json", {"arquivo": nome, "criado": time.time()})
            escrever(p / "estado.json", {"status": "na-fila", "fase": "", "desde": time.time(), "erro": ""})
            disparar_script("inspirar.py", id_)
            return self._json({"ok": True, "id": id_})
        dest = ENTRADA / nome
        tmp.replace(dest)
        salvar_config(dest, config)
        disparar(["novo", str(dest)])  # arrastou = quer cortar
        self._json({"ok": True})

    def do_POST(self):
        u = urlparse(self.path).path
        if u == "/api/upload":
            q = parse_qs(urlparse(self.path).query)
            return self._upload(q["nome"][0], (q.get("config") or [None])[0], (q.get("destino") or [None])[0])
        n = int(self.headers.get("Content-Length", 0))
        d = json.loads(self.rfile.read(n) or b"{}")
        if u.startswith("/api/config/"):
            r = config_post(u, d)
            return self._json(r if r is not None else {"erro": "404"}, 200 if r is not None else 404)
        if u == "/api/musicas/atualizar":
            return self._json({"ok": True, "iniciou": atualizar_musicas()})
        if u == "/api/musicas/usar":
            m = usar_musica(d)
            return self._json(m or {"erro": "faixa inválida"}, 200 if m else 400)
        if u == "/api/novo":
            p = Path(d["bruto"]).resolve()
            if p.parent not in (DOWN, ENTRADA) or p.suffix.lower() not in (".mov", ".mp4", ".m4v"):
                return self._json({"erro": "arquivo inválido"}, 400)
            disparar(["novo", str(p)])
        elif u == "/api/novo-link":
            url = str(d.get("url", "")).strip()
            if not re.match(r"https?://\S+$", url):
                return self._json({"erro": "link inválido"}, 400)
            threading.Thread(target=baixar_link, args=(url, d.get("config")), daemon=True).start()
        elif u == "/api/editar":
            fmt = [f"--formato={d['formato']}"] if d.get("formato") in ("dividida", "cheia") else []
            disparar(["editar", d["job"], *fmt, *[str(int(x)) for x in d["ns"]]])
        elif u == "/api/rodar":
            disparar(["rodar", d["job"]])
        elif u == "/api/refazer":
            disparar(["refazer", d["job"], str(int(d["n"])), d["nota"][:2000]])
        elif u == "/api/gerar":
            if d.get("tipo") not in TIPOS or not str(d.get("briefing", "")).strip():
                return self._json({"erro": "tipo ou briefing inválido"}, 400)
            id_, p = novo_id(GER, d["tipo"])
            escrever(p / "pedido.json", {"tipo": d["tipo"], "briefing": d["briefing"][:5000], "estilo": d.get("estilo"),
                                         "inspiracao": d.get("inspiracao"), "duracao": d.get("duracao"), "criado": time.time()})
            escrever(p / "estado.json", {"status": "na-fila", "fase": "", "desde": time.time(), "erro": "", "titulo": "", "saidas": {}})
            disparar_script("gerar.py", id_)
            return self._json({"ok": True, "id": id_})
        elif u == "/api/inspirar":
            if not re.match(r"https?://\S+$", str(d.get("url", ""))):
                return self._json({"erro": "URL inválida"}, 400)
            id_, p = novo_id(INS, "insp")
            escrever(p / "pedido.json", {"url": d["url"], "criado": time.time()})
            escrever(p / "estado.json", {"status": "na-fila", "fase": "", "desde": time.time(), "erro": ""})
            disparar_script("inspirar.py", id_)
            return self._json({"ok": True, "id": id_})
        elif u == "/api/refazer-geracao":
            f = GER / Path(str(d.get("id", ""))).name / "pedido.json"
            if not f.exists():
                return self._json({"erro": "geração não existe"}, 404)
            ped = lerj(f, {})
            ped.setdefault("notas", []).append(str(d.get("nota", ""))[:2000])
            sys.path.insert(0, str(AQUI)); import maquina as _m
            _m.aprender(str(d.get("nota", ""))[:2000], f"{ped.get('tipo')}: {str(ped.get('briefing', ''))[:60]}")
            ped["copy_aprovada"] = False  # refazer gera voz de novo: a copy nova passa pela aprovação dele
            escrever(f, ped)
            disparar_script("gerar.py", f.parent.name)
        elif u == "/api/aprovar-copy":
            f = GER / Path(str(d.get("id", ""))).name / "pedido.json"
            if not f.exists():
                return self._json({"erro": "geração não existe"}, 404)
            ped = lerj(f, {})
            ped["copy_aprovada"] = True
            escrever(f, ped)
            disparar_script("gerar.py", f.parent.name)
        elif u == "/api/postado":
            if d.get("rede") not in REDES or not d.get("ref"):
                return self._json({"erro": "ref ou rede inválida"}, 400)
            with TRAVA:
                escrever(POSTADOS, [*lerj(POSTADOS, []), {"ref": d["ref"], "rede": d["rede"], "quando": time.strftime("%Y-%m-%dT%H:%M:%S")}])
        elif u == "/api/tocar-intro":  # o Chrome não toca som sem clique; o Mac toca
            arq = SOM / f"{Path(str(d.get('periodo', 'bom-dia'))).name}.mp3"
            if arq.exists():
                subprocess.Popen(["afplay", str(arq)])
        elif u == "/api/descartar":
            mexer(d["job"], d["n"], status="descartado" if d.get("sim", True) else "planejado")
        elif u in ("/api/marcar-job", "/api/marcar-geracao"):
            er, cod = marcar_job(d.get("job"), d.get("categoria")) if u.endswith("job") else marcar_geracao(d.get("id"), d.get("nicho"), d.get("validacao"))
            if er:
                return self._json({"erro": er}, cod)
        elif u in ("/api/excluir-corte", "/api/excluir-job"):
            er, cod = excluir_corte(d.get("job"), d.get("n")) if u.endswith("corte") else excluir_job(d.get("job"))
            if er:
                return self._json({"erro": er}, cod)
        elif u == "/api/enviar":
            if ENVIO["rodando"]:
                return self._json({"erro": "já tem um envio rodando"}, 409)
            enviar(d["job"], [int(x) for x in d["ns"]])
        else:
            return self._json({"erro": "404"}, 404)
        self._json({"ok": True})


if __name__ == "__main__":
    JOBS.mkdir(exist_ok=True)
    print(f"painel em http://127.0.0.1:{PORTA}")
    ThreadingHTTPServer(("127.0.0.1", PORTA), H).serve_forever()
