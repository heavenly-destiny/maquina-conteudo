# Forja no Claude

Esta pasta é a Forja: uma máquina de conteúdo (cortes de vídeo cru, vídeos animados, criativos de anúncio, roteiros, modelagem de virais).
Quem abre o Claude aqui pode usar tudo direto na conversa, sem o painel. O painel (atalho Forja, http://127.0.0.1:4747) faz o mesmo e mostra o resultado em Criados.

Responda em português do Brasil, direto e curto. Tudo que você criar vai para as mesmas pastas do painel, então aparece lá também.

## Regra de ouro
Nunca trabalhe de memória. Cada pedido tem um prompt pronto, com as regras, o perfil de quem usa e a etapa. Gere o prompt com `maquina/forja.py`, leia inteiro e siga como se fosse a instrução do usuário. Onde o prompt fala "painel", "tanpz aprova no painel" ou "non-interactive run", entenda: é esta conversa. Mostre aqui e espere a resposta. Siga o prompt inteiro, inclusive o passo zero (ler a base de conhecimento e escrever `conhecimento-usado.md`) e a checagem final, mesmo num pedido pequeno: é isso que faz o resultado sair no padrão.

## O que a pessoa pede e o que você roda

| Pedido | Comando |
|---|---|
| Roteiro ("faz um roteiro sobre X") | `python3 maquina/forja.py gerar roteiro "briefing"` |
| Vídeo animado com voz | `python3 maquina/forja.py gerar animado "briefing" [--duracao 30]` |
| Criativo de anúncio | `python3 maquina/forja.py gerar criativo "briefing"` |
| Modelar um viral pra marca dela | 1. `python3 maquina/forja.py decupar URL fiel` 2. `python3 maquina/forja.py gerar modelar "briefing" --inspiracao ID` |
| Só analisar/decupar uma referência | `python3 maquina/forja.py decupar URL [rapida\|completa\|fiel]` |
| Cortes de um vídeo cru (dela falando) | `python3 maquina/maquina.py novo CAMINHO_DO_VIDEO`, mostrar os cortes que ele achou, ela escolhe, `python3 maquina/maquina.py editar JOB N [N...]`, depois `python3 maquina/maquina.py legendas JOB` |
| Refazer um corte com uma nota | `python3 maquina/maquina.py refazer JOB N "nota"` |

`forja.py gerar` cria a pasta em `geracoes/<ID>/` e imprime o prompt. Trabalhe dentro dessa pasta.

## Fluxo de vídeo com voz (animado, criativo, modelar)
1. `forja.py gerar ...` e siga o prompt até a copy (`roteiro.md`, `roteiro.json`, `emotion-map.json`). Pare aí.
2. Mostre a copy completa aqui (gancho, falas, texto na tela, legenda) e espere ela aprovar ou pedir mudança. Ajuste e mostre de novo até ela aprovar.
3. Aprovou: `python3 maquina/forja.py aprovar ID` e siga o novo prompt (voz, música, efeitos, render).
4. No fim: `python3 maquina/forja.py pronto ID`, abra o `final.mp4` e diga o caminho completo.

Roteiro sem vídeo: siga o prompt e termine com `forja.py pronto ID`.

## Antes de criar qualquer coisa: as configurações
O painel pergunta antes de gerar. Aqui, pergunte numa mensagem só o que ela não disse: duração, formato (9:16 padrão), estilo de legenda e trilha (com música ou sem). Se ela disser "tanto faz", use o padrão do prompt.

## Ferramentas (já estão no PATH dos comandos da Forja)
- `maquina/bin/voz "texto" saida.mp3 [voz]` e `maquina/bin/som sfx|musica ...`: ElevenLabs (chave em `maquina/.env`).
- `npx hyperframes`: render dos vídeos animados (HTML vira vídeo).
- `ffmpeg`, `whisper-cli`, `yt-dlp`: corte, transcrição, download de referência.
- Skills instaladas no Claude: hyperframes, motion-reel-premium, reverse-any-video, gsap e as outras de `cerebro/skills/`. Use pela ferramenta Skill.

## Onde fica cada coisa
- `perfil/`: quem é a pessoa e tudo que ela já corrigiu (`CORRECOES.md`). Ler sempre. Correção nova que ela fizer aqui na conversa: acrescente uma linha em `perfil/CORRECOES.md` com a data, para valer nos próximos vídeos (no painel e aqui).
- `cerebro/`: a base de conhecimento. Só leitura, nunca edite (é substituída quando a Forja se atualiza).
- `estilos/`: acervo de estilos, formatos e músicas. `inspiracoes/`: referências decupadas. `geracoes/`: o que foi criado. `jobs/`: cortes.
- `maquina/.env`: chaves dela. Nunca mostre o conteúdo.

## Quando usar o painel em vez da conversa
Para produzir vários vídeos seguidos, o painel é mais rápido: roda em segundo plano e em paralelo. A conversa é melhor para lapidar um vídeo, testar uma ideia ou fazer algo fora do padrão.
