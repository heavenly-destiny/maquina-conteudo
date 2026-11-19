# Prompt para o GPT fazer os 3 carrosséis

Como usar: abra um chat novo no ChatGPT, anexe os arquivos listados em "Anexos" e cole o prompt inteiro. Um carrossel por chat dá menos erro.

Anexos:
- Os 5 slides do carrossel-01 (referência de estilo: slide-1.jpg a slide-5.jpg).
- Print do app (src/home.png).
- As fotos e as figurinhas de cada carrossel (listadas no próprio prompt).

---

Você é diretor de arte de uma marca premium de Instagram. Vai criar 3 carrosséis para o perfil do Stories Lab, um app com +24.000 figurinhas prontas para stories (copiar e colar). Público: mulheres brasileiras comuns, classe média, que postam story todo dia.

REGRA PRINCIPAL: cada carrossel é UMA imagem panorâmica de 5400x1350 px, cortada depois em 5 slides de 1080x1350 px. Os elementos (stories, fotos, linha pontilhada, brilhos) atravessam as emendas em x=1080, 2160, 3240 e 4320. Ao arrastar no Instagram, tem que parecer uma foto só. Nenhum texto pode ficar em cima de uma emenda.

Para garantir isso, monte com código (Python + Pillow) e não com geração de imagem: crie a tela 5400x1350, cole as fotos e figurinhas que eu anexei, escreva os textos e corte em 5 arquivos. Entregue os 5 JPG de cada carrossel e uma prévia da tela inteira.

IDENTIDADE (igual aos slides de referência anexados):
- Fundo #FFF7F5 com brilhos rosa bem suaves (#FFC9DA, desfoque grande) passando pelas emendas.
- Rosa da marca #FF2E74, texto #2A1630, texto de apoio #806C7B.
- Título em serifa (Fraunces, peso 600, espaçamento levemente negativo). A palavra-chave do título vai em itálico rosa (#D92B63) com marca-texto rosa claro (#FFD9E5) atrás da metade de baixo. Texto de apoio em sans (Instrument Sans ou Inter).
- Cada foto vira um "story" de verdade: cartão 380x676 com cantos de 34 px, barrinhas de progresso brancas no topo, avatar redondo + "você · 2 h", campo "Enviar mensagem" embaixo, coração. Sombra em camadas (curta e escura + longa e suave). Cartões levemente girados (-7° a +6°), alternando.
- A figurinha fica em cima da foto, grande, levemente girada, com sombra leve.
- Uma linha pontilhada rosa (traço 4 px, opacidade 55%) passa por trás de todos os stories, do slide 1 até o celular do slide 5.
- Último slide: iPhone preto com o print do app (home.png) na tela, abaixo da ilha, e botão rosa "Link na bio →" com texto branco.
- Pouco texto. Uma ideia por slide. Sem selo ou etiqueta acima do título, sem emoji no slide, sem travessão, sem gradiente colorido, sem roxo.
- Texto importante a pelo menos 80 px das bordas de cada slide.
- Nunca repetir foto ou figurinha dentro do carrossel nem entre os 3.

CARROSSEL 1 · "Uma semana de stories prontinha"
- S1: logo "stories*lab*" pequeno no topo. Título: "Uma semana / de stories / *prontinha.*" Apoio: "Uma ideia pra cada dia. Copia, cola e posta." Rodapé: "arrasta pro lado →".
- Stories nas emendas e no meio dos slides, com o dia escrito em serifa itálica rosa acima de cada um: seg. (treino), ter. (café), qua. (pet), qui. (aniversário), sex. (praia).
- S2 texto: "Cada dia, um story *diferente.*"  S3 texto: "Sem Canva. Sem Drive. *Sem esforço.*"
- S4: "É só / copiar e / *colar.*" + "A figurinha já vem pronta. Você só escolhe a do dia."
- S5: "+24.000" grande em rosa, "figurinhas num app *só.*", iPhone, botão "Link na bio".

CARROSSEL 2 · "Mesma foto. Outro story."
- Fotos: café da manhã, look no espelho, bolo caseiro (anexadas). Cada foto aparece duas vezes lado a lado: à esquerda crua, à direita com a figurinha. A emenda dos slides fica exatamente entre o "antes" e o "depois".
- Etiqueta discreta em cima de cada metade: "antes" (cinza) e "depois" (rosa).
- S1: "Mesma foto. / Outro *story.*"  S5: "Qual você postaria?" + iPhone + "Link na bio".

CARROSSEL 3 · "Tem story pronto pro seu nicho"
- 7 stories de nichos diferentes, cada um com figurinha do nicho: manicure, confeitaria, pet, academia, salão de cabelo, lojinha, maternidade.
- S1: "Tem story pronto / pro *seu* nicho."  S3 texto: "Do bom dia ao fechamento da venda."  S5: "+60 temas no app" + iPhone + "Link na bio".

Antes de entregar, confira você mesmo: abra a prévia da tela inteira, veja se as emendas batem, se algum texto ficou cortado ou em cima de emenda, e se alguma foto repetiu. Corrija e só depois me entregue.
