/* Original product stickers. Positions hand-set outside the people in each photo. */
window.SL_EXAMPLES = (() => {
  const photo = name => `/media/cv1110/acervo/t/${name}.webp`; // 400px copies: these scenes show small
  const item = (name, zones, ink = 'light') => ({photo:photo(name),zones,ink});
  const book=item('6e730bc462bb5c7eaffd0ff571e50d9a',[[53,65,40,17,-3],[50,72,44,12,2],[55,58,38,17,-2]],'dark');
  const gym=item('218ad8c2e841ad21abc6706f6c832469',[[9,3,80,18,-3],[30,9,62,17,2],[8,14,65,13,-2]]);
  const bench=item('ae1216919649964d4b56574ef9d43f59',[[7,7,72,17,-3],[7,26,48,16,2],[10,35,42,14,-2]]);
  const paddle=item('c6b6b66c31697d771696b74a40fa9a52',[[8,7,80,18,-3],[39,26,53,15,2],[9,32,58,13,-2]]);
  const breakfast=item('28e39d10fd3e384a70a03edf3232ec0b',[[8,3,82,16,-2],[24,13,68,15,2]],'dark');
  const couple=item('c5996e2e195411cdaf10e868625b6f1d',[[9,6,80,18,-2],[10,22,60,14,2],[30,5,62,16,0]],'dark');
  return {
    labels:{praia:'Praia',treino:'Treino',bomdia:'Bom dia',cafe:'Café',date:'A dois'},
    hero:{praia:paddle,treino:gym,bomdia:book},
    gallery:{
      treino:[bench,gym],
      praia:[item('f4d39f83043022eb669fe31abbf8240b',[[10,8,78,18,-3],[34,26,58,15,2]]),paddle,item('9eca2b0318a3294a6d0107335aeb364c',[[12,4,76,17,-2],[39,13,53,13,2]])],
      bomdia:[item('75acd501bfd8a5374dcc39570610aac3',[[10,3,80,15,-2],[28,10,62,14,2]],'dark'),item('1fef7bbe9edc50f7e1f0d5df54da02a6',[[12,4,75,18,-3],[36,12,55,13,2]],'dark'),book],
      cafe:[breakfast,book],
      date:[couple,item('477da72440e52aad032935457ecb1757',[[10,5,80,17,-2],[27,15,63,14,2]],'dark'),item('2e67452cb55c646cad93e87c24b77a57',[[8,3,80,17,-2],[32,8,60,15,2]],'dark')]
    },
    final:[{key:'date',...couple},{key:'praia',...paddle},{key:'treino',...gym}],
    sticker:(key,n) => ({src:`/img/cv1110/stickers/${key}-${n}.webp`,animated:false}),
    animated:key => ({src:`/img/cv1110/stickers/${key}-animada.webp`,animated:true})
  };
})();
