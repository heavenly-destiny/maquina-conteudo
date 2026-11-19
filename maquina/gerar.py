#!/usr/bin/env python3
"""gerar.py <id>: roda uma geração (roteiro | animado | criativo | modelar | clonar) em RAIZ/geracoes/<id>/.
O painel cria pedido.json + estado.json e dispara este script."""
import json, subprocess, sys, threading, time
from pathlib import Path
import maquina as m

GER = m.RAIZ / "geracoes"
SPEC = {"conteudo-organico": "conteudo-organico", "criativo-direct-response": "criativo-direct-response", "motivacional": "motivacional"}
MODELO = {"roteiro": m.MODELO_CORTE, "modelar": m.MODELO_PLANO, "clonar": m.MODELO_PLANO, "animado": m.MODELO_PLANO, "criativo": m.MODELO_PLANO}  # criação = opus
TIPOS = tuple(MODELO)
COM_VOZ = ("animado", "criativo", "modelar", "clonar")  # regra do tanpz: copy completa aprovada por ele antes de gerar voz
PARA_NA_COPY = """

## Copy approval gate (his rule: he approves the full copy before any voice, music or asset is generated)
Do step zero and write ONLY: conhecimento-usado.md, roteiro.md, roteiro.json, emotion-map.json (and decupagem_aplicada.md when modeling, clone_espec.md when cloning).
Be fast: this stage must finish in a few minutes. Read only what the copy needs (rules, playbook, the reference), no exploration, no second drafts. Before stopping, check the copy yourself against the rules (no em dashes, no kickers, his words and tone).
Then STOP. Do not call voz or som, do not generate images, do not build or render anything. tanpz reads the copy in the panel and approves it."""
COPY_APROVADA = """

## Copy approved by tanpz
roteiro.json and roteiro.md in this folder were approved word by word. Do not change any spoken line, caption or hook. Read conhecimento-usado.md and emotion-map.json already here, then continue from the voice step to the final render."""


def so_copy(ped):
    return ped["tipo"] in COM_VOZ and not ped.get("copy_aprovada")


def motions_prontos(briefing, n=5):
    """os prompts de motion prontos (estilos/prompt-motion) que mais casam com o briefing: o agente parte deles em vez de inventar (mais rápido)"""
    d = m.RAIZ / "estilos" / "prompt-motion"
    try:
        dados = {x["slug"]: x for x in json.loads((d / "data.json").read_text())}
        for f in sorted(d.glob("analise*.json")):
            for a in json.loads(f.read_text()):
                if a.get("slug") in dados: dados[a["slug"]].update(a)
    except Exception:
        return ""
    pal = {w for w in briefing.lower().replace(",", " ").split() if len(w) > 3}
    def nota(x):
        txt = " ".join(str(x.get(k, "")) for k in ("titulo_pt", "o_que_faz", "encaixe", "tecnica", "title", "tags")).lower()
        return sum(w in txt for w in pal) * 2 + int(x.get("relevancia") or 0) - (1 if x.get("esforco") == "alto" else 0)
    top = sorted((x for x in dados.values() if x.get("prompt")), key=nota, reverse=True)[:n]
    linhas = [f"- {x.get('titulo_pt') or x.get('title')} ({x['slug']}): {x.get('encaixe', '')}\n  Prompt pronto: {str(x['prompt'])[:900]}" for x in top]
    return "\n\n## Ready motion prompts (pick from these first, adapt colors and copy; only invent if none fits)\n" + "\n".join(linhas)


def salvar(p, e):
    tmp = p / "estado.tmp"
    tmp.write_text(json.dumps(e, ensure_ascii=False, indent=1))
    tmp.replace(p / "estado.json")


IDIOMA_ORIGINAL = "\n\nSPOKEN LANGUAGE (chosen by tanpz): keep the original speech, word for word, in the original language. Do not translate.\n"
IDIOMA_PT = ("\n\nSPOKEN LANGUAGE (chosen by tanpz): PORTUGUESE. Translate the spoken script into natural Brazilian Portuguese "
             "(how a Brazilian creator would say it, not a literal word swap). Keep the same beats, same order, same timing per line "
             "and same total length; trim or expand phrasing so each line fits its original duration. On-screen text also goes to PT-BR "
             "with the same length and rhythm. Use a native pt-BR ElevenLabs voice with the same character (gender, age, energy, pace). "
             "This overrides the 'word for word' rule for speech only; everything else stays a 1:1 clone.\n")


def montar_prompt(p, ped):
    estilo = ped.get("estilo") or ("criativo-direct-response" if ped["tipo"] == "criativo" else "conteudo-organico")
    ref = m.RAIZ / "inspiracoes" / str(ped.get("inspiracao") or "x")
    notas = "\n".join(f"- Change requested by tanpz after the first version (apply it): {n}" for n in ped.get("notas", []))
    v = dict(pasta=p, briefing=ped["briefing"], estilo=estilo, spec=m.RAIZ / "estilos" / estilo / "spec.md",
             duracao=ped.get("duracao") or 30, inspiracao=ped.get("inspiracao") or "nenhuma", notas=notas, ref=ref,
             apoio=m.APOIO, raiz=m.RAIZ, mascote=m.TOOLS / "assets/mascote", musicas=m.TOOLS / "assets/music", sfx=m.TOOLS / "assets/sfx")
    extra = PARA_NA_COPY if so_copy(ped) else COPY_APROVADA if ped["tipo"] in COM_VOZ else ""
    if ped["tipo"] in COM_VOZ and not so_copy(ped):
        extra += motions_prontos(ped["briefing"])
    if ped.get("copy_editada") and not so_copy(ped):
        extra += "\ntanpz edited some spoken lines by hand in the panel: roteiro.json is the truth. Make on-screen text, captions and scene timing match the edited lines.\n"
    if ped["tipo"] == "clonar":
        extra += IDIOMA_PT if ped.get("idioma") == "pt" else IDIOMA_ORIGINAL
    return m.prompt(f"gerar_{ped['tipo']}", base=m.prompt("_gerar_base", **v), **v) + extra


