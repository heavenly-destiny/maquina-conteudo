"""Render rapido do nivel Simples: sem HyperFrames, so ffmpeg + legenda desenhada em Python.

O Simples tem o painel de cima parado (so o titulo), o video embaixo e a legenda palavra por palavra na divisao.
O painel sai de UM print do index.html no Chrome headless (mesmo visual do HyperFrames), a legenda sai do
caps.json que o organico.build() grava, e o ffmpeg monta tudo. Leva segundos em vez de minutos.

uso (dentro de edit/, depois do build.py e do mix.py): python simples.py . output.mp4
"""
import glob, json, os, re, subprocess, sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FPS, W, VH = 30, 1080, 960
FONTS = os.path.expanduser("~/Movies/maquina-conteudo/tools/assets/fonts")
TOP, SH = 700, 520  # faixa da legenda: centrada na divisao (y=960)


def chrome():
    pad = os.path.expanduser("~/.cache/hyperframes/chrome/**/chrome-headless-shell*")
    achou = [p for p in glob.glob(pad, recursive=True) if os.path.isfile(p) and os.access(p, os.X_OK) and not p.endswith((".dylib", ".dll"))]
    if not achou:
        raise RuntimeError("chrome-headless-shell do HyperFrames nao encontrado")
    return sorted(achou)[-1]


def painel(pub, out):
    """print do painel (fundo + titulo) no estado final, sem video nem legenda."""
    h = open(os.path.join(pub, "index.html"), encoding="utf-8").read()
    h = re.sub(r"<script\b.*?</script>", "", h, flags=re.S)
    cenas = re.findall(r'class="scene clip" id="([^"]+)"', h)
    esconde = ",".join(["#vframe", ".cap", ".take", ".mostra", "#streak", "#flash"] + [f"#{c}" for c in cenas[1:]])
    h = h.replace("</head>", f"<style>{esconde}{{display:none!important}}</style></head>")
    tmp = os.path.join(pub, "_painel.html")
    open(tmp, "w", encoding="utf-8").write(h)
    subprocess.run([chrome(), "--headless", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1920",
                    "--virtual-time-budget=4000", "--allow-file-access-from-files", f"--screenshot={os.path.abspath(out)}",
                    "file://" + os.path.abspath(tmp)], check=True, capture_output=True, timeout=60)
    os.remove(tmp)


def degrade(out):
    """vframe::after: escurece o topo e a base do video pra legenda e o painel colarem."""
    y = np.linspace(0, 1, VH)[:, None]
    a = np.where(y < .12, .6 * (1 - y / .12), np.where(y > .8, .5 * (y - .8) / .2, 0))
    img = np.zeros((VH, W, 4), np.uint8)
    img[..., 0], img[..., 1], img[..., 2] = 11, 4, 6
    img[..., 3] = np.repeat((a * 255).astype(np.uint8), W, axis=1)
    Image.fromarray(img, "RGBA").save(out)


# ---------------- legenda ----------------
SANS = ImageFont.truetype(f"{FONTS}/Outfit-Variable.ttf", 60)
try:
    SANS.set_variation_by_axes([600])
except Exception:
    pass
SERIF = ImageFont.truetype(f"{FONTS}/InstrumentSerif-Italic.ttf", 102)
PAD = 110
SOMBRAS = [(1, 2, .5), (12, 0, .85), (30, 0, .7), (55, 0, .5)]  # (sigma, dy, alpha) ~ text-shadow do style.css


SANS_FORTE = ImageFont.truetype(f"{FONTS}/Outfit-Variable.ttf", 64)
try:
    SANS_FORTE.set_variation_by_axes([800])
except Exception:
    pass
ESTILO = "padrao"  # estilo de legenda do editor: padrao (serifa vermelha), amarelo, branco, caixa


