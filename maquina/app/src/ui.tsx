import { useId, useRef, createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Numero, TextoBrilho } from "./fx";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Copy, Film, Sparkles, Trash2, X } from "lucide-react";
import { som } from "./sons";

export const mola = { type: "spring", stiffness: 380, damping: 30 } as const;
export const molaSuave = { type: "spring", stiffness: 160, damping: 22 } as const;

export function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* ---------- botão ---------- */
type BotaoProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { tipo?: "principal" | "vidro" | "fantasma"; carregando?: boolean };
export function Botao({ tipo = "vidro", carregando, className, children, onClick, disabled, ...p }: BotaoProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={mola}
      disabled={disabled || carregando}
      onClick={(e) => { som.toque(); onClick?.(e); }}
      className={cx(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tipo === "principal" && "brilho bg-red text-white shadow-[0_10px_30px_-8px_rgb(225_29_42/0.7),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[#ef2633]",
        tipo === "vidro" && "vidro hover:bg-white/10",
        tipo === "fantasma" && "text-mute hover:bg-white/5 hover:text-ink",
        className,
      )}
      {...(p as object)}
    >
      {carregando ? <Gira /> : children}
    </motion.button>
  );
}

export function Gira({ className = "size-4" }: { className?: string }) {
  return <span className={cx("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}

/* ---------- segmentado com pílula que desliza ---------- */
/* fade on the right edge while a horizontal row still has hidden content */
export function useTransborda<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => { el.dataset.transborda = el.scrollWidth - el.clientWidth - el.scrollLeft > 4 ? "1" : "0"; el.dataset.esq = el.scrollLeft > 4 ? "1" : "0"; };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el); [...el.children].forEach((c) => ro.observe(c));
    el.addEventListener("scroll", medir, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", medir); };
  }, []);
  return ref;
}

/* Base: Animated Tabs (kuratlielia, 21st.dev): pílula com mola, setas nas bordas quando sobra aba escondida,
   e a aba ativa rola sozinha pra dentro da tela. */
