---
name: skill-audit
description: Audita as skills e plugins instalados contra os projetos reais do usuário e devolve o que falta, o que sobra e o que se sobrepõe — sempre parando antes de instalar. Use quando o usuário pedir "auditar minhas skills", "o que vale instalar", "tenho plugin demais?", "/skill-audit", ou quando avaliar um plugin/skill candidato antes de instalar.
---

# Skill Audit

Auditoria de skills e plugins. Produz uma recomendação, **nunca** uma instalação.

## Regra inegociável

Esta skill não instala, não remove e não habilita nada. Ela termina em uma
recomendação escrita. Instalar é sempre um passo separado, com o usuário
aprovando cada item pelo nome. Se o usuário pedir para instalar tudo de uma
vez, ainda assim liste primeiro e peça a confirmação.

O motivo: skill e plugin carregam hooks (`SessionStart`, `PreToolUse`), que
são comandos de terceiro executando automaticamente na máquina do usuário.
Instalar sem revisar é conceder execução arbitrária.

## Coleta

Rode estes comandos antes de opinar. Sem eles a auditoria é chute.

```bash
# O que já está instalado
claude plugin list

# Peso real em disco (skills instaladas somam custo de contexto por sessão)
find ~/.claude/plugins ~/.claude/skills -name "SKILL.md" | wc -l

# Hooks ativos — o que roda automaticamente
cat ~/.claude/settings.json 2>/dev/null | python3 -m json.tool | grep -A 3 -i hook

# Projetos reais do usuário, e quais têm código de fato
ls -d ~/Developer/*/ ~/Documents/*/ 2>/dev/null
find ~/Developer ~/Documents -maxdepth 2 -name ".git" -type d 2>/dev/null
```

Para detectar a stack de cada projeto com código, procure os marcadores:
`package.json`, `Package.swift`, `requirements.txt`, `pyproject.toml`,
`Cargo.toml`, `go.mod`, `Gemfile`, `composer.json`.

## Avaliando um candidato

Quando houver um plugin ou skill específico em jogo, verifique na fonte, não
na descrição de quem indicou. Use a API do GitHub, que não mente:

```bash
curl -s "https://api.github.com/repos/OWNER/REPO" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(d['stargazers_count'],'estrelas |',d['pushed_at'][:10],'| arquivado:',d['archived'])"

# Quanto ele pesa de verdade
curl -s "https://api.github.com/repos/OWNER/REPO/git/trees/main?recursive=1" | python3 -c "
import sys,json; t=json.load(sys.stdin)['tree']
print(len([f for f in t if f['path'].endswith('SKILL.md')]),'SKILL.md |',
      len([f for f in t if 'hooks' in f['path']]),'arquivos de hook')"

# O que os hooks realmente executam
curl -s "https://raw.githubusercontent.com/OWNER/REPO/main/hooks/hooks.json"
```

## Critérios de decisão

Aplique nesta ordem e pare no primeiro que decidir:

1. **Já instalado?** Então não é candidato. Diga a versão e siga.
2. **Sobrepõe algo instalado?** Nomeie o que sobrepõe e diga o que o candidato
   faz de exclusivo. Se não houver nada exclusivo, é não.
3. **Funciona sozinho?** Plugin que só é casca para um binário ausente não
   entrega nada instalado sozinho. É não até o binário existir.
4. **Quanto custa por sessão?** Conte SKILL.md e hooks. Hook em `SessionStart`
   custa em toda sessão; hook em `PreToolUse` custa em toda chamada de
   ferramenta. Um plugin com centenas de skills infla o contexto mesmo sem uso.
5. **Casa com projeto real?** Recomende contra a stack que existe na máquina,
   não contra a que seria legal existir.
6. **Risco.** Proxy que intercepta tráfego de API, hook que roda em toda
   chamada, código não versionado: diga o risco em uma frase e deixe a decisão
   com o usuário.

Popularidade não é critério. Um repo com muitas estrelas ainda pode não caber
no setup do usuário — o número mede atenção, não adequação.

## Saída

Uma tabela com uma linha por item: nome, status (instalado / candidato),
veredito (sim / não / condicional), e o motivo em uma linha. Depois disso, os
vereditos que precisam de explicação, um parágrafo cada.

Termine nomeando o que precisa de decisão do usuário. Não instale.