def sprite(txt, kw):
    if ESTILO == "padrao" or not kw:
        f = SERIF if kw else SANS
        cor = (255, 59, 71) if kw else (255, 255, 255)
    else:
        f, cor = SANS_FORTE, {"amarelo": (255, 214, 10), "branco": (255, 255, 255), "caixa": (11, 2, 4)}[ESTILO]
        kw = False  # sem o brilho vermelho da serifa
    x0, y0, x1, y1 = f.getbbox(txt)
    w, h = x1 - x0, y1 - y0
    m = Image.new("L", (w + 2 * PAD, h + 2 * PAD), 0)
    ImageDraw.Draw(m).text((PAD - x0, PAD - y0), txt, font=f, fill=255)
    a = np.zeros(m.size[::-1], np.float32)
    for sig, dy, al in SOMBRAS:
        b = np.asarray(m.filter(ImageFilter.GaussianBlur(sig)), np.float32) / 255 * al
        if dy:
            b = np.roll(b, dy, axis=0)
        a = 1 - (1 - a) * (1 - b)
    if kw:  # brilho vermelho da palavra-chave
        g = np.asarray(m.filter(ImageFilter.GaussianBlur(20)), np.float32) / 255 * .35
    t = np.asarray(m, np.float32) / 255
    rgb = np.zeros(a.shape + (3,), np.float32)
    if kw:
        rgb[:] = np.array([225, 29, 42], np.float32) * (g / np.maximum(a + g, 1e-6))[..., None]
        a = 1 - (1 - a) * (1 - g)
    out_a = t + a * (1 - t)
    rgb = (np.array(cor, np.float32) * t[..., None] + rgb * (a * (1 - t))[..., None]) / np.maximum(out_a, 1e-6)[..., None]
    img = np.dstack([rgb, out_a * 255]).clip(0, 255).astype(np.uint8)
    if ESTILO == "caixa":  # palavra numa caixinha: preta, ou amarela na palavra-chave
        im = Image.fromarray(img, "RGBA")
        cx = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(cx).rounded_rectangle((PAD - 14, PAD - 10, PAD + w + 14, PAD + h + 14), 10, fill=(255, 214, 10, 255) if cor == (11, 2, 4) else (11, 2, 4, 255))
        cx.alpha_composite(Image.fromarray(np.dstack([np.asarray(im)[..., :3], (t * 255).astype(np.uint8)]), "RGBA"))
        img = np.asarray(cx)
    # "base" = linha de base dentro do sprite (o texto foi desenhado com o topo da ascendente em PAD - y0)
    return {"img": Image.fromarray(img, "RGBA"), "w": w, "base": PAD - y0 + f.getmetrics()[0]}


def layout(ch):
    """quebra as palavras em linhas de no max 960px (gap 16) e centraliza o bloco na divisao."""
    ws = [dict(w, sp=sprite(w["text"], w["kw"])) for w in ch["w"]]
    linhas, cur, larg = [], [], 0
    for w in ws:
        add = w["sp"]["w"] + (16 if cur else 0)
        if cur and larg + add > 960:
            linhas.append(cur); cur, larg = [], 0; add = w["sp"]["w"]
        cur.append(w); larg += add
    if cur:
        linhas.append(cur)
    # altura de linha: 66 (sans 60 x 1.1) ou 92 (serif 102 x .9); linha de base em ~80% da altura
    alts = [max(92 if w["kw"] else 66 for w in l) for l in linhas]
    y = SH / 2 - sum(alts) / 2
    for l, ah in zip(linhas, alts):
        tot = sum(w["sp"]["w"] for w in l) + 16 * (len(l) - 1)
        x = W / 2 - tot / 2
        base = y + ah * .8
        for w in l:
            w["x"], w["y"] = x - PAD, base - w["sp"]["base"]
            x += w["sp"]["w"] + 16
        y += ah
    return ws


def back_out(p, s=1.6):
    p -= 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


def legenda(caps, out_pipe, n):
    chunks = caps["chunks"]
    esconde = caps.get("esconde") or []
    lay = {}
    vazio = bytes(W * SH * 4)
    ultimo, ultimo_b = None, None
    k = 0
    for i in range(n):
        t = i / FPS
        while k + 1 < len(chunks) and chunks[k + 1]["s"] <= t + 1e-6:
            k += 1
        c = chunks[k] if chunks else None
        if not c or not (c["s"] <= t < c["e"]) or any(a <= t < b for a, b in esconde):
            out_pipe.write(vazio); continue
        if k not in lay:
            lay.clear(); lay[k] = layout(c)
        estado = []
        for j, w in enumerate(lay[k]):
            p = min(1.0, max(0.0, (t - w["t"]) / 0.24)) if t >= w["t"] else -1
            estado.append(round(p, 3))
        chave = (k, tuple(estado))
        if chave == ultimo:
            out_pipe.write(ultimo_b); continue
        tela = Image.new("RGBA", (W, SH), (0, 0, 0, 0))
        for w, p in zip(lay[k], estado):
            if p < 0:
                continue
            e = back_out(p) if p < 1 else 1.0
            op = min(1.0, max(0.0, e))
            sc = .9 + .1 * e
            im = w["sp"]["img"]
            if abs(sc - 1) > 1e-3:
                im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.BILINEAR)
            if op < 1:
                a = np.asarray(im).copy(); a[..., 3] = (a[..., 3] * op).astype(np.uint8); im = Image.fromarray(a, "RGBA")
            sw, sh = w["sp"]["img"].size
            x = round(w["x"] + (sw - im.width) / 2)
            y = round(w["y"] + (sh - im.height) / 2 + 22 * (1 - e))
            tela.alpha_composite(im, (x, y)) if x >= 0 and y >= 0 and x + im.width <= W and y + im.height <= SH else _cola(tela, im, x, y)
        b = tela.tobytes()
        ultimo, ultimo_b = chave, b
        out_pipe.write(b)


