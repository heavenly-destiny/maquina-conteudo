// Local photo editor: optional device-only drafts, no photo upload or third-party processing.
(() => {
  let source=null, preview=null, lookId='', amount=100, worker=null, sequence=0, importToken=0;
  let exportUrl='', exportFile=null, panel=null, previewVersion=0, previewRunning=false, exporting=false, importing=false, renderedVersion=-1;
  let exportVersion=-1, prepareTimer, exportFailed=false, preferDownload=false, sharing=false;
  let exportWorker=null,exportTask=0,previewFailed=false;
  let sourceId='',trialBlocked=false,permitExpires=0;
  let adjustments={light:0,contrast:0,warmth:0,color:0},thumbToken=0;
  const adjustmentNames={light:'Exposição',contrast:'Contraste',highlights:'Realces',shadows:'Sombras',warmth:'Temperatura',tint:'Matiz',color:'Saturação',vibrance:'Vivacidade'};
  const pending=new Map();
  const $s=s=>panel?.querySelector(s);
  const alive=()=>panel?.isConnected;
  const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const status=(text,error=false)=>{if(!alive())return;const el=$s('#photoStatus');el.textContent=text;el.classList.toggle('error',error);if(error)toast(text);};
  function forgetExport() {
    if(exportUrl)URL.revokeObjectURL(exportUrl);exportUrl='';exportFile=null;
    exportVersion=-1;exportFailed=false;preferDownload=false;clearTimeout(prepareTimer);
  }
  function stopWorker(w,error=Error('Processing cancelled')) {
    if(!w)return;w.terminate();if(worker===w)worker=null;if(exportWorker===w)exportWorker=null;
    for(const [id,p] of pending){if(p.worker!==w)continue;clearTimeout(p.timer);pending.delete(id);p.reject(error);}
  }
  function cancelExport(){exportTask++;stopWorker(exportWorker);exporting=false;clearTimeout(prepareTimer);}
  function getWorker(fullSize=false) {
    const existing=fullSize?exportWorker:worker;if(existing)return existing;
    const w=new Worker('preset-worker.js?v=pro-1'+(typeof ME!=='undefined'&&ME&&ME.pass?'&p='+ME.pass:''));if(fullSize)exportWorker=w;else worker=w;
    w.onmessage=({data:m})=>{const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(m.error)):p.resolve(new Uint8ClampedArray(m.pixels));};
    w.onerror=()=>stopWorker(w,Error('Worker unavailable'));
    return w;
  }
  function process(pixels,look,intensity,settings=adjustments,fullSize=false) {
    return new Promise((resolve,reject)=>{
      let id,timer;
      try {
        const w=getWorker(fullSize);id=++sequence;
        timer=setTimeout(()=>stopWorker(w,Error('Processing timed out')),60000);
        pending.set(id,{resolve,reject,timer,worker:w});w.postMessage({id,look,amount:intensity/100,adjustments:{...settings},pixels:pixels.buffer},[pixels.buffer]);
      }catch(e){clearTimeout(timer);pending.delete(id);reject(e);}
    });
  }
  function controls() {
    if(!alive())return;
    panel.setAttribute('aria-busy',String(importing||previewRunning));
    $s('#photoRetry').hidden=!previewFailed;
    $s('#photoBusy').hidden=!previewRunning;
    $s('#photoSave').disabled=sharing||!source||previewRunning||importing||renderedVersion!==previewVersion||(!exportFailed&&exportVersion!==previewVersion);
    $s('#photoSave').textContent=sharing?'Abrindo opções…':trialBlocked?'Liberar Estúdio de Fotos':exportFailed?'Tentar salvar novamente':source&&exportVersion!==previewVersion?'Preparando foto…':'Salvar foto';
    $s('#photoPick').disabled=importing;
    $s('#photoRemove').disabled=importing;
    $s('#photoIntensity').disabled=!source||importing;
    panel.querySelectorAll('[data-photo-look]').forEach(b=>b.disabled=importing);
    $s('#photoCompare').disabled=!source||importing;
    panel.querySelectorAll('[data-photo-adjust],[data-reset-adjust],#photoReset,#photoZoom,#photoMyLooks').forEach(b=>b.disabled=!source||importing);
    $s('#photoKeepDraft').disabled=!source||importing||savingDraft;historyButtons();
  }
  function editedView() {
    if(!alive())return;
    $s('#photoOriginal').hidden=true;$s('#photoCompare').setAttribute('aria-pressed','false');$s('#photoCompare').innerHTML=glyph('compare');$s('#photoCompare').setAttribute('aria-label','Ver foto original');$s('#photoCompare').title='Ver foto original';$s('#photoBeforeBadge').hidden=true;
  }
  async function paint() {
    if(!preview||!alive()||previewRunning||importing)return;
    previewRunning=true;controls();
    const version=previewVersion, target=panel, input=preview, selected=lookId, intensity=amount;
    previewFailed=false;status('');
    try {
      const pixels=await process(new Uint8ClampedArray(input.data),selected,intensity);
      if(version===previewVersion&&target===panel&&alive()){
        const c=$s('#photoResult');c.width=input.width;c.height=input.height;
        c.getContext('2d').putImageData(new ImageData(pixels,input.width,input.height),0,0);
        renderedVersion=version;status('');
        clearTimeout(prepareTimer);prepareTimer=setTimeout(prepareExport,700);
      }
    }catch {if(version===previewVersion&&target===panel&&alive()){previewFailed=true;status('Não foi possível carregar este filtro.',true);}}
    finally {previewRunning=false;controls();if(version!==previewVersion&&preview&&alive())paint();}
  }
  function refresh() {
    if(!alive())return;
    cancelExport();forgetExport();editedView();previewFailed=false;previewVersion++;
    $s('#photoIntensity').value=amount;$s('#photoAmount').textContent=amount+'%';$s('#photoIntensity').setAttribute('aria-valuetext',amount+'%');$s('#photoIntensity').style.setProperty('--range-fill',amount+'%');
    panel.querySelectorAll('[data-photo-adjust]').forEach(el=>{el.value=adjustments[el.dataset.photoAdjust]||0;el.nextElementSibling.textContent=(+el.value>0?'+':'')+el.value;const end=(+el.value+100)/2;el.style.setProperty('--range-start',Math.min(50,end)+'%');el.style.setProperty('--range-end',Math.max(50,end)+'%');});
    panel.querySelectorAll('[data-photo-look]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.photoLook===lookId));
    const l=panel._data.looks.find(l=>l.id===lookId),tuned=Object.values(adjustments).some(Boolean);$s('#photoLookName').textContent=amount===0?(tuned?'Meus ajustes':'Original'):l?.name||'';
    controls();paint();
  }
  async function personalThumbnails() {
    const token=++thumbToken,target=panel;if(!source||!alive())return;
    const scale=Math.min(1,150/Math.max(source.width,source.height)),c=makeCanvas(Math.max(1,Math.round(source.width*scale)),Math.max(1,Math.round(source.height*scale)));
    const ctx=c.getContext('2d');ctx.drawImage(source,0,0,c.width,c.height);const input=ctx.getImageData(0,0,c.width,c.height);
    // Immediately replace stock photos; filtered thumbnails arrive in the background.
    const original=c.toDataURL('image/jpeg',.8);
    target.querySelectorAll('[data-photo-look] img').forEach(img=>{img.src=original;img.removeAttribute('loading');});
    for(const look of target._data.looks.filter(l=>(l.collection||'Cinema')===collection)){
      if(token!==thumbToken||target!==panel||!alive())return;
      try {if(thumbs.has(look.id)){const image=target.querySelector(`[data-photo-look="${look.id}"] img`);if(image)image.src=thumbs.get(look.id);continue;}const pixels=await process(new Uint8ClampedArray(input.data),look.id,look.defaultAmount??100,{});
        if(token!==thumbToken||target!==panel||!alive())return;
        ctx.putImageData(new ImageData(pixels,c.width,c.height),0,0);
        const url=c.toDataURL('image/jpeg',.8);thumbs.set(look.id,url);const image=target.querySelector(`[data-photo-look="${look.id}"] img`);if(image)image.src=url;
      }catch{} // The main preview retains its explicit retry UI if a LUT is unavailable.
    }
  }
  function showSource() {
    if(!alive())return;
    panel.classList.toggle('has-photo',!!source);
    $s('#photoEmpty').hidden=!!source;$s('#photoWorkspace').hidden=!source;
    $s('#photoPick').innerHTML=glyph('photo');$s('#photoPick').setAttribute('aria-label',source?'Trocar foto':'Escolher minha foto');$s('#photoPick').title=source?'Trocar foto':'Escolher minha foto';$s('#photoRemove').hidden=!source;
    if(source){
      for(const id of ['#photoOriginal','#photoResult']){const c=$s(id);c.width=preview.width;c.height=preview.height;c.getContext('2d').putImageData(preview,0,0);}

    }
    controls();
  }
  async function decode(file) {
    if(typeof createImageBitmap==='function')try{return await createImageBitmap(file,{imageOrientation:'from-image'});}catch{}
    const url=URL.createObjectURL(file),img=new Image();
    try{img.src=url;await img.decode();return img;}finally{URL.revokeObjectURL(url);}
  }
  async function choose(file, saved=null) {
    if(!file)return;
    if(file.size>40*1024*1024){status('Escolha uma foto de até 40 MB.',true);return;}
    if(!/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name)&&!/^image\/(jpeg|png|webp|avif|hei[cf])$/i.test(file.type)){status('Escolha uma foto JPG, PNG ou WebP.',true);return;}
    const token=++importToken;cancelExport();
    importing=true;controls();status('Abrindo sua foto…');
    let image,accepted=false;
    try {
      image=await decode(file);if(token!==importToken)return;
      const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
      if(!w||!h)throw Error('Empty image');
      const scale=Math.min(1,4096/Math.max(w,h),Math.sqrt(12000000/(w*h)));
      const next=makeCanvas(Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale))),ctx=next.getContext('2d',{willReadFrequently:true});
      ctx.fillStyle='#fff';ctx.fillRect(0,0,next.width,next.height);ctx.drawImage(image,0,0,next.width,next.height);
      const ps=Math.min(1,1000/Math.max(next.width,next.height)),pc=makeCanvas(Math.max(1,Math.round(next.width*ps)),Math.max(1,Math.round(next.height*ps)));
      const px=pc.getContext('2d',{willReadFrequently:true});px.drawImage(next,0,0,pc.width,pc.height);
      const nextPreview=px.getImageData(0,0,pc.width,pc.height);
      if(source){source.width=1;source.height=1;}window.ToolTrial?.release('presets',sourceId);sourceId=crypto.randomUUID();trialBlocked=false;source=next;preview=nextPreview;pc.width=1;pc.height=1;
      adjustments=Object.fromEntries(Object.keys(adjustmentNames).map(k=>[k,0]));
      if(saved){const s=validSettings(saved.settings);lookId=s.lookId;amount=s.amount;adjustments=s.adjustments;collection=panel._data.looks.find(l=>l.id===lookId)?.collection||'Cinema';if(typeof saved.sourceId==='string'&&saved.sourceId.length<80)sourceId=saved.sourceId;}
      thumbs.clear();history=[];future=[];checkpoint();accepted=true;showSource();renderLooks();
    }catch{if(token===importToken)status('Essa foto não abriu neste navegador. Tente uma versão JPG, PNG ou WebP.',true);}
    finally{image?.close?.();if(token===importToken){importing=false;controls();if(accepted)refresh();else if(source&&exportVersion!==previewVersion)prepareExport();}}
  }
  async function prepareExport() {
    if(!source||!alive()||exporting||previewRunning||importing||renderedVersion!==previewVersion)return;
    const task=++exportTask,target=panel,version=previewVersion,w=source.width,h=source.height,selected=lookId,intensity=amount;
    exporting=true;exportFailed=false;trialBlocked=false;controls();
    let output;
    try {
      const input=source.getContext('2d').getImageData(0,0,w,h);
      const pixels=await process(input.data,selected,intensity,adjustments,true);
      if(task!==exportTask||target!==panel||!alive()||version!==previewVersion)return;
      output=makeCanvas(w,h);output.getContext('2d').putImageData(new ImageData(pixels,w,h),0,0);
      const blob=await new Promise((resolve,reject)=>output.toBlob(b=>b?resolve(b):reject(Error('JPEG export failed')),'image/jpeg',.94));
      if(target!==panel||!alive()||version!==previewVersion)return;
      const permit=await window.ToolTrial?.reserve('presets',sourceId)||{ok:true};
      if(target!==panel||!alive()||version!==previewVersion)return;
      if(permit.error==='busy')throw Error('Another edit is reserving allowance');
      forgetExport();exportFile=new File([blob],`stories-lab-${selected}-${intensity}.jpg`,{type:'image/jpeg'});exportUrl=URL.createObjectURL(blob);exportVersion=version;
      trialBlocked=!permit.ok;permitExpires=permit.expires||0;
      if(trialBlocked){$s('#photoSaveHint').textContent='Sua cota de hoje acabou. Renova à meia-noite de Brasília, ou libere o acesso ilimitado.';status('Cota diária concluída. Sua edição continua aqui.');return;}
      $s('#photoSaveHint').textContent=canShare()?(appleMobile()?'No menu, escolha Salvar Imagem.':'Escolha onde salvar no menu do celular.') : '';
      status('');
    }catch{if(task===exportTask&&target===panel&&alive()&&version===previewVersion){exportFailed=true;status('Não deu para preparar a foto. Toque em Tentar salvar novamente.',true);}}
    finally{if(output){output.width=1;output.height=1;}if(task===exportTask){exporting=false;controls();}}
  }
  const appleMobile=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  function canShare(){try{return !!((matchMedia('(pointer: coarse)').matches||appleMobile())&&exportFile&&navigator.share&&navigator.canShare?.({files:[exportFile]}));}catch{return false;}}
  function save(){
    if(sharing)return;
    if(trialBlocked){window.ToolTrial?.offer('presets');return;}
    if(exportFailed){prepareExport();return;}
    if(!exportFile||exportVersion!==previewVersion)return;
    if(!has('presets')&&(!window.ToolTrial?.isToday()||(permitExpires&&Date.now()>=permitExpires-5000))){status('Atualizando seu acesso. Toque em Salvar foto quando estiver pronto.');prepareExport();return;}
    const item=sourceId;
    const count=()=>(window.slEv?.('photo'),window.ToolTrial?.commit('presets',item)).catch(()=>status('Foto enviada. Não foi possível atualizar seu saldo agora; confira a conexão.'));
    if(!preferDownload&&canShare()){
      // File is prepared before the tap: preserve transient user activation on iOS.
      const target=panel;sharing=true;controls();
      navigator.share({files:[exportFile]}).then(()=>{count();permitExpires=0;if(target===panel&&alive())status('Foto enviada ao destino escolhido.');}).catch(e=>{
        if(target!==panel||!alive())return;
        if(e.name==='AbortError'){$s('#photoSaveHint').textContent='Sua edição continua aqui. Toque em Salvar foto quando quiser.';status('Sua edição continua aqui. Salve quando quiser.');return;}
        preferDownload=true;$s('#photoSaveHint').textContent='Toque em Salvar foto para baixar o JPG.';status('O compartilhamento não abriu. Você pode baixar a foto pelo mesmo botão.',true);
      }).finally(()=>{sharing=false;controls();});
    }else{
      const a=document.createElement('a');a.href=exportUrl;a.download=exportFile.name;document.body.append(a);a.click();a.remove();count();permitExpires=0;status('Download iniciado. Sua foto está nos downloads do navegador.');
    }
  }
  const glyph=(name)=>{
    if(window.StoriesIcons)return window.StoriesIcons.icon(name);
    const paths={back:'m14 5-7 7 7 7',undo:'M4 9h10a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5',redo:'M20 9H10a6 6 0 0 0 0 12m14-12-5-5m5 5-5 5',reset:'M4 10a8 8 0 1 1 1 8M4 4v6h6',photo:'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M15 8h.01',save:'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4',compare:'M12 3v18M4 5h16v14H4z',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',close:'m6 6 12 12M6 18 18 6',light:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',color:'M12 3C9 7 5 10 5 14a7 7 0 0 0 14 0c0-4-4-7-7-11Z',filters:'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z'};
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.photo}"/></svg>`;
  };
  let history=[],future=[],collection='Cinema',mode='looks',thumbs=new Map();
  const snapshot=()=>({lookId,amount,adjustments:{...adjustments}});
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function checkpoint(){const s=snapshot();if(!history.length||!same(history[history.length-1],s)){history.push(s);if(history.length>40)history.shift();future=[];}historyButtons();}
  function historyButtons(){if(!alive())return;$s('#photoUndo').disabled=!source||history.length<2||importing;$s('#photoRedo').disabled=!source||!future.length||importing;}
  function restore(s){lookId=s.lookId;amount=s.amount;adjustments={...s.adjustments};collection=panel._data.looks.find(l=>l.id===lookId)?.collection||'Cinema';renderLooks();refresh();historyButtons();}
  function undo(){if(history.length<2)return;future.push(history.pop());restore(history[history.length-1]);}
  function redo(){if(!future.length)return;const s=future.pop();history.push(s);restore(s);}
  function validSettings(s={}){
    const clamp=(n,min,max,fallback=0)=>Number.isFinite(+n)?Math.max(min,Math.min(max,+n)):fallback;
    return {lookId:panel._data.looks.some(l=>l.id===s.lookId)?s.lookId:panel._data.looks[0].id,amount:clamp(s.amount,0,100,70),adjustments:Object.fromEntries(Object.keys(adjustmentNames).map(k=>[k,clamp(s.adjustments?.[k],-100,100)]))};
  }
  function myLooks(){
    $s('#photoMore').open=false;
    const target=panel,dialog=document.createElement('dialog');dialog.className='studio-dialog';dialog.setAttribute('aria-labelledby','myLooksTitle');
    let rows=StudioLibrary.recipes();
    dialog.innerHTML=`<button type="button" class="iconbtn studio-dialog-close" aria-label="Fechar meus looks">${glyph('close')}</button><h2 id="myLooksTitle">Meus looks</h2><form><label for="recipeName">Nome do look</label><div class="recipe-new"><input id="recipeName" maxlength="40" required autocomplete="off" placeholder="Ex.: Meu treino dark"><button class="btn sm" type="submit">Guardar</button></div></form><div class="recipe-list"></div><p class="studio-dialog-note">Até 12 looks, só neste aparelho.</p>`;
    const render=()=>{
      dialog.querySelector('.recipe-list').innerHTML=rows.length?rows.map(r=>`<div class="recipe-item"><button type="button" data-recipe="${esc(r.id)}"><b>${esc(r.name)}</b><small>${esc(target._data.looks.find(l=>l.id===r.settings?.lookId)?.name||'Look')} · ${Math.round(r.settings?.amount||0)}%</small></button><button class="recipe-delete" type="button" data-delete-recipe="${esc(r.id)}" aria-label="Excluir ${esc(r.name)}">${glyph('close')}</button></div>`).join(''):'<p class="recipe-empty">Dê um nome para guardar seus ajustes.</p>';
      dialog.querySelector('button[type=submit]').disabled=rows.length>=12;
    };
    dialog.querySelector('form').onsubmit=e=>{
      e.preventDefault();const name=dialog.querySelector('input').value.trim();if(!name||rows.length>=12)return;
      const next=[...rows,{id:crypto.randomUUID(),name,settings:snapshot()}];
      try{StudioLibrary.saveRecipes(next);rows=next;dialog.querySelector('input').value='';render();toast('Look guardado. Pronto para a próxima foto.');}catch{toast('Não foi possível guardar neste aparelho. Confira o espaço disponível.');}
    };
    dialog.addEventListener('click',e=>{
      const apply=e.target.closest('[data-recipe]'),remove=e.target.closest('[data-delete-recipe]');
      if(apply&&target===panel&&alive()){const row=rows.find(r=>r.id===apply.dataset.recipe);if(row){restore(validSettings(row.settings));checkpoint();dialog.close();toast('Seu look foi aplicado.');}}
      if(remove){const next=rows.filter(r=>r.id!==remove.dataset.deleteRecipe);try{StudioLibrary.saveRecipes(next);rows=next;render();dialog.querySelector('input').focus();}catch{toast('Não foi possível excluir o look.');}}
    });
    dialog.querySelector('.studio-dialog-close').onclick=()=>dialog.close();
    const leave=()=>dialog.close();addEventListener('hashchange',leave);
    dialog.addEventListener('close',()=>{removeEventListener('hashchange',leave);const t=dialog.querySelector('#toast');if(t)document.body.append(t);dialog.remove();if(alive())$s('#photoMore summary')?.focus();},{once:true});
    render();document.body.append(dialog);dialog.showModal();
  }
  let savingDraft=false;
  async function keepDraft(){
    if(!source||savingDraft||importing)return;
    savingDraft=true;const button=$s('#photoKeepDraft'),target=panel,settings=snapshot(),id=sourceId,input=source,width=source.width,height=source.height;
    button.disabled=true;$s('#photoMore').open=false;status('Guardando rascunho neste aparelho…');
    try{
      const blob=await new Promise((resolve,reject)=>input.toBlob(b=>b?resolve(b):reject(Error('No image')),'image/png'));
      await StudioLibrary.putDraft({blob,settings,sourceId:id,updatedAt:Date.now(),width,height});
      if(target===panel&&alive()){toast('Rascunho guardado neste aparelho.');status('Rascunho guardado. Você pode continuar depois.');}
    }catch{if(target===panel&&alive())status('Não deu para guardar o rascunho. Confira o espaço disponível neste aparelho.',true);}
    finally{savingDraft=false;if(button.isConnected)button.disabled=false;}
  }
  async function showDraft(){
    const target=panel;
    try{
      const draft=await StudioLibrary.getDraft();if(!draft?.blob||target!==panel||!alive()||source)return;
      const box=$s('#photoDraft');box.hidden=false;
      box.querySelector('small').textContent=`${new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(draft.updatedAt)} · neste aparelho`;
      box.querySelector('[data-resume-draft]').onclick=async()=>{box.hidden=true;await choose(new File([draft.blob],'rascunho.png',{type:'image/png'}),draft);if(!source)box.hidden=false;};
      box.querySelector('[data-discard-draft]').onclick=async()=>{try{await StudioLibrary.deleteDraft();box.hidden=true;toast('Rascunho excluído deste aparelho.');}catch{toast('Não foi possível excluir o rascunho.');}};
    }catch{ /* Draft storage is optional; photo editing remains available. */ }
  }
  // 09/11: empty state demo = owner's café photo filtered live with the real LUT worker; chips switch the look
  const DEMO_LOOKS=['17-dark-cinema','13-soft-film','19-ocean','14-editorial','15-bronze','16-soft-clean','20-summer-pop'];
  let demoBase=null,demoToken=0,demoSrc='';
  // owner 09/11: 7 demo photos, a different one each time the studio opens (also used by the gallery banner in mat.js)
  window.slDemoPhoto=()=>{let i=0;try{i=(+localStorage.getItem('sl_demo')||0)%7+1;localStorage.setItem('sl_demo',i);}catch{i=1+Math.floor(Math.random()*7);}return `img/presets/antes/studio-demo-${i}.webp`;};
  async function demoLook(id){
    const token=++demoToken,target=panel,look=target?._data.looks.find(l=>l.id===id);if(!look)return;
    target.querySelectorAll('[data-demo-look]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.demoLook===id));
    try{
      if(!demoBase){const img=new Image();img.src=demoSrc;await img.decode();const c=makeCanvas(540,Math.round(540*img.naturalHeight/img.naturalWidth));const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,c.width,c.height);demoBase={c,x,data:x.getImageData(0,0,c.width,c.height)};}
      const px=await process(new Uint8ClampedArray(demoBase.data.data),id,look.defaultAmount??100,{});
      if(token!==demoToken||target!==panel||!alive())return;
      demoBase.x.putImageData(new ImageData(px,demoBase.c.width,demoBase.c.height),0,0);
      $s('#photoDemoAfter').src=demoBase.c.toDataURL('image/jpeg',.86);$s('#photoDemoName').textContent=look.name;
    }catch(e){ console.warn('studio demo', e?.message); /* decorative; the editor keeps working */ }
  }
  function renderLooks(){
    if(!alive())return;
    const list=panel._data.looks.filter(l=>(l.collection||'Cinema')===collection);
    $s('#photoCollection').value=collection;
    $s('#photoCollectionCount').textContent=`${list.length} ${collection==='Cinema'?'looks':'variações'}`;
    $s('.photo-looks').innerHTML=list.map(l=>`<button type="button" data-photo-look="${l.id}" aria-label="Aplicar ${esc(l.name)}" aria-pressed="${l.id===lookId}"><span class="photo-thumb"><img src="${thumbs.get(l.id)||`img/presets/depois/${l.id}/${l.photo}.webp?v=pro-1`}" alt="" loading="lazy"><span class="photo-selected">✓</span></span><span>${esc(collection==='Cinema'?l.name:l.variant)}</span></button>`).join('');
    $s('.photo-looks').scrollLeft=0;
    panel.querySelectorAll('[data-photo-look]').forEach(b=>b.onclick=()=>{lookId=b.dataset.photoLook;amount=panel._data.looks.find(l=>l.id===lookId)?.defaultAmount??100;checkpoint();refresh();});
    if(source)personalThumbnails();controls();
  }
  function setMode(next){
    mode=next;const tuning=next!=='looks';
    $s('#photoFineTune').hidden=!tuning;$s('#photoLooksPanel').hidden=tuning;$s('.photo-intensity').hidden=tuning;
    panel.querySelectorAll('[data-adjust-panel]').forEach(p=>p.hidden=p.dataset.adjustPanel!==next);
    panel.querySelectorAll('[data-photo-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.photoMode===next));
  }
  function mount(container,data,requested) {
    const valid=data.looks.find(l=>l.id===requested)||data.looks.find(l=>l.id===lookId)||data.looks[0];if(lookId!==valid.id)amount=valid.defaultAmount??100;lookId=valid.id;collection=valid.collection||'Cinema';
    cancelExport();forgetExport();previewFailed=false;previewVersion++;demoBase=null;demoSrc=window.slDemoPhoto();
    const collections=[...new Set(data.looks.map(l=>l.collection||'Cinema'))];
    const tune=(keys)=>keys.map(key=>`<div class="photo-tune"><label for="photoAdjust-${key}">${adjustmentNames[key]}</label><input id="photoAdjust-${key}" type="range" data-photo-adjust="${key}" aria-label="${adjustmentNames[key]}" min="-100" max="100" step="1" value="${adjustments[key]||0}"><button type="button" data-reset-adjust="${key}" aria-label="Zerar ${adjustmentNames[key]}" title="Zerar ${adjustmentNames[key]}">${adjustments[key]||0}</button></div>`).join('');
    container.innerHTML=`<div class="vh photo-heading"><a class="iconbtn" href="#/m/presets" aria-label="Voltar para os looks">${icon('i-back')}</a><div class="grow"><h1>Estúdio de Fotos</h1></div>${window.ToolTrial?.badge('presets')||''}</div>
    <section id="photoStudio" class="photo-studio"><input type="file" id="photoInput" accept="image/*" hidden>
      <div class="photo-toolbar"><button class="photo-tool photo-pick" type="button" id="photoPick">Escolher minha foto</button><div class="photo-history"><button class="photo-tool" type="button" id="photoUndo" aria-label="Desfazer" title="Desfazer">${glyph('undo')}</button><button class="photo-tool" type="button" id="photoRedo" aria-label="Refazer" title="Refazer">${glyph('redo')}</button></div><details class="photo-more" id="photoMore"><summary aria-label="Mais opções da foto" title="Mais opções">${glyph('more')}</summary><div class="photo-more-panel"><button class="photo-tool" type="button" id="photoMyLooks">${glyph('filters')} Meus looks</button><button class="photo-tool" type="button" id="photoKeepDraft">${glyph('save')} Guardar rascunho</button><small>Um rascunho por vez, só neste aparelho.</small><button class="photo-tool" type="button" id="photoReset">${glyph('reset')} Redefinir edição</button><button class="photo-tool" type="button" id="photoRemove" hidden>${glyph('close')} Remover foto</button></div></details><button class="btn photo-save" type="button" id="photoSave" disabled>Salvar foto</button></div>
      <div id="photoEmpty" class="photo-empty"><div class="photo-empty-art demo-sweep" style="--demo-split:50%"><img src="${demoSrc}" alt=""><img id="photoDemoAfter" src="${demoSrc}" alt=""><b class="photo-demo-tag a">Original</b><b class="photo-demo-tag b" id="photoDemoName"></b><span class="photo-demo-line" aria-hidden="true"><i>${glyph('compare')}</i></span><input type="range" id="photoDemoCompare" min="0" max="100" value="50" aria-label="Comparar foto original e filtro" aria-valuetext="50% de comparação"></div><div class="photo-empty-copy"><div class="photo-demo-looks" role="group" aria-label="Testar filtros na foto de exemplo">${DEMO_LOOKS.map(id=>data.looks.find(l=>l.id===id)).filter(Boolean).map(l=>`<button type="button" data-demo-look="${l.id}">${esc(l.name)}</button>`).join('')}</div><button type="button" class="btn" id="photoEmptyPick">${glyph('photo')} Escolher minha foto</button><a class="tutlink" href="#tutoriais/fotos" aria-label="Como usar o Estúdio" title="Como usar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 0 1 4.9.6c0 1.8-2.5 1.9-2.5 3.8"/><path d="M12 17h.01" stroke-linecap="round"/></svg></a>${!has('presets')&&window.ToolTrial?.enabled('presets')?'<p class="photo-access-note">3 fotos por dia nos dois primeiros dias; depois, 2 por dia. Comparar e ajustar é livre. Acesso ilimitado vendido à parte.</p>':''}</div></div>
      <div id="photoWorkspace" class="photo-workspace" hidden><div class="photo-visual"><div class="photo-preview"><button type="button" class="photo-zoom" id="photoZoom" aria-expanded="false" aria-label="Ampliar foto">${glyph('expand')}</button><canvas id="photoResult" role="img" aria-label="Sua foto inteira com o preset aplicado"></canvas><canvas id="photoOriginal" role="img" aria-label="Sua foto original inteira" hidden></canvas><span id="photoBeforeBadge" class="photo-before-badge" hidden>ORIGINAL</span></div><div class="photo-preview-bar"><div><span id="photoLookName"></span></div><button type="button" class="photo-tool photo-compare" id="photoCompare" aria-pressed="false" aria-label="Ver foto original" title="Ver foto original">${glyph('compare')}</button></div></div>
      <div class="photo-adjust"><div class="photo-mode" role="group" aria-label="Controles de edição"><button type="button" data-photo-mode="looks" aria-pressed="true">${glyph('filters')}<span>Filtros</span></button><button type="button" data-photo-mode="light" aria-pressed="false">${glyph('light')}<span>Luz</span></button><button type="button" data-photo-mode="color" aria-pressed="false">${glyph('color')}<span>Cor</span></button></div>
        <div id="photoLooksPanel"><div class="photo-collection-row"><label for="photoCollection">Coleção<select id="photoCollection">${collections.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label><span id="photoCollectionCount"></span></div><div class="photo-looks" role="group" aria-label="Presets para sua foto"></div></div>
        <div class="photo-finetune" id="photoFineTune" hidden><div data-adjust-panel="light">${tune(['light','contrast','highlights','shadows'])}</div><div data-adjust-panel="color" hidden>${tune(['warmth','tint','color','vibrance'])}</div></div>
        <div class="photo-intensity"><label for="photoIntensity">Intensidade <output id="photoAmount">${amount}%</output></label><input id="photoIntensity" type="range" min="0" max="100" step="1" value="${amount}"><div><small>Suave</small><small>Marcante</small></div></div>
        <div class="photo-save-area"><p id="photoSaveHint" class="photo-save-hint"></p></div>
      </div></div><p id="photoStatus" class="photo-status" role="status" aria-live="polite"></p>
      <button type="button" id="photoRetry" class="photo-tool photo-retry" hidden>Tentar novamente</button></section>`;
    panel=container.querySelector('#photoStudio');panel._data=data;
    $s('.photo-preview').insertAdjacentHTML('beforeend','<span id="photoBusy" class="photo-busy" aria-hidden="true" hidden></span>');
    $s('#photoRetry').onclick=refresh;
    $s('#photoEmptyPick').insertAdjacentHTML('afterend','<div id="photoDraft" class="photo-draft" hidden><button type="button" data-resume-draft><b>Continuar rascunho ↗</b><small></small></button><button type="button" data-discard-draft aria-label="Excluir rascunho">'+glyph('close')+'</button></div>');
    $s('#photoMyLooks').onclick=myLooks;$s('#photoKeepDraft').onclick=keepDraft;
    const demo=$s('#photoDemoCompare');demo.oninput=()=>{demo.parentElement.classList.remove('demo-sweep');demo.parentElement.style.setProperty('--demo-split',demo.value+'%');demo.setAttribute('aria-valuetext',demo.value+'% de comparação');};
    panel.querySelectorAll('[data-demo-look]').forEach(b=>b.onclick=()=>demoLook(b.dataset.demoLook));
    demoLook(DEMO_LOOKS.find(id=>data.looks.some(l=>l.id===id))||valid.id);
    const pick=()=>$s('#photoInput').click();$s('#photoPick').onclick=pick;$s('#photoEmptyPick').onclick=pick;
    $s('#photoInput').onchange=e=>{const f=e.target.files[0];e.target.value='';choose(f);};
    $s('#photoRemove').onclick=()=>{$s('#photoMore').open=false;cancelExport();previewFailed=false;thumbToken++;importToken++;previewVersion++;window.ToolTrial?.release('presets',sourceId);sourceId='';trialBlocked=false;source.width=1;source.height=1;source=null;preview=null;thumbs.clear();history=[];future=[];forgetExport();showSource();renderLooks();showDraft();status('Foto removida.');};
    $s('#photoCollection').onchange=e=>{collection=e.target.value;renderLooks();};
    $s('#photoIntensity').oninput=e=>{amount=+e.target.value;refresh();};$s('#photoIntensity').onchange=checkpoint;
    $s('#photoCompare').onclick=()=>{const active=$s('#photoOriginal').hidden;$s('#photoOriginal').hidden=!active;$s('#photoBeforeBadge').hidden=!active;$s('#photoCompare').setAttribute('aria-pressed',active);$s('#photoCompare').innerHTML=glyph('compare');const label=active?'Ver foto editada':'Ver foto original';$s('#photoCompare').setAttribute('aria-label',label);$s('#photoCompare').title=label;};
    $s('#photoSave').onclick=save;$s('#photoUndo').onclick=undo;$s('#photoRedo').onclick=redo;
    $s('#photoReset').onclick=()=>{$s('#photoMore').open=false;amount=0;adjustments=Object.fromEntries(Object.keys(adjustmentNames).map(k=>[k,0]));checkpoint();refresh();};
    panel.querySelectorAll('[data-photo-adjust]').forEach(el=>{el.oninput=()=>{adjustments[el.dataset.photoAdjust]=+el.value;refresh();};el.onchange=checkpoint;});
    panel.querySelectorAll('[data-reset-adjust]').forEach(button=>button.onclick=()=>{adjustments[button.dataset.resetAdjust]=0;checkpoint();refresh();});
    panel.querySelectorAll('[data-photo-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.photoMode));
    const zoom=active=>{panel.classList.toggle('photo-focused',active);$s('#photoZoom').setAttribute('aria-expanded',active);$s('#photoZoom').setAttribute('aria-label',active?'Voltar à edição':'Ampliar foto');$s('#photoZoom').innerHTML=glyph(active?'close':'expand');};
    $s('#photoZoom').onclick=()=>zoom(!panel.classList.contains('photo-focused'));
    panel.addEventListener('click',e=>{if(!e.target.closest('#photoMore'))$s('#photoMore').open=false;});
    panel.addEventListener('keydown',e=>{if(e.key==='Escape'){zoom(false);$s('#photoMore').open=false;}});
    renderLooks();setMode('looks');showSource();if(source){checkpoint();refresh();}else showDraft();
  }
  window.PhotoStudio={mount,isActive:()=>alive()&&!document.querySelector('#mat').hidden,refreshAccess:()=>{if(alive()&&source)refresh();}};
  addEventListener('pageshow',e=>{if(e.persisted&&alive()&&source)refresh();});
})();
