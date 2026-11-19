# Máquina de Conteúdo

Do vídeo cru ao post: acha os cortes, edita com legenda, trilha e efeitos, gera criativos e vídeos animados.
Vem com toda a base de conhecimento (regras, memórias, skills, acervo de estilos e músicas). Ela aprende o seu
estilo a cada correção, numa camada só sua que nunca apaga a base.

## Instalar (Mac)

Abra o Terminal e cole:

```bash
git clone https://github.com/heavenly-destiny/maquina-conteudo.git ~/Movies/maquina-conteudo && ~/Movies/maquina-conteudo/instalar.sh
```

Leva uns 15 minutos na primeira vez (baixa o modelo de transcrição). No fim o painel abre sozinho e pede:

1. Seu Claude (assinatura Pro/Max ou chave de API)
2. Sua chave da ElevenLabs (voz)
3. Quem você é: nome, nicho, @ e estilo

Depois é só abrir pelo atalho **Máquina** na Mesa.

## Atualizar

```bash
~/Movies/maquina-conteudo/atualizar.sh
```

Traz a versão nova e a base de conhecimento nova. O que é seu (perfil, correções, chaves, vídeos) fica intacto.

## Onde fica cada coisa

- `cerebro/`: a base de conhecimento. Não edite, ela é atualizada pelo `atualizar.sh`.
- `perfil/`: a sua camada. Seu perfil e tudo que você corrigiu (`CORRECOES.md`). Só neste Mac.
- `maquina/.env`: suas chaves. Só neste Mac.
