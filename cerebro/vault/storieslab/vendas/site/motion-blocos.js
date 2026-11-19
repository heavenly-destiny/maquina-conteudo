(() => {
  const data=window.SL_EXAMPLES,reduced=matchMedia('(prefers-reduced-motion:reduce)');if(!data)return;
  const states=new Map();
  let heroKey='praia',heroPhase=0,heroElapsed=0,heroVisible=false;
  const hero=document.querySelector('.cv-after'),heroKeys=['praia','treino','bomdia'];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.target===hero)heroVisible=entry.isIntersecting;
    const state=states.get(entry.target);if(state)state.visible=entry.isIntersecting;
  }),{threshold:.2});
  const sequence=key=>[data.sticker(key,1),data.animated(key),data.sticker(key,2),data.sticker(key,3),data.sticker(key,4)];
  function applySticker(el,config,index,key,heroMode=false){
    const img=el.querySelector('.cv-sticker,.cv-hero-sticker');if(!img)return;
    let variant=heroMode?(index%2?data.animated(key):data.sticker(key,1)):sequence(key)[index%5];
    if(reduced.matches&&variant.animated)variant=data.sticker(key,2);
    let zone=config.zones[index%config.zones.length],ink=config.ink;
    if(key==='praia'&&variant.animated){zone=[50,4,44,25,0];ink='dark';}
    el.dataset.ink=ink;el.dataset.animated=String(variant.animated);
    img.style.left=zone[0]+'%';img.style.top=zone[1]+'%';img.style.width=zone[2]+'%';img.style.height=zone[3]+'%';
    img.style.setProperty('--st-rotation',zone[4]+'deg');
    img.src=variant.src;img.alt=`Figurinha ${variant.animated?'animada ':''}de ${data.labels[key]}`;
    el.classList.add('cv-sticker-visible');
  }
  function swapSticker(el,config,index,key,heroMode=false){
    clearTimeout(el._stickerTimer);el.classList.remove('cv-sticker-visible');
    if(reduced.matches){applySticker(el,config,index,key,heroMode);return;}
    el._stickerTimer=setTimeout(()=>{if(el.isConnected)applySticker(el,config,index,key,heroMode);},180);
  }
  function register(el,key,config,index=0){
    const state={el,key,config,index,visible:false,elapsed:-index*450};
    states.set(el,state);applySticker(el,config,index,key);observer.observe(el);
  }
  function setHero(key){
    heroKey=key;heroPhase=0;heroElapsed=0;
    document.querySelectorAll('[data-hero-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.heroScene===key)));
    document.querySelectorAll('[data-hero-photo]').forEach(img=>img.src=data.hero[key].photo);
    document.querySelector('.cv-pair').dataset.scene=key;swapSticker(hero,data.hero[key],0,key,true);
  }
  
  if(hero)Object.values(data.hero).forEach(c=>{const img=new Image();img.src=c.photo;});
  // Final scenes pull ~1 MB (photos plus a 560 KB animated sticker), so they load only when the section is near.
  const finals=document.querySelectorAll('.cv-final-scene');
  if(finals.length){
    const startFinals=()=>finals.forEach((el,i)=>{
      const cfg=data.final[i%data.final.length];el.querySelector('.cv-photo').src=cfg.photo;register(el,cfg.key,cfg,i);
    });
    const near=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){near.disconnect();startFinals();}},{rootMargin:'800px 0px'});
    near.observe(finals[0]);
  }
  let last=performance.now();
  setInterval(()=>{
    const now=performance.now(),delta=Math.min(now-last,350);last=now;if(document.hidden||reduced.matches)return;
    if(hero&&heroVisible&&!hero.matches(':hover')){
      heroElapsed+=delta;
      if(heroElapsed>=2400){heroElapsed=0;heroPhase++;
        if(heroPhase>=2)setHero(heroKeys[(heroKeys.indexOf(heroKey)+1)%heroKeys.length]);
        else swapSticker(hero,data.hero[heroKey],heroPhase,heroKey,true);
      }
    }
    for(const state of states.values()){
      if(!state.visible||state.el.matches(':hover'))continue;state.elapsed+=delta;
      if(state.elapsed>=2900){state.elapsed=0;state.index++;swapSticker(state.el,state.config,state.index,state.key);}
    }
  },200);
  reduced.addEventListener('change',()=>{if(reduced.matches){setHero(heroKey);states.forEach(s=>applySticker(s.el,s.config,s.index,s.key));}});
  document.getElementById('cvTry')?.addEventListener('click',()=>{
    if(!document.querySelector('#xpPhone .xp-st'))document.querySelector('#xpTray button')?.click();
    document.getElementById('xpPhone').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
  });
  // Sticky bar shows the Premium price and goes straight to the checkout (owner 18/11), so its link is no longer rewritten here.
  // Video loads and playback are limited to its visible section.
  document.querySelectorAll('video[data-demo-video]').forEach(v=>{
    let visible=false;
    const sync=()=>{if(visible&&!document.hidden&&!reduced.matches){if(!v.src)v.src=v.dataset.demoVideo;v.play().catch(()=>{});}else v.pause();};
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();},{threshold:.15}).observe(v);
    document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  });
})();
