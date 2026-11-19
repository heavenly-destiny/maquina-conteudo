// "O que postar hoje?" (IDEIAS-CADERNO step 3, v1 without AI): 3 Story ideas a day = one for the weekday + two for her
// profile (sl_profile), each with a 3-step script and stickers whose printed text has the idea's word (ocr/_words.json).
// The "Quero roteiros com IA" button only counts interest (ev 'ai_wait') to decide whether the AI scriptwriter is worth it.
// w = words to look for on the stickers (first one found wins), s = the 3 steps.
window.POST_IDEAS = {
  dia: [
    {t: 'Domingo de descanso', s: ['Foto do seu momento calmo (café, sofá, sol)', 'Conte o que você fez de bom no fim de semana', 'Pergunte: “e o seu domingo?”'], w: ['domingo', 'descanso']},
    {t: 'Segunda com energia', s: ['Selfie ou foto do começo do dia', 'Escreva sua meta da semana', 'Caixinha: “qual a sua meta?”'], w: ['segunda', 'semana']},
    {t: 'Terça de rotina', s: ['Mostre um pedaço real da sua rotina', 'Uma dica rápida que te ajuda no dia', 'Enquete: “você também faz assim?”'], w: ['rotina', 'terca']},
    {t: 'Quarta: metade da semana', s: ['Como está sua semana até aqui?', 'Algo bom que já aconteceu', 'Enquete de emoji pra galera responder'], w: ['quarta', 'semana']},
    {t: 'Quinta de bastidores', s: ['Bastidor do seu trabalho ou da sua casa', 'Conte algo que pouca gente sabe', 'Caixinha de perguntas aberta'], w: ['quinta', 'bastidores']},
    {t: 'Sextou!', s: ['Foto ou vídeo do seu clima de sexta', 'Seus planos pro fim de semana', 'Enquete: “sair ou ficar em casa?”'], w: ['sextou', 'sexta']},
    {t: 'Sábado do seu jeito', s: ['Mostre o seu sábado como ele é', 'Um lugar, comida ou passeio que você ama', 'Pergunte a recomendação delas'], w: ['sabado', 'final']}
  ],
  rotina: [
    {t: 'Bom dia com café', s: ['Foto do seu café da manhã', 'Uma frase pra começar o dia', 'Figurinha de bom dia por cima'], w: ['cafe', 'bom']},
    {t: 'Frase do dia', s: ['Fundo liso ou foto sua', 'Uma frase que tem a ver com o seu momento', 'Pergunte se elas concordam'], w: ['frase', 'vida']},
    {t: 'Checklist do dia', s: ['Liste 3 coisas que você vai fazer hoje', 'Atualize à noite marcando o que fez', 'Comemore o que deu certo'], w: ['checklist', 'hoje']},
    {t: 'Gratidão', s: ['Foto de algo simples que te fez bem', 'Escreva por que você é grata hoje', 'Convide a contar o delas'], w: ['gratidao', 'grata']}
  ],
  beleza: [
    {t: 'Skincare do dia', s: ['Vídeo rápido da sua rotina de pele', 'Nome dos passos (sem precisar de marca)', 'Enquete: “manhã ou noite?”'], w: ['skincare', 'pele']},
    {t: 'Antes e depois', s: ['Foto do antes', 'Foto do depois', 'Conte o que fez de diferente'], w: ['antes', 'depois']},
    {t: 'Agenda aberta', s: ['Mostre seus horários livres', 'Um trabalho que você fez essa semana', 'Chame pra agendar no direct'], w: ['agenda', 'horario']},
    {t: 'Autocuidado', s: ['Seu momento de cuidar de você', 'Uma dica simples pra elas', 'Pergunte: “qual o seu ritual?”'], w: ['autocuidado', 'cuidar']}
  ],
  moda: [
    {t: 'Look do dia', s: ['Foto do look no espelho', 'Onde você vai com ele', 'Enquete: “usaria?”'], w: ['look', 'estilo']},
    {t: 'Novidade na loja', s: ['Mostre a peça nova chegando', 'Detalhes: tecido, cores, tamanhos', 'Chame pro direct com “eu quero”'], w: ['novidade', 'chegou']},
    {t: 'Promoção', s: ['Foto da peça em destaque', 'Preço ou condição especial', 'Prazo: “só até amanhã”'], w: ['promo', 'oferta']},
    {t: 'Pedido saindo', s: ['Foto da embalagem pronta', 'Agradeça a cliente (sem expor o nome)', 'Mostre como pedir'], w: ['pedido', 'enviado']}
  ],
  negocios: [
    {t: 'Agenda da semana', s: ['Mostre seus horários livres', 'Destaque o serviço mais procurado', 'Chame pra agendar no direct'], w: ['agenda', 'horario']},
    {t: 'Bastidor do trabalho', s: ['Vídeo curto preparando o atendimento', 'Conte um cuidado que você tem', 'Pergunte se elas sabiam disso'], w: ['atendimento', 'trabalho']},
    {t: 'Feedback de cliente', s: ['Print de um elogio (esconda o nome)', 'Agradeça', 'Convide quem ainda não conhece'], w: ['feedback', 'cliente']},
    {t: 'Dúvida frequente', s: ['Escreva a pergunta que mais te fazem', 'Responda em 2 ou 3 frases', 'Caixinha pra novas dúvidas'], w: ['duvida', 'pergunta']}
  ],
  fitness: [
    {t: 'Treino pago', s: ['Foto ou vídeo do treino', 'Qual treino foi hoje', 'Figurinha de treino pago'], w: ['pago', 'treino']},
    {t: 'Pós-treino', s: ['Selfie suada com sorriso', 'O que você comeu depois', 'Enquete: “treina de manhã ou à noite?”'], w: ['treino', 'foco']},
    {t: 'Meta da semana', s: ['Escreva quantos treinos quer fazer', 'Marque cada dia que cumprir', 'Chame alguém pra treinar junto'], w: ['meta', 'disciplina']},
    {t: 'Água e cuidado', s: ['Foto da sua garrafinha', 'Quantos litros hoje?', 'Lembrete pra elas beberem água'], w: ['agua', 'beber']}
  ],
  familia: [
    {t: 'Momento em família', s: ['Foto de um momento simples juntos', 'O que vocês fizeram', 'Uma frase de carinho'], w: ['familia', 'amor']},
    {t: 'Rotina de mãe', s: ['Mostre um pedaço real do seu dia', 'Uma dica que te salva', 'Pergunte a dica delas'], w: ['mae', 'filho']},
    {t: 'Casa em ordem', s: ['Antes e depois de um cantinho', 'O que mais deu trabalho', 'Enquete: “você também ama casa arrumada?”'], w: ['faxina', 'casa']},
    {t: 'Lembrança boa', s: ['Uma foto antiga especial', 'A história por trás dela', 'Convide a contar uma delas'], w: ['saudade', 'memoria']}
  ],
  comida: [
    {t: 'Receita rápida', s: ['Foto dos ingredientes', 'Vídeo do passo mais bonito', 'Prato pronto com figurinha'], w: ['receita', 'cozinha']},
    {t: 'Café da tarde', s: ['Foto da mesa ou da xícara', 'O que tem hoje', 'Pergunte o preferido delas'], w: ['cafe', 'tarde']},
    {t: 'Cardápio do dia', s: ['Mostre o que vai ter hoje', 'Preço ou como pedir', 'Chame pro direct'], w: ['cardapio', 'pedido']},
    {t: 'Doce do dia', s: ['Close bem bonito do doce', 'Conte o sabor', 'Enquete: “qual sabor faço amanhã?”'], w: ['doce', 'chocolate']}
  ],
  fe: [
    {t: 'Versículo do dia', s: ['Fundo calmo ou foto sua', 'Um versículo que te tocou', 'Por que ele fala com você hoje'], w: ['deus', 'senhor']},
    {t: 'Oração da manhã', s: ['Foto do seu cantinho de oração', 'Uma frase de oração curta', 'Pergunte se elas querem oração'], w: ['oracao', 'deus']},
    {t: 'Gratidão a Deus', s: ['Foto de algo que você agradece', 'Escreva o porquê', 'Convide a agradecer também'], w: ['gratidao', 'deus']},
    {t: 'Louvor do dia', s: ['Coloque a música que está ouvindo', 'Uma frase dela', 'Pergunte o louvor favorito delas'], w: ['louvor', 'deus']}
  ]
};
