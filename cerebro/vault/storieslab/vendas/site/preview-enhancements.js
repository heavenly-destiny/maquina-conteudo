(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const states=[];
 document.querySelectorAll('[data-preview-video]').forEach(video=>{
  const id=video.dataset.previewVideo,button=document.querySelector(`[data-video-toggle="${id}"]`);
  const state={video,button,visible:false,manualPause:reduced.matches};states.push(state);
  const sync=()=>{button.textContent=video.paused?'Reproduzir '+(id==='hero'?'demonstração':'vídeo'):'Pausar '+(id==='hero'?'demonstração':'vídeo');button.setAttribute('aria-pressed',String(!video.paused));};
  video.addEventListener('play',sync);video.addEventListener('pause',sync);
  button.addEventListener('click',()=>{state.manualPause=!video.paused;if(video.paused)video.play().catch(sync);else video.pause();});
  state.update=()=>{if(state.visible&&!document.hidden&&!state.manualPause)video.play().catch(sync);else video.pause();};
  new IntersectionObserver(([e])=>{state.visible=e.isIntersecting;state.update();},{threshold:.25}).observe(video);
 });
 document.addEventListener('visibilitychange',()=>states.forEach(s=>s.update()));
 reduced.addEventListener('change',e=>{if(e.matches)states.forEach(s=>{s.manualPause=true;s.update();});});
 document.querySelector('[data-video-replay]')?.addEventListener('click',()=>{const s=states.find(s=>s.video.dataset.previewVideo==='tutorial');s.video.currentTime=0;s.manualPause=false;s.video.play().catch(()=>{});});
})();
