// Track commercial entry/support/checkout actions; keep referral codes intact.
(() => {'use strict';
 const qs=new URLSearchParams(location.search),fields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_perfect','src','ind','fbclid'];
 const read=()=>{try{return JSON.parse(sessionStorage.getItem('sl_channel')||'null')}catch{return null}};
 const incoming=Object.fromEntries(fields.filter(k=>qs.get(k)).map(k=>[k,qs.get(k).slice(0,200)]));
 let touch=incoming.utm_source?incoming:read()||{};
 try{if(incoming.utm_source)sessionStorage.setItem('sl_channel',JSON.stringify(touch))}catch{}
 const allowed=u=>/^https:$/.test(u.protocol)&&['go.perfectpay.com.br','checkout.perfectpay.com.br','pay.hubla.la','pay.hub.la'].includes(u.hostname);
 const offer=url=>{try{const code=new URL(url).pathname.split('/').filter(Boolean).pop();return {'PPU38CQHDT3':'presets','0a4F7lds0kppZCeIxiZh':'presets','PPU38CQHDT5':'animadas','MapY395uA0KLoQMaEmw5':'animadas','PPU38CQHDSU':'agenda','AkhU0WtAD1m4BvoIY55i':'agenda','PPU38CQHDT1':'magneticos','FLRKhqAsLMJ915cv4IXy':'magneticos','PPU38CQHDT7':'kit','q5hPWomBXJF0zR8yATYS':'kit','PPU38CQHH4N':'figurinhas','PPU38CQHHI4':'vitalicio','cGqFrb0fb52WtaoGmYYu':'vitalicio','PPU38CQHLSG':'personalizadas','NZEH050hceJ42na0Ydcn':'personalizadas','PPU38CQHDSN':'premium','sXAlfbopdB6LNsF9u5AS':'premium'}[code]||'oferta'}catch{return 'oferta'}};
 const surface=a=>a?.dataset.channelStage||(a?.closest('.trial-offer')?'limite_diario':a?.hasAttribute('data-vit')?'vitalicio':a?.hasAttribute('data-cus')?'personalizadas':a?.closest('.engagement-sheet')?'oferta_contextual':a?.closest('#perfil')?'perfil':a?.closest('#mats,#mat')?'materiais':a?.closest('#up')?'premium':'app');
 function link(raw,stage='app',product){
  const u=new URL(raw,location.href);if(!allowed(u))return u.href;
  const q=u.searchParams,creator=[q.get('src'),q.get('utm_content')].find(s=>/^cri-[a-f0-9]{32}-[a-f0-9]{32}$/i.test(s||''));
  const prior=touch.utm_source?touch:{};
  if(prior.utm_source&&!q.has('utm_perfect'))q.set('utm_perfect',prior.utm_perfect||('sl1:'+['utm_source','utm_medium','utm_campaign'].map(k=>(prior[k]||'').slice(0,28).replace(/:/g,'_')).join(':')).slice(0,100));
  for(const[k,v]of Object.entries({utm_source:'app',utm_medium:'ascensao',utm_campaign:'ascensao',utm_content:creator||product||offer(raw),utm_term:stage}))q.set(k,v);
  if(!q.has('src'))q.set('src',creator||'sl-app-ascensao');
  return u.href;
 }
 function event(stage,u){
  const p=u?new URL(u).searchParams:new URLSearchParams(touch);
  const b={stage,source:p.get('utm_source')||'direto',medium:p.get('utm_medium')||'nao_identificado',campaign:p.get('utm_campaign')||'',content:p.get('utm_content')||''};
  if(stage==='support')Object.assign(b,{source:'app',medium:'whatsapp',campaign:'suporte',content:location.pathname.includes('acessar')?'entrada':'app'});
  fetch('/api/channel-event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b),keepalive:true}).catch(()=>{});
 }
 function decorate(a){try{const u=new URL(a.href);if(!allowed(u))return;a.href=link(a.href,surface(a),a.dataset.of||a.dataset.product||offer(a.href));}catch{}}
 function scan(node){if(node.nodeType!==1)return;if(node.matches('a[href]'))decorate(node);node.querySelectorAll('a[href]').forEach(decorate)}
 function init(){scan(document.body);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(scan))).observe(document.body,{childList:true,subtree:true});event('entry');}
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;try{const u=new URL(a.href);if(allowed(u)){decorate(a);event('checkout',a.href)}else if(u.hostname==='wa.me')event('support');}catch{}},true);
 document.addEventListener('auxclick',e=>{const a=e.target.closest('a[href]');if(e.button===1&&a){try{if(allowed(new URL(a.href))){decorate(a);event('checkout',a.href)}}catch{}}},true);
 window.SLAttribution={link,touch:()=>({...touch})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
