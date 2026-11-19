"""Build step: inline the page's own stylesheets into dist/index.html.

Six separate CSS files blocked the first paint (~1.4 s on mobile 4G in Lighthouse).
Inlining them in the same order keeps the cascade identical and removes those requests.
Source files in site/ stay separate so they are still easy to edit.
"""
import re, sys, pathlib

dist = pathlib.Path(sys.argv[1])
page = dist / 'index.html'
html = page.read_text()

def minify(css):
    # comments and indentation only: nothing inside rules changes, so the cascade stays identical
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    return re.sub(r'\n\s*', '\n', css).strip()

def inline(m):
    path = dist / m.group(1).lstrip('/')
    return '<style>' + minify(path.read_text()) + '</style>'

html, n = re.subn(r'<link rel="stylesheet" href="(/[^":?]+\.css)(?:\?[^"]*)?">', inline, html)
assert n >= 6, f'expected at least 6 local stylesheets, inlined {n}'
html = re.sub(r'<style>(.*?)</style>', lambda m: '<style>' + minify(m.group(1)) + '</style>', html, flags=re.S)
html = re.sub(r'<!--(?!\[| Aviso).*?-->', '', html, flags=re.S)  # our working notes; the copyright notice stays
page.write_text(html)
print(f'inlined {n} stylesheets')
