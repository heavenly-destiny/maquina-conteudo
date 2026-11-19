import {sendCreatorPush} from './creator-push.js';
// Owner-enqueued demonstrations only. No sale, entitlement or commission writes.
export async function runCreatorPushDemo(env) {
 const job=await env.DB.prepare("UPDATE creator_push_demo SET state='sending' WHERE id=(SELECT id FROM creator_push_demo WHERE state='pending' ORDER BY id LIMIT 1) RETURNING *").first();
 if(!job)return;
 const sub=await env.DB.prepare('SELECT endpoint FROM creator_push WHERE creator=? ORDER BY created DESC LIMIT 1').bind(job.creator).first();
 let accepted=0,failed=0;
 for(let i=0;sub&&i<Math.min(100,job.count);i++){
  try{const r=await sendCreatorPush(env,sub.endpoint,crypto.randomUUID().replaceAll('-',''));if(r.ok)accepted++;else failed++;}catch{failed++;}
  await env.DB.prepare('UPDATE creator_push_demo SET accepted=?,failed=? WHERE id=?').bind(accepted,failed,job.id).run();
  if(i+1<job.count)await new Promise(resolve=>setTimeout(resolve,500));
 }
 await env.DB.prepare("UPDATE creator_push_demo SET state='done',accepted=?,failed=? WHERE id=?").bind(accepted,failed,job.id).run();
}
