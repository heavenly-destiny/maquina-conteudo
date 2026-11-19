import json, base64, os, sys
E = os.path.expanduser('~/Movies/maquina-conteudo/estilos')
OUT = sys.argv[1]
r = json.load(open(f'{E}/referencias.json'))
acervo = json.load(open(f'{E}/prompt-motion/catalogo/data.json'))
VENDA = {'criativo-ads','produto-app','prova','cta','hook'}
ORG = {'organico','explicacao','dados','legenda'}
ALL = {'branding','transicao','legenda'}
def goals(cats):
    g = set()
    for c in cats:
        if c in VENDA: g.add('venda')
        if c in ORG: g.add('organico')
        if c == 'motivacional': g.add('motivacional')
        if c in ALL: g |= {'venda','organico','motivacional'}
    return sorted(g) or ['organico']
for x in r['ads']: x['g'] = ['venda'] + (['motivacional'] if x['nicho']=='motivacional' else [])
for x in r['virais']: x['g'] = ['motivacional'] if x['nicho']=='motivacional' else ['organico']
for x in r['hf']: x['g'] = goals([x['cat']])
ac = []
for x in acervo:
    mp = x['melhor_para'] if isinstance(x['melhor_para'], list) else []
    ac.append({k: x.get(k) for k in ('slug','url','title','titulo_pt','handle','xpost','o_que_faz','tecnica','encaixe','retencao','esforco','relevancia','generico','prompt','img','w','h','video')} | {'mp': mp, 'g': goals(mp)})
motion = []
mp = f'{E}/motion-virais/motion.json'
if os.path.exists(mp):
    GM = {'anuncio':['venda'],'organico':['organico'],'ia':['organico','venda'],'motivacional':['motivacional']}
    for x in json.load(open(mp)):
        t = x.get('thumb')
        if t and os.path.exists(t):
            x['img'] = 'data:image/jpeg;base64,' + base64.b64encode(open(t,'rb').read()).decode()
        x.pop('thumb', None); x.pop('sheet', None)
        x['g'] = GM.get(x.get('cat'), ['organico'])
        motion.append(x)
al = f'{E}/aslaniedits'
if os.path.exists(f'{al}/analise.json'):
    GA = {'raw-vs-edited': ['organico'], 'brand-cinematic-lightball': ['venda', 'organico']}
    for x in json.load(open(f'{al}/analise.json')):
        if x.get('pulado'): continue
        t = f"{al}/thumbs/{x['shortcode']}.jpg"
        motion.append({'id': x['shortcode'], 'url': x['url'], 'canal': 'Milad Aslani', 'views': x.get('views'), 'curtidas': x.get('likes'),
                       'titulo': f"{x['estilo']} · aslaniedits · {x['likes']:,} curtidas".replace(',', '.'), 'duracao_s': x['duracao_s'], 'formato': x['aspect'],
                       'estilo': x['estilo'], 'tecnica': f"{x['estilo']}: {x['tecnicas_reproduziveis']}", 'por_que': x['o_que_faz'], 'nota': x['nota_1a5'],
                       'img': 'data:image/jpeg;base64,' + base64.b64encode(open(t, 'rb').read()).decode() if os.path.exists(t) else None,
                       'g': GA.get(x['estilo'], ['venda', 'organico'])})
meus=[]
ig=f'{E}/instagram-refs'
GI={'criativo-venda':['venda'],'organico-ia-marketing':['organico'],'motivacional':['motivacional'],'motion-showcase':['venda','organico','motivacional']}
links={l.split()[1].split('/')[1]:l.split()[1] for l in open(f'{ig}/links.txt')}
for x in json.load(open(f'{ig}/analise.json')):
    t=f"{ig}/thumbs/{x['id']}.jpg"
    x['img']='data:image/jpeg;base64,'+base64.b64encode(open(t,'rb').read()).decode()
    x['url']='https://www.instagram.com/'+links.get(x['id'],'reel/'+x['id'])+'/'
    x['g']=GI.get(x['categoria'],['organico']); meus.append(x)
c=f'{ig}/carrossel/01-capa.png'
if os.path.exists(c):
    meus.append({'id':'DfZvGWOE2bX','autor':'rakeshmahantiai1','categoria':'carrossel','formato':'4:5','duracao_s':0,'nota_qualidade':5,'g':['organico'],
     'url':'https://www.instagram.com/p/DfZvGWOE2bX/','img':'data:image/png;base64,'+base64.b64encode(open(c,'rb').read()).decode(),
     'resumo':'Carrossel de 12 slides: capa com personagem 3D, 8 ferramentas no mesmo template e CTA de comentário.',
     'tecnica_chave':'Capa com personagem 3D e mistura de 4 fontes, template repetido por item, gatilho de comentário no fim',
     'paleta':'vinho #5a0f1e na capa e CTA, lilás desfocado #b9a3e8 nos slides de item, branco, azul de destaque #3b5bff',
     'tipografia':'sans gigante branca, condensada caixa alta, palavra em caixa azul, script manuscrita',
     'legenda':'não se aplica','motion':'estático','broll':'print real do app em janela','transicoes':'swipe','ritmo':'12 slides',
     'gancho_3s':'personagem carismático + palavra gigante + promessa \'GitHub is hiding these insane animation tools\'',
     'som':'não se aplica','receita_hyperframes':'Mesma estrutura serve pra carrossel em HTML 1080x1350 exportado como PNG por slide.',
     'serve_para':'Posts de lista de ferramentas de IA com gatilho \'comenta X\' pra gerar comentário e DM.'})
_ids={m['id'] for m in meus}
motion=[m for m in motion if m['id'] not in _ids]  # sem duplicar o que já está em meus
formatos = []
fa = f'{E}/formatos/analise.json'
if os.path.exists(fa):
    GF = {'historinha-bonequinhos': ['organico', 'venda'], 'caixinha-pergunta': ['organico', 'venda'], 'tela-dividida': ['organico'], 'outros-virais': ['organico']}
    for x in json.load(open(fa)):
        t = f"{E}/formatos/{x['formato']}/thumbs/{x['id']}.jpg"
        formatos.append({'id': x['id'], 'url': x['url'], 'titulo': x['titulo'], 'autor': x['canal'], 'canal': x['canal'], 'views': x['views'],
                         'duracao_s': x['duracao_s'], 'formato': x['formato'], 'estilo': x['subestilo'],
                         'tecnica': f"{x['subestilo']} · " + ' '.join(x['como_adaptar']), 'por_que': x['por_que_prende'],
                         'img': 'data:image/jpeg;base64,' + base64.b64encode(open(t, 'rb').read()).decode() if os.path.exists(t) else None,
                         'g': GF.get(x['formato'], ['organico'])})
musicas = []
mj = f'{E}/musicas/musicas.json'
if os.path.exists(mj):
    for x in json.load(open(mj))['musicas']:
        musicas.append({'id': x['id'], 'titulo': x['titulo'], 'autor': x['artista'], 'estilo': x['estilo_de_video'], 'por_que': x['por_que_viral'],
                        'tecnica': f"{x['estilo_de_video']} · {x['mood']} · energia {x['energia']}" + (f" · {x['bpm']} bpm" if x.get('bpm') else ''), 'img': None, 'g': ['organico']})
json.dump({'meus': meus, 'motion': motion, 'virais': r['virais'], 'ads': r['ads'], 'hf': r['hf'], 'acervo': ac, 'formatos': formatos, 'musicas': musicas}, open(OUT,'w'), ensure_ascii=False)
print({k: len(v) for k, v in json.load(open(OUT)).items()}, os.path.getsize(OUT)//1024, 'KB')
