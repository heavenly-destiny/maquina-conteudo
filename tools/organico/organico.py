"""Biblioteca do estilo organico (tela dividida 9:16, vinho + vermelho #e11d2a), extraida do piloto 11 aprovado.

Cada corte tem um build.py curto que:
    import sys; sys.path.insert(0, os.path.expanduser("~/Movies/maquina-conteudo/tools/organico"))
    from organico import *
    init("/caminho/do/corte")          # pasta com video.mp4, voice.wav, words.json, cuts.json
    t = {"x": W("palavra"), ...}       # tempos tirados da fala
    scenes([("s1", 0, t["y"]), ...])   # cenas do painel (id, inicio, fim); fim None = final
    scene("s1", html)                  # html de cada cena (coordenadas locais 0-870 de altura, 1080 de largura)
    ... helpers de animacao ...
    takeover("nome", at, dur, inner_html)   # tela cheia: legenda da fala some
    zoom_on([(t, 1.2), ...])                # punch-in do video em palavras-chave
    build(emph={"palavra", ...}, fix={"errado": "certo"})

Regras do tanpz embutidas: legenda na divisao (y=960) sem caixa, so sombra; legenda some na tela cheia;
motion inteiro acima da legenda (cena escalada .9, conteudo local ate ~870); transicoes alternadas
(zoom-through, push com smear, varredura de luz); clique em palavra-chave; cards sempre flutuando.
"""
import json, os, re, shutil, unicodedata, html as _html, subprocess, random

FPS = 30
TOOLS = os.path.expanduser("~/Movies/maquina-conteudo/tools")
HERE = os.path.dirname(os.path.abspath(__file__))
GSAP = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "vendor", "gsap.min.js")

OUT = None
words, cuts, DUR = [], [], 0.0
js, sfx = [], []
SC, H, TK = [], {}, []
MOSTRA = []
esc = _html.escape


AJ = {}  # ajustes do editor da Forja (pasta do corte/ajustes.json): texto, destaque e titulo


def init(out):
    global OUT, DUR
    OUT = os.path.abspath(out)
    f = os.path.join(os.path.dirname(OUT), "ajustes.json")
    AJ.clear(); AJ.update(json.load(open(f)) if os.path.exists(f) else {})
    words[:] = json.load(open(f"{OUT}/words.json"))
    cuts[:] = json.load(open(f"{OUT}/cuts.json"))
    DUR = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{OUT}/voice.wav"]))
    js.clear(); sfx.clear(); SC.clear(); H.clear(); TK.clear()


LEGENDAS = {  # estilo de legenda escolhido no editor (o padrão é o do style.css)
    "amarelo": ".cap .kw{font-family:inherit;font-style:normal;font-weight:800;font-size:1.12em;line-height:1.1;color:#ffd60a;text-shadow:0 2px 0 rgba(0,0,0,.4),0 8px 30px rgba(0,0,0,.6)}",
    "branco": ".cap .kw{font-family:inherit;font-style:normal;font-weight:800;font-size:1em;line-height:1.1;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.4),0 8px 30px rgba(0,0,0,.6)}",
    "caixa": ".cap span{background:#0b0204;padding:2px 14px;border-radius:10px;text-shadow:none}.cap .kw{font-family:inherit;font-style:normal;font-weight:800;font-size:1em;line-height:1.1;color:#0b0204;background:#ffd60a;text-shadow:none}",
}


def broll_tempos():
    """b-roll do ajustes.json em segundos do corte: da primeira palavra 'de' até o fim da palavra 'ate'"""
    ini = {w.get("key"): w for w in words if w.get("key")}
    out = []
    for b in AJ.get("broll") or []:
        a, z = ini.get(b.get("de")), ini.get(b.get("ate"))
        if not a or not z:
            continue
        s0, s1 = q(max(0.0, a["start"] - 0.05)), q(min(DUR, z.get("end", z["start"] + 0.4) + 0.1))
        if s1 - s0 >= 0.4:
            out.append({"a": s0, "b": s1, "arq": b["arq"]})
    return out


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def W(txt, after=0.0):
    """inicio da primeira palavra 'txt' (sem acento/pontuacao) depois de 'after'."""
    for w in words:
        if w["start"] >= after - 0.01 and norm(w["text"]) == norm(txt):
            return w["start"]
    if AJ.get("remover"):  # a pessoa apagou essa palavra no editor: a animacao cai na palavra seguinte
        return next((w["start"] for w in words if w["start"] >= after - 0.01), max(0.0, DUR - 0.5))
    raise KeyError(f"{txt} depois de {after}")


