"""Criador de mascote (estilo quadrinho / historinha com boneco).

Uso: python3 mascote.py <id>   (pasta RAIZ/mascotes/<id> com pedido.json: modelo, nome, caracteristicas)

1. base: o mascote de frente, neutro, num fundo chapado (chroma)
2. folhas: a base vai de referência e o modelo desenha 4x4 reações do MESMO personagem por folha
3. recorte: cada célula vira um PNG transparente em reacoes/<nome>.png, pronto pra animar no vídeo

Imagem pelo Workers AI da Cloudflare (FLUX.2), via o Worker forja-imagem (maquina/worker-imagem).
Grátis dentro da cota diária do Workers AI. Cada reação é uma edição da base, então o personagem não muda.
"""
import io, json, sys, time, urllib.request, urllib.error, uuid
from pathlib import Path
from PIL import Image, ImageFilter

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
MASC = RAIZ / "mascotes"
URL = "https://forja-imagem.tanpzdigital-183.workers.dev"
MODELO_BASE = "@cf/black-forest-labs/flux-2-dev"      # personagem de frente, mais caprichado
MODELO_REACAO = "@cf/black-forest-labs/flux-2-klein-9b"  # edita a base: ~5 s por reação, segura o personagem

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
        if k.strip() == "FORJA_IMG_CHAVE" and v.strip():
            return v.strip().strip("\"'")


def estado(d, **kw):
    f = d / "estado.json"
    e = json.loads(f.read_text()) if f.exists() else {}
    e.update(kw, desde=e.get("desde") or time.time())
    f.write_text(json.dumps(e, ensure_ascii=False))


def ref512(ref):
    """o FLUX.2 aceita referência de até 512 px"""
    im = Image.open(ref).convert("RGB")
    im.thumbnail((512, 512))
    b = io.BytesIO(); im.save(b, "PNG")
    return b.getvalue()


def gerar(modelo, texto, ref=None, tentativas=3, lado=1024, w=None, h=None):
    campos = {"prompt": texto, "modelo": modelo, "w": str(w or lado), "h": str(h or lado)}
    for k in range(tentativas):
        fr = uuid.uuid4().hex
        corpo = b"".join(f'--{fr}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode() for n, v in campos.items())
        if ref:
            corpo += f'--{fr}\r\nContent-Disposition: form-data; name="ref0"; filename="ref.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + ref512(ref) + b"\r\n"
        corpo += f"--{fr}--\r\n".encode()
        req = urllib.request.Request(URL, corpo, {"content-type": f"multipart/form-data; boundary={fr}", "x-chave": chave() or "", "user-agent": "Forja/1.0"})
        try:
            return urllib.request.urlopen(req, timeout=180).read()
        except urllib.error.HTTPError as er:
            msg = er.read().decode(errors="ignore")
            if er.code == 401:
                raise RuntimeError("O gerador de imagem recusou a chave. Rode a instalação de novo.")
            if "neuron" in msg.lower() or "quota" in msg.lower() or "4006" in msg:
                raise RuntimeError("A cota grátis de imagem de hoje acabou. Amanhã ela volta, toque em Tentar de novo.")
            if k < tentativas - 1:
                time.sleep(5 * (k + 1)); continue
            raise RuntimeError(f"O gerador de imagem falhou ({er.code}). Toque em Tentar de novo.")
        except (TimeoutError, urllib.error.URLError) as er:
            if k < tentativas - 1:
                time.sleep(5); continue
            raise RuntimeError("O gerador de imagem não respondeu. Toque em Tentar de novo.")


def chroma(cor):
    """fundo chapado que não briga com o mascote: verde, ou magenta se o mascote for verde"""
    return ("#FF00FF", (255, 0, 255)) if "verde" in cor.lower() or "green" in cor.lower() else ("#00FF00", (0, 255, 0))


def fundo(img, pedido):
    """cor do fundo de verdade: mediana da borda (o modelo pinta um verde parecido, não o #00FF00 exato)"""
    w, h = img.size
    px = [img.getpixel((x, y)) for x in range(0, w, 8) for y in (2, h - 3)] + [img.getpixel((x, y)) for y in range(0, h, 8) for x in (2, w - 3)]
    px = [p for p in px if abs(p[0] - pedido[0]) + abs(p[1] - pedido[1]) + abs(p[2] - pedido[2]) < 300] or [pedido]
    return tuple(sorted(c)[len(c) // 2] for c in zip(*px))


def recortar(img, chave_rgb, saida):
    """tira o fundo chapado (distância da cor-chave, com borda suave) e corta no personagem"""
    img = img.convert("RGB")
    chave_rgb = fundo(img, chave_rgb)
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
            if kg > max(kr, kb) and g > max(r, b) + 12:  # sombra esverdeada no chão: some junto com o fundo
                pa[x, y] = min(pa[x, y], max(0, int(255 * (1 - 1.6 * (g - max(r, b)) / max(1, kg - max(kr, kb))))))
            if kg > max(kr, kb) and g > max(r, b):  # despill: o verde que reflete no cabelo e na borda some
                px[x, y] = (r, max(r, b), b)
            elif kg < min(kr, kb) and min(r, b) > g:  # chave magenta
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
                (d / "base.png").write_bytes(gerar(MODELO_BASE,
                    f"Turn the person in this photo into a mascot character. Keep what makes them recognizable: face shape, hair, skin tone, "
                    f"glasses or beard if any, clothing colors. {('Extra details: ' + p['caracteristicas'] + '. ') if p.get('caracteristicas') else ''}"
                    f"Style: {estilo}. Full body, front view, neutral friendly pose, centered, plain flat solid {hexa} background, "
                    f"no shadow on the background, no text.", ref=foto))
            else:
                (d / "base.png").write_bytes(gerar(MODELO_BASE,
                    f"Character design of {quem}. Style: {estilo}. Full body, front view, neutral friendly pose, centered, "
                    f"plain flat solid {hexa} background, no shadow on the background, no text."))
        (d / "reacoes").mkdir(exist_ok=True)
        todas = [n for f in FOLHAS for n in f]
        for i, n in enumerate(todas, 1):
            png = d / "reacoes" / f"{n}.png"
            if png.exists():
                continue
            estado(d, status="gerando", fase=f"reação {i} de {len(todas)}")
            bruto = d / "reacoes" / f"_{n}.jpg"
            bruto.write_bytes(gerar(MODELO_REACAO,
                f"The same character from image 0 (identical design, colors, outfit and accessories, style: {estilo}), now {EN[n]}. "
                f"Expressive face and body language. Full body, centered with empty margin, plain flat solid {hexa} background, "
                f"no shadow on the background, no text.", ref=d / "base.png", lado=768))
            recortar(Image.open(bruto), rgb, png)
            bruto.unlink()
        recortar(Image.open(d / "base.png"), rgb, d / "mascote.png")
        estado(d, status="pronto", fase="")
    except Exception as er:
        estado(d, status="erro", fase="", erro=str(er))
        print(f"[mascote {id_}] {er}", file=sys.stderr)


if __name__ == "__main__":
    rodar(sys.argv[1])
