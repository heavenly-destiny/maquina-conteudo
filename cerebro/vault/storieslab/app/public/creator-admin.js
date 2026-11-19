(() => {
 const host=document.getElementById('creatorAdmin');let revision=0;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 window.renderCreators=async()=>{
  if(host.querySelector('details[open]'))return;
  const rev=++revision,q=new URLSearchParams({from:S.from||'',to:S.to||'',platform:S.plat||''});
  try{
   const data=await api('/creators?'+q);if(rev!==revision)return;if(!data.ok)throw Error('Não foi possível carregar.');
   host.replaceChildren();host.append(el('h2','Influenciadores'));
   host.append(el('p','Período selecionado · cliques de todas as plataformas · receita de itens pagos, já excluídos reembolsos.','sub'));
   if(!data.items.length){host.append(el('p','Os perfis aparecem aqui assim que entram pelo kit.'));return;}
   const wrap=el('div');wrap.style.overflowX='auto';const table=el('table'),head=el('thead'),tr=el('tr');
   ['Influencer','Cliques / visitantes','Vendas','Receita','Estornos','Parceria'].forEach(t=>tr.append(el('th',t)));head.append(tr);table.append(head);const body=el('tbody');
   for(const p of data.items){
    const row=el('tr'),name=el('td'),link=el('button','Copiar link');link.type='button';link.onclick=async()=>{try{await navigator.clipboard.writeText(p.link);link.textContent='Copiado'}catch{link.textContent='Não foi possível copiar'}};
    name.append(el('b',p.name),el('br'),el('small',p.id.slice(0,8)+(p.active?'':' · desativado')),el('br'),link);row.append(name);
    row.append(el('td',p.clicks+' / '+p.visitors),el('td',p.sales),el('td',money(p.revenue)),el('td',p.refunds+' · '+money(p.refunded)));
    const td=el('td'),details=el('details'),summary=el('summary',p.feeCents?money(p.feeCents/100)+' fixo':p.commission?p.commission+'% combinado':'Definir parceria');details.append(summary);
    const form=el('form');form.className='f';form.style.minWidth='210px';
    const field=(title,value,type='number')=>{const label=el('label',title),input=el('input');input.type=type;input.value=value;input.min='0';input.step='0.01';label.append(input);form.append(label);return input};
    const fee=field('Valor fixo total (R$)',p.feeCents/100),commission=field('Comissão combinada (%)',p.commission);commission.max='100';
    const activeLabel=el('label','Acesso e link ativos'),active=el('input');active.type='checkbox';active.checked=!!p.active;activeLabel.append(active);form.append(activeLabel);
    const save=el('button','Salvar');save.type='submit';const status=el('p');status.setAttribute('role','status');form.append(save,status);
    form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{const r=await api('/creators',{id:p.id,active:active.checked?1:0,feeCents:Math.round(Number(fee.value)*100),commission:Number(commission.value)});if(!r.ok)throw Error(r.error||'Falha ao salvar.');status.textContent='Salvo';summary.textContent=Number(fee.value)?money(fee.value)+' fixo':Number(commission.value)+'% combinado';}catch(e){status.textContent=e.message}finally{save.disabled=false}};
    details.append(form,el('small','Registro do acordo. Não gera pagamento nem comissão automática.'));td.append(details);row.append(td);body.append(row);
   }
   table.append(body);wrap.append(table);host.append(wrap);
   host.append(el('p','Vendas principais por transação, sem duplicar notificações. Receita inclui extras com o mesmo rastreio. Cliques excluem prévias conhecidas; visitantes são estimados por navegador. Atribuição: compra identificada pelo link em até 30 dias.','sub'));
  }catch(e){if(rev===revision){host.replaceChildren(el('h2','Influenciadores'),el('p',e.message));}}
 };
 if(typeof D!=='undefined'&&D)window.renderCreators();
})();
