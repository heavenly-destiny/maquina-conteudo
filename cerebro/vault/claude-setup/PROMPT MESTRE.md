Configure this computer's Claude Code to match my main Mac. Everything comes from public GitHub repos or from my Claude account; nothing needs files from the other machine.

Rules:
- Work through the steps in order. If a step fails, note it and keep going.
- Before running any remote install script (install.sh, setup), read it first and tell me in one line what it does.
- Never overwrite ~/.claude/settings.json: back it up, then merge.
- Many of my skills come from my Claude account (step 4b). Only install those locally if they are not already available, so nothing gets duplicated.
- At the end, show me a table: item | installed / already there / failed | note.

## 0. Prerequisites
Check for git, node/npx, python3 and go. If any is missing, tell me and install it with Homebrew (macOS) or winget (Windows) after I confirm.

## 1. Marketplaces (claude plugin marketplace add <repo>)
anthropics/claude-plugins-official
bradautomates/claude-video
thedotmack/claude-mem
superultrainc/superwhisper-claude-code
JuliusBrussee/caveman
DietrichGebert/ponytail
openai/codex-plugin-cc
ayghri/i-have-adhd
leonxlnx/taste-skill
greensock/gsap-skills
mvanhorn/last30days-skill
vercel-labs/agent-browser
jarrodwatts/claude-hud
coreyhaines31/marketingskills
charlie947/social-media-skills

## 2. Plugins (claude plugin install <plugin>@<marketplace>)
watch@claude-video
claude-mem@thedotmack
superwhisper@superwhisper
superpowers@claude-plugins-official
hyperframes@claude-plugins-official
skill-creator@claude-plugins-official
caveman@caveman
ponytail@ponytail
codex@openai-codex
i-have-adhd@i-have-adhd
taste-skill@taste-skill
gsap-skills@gsap-skills
last30days@last30days-skill
claude-hud@claude-hud
marketing-skills@marketingskills
social-media-skills@social-media-skills
swift-lsp@claude-plugins-official
vercel@claude-plugins-official
supabase@claude-plugins-official
typescript-lsp@claude-plugins-official
pyright-lsp@claude-plugins-official
php-lsp@claude-plugins-official
context7@claude-plugins-official
semgrep@claude-plugins-official   (install, then: claude plugin disable semgrep@claude-plugins-official)

## 3. Agents (into ~/.claude/agents/)
- Clone https://github.com/alexsmedile/hormozi-skills to a temp folder and copy agents/*.md (hormozi-orchestrator, sub-market, sub-offer, sub-pricing, sub-sales, sub-value).
- Clone https://github.com/AgriciDaniel/claude-seo to a temp folder and copy agents/seo-*.md.

## 4. Skills that are NOT in my account (install locally)
- gstack: git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack, then read and run its ./setup.
- graphify: npx -y skills add Graphify-Labs/graphify -g -y -a claude-code -s graphify. Then read its SKILL.md and install the Python package it requires.

## 5. MCP servers (user scope)
- codebase-memory-mcp: install from https://github.com/DeusData/codebase-memory-mcp (read install.sh first). Its installer registers the MCP server and its hooks; if it does not, run: claude mcp add -s user codebase-memory-mcp -- <path to binary>
- glyph: go install github.com/benmyles/glyph@latest, then: claude mcp add -s user glyph -- ~/go/bin/glyph mcp
- 21st: claude mcp add -s user --transport http 21st https://21st.dev/api/mcp
- v0: claude mcp add -s user --transport http v0 https://v0.app/api/mcp
Tell me which ones need a login through /mcp. Do not ask me for tokens in chat.

## 6. Settings (merge into ~/.claude/settings.json, keep anything already there)
{
  "model": "sonnet",
  "effortLevel": "high",
  "theme": "dark",
  "tui": "fullscreen",
  "autoUpdatesChannel": "latest",
  "agentPushNotifEnabled": true,
  "permissions": { "defaultMode": "bypassPermissions" },
  "skipDangerousModePermissionPrompt": true
}
Note: bypassPermissions makes Claude run commands without asking. Warn me once before applying it.