def _cola(tela, im, x, y):
    """alpha_composite com recorte quando o sprite (com a sombra) passa da borda da faixa."""
    cx0, cy0 = max(0, -x), max(0, -y)
    cx1, cy1 = min(im.width, W - x), min(im.height, SH - y)
    if cx1 > cx0 and cy1 > cy0:
        tela.alpha_composite(im.crop((cx0, cy0, cx1, cy1)), (x + cx0, y + cy0))


def main(ed, saida):
    ed = os.path.abspath(ed)
    global ESTILO
    caps = json.load(open(f"{ed}/caps.json"))
    ESTILO = caps.get("legenda") or "padrao"
    dur = caps["dur"]
    n = round(dur * FPS)
    pub = f"{ed}/public"
    pn, gr = f"{ed}/_painel.png", f"{ed}/_degrade.png"
    painel(pub, pn)
    degrade(gr)
    # enquadramento alternado nos cortes (zoom 1.12 com origem 42%/38% do quadro de baixo)
    zs = sorted(caps.get("zooms") or [], key=lambda z: z["t"])
    trechos = [(z["t"], zs[i + 1]["t"] if i + 1 < len(zs) else dur) for i, z in enumerate(zs) if z["z"] > 1.01]
    src = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", f"{ed}/video.mp4"]))["streams"][0]
    sw = round(src["width"] * VH / src["height"] / 2) * 2
    cx = round((sw - W) * .10)  # object-position 10% 50%
    zw, zh = round(W * 1.12 / 2) * 2, round(VH * 1.12 / 2) * 2
    fc = f"[0:v]fps={FPS},scale={sw}:{VH},crop={W}:{VH}:{cx}:0,setsar=1,split[a][z];"
    if trechos:
        en = "+".join(f"between(t,{a:.3f},{b - 0.001:.3f})" for a, b in trechos)
        fc += f"[z]scale={zw}:{zh},crop={W}:{VH}:{round(.42 * W * .12)}:{round(.38 * VH * .12)}[zz];[a][zz]overlay=enable='{en}'[v];"
    else:
        fc += "[z]nullsink;[a]null[v];"
    br = caps.get("broll") or []
    extra, cur = [], "v"
    for i, b in enumerate(br):
        k = 4 + i
        arq = os.path.join(ed, "public", b["arq"])
        if b["arq"].lower().endswith((".mp4", ".mov")):
            extra += ["-i", arq]
        else:
            extra += ["-loop", "1", "-framerate", str(FPS), "-i", arq]
        fc += (f"[{k}:v]fps={FPS},scale={W}:{VH}:force_original_aspect_ratio=increase,crop={W}:{VH},setsar=1,"
               f"setpts=PTS-STARTPTS+{b['a']:.3f}/TB[b{i}];[{cur}][b{i}]overlay=0:0:eof_action=pass:enable='between(t,{b['a']:.3f},{b['b']:.3f})'[vb{i}];")
        cur = f"vb{i}"
    fc += (f"[{cur}][2:v]overlay[v2];[1:v][v2]overlay=0:{VH}:shortest=1[f];"
           f"[f][3:v]overlay=0:{TOP}:eof_action=pass,format=yuv420p[out]")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", f"{ed}/video.mp4", "-loop", "1", "-framerate", str(FPS), "-i", pn, "-i", gr,
           "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{SH}", "-r", str(FPS), "-i", "-", *extra,
           "-filter_complex", fc, "-map", "[out]", "-frames:v", str(n), "-r", str(FPS),
           "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        legenda(caps, p.stdin, n)
    finally:
        p.stdin.close()
    if p.wait():
        raise SystemExit("ffmpeg falhou")
    for f in (pn, gr):
        os.remove(f)
    print(f"simples ok {dur:.2f}s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
