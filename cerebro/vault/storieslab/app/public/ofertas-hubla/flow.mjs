export const products = [
  {key:'personalizadas', name:'Figurinhas com a sua marca', price:19.90, special:14.99, offer:'NZEH050hceJ42na0Ydcn', ds:'4qgsCeyQmn4DrOWTpnVr', feature:'personalizadas', eyebrow:'Sua identidade nos Stories', description:'Nome, cores e estilo da sua marca em um pacote personalizado.', points:['Mais de 50 figurinhas personalizadas','Briefing enviado pelo aplicativo','Produção em até 24h após o briefing completo']},
  {key:'kit', name:'Kit Influencer Pro', price:12.90, special:9, offer:'q5hPWomBXJF0zR8yATYS', ds:'XqXxZOfWNvBm23a3I59R', feature:'kit', eyebrow:'Mais recursos para criar', description:'Agenda de conteúdo e Presets Pro, com os recursos de Animadas e Magnéticos.', points:['Ideias para organizar seus próximos posts','Looks para editar suas fotos no app','Se comprar o Kit, pulamos as ofertas individuais']},
  {key:'presets', name:'Presets Pro', price:9.90, special:9, offer:'0a4F7lds0kppZCeIxiZh', ds:'qWWJQSqgCTx5pfkSLVzI', feature:'presets', eyebrow:'Seu olhar, seu estilo', description:'Escolha um look e aplique nas suas fotos dentro do aplicativo.', points:['Prévia para comparar os looks','Filtros aplicados no próprio Stories Lab','Compra separada, sem mensalidade']},
  {key:'agenda', name:'Agenda de Conteúdo', price:9.90, special:9, offer:'AkhU0WtAD1m4BvoIY55i', ds:'fUNf1mfDJUYRiwvqvS3I', feature:'agenda', eyebrow:'Ideias para sair do branco', description:'30 dias de ideias para planejar seu conteúdo com mais facilidade.', points:['Ideias organizadas no aplicativo','Planejamento para os próximos Stories','Compra separada, sem mensalidade']},
];
export function owns(p, features=[]) {
  return p.key==='kit' ? ['agenda','presets','animadas'].every(x=>features.includes(x)) : features.includes(p.feature);
}
export function stage(step='personalizadas', special=false, features=[]) {
  const start=products.findIndex(p=>p.key===step);
  if(step==='done'||start<0)return null;
  for(let i=start;i<products.length;i++)if(!owns(products[i],features))return {product:products[i],special:i===start&&special};
  return null;
}
export function decline(current, features=[]) {
  if(!current.special)return {step:current.product.key,special:true};
  const i=products.indexOf(current.product);
  const next=stage(products[i+1]?.key||'done',false,features);
  return {step:next?.product.key||'done',special:false};
}
export function afterPurchase(key) {
  if(key==='kit'||key==='agenda')return 'done';
  return key==='personalizadas'?'kit':'agenda';
}
// Pattern observed in Hubla's own link generator; never opens/charges during QA.
export function buyUrl(current, attribution={}) {
  const p=current.product, offer=current.special?p.ds:p.offer, cents=Math.round((current.special?p.special:p.price)*100);
  const u=new URL(`https://pay.hub.la/${offer}/upsell`);
  u.searchParams.set('plan',`${offer}_one_time_${cents}_BRL`);
  for(const [k,v] of Object.entries({utm_source:'hubla',utm_medium:'pos_compra',utm_campaign:'ascensao',utm_content:p.key,utm_term:current.special?'downsell':'upsell'}))u.searchParams.set(k,v);
  for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src'])if(attribution[k])u.searchParams.set(k,String(attribution[k]).slice(0,200));
  u.searchParams.set('sl_stage',current.special?'downsell':'upsell');
  u.searchParams.set('sl_product',p.key);
  return u.href;
}
