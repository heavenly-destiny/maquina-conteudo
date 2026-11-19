"""Clonar carrossel: cada slide vira fundo limpo + camadas de texto editáveis (estilo "separar camadas" do Canva).

Uso: <venv>/python carrossel.py <id>   (pasta RAIZ/carrosseis/<id> com origem/01.jpg, 02.png ...)

Por slide:
1. OCR local grátis (RapidOCR, roda no Mac e no Windows) acha cada linha de texto com a caixa exata
2. linhas próximas e do mesmo tamanho viram um bloco (título, subtítulo, rodapé)
3. o texto sai da imagem (inpainting do OpenCV) e sobra o fundo limpo: fundos/NN.png
3b. cada elemento visual (produto, barra, logo, pessoa) vira PNG transparente em elementos/NN-eK.png
    e sai um segundo fundo sem elementos nem texto: fundos/NN-limpo.png
4. camadas.json guarda os blocos em coordenadas relativas (0..1) com tamanho, cor e peso estimados

O editor da Forja monta o slide com o fundo + as camadas, e a pessoa move, troca o texto e exporta.
"""
import json, platform, subprocess, sys, time
from pathlib import Path

import cv2
import numpy as np
from rapidocr_onnxruntime import RapidOCR

AQUI = Path(__file__).resolve().parent
CAR = AQUI.parent / "carrosseis"
OCR_MAC = AQUI / "bin/ocr-mac"  # Vision da Apple: lê português com acento; no Windows fica o RapidOCR


def ler_textos(ocr, arq, img):
    """linhas de texto com caixa em pixels da imagem já redimensionada"""
    h, w = img.shape[:2]
    if platform.system() == "Darwin":
        if not OCR_MAC.exists() and (AQUI / "bin/ocr.swift").exists():
            subprocess.run(["swiftc", "-O", str(AQUI / "bin/ocr.swift"), "-o", str(OCR_MAC)], capture_output=True)
        if OCR_MAC.exists():
            r = subprocess.run([str(OCR_MAC), str(arq)], capture_output=True, text=True, timeout=120)
            try:
                return [{"x0": int(x["x"] * w), "y0": int(x["y"] * h), "x1": int((x["x"] + x["w"]) * w), "y1": int((x["y"] + x["h"]) * h),
                         "texto": x["texto"].strip()} for x in json.loads(r.stdout or "[]") if x["conf"] >= 0.4 and x["texto"].strip()]
            except ValueError:
                pass
    res, _ = ocr()(img)
    out = []
    for pts, txt, conf in res or []:
        if float(conf) < 0.5 or not txt.strip():
            continue
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        out.append({"x0": int(min(xs)), "y0": int(min(ys)), "x1": int(max(xs)), "y1": int(max(ys)), "texto": txt.strip()})
    return out


def estado(d, **kw):
    f = d / "estado.json"
    e = json.loads(f.read_text()) if f.exists() else {}
    e.update(kw, desde=e.get("desde") or time.time())
    f.write_text(json.dumps(e, ensure_ascii=False))


def cor_do_texto(img, caixa, mascara):
    """cor da letra: dentro da caixa, os pixels que mais se afastam do fundo em volta"""
    x0, y0, x1, y1 = caixa
    reg = img[y0:y1, x0:x1].reshape(-1, 3).astype(int)
    m = mascara[y0:y1, x0:x1].reshape(-1) > 0
    borda = np.concatenate([img[max(y0 - 4, 0):y0, x0:x1].reshape(-1, 3), img[y1:y1 + 4, x0:x1].reshape(-1, 3)]).astype(int)
    fundo = np.median(borda, axis=0) if len(borda) else np.median(reg, axis=0)
    dist = np.abs(reg - fundo).sum(axis=1)
    alvo = reg[m & (dist > np.percentile(dist, 75))] if (m & (dist > np.percentile(dist, 75))).any() else reg
    b, g, r = np.median(alvo, axis=0).astype(int)
    return f"#{r:02x}{g:02x}{b:02x}", dist


