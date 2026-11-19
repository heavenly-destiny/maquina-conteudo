# Forja

Do vídeo cru ao post: acha os cortes, edita com legenda, trilha e efeitos, gera criativos e vídeos animados.
Vem com toda a base de conhecimento (regras, memórias, skills, acervo de estilos e músicas). Ela aprende o seu
estilo a cada correção, numa camada só sua que nunca apaga a base.

## Instalar no Mac

Abra o Terminal e cole:

```bash
git clone https://github.com/heavenly-destiny/maquina-conteudo.git ~/Movies/maquina-conteudo && ~/Movies/maquina-conteudo/instalar.sh
```

Leva uns 15 minutos na primeira vez (baixa o modelo de transcrição). No fim o painel abre sozinho e pede:

1. Seu Claude (assinatura Pro/Max ou chave de API)
2. Sua chave da ElevenLabs (voz)
3. Quem você é: nome, nicho, @ e estilo

Depois é só clicar no atalho **Forja** na Mesa quando quiser usar. Ela liga, abre no navegador e roda no seu computador (http://127.0.0.1:4747).

## Instalar no Windows

1. No GitHub, **Code > Download ZIP** e descompacte.
2. Clique com o botão direito em `instalar.ps1` > **Executar com o PowerShell**.

Ele instala tudo sozinho (Git, Python, Node, FFmpeg, transcrição, Claude Code, voz) e põe o atalho **Forja** na Área de Trabalho. Na primeira vez o Git abre o login do GitHub no navegador.

## Atualizar

Não precisa fazer nada. Enquanto está aberta, a Forja confere a versão nova a cada 3 horas e se atualiza sozinha (código e base de conhecimento). O que é seu (perfil, correções, chaves, vídeos) fica intacto.

## Onde fica cada coisa

- `cerebro/`: a base de conhecimento. Não edite, ela é atualizada pelo `atualizar.sh`.
- `perfil/`: a sua camada. Seu perfil e tudo que você corrigiu (`CORRECOES.md`). Só neste computador.
- `maquina/.env`: suas chaves. Só neste computador.
