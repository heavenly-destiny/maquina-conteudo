#!/usr/bin/env python3
"""Gera CONHECIMENTO.md: o índice de TUDO que o tanpz e o Claude já acumularam
(regras, memórias de todos os projetos, skills, vault, vídeos feitos, estilos, gerações com feedback).
Roda antes de cada job, então nada novo fica de fora sem ninguém lembrar de listar."""
import json, re
from pathlib import Path

from maquina import H, RAIZ, VAULT, APOIO, CEREBRO, PERFIL, base
SAIDA = Path(__file__).resolve().parent / "CONHECIMENTO.md"


def desc(f, n=160):
    """description do frontmatter, ou a primeira linha de texto"""
    try:
        t = f.read_text(errors="ignore")[:3000]
    except OSError:
        return ""
    m = re.search(r"^description:\s*(.+)$", t, re.M)
    if m:
        return m.group(1).strip().strip('"')[:n]
    linhas = [l.strip("# ").strip() for l in t.splitlines() if l.strip() and not l.startswith("---")]
    return (linhas[0] if linhas else "")[:n]


def gerar():
    L = ["# Conhecimento acumulado do tanpz (índice gerado automaticamente a cada job)", "",
         "Tudo abaixo existe de verdade no disco. Antes de criar, escolha e LEIA o que toca o job:",
         "regras e decisões sempre; memórias, vídeos e notas do mesmo assunto, produto ou formato.",
         "Nada aqui é sugestão: decisão já tomada vale para todo job.", ""]

    if PERFIL.exists():
        L += ["## 0. Quem usa esta máquina (ler primeiro; soma por cima da base, nunca apaga)"]
        L += [f"- {f}: {desc(f)}" for f in sorted(PERFIL.glob("*.md"))]
        L.append("")
    L += ["## 1. Regras e cérebro (ler sempre)"]
    for f in [H / ".claude/CLAUDE.md", APOIO / "claude/CLAUDE.md", *sorted(APOIO.glob("*.md"))]:
        L.append(f"- {f}: {desc(f)}")

    L += ["", "## 2. Memórias de todas as sessões (decisões, correções, feedback)"]
    for m in sorted([*(H / ".claude/projects").glob("*/memory"), *(CEREBRO / "memorias").glob("*/memory")]):
        fs = sorted(x for x in m.glob("*.md") if x.name != "MEMORY.md")
        if not fs:
            continue
        L.append(f"### {m.parent.name}")
        L += [f"- {x}: {desc(x)}" for x in fs]

    L += ["", "## 3. Banco de memória de TODAS as conversas (claude-mem, milhares de observações)",
          "Ferramentas mcp__plugin_claude-mem_mcp-search__search / smart_search / timeline / get_observations.",
          "Busque o assunto do job (produto, formato, tipo de vídeo, 'feedback', 'aprovado', 'não gostei') ANTES de escrever.",
          "Use o que foi aprovado, evite o que foi rejeitado."]

    L += ["", "## 4. Skills (carregar com a ferramenta Skill as que tocam o job)"]
    for s in sorted((H / ".claude/skills").glob("*/SKILL.md")):
        L.append(f"- {s.parent.name}: {desc(s, 120)}")
    L.append("- e as de plugin: hyperframes:*, gsap-skills:*, marketing-skills:*, social-media-skills:*, taste-skill:*, claude-mem:mem-search")

    L += ["", f"## 5. Vault do tanpz ({VAULT}) — notas de marketing, livros, podcasts, páginas (Grep por assunto)"]
    for d in sorted(x for x in VAULT.iterdir() if x.is_dir() and not x.name.startswith(".")) if VAULT.exists() else []:
        n = sum(1 for _ in d.rglob("*.md"))
        if n:
            L.append(f"- {d}/ ({n} notas)")
    L.append(f"- {VAULT}/claude-setup/PROMPT MESTRE.md")

    L += ["", "## 6. Vídeos e criativos já feitos (técnica reaproveitável; look e copy só para o mesmo produto)"]
    for d in sorted((VAULT / "videos").iterdir()) if (VAULT / "videos").exists() else []:
        if d.is_dir():
            docs = [x.name for x in sorted(d.glob("*.md"))[:4]]
            L.append(f"- {d}/ {' '.join(docs)}")
    for d in [H / "Documents/Stories Lab Criativos", base("~/Documents/banco-motion")]:
        if d.exists():
            L.append(f"- {d}/: {', '.join(sorted(x.name for x in d.iterdir() if not x.name.startswith('.'))[:12])}")

    L += ["", f"## 7. Biblioteca de estilos e referências ({RAIZ / 'estilos'})"]
    for d in sorted((RAIZ / "estilos").iterdir()):
        if not d.name.startswith("."):
            L.append(f"- {d}{'/' if d.is_dir() else ''}")
    L.append(f"- inspirações decupadas: {RAIZ / 'inspiracoes'}/<id>/decupagem.json")
    L.append(f"- padrão-ouro de corte: {RAIZ / 'tools/organico/BRIEF-CORTE.md'}")

    L += ["", "## 8. Gerações anteriores da máquina e o que o tanpz pediu para mudar"]
    for p in sorted((RAIZ / "geracoes").glob("*/pedido.json"))[-30:]:
        try:
            ped = json.loads(p.read_text())
            est = json.loads((p.parent / "estado.json").read_text()) if (p.parent / "estado.json").exists() else {}
        except ValueError:
            continue
        notas = " | ".join(ped.get("notas", []))
        fb = p.parent / "feedback.md"
        L.append(f"- {p.parent.name} [{ped.get('tipo')}] {ped.get('briefing','')[:90]} · {est.get('status','?')}"
                 + (f" · pedidos: {notas}" if notas else "")
                 + (f" · VEREDITO DO TANPZ: {fb.read_text().strip()}" if fb.exists() else ""))

    SAIDA.write_text("\n".join(L) + "\n")
    return SAIDA


if __name__ == "__main__":
    f = gerar()
    print(f, len(f.read_text().splitlines()), "linhas")
