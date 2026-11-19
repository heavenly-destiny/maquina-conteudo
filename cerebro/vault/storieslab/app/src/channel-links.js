// Commercial links only. Never replace referral/creator identifiers or send customer data to analytics.
export const CHANNELS={
 'instagram-bio':{label:'Instagram · bio',source:'instagram',medium:'bio',campaign:'organico',content:'perfil',term:'entrada',url:'https://app.storieslab.shop/acessar'},
 'instagram-stories':{label:'Instagram · Stories',source:'instagram',medium:'stories',campaign:'novidades',content:'story',term:'entrada',url:'https://app.storieslab.shop/acessar'},
 'whatsapp-suporte':{label:'WhatsApp · suporte',source:'whatsapp',medium:'suporte',campaign:'suporte',content:'atendimento',term:'compra',url:'https://storieslab.app/'},
 'whatsapp-recuperacao':{label:'WhatsApp · recuperação',source:'whatsapp',medium:'recuperacao',campaign:'recuperar',content:'retomada',term:'checkout',url:'https://storieslab.app/'},
 'email-recuperacao':{label:'E-mail · recuperação',source:'email',medium:'recuperacao',campaign:'recuperar',content:'lembrete',term:'checkout',url:'https://storieslab.app/'},
 'creators-whatsapp':{label:'Creators · WhatsApp pelo Story',source:'instagram',medium:'stories',campaign:'creators',content:'convite',term:'parceria',url:'https://wa.me/5543988385738?text=Ol%C3%A1%21%20Vim%20pelo%20Story%20do%20Stories%20Lab%20e%20tenho%20interesse%20em%20ser%20creator%20do%20app.%20Gostaria%20de%20saber%20mais%20sobre%20a%20parceria.%0A%0AMeu%20Instagram%20%C3%A9%3A%20%40'},
 'contato-whatsapp':{label:'Suporte · abrir WhatsApp',source:'app',medium:'whatsapp',campaign:'suporte',content:'contato',term:'atendimento',url:'https://wa.me/5543988385738?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20o%20Stories%20Lab.%0A%0AMeu%20celular%20%C3%A9%3A%20%0AMinha%20d%C3%BAvida%20%C3%A9%3A%20'},
 'app-ascensao':{label:'App · ascensão',source:'app',medium:'ascensao',campaign:'ascensao',content:'material',term:'oferta',url:'https://storieslab.app/'}
};
const clean=(s,n=100)=>String(s||'').replace(/[\u0000-\u001f]/g,'').slice(0,n);
export function trackedUrl(raw,channel,content,term){
 const c=CHANNELS[channel];if(!c)throw Error('channel');
 const u=new URL(raw||c.url);
 if(['creators-whatsapp','contato-whatsapp'].includes(channel)&&u.protocol==='https:'&&u.hostname==='wa.me'&&u.pathname==='/5543988385738'&&!u.username&&!u.password&&!u.port)return u.href;
 if(u.protocol!=='https:'||u.username||u.password||!['storieslab.shop','www.storieslab.shop','storieslab.app','www.storieslab.app','app.storieslab.app','app.storieslab.shop','go.perfectpay.com.br','checkout.perfectpay.com.br','pay.hubla.la','pay.hub.la'].includes(u.hostname)||u.port)throw Error('destination');
 const q=u.searchParams;
 if(!q.has('utm_perfect')&&q.get('utm_source'))q.set('utm_perfect',('sl1:'+['utm_source','utm_medium','utm_campaign'].map(k=>clean(q.get(k),28).replace(/:/g,'_')).join(':')).slice(0,100));
 const creator=[q.get('src'),q.get('utm_content')].find(x=>/^cri-[a-f0-9]{32}-[a-f0-9]{32}$/i.test(x||''));
 for(const [k,v] of Object.entries({source:c.source,medium:c.medium,campaign:c.campaign,content:creator||clean(content)||c.content,term:clean(term)||c.term}))q.set('utm_'+k,v);
 if(!q.has('src'))q.set('src','sl-'+channel);
 return u.href;
}
const schema='CREATE TABLE IF NOT EXISTS channel_events(day TEXT NOT NULL,source TEXT NOT NULL,medium TEXT NOT NULL,campaign TEXT NOT NULL,content TEXT NOT NULL,stage TEXT NOT NULL,n INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,source,medium,campaign,content,stage))';
export async function recordChannel(env,b){
 await env.DB.prepare(schema).run();
 const day=new Date(Date.now()-3*3600e3).toISOString().slice(0,10);
 await env.DB.prepare('INSERT INTO channel_events(day,source,medium,campaign,content,stage,n) VALUES(?,?,?,?,?,?,1) ON CONFLICT(day,source,medium,campaign,content,stage) DO UPDATE SET n=MIN(n+1,1000000)').bind(day,clean(b.source,100).split('jLj')[0].slice(0,40)||'direto',clean(b.medium,40)||'nao_identificado',clean(b.campaign),clean(b.content),clean(b.stage,24)).run();
}
export async function channelStats(env){try{return (await env.DB.prepare('SELECT * FROM channel_events ORDER BY day DESC LIMIT 5000').all()).results||[]}catch{return []}}
export async function channelRequest(req,env,ctx){
 const u=new URL(req.url),p=u.pathname;
 if(p==='/api/links'&&req.method==='GET')return Response.json({channels:Object.entries(CHANNELS).map(([id,c])=>({id,...c,link:u.origin+'/api/links/'+id}))},{headers:{'cache-control':'no-store'}});
 if(p==='/api/channel-event'&&req.method==='POST'){
  let origin;try{origin=new URL(req.headers.get('origin')).hostname}catch{return new Response(null,{status:403})}
  if(!['app.storieslab.app','app.storieslab.shop','localhost','127.0.0.1'].includes(origin))return new Response(null,{status:403});
  const raw=await req.text();if(raw.length>1800)return new Response(null,{status:413});
  let b;try{b=JSON.parse(raw)}catch{return new Response(null,{status:400})}
  if(!['entry','checkout','support'].includes(b.stage)||typeof b.source!=='string')return new Response(null,{status:400});
  ctx.waitUntil(recordChannel(env,b).catch(()=>{}));return new Response(null,{status:204});
 }
 const id=p.slice('/api/links/'.length),c=CHANNELS[id];
 if(!c||!['GET','HEAD'].includes(req.method))return new Response('Link não encontrado.',{status:404});
 let dest;try{dest=trackedUrl(u.searchParams.get('url'),id,u.searchParams.get('conteudo'),u.searchParams.get('etapa'))}catch{return new Response('Destino inválido. Use um link oficial do Stories Lab ou checkout.',{status:400})}
 if(req.method==='GET'&&!/facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|Discordbot|^WhatsApp\//i.test(req.headers.get('user-agent')||'')&&req.headers.get('purpose')!=='prefetch'&&req.headers.get('sec-purpose')!=='prefetch')ctx.waitUntil(recordChannel(env,{...c,content:clean(u.searchParams.get('conteudo'))||c.content,stage:'link_open'}).catch(()=>{}));
 return new Response(null,{status:302,headers:{location:dest,'cache-control':'no-store','referrer-policy':'strict-origin-when-cross-origin','x-robots-tag':'noindex'}});
}
export function saleChannel(m){
 const read=k=>clean(m?.[k]??m?.[k.replace('utm_','')]);
 const sourceRaw=read('utm_source'),source=({fb:'facebook',ig:'instagram'}[sourceRaw.split('jLj')[0].toLowerCase()]||sourceRaw.split('jLj')[0]),medium=read('utm_medium'),campaign=read('utm_campaign'),content=read('utm_content'),term=read('utm_term');
 const marker=read('utm_perfect').split(':');
 return {source,sourceRaw,medium,utmCampaign:campaign,utmContent:content,utmTerm:term,...(marker[0]==='sl1'?{previousTouch:{source:marker[1]||'',medium:marker[2]||'',campaign:marker[3]||''}}:{})};
}

export const SHORT_ROUTES={'/bio':'instagram-bio','/stories':'instagram-stories','/creator':'creators-whatsapp','/suporte':'contato-whatsapp','/oferta-suporte':'whatsapp-suporte','/recuperar':'whatsapp-recuperacao'};
const shortSchema='CREATE TABLE IF NOT EXISTS short_links(slug TEXT PRIMARY KEY,channel TEXT NOT NULL,url TEXT NOT NULL,content TEXT NOT NULL,term TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,clicks INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,updated TEXT NOT NULL)';
const trashSchema='CREATE TABLE IF NOT EXISTS short_link_trash(slug TEXT PRIMARY KEY,deletedAt TEXT NOT NULL)';
const ensureShortLinks=env=>env.DB.batch([env.DB.prepare(shortSchema),env.DB.prepare(trashSchema)]);
const slugOk=s=>/^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/.test(s||'');
export async function shortRequest(req,env,ctx){
 const u=new URL(req.url),channel=SHORT_ROUTES[u.pathname];
 if(channel){u.pathname='/api/links/'+channel;return channelRequest(new Request(u,req),env,ctx)}
 const slug=u.pathname.slice(3);
 if(!['GET','HEAD'].includes(req.method)||!slugOk(slug))return new Response('Link não encontrado.',{status:404});
 await ensureShortLinks(env);
 const r=await env.DB.prepare('SELECT * FROM short_links WHERE slug=? AND active=1 AND NOT EXISTS(SELECT 1 FROM short_link_trash WHERE short_link_trash.slug=short_links.slug)').bind(slug).first();
 if(!r)return new Response('Este link está indisponível. Peça um novo link à equipe Stories Lab.',{status:404,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
 let target;try{target=trackedUrl(r.url,r.channel,r.content,r.term)}catch{return new Response('Link indisponível.',{status:404})}
 if(req.method==='GET'&&!/facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|Discordbot|^WhatsApp\//i.test(req.headers.get('user-agent')||'')&&req.headers.get('purpose')!=='prefetch'&&req.headers.get('sec-purpose')!=='prefetch')ctx.waitUntil(Promise.all([env.DB.prepare('UPDATE short_links SET clicks=clicks+1 WHERE slug=?').bind(slug).run(),recordChannel(env,{...CHANNELS[r.channel],content:r.content||CHANNELS[r.channel].content,stage:'link_open'})]).catch(()=>{}));
 return new Response(null,{status:302,headers:{location:target,'cache-control':'no-store','x-robots-tag':'noindex'}});
}
// Called only after adminOk() by the authenticated admin router.
export async function shortAdmin(req,env){
 await ensureShortLinks(env);
 const reply=(b,status=200)=>Response.json(b,{status,headers:{'cache-control':'no-store'}});
 if(req.method==='GET'){
  const [live,trash]=await env.DB.batch([env.DB.prepare('SELECT * FROM short_links WHERE NOT EXISTS(SELECT 1 FROM short_link_trash WHERE short_link_trash.slug=short_links.slug) ORDER BY created DESC LIMIT 200'),env.DB.prepare('SELECT short_links.*,short_link_trash.deletedAt FROM short_links JOIN short_link_trash ON short_link_trash.slug=short_links.slug ORDER BY short_link_trash.deletedAt DESC LIMIT 200')]);
  return reply({links:live.results||[],trash:trash.results||[],fixed:Object.entries(SHORT_ROUTES).map(([path,channel])=>({path,channel,label:CHANNELS[channel].label}))});
 }
 if(!['POST','PUT'].includes(req.method))return reply({error:'method'},405);
 const raw=await req.text();if(raw.length>5000)return reply({error:'size'},413);
 let b;try{b=JSON.parse(raw)}catch{return reply({error:'json'},400)}
 if(!b||typeof b!=='object'||Array.isArray(b))return reply({error:'data'},400);
 const slug=clean(b.slug,48).toLowerCase();
 if(req.method==='PUT'){
  if(['delete','restore'].includes(b.action)){
   if(!slugOk(slug))return reply({error:'data'},400);
   if(!await env.DB.prepare('SELECT slug FROM short_links WHERE slug=?').bind(slug).first())return reply({error:'not_found'},404);
   if(b.action==='delete')await env.DB.prepare('INSERT OR IGNORE INTO short_link_trash(slug,deletedAt) VALUES(?,?)').bind(slug,new Date().toISOString()).run();
   else await env.DB.prepare('DELETE FROM short_link_trash WHERE slug=?').bind(slug).run();
   return reply({ok:true,deleted:b.action==='delete'});
  }
  if(!slugOk(slug)||typeof b.active!=='boolean')return reply({error:'data'},400);
  const r=await env.DB.prepare('UPDATE short_links SET active=?,updated=? WHERE slug=?').bind(b.active?1:0,new Date().toISOString(),slug).run();
  return reply({ok:!!r.meta?.changes},r.meta?.changes?200:404);
 }
 const id=b.channel,c=CHANNELS[id];if(!c||slug&&!slugOk(slug))return reply({error:'data',message:'Use de 3 a 48 letras minúsculas, números ou hífens no nome do link.'},400);
 let target;try{target=trackedUrl(b.url,id,b.content,b.term)}catch{return reply({error:'destination',message:'Destino inválido. Use um link oficial do Stories Lab ou checkout.'},400)}
 const dest=new URL(target);if(['storieslab.app','www.storieslab.app','app.storieslab.app','storieslab.shop','app.storieslab.shop'].includes(dest.hostname)&&(dest.pathname.startsWith('/l/')||SHORT_ROUTES[dest.pathname]))return reply({error:'chain',message:'Use o destino final, sem outro link curto, para evitar redirecionamentos em círculo.'},400);
 const name=slug||crypto.randomUUID().replace(/-/g,'').slice(0,8),now=new Date().toISOString();
 const r=await env.DB.prepare('INSERT OR IGNORE INTO short_links(slug,channel,url,content,term,created,updated) VALUES(?,?,?,?,?,?,?)').bind(name,id,b.url||c.url,clean(b.content)||c.content,clean(b.term)||c.term,now,now).run();
 if(!r.meta?.changes)return reply({error:'exists',message:'Esse nome já está em uso. Escolha outro; o link anterior foi preservado.'},409);
 return reply({ok:true,slug:name,link:'https://storieslab.app/l/'+name,alternateLink:'https://app.storieslab.app/l/'+name,destination:target},201);
}