def q(t):
    return round(t * FPS) / FPS


def S(name, t, gain=0.0, pan=0.0):
    """efeito sonoro (tools/assets/sfx/<name>.mp3; 'click' sintetizado; 'drop' corta a trilha)."""
    sfx.append({"name": name, "t": round(max(0, t), 3), "gain": gain, "pan": pan})


def T(line):
    js.append(line)


def scenes(lst):
    """[(id, inicio, fim)]; fim=None = ate o final do video."""
    SC.extend((i, q(a), q(DUR if b is None else b)) for i, a, b in lst)


def scene(sid, inner):
    a, b = next((a, b) for i, a, b in SC if i == sid)
    H[sid] = f'<div class="scene clip" id="{sid}" data-start="{a}" data-duration="{b - a:.4f}" data-track-index="2"><div class="inner" id="{sid}-in">\n{inner}</div></div>'


# ---------------- pecas de html ----------------
def head(id_, parts, top, size=78):
    """headline. parts = [("texto", destaque?, tempo)]. destaque = serifada italica vermelha."""
    spans = "".join(f'<span id="{id_}-{k}" class="{"key" if key else ""}">{esc(w)}</span>' for k, (w, key, _) in enumerate(parts))
    return f'<div class="head" id="{id_}" style="top:{top}px;font-size:{size}px">{spans}</div>'


def cursor(id_, left, top):
    return f'<div class="cursor" id="{id_}" style="left:{left}px;top:{top}px"><i class="rip"></i></div>'


def burst(id_, x, y, n=14):
    return f'<div class="burst" id="{id_}" style="left:{x}px;top:{y}px">' + "<i></i>" * n + "</div>"


def stream(id_, text):
    return f'<span class="stream" id="{id_}">' + "".join(f'<span id="{id_}-{k}">{esc(w)}</span>' for k, w in enumerate(text.split())) + "</span>"


def progress_card(id_, label, top):
    return f'<div class="ui prog" id="{id_}" style="top:{top}px"><div class="ph"><span>{esc(label)}</span><b id="{id_}-n">0%</b></div><div class="pt2"><i id="{id_}-b"></i></div></div>'


# ---------------- animacoes ----------------
def head_in(id_, parts):
    for k, (_, _, at) in enumerate(parts):
        T(f"tl.fromTo('#{id_}-{k}',{{opacity:0,y:34,rotationX:55,filter:'blur(14px)'}},{{opacity:1,y:0,rotationX:0,filter:'blur(0px)',duration:0.32,ease:'power3.out'}},{q(at - 0.06)});")


def out(sel, at, dy=-60):
    T(f"tl.to('{sel}',{{opacity:0,y:{dy},filter:'blur(14px)',duration:0.3,ease:'power2.in'}},{q(at)});")


def recede(sel, at):
    """card sai de foco pro fundo quando o proximo entra."""
    T(f"tl.to('{sel}',{{y:-50,scale:0.86,opacity:0.35,filter:'blur(2px)',duration:0.6,ease:'power3.inOut'}},{q(at)});")


def pop(sel, at, sound="pop", gain=-8.0, pan=0.0, rot=-6):
    T(f"tl.fromTo('{sel}',{{opacity:0,scale:0.6,rotation:{rot},filter:'blur(12px)'}},{{opacity:1,scale:1,rotation:0,filter:'blur(0px)',duration:0.5,ease:'back.out(1.7)'}},{q(at)});")
    if sound:
        S(sound, at + 0.18, gain, pan)


def rise(sel, at, dy=120, sound="land", gain=6.0):
    T(f"tl.fromTo('{sel}',{{opacity:0,y:{dy},rotationX:28,scale:0.92,filter:'blur(14px)'}},{{opacity:1,y:0,rotationX:0,scale:1,filter:'blur(0px)',duration:0.7,ease:'expo.out'}},{q(at)});")
    if sound:
        S(sound, at + 0.35, gain)


