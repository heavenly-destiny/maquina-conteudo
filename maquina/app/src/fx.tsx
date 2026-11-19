/* Efeitos tirados do 21st.dev e adaptados aos tokens da Forja (vinho + vermelho #e11d2a).
   - TextoBrilho: Text Shimmer (serafimcloud, 21st.dev Agent Elements) — status de tarefa rodando.
   - Numero: Number Flow (soralabs) — dígitos que rolam como odômetro quando o valor muda.
   - Luz: Spotlight (kevingirelli) — luz que segue o ponteiro na superfície e acende a borda mais próxima. */
import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cx } from "./ui";

export function TextoBrilho({ children, as: C = "span", className, duracao = 1.8 }: { children: ReactNode; as?: ElementType; className?: string; duracao?: number }) {
  return <C className={cx("texto-brilho", className)} style={{ "--brilho-dur": `${duracao}s` } as CSSProperties}>{children}</C>;
}

/* cada dígito é uma coluna 0-9 que desliza com mola até o número certo; separadores entram com blur */
function Digito({ d, reduz }: { d: number; reduz: boolean }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none" style={{ width: "0.62em" }}>
      <motion.span className="absolute inset-x-0 top-0 flex flex-col items-center" initial={false}
        animate={{ y: `${-d}em` }} transition={reduz ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}>
        {Array.from({ length: 10 }, (_, k) => <span key={k} className="block h-[1em] leading-none">{k}</span>)}
      </motion.span>
    </span>
  );
}

export function Numero({ valor, className, formato }: { valor: number; className?: string; formato?: Intl.NumberFormatOptions }) {
  const reduz = !!useReducedMotion();
  const partes = new Intl.NumberFormat("pt-BR", formato).formatToParts(valor);
  type Parte = { t: "d" | "s"; v: string };
  const digitos = partes.flatMap((p): Parte[] => (p.type === "integer" || p.type === "fraction" ? [...p.value].map((c) => ({ t: "d", v: c })) : [{ t: "s", v: p.value }]));
  const n = digitos.length;
  return (
    <span className={cx("tnum inline-flex items-baseline", className)} aria-label={new Intl.NumberFormat("pt-BR", formato).format(valor)}>
      <span aria-hidden className="inline-flex">
        <AnimatePresence initial={false} mode="popLayout">
          {digitos.map((x, i) => (
            <motion.span key={n - i} layout="position" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }} className="inline-flex">
              {x.t === "d" ? <Digito d={Number(x.v)} reduz={reduz} /> : <span className="leading-none">{x.v}</span>}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </span>
  );
}

const ANEL = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";
export function Luz({ children, className, tam = 340, cor = "#e11d2a", anel = true, ...p }: { children: ReactNode; className?: string; tam?: number; cor?: string; anel?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  const f = useRef(0);
  useEffect(() => () => cancelAnimationFrame(f.current), []);
  const circ = `${tam}px circle at var(--sx, 50%) var(--sy, 50%)`;
  const luz = "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/luz:opacity-100 group-focus-within/luz:opacity-100 motion-reduce:hidden";
  return (
    <div {...p} className={cx("group/luz relative isolate", className)}
      onPointerMove={(ev) => {
        p.onPointerMove?.(ev);
        if (ev.pointerType === "touch") return;
        const el = ev.currentTarget, { clientX: x, clientY: y } = ev;
        cancelAnimationFrame(f.current);
        f.current = requestAnimationFrame(() => { const b = el.getBoundingClientRect(); el.style.setProperty("--sx", `${x - b.left}px`); el.style.setProperty("--sy", `${y - b.top}px`); });
      }}>
      <span aria-hidden className={luz} style={{ background: `radial-gradient(${circ}, color-mix(in oklab, ${cor} 13%, transparent), transparent 70%)` }} />
      {anel && <span aria-hidden className={cx(luz, "-inset-px p-px")} style={{ background: `radial-gradient(${circ}, color-mix(in oklab, ${cor} 70%, transparent), transparent 60%)`, mask: ANEL, maskComposite: "exclude", WebkitMask: ANEL, WebkitMaskComposite: "xor" }} />}
      {children}
    </div>
  );
}
