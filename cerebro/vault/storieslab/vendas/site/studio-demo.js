(() => {
 const root=document.querySelector('.demo-editor');if(!root)return;
 const after=root.querySelector('.demo-after'),range=root.querySelector('input'),value=root.querySelector('output'),compare=root.querySelector('.demo-original');let version=0,original=false;
 const paint=()=>{after.style.opacity=original?0:Number(range.value)/100;value.textContent=range.value+'%';range.setAttribute('aria-valuetext',range.value+'%');};
 range.addEventListener('input',()=>{original=false;compare.setAttribute('aria-pressed','false');compare.textContent='Ver original';paint();});
 compare.onclick=()=>{original=!original;compare.setAttribute('aria-pressed',original);compare.textContent=original?'Ver edição':'Ver original';paint();};
 root.querySelectorAll('[data-demo-look]').forEach(button=>button.onclick=async()=>{
  original=false;compare.textContent='Ver original';compare.setAttribute('aria-pressed','false');paint();const token=++version,img=new Image();img.src='/img/studio/'+button.dataset.demoLook+'.webp';
  try{await img.decode();if(token!==version)return;after.src=img.src;root.querySelectorAll('[data-demo-look]').forEach(b=>b.setAttribute('aria-pressed',b===button));root.querySelector('.demo-photo span').textContent=button.textContent;paint();}catch{root.querySelector('.demo-note').textContent='Não deu para carregar este look. Toque para tentar de novo.';}
 });paint();
})();
