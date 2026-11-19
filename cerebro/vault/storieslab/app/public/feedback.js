(() => {
 const read=(k,d)=>{try{return JSON.parse(SLStorage.getItem(k))??d}catch{return d}},write=(k,v)=>{try{SLStorage.setItem(k,JSON.stringify(v))}catch{}};
 const key=()=>`sl_feedback:${ME?.email||''}`,today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
 let hiddenAt=0,booted=false,due=false;
 const dialog=document.createElement('dialog');dialog.className='feedback-panel';dialog.setAttribute('aria-labelledby','feedbackTitle');document.body.append(dialog);
 function show(invited=false){
  if(!ME)return;const id=crypto.randomUUID();
  dialog.innerHTML=`<button class="iconbtn feedback-close" type="button" data-feedback-close aria-label="Fechar feedback">${icon('i-x')}</button><span class="fb-emo" aria-hidden="true">💬</span><h2 id="feedbackTitle">O que podemos <em>melhorar?</em></h2><p class="fb-sub">A gente lê tudo e muda o app com base no que você conta.</p><form id="feedbackForm"><fieldset><legend>Tipo de sugestão</legend><div class="feedback-kinds">${[['melhoria','💡','Melhorar algo'],['novidade','✨','Nova ideia'],['problema','🐞','Um problema']].map(([v,e,l],i)=>`<label><input type="radio" name="kind" value="${v}"${i===0?' checked':''}><span><i>${e}</i>${l}</span></label>`).join('')}</div></fieldset><fieldset class="fb-tools"><legend>Sobre qual parte?</legend><div class="fb-chips">${[['geral','App todo'],['figurinhas','Figurinhas'],['presets','Estúdio de Fotos'],['agenda','Agenda'],['magneticos','Magnéticos'],['animadas','Animadas']].map(([v,l],i)=>`<label><input type="radio" name="tool" value="${v}"${i===0?' checked':''}><span>${l}</span></label>`).join('')}</div></fieldset><label class="feedback-label" for="feedbackText">Sua sugestão</label><textarea id="feedbackText" name="message" rows="4" minlength="10" maxlength="2000" required placeholder="Conta com suas palavras: o que você queria fazer e o que deixaria tudo mais fácil?"></textarea><small class="feedback-count"><span id="feedbackCount">0</span>/2000 caracteres</small><p class="feedback-privacy">A equipe recebe sua mensagem vinculada ao seu perfil. Evite incluir dados sensíveis.</p><button class="btn full" type="submit">Enviar feedback</button><p id="feedbackStatus" role="status" aria-live="polite"></p></form>${invited?'<button class="tutlink feedback-later" data-feedback-close type="button">Agora não</button>':''}`;
  dialog.querySelector('#feedbackText').oninput=e=>dialog.querySelector('#feedbackCount').textContent=e.target.value.length;
  dialog.querySelector('#feedbackForm').onsubmit=async e=>{
   e.preventDefault();const form=e.target,button=form.querySelector('[type=submit]'),status=form.querySelector('#feedbackStatus'),data=new FormData(form);button.disabled=true;button.textContent='Enviando…';status.textContent='';
   try{
    const send=()=>fetch(ME.creator?'/api/creators/feedback':'/api/feedback',{method:'POST',headers:{'content-type':'application/json',...(ME.creator?SLCreator.headers():{})},body:JSON.stringify({id,kind:data.get('kind'),tool:data.get('tool'),message:data.get('message')})});let r=await send();
    if(r.status===401){await login(ME.email,true);r=await send();}
    if(!r.ok)throw Error(r.status===429?'Você já enviou várias sugestões hoje. Tente novamente amanhã.':'Não deu para enviar agora. Sua mensagem continua aqui; tente novamente.');
    const s=read(key(),{});s.until=Date.now()+7*864e5;write(key(),s);due=false;
    dialog.innerHTML=`<span class="feedback-success" aria-hidden="true">✓</span><h2 id="feedbackTitle">Obrigada por contar.</h2><p>Recebemos sua sugestão.</p><button class="btn full" data-feedback-close type="button">Continuar no app</button>`;
    dialog.querySelector('button').focus();
   }catch(err){status.textContent=err.message;button.disabled=false;button.textContent='Tentar enviar novamente';}
  };
  dialog.showModal();
 }
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-feedback-close]'))dialog.close();});
 document.addEventListener('click',e=>{if(e.target.closest('[data-feedback-open]'))show(false);});
 function maybePrompt(){
  if(!due||window.slTour?.()||document.hidden||!ME||!['','#','#perfil'].includes(location.hash)||document.querySelector('dialog[open]'))return;
  const s=read(key(),{});if(s.prompted===today()||s.until>Date.now()){due=false;return;}s.prompted=today();write(key(),s);due=false;show(true);
 }
 function recordOpen(){
  if(!ME)return;let s=read(key(),{});const now=Date.now(),day=today();if(s.day!==day)s={...s,day,n:0,last:0};
  // A reload or quick tab switch is not a new visit.
  if(!s.last||now-s.last>=10*60e3){s.n=(s.n||0)+1;s.last=now;write(key(),s);}
  due=s.n>=4&&s.prompted!==day&&!(s.until>now);setTimeout(maybePrompt,3500);
 }

 // 07/11: a message the team marked as done shows a thank-you once (then the server marks it 'avisado')
 async function thanks(){
  if(!ME||ME.creator)return;let d;
  try{const r=await fetch('/api/feedback/notice');if(!r.ok)return;d=await r.json();}catch{return;}
  if(!d.items?.length)return;
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),m=d.items[0].message.trim(),short=m.length>90?m.slice(0,88)+'…':m;
  const go=()=>{
   if(window.slTour?.()||document.hidden||document.querySelector('dialog[open]'))return setTimeout(go,4000);
   dialog.innerHTML=`<span class="feedback-success" aria-hidden="true">💖</span><h2 id="feedbackTitle">Você ajudou o<br><em>Stories Lab!</em></h2><p>A equipe leu sua sugestão e usou pra melhorar o app. Obrigada por fazer parte!</p><p class="feedback-quote" style="font-style:italic;opacity:.75;border-left:3px solid currentColor;padding-left:12px;margin:12px 0 18px;overflow-wrap:anywhere">“${esc(short)}”</p><button class="btn full" data-feedback-close type="button">Que demais!</button>`;
   dialog.showModal();dialog.querySelector('button').focus();
   fetch('/api/feedback/notice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids:d.items.map(x=>x.id)})}).catch(()=>{});
  };
  setTimeout(go,2500);
 }
 const start=setInterval(()=>{if(S.booted&&ME&&!booted){booted=true;clearInterval(start);recordOpen();thanks();}},500);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(booted&&hiddenAt&&Date.now()-hiddenAt>=10*60e3)recordOpen();});
 addEventListener('hashchange',()=>setTimeout(maybePrompt,700));
 window.StoriesFeedback={open:show};
})();