def drop_in(sel, at, sound="pop", gain=-6.0):
    """notificacao caindo de cima."""
    T(f"tl.fromTo('{sel}',{{opacity:0,y:-160,scale:1.12,filter:'blur(16px)'}},{{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:0.6,ease:'expo.out'}},{q(at)});")
    if sound:
        S(sound, at + 0.2, gain)


def side_in(sel, at, frm=-300, sound="land", gain=8.0):
    T(f"tl.fromTo('{sel}',{{opacity:0,x:{frm},rotationY:{35 if frm < 0 else -35},filter:'blur(16px)'}},{{opacity:1,x:0,rotationY:0,filter:'blur(0px)',duration:0.65,ease:'expo.out'}},{q(at)});")
    if sound:
        S(sound, at + 0.3, gain, -0.5 if frm < 0 else 0.5)


def gloss(sel, at):
    T(f"tl.fromTo('{sel} .gloss i',{{x:-400}},{{x:1100,duration:0.8,ease:'power2.inOut'}},{q(at)});")


def check(sel, at):
    T(f"tl.fromTo('{sel}',{{scale:0,rotation:-30}},{{scale:1,rotation:0,duration:0.45,ease:'back.out(2.6)'}},{q(at)});")
    T(f"tl.fromTo('{sel} .ring',{{scale:0.6,opacity:0.9}},{{scale:2.4,opacity:0,duration:0.6,ease:'power2.out'}},{q(at + 0.05)});")
    S("ding", at + 0.1, -10.0)


def click(cur, at, btn=None, frm=(260, 200)):
    """cursor entra, aperta (botao afunda) e solta uma onda no clique. 'at' = instante do clique."""
    T(f"tl.fromTo('#{cur}',{{opacity:0,x:{frm[0]},y:{frm[1]}}},{{opacity:1,x:0,y:0,duration:0.45,ease:'power3.out'}},{q(at - 0.5)});")
    T(f"tl.to('#{cur}',{{scale:0.82,duration:0.07,yoyo:true,repeat:1}},{q(at)});")
    T(f"tl.fromTo('#{cur} .rip',{{scale:0.3,opacity:1}},{{scale:2.2,opacity:0,duration:0.5,ease:'power2.out'}},{q(at + 0.02)});")
    if btn:
        T(f"tl.to('#{btn}',{{scale:0.92,duration:0.08,yoyo:true,repeat:1}},{q(at)});")
    S("click", at, -4.0)


def confetti(id_, at, spread=260):
    """explosao de confete (html via burst())."""
    rnd = random.Random(hash(id_) & 0xffff)
    for k in range(14):
        ang = k / 14 * 6.283 + rnd.uniform(-0.2, 0.2)
        d = rnd.uniform(0.6, 1.0) * spread
        import math
        T(f"tl.fromTo('#{id_} i:nth-child({k + 1})',{{x:0,y:0,opacity:1,rotation:0,scale:1}},{{x:{math.cos(ang) * d:.0f},y:{math.sin(ang) * d + 60:.0f},opacity:0,rotation:{rnd.randint(-260, 260)},scale:0.6,duration:0.9,ease:'power2.out'}},{q(at)});")
    S("confetti", at, -10.0)


def stream_in(id_, text, at, dur):
    """palavras do texto aparecem em fluxo (chat de IA respondendo)."""
    n = len(text.split())
    for k in range(n):
        T(f"tl.fromTo('#{id_}-{k}',{{opacity:0,y:10,filter:'blur(6px)'}},{{opacity:1,y:0,filter:'blur(0px)',duration:0.18}},{q(at + k * dur / max(1, n))});")


def counter(el_id, to, at, dur=1.0, dec=0, prefix="", suffix="", comma=True):
    T(f"(function(){{const o={{v:0}};tl.to(o,{{v:{to},duration:{dur},ease:'power2.out',onUpdate:function(){{const e=document.getElementById('{el_id}');if(e)e.textContent='{prefix}'+o.v.toFixed({dec}){'.replace(\".\",\",\")' if comma else ''}+'{suffix}';}}}},{q(at)});}})();")
    S("tick", at, -14.0)