## 4b. Account skills (check first, install only what is missing)
I uploaded these skills to my Claude account. In the Claude desktop app they show up as anthropic-skills:<name>. First check whether they are available to you in this session (anthropic-skills:council, anthropic-skills:hormozi-offer, anthropic-skills:seo). If they are, skip this whole step.
If they are NOT available, install them locally into ~/.claude/skills/ from these sources:
- With npx skills (npx -y skills add <repo> -g -y -a claude-code -s <name>):
- Leonxlnx/taste-skill: brandkit, design-taste-frontend, design-taste-frontend-v1, full-output-enforcement, gpt-taste, high-end-visual-design, image-to-code, imagegen-frontend-mobile, imagegen-frontend-web, industrial-brutalist-ui, minimalist-ui, redesign-existing-projects, stitch-design-taste
- emilkowalski/skills: animate, animation-vocabulary, apple-design, ask-sonner, emil-design-eng, find-animation-opportunities, improve-animations, pick-ui-library, prototype, review-animations
- figma/mcp-server-guide: figma-design-to-code
- kepano/obsidian-skills: obsidian-bases, obsidian-markdown
- mastepanoski/claude-skills: wcag-accessibility-audit
- omer-metin/skills-for-antigravity: gamification-loops
- pbakaus/impeccable: impeccable
- vercel-labs/skills: find-skills
- warpdotdev/common-skills: write-product-spec
- From https://github.com/AgriciDaniel/claude-seo: copy skills/seo* and extensions/*/skills/seo-* for: seo, seo-agentic, seo-ahrefs, seo-audit, seo-backlinks, seo-bing, seo-cluster, seo-competitor-pages, seo-content, seo-content-brief, seo-dataforseo, seo-drift, seo-ecommerce, seo-firecrawl, seo-flow, seo-geo, seo-google, seo-hreflang, seo-image-gen, seo-images, seo-local, seo-maps, seo-matomo, seo-page, seo-plan, seo-profound, seo-programmatic, seo-schema, seo-seranking, seo-sitemap, seo-sxo, seo-technical, seo-unlighthouse. Then install its requirements.txt with pip.
- From https://github.com/alexsmedile/hormozi-skills: copy every folder in skills/ (audit-offer, bonus-stack, business-model, create-plugin, dfy-dwy-diy, effort-reduction, hormozi-hooks, hormozi-offer, hormozi-pitch, idea-to-product, landing-page-copy, market-research, objection-destroyer, offer-angles, pricing-strategy, productize, value-accelerator, value-perception).
- From https://github.com/nextlevelbuilder/ui-ux-pro-max-skill: copy .claude/skills/ (ui-ux-pro-max, design, design-system, brand, banner-design, slides, ui-styling).
- git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
- council, modelagem-de-referencia, skill-audit: create each from the appendix at the end of this prompt (~/.claude/skills/<name>/SKILL.md, exact content).
- codebase-memory comes with codebase-memory-mcp in step 5.

## 7. Finish
Tell me to restart Claude Code. After the restart, confirm that the account skills (anthropic-skills:*) and the local skills both show up, and that there are no duplicates.

## Appendix: skills with no public repo (use only in step 4b)

### council/SKILL.md
~~~~markdown
---
name: council
description: Conselho de decisão. Quando você vai bater o martelo numa decisão e o Claude só concorda com o lado que você empurra, rode o conselho. Triggers: "/council", "chama o conselho".
---

# Council — o conselho que mata o puxa-saquismo do Claude

Quando houver uma decisão real (mais de um caminho), execute:

1. Capte a decisão em uma frase + o contexto. Não opine ainda.

2. Spawne os 5 conselheiros EM PARALELO (um agente por lente), cada um
   instruído a NÃO ser diplomático:
   - O Contrário — rasga a ideia, acha os 3 furos que vão matá-la. Proibido elogiar.
   - Primeiros Princípios — ignora a pergunta, reformula o que você TENTA resolver
     de verdade e diz se a decisão é a alavanca certa.
   - O Expansionista — caça o ganho 10x que você não está vendo.
   - O Forasteiro — recebe só a decisão em 1 frase, sem contexto; aponta o óbvio
     que você parou de notar de tão dentro.
   - O Executor — só liga pro que muda amanhã de manhã: menor passo testável,
     custo de errar.

3. Revisão entre pares: cruze as 5 saídas, marque o que sobrevive e as divergências
   reais (não invente concordância).

4. O Presidente fecha em formato fixo e curto:
   ⚖️ VEREDITO: <uma frase>
   POR QUÊ: <3 pontos que sobreviveram>
   ⚠️ O QUE PODE MATAR: <o risco mais letal, do Contrário>
   ▶️ PRÓXIMO PASSO: <uma ação única e testável pra amanhã de manhã>

Uma decisão. Um passo. Sem "depende", sem cinco caminhos abertos.
~~~~