def blocos(linhas):
    """junta linhas da mesma família (altura parecida, colada embaixo, alinhada) num bloco"""
    linhas = sorted(linhas, key=lambda l: (l["y0"], l["x0"]))
    out = []
    for l in linhas:
        h = l["y1"] - l["y0"]
        for b in out:
            ult = b["linhas"][-1]
            hb = ult["y1"] - ult["y0"]
            perto = 0 <= l["y0"] - ult["y1"] < 0.8 * max(h, hb)
            mesma = 0.75 < h / hb < 1.33
            alinha = abs(l["x0"] - ult["x0"]) < hb * 1.5 or abs((l["x0"] + l["x1"]) - (ult["x0"] + ult["x1"])) / 2 < hb * 1.5
            parecido = float(np.abs(l["bg"] - ult["bg"]).sum()) < 45
            if perto and mesma and alinha and parecido:
                b["linhas"].append(l); break
        else:
            out.append({"linhas": [l]})
    return out


def recorte_rembg(img):
    """foto sem fundo liso: o rembg acha o assunto principal (pessoa, produto). None se não estiver instalado"""
    try:
        from rembg import new_session, remove
    except ImportError:
        return None
    m = remove(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), session=new_session("isnet-general-use"), only_mask=True)
    return ((np.asarray(m) > 127) * 255).astype(np.uint8)


def dividir_pilha(img, alfa, m, vertical=False):
    """pilha de barras coladas (gráfico, lista colorida) vira uma camada por faixa de cor lisa"""
    ys, xs = np.nonzero(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    if min(y1 - y0, x1 - x0) < 0.08 * min(m.shape):  # peça pequena (logo, ícone): não é pilha, senão racha letra por letra
        return [m]
    sub = m[y0:y1, x0:x1] > 0
    op = sub & (alfa[y0:y1, x0:x1] > 200) if alfa is not None else sub
    cor = img[y0:y1, x0:x1].astype(int)
    if vertical:
        sub, op, cor = sub.T, op.T, cor.transpose(1, 0, 2)
    med, dev = [], []
    for r in range(len(op)):
        px = cor[r][op[r]]
        med.append(np.median(px, axis=0) if len(px) >= 5 else None)
        dev.append(float(px.std(axis=0).max()) if len(px) >= 5 else None)
    runs = []  # trechos de linhas seguidas com a mesma cor
    for r, c in enumerate(med):
        if c is None:
            continue
        if runs and r - runs[-1][-1] <= 2 and np.abs(c - med[runs[-1][-1]]).sum() < 25:
            runs[-1].append(r)
        else:
            runs.append([r])
    for i in range(len(runs) - 1, -1, -1):  # trecho curto (linha de transição, borda) cola no vizinho
        if len(runs) > 1 and len(runs[i]) < 10:
            alvo = i - 1 if i > 0 else i + 1
            runs[alvo] = sorted(runs[alvo] + runs[i])
            del runs[i]
    lisas = [r for r in runs if np.median([dev[k] for k in r]) < 10]
    if len(runs) < 2 or sum(map(len, lisas)) < 0.7 * sum(map(len, runs)):
        return dividir_pilha(img, alfa, m, True) if not vertical else [m]
    centros = np.array([np.mean(r) for r in runs])
    dono = np.abs(np.arange(len(sub))[:, None] - centros[None]).argmin(axis=1)  # linha só de brilho vai pro trecho mais perto
    out = []
    for i in range(len(runs)):
        p = sub & (dono == i)[:, None]
        n = np.zeros_like(m)
        n[y0:y1, x0:x1][p.T if vertical else p] = 255
        out.append(n)
    return out


def borda_lisa(img):
    """cor da borda do slide e se ela é lisa (fundo chapado)"""
    borda = np.concatenate([img[:4].reshape(-1, 3), img[-4:].reshape(-1, 3), img[:, :4].reshape(-1, 3), img[:, -4:].reshape(-1, 3)]).astype(int)
    cor = np.median(borda, axis=0)
    desvio = np.abs(borda - cor).sum(axis=1)
    return cor, np.percentile(desvio, 80) < 40, np.percentile(desvio, 95)


def mascaras_elementos(fundo, alfa, w, h):
    """elementos visuais do slide já sem texto (garrafa, barra, logo, pessoa): (máscaras, como achou)"""
    if alfa is not None and (alfa < 20).mean() > 0.05:  # PNG transparente: cada ilha de opacidade é um elemento
        base, modo = ((alfa > 40) * 255).astype(np.uint8), "transparência"
    else:
        cor, lisa, d95 = borda_lisa(fundo)
        base, modo = None, "cor do fundo"
        if lisa:  # fundo chapado: o que destoa da cor da borda é elemento
            dif = np.abs(fundo.astype(int) - cor).sum(axis=2)
            base = cv2.morphologyEx(((dif > max(45, d95 * 1.5)) * 255).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            if base.mean() / 255 > 0.7:
                base = None
        if base is None:  # foto: um assunto principal pelo rembg
            base, modo = recorte_rembg(fundo), "rembg"
            if base is None:
                return [], "fundo não é liso e o rembg não está instalado"
    k = max(3, round(w * 0.012)) | 1  # junta peças vizinhas (garrafa + brilho, ícone + nome do logo)
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(base, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))))
    dentro = (alfa > 0) if modo == "transparência" else (cv2.dilate(base, np.ones((3, 3), np.uint8)) > 0)  # pega a borda suave
    out = []
    for i in range(1, n):
        if st[i, 4] < w * h * 0.0015 or st[i, 2] * st[i, 3] > 0.95 * w * h:  # cisco, ou o próprio fundo
            continue
        out += dividir_pilha(fundo, alfa, ((lab == i) & dentro).astype(np.uint8) * 255)
    out.sort(key=lambda m: -int((m > 0).sum()))  # maior embaixo
    return out, modo


