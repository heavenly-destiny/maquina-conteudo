#!/usr/bin/env python3
"""Atualiza musicas.json: ranking Spotify BR/Global (kworb), lista da semana do Instagram (SocialPilot),
capas, BPM e prévia oficial de 30 s (Deezer, API pública sem login). Não baixa música inteira.
Uso: python3 atualizar.py   (seguro rodar toda semana ou todo dia)"""
import json, re, time, urllib.request, urllib.parse as U, html
from pathlib import Path
AQUI = Path(__file__).parent; J = AQUI / "musicas.json"; PREV = AQUI / "previews"; PREV.mkdir(exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}
def get(u, t=20):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t).read()
def norm(s): return re.sub(r"[^a-z0-9]", "", re.sub(r"\((?:[^)]*(?:ao vivo|w/|feat)[^)]*)\)|-\s*ao vivo", "", s.lower()))

def kworb(url, n=30):
    h = get(url).decode()
    rows = re.findall(r'<tr><td class="np">(\d+)</td>\s*<td class="np">([^<]*)</td>\s*<td class="text mp"><div>(.*?)</div></td>', h)[:n]
    out = []
    for pos, ch, cel in rows:
        t = html.unescape(re.sub(r"<[^>]+>", "", cel)); a, _, ti = t.partition(" - ")
        out.append((int(pos), ch.strip(), a.strip(), re.sub(r"\s*\(w/.*?\)", "", ti).strip()))
    return out

def instagram_semana():
    h = get("https://www.socialpilot.co/blog/instagram-trends").decode()  # redireciona sozinho
    t = re.sub(r"<[^>]+>", "|", h); t = html.unescape(re.sub(r"(\|\s*)+", "|", re.sub(r"\s+", " ", t)))
    i = t.find("Trending Instagram Reels Audio")
    if i < 0: return []
    return [(int(n), a.strip(), b.strip()) for n, a, b in re.findall(r"\|(\d{1,2})\. (.+?) — (.+?)\|", t[i:i + 2500])]

def deezer(q):
    d = json.loads(get("https://api.deezer.com/search?limit=1&q=" + U.quote(q)))["data"]
    return d[0] if d else None
def enriquecer(m):
    q = f'{m["titulo"]} {m["artista"]}'.replace("original audio", "")
    r = deezer(q)
    if not r: return
    m["capa"] = f'https://cdn-images.dzcdn.net/images/cover/{r["md5_image"]}/250x250-000000-80-0-0.jpg' if r.get("md5_image") else None
    m["links"]["deezer"] = r["link"]
    if not m.get("bpm"):
        b = json.loads(get(f'https://api.deezer.com/track/{r["id"]}')).get("bpm")
        if b: m["bpm"], m["bpm_fonte"] = int(b), "deezer"
    f = PREV / f'{m["id"]}.mp3'
    if not f.exists() and r.get("preview"): f.write_bytes(get(r["preview"]))
    if f.exists(): m["preview"] = f"previews/{f.name}"

def main():
    D = json.loads(J.read_text()); L = D["musicas"]; hoje = time.strftime("%Y-%m-%d")
    por = {(norm(m["titulo"])): m for m in L}
    for m in L: m["posicoes"] = {}
    def casar(t): return por.get(norm(t))
    try:
        for chave, url in (("br", "https://kworb.net/spotify/country/br_daily.html"), ("global", "https://kworb.net/spotify/country/global_daily.html")):
            for pos, ch, a, t in kworb(url):
                m = casar(t)
                if not m:
                    if pos > 20: continue
                    k = len(L) + 1
                    m = dict(id=f"m{k:03d}", titulo=t, artista=a, plataforma_origem="Spotify (kworb)", links={"instagram_audio": None, "tiktok": "https://www.tiktok.com/search?q=" + U.quote_plus(a + " " + t), "spotify": "https://open.spotify.com/search/" + U.quote_plus(a + " " + t), "youtube": "https://www.youtube.com/results?search_query=" + U.quote_plus(a + " " + t)},
                             por_que_viral="Entrou no top do Spotify (entrada automática).", formato_de_uso="lip-sync/humor", estilo_de_video="hit-do-momento", estilos=["hit-do-momento"], mood="a definir", energia=3, bpm=None, bpm_fonte=None, momento_do_drop_s=None, drop_fonte=None,
                             nichos_que_funcionam=["lifestyle"], uso_brasil="br" if chave == "br" else "global", tendencia="subindo", data_coleta=hoje, fonte="https://kworb.net/spotify/country/%s_daily.html" % chave, origem="kworb", posicoes={}, usado_por=[], rank=None, preview=None, capa=None)
                    L.append(m); por[norm(t)] = m
                m["posicoes"][chave] = pos; m["data_coleta"] = hoje
                if m["origem"] == "kworb": m["tendencia"] = "subindo" if ch.startswith("+") or ch == "NEW" else "caindo" if ch.startswith("-") else "no pico"
    except Exception as e: print("kworb falhou:", e)
    try:
        for n, t, a in instagram_semana():
            m = casar(t)
            if m: m["posicoes"]["ig"] = n; m["data_coleta"] = hoje
    except Exception as e: print("socialpilot falhou:", e)
    # kworb que saiu do top: continua no acervo mas sem ranking
    for m in L:
        p = m["posicoes"]; s = 0
        if "ig" in p: s += (12 - p["ig"]) * 3
        if "br" in p: s += (31 - p["br"]) * 1.5
        if "global" in p: s += (31 - p["global"])
        m["score"] = s
    for r, m in enumerate(sorted((m for m in L if m["score"] > 0), key=lambda m: -m["score"]), 1): m["rank"] = r
    for m in L:
        if m["score"] <= 0: m["rank"] = None
    for m in L:
        if not (m.get("capa") and m.get("preview")):
            try: enriquecer(m); time.sleep(0.15)
            except Exception as e: print("deezer", m["titulo"], e)
    D["atualizado_em"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    J.write_text(json.dumps(D, ensure_ascii=False, indent=1))
    print(len(L), "músicas,", sum(1 for m in L if m["rank"]), "no ranking,", sum(1 for m in L if m["preview"]), "com prévia")
if __name__ == "__main__": main()