### modelagem-de-referencia/SKILL.md
~~~~markdown
---
name: modelagem-de-referencia
description: Use when building a product that should match or replicate existing apps (Miro, Notion, ClickUp, Gather, Figma, Linear, Slack, etc.) - extracts exact interaction, visual and data-model specs from the reference apps BEFORE writing any code, so the build is based on evidence instead of assumption.
---

# Modelagem de referência

Antes de construir qualquer coisa que se compare a um app existente, extraia a
especificação real desse app. Escrever código a partir de memória ou de intuição
produz um clone raso que erra justamente nos detalhes que fazem o original
funcionar.

## A regra

**Nenhuma linha de código de uma feature "igual ao X" antes de existir a
especificação do X.** Se o usuário pedir pra pular essa etapa, pule — mas diga
numa linha o que está sendo assumido sem evidência.

## O que extrair, sempre

Para cada app de referência, produza um documento com estas sete seções. Uma
seção sem dado deve dizer "não encontrei", nunca ser preenchida por dedução.

### 1. Modelo de dados
Quais são as entidades e como se relacionam. Esta é a seção que mais muda o
código e a que mais se erra de cabeça. Exemplo real: no ClickUp a coluna do
quadro não é a verdade — ela é um agrupamento sobre o campo `status` da tarefa,
e o agrupamento é trocável. Quem modela "coluna com lista de cartões" já nasce
errado.

### 2. Interações, gesto por gesto
Como cria, como seleciona, como move, como redimensiona, como conecta, como
apaga. Com **atalho de teclado exato** de cada ação. Inclua o que acontece no
hover, no arraste, no duplo clique, no clique longo.

### 3. Números
Dimensões padrão em px ou dp, limites de zoom, raio de proximidade, teto de
itens, profundidade do desfazer, quantidade máxima de cada coisa. São esses
números que fazem a cópia parecer a coisa ou parecer imitação.

### 4. Cores e tipografia
**Hex exato**, não "azul parecido". Nome da fonte, escala de tamanhos, escala de
espaçamento, raio de borda, sombra. Procure o design system público do produto
(Mirotone, Primer, Polaris, Material) — costuma ter os tokens publicados.

### 5. Layout da tela
Onde fica cada barra, o que é fixo, o que flutua, o que é contextual. Um mapa em
ASCII resolve e é fácil de conferir depois.

### 6. Limites e reclamações
O que o app **não** faz, e o que os usuários reclamam há anos em fórum. Isso vale
tanto quanto a lista de recursos: mostra onde existe espaço real pra ser melhor,
e evita copiar uma limitação achando que é decisão de design.

### 7. Fontes
URL de cada afirmação. Separe o que é documentação oficial do que é fórum ou
review — e marque o não-oficial como não-oficial.

## Como extrair

Em ordem de confiabilidade:

1. **Documentação de desenvolvedor** (SDK, API) — é onde estão os valores
   exatos: dimensões padrão, enums, defaults. Quase sempre melhor que a central
   de ajuda.
2. **Design system público** do produto — tokens de cor, fonte, espaçamento.
3. **Central de ajuda oficial** — comportamento e atalhos.
4. **Usar o app**, se houver acesso. Extraia a barra de ferramentas pelo DOM
   (`aria-label`, `title`) em vez de adivinhar por ícone. Teste os gestos de
   verdade: crie, arraste, redimensione, desfaça.
5. **Fórum da comunidade e reviews** — para limites não documentados e
   reclamações. Marque como não-oficial.

Rode uma frente por app, em paralelo, quando forem vários.

## Regras ao usar o app de outra pessoa

- Trabalhe num espaço descartável. Se não der, **não modifique nada**.
- Se modificar sem querer, desfaça na hora e avise.
- Nunca copie código-fonte, asset ou texto proprietário. Especificação de
  comportamento e medida é o que se extrai; implementação é sua.

## Depois da extração

Antes de codar, escreva uma seção de decisão respondendo:

- **O que copiamos igual**, porque já é o padrão que a pessoa espera (atalhos
  consagrados, gestos universais).
- **O que fazemos diferente**, e por quê.
- **O que não fazemos**, e o que entra no lugar.

E a pergunta que corta escopo: **isso aproveita alguma vantagem que só o nosso
produto tem?** Se a resposta for não, integrar o app pronto costuma bater
reescrever uma versão pior dele.
~~~~

### skill-audit/SKILL.md
~~~~markdown
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
~~~~
