---
name: projeto-concord
description: "Concord — alternativa própria ao Discord, no ar em concordchat.duckdns.org, criada depois que a ANPD bloqueou vídeo/tela do Discord no Brasil."
metadata: 
  node_type: memory
  type: project
  originSessionId: 15e19be1-1f75-46e5-bd78-f7cb9ee5f094
  modified: 2026-08-24T02:55:53.311Z
---

Projeto **Concord** em `~/Developer/concord`, branch `implantacao-inicial`.
**No ar** em https://concordchat.duckdns.org desde 2026-08-23.

**Por quê:** em 12/08/2026 a ANPD aplicou medida preventiva e o Discord suspendeu,
em 17/08/2026, câmera, compartilhamento de tela e Go Live no Brasil. Base legal:
ECA Digital, Lei nº 15.211/2025. tanpz e ~15 amigos decidiram sair.

**O que é:** instância auto-hospedada do **Stoat** (ex-Revolt), não um clone escrito
do zero. Servidor `147.93.32.245`, alias SSH `concord`, acesso só por chave.

**Infra:** Hostinger VPS KVM 2 (2 vCPU / 8 GB / 96 GB / 8 TB), São Paulo, 28 ms.
R$ 70,99/mês, plano **mensal** — escolhido de propósito contra os 24 meses por
R$ 1.055 à vista, para validar antes de comprometer.

**A Oracle continua sendo tentada.** Um laço em `~/Developer/concord/scripts/`
tenta capturar 4 OCPU / 24 GB ARM grátis em São Paulo. Já passou de 70 tentativas
sem sucesso: a região está sem capacidade e a Oracle mascara isso como HTTP 500
`InternalError`. Se pegar, vale migrar — lá não há *steal*.

**Validado em produção:** 5 participantes em 4 redes distintas, todos por UDP,
zero falhas de ICE. LiveKit a 19% de 200%. Teto prático estimado: 8-10 câmeras
simultâneas; voz para os 15 é tranquilo.

## O que NÃO funciona, e por quê

- **Áudio de compartilhamento de tela não chega.** Bug do cliente web: ele assina
  `TR_AM`, `TR_VC` e `TR_VS`, mas nunca `TR_As`. As faixas chegam ao servidor com
  zero entregas. Exige fork do cliente.
- **60 fps e bitrate de tela** são fixados pelo cliente, não pelo servidor.
- **Desconectar alguém da voz não existe** no Stoat — só `voice_join` e
  `voice_stop_ring`. Discord tem, Stoat não.
- **YouTube está fora do bot de música**, definitivamente: bloqueia IP de
  datacenter e exige cookies de conta logada, o que é contornar detecção de bot.
  Fonte é SoundCloud. Não reabrir essa discussão.

## Bot de música (DJ)

Container `dj`. Prefixo `!` (o Stoat não tem slash commands). Comandos: `play`,
`skip`, `pause`, `voltar`, `stop`, `volume`, `fila`, `remover`, `loop`, `agora`,
`sair`. Custa ~20% de um núcleo por faixa, porque o ffmpeg decodifica de verdade.

## Pendências, em ordem

1. **Build do cliente falhou** em `pnpm --filter stoat.js build`. O fork está em
   `~/for-web` no servidor, branch `concord`, com a correção de volume já
   commitada — falta só compilar.
2. Trazer o RNNoise (commits `55152e0` e `4a1c872`) — dá conflito com a 0.14.1.
3. Áudio de tela e 60 fps, no mesmo fork.

**Não atualizar o cliente para a tag `main`:** foi tentado em 2026-08-23 e
quebrou o botão de mudo. Rollback em `~/stoat/compose.yml.antes-update`.

## Armadilhas que já custaram falha real

Documentadas em `docs/runbook/README.md`. As mais caras:

- `invite_only` mora em `[api.registration]`, não em `[features]` — no bloco
  errado é ignorado em silêncio e a instância fica aberta.
- Limites de upload usam `file_upload_size_limit` no **singular** no config, mas
  a API responde no **plural**. Copiar do nome da API não funciona, sem erro.
- `50-cloud-init.conf` da Hostinger define `PasswordAuthentication yes` e vence
  os arquivos `60` e `99` — no OpenSSH o primeiro valor ganha.
- `getUserVolume` usava `|| 1.0`: volume 0 era lido como 100%. Zero é falso em
  JavaScript. Vale procurar esse padrão antes de culpar a interface.

Relacionado: [[chamar-usuario-de-tanpz]]
