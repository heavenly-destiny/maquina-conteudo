// Tool trials + customer feedback. Uses the existing email-login identity; it does not add OTP authentication.
export const TOOL_KEYS=['presets','agenda','magneticos','animadas','figurinhas'];
export const FIG_DAILY=100;/* 13/11: 100 distinct stickers a day, then the R$ 49,90 unlimited offer (owner) */ // was 5;   // owner 04/11: 5 free stickers a day; the 'figurinhas' feature (R$5,90) unlocks unlimited
export const TRIAL_LIMIT=3;
const encoder=new TextEncoder(),json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const encode=s=>btoa(unescape(encodeURIComponent(s))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode=s=>decodeURIComponent(escape(atob(s.replaceAll('-','+').replaceAll('_','/'))));
async function hmac(env,data){if(!env.HOOK_KEY)throw Error('Session signing unavailable');const k=await crypto.subtle.importKey('raw',encoder.encode('storieslab-session-v1:'+env.HOOK_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',k,encoder.encode(data)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function sessionCookie(env,email){const body=encode(JSON.stringify({email,exp:Date.now()+7*864e5}));return `sl_session=${body}.${await hmac(env,body)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;}
export async function sessionEmail(req,env){try{const raw=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('sl_session='))?.slice(11);if(!raw)return null;const[a,b]=raw.split('.'),expected=await hmac(env,a);if(!b||b.length!==expected.length)return null;let mismatch=0;for(let i=0;i<b.length;i++)mismatch|=b.charCodeAt(i)^expected.charCodeAt(i);if(mismatch)return null;const d=JSON.parse(decode(a));return d.exp>Date.now()&&typeof d.email==='string'?d.email:null;}catch{return null;}}
export const trialDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export const dayLimit=(start,day)=>!start||Date.parse(day+'T12:00:00Z')-Date.parse(start+'T12:00:00Z')<2*864e5?3:2;
export async function trialState(env,email,features){const day=trialDay();const {results}=await env.DB.prepare("SELECT tool,item FROM tool_uses WHERE email=? AND day=? AND state='used'").bind(email,day).all();const{results:starts}=await env.DB.prepare('SELECT tool,day FROM tool_trial_start WHERE email=?').bind(email).all();return {day,timezone:'America/Sao_Paulo',resetsAt:new Date(Date.parse(day+'T03:00:00Z')+864e5).toISOString(),tools:Object.fromEntries(TOOL_KEYS.map(tool=>{const unlocked=results.filter(r=>r.tool===tool).map(r=>r.item),start=starts.find(s=>s.tool===tool)?.day,limit=tool==='figurinhas'?FIG_DAILY:dayLimit(start,day);return[tool,{owned:features.includes(tool),limit,started:start||null,used:unlocked.length,remaining:Math.max(0,limit-unlocked.length),unlocked}];}))};}
export async function accessStarts(env,email){const start=(await env.DB.prepare('SELECT at FROM basic_start WHERE email = ?').bind(email).first().catch(()=>null))?.at||(await env.DB.prepare('SELECT first FROM seen WHERE email = ?').bind(email).first().catch(()=>null))?.first||null;const premiumStart=(await env.DB.prepare('SELECT at FROM premium_start WHERE email = ?').bind(email).first().catch(()=>null))?.at||null;return{start,premiumStart};}
export async function customer(req,env,entitlements){const origin=req.headers.get('origin');if(origin&&!['https://app.storieslab.app','https://app.storieslab.shop',new URL(req.url).origin].includes(origin))return null;const email=await sessionEmail(req,env);if(!email)return null;const{results}=await env.DB.prepare('SELECT product,plan,status,approved,updated FROM ent WHERE email=?').bind(email).all();const starts=await accessStarts(env,email),e=entitlements(results,Date.now(),email,starts.start,starts.premiumStart);return e.features.some(x=>x!=='figurinhas')?{email,...e}:null;}
export async function toolRequest(req,env,entitlements){
 const user=await customer(req,env,entitlements);if(!user)return json({ok:false,error:'session'},401);
 let b;try{b=await req.json();}catch{return json({ok:false,error:'request'},400);}
 const {tool,action,item}=b;if(!TOOL_KEYS.includes(tool)||!['status','reserve','commit','release','unlock'].includes(action))return json({ok:false,error:'request'},400);
 if(action!=='status'&&(typeof item!=='string'||!(/^[a-zA-Z0-9_:/-]{1,120}$/).test(item)))return json({ok:false,error:'item'},400);
 const reply=async(ok,extra={},code=200)=>json({ok,...extra,trials:await trialState(env,user.email,user.features)},code);
 if(user.features.includes(tool)||action==='status')return reply(true,{owned:user.features.includes(tool)});
 const now=Date.now(),until=now+10*60e3,day=trialDay(now);
 const start=await env.DB.prepare('SELECT day FROM tool_trial_start WHERE email=? AND tool=?').bind(user.email,tool).first(),limit=tool==='figurinhas'?FIG_DAILY:dayLimit(start?.day,day);
 await env.DB.prepare("DELETE FROM tool_uses WHERE email=? AND state='reserved' AND expires<?").bind(user.email,now).run();
 if(action==='release'){await env.DB.prepare("DELETE FROM tool_uses WHERE email=? AND tool=? AND day=? AND item=? AND state='reserved'").bind(user.email,tool,day,item).run();return reply(true);}
 if(action==='commit'){
  await env.DB.prepare("UPDATE tool_uses SET state='used',expires=0 WHERE email=? AND tool=? AND day=? AND item=? AND state='reserved' AND expires>=?").bind(user.email,tool,day,item,now).run();
 }else{
  // Atomic INSERT ... SELECT: concurrent tabs cannot reserve more than the allowance.
  await env.DB.prepare("INSERT OR IGNORE INTO tool_uses(email,tool,day,item,state,expires,created) SELECT ?1,?2,?3,?4,?5,?6,?7 WHERE (SELECT COUNT(*) FROM tool_uses WHERE email=?1 AND tool=?2 AND day=?3 AND (state='used' OR expires>=?8))<?9")
   .bind(user.email,tool,day,item,action==='unlock'?'used':'reserved',action==='unlock'?0:until,new Date(now).toISOString(),now,limit).run();
  if(action==='reserve')await env.DB.prepare("UPDATE tool_uses SET expires=? WHERE email=? AND tool=? AND day=? AND item=? AND state='reserved'").bind(until,user.email,tool,day,item).run();
 }
 const row=await env.DB.prepare('SELECT state,expires FROM tool_uses WHERE email=? AND tool=? AND day=? AND item=?').bind(user.email,tool,day,item).first();
 const ok=!!row&&(action!=='commit'||row.state==='used');if(ok&&row.state==='used')await env.DB.prepare('INSERT OR IGNORE INTO tool_trial_start(email,tool,day) VALUES(?,?,?)').bind(user.email,tool,day).run();
 const status=await trialState(env,user.email,user.features);return json({ok,...(ok?{item,state:row.state,expires:row.expires}:{error:status.tools[tool].remaining?'busy':'limit'}),trials:status},ok?200:409);
}
export async function feedbackRequest(req,env,entitlements){
 const user=await customer(req,env,entitlements);if(!user)return json({ok:false,error:'session'},401);
 let b;try{b=await req.json();}catch{return json({ok:false,error:'request'},400);}
 const message=typeof b.message==='string'?b.message.trim():'',kind=b.kind,tool=b.tool||'geral';
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(b.id||'')||!['melhoria','novidade','problema'].includes(kind)||!['geral',...TOOL_KEYS,'figurinhas'].includes(tool)||message.length<10||message.length>2000)return json({ok:false,error:'validation'},400);
 const existing=await env.DB.prepare('SELECT id FROM feedback WHERE id=? AND email=?').bind(b.id,user.email).first();if(existing)return json({ok:true,id:b.id});
 const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM feedback WHERE email=? AND created>=?").bind(user.email,new Date(Date.now()-864e5).toISOString()).first();if(count.n>=5)return json({ok:false,error:'rate'},429);
 await env.DB.prepare('INSERT INTO feedback(id,email,kind,tool,message,created) VALUES(?,?,?,?,?,?)').bind(b.id,user.email,kind,tool,message,new Date().toISOString()).run();return json({ok:true,id:b.id});
}
export async function feedbackInbox(req,env){if(!env.HOOK_KEY||req.headers.get('x-k')!==env.HOOK_KEY)return json({ok:false},401);const{results}=await env.DB.prepare('SELECT id,email,kind,tool,message,created,status FROM feedback ORDER BY created DESC LIMIT 200').all();return json({ok:true,items:results});}

// 07/11: the team marks a message as done in the admin; the client sees a thank-you in the app once.
// status: novo -> concluido (admin) -> avisado (client saw it). Same admin key check as feedbackInbox.
const FB_ID=/^[a-zA-Z0-9-]{16,80}$/;
export async function feedbackDone(req,env){if(!env.HOOK_KEY||req.headers.get('x-k')!==env.HOOK_KEY)return json({ok:false},401);let b;try{b=await req.json();}catch{return json({ok:false},400);}if(!FB_ID.test(b.id||''))return json({ok:false},400);await env.DB.prepare("UPDATE feedback SET status='concluido' WHERE id=? AND status='novo'").bind(b.id).run();return json({ok:true});}
export async function feedbackNotice(req,env,entitlements){
 const user=await customer(req,env,entitlements);if(!user)return json({ok:false,error:'session'},401);
 if(req.method==='POST'){let b;try{b=await req.json();}catch{return json({ok:false},400);}
  for(const id of(Array.isArray(b.ids)?b.ids:[]).filter(x=>FB_ID.test(x)).slice(0,10))await env.DB.prepare("UPDATE feedback SET status='avisado' WHERE id=? AND email=? AND status='concluido'").bind(id,user.email).run();
  return json({ok:true});}
 const{results}=await env.DB.prepare("SELECT id,kind,tool,message FROM feedback WHERE email=? AND status='concluido' ORDER BY created LIMIT 5").bind(user.email).all();return json({ok:true,items:results});
}