def separar_elementos(fundo, alfa_f, d, nn, w, h):
    """cada elemento vira PNG transparente (elementos/NN-eK.png) + fundo sem elementos e sem texto (fundos/NN-limpo.png)"""
    mascaras, modo = mascaras_elementos(fundo, alfa_f, w, h)
    if not mascaras:
        print(f"[carrossel] slide {nn}: nenhum elemento ({modo or 'nada destoa do fundo'})", file=sys.stderr)
        return [], None
    (d / "elementos").mkdir(exist_ok=True)
    opaco = np.full((h, w), 255, np.uint8)
    tudo = np.zeros((h, w), np.uint8)
    camadas = []
    for i, m in enumerate(mascaras, 1):
        ys, xs = np.nonzero(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        a = (alfa_f if alfa_f is not None else opaco)[y0:y1, x0:x1].astype(np.float32) * (m[y0:y1, x0:x1] / 255.0)
        cv2.imwrite(str(d / "elementos" / f"{nn}-e{i}.png"), np.dstack([fundo[y0:y1, x0:x1], a.astype(np.uint8)]))
        tudo |= m
        caixa = {"x": x0 / w, "y": y0 / h, "w": (x1 - x0) / w, "h": (y1 - y0) / h}
        camadas.append({"id": f"e{i}", "tipo": "imagem", "src": f"elementos/{nn}-e{i}.png", **caixa, "orig": dict(caixa)})
    if modo == "transparência":
        alfa_l = alfa_f.copy()
        alfa_l[tudo > 0] = 0
        limpo = np.dstack([fundo, alfa_l])
    else:
        tudo = cv2.dilate(tudo, np.ones((5, 5), np.uint8))
        cor, lisa, _ = borda_lisa(fundo)
        limpo = fundo.copy()
        if lisa:
            limpo[tudo > 0] = cor.astype(np.uint8)
        else:  # ponytail: inpaint borra área grande (foto); preenchimento por IA (lama) se incomodar
            limpo = cv2.inpaint(limpo, tudo, 9, cv2.INPAINT_TELEA)
        if alfa_f is not None:
            limpo = np.dstack([limpo, alfa_f])
    cv2.imwrite(str(d / "fundos" / f"{nn}-limpo.png"), limpo)
    print(f"[carrossel] slide {nn}: {len(camadas)} elementos ({modo})", file=sys.stderr)
    return camadas, f"fundos/{nn}-limpo.png"


def slide(ocr, arq, saida_fundo, W):
    bruta = cv2.imread(str(arq), cv2.IMREAD_UNCHANGED)
    if bruta.ndim == 2:
        bruta = cv2.cvtColor(bruta, cv2.COLOR_GRAY2BGR)
    h, w = bruta.shape[:2]
    if w > W:  # trabalha em 1080 de largura (padrão do feed); acelera e deixa os tamanhos comparáveis
        bruta = cv2.resize(bruta, (W, round(h * W / w)), interpolation=cv2.INTER_AREA)
        h, w = bruta.shape[:2]
    # PNG com transparência: o OpenCV leria a cor escondida atrás do transparente (mudava a foto toda).
    # Trabalha em cima do que se vê (sobre preto) e devolve a transparência no fundo limpo.
    alfa = bruta[..., 3] if bruta.shape[2] == 4 else None
    img = (bruta[..., :3].astype(np.float32) * (alfa[..., None] / 255.0)).astype(np.uint8) if alfa is not None else bruta[..., :3]
    linhas = [l for l in ler_textos(ocr, arq, img) if l["x1"] - l["x0"] > 3 and l["y1"] - l["y0"] > 3]
    for l in linhas:  # caixa sempre dentro do slide; bg = brilho do fundo da linha (pra não juntar título com barra colorida)
        l["x0"], l["x1"] = max(l["x0"], 0), min(l["x1"], w)
        l["y0"], l["y1"] = max(l["y0"], 0), min(l["y1"], h)
        borda = np.concatenate([img[l["y0"], l["x0"]:l["x1"]], img[l["y1"] - 1, l["x0"]:l["x1"]]]).astype(int)
        l["bg"] = np.median(borda, axis=0) if len(borda) else np.zeros(3)
    # Todo texto lido vira camada. A foto original continua intacta no editor: só o retângulo do texto que a
    # pessoa mexer é trocado pelo fundo limpo (estilo "editar texto" do Canva), então texto em cima de foto não borra nada.
    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # máscara do texto: dentro de cada caixa, o que destoa do fundo; dilata pra pegar a borda suave
    mascara = np.zeros((h, w), np.uint8)
    for l in linhas:
        x0, y0, x1, y1 = max(l["x0"] - 3, 0), max(l["y0"] - 3, 0), min(l["x1"] + 3, w), min(l["y1"] + 3, h)
        reg = cinza[y0:y1, x0:x1]
        if reg.shape[0] < 4 or reg.shape[1] < 4:
            continue
        _, bin_ = cv2.threshold(reg, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        letra = bin_ if (bin_ > 0).mean() < 0.5 else 255 - bin_  # letra é o lado minoritário da caixa (a borda pode pegar a barra vizinha)
        mascara[y0:y1, x0:x1] = np.maximum(mascara[y0:y1, x0:x1], letra)
    letras = mascara.copy()
    mascara = cv2.dilate(mascara, np.ones((3, 3), np.uint8), iterations=2)
    fundo = img.copy()
    alfa_f = alfa.copy() if alfa is not None else None  # a transparência também perde o texto (senão ele vaza pelo remendo)
    resto = np.zeros((h, w), np.uint8)
    for l in linhas:  # caixa em fundo chapado (barra, faixa, cartão): pinta com a cor do fundo, sem borrão
        a = 1
        x0, y0, x1, y1 = max(l["x0"] - a, 0), max(l["y0"] - a, 0), min(l["x1"] + a, w), min(l["y1"] + a, h)
        m = mascara[y0:y1, x0:x1] > 0
        anel = img[y0:y1, x0:x1][~m].astype(int)
        if len(anel) > 20 and anel.std(axis=0).max() < 14:
            fundo[y0:y1, x0:x1][m] = np.median(anel, axis=0).astype(np.uint8)
            if alfa_f is not None:
                alfa_f[y0:y1, x0:x1][m] = np.uint8(np.median(alfa[y0:y1, x0:x1][~m]))
        else:
            resto[max(l["y0"] - 2, 0):l["y1"] + 2, max(l["x0"] - 2, 0):l["x1"] + 2] = 255  # degradê/foto: o Otsu erra a letra, apaga a caixa inteira
    if resto.any():
        r2 = cv2.dilate(resto, np.ones((3, 3), np.uint8))
        fundo = cv2.inpaint(fundo, r2, 7, cv2.INPAINT_TELEA)
        if alfa_f is not None:
            alfa_f = cv2.inpaint(alfa_f, r2, 7, cv2.INPAINT_TELEA)
    cv2.imwrite(str(saida_fundo), np.dstack([fundo, alfa_f]) if alfa is not None else fundo)
    elementos, limpo = separar_elementos(fundo, alfa_f, saida_fundo.parent.parent, saida_fundo.stem, w, h)

    camadas = []
    for i, b in enumerate(blocos(linhas)):
        ls = b["linhas"]
        x0, y0 = min(l["x0"] for l in ls), min(l["y0"] for l in ls)
        x1, y1 = max(l["x1"] for l in ls), max(l["y1"] for l in ls)
        alt = float(np.median([l["y1"] - l["y0"] for l in ls]))
        cor, _ = cor_do_texto(img, (x0, y0, x1, y1), mascara)
        # peso: fração da caixa ocupada pela letra (traço grosso = negrito)
        tinta = float((letras[y0:y1, x0:x1] > 0).mean())
        centros = [(l["x0"] + l["x1"]) / 2 for l in ls]
        alinhar = "center" if len(ls) > 1 and np.std(centros) < alt * 0.6 and np.std([l["x0"] for l in ls]) > alt * 0.6 else \
                  "center" if abs((x0 + x1) / 2 - w / 2) < w * 0.04 else "left"
        camadas.append({
            "id": f"t{i + 1}", "tipo": "texto", "texto": "\n".join(l["texto"] for l in ls),
            "x": x0 / w, "y": y0 / h, "w": (x1 - x0) / w, "h": (y1 - y0) / h,
            "tam": round(alt * 0.86 / w, 4),  # tamanho da fonte relativo à largura do slide (altura da caixa ≈ 1,16 × fonte)
            "cor": cor, "peso": 800 if tinta > 0.36 else 600 if tinta > 0.26 else 400, "alinhar": alinhar,
            "fonte": "Inter", "fixo": True,
            "orig": {"x": x0 / w, "y": y0 / h, "w": (x1 - x0) / w, "h": (y1 - y0) / h},  # mantém as quebras do original (o editor encolhe se a fonte sair larga)
        })
    return {"w": w, "h": h, "camadas": elementos + camadas, **({"limpo": limpo} if limpo else {})}  # texto desenha por cima dos elementos


def rodar(id_):
    d = CAR / id_
    origens = sorted(p for p in (d / "origem").glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
    try:
        if not origens:
            raise RuntimeError("nenhuma imagem de slide")
        estado(d, status="gerando", fase="lendo os textos")
        cache = {}
        ocr = lambda: cache.setdefault("o", RapidOCR())  # só carrega o modelo se o OCR do Mac não estiver disponível
        (d / "fundos").mkdir(exist_ok=True)
        slides = []
        for k, arq in enumerate(origens, 1):
            estado(d, status="gerando", fase=f"separando o slide {k} de {len(origens)}")
            s = slide(ocr, arq, d / "fundos" / f"{k:02d}.png", 1080)
            s["fundo"] = f"fundos/{k:02d}.png"
            slides.append(s)
        (d / "camadas.json").write_text(json.dumps({"slides": slides}, ensure_ascii=False, indent=1))
        estado(d, status="pronto", fase="")
    except Exception as er:
        estado(d, status="erro", fase="", erro=str(er))
        print(f"[carrossel {id_}] {er}", file=sys.stderr)


if __name__ == "__main__":
    rodar(sys.argv[1])
