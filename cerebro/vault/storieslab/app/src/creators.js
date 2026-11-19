// Creator access is separate from customer purchases, cookies and referral rewards.
import {parseSales,parseBody,adminOk} from './admin.js';
import {makePass} from './pass.js';
import {CREATOR_VAPID,validPushEndpoint,sendCreatorPush} from './creator-push.js';
const APP='https://app.storieslab.app', APP_OLD='https://app.storieslab.shop', KIT='https://kit-storieslab.vercel.app';
const FEATURES=['basico','premium','agenda','magneticos','presets','animadas'];
const random=()=>crypto.randomUUID().replaceAll('-','');
export const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
export const instagramHandle=value=>{
 const handle=String(value||'').trim().replace(/^@/,'').toLowerCase();
 return /^(?!.*\.\.)(?!\.)[a-z0-9_.]{1,30}(?<!\.)$/.test(handle)?handle:null;
};
const linkFor=(p,to='page',plan='premium')=>APP+'/api/creators/go/'+p.id+(to==='checkout'?'?to=checkout&plan='+plan:'');
const publicProfile=p=>({id:p.id,name:p.instagram?'@'+p.instagram:p.name,instagram:p.instagram||null,partnerApproved:!!p.partner_approved,
 ...(p.partner_approved?{commission:p.commission,link:linkFor(p),checkoutLinks:{premium:linkFor(p,'checkout'),basico:linkFor(p,'checkout','basico')}}:{})});