def progress(id_, at, dur=1.2, to=100):
    T(f"tl.fromTo('#{id_}-b',{{scaleX:0}},{{scaleX:{to / 100},duration:{dur},ease:'power2.inOut'}},{q(at)});")
    counter(f"{id_}-n", to, at, dur, suffix="%")


def wire(sel, at, dur=0.5):
    T(f"tl.to('{sel}',{{scaleX:1,duration:{dur},ease:'power2.inOut'}},{q(at)});")
    S("swish", at, 4.0)


def bars(ids, at, step=0.22):
    for k, b in enumerate(ids):
        T(f"tl.fromTo('#{b}',{{scaleY:0}},{{scaleY:1,duration:0.6,ease:'expo.out'}},{q(at + k * step)});")
        S("tick", at + k * step + 0.15, -14.0 + k * 1.5)


def shake(sel, at):
    T(f"tl.fromTo('{sel}',{{x:0}},{{x:14,duration:0.05,repeat:5,yoyo:true,ease:'none'}},{q(at)});")


def stamp(sel, at):
    T(f"tl.fromTo('{sel}',{{opacity:0,scale:2.2,rotation:-18}},{{opacity:1,scale:1,rotation:-8,duration:0.28,ease:'power4.in'}},{q(at)});")
    S("impact", at + 0.27, -4.0)


def takeover(name, at, dur, inner):
    """tela cheia estilo VTurb. Classes: tk-s (linha pequena), tk-w (palavra gigante; .num amarelo, .red vermelho),
    tk-it (serifada italica vermelha; .big). Durante ela a legenda da fala some."""
    TK.append((name, q(at), dur, inner))


ZOOMS = []


def zoom_on(lst):
    """[(tempo, escala)] punch-in no video em palavras-chave."""
    ZOOMS.extend(lst)


