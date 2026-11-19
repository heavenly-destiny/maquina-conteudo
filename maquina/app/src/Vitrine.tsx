/* Vitrine no padrão dos marketplaces de componentes (21st.dev, Skiper UI, Aceternity):
   seção com título + contagem + "Ver tudo", fileira horizontal com setas, card com prévia em vídeo no hover
   e informação embaixo do card, ranking numerado "Em alta". */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { som } from "./sons";
import { cx, molaSuave } from "./ui";

export function Secao({ titulo, sub, total, verTudo, children, i = 0 }: { titulo: string; sub?: string; total?: number; verTudo?: () => void; children: ReactNode; i?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...molaSuave, delay: Math.min(i, 6) * 0.05 }} className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-baseline gap-2 text-[18px] font-semibold tracking-[-0.02em]">
            {titulo}{total != null && <span className="text-[13px] font-medium text-faint tnum">{total}</span>}
          </h2>
          {sub && <p className="mt-0.5 text-[13.5px] text-faint">{sub}</p>}
        </div>
        {verTudo && (
          <button onClick={() => { som.toque(); verTudo(); }} className="flex min-h-10 shrink-0 cursor-pointer items-center gap-0.5 rounded-full px-3 text-[13.5px] font-medium text-mute transition-colors hover:bg-white/[0.06] hover:text-ink">
            Ver tudo <ChevronRight className="size-4" />
          </button>
        )}
      </div>
      {children}
    </motion.section>
  );
}

/* fileira horizontal: arrasta no celular, setas no computador; as bordas somem com máscara quando há mais conteúdo */
export function Fileira({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lados, setLados] = useState({ esq: false, dir: false });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => setLados({ esq: el.scrollLeft > 4, dir: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    medir(); el.addEventListener("scroll", medir, { passive: true });
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => { el.removeEventListener("scroll", medir); ro.disconnect(); };
  }, []);
  const passo = (d: number) => { const el = ref.current; if (el) { som.toque(); el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" }); } };
  const seta = "vidro absolute top-[38%] z-10 hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] transition-opacity sm:grid";
  return (
    <div className="group/fileira relative -mx-[max(16px,env(safe-area-inset-left))] lg:-mx-10">
      <div ref={ref} data-esq={lados.esq ? "1" : "0"} data-transborda={lados.dir ? "1" : "0"}
        className="scroll-x flex snap-x snap-mandatory gap-3 px-[max(16px,env(safe-area-inset-left))] pb-1 scroll-px-[max(16px,env(safe-area-inset-left))] lg:px-10 lg:scroll-px-10">
        {children}
      </div>
      {lados.esq && <button aria-label="Anteriores" onClick={() => passo(-1)} className={cx(seta, "left-3 opacity-0 group-hover/fileira:opacity-100 lg:left-5")}><ChevronLeft className="size-5" /></button>}
      {lados.dir && <button aria-label="Próximos" onClick={() => passo(1)} className={cx(seta, "right-3 opacity-0 group-hover/fileira:opacity-100 lg:right-5")}><ChevronRight className="size-5" /></button>}
    </div>
  );
}

/* card da vitrine: mídia 9:16 com vídeo que toca no hover (só carrega quando o mouse entra), título e meta embaixo */
export function CardVitrine({ img, video, titulo, meta, selo, rank, i, onClick, canto, largura = "w-[42vw] max-w-[188px] sm:w-[188px]" }: {
  img?: string | null; video?: string | null; titulo?: string; meta?: ReactNode; selo?: ReactNode; rank?: number; i: number; onClick: () => void; canto?: ReactNode; largura?: string;
}) {
  const vid = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const entrar = () => { const v = vid.current; if (v) { v.play().then(() => setTocando(true)).catch(() => {}); } };
  const sair = () => { const v = vid.current; if (v) { v.pause(); v.currentTime = 0; } setTocando(false); };
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => { // celular não tem hover: toca o card que está no meio da tela
    const el = caixa.current;
    if (!el || !video || !matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? entrar() : sair()), { rootMargin: "-30% -30% -30% -30%" });
    io.observe(el); return () => io.disconnect();
  }, [video]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <motion.div initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ ...molaSuave, delay: Math.min(i, 10) * 0.035 }}
      className={cx("group relative shrink-0 snap-start", rank != null ? "flex items-end" : largura)}>
      {rank != null && (
        <span aria-hidden className="pointer-events-none relative z-0 -mr-1.5 mb-12 select-none text-[clamp(80px,12vw,118px)] font-bold leading-[0.78] tracking-[-0.08em] text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.28)] transition-[-webkit-text-stroke-color] duration-300 group-hover:[-webkit-text-stroke-color:rgb(225_29_42/0.9)]">
          {rank}
        </span>
      )}
      <div ref={caixa} className={cx("relative z-10", rank != null && largura)}>
        <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <button onClick={() => { som.abrir(); onClick(); }} onMouseEnter={entrar} onMouseLeave={sair} onFocus={entrar} onBlur={sair} aria-label={titulo || "Abrir"}
          className="relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[18px] bg-white/[0.04] text-left shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07),0_24px_50px_-30px_rgb(0_0_0/0.9)]">
          {img ? <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            : <span className="flex size-full items-end p-3 text-[13px] font-semibold leading-snug" style={{ background: "linear-gradient(160deg,#3a0711,#0b0204)" }}>{titulo}</span>}
          {video && <video ref={vid} src={video} muted playsInline loop preload="none" className={cx("pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300", tocando ? "opacity-100" : "opacity-0")} />}
          {video && !tocando && (
            <span aria-hidden className="absolute bottom-2 left-2 grid size-7 place-items-center rounded-full bg-black/45 text-white/90 backdrop-blur transition-opacity group-hover:opacity-0">
              <Play className="size-3 fill-current" />
            </span>
          )}
          {selo && <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur tnum">{selo}</span>}
        </button>
        {canto}
        </div>
        <div className="mt-2 px-0.5">
          <p className="line-clamp-1 text-[13.5px] font-medium leading-snug">{titulo}</p>
          {meta && <p className="mt-0.5 line-clamp-1 text-[12px] text-faint">{meta}</p>}
        </div>
      </div>
    </motion.div>
  );
}
