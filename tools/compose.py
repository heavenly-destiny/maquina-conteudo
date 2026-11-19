#!/usr/bin/env python3
"""Monta a composicao HyperFrames (legenda dinamica + cards de motion) sobre o video cortado.

Uso: compose.py spec.json render_dir
render_dir precisa ter video.mp4 + words.json (saida do cut.py). Gera render_dir/public/index.html.
spec.json = {"emphasis": ["virus", ...], "cards": [{"type": "...", "start": s, "end": e, ...}]}
Tipos de card: hook, strike, chip, big, checklist, steps.
"""
import json, os, re, shutil, subprocess, sys, unicodedata, html

FPS, W, H = 30, 1080, 1920
VENDOR = os.path.expanduser("~/.claude/plugins/cache/claude-plugins-official/hyperframes/0.8.61/skills/talking-head-recut/assets/vendor/gsap.min.js")
FONTS = {"Black": "Montserrat-Black.ttf", "ExtraBold": "Montserrat-ExtraBold.ttf", "Bold": "Montserrat-Bold.ttf"}


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def q(t):
    return round(t * FPS) / FPS


def esc(s):
    return html.escape(s)


def chunks(words, maxw=3):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        brk = (len(cur) >= maxw or re.search(r"[.,?!]$", w["text"]) or nxt is None
               or nxt["start"] - w["end"] > 0.25 or nxt.get("seg") != w.get("seg"))
        if brk:
            out.append(cur)
            cur = []
    return out


def card_html(c, i):
    cid = f"c{i}"
    t = c["type"]
    if t == "hook":
        body = f'''<div class="kicker" id="{cid}-k">{esc(c.get("kicker", ""))}</div>
<div class="hook" id="{cid}-t">{"".join(f'<span class="w">{esc(x)}</span> ' for x in c["title"].split())}</div>'''
    elif t == "strike":
        body = f'''<div class="panel" id="{cid}-p"><div class="small">{esc(c.get("kicker", ""))}</div>
<div class="strikewrap"><span class="big">{esc(c["word"])}</span><div class="strike" id="{cid}-s"></div></div>
<div class="small y" id="{cid}-d">{esc(c.get("detail", ""))}</div></div>'''
    elif t == "chip":
        body = f'<div class="chip" id="{cid}-p">{esc(c["text"])}</div>'
    elif t == "big":
        body = f'''<div class="panel" id="{cid}-p"><div class="small">{esc(c.get("kicker", ""))}</div>
<div class="big y">{esc(c["title"])}</div><div class="small">{esc(c.get("detail", ""))}</div></div>'''
    elif t in ("checklist", "steps"):
        items = "".join(
            f'<div class="item" id="{cid}-i{j}"><span class="mark">{"✓" if t == "checklist" else j + 1}</span>{esc(it["text"])}</div>'
            for j, it in enumerate(c["items"]))
        body = f'<div class="panel" id="{cid}-p"><div class="small y">{esc(c["title"])}</div>{items}</div>'
    else:
        raise ValueError(t)
    return f'<div class="card-host clip zone" data-card-id="{cid}" data-start="{q(c["start"]):.4f}" data-duration="{q(c["end"] - c["start"]):.4f}" data-track-index="3" style="opacity:0;">{body}</div>'


def card_js(c, i):
    cid, s, e, t = f"c{i}", q(c["start"]), q(c["end"]), c["type"]
    sel = f'.card-host[data-card-id="{cid}"]'
    js = [f"tl.fromTo('{sel}',{{opacity:0}},{{opacity:1,duration:0.15}},{s});",
          f"tl.to('{sel}',{{opacity:0,duration:0.2}},{q(e - 0.2)});"]
    if t == "hook":
        js += [f"tl.from('#{cid}-k',{{y:-30,opacity:0,duration:0.3,ease:'power3.out'}},{s});",
               f"tl.from('#{cid}-t .w',{{y:60,scale:0.6,opacity:0,duration:0.35,ease:'back.out(2)',stagger:0.07}},{q(s + 0.1)});"]
    else:
        js.append(f"tl.fromTo('#{cid}-p',{{scale:0.5,opacity:0,rotation:-4}},{{scale:1,opacity:1,rotation:0,duration:0.4,ease:'back.out(2.2)'}},{s});")
    if t == "strike":
        js.append(f"tl.fromTo('#{cid}-s',{{scaleX:0}},{{scaleX:1,duration:0.3,ease:'power2.out'}},{q(c['strike_at'])});")
        js.append(f"tl.from('#{cid}-d',{{y:20,opacity:0,duration:0.3}},{q(c['strike_at'] + 0.2)});")
    if t in ("checklist", "steps"):
        for j, it in enumerate(c["items"]):
            js.append(f"tl.fromTo('#{cid}-i{j}',{{x:-60,opacity:0}},{{x:0,opacity:1,duration:0.3,ease:'back.out(1.8)'}},{q(it['at'])});")
    return "\n".join(js)