# ---------------- montagem ----------------
def build(emph=(), fix=None, music="bed-tech-01.mp3"):
    fix = fix or {}
    sids = [i for i, _, _ in SC]
    assert set(sids) == set(H), f"cena sem html: {set(sids) ^ set(H)}"
    # transicoes alternadas
    for i in range(1, len(SC)):
        a, b, tt = SC[i - 1][0], SC[i][0], SC[i][1]
        kind = i % 3
        if kind == 0:
            T(f"tl.to('#{a}-in',{{scale:1.8,opacity:0,filter:'blur(30px)',duration:0.32,ease:'power3.in'}},{q(tt - 0.3)});")
            T(f"tl.fromTo('#{b}-in',{{scale:0.7,opacity:0,filter:'blur(30px)'}},{{scale:1,opacity:1,filter:'blur(0px)',duration:0.45,ease:'expo.out'}},{q(tt)});")
            S("whoosh", tt - 0.32, -8.0)
        elif kind == 1:
            T(f"tl.fromTo('#{b}-in',{{x:1080,filter:'blur(40px)'}},{{x:0,filter:'blur(0px)',duration:0.36,ease:'power3.out'}},{q(tt)});")
            T(f"tl.to('#{a}-in',{{x:-900,filter:'blur(40px)',opacity:0,duration:0.3,ease:'power3.in'}},{q(tt - 0.3)});")
            S("passby", tt - 0.3, -9.0)
        else:
            T(f"tl.fromTo('#streak',{{x:-1300,opacity:1}},{{x:1300,opacity:1,duration:0.5,ease:'power2.inOut'}},{q(tt - 0.25)});")
            T(f"tl.to('#{a}-in',{{y:-200,opacity:0,filter:'blur(24px)',duration:0.3,ease:'power3.in'}},{q(tt - 0.25)});")
            T(f"tl.fromTo('#{b}-in',{{y:260,opacity:0,filter:'blur(24px)'}},{{y:0,opacity:1,filter:'blur(0px)',duration:0.5,ease:'expo.out'}},{q(tt)});")
            S("swish", tt - 0.25, 6.0)
        T(f"tl.fromTo('#flash',{{opacity:0.0}},{{opacity:0.22,duration:0.06,yoyo:true,repeat:1}},{q(tt - 0.04)});")
    # movimento continuo dos cards
    rnd = random.Random(11)
    for sid, a, b in SC:
        block = H[sid]
        ids = re.findall(r'class="ui[^"]*" id="([^"]+)"', block) + re.findall(r'id="([^"]+)" class="ui[^"]*"', block)
        for n, uid in enumerate(ids):
            dur = max(1.2, (b - a) / 2)
            reps = max(1, int((b - a) / dur))
            # balanco em propriedades CSS independentes (rotate/translate): nao briga com o x/y/rotation das entradas
            r0, r1 = -4 + n * 3, 4 - n * 3
            T(f"tl.fromTo('#{uid}',{{'--ry':'{r0}deg'}},{{'--ry':'{r1}deg',duration:{dur:.2f},ease:'sine.inOut',yoyo:true,repeat:{reps}}},{a});")
            T(f"tl.fromTo('#{uid}',{{'--fy':'0px'}},{{'--fy':'-12px',duration:{dur * 0.8:.2f},ease:'sine.inOut',yoyo:true,repeat:{reps + 1}}},{a});")
            if 'gloss' in block:
                T(f"tl.fromTo('#{uid} .gloss i',{{x:-400}},{{x:1100,duration:0.9,ease:'power2.inOut'}},{q(a + 1.0 + n * 0.4)});")
        T(f"tl.fromTo('#{sid}-in',{{scale:1}},{{scale:1.05,duration:{b - a:.3f},ease:'none'}},{a});")
    part = "".join(f'<i class="pt" id="pt{k}" style="left:{rnd.randint(20, 1060)}px;top:{rnd.randint(120, 940)}px;width:{rnd.choice([4, 6, 8])}px;height:{rnd.choice([4, 6, 8])}px"></i>' for k in range(26))
    for k in range(26):
        T(f"tl.fromTo('#pt{k}',{{y:0,opacity:0}},{{y:-{rnd.randint(140, 420)},opacity:{rnd.choice([0.35, 0.5, 0.7])},duration:{rnd.uniform(4, 8):.2f},ease:'none',repeat:{int(DUR / 5) + 1},repeatDelay:{rnd.uniform(0, 2):.2f}}},{rnd.uniform(0, 4):.2f});")
    T(f"tl.fromTo('#glow',{{scale:0.9}},{{scale:1.15,duration:3,ease:'sine.inOut',yoyo:true,repeat:{int(DUR / 3)}}},0);")
    # video: alterna enquadramento nos cortes, flash leve, punch-in nas palavras
    z = [1.0, 1.12]
    for k, c in enumerate([c for c in cuts if c["new_seg"]]):
        T(f"tl.set('#vzoom',{{scale:{z[k % 2]}}},{q(c['t'])});")
    # sem flash branco nos cortes (tanpz 18/11: "parte esbranquicada ficou feio")
    for at, amt in ZOOMS:
        T(f"tl.to('#vwrap',{{scale:{amt},duration:0.35,ease:'power3.out'}},{q(at - 0.1)});")
        T(f"tl.to('#vwrap',{{scale:1,duration:0.6,ease:'power2.inOut'}},{q(at + 0.9)});")
        S("swish", at - 0.1, 14.0)
    # legenda na divisao, palavra-chave serifada + clique
    EMPH = {norm(x) for x in emph}
    tx, kwa = AJ.get("texto") or {}, AJ.get("kw") or {}
    cw = [dict(w, text=tx.get(w.get("key"), fix.get(w["text"], w["text"]))) for w in words
          if tx.get(w.get("key"), fix.get(w["text"], w["text"]))]

    def ehkw(w):
        return kwa[w["key"]] if w.get("key") in kwa else norm(w["text"]) in EMPH
    chunks, cur = [], []
    for i, w in enumerate(cw):
        cur.append(w)
        nxt = cw[i + 1] if i + 1 < len(cw) else None
        if len(cur) >= 3 or re.search(r"[.,?!]$", w["text"]) or nxt is None or nxt["start"] - w["start"] > 0.9:
            chunks.append(cur); cur = []
    caps, capt = [], []
    for k, ch in enumerate(chunks):
        s = q(max(0, ch[0]["start"] - 0.04))
        nxt = q(chunks[k + 1][0]["start"] - 0.04) if k + 1 < len(chunks) else q(DUR)
        e = min(nxt, q(ch[-1]["start"] + 1.2))
        if e - s < 0.2:
            e = nxt
        sp = " ".join(f'<span id="w{k}_{j}" class="{"kw" if ehkw(w) else ""}">{esc(w["text"].strip(".,?!"))}</span>' for j, w in enumerate(ch))
        caps.append(f'<div class="cap clip" id="cap{k}" data-start="{s:.4f}" data-duration="{e - s:.4f}" data-track-index="5">{sp}</div>')
        capt.append((k, s, e))
        for j, w in enumerate(ch):
            T(f"tl.fromTo('#w{k}_{j}',{{opacity:0,y:22,scale:0.9,filter:'blur(12px)'}},{{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:0.24,ease:'back.out(1.6)'}},{q(max(s, w['start'] - 0.04))});")
            if ehkw(w):
                S("click", max(s, w["start"] - 0.02), -12.0)
    # vídeo que ele dá play no monitor: a imagem fica a gravação dele, SÓ o áudio vira o do arquivo original (mix.py).
    # Regra 18/11: nunca colocar o vídeo em tela cheia por cima. Aqui só tira SFX e legenda do trecho.
    mostra = json.load(open(f"{OUT}/mostrar.json")) if os.path.exists(f"{OUT}/mostrar.json") else []
    msh = []
    for m in mostra:
        a, d = q(m["at"]), m["dur"]
        sfx[:] = [x for x in sfx if not (a - 0.2 <= x["t"] <= a + d)]
    MOSTRA[:] = [(q(m["at"]), m["dur"]) for m in mostra]
    # telas cheias
    tkh = []
    for n, a, d, inner in TK:
        tkh.append(f'<div class="take clip" id="tk-{n}" data-start="{a}" data-duration="{d:.4f}" data-track-index="7"><div class="tk-in" id="tki-{n}">{inner}</div></div>')
        T(f"tl.fromTo('#tki-{n}',{{scale:1.25,filter:'blur(30px)',opacity:0}},{{scale:1,filter:'blur(0px)',opacity:1,duration:0.35,ease:'expo.out'}},{a});")
        T(f"tl.fromTo('#tki-{n}',{{y:0}},{{y:-20,duration:{d},ease:'none'}},{a});")
        T(f"tl.fromTo('#tk-{n}',{{clipPath:'inset(0% 0% 0% 0%)'}},{{clipPath:'inset(0% 0% 100% 0%)',duration:0.28,ease:'power3.in'}},{q(a + d - 0.28)});")
        S("impact", a + 0.05, -6.0); S("whoosh", a + d - 0.3, -12.0)
        for k, cs, ce in capt:
            if cs < a + d and ce > a:
                T(f"tl.set('#cap{k}',{{autoAlpha:0}},{max(cs, a - 0.02):.3f});")
                if ce > a + d:
                    T(f"tl.set('#cap{k}',{{autoAlpha:1}},{q(a + d)});")
    for a, d in MOSTRA:
        for k, cs, ce in capt:
            if cs < a + d and ce > a:
                T(f"tl.set('#cap{k}',{{autoAlpha:0}},{max(cs, a - 0.02):.3f});")
                if ce > a + d:
                    T(f"tl.set('#cap{k}',{{autoAlpha:1}},{q(a + d)});")
    # pro render rapido do nivel Simples (simples.py): legendas com tempo por palavra + trechos onde a legenda some
    json.dump({"dur": DUR, "chunks": [{"s": s, "e": e, "w": [{"t": q(max(s, w["start"] - 0.04)), "text": w["text"].strip(".,?!"),
               "kw": ehkw(w), "k": w.get("key")} for w in chunks[k]]} for k, s, e in capt],
               "zooms": [{"t": q(c["t"]), "z": z[k % 2]} for k, c in enumerate([c for c in cuts if c["new_seg"]])],
               "esconde": [[a, a + d] for _, a, d, _ in TK] + [[a, a + d] for a, d in MOSTRA],
               "legenda": AJ.get("legenda") or "padrao", "broll": broll_tempos()},
              open(f"{OUT}/caps.json", "w"))
    for velho, novo in (AJ.get("painel") or {}).items():  # titulo trocado no editor
        for sid in H:
            H[sid] = H[sid].replace(f">{esc(velho)}<", f">{esc(novo)}<")
    css = open(os.path.join(HERE, "style.css")).read() + LEGENDAS.get(AJ.get("legenda") or "padrao", "") + """
.broll{position:absolute;inset:0;z-index:3;opacity:0;overflow:hidden;background:#000}
.broll img,.broll video{width:100%;height:100%;object-fit:cover}
.mostra{position:absolute;inset:0;z-index:60;background:#0b0204;overflow:hidden}
.mostra .ms-bg{position:absolute;inset:-60px;width:calc(100% + 120px);height:calc(100% + 120px);object-fit:cover;filter:blur(40px) brightness(.45) saturate(1.2)}
.mostra .ms-v{position:absolute;left:0;top:50%;width:1080px;transform-origin:center;translate:0 -50%;border-radius:0;box-shadow:0 40px 120px rgba(0,0,0,.6)}
"""
    brh = ""  # b-roll do editor: cobre o vídeo de baixo no trecho escolhido (a fala continua)
    for i, b in enumerate(broll_tempos()):
        a, z = b["a"], b["b"]
        if b["arq"].lower().endswith((".mp4", ".mov")):
            el = f'<video src="{b["arq"]}" muted playsinline data-start="{a:.4f}" data-duration="{z - a:.4f}" data-track-index="{20 + i}"></video>'
        else:
            el = f'<img id="bri{i}" src="{b["arq"]}" alt="">'
            T(f"tl.fromTo('#bri{i}',{{scale:1}},{{scale:1.08,duration:{z - a:.3f},ease:'none'}},{q(a)});")
        brh += f'<div class="broll" id="br{i}">{el}</div>'
        T(f"tl.fromTo('#br{i}',{{opacity:0}},{{opacity:1,duration:0.18}},{q(a)});")
        T(f"tl.to('#br{i}',{{opacity:0,duration:0.18}},{q(z - 0.18)});")
    page = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{css}</style></head><body>
