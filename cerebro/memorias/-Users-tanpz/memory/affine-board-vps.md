---
name: affine-board-vps
description: "AFFiNE (alternativa Notion/Miro) auto-hospedado na mesma VPS do Koncord, atrás do Caddy que já existia — Coolify foi descartado de propósito."
metadata: 
  node_type: memory
  type: project
  originSessionId: c9ccf014-a7d7-44e8-b499-df8d74e6b38b
  modified: 2026-09-11T03:35:43.577Z
---

AFFiNE 0.27.4 self-hosted rodando na VPS da Hostinger `147.93.32.245` (alias SSH
`concord`), a mesma do [[projeto-concord]]. No ar em **https://notas.koncord.pro** desde 2026-09-11 (o endereco antigo em sslip.io
virou redirecionamento permanente). O registro A `notas` foi criado no hPanel da Hostinger.

**Por que não Coolify.** A VPS já usa as portas 80 e 443 no `stoat-caddy-1`. O Coolify
sobe o proxy dele nas mesmas portas e derrubaria o Koncord, que tem ~15 pessoas usando.
Então o AFFiNE subiu direto por `docker compose` em `/root/affine/compose.yml`, sem
publicar porta nenhuma no host.

**Como está ligado:** os containers `affine_server`, `affine_postgres` e `affine_redis`
ficam na rede própria; só o `affine_server` também entra na rede externa `stoat_default`,
que é por onde o Caddy fala com ele. O Caddyfile em `/root/stoat/Caddyfile` ganhou um
bloco novo no fim apontando pro `http://affine_server:3010`. Backup antes de mexer:
`/root/stoat/Caddyfile.bak-antes-affine-20260911-0332`.

**Domínio.** A VPS serve `koncord.pro` (variável `HOSTNAME` do container do Caddy).
O sslip.io foi escolhido porque resolve sozinho pro IP e não exigiu tocar em DNS —
trocar para `board.koncord.pro` é só criar o registro A e editar o bloco do Caddy.

**Custo de recurso:** AFFiNE + Postgres + Redis somam pouco. Depois de subir, a máquina
seguiu com 5,4 GB livres de 7,8 GB e load abaixo de 0,4 em 2 vCPU.

**Pendente:** a conta de admin do AFFiNE é criada no primeiro acesso pela tela dele,
e quem cria é o tanpz — eu não crio conta nem digito senha.