CSS = """
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-Black.ttf');font-weight:900;font-display:block}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-ExtraBold.ttf');font-weight:800;font-display:block}
@font-face{font-family:'Montserrat';src:url('fonts/Montserrat-Bold.ttf');font-weight:700;font-display:block}
:root{--y:#FFD400;--r:#FF3B30}
*{box-sizing:border-box}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000;font-family:'Montserrat',sans-serif}
#stage{position:relative;width:1080px;height:1920px;overflow:hidden}
#video-wrap{position:absolute;inset:0;transform-origin:50% 35%}
#video-wrap video{width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 78%,rgba(0,0,0,.2) 100%)}
.zone{position:absolute;left:60px;right:60px;top:300px;height:640px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:none}
.kicker{background:var(--r);color:#fff;font-weight:900;font-size:34px;letter-spacing:2px;padding:10px 26px;border-radius:12px;margin-bottom:26px}
.hook{color:#fff;font-weight:900;font-size:104px;line-height:1.02;text-align:center;text-transform:uppercase;text-shadow:0 6px 0 rgba(0,0,0,.6),0 0 40px rgba(0,0,0,.6)}
.hook .w{display:inline-block}
.hook .w:nth-child(n+4){color:var(--y)}
.panel{background:rgba(12,12,14,.82);border:3px solid rgba(255,255,255,.12);border-radius:36px;padding:38px 46px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.5);max-width:960px}
.small{color:#fff;font-weight:800;font-size:40px;line-height:1.2;text-transform:uppercase}
.y{color:var(--y)}
.big{display:block;color:#fff;font-weight:900;font-size:120px;line-height:1.05;text-transform:uppercase;margin:12px 0}
.big.y{color:var(--y)}
.strikewrap{position:relative;display:inline-block}
.strike{position:absolute;left:-14px;right:-14px;top:52%;height:16px;background:var(--r);border-radius:8px;transform-origin:0 50%;transform:rotate(-6deg)}
.chip{background:var(--y);color:#111;font-weight:900;font-size:58px;padding:18px 36px;border-radius:20px;text-transform:uppercase;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.item{display:flex;align-items:center;gap:22px;color:#fff;font-weight:900;font-size:56px;text-transform:uppercase;margin-top:22px;text-align:left}
.mark{display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:var(--y);color:#111;font-size:40px;flex:none}
.cap{position:absolute;left:50px;right:50px;top:1180px;text-align:center;pointer-events:none}
.cap .cw{display:inline-block;color:#fff;font-weight:900;font-size:86px;line-height:1.08;text-transform:uppercase;margin:0 8px;
  -webkit-text-stroke:3px #000;paint-order:stroke fill;text-shadow:0 8px 0 rgba(0,0,0,.55)}
.cap .cw.e{color:var(--y)}
"""


def main(spec_path, rdir):
    spec = json.load(open(spec_path))
    words = json.load(open(os.path.join(rdir, "words.json")))
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(rdir, "video.mp4")]))
    pub = os.path.join(rdir, "public")
    os.makedirs(pub + "/fonts", exist_ok=True)
    os.makedirs(pub + "/vendor", exist_ok=True)
    for f in FONTS.values():
        shutil.copy(os.path.expanduser("~/Library/Fonts/" + f), pub + "/fonts/")
    shutil.copy(VENDOR, pub + "/vendor/")
    if not os.path.exists(pub + "/video.mp4"):
        os.link(os.path.join(rdir, "video.mp4"), pub + "/video.mp4")
    emph = {norm(x) for x in spec.get("emphasis", [])}

    caps, js = [], []
    for k, ch in enumerate(chunks(words)):
        s = q(ch[0]["start"])
        nxt_end = ch[-1]["end"] + 0.15
        e = q(min(dur, max(nxt_end, s + 0.4)))
        spans = "".join(f'<span class="cw{" e" if norm(w["text"]) in emph else ""}" id="w{k}_{j}">{esc(w["text"].strip(".,?!"))}</span>'
                        for j, w in enumerate(ch))
        caps.append(f'<div class="cap clip" id="cap{k}" data-start="{s:.4f}" data-duration="{e - s:.4f}" data-track-index="4">{spans}</div>')
        for j, w in enumerate(ch):
            ws = q(max(s, w["start"]))
            js.append(f"tl.fromTo('#w{k}_{j}',{{scale:0.7,opacity:0}},{{scale:1,opacity:1,duration:0.12,ease:'back.out(3)'}},{ws});")

    # leve push-in por segmento (reseta em cada corte)
    segs = {}
    for w in words:
        segs.setdefault(w["seg"], w["start"])
    starts = sorted(segs.values())
    for i, s in enumerate(starts):
        a = q(max(0, s - 0.06)) if i else 0
        b = q(starts[i + 1] - 0.06) if i + 1 < len(starts) else q(dur)
        js.append(f"tl.fromTo('#video-wrap',{{scale:1}},{{scale:1.045,duration:{max(0.1, b - a):.3f},ease:'none'}},{a});")

    cards = [card_html(c, i) for i, c in enumerate(spec["cards"])]
    js += [card_js(c, i) for i, c in enumerate(spec["cards"])]

    page = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div id="stage" data-composition-id="corte" data-start="0" data-duration="{dur:.4f}" data-fps="{FPS}" data-width="{W}" data-height="{H}">
<div id="video-wrap"><video id="bg-video" src="video.mp4" muted playsinline data-start="0" data-duration="{dur:.4f}" data-track-index="1"></video></div>
<audio id="source-audio" src="video.mp4" data-start="0" data-duration="{dur:.4f}" data-track-index="10" data-volume="1"></audio>
<div class="shade"></div>
{chr(10).join(cards)}
{chr(10).join(caps)}
<script src="vendor/gsap.min.js"></script>
<script>(function(){{const tl=gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines=window.__timelines||{{}};window.__timelines["corte"]=tl;}})();</script>
</div></body></html>"""
    open(pub + "/index.html", "w").write(page)
    print(f"ok {len(caps)} legendas, {len(cards)} cards, {dur:.2f}s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