export function Segmentos<T extends string>({ opcoes, valor, onChange, id, className }: {
  opcoes: { v: T; rotulo: ReactNode }[]; valor: T; onChange: (v: T) => void; id: string; className?: string;
}) {
  const ref = useTransborda<HTMLDivElement>();
  const [, refaz] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new MutationObserver(() => refaz((n) => n + 1)); ob.observe(el, { attributes: true, attributeFilter: ["data-transborda", "data-esq"] });
    return () => ob.disconnect();
  }, [ref]);
  useEffect(() => { ref.current?.querySelector<HTMLElement>("[data-on='1']")?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }); }, [valor, ref]);
  const rolar = (d: number) => { som.toque(); ref.current?.scrollBy({ left: d * Math.max(160, (ref.current?.clientWidth ?? 300) * 0.6), behavior: "smooth" }); };
  const esq = ref.current?.dataset.esq === "1", dir = ref.current?.dataset.transborda === "1";
  const seta = "absolute top-1/2 z-10 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-[#1a0509]/90 text-mute shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-4px_rgb(0_0_0/0.8)] backdrop-blur hover:text-ink";
  return (
    <div className={cx("relative min-w-0", className)}>
      <div ref={ref} className="vidro scroll-x flex scroll-px-10 gap-0.5 rounded-full p-1">
        {opcoes.map((o) => (
          <motion.button
            key={o.v} data-on={o.v === valor ? "1" : "0"}
            whileTap={{ scale: 0.92 }}
            transition={mola}
            onClick={() => { if (o.v !== valor) { som.aba(); onChange(o.v); } }}
            className={cx("relative min-h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 text-[13.5px] font-medium sm:px-4 sm:text-sm transition-colors", o.v === valor ? "text-ink" : "text-mute hover:text-ink")}
          >
            {o.v === valor && <motion.span layoutId={`seg-${id}`} transition={mola} className="absolute inset-0 rounded-full bg-white/[0.13] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_4px_14px_-4px_rgb(0_0_0/0.6)]" />}
            <span className="relative">{o.rotulo}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {esq && <motion.button key="e" aria-label="Ver abas anteriores" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={mola} onClick={() => rolar(-1)} className={cx(seta, "-left-1")}><ChevronLeft className="size-4" /></motion.button>}
        {dir && <motion.button key="d" aria-label="Ver mais abas" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={mola} onClick={() => rolar(1)} className={cx(seta, "-right-1")}><ChevronRight className="size-4" /></motion.button>}
      </AnimatePresence>
    </div>
  );
}

/* ---------- status ---------- */
const NOMES: Record<string, string> = {
  "na-fila": "Na fila", rodando: "Criando", gerando: "Criando", pronto: "Pronto", erro: "Erro", "aguardando-voz": "Falta a voz", revisar: "Reprovado na revisão", "aprovar-copy": "Aprovar copy", revisando: "Revisando",
  planejado: "Escolher", editando: "Editando", enviado: "Enviado", descartado: "Descartado",
  preparando: "Preparando", checando: "Checando", corrigindo: "Corrigindo", roteiro: "Roteiro", voz: "Voz",
  render: "Renderizando", renderizando: "Renderizando", montando: "Montando", baixando: "Baixando", transcrevendo: "Ouvindo", decupando: "Decupando", cenas: "Cenas",
};
export const nomeStatus = (s?: string) => (s ? NOMES[s] ?? s.replace(/-/g, " ") : "");

export function Status({ status, fase }: { status?: string; fase?: string }) {
  const ativo = status && !["pronto", "erro", "enviado", "descartado", "planejado", "aguardando-voz", "revisar", "aprovar-copy"].includes(status);
  const cor = status === "pronto" || status === "enviado" ? "text-ok" : status === "erro" ? "text-red" : ativo ? "text-ink" : "text-mute";
  return (
    <span className={cx("inline-flex min-w-0 max-w-full items-center gap-1.5 text-xs font-medium", cor)}>
      <span className="relative flex size-1.5 shrink-0">
        {ativo && <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-75" />}
        <span className={cx("relative inline-flex size-1.5 rounded-full", ativo ? "bg-red" : "bg-current")} />
      </span>
      {ativo ? <TextoBrilho className="truncate">{nomeStatus(fase || status)}</TextoBrilho> : <span className="truncate">{nomeStatus(fase || status)}</span>}
    </span>
  );
}

/* ---------- anel de meta ---------- */
export function Anel({ valor, meta, tam = 132 }: { valor: number; meta: number; tam?: number }) {
  const r = tam / 2 - 8, c = 2 * Math.PI * r, k = Math.min(1, valor / meta);
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} className="-rotate-90">
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="9" />
      <motion.circle
        cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="#e11d2a" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - k) }}
        transition={{ ...molaSuave, delay: 0.3 }} style={{ filter: "drop-shadow(0 0 8px rgb(225 29 42 / 0.6))" }}
      />
    </svg>
  );
}

