"""Assemble cN/index.html from lib.html + cN.txt (sections ===CSS=== ===HTML=== ===JS===) + cN-vo.json.
Run from videos/sl-criativos: python3 build/build.py 1 2 3"""
import json, os, re, sys

lib = open("build/lib.html")  # in the skill copy this file is lib.template.txt.read()
for n in sys.argv[1:] or ["1", "2", "3"]:
    src = open(f"build/c{n}.txt").read()
    sec = src.split("===CSS===")[1]
    css, rest = sec.split("===HTML===")
    html, js = rest.split("===JS===")
    vo = json.load(open(f"build/c{n}-vo.json"))
    out = (lib.replace("/*__CSS__*/", css).replace("<!--__HTML__-->", html).replace("/*__JS__*/", js)
           .replace("__VO__", json.dumps(vo, ensure_ascii=False)).replace("__TOTAL__", f"{vo['total']:.2f}")
           .replace("__MIX__", f"mix-c{n}.wav"))
    out = re.sub(r"__REST_([\d.]+)__", lambda m: f"{vo['total'] - float(m.group(1)):.2f}", out)
    os.makedirs(f"c{n}", exist_ok=True)
    open(f"c{n}/index.html", "w").write(out)
    if not os.path.exists(f"c{n}/assets"):
        os.symlink("../assets", f"c{n}/assets")
    print("ok", f"c{n}/index.html", vo["total"])
