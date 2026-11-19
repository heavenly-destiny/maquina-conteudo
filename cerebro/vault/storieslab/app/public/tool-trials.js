// Allowances are stored on the server, separately from purchased access.
(() => {
 const pending=new Map();
 const state=k=>ME?.trials?.tools?.[k];
 const enabled=k=>!!state(k);
 const update=d=>{if(d.trials){ME.trials=d.trials;document.querySelectorAll('[data-trial-balance]').forEach(e=>{const k=e.dataset.trialBalance,s=state(k);if(s)e.textContent=s.owned?'Acesso liberado':`${s.remaining} ${s.remaining===1?'uso disponível':'usos disponíveis'} hoje`;});}};
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const isToday=()=>!ME?.trials||ME.trials.day===today();
 async function request(tool,action,item,retry=true){
  let r=await fetch('/api/tools',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tool,action,item}),keepalive:action==='release'});
  if(r.status===401&&retry){const me=await login(ME.email,true);if(me){ME=me;return request(tool,action,item,false);}}
  const d=await r.json();update(d);if(!r.ok&&r.status!==409)throw Error('Não foi possível conferir seu acesso. Tente novamente.');return d;
 }
 const offerDialog=document.createElement('dialog');offerDialog.className='feedback-panel trial-offer';document.body.append(offerDialog);
 offerDialog.addEventListener('click',e=>{if(e.target===offerDialog||e.target.closest('[data-trial-close]'))offerDialog.close();});
 const FIG={title:'Figurinhas sem limite',sub:'Você usou os 100 downloads de hoje. Copiar continua ilimitado. Libere downloads sem limite, todos os dias, com pagamento único. Amanhã os 100 voltam de graça.',buy:'https://go.perfectpay.com.br/PPU38CQHH4N',cta:'Liberar ilimitado por R$ 49,90'};
 function offer(k){const fig=k==='figurinhas',o=fig?FIG:OFFERS.find(o=>o.feature===k);if(!o)return;offerDialog.setAttribute('aria-labelledby','trialOfferTitle');offerDialog.innerHTML=`<button class="iconbtn feedback-close" data-trial-close type="button" aria-label="Fechar oferta">${icon('i-x')}</button><span class="kick">Continue no seu ritmo</span><h2 id="trialOfferTitle">${esc(o.title)}</h2>${window.StoriesProducts.art(k)}<p>${fig?esc(o.sub):state(k)?.remaining===0?'Você usou sua cota gratuita de hoje. Libere esta ferramenta para criar sem limite diário.':esc(o.sub)}</p><a class="btn full" href="${esc(o.buy)}" target="_blank" rel="noopener">${esc(o.cta||'Liberar acesso ilimitado')}</a><small class="trial-offer-detail">${fig?'Downloads ilimitados das figurinhas do app.':'Acesso ilimitado a esta ferramenta. '+esc(o.sub)}</small><button class="tutlink feedback-later" type="button" data-trial-close>Continuar no gratuito</button><p class="trial-rule">${fig?'Copiar é ilimitado. Grátis: 100 downloads por dia; baixar a mesma figurinha de novo no dia não gasta outro. Renova à meia-noite de Brasília.':'Grátis: 3 usos por dia nos dois primeiros dias a partir do primeiro uso; depois, 2 por dia. Renova à meia-noite de Brasília. Sua edição permanece aqui.'}</p>`;offerDialog.showModal();}
 const deferredOffers=new Map();
 function flushOffers(){
  if(document.hidden||window.PhotoStudio?.isActive()||document.querySelector('dialog[open]')||window.slTour?.())return;
  for(const [key,entry] of deferredOffers){
   deferredOffers.delete(key);
   if(entry.email!==ME?.email||entry.day!==ME?.trials?.day||has(entry.tool)||state(entry.tool)?.remaining!==0)continue;
   try{if(SLStorage.getItem(key))continue;}catch{}
   offer(entry.tool);
   if(offerDialog.open){try{SLStorage.setItem(key,'1');}catch{};break;}
  }
 }
 function exhausted(k){if(has(k)||state(k)?.remaining!==0)return;const key=`sl_trial_offer:${ME.email}:${k}:${ME.trials.day}`;try{if(SLStorage.getItem(key))return;}catch{};deferredOffers.set(key,{tool:k,email:ME.email,day:ME.trials.day});setTimeout(flushOffers,800);}
 addEventListener('hashchange',()=>setTimeout(flushOffers,600));
 document.addEventListener('visibilitychange',()=>setTimeout(flushOffers,600));
 document.addEventListener('close',()=>setTimeout(flushOffers,600),true);
 async function reserve(tool,item){if(has(tool)||!enabled(tool))return {ok:true,owned:true};const r=await request(tool,'reserve',item);if(r.ok&&!r.owned&&r.state!=='used')pending.set(tool+':'+item,{tool,item});return r;}
 async function commit(tool,item){if(has(tool)||!enabled(tool))return {ok:true};let error;for(let i=0;i<3;i++){try{const r=await request(tool,'commit',item);if(r.ok){pending.delete(tool+':'+item);exhausted(tool);}return r;}catch(e){error=e;}}throw error;}
 function release(tool,item){if(!item||!pending.has(tool+':'+item))return;pending.delete(tool+':'+item);request(tool,'release',item).catch(()=>{});}
 const badge=k=>!has(k)&&enabled(k)?`<span class="trial-badge" data-trial-balance="${k}">${state(k).remaining} ${state(k).remaining===1?'uso disponível':'usos disponíveis'} hoje</span>`:'';
 function readerGate(container,tool,item,title,back){
  if(has(tool)||!enabled(tool))return false;
  if(!isToday()){container.innerHTML='<p class="trial-reader" role="status">Atualizando seus usos de hoje…</p>';request(tool,'status').then(()=>window.matRoute(location.hash)).catch(()=>{container.innerHTML='<p class="trial-reader">Confira sua conexão e abra o material novamente.</p>';});return true;}
  if(state(tool).unlocked.includes(item))return false;
  const left=state(tool).remaining;
  container.innerHTML=`<div class="vh"><a class="iconbtn" href="${back}" aria-label="Voltar para Materiais">${icon('i-back')}</a><div><h1>${esc(title)}</h1><small>Seu conteúdo, todos os dias</small></div></div><section class="trial-reader"><h2>${left?'Escolha o próximo conteúdo.':'Continue criando.'}</h2><p>${left?`Você tem <b>${left} de ${state(tool).limit} conteúdos gratuitos hoje</b> nesta ferramenta. Desbloquear este conteúdo usa um acesso. Reabrir o mesmo conteúdo no dia é grátis.`:'Sua cota de hoje terminou. Os conteúdos que abriu hoje continuam disponíveis; os usos renovam à meia-noite de Brasília.'}</p><button class="btn full" type="button" id="trialUnlock">${left?'Desbloquear este conteúdo':'Ver oferta de acesso ilimitado'}</button><small>Grátis: 3 usos por dia nos dois primeiros dias; depois, 2 por dia. O acesso ilimitado é comprado à parte.</small><p id="trialReaderStatus" role="status"></p><a class="tutlink" href="#materiais">Voltar aos materiais</a></section>`;
  container.querySelector('#trialUnlock').onclick=async e=>{
   if(!left)return offer(tool);e.target.disabled=true;
   try{const r=await request(tool,'unlock',item);if(r.ok){window.matRoute(location.hash);exhausted(tool);}else if(r.error==='busy'){container.querySelector('#trialReaderStatus').textContent='Outro uso está em andamento. Aguarde e tente novamente.';e.target.disabled=false;}else{readerGate(container,tool,item,title,back);offer(tool);}}
   catch(err){container.querySelector('#trialReaderStatus').textContent=err.message;e.target.disabled=false;}
  };return true;
 }
 addEventListener('pagehide',()=>{for(const {tool,item}of pending.values())release(tool,item);});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-trial-offer]');if(b){e.preventDefault();offer(b.dataset.trialOffer);}});
 window.ToolTrial={enabled,state,badge,reserve,commit,release,offer,readerGate,update,isToday};
})();