/* ---------- folha (modal) ---------- */
export function Folha({ aberta, onFechar, children, larga }: { aberta: boolean; onFechar: () => void; children: ReactNode; larga?: boolean }) {
  useEffect(() => {
    if (!aberta) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [aberta, onFechar]);
  return createPortal(
    <AnimatePresence>
      {aberta && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px]" onClick={() => { som.fechar(); onFechar(); }} />
          <motion.div
            role="dialog"
            className={cx("relative max-h-[92dvh] w-full overflow-y-auto vidro-liquido rounded-t-[28px] bg-[#130709]/75 p-5 backdrop-blur-[40px] backdrop-saturate-[1.8] pb-[max(20px,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7", larga ? "sm:max-w-4xl" : "sm:max-w-xl")}
            initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={mola}
          >
            <button aria-label="Fechar" onClick={() => { som.fechar(); onFechar(); }} className="vidro absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:text-ink">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ---------- por cima de tudo (fixed dentro de elemento com transform não fica fixo) ---------- */
export const Topo = ({ children }: { children: ReactNode }) => createPortal(children, document.body);

/* ---------- copiar ---------- */
export function Copiar({ texto, rotulo = "Copiar" }: { texto: string; rotulo?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Botao
      tipo="vidro"
      className="min-h-9 px-3.5 text-[13px]"
      onClick={async () => {
        try { await navigator.clipboard.writeText(texto); } catch {}
        som.ok(); setOk(true); setTimeout(() => setOk(false), 1400);
      }}
    >
      {ok ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
      {ok ? "Copiado" : rotulo}
    </Botao>
  );
}

/* ---------- toast ---------- */
const Ctx = createContext<(m: string, erro?: boolean) => void>(() => {});
export const useAviso = () => useContext(Ctx);
export function Avisos({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<{ id: number; m: string; erro?: boolean }[]>([]);
  const avisar = useCallback((m: string, erro?: boolean) => {
    const id = Date.now() + Math.random();
    erro ? som.erro() : som.ok();
    setLista((l) => [...l, { id, m, erro }]);
    setTimeout(() => setLista((l) => l.filter((x) => x.id !== id)), erro ? 8000 : 3200);
  }, []);
  return (
    <Ctx.Provider value={avisar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(16px,env(safe-area-inset-top))] z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {lista.map((t) => (
            <motion.div key={t.id} layout initial={{ y: -20, opacity: 0, scale: 0.9, filter: "blur(8px)" }} animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ y: -12, opacity: 0, scale: 0.95 }} transition={mola}
              onClick={() => setLista((l) => l.filter((x) => x.id !== t.id))}
              className="vidro pointer-events-auto flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-[#1a0d10]/80 px-4 py-2.5 text-sm font-medium">
              <span className={cx("size-1.5 rounded-full", t.erro ? "bg-red" : "bg-ok")} />
              {t.m}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

/* ---------- vazio ---------- */
/* Base: Interactive Empty State (remcostoeten, 21st.dev): três peças em leque que se abrem no hover, pontilhado de fundo. */
const LEQUE = {
  e: { initial: { scale: 0.8, opacity: 0, rotate: 0 }, animate: { scale: 1, opacity: 1, rotate: -8, transition: { ...molaSuave, delay: 0.1 } }, hover: { x: -24, y: -6, rotate: -16, scale: 1.08, transition: mola } },
  c: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1, transition: { ...molaSuave, delay: 0.18 } }, hover: { y: -10, scale: 1.12, transition: mola } },
  d: { initial: { scale: 0.8, opacity: 0, rotate: 0 }, animate: { scale: 1, opacity: 1, rotate: 8, transition: { ...molaSuave, delay: 0.26 } }, hover: { x: 24, y: -6, rotate: 16, scale: 1.08, transition: mola } },
} as const;
export function Vazio({ icone, titulo, children }: { icone: ReactNode; titulo: string; children?: ReactNode }) {
  const peca = "grid size-14 place-items-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,#24070c,#140407)] shadow-[0_18px_40px_-16px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)]";
  return (
    <motion.div initial="initial" animate="animate" whileHover="hover" className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-[28px] py-16 text-center">
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.07) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "radial-gradient(circle at 50% 40%, #000, transparent 70%)" }} />
      <div className="relative flex h-16 items-center justify-center">
        <motion.div variants={LEQUE.e} className={cx(peca, "absolute -translate-x-9 text-faint")}><Film className="size-5" /></motion.div>
        <motion.div variants={LEQUE.d} className={cx(peca, "absolute translate-x-9 text-faint")}><Sparkles className="size-5" /></motion.div>
        <motion.div variants={LEQUE.c} className={cx(peca, "relative z-10 text-red")}>{icone}</motion.div>
      </div>
      <motion.p variants={{ initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { ...molaSuave, delay: 0.2 } } }} className="relative text-[17px] font-medium">{titulo}</motion.p>
      {children && <motion.div variants={{ initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { ...molaSuave, delay: 0.28 } } }} className="relative flex flex-col items-center gap-3">{children}</motion.div>}
    </motion.div>
  );
}

/* ---------- entrada em cascata ---------- */
export const cascata = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { ...molaSuave, delay: Math.min(i, 12) * 0.04 },
});

export function Titulo({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-[22px] font-semibold tracking-[-0.025em]">{children}</h2>
      {acao}
    </div>
  );
}

