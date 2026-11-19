// No shared customer login: creator identity is verified by the backend.
(() => {
 const enabled=new URLSearchParams(location.search).get('creator')==='1';
 const read=()=>{try{return JSON.parse(localStorage.getItem('sl_creator_access')||'null')}catch{return null}};
 let saved=read();
 const prefix=()=>enabled?'creator:'+ (saved?.profile?.id||'guest')+':':'';
 window.SLStorage={getItem:k=>localStorage.getItem(prefix()+k),setItem:(k,v)=>localStorage.setItem(prefix()+k,v),removeItem:k=>localStorage.removeItem(prefix()+k)};
 const api=async(path,body)=>{
  const r=await fetch('/api/creators/'+path,{method:'POST',headers:{'content-type':'application/json',...(saved?.credential?{authorization:'Bearer '+saved.credential}:{})},body:JSON.stringify(body||{})});
  const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error||'Abra seu acesso novamente pelo kit.');return data;
 };
 const context=window.SLCreator={enabled,headers:()=>({authorization:'Bearer '+(saved?.credential||'')}),login:()=>api('app'),exit:()=>{localStorage.removeItem('sl_creator_access');location.href='https://kit-storieslab.vercel.app/#meu-acesso'},ready:Promise.resolve()};
 if(!enabled)return;
 document.documentElement.classList.add('creator-mode');
 document.querySelector('link[rel=manifest]')?.setAttribute('href','creator.webmanifest');
 const match=/^#access=([a-f0-9]{64})$/.exec(location.hash);
 if(match){
  history.replaceState(null,'',location.pathname+'?creator=1');
  context.ready=api('exchange',{code:match[1]}).then(data=>{
   saved={credential:data.credential,profile:data.profile};localStorage.setItem('sl_creator_access',JSON.stringify(saved));
   location.replace(location.pathname+'?creator=1');return new Promise(()=>{});
  }).catch(e=>{context.error=e.message});
 }
 context.gate=()=>{
  document.body.classList.add('out');const gate=document.getElementById('gate');gate.hidden=false;
  gate.replaceChildren();const box=document.createElement('div');box.style.cssText='max-width:360px;margin:80px auto;padding:24px;text-align:center';
  const title=document.createElement('h1');title.textContent='Seu acesso de creator';
  const note=document.createElement('p');note.textContent=context.error||'Entre pelo kit para continuar no app.';
  const link=document.createElement('a');link.className='btn full';link.href='https://kit-storieslab.vercel.app/#meu-acesso';link.textContent='Abrir meu kit';box.append(title,note,link);gate.append(box);
 };
})();