def vigiar(p, e, parar):
    """fase fina pelos arquivos que o editor vai deixando na pasta"""
    while not parar.wait(4):
        f = "checando" if (p / "final.mp4").exists() else "renderizando" if (p / "video").exists() else \
            "montando" if (p / "voz.mp3").exists() else "voz" if (p / "roteiro.json").exists() else None
        if f and f != e["fase"]:
            e["fase"] = f
            salvar(p, e)


def rodar(id_):
    p = GER / id_
    ped = json.loads((p / "pedido.json").read_text())
    e = {"status": "gerando", "fase": "roteiro", "desde": time.time(), "erro": "", "titulo": "", "saidas": {}}
    salvar(p, e)
    parar = threading.Event()
    try:
        if ped["tipo"] not in TIPOS:
            raise ValueError(f"tipo inválido: {ped['tipo']}")
        for f in ("final.mp4", "capa.jpg"):  # refazer: não deixa o antigo passar por novo
            (p / f).unlink(missing_ok=True)
        threading.Thread(target=vigiar, args=(p, e, parar), daemon=True).start()
        m.claude(montar_prompt(p, ped), p, m.MODELO_CORTE if ped["tipo"] == "clonar" and so_copy(ped) else MODELO[ped["tipo"]], "log.txt")  # clonar: a copy é a transcrição, sonnet basta
        # revisão obrigatória contra regras, memórias e vereditos antigos; reprovou = refaz uma vez com as correções
        for volta in (() if so_copy(ped) else (1, 2)):  # copy tem que sair rápido (tanpz 19/11): sem revisão na etapa de copy, ele mesmo aprova; revisão fica no vídeo final
            e["fase"] = "revisando"
            salvar(p, e)
            (p / "revisao.json").unlink(missing_ok=True)
            m.claude(m.prompt("_revisar", pasta=p, briefing=ped["briefing"], tipo=ped["tipo"] + (" (copy stage only: there is no video yet, review the copy)" if so_copy(ped) else "")), p, m.MODELO_CORTE if so_copy(ped) else m.MODELO_PLANO, f"revisao-{volta}.txt")  # revisar copy é rápido: sonnet
            rev = json.loads((p / "revisao.json").read_text()) if (p / "revisao.json").exists() else {"aprovado": False, "problemas": ["revisor não escreveu revisao.json"]}
            e["revisao"] = rev
            if rev.get("aprovado") or volta == 2:
                break
            ped.setdefault("notas", []).extend(rev.get("problemas", []))
            for f in ("final.mp4", "capa.jpg"):
                (p / f).unlink(missing_ok=True)
            m.claude(montar_prompt(p, ped), p, MODELO[ped["tipo"]], "log-refeito.txt")
        parar.set()
        e["fase"] = "checando"
        if (p / "roteiro.json").exists():
            r = json.loads((p / "roteiro.json").read_text())
            e.update(titulo=r.get("titulo", ""), legenda=r.get("legenda", ""), hashtags=r.get("hashtags", ""))
        if (p / "final.mp4").exists():
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "1", "-i", str(p / "final.mp4"), "-frames:v", "1",
                            "-vf", "scale=360:-2", "-q:v", "4", str(p / "capa.jpg")])
        e["saidas"] = {k: n for k, n in (("roteiro", "roteiro.md"), ("video", "final.mp4"), ("capa", "capa.jpg")) if (p / n).exists()}
        if so_copy(ped):
            if "roteiro" not in e["saidas"]:
                raise RuntimeError("o editor terminou sem escrever roteiro.md (veja log.txt)")
            e.update(status="aprovar-copy", fase="")
        else:
            if ped["tipo"] in COM_VOZ and "video" not in e["saidas"]:
                raise RuntimeError("o editor terminou sem gerar final.mp4 (veja log.txt)")
            e.update(status="pronto" if e.get("revisao", {}).get("aprovado") else "revisar", fase="")
    except Exception as ex:
        parar.set()
        log = (p / "log.txt").read_text() if (p / "log.txt").exists() else ""
        if "FALTA_CHAVE_ELEVENLABS" in log or "FALTA_CHAVE_ELEVENLABS" in str(ex):
            e.update(status="aguardando-voz", fase="", erro="Falta a chave da ElevenLabs em maquina/.env (veja .env.exemplo)")
        else:
            e.update(status="erro", fase="", erro=str(ex)[-500:])
    salvar(p, e)
    m.avisar(f"{e.get('titulo') or ped['tipo']}: {e['status']}")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[2] == "--prompt":  # só mostra o prompt (teste)
        print(montar_prompt(GER / sys.argv[1], json.loads((GER / sys.argv[1] / "pedido.json").read_text())))
    else:
        rodar(sys.argv[1])
