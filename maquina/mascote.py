"""Criador de mascote (estilo quadrinho / historinha com boneco).

Uso: python3 mascote.py <id>   (pasta RAIZ/mascotes/<id> com pedido.json: modelo, nome, caracteristicas)

1. base: o mascote de frente, neutro, num fundo chapado (chroma)
2. folhas: a base vai de referência e o modelo desenha 4x4 reações do MESMO personagem por folha
3. recorte: cada célula vira um PNG transparente em reacoes/<nome>.png, pronto pra animar no vídeo

Imagem pelo Gemini (chave do .env). O plano grátis do Gemini não gera imagem (cota zero):
precisa de faturamento ativo no Google AI Studio, ~US$0,04 por imagem (uma folha = 1 imagem).
"""
import base64, json, sys, time, urllib.request, urllib.error
from pathlib import Path
from PIL import Image, ImageFilter

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
MASC = RAIZ / "mascotes"
MODELO_BASE = "gemini-3.1-flash-lite-image"  # mais barato, só pro personagem de frente
MODELO_FOLHA = "gemini-3.1-flash-image"      # segura o personagem igual em todas as células

MODELOS = {  # o mesmo texto que a tela mostra; aqui vira o estilo do prompt
    "traco": "minimalist hand-drawn doodle character, black marker lines, simple dot eyes, like viral YouTube explainer cartoons, flat white body",
    "3d": "cute 3D Pixar-style character, big expressive eyes, soft materials, subtle subsurface scattering, studio lighting",
    "bicho": "cute 3D animal mascot, chubby body, soft fur, big expressive eyes, Pixar style",
    "objeto": "cute 3D everyday object with a face and tiny arms and legs, glossy materials, Pixar style",
    "quadrinho": "flat 2D comic book cartoon, thick black outlines, bold flat colors, cel shading",
    "massinha": "claymation plasticine character, visible clay fingerprint texture, stop-motion look",
}
FOLHAS = [  # 2 folhas x 16 reações = 32
    ["feliz", "rindo", "triste", "chorando", "bravo", "surpreso", "chocado", "pensando",
     "confuso", "apaixonado", "descolado", "com-sono", "com-medo", "comemorando", "apontando", "joinha"],
    ["acenando", "explicando", "falando", "gritando", "cochichando", "facepalm", "envergonhado", "orgulhoso",
     "cansado", "correndo", "pulando", "sentado", "dancando", "segurando-celular", "dinheiro", "ideia"],
]
EN = {"feliz": "happy smiling", "rindo": "laughing hard", "triste": "sad", "chorando": "crying with tears", "bravo": "angry furious",
      "surpreso": "surprised", "chocado": "shocked jaw dropped", "pensando": "thinking hand on chin", "confuso": "confused with question mark gesture",
      "apaixonado": "in love heart eyes", "descolado": "cool wearing sunglasses", "com-sono": "sleepy yawning", "com-medo": "scared trembling",
      "comemorando": "celebrating arms up", "apontando": "pointing to the side", "joinha": "thumbs up", "acenando": "waving hello",
      "explicando": "explaining with open hands", "falando": "talking mouth open", "gritando": "shouting", "cochichando": "whispering a secret",
      "facepalm": "facepalm", "envergonhado": "embarrassed blushing", "orgulhoso": "proud chest out", "cansado": "exhausted",
      "correndo": "running fast", "pulando": "jumping", "sentado": "sitting down", "dancando": "dancing", "segurando-celular": "holding a smartphone",
      "dinheiro": "holding money bills happily", "ideia": "having an idea with a light bulb above head"}


def chave():
    f = AQUI / ".env"
    for l in (f.read_text().splitlines() if f.exists() else []):
        k, _, v = l.partition("=")
        if k.strip() == "GEMINI_API_KEY" and v.strip():
            return v.strip().strip("\"'")


def estado(d, **kw):
    f = d / "estado.json"
    e = json.loads(f.read_text()) if f.exists() else {}
    e.update(kw, desde=e.get("desde") or time.time())
    f.write_text(json.dumps(e, ensure_ascii=False))