async function account(req,env){
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
 if(!/^[a-f0-9]{64}$/.test(token))return null;
 const hash=await digest(token);
 return env.DB.prepare("SELECT * FROM creators WHERE active=1 AND (token_hash=? OR id IN (SELECT creator FROM creator_devices WHERE token_hash=? AND state='active'))").bind(hash,hash).first();
}
const deviceLabel=value=>['iPhone · app instalado','iPhone · Safari','Android · app instalado','Android · navegador','Computador · navegador'].includes(value)?value:'Novo navegador';
async function ensureFirstDevice(env,p){
 await env.DB.prepare("INSERT OR IGNORE INTO creator_devices(id,creator,token_hash,label,state,created) VALUES(?,?,?,'Primeiro acesso','active',?)").bind(p.id,p.id,p.token_hash,p.created).run();
}
async function deviceCount(env,id){return (await env.DB.prepare("SELECT COUNT(*) n FROM creator_devices WHERE creator=? AND state='active'").bind(id).first()).n;}
const fullDevices=()=>json({ok:false,error:'Você já tem 3 acessos ativos. Fale com a equipe para trocar um aparelho.'},409);
async function limit(req,env,action,max){
 const now=Date.now(),hour=Math.floor(now/3600000),ip=req.headers.get('cf-connecting-ip')||'local';
 const bucket=await digest(env.HOOK_KEY+':'+action+':'+ip+':'+hour);
 await env.DB.prepare('DELETE FROM creator_limits WHERE expires<?').bind(now).run();
 const row=await env.DB.prepare('INSERT INTO creator_limits(bucket,n,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET n=n+1 RETURNING n').bind(bucket,now+7200000).first();
 return row.n<=max;
}
export function trackingTag(s){return /^(?:cri-)([a-f0-9]{32})-([a-f0-9]{32})$/.exec(s||'');}
// Rebuild from the payment source of truth. Remember attribution when refund payloads omit UTMs.
export async function attributedSales(rows,clicks){
 const clickMap=new Map(clicks.map(c=>[c.id,c])), attribution=new Map(), paidAt=new Map(), nets=new Map(), groups={pp:[],hubla:[]};
 for(const row of rows){
  groups[row.body?.startsWith('hubla ')?'hubla':'pp'].push(row);
  for(const sale of await parseSales([row])){
   const saleKey=sale.src+':'+sale.id;
   if(sale.status==='paid'){
    if(!paidAt.has(saleKey))paidAt.set(saleKey,row.at);
    const net=exactNet(row,sale);if(net!==null)nets.set(saleKey,net);
   }
   const m=trackingTag(sale.tag)||trackingTag(sale.ad), click=m&&clickMap.get(m[2]);
   if(click&&click.creator===m[1]&&Date.parse(sale.created)>=Date.parse(click.created)-60000&&Date.parse(sale.created)-Date.parse(click.created)<=30*864e5){
    const k=sale.src+':'+sale.id;if(!attribution.has(k))attribution.set(k,click.creator);
   }
  }
 }
 const sales=[...await parseSales(groups.pp),...await parseSales(groups.hubla)];
 return sales.map(s=>({...s,creator:attribution.get(s.src+':'+s.id),paidAt:paidAt.get(s.src+':'+s.id)||null,net:nets.get(s.src+':'+s.id)??null})).filter(s=>s.creator);
}
// Never substitute average fees for an influencer's earned commission.
function exactNet(row,sale){
 if(sale.src==='hubla'){
  const b=JSON.parse(row.body.slice(6)),inv=b.event?.invoice;
  const seller=inv?.receivers?.find(x=>x.role==='seller');
  if(seller?.totalCents==null||seller.totalCents===''||!Number.isFinite(Number(seller.totalCents)))return null;
 }else{
  const b=parseBody(row.body),producer=Object.values(b.commission||{}).find(c=>c&&(c.affiliation_type_enum_key==='producer'||String(c.affiliation_type_enum)==='1'));
  if(producer?.commission_amount==null||producer.commission_amount===''||!Number.isFinite(Number(producer.commission_amount)))return null;
 }
 return Number.isFinite(sale.net)&&sale.net>=0&&sale.net<=sale.price?sale.net:null;
}
const cents=n=>Math.round(n*100),money=n=>n/100;
export function aggregate(profile,clicks,sales,from='',to='9999',platform='',terms=[]){
 const day=t=>new Date(Date.parse(t)-10800000).toISOString().slice(0,10),within=t=>day(t)>=from&&day(t)<=to;
 const visits=clicks.filter(c=>c.creator===profile.id&&within(c.created));
 const items=sales.filter(s=>s.creator===profile.id&&within(s.paidAt||s.created)&&(!platform||s.src===platform));
 const paid=items.filter(s=>s.status==='paid'),refunds=items.filter(s=>['refunded','chargeback'].includes(s.status));
 const history=terms.filter(t=>t.creator===profile.id).sort((a,b)=>b.effective_at.localeCompare(a.effective_at)||b.id-a.id);
 let gross=0,net=0,earned=0,missingNet=0,commissionPending=0;
 const orders=new Map();
 for(const sale of items){
  const term=sale.paidAt&&history.find(t=>t.effective_at<=sale.paidAt),rate=term?.approved?term.rate_bps:0;
  const known=sale.net!==null&&Number.isFinite(sale.net),amount=known?cents(sale.net):0;
  const share=sale.status==='paid'&&known?Math.round(amount*rate/10000):0;
  if(sale.status==='paid'){gross+=cents(sale.price);net+=amount;earned+=share;if(!known){missingNet++;if(rate)commissionPending++;}}
  const key=sale.src+':'+sale.id.split(':')[0],order=orders.get(key)||{id:key,at:sale.paidAt||sale.created,status:sale.status,gross:0,net:0,commission:0,pending:false,rate:rate/100};
  order.gross+=sale.status==='paid'?cents(sale.price):0;order.net+=sale.status==='paid'?amount:0;order.commission+=share;order.pending ||= sale.status==='paid'&&!known;
  if(['refunded','chargeback'].includes(sale.status))order.status=sale.status;
  orders.set(key,order);
 }
 return {...publicProfile(profile),clicks:visits.length,visitors:new Set(visits.map(c=>c.visitor)).size,
  pageClicks:visits.filter(c=>c.destination!=='checkout').length,checkoutClicks:visits.filter(c=>c.destination==='checkout').length,
  buyers:new Set(paid.filter(s=>s.kind==='main').map(s=>s.buyer)).size,
  sales:new Set(paid.filter(s=>s.kind==='main').map(s=>s.src+':'+s.id.split(':')[0])).size,
  revenue:money(gross),gross:money(gross),net:money(net),earnings:money(earned),brandNet:money(net-earned),missingNet,commissionPending,
  refunds:new Set(refunds.map(s=>s.src+':'+s.id.split(':')[0])).size,refunded:money(refunds.reduce((n,s)=>n+cents(s.price),0)),
  recent:[...orders.values()].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,30).map(o=>({...o,gross:money(o.gross),net:money(o.net),commission:money(o.commission)}))};
}
async function metrics(env,profiles,params){
 const {results:clicks}=await env.DB.prepare('SELECT * FROM creator_clicks').all();
 const {results:terms}=await env.DB.prepare('SELECT * FROM creator_terms ORDER BY effective_at,id').all();
 let sales=[];
 if(clicks.length){
  const first=clicks.reduce((a,c)=>c.created<a?c.created:a,clicks[0].created);
  const {results:logs}=await env.DB.prepare('SELECT at,body FROM hooklog WHERE at>=? ORDER BY id').bind(first).all();sales=await attributedSales(logs,clicks);
 }
 return profiles.map(p=>aggregate(p,clicks,sales,params.get('from')||'',params.get('to')||'9999',params.get('platform')||'',terms));
}
export async function creatorAdmin(req,env){
 if(!await adminOk(req,env))return json({ok:false},401);
 if(!['GET','POST'].includes(req.method))return json({ok:false},405);
 if(req.method==='POST'){
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  const rate=Math.round(b.commission*100);
  if(!/^[a-f0-9]{32}$/.test(b.id)||![0,1].includes(b.active)||![0,1].includes(b.partnerApproved)||!Number.isSafeInteger(b.feeCents)||b.feeCents<0||b.feeCents>1e9||!Number.isFinite(b.commission)||b.commission<0||b.commission>100||Math.abs(b.commission*100-rate)>1e-6)return json({ok:false,error:'Confira os valores.'},400);
  const old=await env.DB.prepare('SELECT * FROM creators WHERE id=?').bind(b.id).first();
  if(!old)return json({ok:false},404);
  if(b.partnerApproved&&!old.instagram)return json({ok:false,error:'Peça à influencer para informar o @ no kit antes de liberar.'},400);
  const now=new Date().toISOString();
  // The INSERT reads the current row inside D1's atomic batch, so concurrent admin saves keep an ordered history.
  await env.DB.batch([
   env.DB.prepare('INSERT INTO creator_terms(creator,effective_at,approved,rate_bps) SELECT id,?,?,? FROM creators WHERE id=? AND (partner_approved<>? OR commission<>? OR active<>?)')
    .bind(now,b.partnerApproved&&b.active?1:0,rate,b.id,b.partnerApproved,b.commission,b.active),
   env.DB.prepare('UPDATE creators SET active=?,partner_approved=?,fee_cents=?,commission=? WHERE id=?').bind(b.active,b.partnerApproved,b.feeCents,b.commission,b.id)
  ]);
 }
 const {results:profiles}=await env.DB.prepare('SELECT id,name,instagram,created,active,partner_approved,fee_cents,commission FROM creators ORDER BY created DESC').all();
 const data=await metrics(env,profiles,new URL(req.url).searchParams);
 return json({ok:true,items:data.map((s,i)=>({...s,created:profiles[i].created,active:profiles[i].active,feeCents:profiles[i].fee_cents,commission:profiles[i].commission,partnerApproved:!!profiles[i].partner_approved}))});
}
export async function creators(req,env){
 const url=new URL(req.url),origin=req.headers.get('origin');
 const local=url.hostname==='localhost'||url.hostname==='127.0.0.1';
 const allowed=!origin||[APP,APP_OLD,KIT,url.origin].includes(origin)||(local&&/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));
 if(!allowed)return json({ok:false},403);
 let response;
 if(req.method==='OPTIONS')response=new Response(null,{status:204});
 else {try{response=await route(req,env,url)}catch(e){console.error('creator request failed',e.name);response=json({ok:false,error:'Não foi possível concluir. Tente novamente.'},500)}}
 if(origin&&allowed){response.headers.set('access-control-allow-origin',origin);response.headers.set('vary','Origin');response.headers.set('access-control-allow-methods','GET,POST,OPTIONS');response.headers.set('access-control-allow-headers','content-type,authorization');}
 return response;
}
async function route(req,env,url){
 const path=url.pathname;
 if(path.startsWith('/api/creators/go/')&&['GET','HEAD'].includes(req.method)){
  const id=path.split('/').at(-1),p=await env.DB.prepare('SELECT id,partner_approved FROM creators WHERE id=? AND active=1').bind(id).first();
  if(!p)return json({ok:false,error:'Link indisponível.'},404);
  const destination=url.searchParams.get('to')==='checkout'?'checkout':'page';
  const plan=url.searchParams.get('plan')||'premium';
  const checkout={premium:'https://pay.hub.la/QMj5JhJdg9dEnbG262ZQ',basico:'https://pay.hub.la/ZjRp7qhKO17c5BwcqW2n'};
  if(destination==='checkout'&&!checkout[plan])return json({ok:false,error:'Plano inválido.'},400);
  const target=new URL(p.partner_approved&&destination==='checkout'?checkout[plan]:'https://storieslab.app/');
  const bot=/bot|crawler|spider|preview|facebookexternalhit|WhatsApp|Slack|Telegram/i.test(req.headers.get('user-agent')||'')||req.headers.get('purpose')==='prefetch'||req.headers.get('sec-purpose')?.includes('prefetch');
  let visitor=(/(?:^|;\s*)sl_cv=([a-f0-9]{32})(?:;|$)/.exec(req.headers.get('cookie')||'')||[])[1]||random();
  if(req.method==='GET'&&!bot&&p.partner_approved){
   const idClick=random();await env.DB.prepare('INSERT INTO creator_clicks(id,creator,visitor,created,destination) VALUES(?,?,?,?,?)').bind(idClick,p.id,visitor,new Date().toISOString(),destination).run();
   const tag='cri-'+p.id+'-'+idClick;target.searchParams.set('src',tag);target.searchParams.set('utm_content',tag);target.searchParams.set('utm_source','influencer');target.searchParams.set('utm_campaign',p.id.slice(0,10));target.searchParams.set('utm_medium',destination==='checkout'?'checkout':'social');
  }
  return new Response(null,{status:302,headers:{location:target.toString(),'cache-control':'no-store','referrer-policy':'no-referrer','set-cookie':`sl_cv=${visitor}; Path=/api/creators/go/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`}});
 }
 if(path==='/api/creators/register'&&req.method==='POST'){
  if(!await limit(req,env,'register',15))return json({ok:false,error:'Muitas tentativas. Tente mais tarde.'},429);
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  const instagram=instagramHandle(b.instagram);
  if(!instagram)return json({ok:false,error:'Digite seu @ do Instagram, sem espaços.'},400);
  const existing=await env.DB.prepare('SELECT * FROM creators WHERE instagram=?').bind(instagram).first();
  if(existing){
   if(!existing.active)return json({ok:false,error:'Acesso indisponível. Fale com a equipe.'},403);
   await ensureFirstDevice(env,existing);
   if(!/^[a-f0-9]{64}$/.test(b.deviceToken||''))return json({ok:false,error:'Entre pelo seu acesso salvo ou atualize o kit para conectar este aparelho.'},409);
   const hash=await digest(b.deviceToken),known=await env.DB.prepare('SELECT * FROM creator_devices WHERE token_hash=?').bind(hash).first();
   if(known){
    if(known.creator!==existing.id)return json({ok:false},409);
    if(known.state==='active')return json({ok:true,token:b.deviceToken,profile:publicProfile(existing)});
    if(known.state==='pending'&&known.expires>Date.now())return json({ok:true,pending:true,expires:known.expires},202);
    return json({ok:false,error:'Solicitação encerrada. Tente entrar novamente.'},410);
   }
   if(await deviceCount(env,existing.id)>=3)return fullDevices();
   await env.DB.prepare("DELETE FROM creator_devices WHERE state<>'active' AND expires<?").bind(Date.now()).run();
   const expires=Date.now()+10*60000;
   // A public Instagram handle can request access, never obtain someone else's financial data.
   const result=await env.DB.prepare("INSERT INTO creator_devices(id,creator,token_hash,label,state,created,expires) SELECT ?,?,?,?,'pending',?,? WHERE (SELECT COUNT(*) FROM creator_devices WHERE creator=? AND state='pending')<3")
    .bind(random(),existing.id,hash,deviceLabel(b.label),new Date().toISOString(),expires,existing.id).run();
   if(!result.meta.changes)return json({ok:false,error:'Há uma solicitação aguardando confirmação. Tente novamente em alguns minutos.'},429);
   return json({ok:true,pending:true,expires},202);
  }
  const id=random(),token=/^[a-f0-9]{64}$/.test(b.deviceToken||'')?b.deviceToken:random()+random(),created=new Date().toISOString(),name='@'+instagram;
  const result=await env.DB.prepare('INSERT OR IGNORE INTO creators(id,name,instagram,token_hash,created,commission) VALUES(?,?,?,?,?,50)').bind(id,name,instagram,await digest(token),created).run();
  if(!result.meta.changes)return json({ok:false,error:'Tente entrar novamente para conectar este aparelho.'},409);
  await ensureFirstDevice(env,{id,token_hash:await digest(token),created});
  return json({ok:true,token,profile:publicProfile({id,name,instagram})});
 }
 if(path==='/api/creators/devices/status'&&req.method==='POST'){
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  if(!/^[a-f0-9]{64}$/.test(b.token||''))return json({ok:false},401);
  const device=await env.DB.prepare('SELECT * FROM creator_devices WHERE token_hash=?').bind(await digest(b.token)).first();
  if(!device)return json({ok:false,error:'Solicitação encerrada. Entre novamente.'},410);
  const p=await env.DB.prepare('SELECT * FROM creators WHERE id=? AND active=1').bind(device.creator).first();
  if(!p)return json({ok:false,error:'Acesso indisponível.'},403);
  if(device.state==='active')return json({ok:true,token:b.token,profile:publicProfile(p)});
  if(device.state==='denied'||device.expires<Date.now())return json({ok:false,error:'Solicitação encerrada. Entre novamente ou use seu link pessoal salvo.'},410);
  return json({ok:true,pending:true});
 }
 if(path==='/api/creators/exchange'&&req.method==='POST'){
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  if(!/^[a-f0-9]{64}$/.test(b.code||''))return json({ok:false},401);
  const handoff=await env.DB.prepare('DELETE FROM creator_handoffs WHERE hash=? AND expires>? RETURNING creator').bind(await digest(b.code),Date.now()).first();
  if(!handoff)return json({ok:false,error:'Abra o app novamente pelo kit.'},401);
  // A separate signed app credential does not rotate or reveal the kit's private token.
  const p=await env.DB.prepare('SELECT * FROM creators WHERE id=? AND active=1').bind(handoff.creator).first();
  if(!p)return json({ok:false},401);
  return json({ok:true,credential:await appCredential(env,p.id),profile:publicProfile(p)});
 }
 if(path==='/api/creators/app'&&req.method==='POST'){
  const p=await appAccount(req,env);if(!p)return json({ok:false,error:'Abra seu acesso pelo kit.'},401);
  return json({ok:true,email:'creator:'+p.id,name:p.name,creator:true,features:FEATURES,profile:publicProfile(p),pass:await makePass(env,'creator:'+p.id,'*')});
 }
 if(path==='/api/creators/feedback'&&req.method==='POST'){
  const p=await appAccount(req,env);if(!p)return json({ok:false},401);
  const b=await req.json(),message=String(b.message||'').trim();
  if(message.length<10||message.length>2000||!/^[a-f0-9-]{36}$/.test(b.id||''))return json({ok:false},400);
  const email='creator:'+p.id,n=await env.DB.prepare('SELECT COUNT(*) n FROM feedback WHERE email=? AND created>=?').bind(email,new Date(Date.now()-864e5).toISOString()).first();
  if(n.n>=5)return json({ok:false},429);
  await env.DB.prepare('INSERT OR IGNORE INTO feedback(id,email,kind,tool,message,created) VALUES(?,?,?,?,?,?)').bind(b.id,email,['melhoria','novidade','problema'].includes(b.kind)?b.kind:'melhoria',FEATURES.includes(b.tool)?b.tool:'geral',message,new Date().toISOString()).run();
  return json({ok:true});
 }
 const p=await account(req,env);if(!p)return json({ok:false,error:'Acesso indisponível. Entre novamente pelo kit.'},401);
 if(path==='/api/creators/devices/restore'&&req.method==='POST'){
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  if(!/^[a-f0-9]{64}$/.test(b.deviceToken||''))return json({ok:false},400);
  await ensureFirstDevice(env,p);
  const hash=await digest(b.deviceToken),known=await env.DB.prepare('SELECT * FROM creator_devices WHERE token_hash=?').bind(hash).first();
  if(known){
   if(known.creator!==p.id||known.state!=='active')return json({ok:false},409);
  }else{
   const result=await env.DB.prepare("INSERT INTO creator_devices(id,creator,token_hash,label,state,created) SELECT ?,?,?,?,'active',? WHERE (SELECT COUNT(*) FROM creator_devices WHERE creator=? AND state='active')<3")
    .bind(random(),p.id,hash,deviceLabel(b.label),new Date().toISOString(),p.id).run();
   if(!result.meta.changes)return fullDevices();
  }
  return json({ok:true,token:b.deviceToken,profile:publicProfile(p)});
 }
 if(path==='/api/creators/devices/confirm'&&req.method==='POST'){
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  if(!/^[a-f0-9]{32}$/.test(b.id||'')||typeof b.allow!=='boolean')return json({ok:false},400);
  await ensureFirstDevice(env,p);
  const result=await env.DB.prepare("UPDATE creator_devices SET state=? WHERE id=? AND creator=? AND state='pending' AND expires>? AND (?=0 OR (SELECT COUNT(*) FROM creator_devices WHERE creator=? AND state='active')<3)")
   .bind(b.allow?'active':'denied',b.id,p.id,Date.now(),b.allow?1:0,p.id).run();
  if(!result.meta.changes)return json({ok:false,error:'Solicitação encerrada ou limite de 3 acessos atingido.'},409);
  return json({ok:true});
 }
 if(path==='/api/creators/push'){
  if(!p.partner_approved)return json({ok:false,error:'Aguarde a liberação da parceria.'},403);
  if(req.method==='GET')return json({ok:true,publicKey:CREATOR_VAPID});
  if(req.method!=='POST')return json({ok:false},405);
  let b;try{b=await req.json()}catch{return json({ok:false},400)}
  const endpoint=String(b.endpoint||'');if(!validPushEndpoint(endpoint))return json({ok:false},400);
  if(b.remove){await env.DB.prepare('DELETE FROM creator_push WHERE endpoint=? AND creator=?').bind(endpoint,p.id).run();return json({ok:true});}
  const existing=await env.DB.prepare('SELECT creator FROM creator_push WHERE endpoint=?').bind(endpoint).first();
  if(existing&&existing.creator!==p.id)return json({ok:false,error:'Desative as notificações do outro perfil neste aparelho primeiro.'},409);
  const count=await env.DB.prepare('SELECT COUNT(*) n FROM creator_push WHERE creator=?').bind(p.id).first();
  if(!existing&&count.n>=5)return json({ok:false,error:'Limite de cinco aparelhos atingido.'},409);
  await env.DB.prepare('INSERT OR IGNORE INTO creator_push(endpoint,creator,created) VALUES(?,?,?)').bind(endpoint,p.id,new Date().toISOString()).run();
  return json({ok:true});
 }
 if(path==='/api/creators/profile'&&req.method==='POST'){
  if(p.instagram)return json({ok:false,error:'Seu @ já está vinculado.'},409);
  const b=await req.json(),instagram=instagramHandle(b.instagram);
  if(!instagram)return json({ok:false,error:'Confira seu @ do Instagram.'},400);
  const result=await env.DB.prepare('UPDATE OR IGNORE creators SET instagram=?,name=? WHERE id=? AND instagram IS NULL').bind(instagram,'@'+instagram,p.id).run();
  if(!result.meta.changes)return json({ok:false,error:'Esse @ já está em uso. Fale com a equipe.'},409);
  return json({ok:true,profile:publicProfile({...p,instagram,name:'@'+instagram})});
 }
 if(path==='/api/creators/me'&&req.method==='GET'){
  const {results:deviceRequests}=await env.DB.prepare("SELECT id,label,created FROM creator_devices WHERE creator=? AND state='pending' AND expires>? ORDER BY created").bind(p.id,Date.now()).all();
  return json({ok:true,profile:publicProfile(p),deviceRequests,...(p.partner_approved?{stats:(await metrics(env,[p],url.searchParams))[0]}:{})});
 }
 if(path==='/api/creators/handoff'&&req.method==='POST'){
  const code=random()+random();await env.DB.prepare('DELETE FROM creator_handoffs WHERE expires<?').bind(Date.now()).run();
  await env.DB.prepare('INSERT INTO creator_handoffs(hash,creator,expires) VALUES(?,?,?)').bind(await digest(code),p.id,Date.now()+120000).run();
  return json({ok:true,url:APP+'/?creator=1#access='+code});
 }
 return json({ok:false},404);
}
async function sign(env,text){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('creator-session:'+env.HOOK_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);return {key,bytes:new TextEncoder().encode(text)}}
async function appCredential(env,id){const body=id+'.'+(Date.now()+90*864e5),{key,bytes}=await sign(env,body),sig=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes)),b=>b.toString(16).padStart(2,'0')).join('');return body+'.'+sig;}
async function appAccount(req,env){
 const credential=(req.headers.get('authorization')||'').replace(/^Bearer /,''),m=/^([a-f0-9]{32})\.(\d{13})\.([a-f0-9]{64})$/.exec(credential);
 if(!m||Number(m[2])<Date.now())return null;
 const {key,bytes}=await sign(env,m[1]+'.'+m[2]),sig=Uint8Array.from(m[3].match(/../g),h=>parseInt(h,16));
 if(!await crypto.subtle.verify('HMAC',key,sig,bytes))return null;
 return env.DB.prepare('SELECT id,name,instagram,partner_approved,commission FROM creators WHERE id=? AND active=1').bind(m[1]).first();
}

