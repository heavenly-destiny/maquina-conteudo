// lê o roteiro que a máquina escreve pra mostrar como teleprompter. Prefere o roteiro.json (estruturado);
// do roteiro.md tira os ganchos, a duração e as notas (o que não é fala vira "Notas da máquina", recolhido).
export type Roteiro = { duracao?: number; ganchos: { tipo: string; texto: string; escolhido: boolean }[]; falas: { fala: string; cena?: string }[]; notas: string[] };
type Json = { gancho?: string; falas?: { texto: string; cena?: string }[] } | null | undefined;

const tirarAspas = (s: string) => s.trim().replace(/^["“]|["”]$/g, "").trim();
const limpo = (s: string) => s.replace(/^#+\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/^[-*]\s+/, "").trim();

export function lerRoteiro(md?: string | null, json?: Json): Roteiro | null {
  if (!md && !json?.falas?.length) return null;
  const secoes: Record<string, string[]> = {};
  let atual = "_intro";
  secoes[atual] = [];
  for (const l of (md ?? "").split("\n")) {
    const h = l.match(/^##\s+(.+)/);
    if (h) { atual = h[1].trim().toLowerCase(); secoes[atual] = []; continue; }
    secoes[atual].push(l);
  }
  const ganchos = (secoes["ganchos"] ?? []).flatMap((l) => {
    const m = l.match(/^\d+\.\s+\*\*(.+?):?\*\*:?\s*(.+)$/);
    if (!m) return [];
    return [{ tipo: m[1].replace(/\(?ESCOLHIDO\)?/i, "").replace(/[:\s]+$/, "").trim(), texto: (m[2].match(/^\s*["“](.+?)["”]/)?.[1] ?? tirarAspas(m[2])).trim(), escolhido: /ESCOLHIDO/i.test(m[1]) }];
  });
  let falas: Roteiro["falas"] = [];
  if (json?.falas?.length) falas = json.falas.map((f) => ({ fala: tirarAspas(f.texto), cena: f.cena }));
  else for (const l of secoes["roteiro"] ?? []) {
    const f = l.match(/^\d+\.\s+(.+)$/);
    const c = l.match(/\[cena:\s*(.+?)\]/);
    if (f && !c) falas.push({ fala: tirarAspas(f[1]) });
    else if (c && falas.length) falas[falas.length - 1].cena = c[1].trim();
  }
  if (!ganchos.length && json?.gancho) ganchos.push({ tipo: "Gancho", texto: tirarAspas(json.gancho), escolhido: true });
  const notas = [...(secoes["_intro"] ?? []), ...(secoes["notas"] ?? [])].map(limpo).filter((l) => l.length > 2);
  const d = (md ?? "").match(/Duração[^:\n]*:\s*~?\s*(\d+)\s*s/i);
  return falas.length ? { duracao: d ? +d[1] : undefined, ganchos, falas, notas } : null;
}