def gerar(modelo, texto, ref=None, tentativas=3):
    partes = [{"text": texto}]
    if ref:
        mime = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(ref.suffix.lower(), "image/png")
        partes.insert(0, {"inlineData": {"mimeType": mime, "data": base64.b64encode(ref.read_bytes()).decode()}})
    corpo = json.dumps({"contents": [{"parts": partes}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}).encode()
    for k in range(tentativas):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent", corpo,
                                     {"content-type": "application/json", "x-goog-api-key": chave() or ""})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=180))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    return base64.b64decode(p["inlineData"]["data"])
            raise RuntimeError("o Gemini respondeu sem imagem")
        except urllib.error.HTTPError as er:
            msg = er.read().decode(errors="ignore")
            if er.code == 429 and "limit: 0" in msg:
                raise RuntimeError("O plano grátis do Gemini não gera imagem. Ative o faturamento em aistudio.google.com (cerca de US$0,04 por imagem) e tente de novo.")
            if er.code in (429, 500, 503) and k < tentativas - 1:
                time.sleep(8 * (k + 1)); continue
            raise RuntimeError(f"Gemini {er.code}: {msg[:200]}")
        except (TimeoutError, urllib.error.URLError) as er:
            if k < tentativas - 1:
                time.sleep(5); continue
            raise RuntimeError(f"Gemini não respondeu: {er}")


def chroma(cor):
    """fundo chapado que não briga com o mascote: verde, ou magenta se o mascote for verde"""
    return ("#FF00FF", (255, 0, 255)) if "verde" in cor.lower() or "green" in cor.lower() else ("#00FF00", (0, 255, 0))


