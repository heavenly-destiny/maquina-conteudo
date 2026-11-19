import json,shutil,os
d=json.load(open('data.json'))
a={}
for i in range(4):
    for o in json.load(open(f'analise{i}.json')): a[o['slug']]=o
miss=[o['slug'] for o in d if o['slug'] not in a]
out=[]
for o in d:
    x=a.get(o['slug'],{})
    out.append({**{k:o[k] for k in ['slug','url','title','handle','xpost','tags','repo','kind','prompt','w','h','posted']},
      **{k:x.get(k) for k in ['titulo_pt','o_que_faz','tecnica','melhor_para','encaixe','retencao','esforco']},'relevancia':int(x.get('relevancia') or 1)})
json.dump(out,open('catalogo/data.json','w'),ensure_ascii=False)
os.makedirs('catalogo/thumbs',exist_ok=True)
for o in d: shutil.copy(f'thumbs/{o["slug"]}.jpg',f'catalogo/thumbs/{o["slug"]}.jpg')
from collections import Counter
print('faltando',miss); print(Counter(o['relevancia'] for o in out)); print(Counter(o['esforco'] for o in out))
