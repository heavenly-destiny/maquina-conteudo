(() => {
  const edits=[
    {id:'treino',title:'Treino dark',desc:'Contraste, presença e motivação para a sua rotina de treino.',photo:'ref-dark-cinema-02',looks:['17-dark-cinema'],cats:['academia-e-treino','treino'],tone:'dark'},
    {id:'praia',title:'Praia clean',desc:'Azul do mar, luz dourada e figurinhas para os dias de sol.',photo:'ref-ocean-02',looks:['19-ocean','15-bronze','20-summer-pop'],cats:['ferias-e-viagem','moda-praia'],tone:'ocean'},
    {id:'rotina',title:'Rotina leve',desc:'Luz suave e pequenos detalhes para contar o seu dia.',photo:'ref-soft-film-02',looks:['13-soft-film','16-soft-clean'],cats:['bom-dia','cafe'],tone:'sand'},
    {id:'editorial',title:'Mood editorial',desc:'Cores contidas e referências de moda para um visual marcante.',photo:'ref-editorial-02',looks:['14-editorial','18-steel'],cats:['look-do-dia','frases'],tone:'plum'}
  ];
  let catalog,request=0;
  function home(){
    const host=document.querySelector('#styleEdits');if(!host)return;
    host.innerHTML=`<div class="edit-heading"><div><h2>Explore por estilo</h2></div></div><div class="edit-rail">${edits.map(e=>`<a class="edit-card" href="#estilos/${e.id}" data-tone="${e.tone}"><img src="img/presets/antes/${e.photo}.webp" alt="" loading="lazy" width="300" height="380"><span><b>${e.title}</b></span></a>`).join('')}</div>`;
  }
  function route(h){
    if(!h.startsWith('#estilos/')){request++;return false;}
    const edit=edits.find(x=>h==='#estilos/'+x.id);if(!edit)return false;
    const token=++request,box=document.querySelector('#mat');
    view('mat');
    const heading=`<div class="vh"><a class="iconbtn" href="#" aria-label="Voltar ao início">${icon('i-back')}</a><div><h1>${edit.title}</h1></div></div>`;
    box.innerHTML=heading+'<div class="edit-loading" role="status">Preparando sua seleção…</div>';
    (catalog||=fetch('preset-gallery.json?v=theme-1').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).catch(e=>{catalog=null;throw e;})).then(data=>{
      if(token!==request||location.hash!==h)return;
      const looks=edit.looks.map(id=>data.looks.find(l=>l.id===id)).filter(Boolean),cats=edit.cats.map(s=>BY[s]).filter(Boolean);
      box.innerHTML=heading+`<section class="edit-intro" data-tone="${edit.tone}"><img src="img/presets/antes/${edit.photo}.webp" alt="Referência de ${edit.title}" width="300" height="380"><div><h2>Filtros +<br>figurinhas</h2><a class="btn sm" href="#/m/presets/editor/${looks[0].id}">Editar minha foto ${icon('i-arrow')}</a></div></section><section class="edit-section"><div class="edit-heading"><h2>Filtros</h2><span>${looks.length} ${looks.length===1?'look':'looks'}</span></div><div class="edit-look-grid">${looks.map(l=>`<a href="#/m/presets/${l.id}"><img src="img/presets/depois/${l.id}/${l.photo}.webp" alt="Prévia ${esc(l.name)}" width="300" height="380" loading="lazy"><b>${esc(l.name)}</b><small>Comparar ↗</small></a>`).join('')}</div></section><section class="edit-section"><div class="edit-heading"><h2>Figurinhas</h2></div><div class="grid edit-categories">${cats.map(card).join('')}</div></section>`;
      box.querySelector('.edit-categories').addEventListener('click',onCardClick);
    }).catch(()=>{if(token===request&&location.hash===h){box.innerHTML=heading+'<div class="emptyb"><p>Não foi possível carregar sua seleção.</p><button class="btn sm" id="retrySelection" type="button">Tentar novamente</button></div>';box.querySelector('#retrySelection').onclick=()=>route(h);}});
    return true;
  }
  window.PremiumUI={route,home};
  const originalInit=init;
  window.init=data=>{originalInit(data);home();};
  if(S.booted){home();if(location.hash.startsWith('#estilos/'))route(location.hash);}
})();
