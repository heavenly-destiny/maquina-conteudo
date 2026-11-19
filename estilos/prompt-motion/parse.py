import re,html,json,os,sys
out=[]
for slug in open('slugs.txt').read().split():
    s=open(f'html/{slug}.html').read()
    ld=json.loads(html.unescape(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S).group(1)))
    m=s.find('<main'); e=s.find('</main>'); body=s[m:e]
    hrefs=re.findall(r'href="([^"]+)"',body)
    t=re.sub(r'<script.*?</script>','',body,flags=re.S)
    t=re.sub(r'<(/?)(h1|h2|h3|p|li|dt|dd|div|pre|a|br)[^>]*>','\n',t)
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    lines=[l.strip() for l in t.split('\n') if l.strip()]
    txt='\n'.join(lines)
    meta={}
    for k in ['Model','Effort','Tools','Tool','Made with']:
        mm=re.search(r'\n'+k+r'\n(.+)',txt)
        if mm: meta[k]=mm.group(1)
    pm=re.search(r'Copy\n(.*?)\nThis prompt was taken',txt,re.S)
    prompt=pm.group(1).strip() if pm else ''
    if not prompt:
        pm=re.search(r'Copy\n(.*?)\n(Model|View repo)',txt,re.S)
        prompt=pm.group(1).strip() if pm else ''
    skill='\nSkill\n' in txt or any('github.com' in h for h in hrefs)
    out.append(dict(slug=slug,url=f'https://prompt-motion.com/{slug}',title=ld['name'],
      creator=ld.get('creator',{}).get('name'),handle=ld.get('creator',{}).get('url','').split('/')[-1],
      xpost=next((h for h in hrefs if '/status/' in h),None),
      tags=[h.split('/tags/')[1] for h in hrefs if '/tags/' in h],
      repo=next((h for h in hrefs if 'github.com' in h),None),
      kind='skill' if skill and not re.search(r'This prompt was taken',txt) else 'prompt',
      prompt=prompt,poster=ld['thumbnailUrl'][0] if ld.get('thumbnailUrl') else None,video=ld.get('contentUrl'),
      w=ld.get('width'),h=ld.get('height'),posted=ld.get('uploadDate'),**{k.lower().replace(' ','_'):v for k,v in meta.items()}))
json.dump(out,open('data.json','w'),ensure_ascii=False,indent=1)
print(len(out), sum(1 for o in out if not o['prompt']), 'sem prompt')
from collections import Counter
print(Counter(t for o in out for t in o['tags']))
print(Counter(o['kind'] for o in out), Counter(f"{o['w']}x{o['h']}" for o in out).most_common(6))
print(Counter(o.get('tools') for o in out).most_common(10))
print(sum(len(o['prompt']) for o in out))
