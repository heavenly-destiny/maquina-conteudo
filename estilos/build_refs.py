import json,base64,os,glob
def b64(p):
    if not p or not os.path.exists(p): return None
    os.system(f'sips -Z 420 -s format jpeg -s formatOptions 65 "{p}" --out /tmp/_t.jpg >/dev/null 2>&1')
    return 'data:image/jpeg;base64,'+base64.b64encode(open('/tmp/_t.jpg','rb').read()).decode()
exec(open('anuncios/analise.py').read())
ads=[]
for line in open('anuncios/lista.tsv'):
    id,days,v,adv,nicho=line.rstrip('\n').split('\t')
    if id not in A: continue
    info=json.load(open(f'anuncios/videos/{id}.info.json')) if os.path.exists(f'anuncios/videos/{id}.info.json') else {}
    hook=open(f'anuncios/hook/{id}.txt').read().strip() if os.path.exists(f'anuncios/hook/{id}.txt') else ''
    hook=' '.join(hook.split())
    dur=open(f'anuncios/hook/{id}.dur').read().strip() if os.path.exists(f'anuncios/hook/{id}.dur') else '0'
    dim=open(f'anuncios/hook/{id}.dim').read().strip().strip(',') if os.path.exists(f'anuncios/hook/{id}.dim') else ''
    t,e,p,u=A[id]
    ads.append(dict(id=id,url=f'https://www.facebook.com/ads/library/?id={id}',adv=adv,days=int(days),v=int(v),nicho=nicho,
      dur=round(float(dur or 0)),dim=dim,copy=info.get('description',''),hook=hook if len(hook)>60 else '',
      tipo=t,estrutura=e,porque=p,aplicar=u,img=b64(f'anuncios/thumbs/{id}.jpg')))
vir=json.load(open('virais/virais.json'))
for o in vir: o['img']=b64(o.get('thumb')); o.pop('thumb',None)
exec(open('hyperframes/notas.py').read())
hf=[]
for o in json.load(open('hyperframes/selecao.json')):
    d,u,c=N[o['name']]
    hf.append(dict(name=o['name'],title=o['title'],type=o['type'],tags=o['tags'],w=o.get('dimensions',{}).get('width'),h=o.get('dimensions',{}).get('height'),
      dur=o.get('duration'),desc=d,uso=u,cat=c,video=o['preview'].get('video'),cmd=f"npx hyperframes add {o['name']}",img=b64(f"hyperframes/posters/{o['name']}.jpg")))
json.dump(dict(ads=ads,virais=vir,hf=hf),open('referencias.json','w'),ensure_ascii=False)
print(len(ads),len(vir),len(hf),os.path.getsize('referencias.json')//1024,'KB')
