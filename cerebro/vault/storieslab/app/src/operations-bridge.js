const J=(b,status=200)=>new Response(JSON.stringify(b),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const valid=s=>typeof s==='string'&&/^[a-f0-9-]{36}$/.test(s);
export async function operationBridge(req,env){
 await env.DB.batch([
 env.DB.prepare('CREATE TABLE IF NOT EXISTS operation_bridge(id INTEGER PRIMARY KEY CHECK(id=1),worker TEXT,heartbeat INTEGER)'),
 env.DB.prepare('CREATE TABLE IF NOT EXISTS operation_jobs(id TEXT PRIMARY KEY,title TEXT NOT NULL,body TEXT NOT NULL,created INTEGER NOT NULL,status TEXT NOT NULL,worker TEXT,lease INTEGER,receipt TEXT,error TEXT)'),
 ]);
 const path=new URL(req.url).pathname.split('/').slice(5),now=Date.now(),route=path[0];
 const read=async()=>{try{const text=await req.text();if(text.length>18000)return null;return JSON.parse(text)}catch{return null}};
 if(route==='status'&&req.method==='GET'){
  const bridge=await env.DB.prepare('SELECT heartbeat FROM operation_bridge WHERE id=1').first();
  return J({ok:true,online:!!bridge&&now-bridge.heartbeat<45000,heartbeat:bridge?.heartbeat||null});
 }
 if(route==='jobs'&&req.method==='POST'){
  const b=await read();if(!b||!valid(b.id)||typeof b.text!=='string'||b.text.length<20||b.text.length>14000||typeof b.title!=='string')return J({ok:false,error:'briefing'},400);
  await env.DB.prepare("INSERT OR IGNORE INTO operation_jobs(id,title,body,created,status) VALUES(?,?,?,?,'queued')").bind(b.id,b.title.slice(0,160),b.text,now).run();
  const job=await env.DB.prepare('SELECT id,status,receipt,error FROM operation_jobs WHERE id=?').bind(b.id).first();return J({ok:true,job},202);
 }
 if(route==='jobs'&&req.method==='GET'&&valid(path[1])){
  const job=await env.DB.prepare('SELECT id,title,status,created,receipt,error FROM operation_jobs WHERE id=?').bind(path[1]).first();return job?J({ok:true,job}):J({ok:false},404);
 }
 if(route==='poll'&&req.method==='POST'){
  const b=await read();if(!b||!valid(b.worker))return J({ok:false},400);
  await env.DB.prepare('INSERT INTO operation_bridge(id,worker,heartbeat) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET worker=excluded.worker,heartbeat=excluded.heartbeat').bind(b.worker,now).run();
  const found=await env.DB.prepare("SELECT id FROM operation_jobs WHERE status='queued' OR (status='claimed' AND lease<?) ORDER BY created LIMIT 1").bind(now).first();
  if(!found)return J({ok:true,job:null});
  const changed=await env.DB.prepare("UPDATE operation_jobs SET status='claimed',worker=?,lease=? WHERE id=? AND (status='queued' OR (status='claimed' AND lease<?))").bind(b.worker,now+120000,found.id,now).run();
  if(!changed.meta.changes)return J({ok:true,job:null});
  const job=await env.DB.prepare('SELECT id,title,body FROM operation_jobs WHERE id=?').bind(found.id).first();return J({ok:true,job});
 }
 if(route==='ack'&&req.method==='POST'){
  const b=await read();if(!b||!valid(b.id)||!valid(b.worker)||!['sent','error','local_queue','queued_codex'].includes(b.status))return J({ok:false},400);
  const r=await env.DB.prepare("UPDATE operation_jobs SET status=?,receipt=?,error=?,lease=NULL WHERE id=? AND worker=? AND status IN ('claimed','local_queue')").bind(b.status,String(b.receipt||'').slice(0,120),String(b.error||'').slice(0,500),b.id,b.worker).run();
  return J({ok:true,changed:!!r.meta.changes});
 }
 return J({ok:false},404);
}
