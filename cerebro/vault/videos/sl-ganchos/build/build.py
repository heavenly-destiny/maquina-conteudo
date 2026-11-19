"""Assemble cN/index.html from lib.html + cN.txt + cN-vo.json.
cN.txt sections: ===TIMES=== (python: fills dict T from W(line, word) and TOTAL; shared with the mixer)
                 ===CSS=== ===HTML=== ===JS=== ===SFX=== (python, mixer only)
Run from videos/sl-ganchos: python3 build/build.py 1 2 3 4 5"""
import json, os, re, sys

lib = open("build/lib.html").read()
for n in sys.argv[1:] or ["1"]:
    src = open(f"build/c{n}.txt").read()
    times_py = src.split("===TIMES===")[1].split("===CSS===")[0]
    css, rest = src.split("===CSS===")[1].split("===HTML===")
    html, rest = rest.split("===JS===")
    js = rest.split("===SFX===")[0]
    vo = json.load(open(f"build/c{n}-vo.json"))
    W = lambda ln, i: vo["lines"][ln]["words"][i][1]
    g = {"W": W, "TOTAL": vo["total"], "T": {}}
    exec(times_py, g)
    T = {k: round(v, 3) for k, v in g["T"].items()}
    out = (lib.replace("/*__CSS__*/", css).replace("<!--__HTML__-->", html)
           .replace("/*__JS__*/", f"const T = {json.dumps(T)};\n" + js)
           .replace("__VO__", json.dumps(vo, ensure_ascii=False)).replace("__TOTAL__", f"{vo['total']:.2f}")
           .replace("__MIX__", f"mix-c{n}.wav"))
    out = re.sub(r"__REST_([\d.]+)__", lambda m: f"{vo['total'] - float(m.group(1)):.2f}", out)
    out = re.sub(r"__T_([A-Za-z0-9_]+)__", lambda m: f"{T[m.group(1)]:.2f}", out)
    out = re.sub(r"__TREST_([A-Za-z0-9_]+)__", lambda m: f"{vo['total'] - T[m.group(1)]:.2f}", out)
    os.makedirs(f"c{n}", exist_ok=True)
    open(f"c{n}/index.html", "w").write(out)
    if not os.path.lexists(f"c{n}/assets"):
        os.symlink("../assets", f"c{n}/assets")
    for f in ("hyperframes.json", "package.json"):
        if not os.path.exists(f"c{n}/{f}"):
            s = open(f"../sl-criativos/c5/{f}").read().replace("sl-c5", f"sl-g{n}")
            open(f"c{n}/{f}", "w").write(s)
    print("ok", f"c{n}/index.html", vo["total"], T)
