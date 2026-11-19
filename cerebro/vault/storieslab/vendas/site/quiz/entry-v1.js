(()=>{
 const KEY='sl_quiz_entry_20261103',API='/api/quiz-entry';
 let visitor='',enrolled=false,ready=false,forced=false;
 const queued=new Set(),sent=new Set();
 const render=variant=>{
  const hero=document.querySelector('#s-intro');
  document.documentElement.dataset.quizEntry=variant;
  if(variant==='b'){
   hero.classList.add('entry-treatment');
   hero.querySelector('.kicker').textContent='EXPERIMENTE NA SUA FOTO';
   hero.querySelector('h1').innerHTML='Olha o que uma figurinha<br class="entry-break"> faz no seu <em>Story.</em>';
   const sub=document.createElement('p');sub.className='entry-sub';sub.textContent='Responda duas perguntas rápidas e experimente figurinhas na sua própria foto.';
   hero.querySelector('h1').after(sub);
   const comparison=document.createElement('div');comparison.className='entry-comparison';
   comparison.innerHTML='<figure><img src="/quiz/entry-summer.jpg" width="720" height="911" alt="Foto na piscina sem figurinha"><figcaption>Antes</figcaption></figure><figure><img src="/quiz/entry-summer.jpg" width="720" height="911" alt="A mesma foto na piscina"><img class="entry-sticker" src="/quiz/entry-piscina.webp" alt="Figurinha Dia de piscina do Stories Lab"><figcaption>Com Stories Lab</figcaption></figure>';
   hero.querySelector('.fan').replaceWith(comparison);
   hero.querySelector('.perks').hidden=true;
   hero.querySelector('[data-start]').textContent='Quero montar meu Story →';
   hero.querySelector('.micro').textContent='Experimente grátis · sem cadastro';
  }
  document.documentElement.classList.remove('entry-loading');
 };
 const flush=()=>{
  if(!ready||!enrolled||forced)return;
  for(const event of queued){
   if(sent.has(event))continue;sent.add(event);
   fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'event',visitor,event}),keepalive:true}).then(r=>{if(!r.ok)sent.delete(event)}).catch(()=>sent.delete(event));
  }
 };
 window.QuizEntry={track(step){const event=step==='start'?'start':step==='result'?'result':step.startsWith('click_')?'offer':null;if(event){queued.add(event);flush();}}};
 const init=async()=>{
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  const preview=new URLSearchParams(location.search).get('entry_preview');
  if(local&&['a','b'].includes(preview)){forced=true;ready=true;render(preview);return;}
  try{visitor=localStorage.getItem(KEY)||'';}catch{}
  if(!visitor)visitor=(document.cookie.match(/(?:^|; )sl_qe=([^;]*)/)||[])[1]||'';
  if(!/^[a-f0-9-]{36}$/i.test(visitor))visitor=crypto.randomUUID();
  try{localStorage.setItem(KEY,visitor);}catch{}
  document.cookie='sl_qe='+visitor+'; Max-Age=2592000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1800);
  try{
   const response=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'assign',visitor}),signal:controller.signal});
   if(!response.ok)throw new Error('assignment');
   const assignment=await response.json();enrolled=assignment.enrolled===true;
   render(assignment.variant==='b'?'b':'a');
  }catch{render('a');}
  finally{clearTimeout(timer);ready=true;flush();}
 };
 if(document.hidden){document.addEventListener('visibilitychange',()=>{if(!document.hidden)init();},{once:true});document.documentElement.classList.remove('entry-loading');}
 else init();
 addEventListener('online',flush);
})();
