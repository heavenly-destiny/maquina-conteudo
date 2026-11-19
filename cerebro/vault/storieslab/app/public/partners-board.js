(() => {
 const host=document.getElementById('creatorAdmin');let revision=0,all=[],filter='';
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const copyButton=(label,value)=>{const b=el('button',label,'pb-copy');b.type='button';b.onclick=async()=>{try{await navigator.clipboard.writeText(value);b.textContent='Copiado ✓'}catch{b.textContent='Não foi possível copiar'}};return b;};
 function drawCards(list,container){
  container.replaceChildren();
  for(const p of list){
   const card=el('article',undefined,'pb-card'),head=el('div',undefined,'pb-head'),identity=el('div');
   identity.append(el('strong',p.name));
   if(p.instagram){const ig=el('a','Ver Instagram ↗');ig.href='https://instagram.com/'+p.instagram;ig.target='_blank';ig.rel='noopener';identity.append(ig);}
   else identity.append(el('small','Aguardando vincular Instagram'));
   head.append(identity,el('span',!p.active?'Desativado':p.partnerApproved?'Parceira':'Aguardando','pb-badge'+(p.partnerApproved&&p.active?' approved':'')));card.append(head);
   const stats=el('div',undefined,'pb-stats');
   for(const [label,value] of [['Visitantes',p.visitors],['Compradores',p.buyers],['Vendas',p.sales],['Cliques',p.clicks],['Receita bruta',money(p.gross)],['Líquido confirmado',money(p.net)],['Comissão gerada',money(p.earnings)],['Marca após comissão',money(p.brandNet)]]){const item=el('div');item.append(el('span',label),el('b',value));stats.append(item);}card.append(stats);
   if(p.missingNet)card.append(el('p',p.missingNet+' item(ns) aguardando o líquido da plataforma.','pb-note'));
   const channel=el('p',p.pageClicks+' cliques na página · '+p.checkoutClicks+' no checkout · '+p.refunds+' estornos','pb-note');card.append(channel);
   if(p.partnerApproved&&p.link){const links=el('div',undefined,'pb-links');links.append(copyButton('Página de vendas',p.link),copyButton('Checkout Premium',p.checkoutLinks.premium),copyButton('Checkout Básico',p.checkoutLinks.basico));card.append(links);}
   const details=el('details'),summary=el('summary','Gerenciar parceria · '+p.commission+'% do líquido');details.append(summary);
   const form=el('form',undefined,'pb-form');
   const field=(title,value)=>{const label=el('label',title),input=el('input');input.type='number';input.value=value;input.min='0';input.step='0.01';input.required=true;label.append(input);form.append(label);return input;};
   const rate=field('Porcentagem sobre o líquido (%)',p.commission);rate.max='100';
   const fee=field('Valor fixo combinado (R$)',p.feeCents/100);
   const toggle=(title,checked)=>{const label=el('label',undefined,'pb-toggle'),input=el('input');input.type='checkbox';input.checked=checked;label.append(input,el('span',title));form.append(label);return input;};
   const approved=toggle('Liberar painel de parceria e links',p.partnerApproved);approved.disabled=!p.instagram;
   const active=toggle('Manter acesso ao kit e app',!!p.active);
   form.append(el('p','Confira o @ antes de liberar. Novas condições valem para pagamentos confirmados a partir da alteração. O fixo é registrado à parte.','pb-note'));
   const save=el('button','Salvar parceria','pb-primary'),status=el('p',undefined,'pb-note');save.type='submit';status.setAttribute('role','status');form.append(save,status);
   form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{const r=await api('/creators',{id:p.id,active:active.checked?1:0,partnerApproved:approved.checked?1:0,feeCents:Math.round(Number(fee.value)*100),commission:Number(rate.value)});if(!r.ok)throw Error(r.error||'Não foi possível salvar.');details.open=false;await window.renderCreators();}catch(e){status.textContent=e.message}finally{save.disabled=false}};
   details.append(form);card.append(details);
   const history=el('details'),hs=el('summary','Últimas vendas e comissões');history.append(hs);
   if(!p.recent?.length)history.append(el('p','Nenhuma venda atribuída no período.','pb-note'));
   for(const sale of p.recent||[]){const row=el('div',undefined,'pb-sale');row.append(el('span',new Date(sale.at).toLocaleDateString('pt-BR')+' · '+sale.status),el('b',sale.pending?'Líquido pendente':money(sale.commission)));history.append(row);}card.append(history);container.append(card);
  }
  if(!list.length)container.append(el('p','Nenhum perfil encontrado.'));
 }
 window.renderCreators=async()=>{
  if(host.querySelector('details[open] form'))return;
  const rev=++revision,q=new URLSearchParams({from:S.from||'',to:S.to||'',platform:S.plat||''});
  try{
   const data=await api('/creators?'+q);if(rev!==revision)return;if(!data.ok)throw Error('Não foi possível carregar as parcerias.');all=data.items;host.replaceChildren();
   const header=el('div',undefined,'pb-head'),title=el('div');title.append(el('h2','Influenciadores'),el('p',all.length+' perfis · '+all.filter(p=>p.partnerApproved&&p.active).length+' parcerias liberadas','pb-note'));header.append(title);
   if(!document.body.classList.contains('partners-page')){const link=el('a','Abrir painel completo ↗','pb-copy');link.href='/partners';header.append(link);}host.append(header);
   const totals=el('div',undefined,'pb-totals');for(const [label,key,currency] of [['Cliques','clicks'],['Vendas','sales'],['Receita bruta','gross',true],['Líquido confirmado','net',true],['Comissão gerada','earnings',true],['Marca após comissão','brandNet',true]]){const n=all.reduce((n,p)=>n+(p[key]||0),0),item=el('div');item.append(el('span',label),el('b',currency?money(n):n));totals.append(item);}host.append(totals);
   const search=el('input');search.type='search';search.placeholder='Buscar influencer pelo @';search.setAttribute('aria-label','Buscar influencer');search.value=filter;search.className='pb-search';const cards=el('div',undefined,'pb-grid');host.append(search,cards);
   const draw=()=>drawCards(all.filter(p=>(p.name+' '+(p.instagram||'')).toLowerCase().includes(filter)),cards);search.oninput=()=>{filter=search.value.toLowerCase();draw();};draw();
   host.append(el('p','Visitantes estimados por navegador. Receita e comissão excluem reembolsos. Valores líquidos vêm do pagamento, sem estimativa de taxas. Comissão gerada não significa transferência realizada.','pb-note'));
  }catch(e){if(rev===revision)host.replaceChildren(el('h2','Influenciadores'),el('p',e.message));}
 };
 if(typeof D!=='undefined'&&D)window.renderCreators();
})();
