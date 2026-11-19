(() => {
 const nav=document.querySelector('#tabbar'),track=nav?.querySelector('.in');if(!track)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const indicator=document.createElement('i');indicator.className='sl-nav-indicator';indicator.setAttribute('aria-hidden','true');track.prepend(indicator);
 nav.querySelectorAll('a').forEach(a=>{const label=a.querySelector('span')?.textContent?.trim();if(label){a.setAttribute('aria-label',label);a.title=label;}});
 let previous='',queued=false;
 function place(){queued=false;const current=nav.querySelector('[aria-current=page]');if(!current)return;const x=current.offsetLeft+(current.offsetWidth-46)/2;track.style.setProperty('--sl-nav-x',x+'px');nav.classList.add('sl-nav-ready');
  if(previous&&previous!==current.dataset.tab&&!reduced.matches){current.querySelector('svg')?.animate([{transform:'translateY(3px) scale(.88)'},{transform:'translateY(-1px) scale(1.05)'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.22,.8,.2,1)'});}previous=current.dataset.tab;
 }
 const queue=()=>{if(!queued){queued=true;requestAnimationFrame(place);}};
 new MutationObserver(queue).observe(nav,{attributes:true,subtree:true,attributeFilter:['aria-current']});new ResizeObserver(queue).observe(track);queue();
 document.addEventListener('click',e=>{if(reduced.matches)return;const target=e.target.closest('button[aria-pressed],.chip,.seg a,.photo-mode button');if(!target||target.disabled||target.closest('#tabbar'))return;const graphic=target.querySelector('svg');if(graphic)graphic.animate([{transform:'scale(.87)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});},{passive:true});
})();
