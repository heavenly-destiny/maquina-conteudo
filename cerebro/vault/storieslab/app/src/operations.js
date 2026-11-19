import { operationBridge } from './operations-bridge.js';
// Called only after adminOk. Shared operation library; optimistic revisions prevent lost edits.
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export async function operations(req,env){
 const path=new URL(req.url).pathname,assetRoot='/api/admin/operations/assets';
 if(path.startsWith('/api/admin/operations/bridge/'))return operationBridge(req,env);
 if(path===assetRoot||path.startsWith(assetRoot+'/')){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS operation_assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,mime TEXT NOT NULL,bytes BLOB NOT NULL,created TEXT NOT NULL)').run();
  if(path===assetRoot&&req.method==='GET'){
   const r=await env.DB.prepare('SELECT id,name,mime,created FROM operation_assets ORDER BY created DESC LIMIT 200').all();return reply({ok:true,assets:r.results});
  }
  if(path===assetRoot&&req.method==='POST'){
   if(Number(req.headers.get('content-length'))>1600000)return reply({ok:false,error:'size'},413);
   const bytes=new Uint8Array(await req.arrayBuffer());if(bytes.length>1600000||bytes.length<12)return reply({ok:false,error:'size'},413);
   const head=new TextDecoder().decode(bytes.slice(0,12));
   const mime=bytes[0]===137&&head.slice(1,4)==='PNG'?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':head.startsWith('RIFF')&&head.slice(8)==='WEBP'?'image/webp':null;
   if(!mime)return reply({ok:false,error:'image',message:'Use PNG, JPEG ou WebP.'},400);
   const id=crypto.randomUUID(),name=(new URL(req.url).searchParams.get('name')||'Material da equipe').trim().slice(0,120),created=new Date().toISOString();
   await env.DB.prepare('INSERT INTO operation_assets(id,name,mime,bytes,created) VALUES(?,?,?,?,?)').bind(id,name,mime,bytes.buffer,created).run();return reply({ok:true,asset:{id,name,mime,created}},201);
  }
  const id=path.slice(assetRoot.length+1);if(req.method!=='GET'||!/^[a-f0-9-]{36}$/.test(id))return reply({ok:false},404);
  const a=await env.DB.prepare('SELECT mime,bytes FROM operation_assets WHERE id=?').bind(id).first();if(!a)return reply({ok:false},404);
  return new Response(new Uint8Array(a.bytes),{headers:{'content-type':a.mime,'cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
 await env.DB.prepare('CREATE TABLE IF NOT EXISTS operation_library (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, body TEXT NOT NULL, updated TEXT NOT NULL)').run();
 if(req.method==='GET'){
  const r=await env.DB.prepare('SELECT revision,body,updated FROM operation_library WHERE id=1').first();
  return reply({ok:true,revision:r?.revision||0,data:r?JSON.parse(r.body):{},updated:r?.updated||null});
 }
 if(req.method!=='PUT')return reply({ok:false,error:'method'},405);
 const raw=await req.text();if(raw.length>400000)return reply({ok:false,error:'size'},413);
 let b;try{b=JSON.parse(raw)}catch{return reply({ok:false,error:'json'},400)}
 if(!Number.isInteger(b.revision)||b.revision<0||!b.data||typeof b.data!=='object'||Array.isArray(b.data))return reply({ok:false,error:'data'},400);
 const body=JSON.stringify(b.data),now=new Date().toISOString();
 const r=b.revision===0
  ?await env.DB.prepare('INSERT OR IGNORE INTO operation_library(id,revision,body,updated) VALUES(1,1,?,?)').bind(body,now).run()
  :await env.DB.prepare('UPDATE operation_library SET revision=revision+1,body=?,updated=? WHERE id=1 AND revision=?').bind(body,now,b.revision).run();
 if(!r.meta?.changes)return reply({ok:false,error:'conflict',message:'A central mudou em outro aparelho. Recarregue antes de salvar.'},409);
 return reply({ok:true,revision:b.revision+1,updated:now});
}
