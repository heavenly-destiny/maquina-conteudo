"""Troca as fotos do carrossel modelado pelas do nicho novo.

Uso: tools/.venv/bin/python carrossel_fotos.py <id>
Lê fotos.json (escrito pelo Claude na modelagem: slide, id da camada, pedido da foto) e, pra cada uma:
gera no Worker forja-imagem (FLUX.2, grátis), encaixa no formato da camada (retângulo: corta no tamanho;
recorte: tira o fundo com o rembg) e troca a camada na edicao.json. A máscara do original fica guardada,
pra o editor tapar o lugar do elemento antigo com o fundo limpo.
"""
import io, json, sys, time
from pathlib import Path
import numpy as np
from PIL import Image

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import mascote  # gerar() fala com o Worker

ESTILO = (" Casual photo taken on an iPhone by an ordinary person, natural light, real home or small business setting,"
          " slightly imperfect framing, no studio lighting, no luxury, no text, no watermark.")


def forma(arq):
    """retângulo (print, foto chapada) ou recorte (pessoa, produto, personagem sem fundo)"""
    a = np.asarray(Image.open(arq).convert("RGBA"))[:, :, 3]
    return "retangulo" if (a > 128).mean() > 0.75 else "recorte"


def tamanho(w, h, maior=1024):
    k = maior / max(w, h)
    return max(256, int(w * k) // 16 * 16), max(256, int(h * k) // 16 * 16)


def cobrir(im, w, h):
    """corta no centro pra caber exatamente w x h (sem deformar)"""
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def sem_fundo(im):
    from rembg import new_session, remove
    out = remove(im, session=new_session("isnet-general-use"))
    bb = out.getbbox()
    return out.crop(bb) if bb else out


def rodar(id_):
    d = AQUI.parent / "carrosseis" / Path(id_).name
    pedidos = json.loads((d / "fotos.json").read_text()).get("trocas", [])
    ed = json.loads((d / "edicao.json").read_text())
    base = json.loads((d / "camadas.json").read_text())["slides"]
    feitas, erros = 0, []
    for k, p in enumerate(pedidos[:12]):
        try:
            si, cid = int(p["slide"]) - 1, str(p["id"])
            cam = next(c for c in ed["slides"][si]["camadas"] if c["id"] == cid)
            orig = cam.get("mascara") or cam["src"]
            W, H = base[si]["w"], base[si]["h"]
            fw, fh = cam["orig"]["w"] * W, cam["orig"]["h"] * H
            f = forma(d / orig)
            est = json.loads((d / "estado.json").read_text())
            (d / "estado.json").write_text(json.dumps({**est, "fase": f"criando a foto {k + 1} de {len(pedidos)}"}, ensure_ascii=False))
            texto = str(p["prompt"]).strip() + ESTILO
            if f == "recorte":
                texto += " Single subject, centered, full body visible, plain light grey background."
            gw, gh = tamanho(fw, fh)
            im = Image.open(io.BytesIO(mascote.gerar(mascote.MODELO_BASE, texto, w=gw, h=gh))).convert("RGB")
            im = sem_fundo(im) if f == "recorte" else cobrir(im, round(fw), round(fh))
            novo = f"elementos/{si + 1:02d}-{cid}-nicho.png"
            im.save(d / novo)
            cam.update(src=novo, mascara=orig, mexido=True)
            if True:  # print/objeto virou foto: texto de interface que morava dentro dele (menu, botão) sai junto
                o = cam["orig"]
                velho = {c["id"]: c.get("texto") for c in base[si]["camadas"] if c.get("tipo") == "texto"}
                for t in ed["slides"][si]["camadas"]:
                    if t.get("tipo") != "texto" or not t.get("orig"):
                        continue
                    q = t["orig"]
                    cx_, cy_ = q["x"] + q["w"] / 2, q["y"] + q["h"] / 2
                    dentro = o["x"] < cx_ < o["x"] + o["w"] and o["y"] + o["h"] * 0.12 < cy_ < o["y"] + o["h"]  # a faixa de cima costuma ser título/etiqueta, fica
                    if dentro and (t.get("texto") == velho.get(t["id"]) or (t.get("tam") or 1) < 0.018):
                        t["oculto"] = True
            feitas += 1
        except Exception as e:
            erros.append(f"{p.get('slide')}: {str(e)[:120]}")
    (d / "edicao.json").write_text(json.dumps({**ed, "quando": time.time()}, ensure_ascii=False, indent=1))
    print(f"fotos trocadas: {feitas} de {len(pedidos)}", *erros, sep="\n")
    return feitas, erros


if __name__ == "__main__":
    rodar(sys.argv[1])
