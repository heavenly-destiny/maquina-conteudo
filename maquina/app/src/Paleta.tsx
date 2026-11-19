/* ⌘K da Forja. Base: Command Palette (vovalopuh13, 21st.dev): busca aproximada com letras sublinhadas, grupos,
   pílula que desliza no item ativo, prévia que inclina com o cursor, teclas que afundam. Cores trocadas pro vinho/vermelho. */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUp, Clapperboard, CornerDownLeft, FileText, Film, Home, Link2, Megaphone, Scissors, Search, Send, Settings2, Sparkles, Telescope, Volume2, Wand2 } from "lucide-react";
import type { Aba } from "./Dock";
import type { Estado, Rascunho } from "./api";
import { som } from "./sons";
import { cx } from "./ui";

type Item = { id: string; grupo: string; titulo: string; sub?: string; icone: ReactNode; chaves?: string; atalho?: string; desc?: string; acao: () => void };

const GRAD = "linear-gradient(125deg,#ff4d5a,#e11d2a 55%,#9b1226)";

function fuzzy(texto: string, q: string): { idx: number[]; score: number } | null {
  if (!q) return { idx: [], score: 0 };
  const t = texto.toLowerCase().normalize("NFD").replace(/\p{M}/gu, ""), s = q.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const em = t.indexOf(s);
  if (em >= 0) return { idx: Array.from({ length: s.length }, (_, i) => em + i), score: em * 0.5 };
  const idx: number[] = []; let j = 0;
  for (let i = 0; i < t.length && j < s.length; i++) if (t[i] === s[j]) { idx.push(i); j++; }
  return j < s.length ? null : { idx, score: 20 + idx[idx.length - 1] - idx[0] };
}
function Acesa({ texto, idx }: { texto: string; idx: number[] }) {
  if (!idx.length) return <>{texto}</>;
  const set = new Set(idx);
  return <>{Array.from(texto).map((c, i) => (set.has(i) ? <span key={i} className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-[3px]">{c}</span> : c))}</>;
}
function Tecla({ children, baixo }: { children: ReactNode; baixo?: boolean }) {
  return (
    <motion.kbd animate={{ y: baixo ? 2 : 0, boxShadow: baixo ? "0 0 0 rgba(0,0,0,0)" : "0 2px 0 rgb(255 255 255 / 0.12)" }} transition={{ duration: 0.08 }}
      className="grid h-6 min-w-6 place-items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 text-[11px] font-medium text-mute">{children}</motion.kbd>
  );
}

export function Paleta({ e, ir, criarCom, abrirConfig, alternarSom }: {
  e: Estado | null; ir: (a: Aba) => void; criarCom: (r: Rascunho) => void; abrirConfig: () => void; alternarSom: () => void;
}) {
  const reduz = !!useReducedMotion();
  const uid = useId();
  const [aberta, setAberta] = useState(false);
  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState(0);
  const [tecla, setTecla] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const fechar = useCallback(() => { setAberta(false); setQ(""); setAtivo(0); }, []);
  useEffect(() => {
    const k = (ev: KeyboardEvent) => { if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); setAberta((a) => { if (!a) som.abrir(); return !a; }); } };
    const abrir = () => { som.abrir(); setAberta(true); };
    addEventListener("keydown", k); addEventListener("forja:paleta", abrir);
    return () => { removeEventListener("keydown", k); removeEventListener("forja:paleta", abrir); };
  }, []);
  useEffect(() => { if (aberta) setTimeout(() => campo.current?.focus(), 30); }, [aberta]);
  useEffect(() => { setAtivo(0); }, [q]);
  useEffect(() => { lista.current?.querySelector(`[data-i="${ativo}"]`)?.scrollIntoView({ block: "nearest" }); }, [ativo]);

  const itens = useMemo<Item[]>(() => {
    const I = "size-4";
    const base: Item[] = [
      { id: "animado", grupo: "Criar", titulo: "Vídeo animado", sub: "Com voz, trilha e motion", icone: <Clapperboard className={I} />, chaves: "motion video voz", desc: "Escreve a copy, você aprova, e a Forja faz voz, trilha, efeitos e o vídeo.", acao: () => criarCom({ tipo: "animado" }) },
      { id: "criativo", grupo: "Criar", titulo: "Criativo de anúncio", sub: "Direct response pra Meta", icone: <Megaphone className={I} />, chaves: "ads anuncio meta", desc: "Gancho, dor, prova e CTA no formato que escala.", acao: () => criarCom({ tipo: "criativo" }) },
      { id: "modelar", grupo: "Criar", titulo: "Modelar um viral", sub: "Mesmos efeitos, sua marca", icone: <Wand2 className={I} />, chaves: "clonar referencia", desc: "Pega cenas, tempo, transições, legenda e trilha de uma referência e adapta pro seu assunto.", acao: () => criarCom({ tipo: "modelar" }) },
      { id: "roteiro", grupo: "Criar", titulo: "Só o roteiro", sub: "Copy pronta pra gravar", icone: <FileText className={I} />, chaves: "copy script", acao: () => criarCom({ tipo: "roteiro" }) },
      { id: "cortar", grupo: "Criar", titulo: "Cortar vídeo cru", sub: "Os melhores trechos com legenda", icone: <Scissors className={I} />, chaves: "cortes upload", acao: () => ir("cortes") },
      { id: "link", grupo: "Criar", titulo: "Analisar referência", sub: "Cola o link de um viral", icone: <Link2 className={I} />, chaves: "decupar inspirar link", acao: () => { ir("inspirar"); setTimeout(() => document.querySelector<HTMLInputElement>("main input")?.focus(), 200); } },
      { id: "inicio", grupo: "Ir para", titulo: "Início", icone: <Home className={I} />, atalho: "1", acao: () => ir("inicio") },
      { id: "cortes", grupo: "Ir para", titulo: "Cortes", icone: <Scissors className={I} />, atalho: "2", acao: () => ir("cortes") },
      { id: "criados", grupo: "Ir para", titulo: "Criados", icone: <Sparkles className={I} />, atalho: "3", acao: () => ir("criar") },
      { id: "inspirar", grupo: "Ir para", titulo: "Inspirar", icone: <Telescope className={I} />, atalho: "4", acao: () => ir("inspirar") },
      { id: "postar", grupo: "Ir para", titulo: "Postar", icone: <Send className={I} />, atalho: "5", acao: () => ir("postar") },
      { id: "conta", grupo: "Ajustes", titulo: "Conta e conexões", sub: "Claude, voz e perfil", icone: <Settings2 className={I} />, acao: abrirConfig },
      { id: "som", grupo: "Ajustes", titulo: "Ligar ou desligar sons", icone: <Volume2 className={I} />, acao: alternarSom },
    ];
    const feitos: Item[] = (e?.geracoes ?? []).filter((g) => g.titulo || g.briefing).slice(0, 40).map((g) => ({
      id: `g-${g.id}`, grupo: "Seus vídeos", titulo: g.titulo || g.briefing, sub: g.status === "pronto" ? "Pronto" : g.status, icone: <Film className={I} />, chaves: g.tipo, acao: () => ir("criar"),
    }));
    const refs: Item[] = (e?.inspiracoes ?? []).filter((x) => x.decupagem?.titulo || x.info?.titulo).slice(0, 40).map((x) => ({
      id: `i-${x.id}`, grupo: "Referências", titulo: x.decupagem?.titulo || x.info?.titulo || x.url, sub: x.info?.autor, icone: <Telescope className={I} />, chaves: x.tipo, acao: () => ir("inspirar"),
    }));
    return [...base, ...feitos, ...refs];
  }, [e, ir, criarCom, abrirConfig, alternarSom]);

  const grupos = useMemo(() => {
    const pont = itens.map((it) => {
      const a = fuzzy(it.titulo, q), b = q ? fuzzy(`${it.sub ?? ""} ${it.chaves ?? ""} ${it.grupo}`, q) : null;
      if (!a && !b) return null;
      return { it, idx: a?.idx ?? [], score: a ? a.score : 60 + (b?.score ?? 0) };
    }).filter(Boolean) as { it: Item; idx: number[]; score: number }[];
    const vis = q ? pont.sort((x, y) => x.score - y.score) : pont.filter((r) => r.it.grupo !== "Seus vídeos" && r.it.grupo !== "Referências");
    const gs: { nome: string; linhas: typeof vis }[] = [];
    for (const r of vis) { let g = gs.find((x) => x.nome === r.it.grupo); if (!g) gs.push((g = { nome: r.it.grupo, linhas: [] })); if (g.linhas.length < 8) g.linhas.push(r); }
    return gs;
  }, [itens, q]);
  const plano = grupos.flatMap((g) => g.linhas);
  const atual = plano[Math.min(ativo, plano.length - 1)];
  const rodar = (it?: Item) => { if (!it) return; som.toque(); fechar(); it.acao(); };
  const teclas = (ev: React.KeyboardEvent) => {
    const n = plano.length, pisca = (k: string) => { setTecla(k); setTimeout(() => setTecla(null), 140); };
    if (ev.key === "ArrowDown") { ev.preventDefault(); setAtivo((a) => (a + 1) % Math.max(1, n)); pisca("baixo"); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); setAtivo((a) => (a - 1 + n) % Math.max(1, n)); pisca("cima"); }
    else if (ev.key === "Enter") { ev.preventDefault(); pisca("enter"); rodar(atual?.it); }
    else if (ev.key === "Escape") { ev.preventDefault(); fechar(); }
  };

  const px = useMotionValue(-300), py = useMotionValue(-300);
  const brilho = useMotionTemplate`radial-gradient(300px circle at ${px}px ${py}px, rgb(225 29 42 / 0.13), transparent 70%)`;
  const tx = useMotionValue(0.5), ty = useMotionValue(0.5);
  const rX = useSpring(useTransform(ty, [0, 1], [8, -8]), { stiffness: 140, damping: 16 }), rY = useSpring(useTransform(tx, [0, 1], [-10, 10]), { stiffness: 140, damping: 16 });
  let cont = -1;

  return (
    <AnimatePresence>
      {aberta && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-start justify-items-center px-4 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <div aria-hidden onClick={fechar} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div role="dialog" aria-modal="true" aria-label="Buscar e criar" onKeyDown={teclas}
            onPointerMove={(ev) => { const b = ev.currentTarget.getBoundingClientRect(); px.set(ev.clientX - b.left); py.set(ev.clientY - b.top); }}
            initial={{ opacity: 0, scale: reduz ? 1 : 0.92, y: reduz ? 0 : -24, rotateX: reduz ? 0 : 12 }} animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: reduz ? 1 : 0.96, y: reduz ? 0 : -10 }}
            transition={reduz ? { duration: 0.1 } : { type: "spring", stiffness: 380, damping: 26 }} style={{ transformPerspective: 1000 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[22px] border border-white/10 bg-[#140407]/95 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.8),0_0_0_1px_rgb(225_29_42/0.12)]">
            {!reduz && <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: brilho }} />}
            <div className="relative flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search className="size-5 text-red" aria-hidden />
              <input ref={campo} role="combobox" aria-expanded="true" aria-controls={`${uid}-l`} aria-label="Buscar" value={q} onChange={(ev) => setQ(ev.target.value)}
                placeholder="Criar, buscar um vídeo, ir pra uma tela…" autoComplete="off" spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-faint" />
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-mute">Esc</kbd>
              <motion.span aria-hidden key={q.length} className="absolute bottom-0 left-0 h-0.5" style={{ background: GRAD }} animate={{ width: q ? ["0%", "100%"] : "0%", opacity: q ? 1 : 0 }} transition={{ duration: 0.6 }} />
            </div>
            <div className="relative grid sm:grid-cols-[1.2fr_1fr]">
              <ul ref={lista} role="listbox" id={`${uid}-l`} className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
                {plano.length === 0 && <li className="grid h-40 place-items-center px-6 text-center text-sm text-mute">Nada com “{q}”. Tente menos letras.</li>}
                {grupos.map((g) => (
                  <li key={g.nome} role="presentation">
                    <p className="sticky top-0 z-10 bg-[#140407]/90 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-faint backdrop-blur">{g.nome}</p>
                    <ul role="group" aria-label={g.nome}>
                      {g.linhas.map(({ it, idx }) => {
                        cont++;
                        const i = cont, on = i === ativo;
                        return (
                          <motion.li key={it.id} data-i={i} role="option" aria-selected={on} onMouseMove={() => setAtivo(i)} onClick={() => rodar(it)}
                            initial={{ opacity: 0, x: reduz ? 0 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 400, damping: 28, delay: reduz ? 0 : Math.min(i, 8) * 0.02 }}
                            className="relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm">
                            {on && <motion.span layoutId={`${uid}-pilula`} transition={{ type: "spring", stiffness: 500, damping: 36 }} className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-red/30" />}
                            {on && <motion.span layoutId={`${uid}-barra`} transition={{ type: "spring", stiffness: 500, damping: 36 }} className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ background: GRAD }} />}
                            <span className={cx("relative grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-mute transition-colors", on && "border-transparent text-white")} style={on ? { background: GRAD } : undefined}>{it.icone}</span>
                            <span className="relative min-w-0 flex-1"><span className="block truncate text-ink/90"><Acesa texto={it.titulo} idx={idx} /></span>{it.sub && <span className="block truncate text-xs text-faint">{it.sub}</span>}</span>
                            {it.atalho && <kbd className="relative rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-mute">{it.atalho}</kbd>}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className="relative hidden border-l border-white/[0.07] p-4 sm:block" style={{ perspective: 800 }}
                onPointerMove={(ev) => { const b = ev.currentTarget.getBoundingClientRect(); tx.set((ev.clientX - b.left) / b.width); ty.set((ev.clientY - b.top) / b.height); }}
                onPointerLeave={() => { tx.set(0.5); ty.set(0.5); }}>
                <AnimatePresence mode="wait" initial={false}>
                  {atual && (
                    <motion.div key={atual.it.id} initial={{ opacity: 0, y: reduz ? 0 : 14, filter: reduz ? "none" : "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: reduz ? 0 : -8 }} transition={{ duration: 0.2 }}>
                      <motion.div style={{ rotateX: reduz ? 0 : rX, rotateY: reduz ? 0 : rY, transformStyle: "preserve-3d", background: GRAD }}
                        className="relative grid h-28 place-items-center overflow-hidden rounded-2xl text-white shadow-[0_20px_40px_-18px_rgb(225_29_42/0.7)]">
                        <span aria-hidden className="absolute -left-6 -top-8 size-28 rounded-full bg-white/25 blur-2xl" />
                        <span className="relative" style={{ transform: "translateZ(30px) scale(1.9)" }}>{atual.it.icone}</span>
                      </motion.div>
                      <h3 className="mt-3 text-base font-semibold">{atual.it.titulo}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-mute">{atual.it.desc ?? atual.it.sub ?? "Enter pra abrir."}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="relative flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 text-xs text-faint">
              <span aria-live="polite">{plano.length} {plano.length === 1 ? "resultado" : "resultados"}</span>
              <span className="hidden items-center gap-3 sm:flex" aria-hidden>
                <span className="flex items-center gap-1"><Tecla baixo={tecla === "cima"}><ArrowUp className="size-3" /></Tecla><Tecla baixo={tecla === "baixo"}><ArrowDown className="size-3" /></Tecla>mover</span>
                <span className="flex items-center gap-1"><Tecla baixo={tecla === "enter"}><CornerDownLeft className="size-3" /></Tecla>abrir</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