/* ---------- marca: M de fita dobrada (hastes na luz, dobras na sombra). Arte em public/marca ---------- */
// montar=true: a fita se monta (hastes sobem, dobras caem, luz passa). Usada na abertura, casada com o som em 1.4 s.
/* marca FORJA: três gotas de metal em brasa voam, se fundem (filtro gooey, ref. Metaball Morph / Gooey Blobs, 21st.dev)
   e escorrem formando um F inclinado; uma gota se solta da barra do meio e cai (a assinatura). Vidro vinho por trás,
   que se espalha como gota (ref. Liquid Glass Logo Reveal). montar = anima; vivo = a brasa respira. */
export function Marca({ tam = 32, montar = false, atraso = 0, vivo = false }: { tam?: number; montar?: boolean; atraso?: number; vivo?: boolean }) {
  const id = useId().replace(/:/g, "");
  const a = atraso;
  const mola = (d: number, s = 170, dmp = 18) => ({ type: "spring" as const, stiffness: s, damping: dmp, delay: a + d });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ini = (o: any): { initial: any } => (montar ? { initial: o } : { initial: false });
  // pontos do F (inclinado pra frente)
  const P = { topo: { x: 46, y: 31 }, meio: { x: 42.5, y: 59 }, pe: { x: 39, y: 88 } };
  const DE = [{ x: 8, y: 14 }, { x: 4, y: 70 }, { x: 30, y: 116 }];
  const ALVO = [P.topo, P.meio, P.pe];
  const tr = (d: number, dur = 0.55) => ({ delay: a + d, duration: dur, ease: [0.65, 0, 0.35, 1] as const });
  return (
    <svg width={tam} height={tam} viewBox="0 0 120 120" aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0710" /><stop offset="1" stopColor="#0a0204" /></linearGradient>
        <radialGradient id={`l${id}`} cx="0.3" cy="0.05" r="0.9"><stop offset="0" stopColor="#ff3341" stopOpacity=".35" /><stop offset="1" stopColor="#e11d2a" stopOpacity="0" /></radialGradient>
        {/* metal em brasa: branco quente no alto, vermelho, vinho embaixo */}
        <linearGradient id={`g${id}`} x1="0.2" y1="0" x2="0.6" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(120)">
          <stop offset="0" stopColor="#ffd9cc" /><stop offset=".22" stopColor="#ff5a5f" /><stop offset=".55" stopColor="#e11d2a" /><stop offset="1" stopColor="#7a0a17" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".24" /><stop offset=".5" stopColor="#fff" stopOpacity=".03" /><stop offset="1" stopColor="#fff" stopOpacity=".1" /></linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".3" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <filter id={`goo${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <filter id={`gl${id}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
        <clipPath id={`c${id}`}><rect x="2" y="2" width="116" height="116" rx="31" /></clipPath>
      </defs>

      {/* vidro: cai como gota e se espalha no ícone */}
      <motion.rect fill={`url(#f${id})`} {...ini({ x: 46, y: 46, width: 28, height: 28, rx: 14 })}
        animate={{ x: 2, y: 2, width: 116, height: 116, rx: 31 }} transition={mola(0, 120, 15)} />
      <motion.rect x="2" y="2" width="116" height="116" rx="31" fill={`url(#l${id})`} {...ini({ opacity: 0 })} animate={{ opacity: 1 }} transition={{ delay: a + 0.3, duration: 0.6 }} />
      <motion.rect x="2.5" y="2.5" width="115" height="115" rx="30.5" fill="none" stroke={`url(#b${id})`} {...ini({ opacity: 0 })} animate={{ opacity: 1 }} transition={{ delay: a + 0.25, duration: 0.5 }} />

      {/* calor por trás do F */}
      <motion.ellipse cx="58" cy="60" rx="26" ry="30" fill="#e11d2a" filter={`url(#gl${id})`} {...ini({ opacity: 0 })}
        animate={vivo ? { opacity: [0.28, 0.5, 0.28] } : { opacity: 0.34 }}
        transition={vivo ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" } : { delay: a + 1.2, duration: 0.7 }} />

      {/* o metal líquido */}
      <g filter={`url(#goo${id})`} clipPath={`url(#c${id})`} fill={`url(#g${id})`} stroke={`url(#g${id})`}>
        {/* três gotas voam até os nós do F */}
        {ALVO.map((v, i) => (
          <motion.circle key={i} stroke="none" {...ini({ cx: DE[i].x, cy: DE[i].y, r: 4 })}
            animate={{ cx: v.x, cy: v.y, r: 8.6 }} transition={mola(0.3 + i * 0.1, 120, 14)} />
        ))}
        {/* e escorrem virando as hastes */}
        <motion.path d={`M${P.topo.x} ${P.topo.y} L${P.pe.x} ${P.pe.y}`} fill="none" strokeWidth="17" strokeLinecap="round"
          {...ini({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tr(0.75)} />
        <motion.path d={`M${P.topo.x} ${P.topo.y} L87 ${P.topo.y}`} fill="none" strokeWidth="17" strokeLinecap="round"
          {...ini({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tr(0.9)} />
        <motion.path d={`M${P.meio.x} ${P.meio.y} L73 ${P.meio.y}`} fill="none" strokeWidth="16" strokeLinecap="round"
          {...ini({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tr(1.0)} />
        {/* a gota que se solta da barra do meio e cai */}
        <motion.circle stroke="none" {...ini({ cx: 72, cy: 59, r: 6 })}
          animate={vivo ? { cx: 80, cy: [87, 88.5, 87], r: 7.4 } : { cx: 80, cy: 87, r: 7.4 }}
          transition={vivo ? { cy: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } } : { delay: a + 1.45, type: "spring", stiffness: 90, damping: 9 }} />
      </g>
      {/* fio de luz no alto do metal */}
      <motion.path d="M47 26.5 L82 26.5" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" fill="none"
        {...ini({ pathLength: 0, opacity: 0 })} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: a + 1.55, duration: 0.45 }} />

      {montar && (
        <g clipPath={`url(#c${id})`}>
          <motion.rect y="0" width="56" height="120" fill={`url(#s${id})`} transform="skewX(-18)"
            initial={{ x: -90 }} animate={{ x: 190 }} transition={{ delay: a + 1.75, duration: 0.9, ease: [0.4, 0, 0.2, 1] }} />
        </g>
      )}
    </svg>
  );
}

/* ---------- cabeçalho de tela: título + número + ação à direita ---------- */
export function Cabecalho({ titulo, n, children }: { titulo: string; n?: number; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <motion.h1 initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={molaSuave}
        className="flex items-baseline gap-2 text-[clamp(26px,4vw,36px)] font-semibold tracking-[-0.035em]">
        {titulo}{n ? <Numero valor={n} className="text-[15px] font-medium tracking-normal text-faint" /> : null}
      </motion.h1>
      {children}
    </div>
  );
}

/* ---------- estado ocupado do card: fundo vivo, etapas reais, tempo decorrido ---------- */
const OCUPADOS = ["na-fila", "rodando", "gerando", "editando"];
const ETAPAS = ["Roteiro", "Voz", "Montagem", "Vídeo", "Revisão"];
const ETAPA_DE: Record<string, number> = { roteiro: 0, revisando: 0, voz: 1, montando: 2, renderizando: 3, render: 3, checando: 4 };
const fmtT = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function useRelogio(ativo: boolean) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => { if (!ativo) return; const id = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(id); }, [ativo]);
  return t;
}

/* tira do texto do card o que é instrução interna do roteiro: [ESCOLHIDO ...], numeração e aspas */
export const limpo = (s?: string) => (s || "").replace(/\[[^\]]*\]/g, "").replace(/^\s*\d+[.)]\s*/, "").replace(/["“”]/g, "").replace(/\s+/g, " ").trim();

function Ocupado({ fundo, texto, status, fase, desde }: { fundo?: string | null; texto?: string; status?: string; fase?: string; desde?: number }) {
  const t = useRelogio(true);
  const et = fase ? ETAPA_DE[fase] : undefined;
  const rotulo = fase ? nomeStatus(fase) : nomeStatus(status);
  const seg = desde ? Math.max(0, t / 1000 - desde) : null;
  return (
    <span className="absolute inset-0 flex flex-col overflow-hidden text-left">
      {fundo ? (
        <img src={fundo} alt="" className="busy-push absolute inset-0 size-full scale-110 object-cover opacity-60 blur-xl brightness-[0.55] saturate-[0.9]" />
      ) : (
        <span className="absolute inset-0" style={{ background: "linear-gradient(160deg,#3a0711,#160307 60%,#0b0204)" }}>
          <span className="busy-blob absolute -left-1/4 top-[8%] size-[90%] rounded-full bg-[#e11d2a]/50 blur-3xl" />
          <span className="busy-blob absolute -right-1/3 bottom-[5%] size-[80%] rounded-full bg-[#9b1226]/70 blur-3xl [animation-delay:-6s] [animation-direction:reverse]" />
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      <span className="busy-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      <span className="relative mt-11 px-3.5">
        <span className="line-clamp-3 text-[12.5px] font-medium leading-snug tracking-tight text-ink/85">{texto}</span>
      </span>
      <span className="relative mt-auto flex flex-col gap-2 px-3.5 pb-3.5">
        <span className="flex gap-1" aria-hidden>
          {ETAPAS.map((n, k) => (
            <span key={n} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
              {et !== undefined && k < et && <span className="absolute inset-0 rounded-full bg-red" />}
              {(et === k || (et === undefined && k === 0)) && <span className="busy-bar absolute inset-y-0 w-2/5 rounded-full bg-red" />}
            </span>
          ))}
        </span>
        <span className="flex items-center justify-between gap-2 text-[11px] font-medium text-ink/70">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={rotulo} initial={{ opacity: 0, y: 6, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(3px)" }} transition={{ duration: 0.22 }} className="truncate">
              <TextoBrilho>{rotulo}</TextoBrilho>{et !== undefined && <span className="text-ink/40 tnum"> {et + 1}/{ETAPAS.length}</span>}
            </motion.span>
          </AnimatePresence>
          {seg !== null && <span className="tnum shrink-0">{fmtT(seg)}</span>}
        </span>
      </span>
    </span>
  );
}

/* ---------- card de vídeo 9:16 (padrão hover-to-preview do skiper/21st): capa, toca no hover, título por cima ---------- */
export function Tile({ capa, video, titulo, texto, status, fase, dur, i = 0, onClick, canto, rodape, sel, desde, fundo, id }: {
  capa?: string | null; video?: string | null; titulo?: string; texto?: string; status?: string; fase?: string; dur?: string;
  i?: number; onClick: () => void; canto?: ReactNode; rodape?: ReactNode; sel?: boolean; desde?: number; fundo?: string | null; id?: string;
}) {
  const vid = useRef<HTMLVideoElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const ocupado = !!status && OCUPADOS.includes(status);
  const inclinar = (x: number, y: number) => {
    const el = caixa.current; if (!el) return;
    const r = el.getBoundingClientRect(); const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--px", `${px * 100}%`); el.style.setProperty("--py", `${py * 100}%`);
      el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`); el.style.setProperty("--ry", `${(px - 0.5) * 14}deg`); el.style.setProperty("--s", "1.03");
    });
  };
  const soltar = () => { cancelAnimationFrame(raf.current); const el = caixa.current; if (el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.style.setProperty("--s", "1"); } };
  useEffect(() => { // celular não tem hover: o vídeo toca sozinho quando o card está no meio da tela
    const el = caixa.current, v = vid.current;
    if (!el || !v || !matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); v.style.opacity = "1"; } else { v.pause(); v.style.opacity = ""; } }, { rootMargin: "-35% 0px -35% 0px" });
    io.observe(el); return () => io.disconnect();
  }, [video]);
  const mostrarStatus = status && status !== "pronto" && status !== "enviado" && !ocupado;
  return (
    <motion.div layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...molaSuave, delay: Math.min(i, 14) * 0.035 }}
      whileTap={{ scale: 0.97 }} data-tile={id} className="[perspective:900px] scroll-mt-24">
    <div ref={caixa} data-tilt onMouseMove={(ev) => inclinar(ev.clientX, ev.clientY)} onMouseLeave={soltar}
      className={cx("group relative aspect-[9/16] overflow-hidden rounded-[22px] bg-white/[0.04] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06),0_24px_50px_-28px_rgb(0_0_0/0.9)]", sel && "ring-2 ring-red")}>
      <button onClick={() => { som.abrir(); onClick(); }} aria-label={titulo} className="absolute inset-0 cursor-pointer"
        onMouseEnter={() => vid.current?.play().catch(() => {})} onMouseLeave={() => { if (vid.current) { vid.current.pause(); vid.current.currentTime = 0; } }}>
        {ocupado ? (
          <Ocupado fundo={capa || fundo} texto={limpo(titulo) || limpo(texto)} status={status} fase={fase} desde={desde} />
        ) : capa ? (
          <>
            <span className="busy-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            <img src={capa} alt="" loading="lazy" ref={(el) => { if (el?.complete && el.naturalWidth) el.style.opacity = "1"; }} onLoad={(ev) => { ev.currentTarget.style.opacity = "1"; }}
              className="absolute inset-0 size-full object-cover opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04]" />
          </>
        ) : (
          <span className="absolute inset-0 flex items-center p-4 text-left" style={{ background: "linear-gradient(160deg,#3a0711,#160307 60%,#0b0204)" }}>
            <span className="line-clamp-6 text-[15px] font-semibold leading-snug tracking-tight text-ink/90">{limpo(texto) || limpo(titulo)}</span>
          </span>
        )}
        {video && <video ref={vid} src={video} muted playsInline loop preload="none" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        {!ocupado && capa && titulo && (
          <span className={cx("absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-12 text-left", !!canto && "pr-12")}>
            <span className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight">{titulo}</span>
          </span>
        )}
      </button>
      {ocupado && <span className="pointer-events-none absolute left-2.5 top-2.5 flex max-w-[calc(100%-4.5rem)] rounded-full bg-black/55 px-2 py-1 backdrop-blur"><Status status={status} fase={undefined} /></span>}
      {mostrarStatus && <span className="pointer-events-none absolute left-2.5 top-2.5 flex max-w-[calc(100%-4.5rem)] rounded-full bg-black/55 px-2 py-1 backdrop-blur"><Status status={status} fase={fase} /></span>}
      {dur && <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur tnum">{dur}</span>}
      <span aria-hidden className="tilt-luz" />
      {canto}
      {rodape}
    </div>
    </motion.div>
  );
}

/* grade padrão dos cards */
export const GRADE = "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5";

/* excluir com confirmação no próprio botão: 1º toque arma, 2º exclui (3 s pra desistir) */
export function Excluir({ onConfirmar, rotulo = "Excluir" }: { onConfirmar: () => Promise<void> | void; rotulo?: string }) {
  const [certeza, setCerteza] = useState(false);
  useEffect(() => { if (!certeza) return; const k = setTimeout(() => setCerteza(false), 3000); return () => clearTimeout(k); }, [certeza]);
  return (
    <Botao onClick={() => { if (!certeza) { som.toque(); setCerteza(true); } else onConfirmar(); }} className={certeza ? "bg-red text-white" : "text-mute"}>
      <Trash2 className="size-4" /> {certeza ? "Toque de novo pra excluir" : rotulo}
    </Botao>
  );
}

/* lixeira no canto do card: 1º toque vira "Excluir?" em vermelho, 2º exclui. Sempre visível no celular; no computador aparece no hover */
export function LixeiraCanto({ onConfirmar, className }: { onConfirmar: () => Promise<void> | void; className?: string }) {
  const [certeza, setCerteza] = useState(false);
  useEffect(() => { if (!certeza) return; const k = setTimeout(() => setCerteza(false), 3000); return () => clearTimeout(k); }, [certeza]);
  return (
    <button aria-label={certeza ? "Confirmar exclusão" : "Excluir"}
      onClick={(ev) => { ev.stopPropagation(); if (!certeza) { som.toque(); setCerteza(true); } else onConfirmar(); }}
      className={cx("absolute z-10 grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-full backdrop-blur transition-[opacity,background-color]",
        certeza ? "bg-red px-3.5 text-[13px] font-semibold text-white opacity-100" : "bg-black/55 text-white/85 hover:bg-black/75 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100",
        className ?? "right-2.5 top-2.5")}>
      {certeza ? "Excluir?" : <Trash2 className="size-4" />}
    </button>
  );
}
