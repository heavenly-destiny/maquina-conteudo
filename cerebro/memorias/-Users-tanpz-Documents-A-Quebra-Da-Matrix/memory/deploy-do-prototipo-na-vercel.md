---
name: deploy-do-prototipo-na-vercel
description: "URL, projeto e receita do deploy do protótipo na Vercel, criado em 14/08/2026"
metadata: 
  node_type: memory
  type: reference
  originSessionId: c7f23ab2-3514-4be3-903c-82f102c194c3
  modified: 2026-08-17T21:06:29.923Z
---

Criado em **14/08/2026** para o Iuri/dev abrirem o protótipo sem depender do link do artifact.

- **URL pública:** https://a-quebra-da-matrix.vercel.app (produção, sem login, `noindex`)
- **Projeto Vercel:** `heavenly-destinys-projects/a-quebra-da-matrix`
- **Pasta de deploy:** `90 - Assets/prototipo/publicar/` (contém só `index.html` e o `.vercel/`)
- **Fonte:** `90 - Assets/prototipo/a-quebra-da-matrix.html` — continua sendo o único arquivo
  que se edita. O `index.html` da pasta `publicar/` é gerado a partir dele, nunca editado à mão.

O empacotamento existe porque o artifact injeta `<!doctype>`, `<head>` e um reset de CSS que a
Vercel não injeta. Ao gerar o `index.html`: separar o arquivo no primeiro `<div class="bar">`,
jogar o que vem antes no `<head>`, e prefixar `<!doctype html>`, `<html lang="pt-BR">`,
`<meta charset="utf-8">` (sem isso os acentos quebram), viewport, `<meta name="robots"
content="noindex">` e `*,*::before,*::after{box-sizing:border-box}body{margin:0}`.

O CLI não instala global nesta máquina (o sistema barra o `npm i -g`). Usar `npx vercel@latest`.
Deploy, de dentro de `publicar/`:
`npx --yes vercel@latest deploy --prod --yes --scope heavenly-destinys-projects`.
O `--scope` é obrigatório: sem ele o deploy morre com `"Not authorized"` mesmo com o `whoami`
respondendo `heavenly-destiny` (confirmado em 17/08/2026).

Só subir quando pedido — ver [[entrega-artifact-aqui-deploy-so-quando-pedir]].
