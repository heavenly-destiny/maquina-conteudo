"""Clonar carrossel: cada slide vira fundo limpo + camadas de texto editáveis (estilo "separar camadas" do Canva).

Uso: <venv>/python carrossel.py <id>   (pasta RAIZ/carrosseis/<id> com origem/01.jpg, 02.png ...)

Por slide:
1. OCR local grátis (RapidOCR, roda no Mac e no Windows) acha cada linha de texto com a caixa exata
2. linhas próximas e do mesmo tamanho viram um bloco (título, subtítulo, rodapé)
3. o texto sai da imagem (inpainting do OpenCV) e sobra o fundo limpo: fundos/NN.png
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
            if perto and mesma and alinha:
                b["linhas"].append(l); break
        else:
            out.append({"linhas": [l]})
    return out


def slide(ocr, arq, saida_fundo, W):
    img = cv2.imread(str(arq))
    h, w = img.shape[:2]
    if w > W:  # trabalha em 1080 de largura (padrão do feed); acelera e deixa os tamanhos comparáveis
        img = cv2.resize(img, (W, round(h * W / w)), interpolation=cv2.INTER_AREA)
        h, w = img.shape[:2]
    linhas = [l for l in ler_textos(ocr, arq, img) if l["x1"] - l["x0"] > 3 and l["y1"] - l["y0"] > 3]
    for l in linhas:  # caixa sempre dentro do slide
        l["x0"], l["x1"] = max(l["x0"], 0), min(l["x1"], w)
        l["y0"], l["y1"] = max(l["y0"], 0), min(l["y1"], h)
    # texto em cima de foto (print de story dentro do slide, legenda da foto) fica no fundo: apagar borra a foto
    # e a camada solta fica estranha. Fundo liso em volta = texto do design = vira camada.
    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    caixas = np.zeros((h, w), bool)  # o anel em volta de uma linha não conta as outras linhas de texto
    for l in linhas:
        caixas[l["y0"]:l["y1"], l["x0"]:l["x1"]] = True
    def liso(l):
        a = max(6, (l["y1"] - l["y0"]) // 2)
        x0, y0, x1, y1 = max(l["x0"] - a, 0), max(l["y0"] - a, 0), min(l["x1"] + a, w), min(l["y1"] + a, h)
        livre = ~caixas[y0:y1, x0:x1]
        if livre.sum() < 20:  # linha engolida por outras caixas: quase sempre texto miúdo dentro de foto
            return False
        # textura do entorno (Laplaciano): gradiente liso do design fica < 2, foto passa de 6
        return float(np.abs(cv2.Laplacian(cinza[y0:y1, x0:x1], cv2.CV_64F))[livre].mean()) < 5.5
    linhas = [l for l in linhas if liso(l)]
    # máscara do texto: dentro de cada caixa, o que destoa do fundo; dilata pra pegar a borda suave
    mascara = np.zeros((h, w), np.uint8)
    for l in linhas:
        x0, y0, x1, y1 = max(l["x0"] - 3, 0), max(l["y0"] - 3, 0), min(l["x1"] + 3, w), min(l["y1"] + 3, h)
        reg = cinza[y0:y1, x0:x1]
        if reg.shape[0] < 4 or reg.shape[1] < 4:
            continue
        _, bin_ = cv2.threshold(reg, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        borda = np.concatenate([reg[0], reg[-1], reg[:, 0], reg[:, -1]])
        letra = bin_ if np.median(borda) < 128 else 255 - bin_  # letra é o lado que não é o fundo
        mascara[y0:y1, x0:x1] = np.maximum(mascara[y0:y1, x0:x1], letra)
    letras = mascara.copy()
    mascara = cv2.dilate(mascara, np.ones((5, 5), np.uint8), iterations=3)
    fundo = cv2.inpaint(img, mascara, 7, cv2.INPAINT_TELEA) if linhas else img
    cv2.imwrite(str(saida_fundo), fundo)

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
            "fonte": "Inter", "fixo": True,  # mantém as quebras do original (o editor encolhe se a fonte sair larga)
        })
    return {"w": w, "h": h, "camadas": camadas}


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
