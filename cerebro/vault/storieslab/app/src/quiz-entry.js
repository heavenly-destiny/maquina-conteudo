// Anonymous, bounded entry experiment. No checkout variant, price or entitlement changes.
export const EXPERIMENT='quiz-entry-20261103';
export const START_WINDOW=600; // Equal ten-minute opportunity for every enrolled visitor.
const validId=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const eligibleOrigin=(req,env)=>{
 const origin=req.headers.get('origin');
 return ['https://storieslab.shop','https://www.storieslab.shop','https://storieslab.app','https://www.storieslab.app'].includes(origin)||   // .app serves the same site (11/11 fix)
  (env.QUIZ_LOCAL_TEST==='1'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||''));
};

export async function finalizeQuizEntry(env,now=Math.floor(Date.now()/1000)){
 // One SQL statement freezes the winner; late events can never change the decision.
 await env.DB.prepare(`UPDATE qe_tests SET status='complete', closed_at=?2,
 winner=CASE WHEN
 (SELECT COUNT(*) FROM qe_visitors v JOIN qe_slots s ON s.experiment=v.experiment AND s.slot=v.slot WHERE v.experiment=?1 AND s.variant='b' AND v.started_at IS NOT NULL AND v.started_at<=v.created_at+600) >
 (SELECT COUNT(*) FROM qe_visitors v JOIN qe_slots s ON s.experiment=v.experiment AND s.slot=v.slot WHERE v.experiment=?1 AND s.variant='a' AND v.started_at IS NOT NULL AND v.started_at<=v.created_at+600)
 THEN 'b' ELSE 'a' END
 WHERE id=?1 AND status='running' AND (SELECT COUNT(*) FROM qe_visitors WHERE experiment=?1)=100
 AND ?2>=(SELECT MAX(created_at)+600 FROM qe_visitors WHERE experiment=?1)`)
 .bind(EXPERIMENT,now).run();
}

export async function assignQuizEntry(env,visitor,now=Math.floor(Date.now()/1000)){
 if(!validId(visitor))return {variant:'a',enrolled:false,status:'invalid'};
 await finalizeQuizEntry(env,now);
 // Allocation is atomic and capacity is enforced by exactly 100 pre-shuffled slots.
 await env.DB.prepare(`INSERT OR IGNORE INTO qe_visitors(experiment,visitor,slot,created_at)
 SELECT ?1,?2,s.slot,?3 FROM qe_slots s JOIN qe_tests t ON t.id=s.experiment
 LEFT JOIN qe_visitors used ON used.experiment=s.experiment AND used.slot=s.slot
 WHERE s.experiment=?1 AND t.status='running' AND used.visitor IS NULL
 AND NOT EXISTS(SELECT 1 FROM qe_visitors WHERE experiment=?1 AND visitor=?2)
 ORDER BY s.slot LIMIT 1`).bind(EXPERIMENT,visitor,now).run();
 const test=await env.DB.prepare('SELECT status,winner FROM qe_tests WHERE id=?1').bind(EXPERIMENT).first();
 if(!test||test.status==='paused')return {variant:'a',enrolled:false,status:'paused'};
 if(test.status==='complete')return {variant:test.winner,enrolled:false,status:'complete'};
 const row=await env.DB.prepare(`SELECT s.variant FROM qe_visitors v JOIN qe_slots s ON s.experiment=v.experiment AND s.slot=v.slot WHERE v.experiment=?1 AND v.visitor=?2`).bind(EXPERIMENT,visitor).first();
 return {variant:row?.variant||'a',enrolled:!!row,status:row?'running':'settling'};
}

export async function recordQuizEntry(env,visitor,event,now=Math.floor(Date.now()/1000)){
 if(!validId(visitor))return false;
 const field={start:'started_at',result:'result_at',offer:'offer_at'}[event];
 if(!field)return false;
 const window=event==='start'?START_WINDOW:86400;
 await env.DB.prepare(`UPDATE qe_visitors SET ${field}=?3 WHERE experiment=?1 AND visitor=?2
 AND ${field} IS NULL AND ?3>=created_at AND ?3<=created_at+${window}
 ${event==='start'?"AND EXISTS(SELECT 1 FROM qe_tests WHERE id=?1 AND status='running')":''}`)
 .bind(EXPERIMENT,visitor,now).run();
 await finalizeQuizEntry(env,now);
 return true;
}

export async function quizEntryStats(env,now=Math.floor(Date.now()/1000)){
 await finalizeQuizEntry(env,now);
 const test=await env.DB.prepare('SELECT id,status,winner,started_at,closed_at FROM qe_tests WHERE id=?1').bind(EXPERIMENT).first();
 const {results}=await env.DB.prepare(`SELECT s.variant,COUNT(v.visitor) visitors,
 COALESCE(SUM(v.started_at IS NOT NULL AND v.started_at<=v.created_at+600),0) starts,
 COALESCE(SUM(v.result_at IS NOT NULL),0) results,COALESCE(SUM(v.offer_at IS NOT NULL),0) offers,
 MAX(v.created_at)+600 last_window_end
 FROM qe_slots s LEFT JOIN qe_visitors v ON v.experiment=s.experiment AND v.slot=s.slot
 WHERE s.experiment=?1 GROUP BY s.variant`).bind(EXPERIMENT).all();
 const total=results.reduce((n,r)=>n+r.visitors,0);
 const end=Math.max(0,...results.map(r=>r.last_window_end||0));
 return {...test,phase:test?.status==='running'&&total===100?'settling':test?.status,total,limit:100,windowSeconds:600,settlesAt:total===100?end:null,rows:results};
}

export async function quizEntryRequest(req,env){
 if(!eligibleOrigin(req,env))return reply({ok:false},403);
 if(/bot|crawler|spider|headless|facebookexternalhit|preview|lighthouse/i.test(req.headers.get('user-agent')||''))return reply({variant:'a',enrolled:false,status:'excluded'});
 if(+req.headers.get('content-length')>1024)return reply({ok:false},413);
 let body;try{const raw=await req.text();if(raw.length>1024)return reply({ok:false},413);body=JSON.parse(raw);}catch{return reply({ok:false},400);}
 if(!validId(body.visitor))return reply({ok:false},400);
 if(body.action==='assign')return reply(await assignQuizEntry(env,body.visitor));
 if(body.action==='event')return reply({ok:await recordQuizEntry(env,body.visitor,body.event)});
 return reply({ok:false},400);
}