def recortar(img, chave_rgb, saida):
    """tira o fundo chapado (distância da cor-chave, com borda suave) e corta no personagem"""
    img = img.convert("RGB")
    kr, kg, kb = chave_rgb
    px = img.load()
    alfa = Image.new("L", img.size)
    pa = alfa.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            dist = abs(r - kr) + abs(g - kg) + abs(b - kb)
            pa[x, y] = 0 if dist < 110 else 255 if dist > 230 else int((dist - 110) * 255 / 120)
            if kg == 255 and g > max(r, b):  # despill: o verde que reflete no cabelo e na borda some
                px[x, y] = (r, max(r, b), b)
            elif kg == 0 and min(r, b) > g:  # chave magenta
                px[x, y] = (min(r, g + (r - g) // 3), g, min(b, g + (b - g) // 3)) if dist < 230 else (r, g, b)
    alfa = alfa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    out = img.convert("RGBA")
    out.putalpha(alfa)
    caixa = alfa.point(lambda v: 255 if v > 40 else 0).getbbox()
    if not caixa:
        return False
    out = out.crop(caixa)
    m = max(out.size) // 12
    tela = Image.new("RGBA", (out.width + 2 * m, out.height + 2 * m), (0, 0, 0, 0))
    tela.paste(out, (m, m))
    tela.save(saida)
    return True


def faixas(frac, minimo=0.03, larg_min=0.05):
    """trechos seguidos que têm algum fundo chroma; a borda entre quadros não tem nenhum (o personagem sempre deixa margem)"""
    out, ini = [], None
    for i, v in enumerate(frac + [0]):
        if v >= minimo and ini is None:
            ini = i
        elif v < minimo and ini is not None:
            if i - ini >= len(frac) * larg_min:
                out.append((ini, i))
            ini = None
    return out


def quadros(im, chave_rgb):
    """acha os quadros da folha pelo fundo chroma (o modelo nem sempre respeita 4x4: às vezes faz 6x3 com borda branca)"""
    w, h = im.size
    p = im.convert("RGB").resize((w // 4, h // 4))
    kr, kg, kb = chave_rgb
    m = [[abs(r - kr) + abs(g - kg) + abs(b - kb) < 140 for (r, g, b) in [p.getpixel((x, y)) for x in range(p.width)]] for y in range(p.height)]
    cols = faixas([sum(m[y][x] for y in range(p.height)) / p.height for x in range(p.width)])
    lins = faixas([sum(row) / p.width for row in m])
    if len(cols) < 2 or len(lins) < 2:  # sem borda entre quadros: cai na grade 4x4
        cw, ch = w / 4, h / 4
        return [(round(c * cw), round(l * ch), round((c + 1) * cw), round((l + 1) * ch)) for l in range(4) for c in range(4)]
    return [(x0 * 4 + 4, y0 * 4 + 4, x1 * 4 - 4, y1 * 4 - 4) for (y0, y1) in lins for (x0, x1) in cols]  # recua 4px: a emenda com a borda deixa linha


def rodar(id_):
    d = MASC / id_
    p = json.loads((d / "pedido.json").read_text())
    estilo = MODELOS.get(p.get("modelo"), MODELOS["3d"])
    hexa, rgb = chroma(p.get("caracteristicas", ""))
    quem = f"{p.get('nome') or 'the mascot'}: {p.get('caracteristicas') or 'a friendly mascot'}"
    try:
        if not (d / "base.png").exists():
            estado(d, status="gerando", fase="desenhando o mascote")
            foto = d / p["foto"] if p.get("foto") else None
            if foto and foto.exists():  # mascote da própria pessoa: a foto é a referência do rosto, cabelo e roupa
                (d / "base.png").write_bytes(gerar(MODELO_FOLHA,
                    f"Turn the person in this photo into a mascot character. Keep what makes them recognizable: face shape, hair, skin tone, "
                    f"glasses or beard if any, clothing colors. {('Extra details: ' + p['caracteristicas'] + '. ') if p.get('caracteristicas') else ''}"
                    f"Style: {estilo}. Full body, front view, neutral friendly pose, centered, plain flat solid {hexa} background, "
                    f"no shadow on the background, no text.", ref=foto))
            else:
                (d / "base.png").write_bytes(gerar(MODELO_BASE,
                    f"Character design of {quem}. Style: {estilo}. Full body, front view, neutral friendly pose, centered, "
                    f"plain flat solid {hexa} background, no shadow on the background, no text."))
        (d / "reacoes").mkdir(exist_ok=True)
        for k, nomes in enumerate(FOLHAS, 1):
            folha = d / f"folha{k}.png"
            if not folha.exists():
                estado(d, status="gerando", fase=f"folha de reações {k} de {len(FOLHAS)}")
                lista = "; ".join(f"cell {i + 1}: {EN[n]}" for i, n in enumerate(nomes))
                folha.write_bytes(gerar(MODELO_FOLHA,
                    f"This is the mascot. Draw a character reaction sheet of EXACTLY this same character (same design, colors, proportions and style: {estilo}). "
                    f"A 4 by 4 grid of 16 equal square cells, one full-body pose per cell, centered with empty margin, never touching the cell edges. "
                    f"Reading order left to right, top to bottom. {lista}. Every cell on the same plain flat solid {hexa} background, "
                    f"no grid lines, no borders, no text, no labels.", ref=d / "base.png"))
            estado(d, status="gerando", fase=f"recortando a folha {k}")
            im = Image.open(folha)
            qs = quadros(im, rgb)
            for i, q in enumerate(qs):  # nome só quando a folha veio com o número pedido; senão a ordem não bate
                n = nomes[i] if len(qs) == len(nomes) else f"folha{k}-{i + 1:02d}"
                recortar(im.crop(q), rgb, d / "reacoes" / f"{n}.png")
        recortar(Image.open(d / "base.png"), rgb, d / "mascote.png")
        estado(d, status="pronto", fase="")
    except Exception as er:
        estado(d, status="erro", fase="", erro=str(er))
        print(f"[mascote {id_}] {er}", file=sys.stderr)


if __name__ == "__main__":
    rodar(sys.argv[1])