// Runs every minute. Only newly confirmed, attributed main orders notify approved partners.
// Durable per-device delivery records deduplicate webhook retries and concurrent cron runs.
export async function notifyCreatorSales(env,send=sendCreatorPush,now=new Date().toISOString()){
 if(send===sendCreatorPush&&!env.VAPID_D)return {skipped:'no push key'};
 const {results:subs}=await env.DB.prepare('SELECT s.* FROM creator_push s JOIN creators c ON c.id=s.creator WHERE c.active=1 AND c.partner_approved=1').all();
 if(!subs.length)return {sent:0};
 const {results:clicks}=await env.DB.prepare('SELECT * FROM creator_clicks').all();if(!clicks.length)return {sent:0};
 const first=clicks.reduce((a,c)=>c.created<a?c.created:a,clicks[0].created);
 const {results:logs}=await env.DB.prepare('SELECT at,body FROM hooklog WHERE at>=? ORDER BY id').bind(first).all();
 const {results:terms}=await env.DB.prepare('SELECT * FROM creator_terms ORDER BY effective_at DESC,id DESC').all();
 const paid=(await attributedSales(logs,clicks)).filter(s=>s.kind==='main'&&s.status==='paid'&&s.paidAt&&Date.parse(s.paidAt)>Date.parse(now)-7*864e5&&terms.find(t=>t.creator===s.creator&&t.effective_at<=s.paidAt)?.approved);
 let sent=0,attempted=0;const minute=new Date(Date.parse(now)-60000).toISOString(),lease=new Date(Date.parse(now)-300000).toISOString();
 for(const sub of subs)for(const sale of paid){
  if(sale.creator!==sub.creator||sale.paidAt<sub.created)continue;
  const id=sale.src+':'+sale.id.split(':')[0];
  await env.DB.prepare('INSERT OR IGNORE INTO creator_push_deliveries(endpoint,sale,status,updated) VALUES(?,?,?,?)').bind(sub.endpoint,id,'pending','1970-01-01T00:00:00.000Z').run();
  if(attempted>=40)return {sent,attempted};
  const claim=await env.DB.prepare("UPDATE creator_push_deliveries SET status='sending',updated=?,attempts=attempts+1 WHERE endpoint=? AND sale=? AND attempts<5 AND ((status='pending' AND updated<=?) OR (status='sending' AND updated<=?)) RETURNING sale").bind(now,sub.endpoint,id,minute,lease).first();
  if(!claim)continue;attempted++;
  try{
   const response=await send(env,sub.endpoint,(await digest(id)).slice(0,32));
   const pushError=response.ok?null:String(response.status)+':'+(await response.text()).slice(0,200);
   await env.DB.prepare('UPDATE creator_push_deliveries SET last_error=? WHERE endpoint=? AND sale=?').bind(pushError,sub.endpoint,id).run();
   if(response.status===404||response.status===410)await env.DB.prepare('DELETE FROM creator_push WHERE endpoint=?').bind(sub.endpoint).run();
   if(response.ok)sent++;
   await env.DB.prepare('UPDATE creator_push_deliveries SET status=? WHERE endpoint=? AND sale=? AND updated=?').bind(response.ok||[404,410].includes(response.status)?'sent':'pending',sub.endpoint,id,now).run();
  }catch(error){await env.DB.prepare("UPDATE creator_push_deliveries SET status='pending',last_error=? WHERE endpoint=? AND sale=? AND updated=?").bind(String(error?.name||'Error')+':'+String(error?.message||'').slice(0,160),sub.endpoint,id,now).run();}
 }
 return {sent,attempted};
}
