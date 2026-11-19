# Builds appsrv/public from app/ (minus the sticker images, which live on the CDN workers).
# Since the 02/11 redesign app/index.html is the real page (login, tabs, materials...); this script only copies files,
# makes the small images, points the bonus media at cdn-4 and fills in the CDN hosts.
# The old patching version is kept next to it as build.pre-redesign.py.
import os, shutil, sys, json, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
from PIL import Image
R = 'C:/Users/tanpz/stories-lab'
APP, PUB = R + '/app', R + '/appsrv/public'

os.makedirs(PUB + '/img', exist_ok=True)
for f in os.listdir(APP):
    if os.path.isfile(f'{APP}/{f}') and f != 'index.html' and '.pre-redesign.' not in f:
        shutil.copy(f'{APP}/{f}', f'{PUB}/{f}')
for d in ['cat', 'ph', 'presets', 'material-scenes']:   # category thumbnails + photos for the featured-theme mockups (app-tools/thumbs.mjs)
    shutil.copytree(f'{APP}/img/{d}', f'{PUB}/img/{d}', dirs_exist_ok=True)

# Product-specific art, shared by the material library and offers.
os.makedirs(PUB + '/img/material-covers', exist_ok=True)
for n in ['presets', 'animadas', 'agenda', 'magneticos']:
    shutil.copy(f'{APP}/img/material-covers/{n}.webp', f'{PUB}/img/material-covers/{n}.webp')
    shutil.copy(f'{APP}/img/material-covers/{n}.webp', f'{PUB}/img/{n}.webp')
im = Image.open(f'{R}/bumps/sl-upsell-banner.png').convert('RGB'); im.thumbnail((720, 405)); im.save(f'{PUB}/img/kit.webp', quality=80)

# tutorials: mp4s go to cdn-4 (served at /m/tut, supports Range for iPhone); redeploy cdn-4 after changing them
TUT = R + '/appsrv/tutorial'
os.makedirs(PUB + '/v', exist_ok=True)
os.makedirs(R + '/cdn/b4/tut', exist_ok=True)
for video in json.load(open(f'{TUT}/v3/manifest.json', encoding='utf-8')):
    name = video['id']
    shutil.copy(f'{TUT}/v3/{name}.mp4', f'{R}/cdn/b4/tut/{name}.mp4')
    shutil.copy(f'{TUT}/v3/{name}.vtt', f'{PUB}/v/{name}.vtt')
    Image.open(f'{TUT}/v3/{name}-poster.png').convert('RGB').resize((390, 780)).save(f'{PUB}/v/{name}.webp', quality=82)

# bonus videos/PDFs come from storieslab-cdn-4 through the /m/ proxy on app.storieslab.shop (no Drive)
MEDIA = 'https://app.storieslab.shop/m'
dj = json.load(open(f'{PUB}/data.json', encoding='utf-8'))
for b in dj['bonus']:
    if b['kind'] == 'video':
        b['url'] = f'{MEDIA}/v/1.mp4'
        for n, it in enumerate(b['items'], 1):
            it['url'] = f'{MEDIA}/v/{n}.mp4'
    elif b['kind'] == 'pdf':
        b['url'] = f"{MEDIA}/{'roteiros' if 'roteiros' in b['slug'] else 'paleta'}.pdf"
assert 'DRIVE_URL' not in json.dumps(dj)
json.dump(dj, open(f'{PUB}/data.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

h = open(f'{APP}/index.html', encoding='utf-8').read()
for i, u in enumerate(open(R + '/appsrv/cdn-hosts.txt').read().split(), 1):
    assert h.count(f"'CDN{i}'") == 1, i
    h = h.replace(f"'CDN{i}'", f"'{u}'")
open(f'{PUB}/index.html', 'w', encoding='utf-8').write(h)
print('built', len(h))

# materials (Agenda, Magnéticos, Animadas, Presets) are read from cdn-4 at /m/mat/: warn while that folder is not live yet
try:
    with urllib.request.urlopen(urllib.request.Request('https://app.storieslab.shop/m/mat/agenda/index.json?probe=' + str(os.getpid()) + str(int(__import__('time').time())), headers={'user-agent': 'Mozilla/5.0'}), timeout=10) as r:
        json.load(r)
except Exception as e:
    print(f'WARNING: /m/mat/ is not live ({e}). Deploy cdn/b4 (storieslab-cdn-4) before deploying the app.')