<div id="stage" data-composition-id="corte" data-start="0" data-duration="{DUR:.4f}" data-fps="{FPS}" data-width="1080" data-height="1920">
<audio id="mix" src="mix.wav" data-start="0" data-duration="{DUR:.4f}" data-track-index="10" data-volume="1"></audio>
<div class="bg"><div class="glow" id="glow"></div></div>
<div id="panel"><div class="parts">{part}</div>{chr(10).join(H[i] for i in sids)}<div id="streak"></div><div id="flash"></div></div>
<div id="vframe"><div id="vwrap"><div id="vzoom"><video id="vid" src="video.mp4" muted playsinline data-start="0" data-duration="{DUR:.4f}" data-track-index="1"></video></div></div>{brh}<div id="vflash"></div></div>
{chr(10).join(caps)}
{chr(10).join(tkh)}
{chr(10).join(msh)}
<script src="vendor/gsap.min.js"></script>
<script>(function(){{const tl=gsap.timeline({{paused:true}});
tl.fromTo('#glow',{{x:-120,y:-40}},{{x:160,y:80,duration:{DUR:.2f},ease:'sine.inOut'}},0);
{chr(10).join(js)}
window.__timelines=window.__timelines||{{}};window.__timelines["corte"]=tl;}})();</script>
</div></body></html>"""
    pub = os.path.join(OUT, "public")
    os.makedirs(pub + "/vendor", exist_ok=True)
    for d in ("fonts", "3d"):
        shutil.copytree(f"{TOOLS}/assets/{d}", f"{pub}/assets/{d}", dirs_exist_ok=True)
    shutil.copy(GSAP, pub + "/vendor/")
    if os.path.isdir(os.path.join(os.path.dirname(OUT), "broll")):
        shutil.copytree(os.path.join(os.path.dirname(OUT), "broll"), pub + "/broll", dirs_exist_ok=True)
    if not os.path.exists(pub + "/video.mp4"):
        os.link(f"{OUT}/video.mp4", pub + "/video.mp4")
    open(pub + "/index.html", "w").write(page)
    json.dump(sorted(sfx, key=lambda x: x["t"]), open(f"{OUT}/sfx.json", "w"), indent=0)
    print(f"ok {DUR:.2f}s, {len(SC)} cenas, {len(caps)} legendas, {len(TK)} telas cheias, {len(sfx)} sfx")
    print(" ".join(f"{i}:{a:.1f}-{b:.1f}" for i, a, b in SC))
