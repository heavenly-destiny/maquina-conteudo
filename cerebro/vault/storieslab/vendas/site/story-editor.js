// Adapted from Claude's existing quiz/template.html story simulator. Local photo only.
(() => {
 const root=document.getElementById('storyEditor');if(!root)return;
 const $=id=>document.getElementById(id),phone=$('storyPhone'),photo=$('storyPhoto'),sticker=$('storySticker'),image=$('storyStickerImage'),paste=$('storyPaste'),size=$('storySize'),status=$('storyStatus');
 const choices=[['/img/try-cafe.png','/img/ai-cafe-sem.webp'],['/img/try-praia.png','/img/ai-praia-sem.webp'],['/img/try-fds.png','/img/ai-carro-sem.webp']];
 let selected=0,x=50,y=50,width=44,placed=false,ownURL=null,photoVersion=0,drag=null,busy=false;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const load=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url;});
 function position(){const h=width*(image.naturalHeight||1)/(image.naturalWidth||1)*9/16;x=clamp(x,width/2,100-width/2);y=clamp(y,h/2,100-h/2);sticker.style.left=x+'%';sticker.style.top=y+'%';sticker.style.width=width+'%';size.value=width;$('storySizeValue').textContent=width+'%';}
 function active(){paste.hidden=placed;sticker.hidden=!placed;for(const id of ['storySize','storySmaller','storyLarger','storySave'])$(id).disabled=!placed||busy;$('storyHint').textContent=placed?'Arraste a figurinha. Use o controle para mudar o tamanho.':'Escolha uma figurinha e toque em Colar na foto.';}
 image.addEventListener('load',position);
 root.querySelectorAll('[data-story-pick]').forEach(button=>button.addEventListener('click',()=>{
  selected=Number(button.dataset.storyPick);image.src=choices[selected][0];if(!ownURL){photo.src=choices[selected][1];photo.alt='Foto de exemplo';}
  root.querySelectorAll('[data-story-pick]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  status.textContent=placed?'Figurinha trocada. Ajuste como quiser.':'Agora toque em Colar figurinha na foto.';
 }));
 paste.addEventListener('click',()=>{image.src=choices[selected][0];placed=true;active();position();status.textContent='Figurinha colada! Arraste e ajuste o tamanho.';});
 function resize(value){width=clamp(Math.round(value),18,82);position();}
 size.addEventListener('input',()=>resize(Number(size.value)));$('storySmaller').onclick=()=>resize(width-5);$('storyLarger').onclick=()=>resize(width+5);
 sticker.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const r=phone.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left-x/100*r.width,dy:e.clientY-r.top-y/100*r.height};sticker.setPointerCapture(e.pointerId);});
 sticker.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const r=phone.getBoundingClientRect();x=(e.clientX-r.left-drag.dx)/r.width*100;y=(e.clientY-r.top-drag.dy)/r.height*100;position();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])sticker.addEventListener(event,()=>drag=null);
 sticker.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const n=e.shiftKey?5:1;if(e.key==='ArrowLeft')x-=n;if(e.key==='ArrowRight')x+=n;if(e.key==='ArrowUp')y-=n;if(e.key==='ArrowDown')y+=n;position();});
 $('storyUpload').onclick=()=>$('storyFile').click();
 $('storyFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;const version=++photoVersion;if(f.size>25*1024*1024){status.textContent='Escolha uma foto de até 25 MB.';e.target.value='';return;}const url=URL.createObjectURL(f);try{await load(url);if(version!==photoVersion){URL.revokeObjectURL(url);return;}if(ownURL)URL.revokeObjectURL(ownURL);ownURL=url;photo.src=url;photo.alt='Sua foto, processada apenas neste navegador';status.textContent='Sua foto está pronta. Cole ou ajuste a figurinha.';}catch{URL.revokeObjectURL(url);status.textContent='Não consegui abrir essa foto. Tente JPG, PNG ou WebP.';}e.target.value='';});
 $('storyReset').onclick=()=>{photoVersion++;if(ownURL)URL.revokeObjectURL(ownURL);ownURL=null;photo.src=choices[selected][1];photo.alt='Foto de exemplo';placed=false;x=y=50;width=44;position();active();status.textContent='Toque em Colar figurinha para começar de novo.';};
 $('storySave').onclick=async()=>{if(!placed||busy)return;busy=true;active();status.textContent='Preparando seu Story…';
  const snapshot={photo:photo.src,sticker:image.src,x,y,width};
  try{const [bg,im]=await Promise.all([load(snapshot.photo),load(snapshot.sticker)]),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const g=canvas.getContext('2d');g.fillStyle='#fff7f5';g.fillRect(0,0,1080,1920);const scale=Math.min(1080/bg.width,1920/bg.height);g.drawImage(bg,(1080-bg.width*scale)/2,(1920-bg.height*scale)/2,bg.width*scale,bg.height*scale);const w=snapshot.width/100*1080,h=w*im.height/im.width;g.shadowColor='rgba(0,0,0,.2)';g.shadowBlur=10;g.shadowOffsetY=5;g.drawImage(im,snapshot.x/100*1080-w/2,snapshot.y/100*1920-h/2,w,h);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.93));if(!blob)throw Error('Export failed');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='meu-story-storieslab.jpg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Story pronto! Abra a imagem salva para publicar no Instagram.';}catch{status.textContent='Não foi possível salvar. Tente novamente.';}finally{busy=false;active();}
 };
 active();
})();
