#!/usr/bin/env python3
"""Usar a Forja direto no Claude, sem o painel. Monta o mesmo prompt que o painel daria (perfil + regras + etapa)
e guarda tudo em geracoes/, então o resultado aparece também em Criados no painel.

uso:
  forja.py gerar TIPO "briefing" [--inspiracao ID] [--duracao 30]   cria a pasta e imprime o prompt (TIPO: roteiro animado criativo modelar)
  forja.py aprovar ID                                               copy aprovada: imprime o prompt pra gerar voz, música e vídeo
  forja.py pronto ID                                                marca como pronto (capa, título, legenda) pra aparecer no painel
  forja.py decupar URL [rapida|completa|fiel]                       decupa uma referência (vai pro Inspirar) e imprime o ID
  forja.py prompt ETAPA [chave=valor ...]                           imprime o prompt de qualquer etapa de maquina/prompts/
"""
import json, subprocess, sys, time
from pathlib import Path
import maquina as m
import gerar as g


def ler(p):
    return json.loads((p / "pedido.json").read_text())


def mostrar(p, ped):
    print(f"PASTA: {p}\n(trabalhe e salve tudo dentro dela)\n")
    print(g.montar_prompt(p, ped))


def main(a):
    if len(a) >= 3 and a[0] == "gerar":
        tipo = a[1]
        if tipo not in g.TIPOS:
            sys.exit(f"tipo inválido: {tipo}. Use: {', '.join(t for t in g.TIPOS if t != 'clonar')}")
        op = dict(zip(a[3::2], a[4::2]))
        n = f"{time.strftime('%Y%m%d-%H%M%S')}-{tipo}"
        p = g.GER / n
        p.mkdir(parents=True)
        ped = {"tipo": tipo, "briefing": a[2], "estilo": "criativo-direct-response" if tipo == "criativo" else "conteudo-organico",
               "inspiracao": op.get("--inspiracao"), "duracao": int(op.get("--duracao", 30)), "criado": time.time(), "via": "claude"}
        (p / "pedido.json").write_text(json.dumps(ped, ensure_ascii=False, indent=1))
        g.salvar(p, {"status": "gerando", "fase": "no Claude", "desde": time.time(), "erro": "", "titulo": "", "saidas": {}})
        print(f"ID: {n}")
        mostrar(p, ped)
    elif len(a) == 2 and a[0] == "aprovar":
        p = g.GER / Path(a[1]).name
        ped = ler(p)
        ped["copy_aprovada"] = True
        (p / "pedido.json").write_text(json.dumps(ped, ensure_ascii=False, indent=1))
        mostrar(p, ped)
    elif len(a) == 2 and a[0] == "pronto":
        p = g.GER / Path(a[1]).name
        e = {"status": "pronto", "fase": "", "desde": time.time(), "erro": ""}
        if (p / "roteiro.json").exists():
            r = json.loads((p / "roteiro.json").read_text())
            e.update(titulo=r.get("titulo", ""), legenda=r.get("legenda", ""), hashtags=r.get("hashtags", ""))
        if (p / "final.mp4").exists() and not (p / "capa.jpg").exists():
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "1", "-i", str(p / "final.mp4"), "-frames:v", "1",
                            "-vf", "scale=360:-2", "-q:v", "4", str(p / "capa.jpg")])
        e["saidas"] = {k: f for k, f in (("roteiro", "roteiro.md"), ("video", "final.mp4"), ("capa", "capa.jpg")) if (p / f).exists()}
        if ler(p)["tipo"] in g.COM_VOZ and not ler(p).get("copy_aprovada"):
            e["status"] = "aprovar-copy"
        g.salvar(p, e)
        print(f"{e['status']}: {', '.join(e['saidas']) or 'nada salvo ainda'}")
    elif len(a) >= 2 and a[0] == "decupar":
        import inspirar
        modo = a[2] if len(a) > 2 and a[2] in inspirar.MODOS_TXT else "completa"
        n = f"{time.strftime('%Y%m%d-%H%M%S')}-insp"
        (inspirar.INS / n).mkdir(parents=True)
        (inspirar.INS / n / "pedido.json").write_text(json.dumps({"url": a[1], "modo": modo, "criado": time.time()}))
        inspirar.rodar(n)
        print(f"ID: {n}\n{inspirar.INS / n / 'decupagem.json'}")
    elif len(a) >= 2 and a[0] == "prompt":
        print(m.prompt(a[1], **dict(x.split("=", 1) for x in a[2:])))
    else:
        print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
