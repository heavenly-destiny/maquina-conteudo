import { motion, useMotionValue, type MotionValue } from "motion/react";
import { Home, Scissors, Sparkles, Telescope, Send } from "lucide-react";
import { LiquidGlass } from "./glass";
import { som } from "./sons";
import { cx, mola } from "./ui";

export type Aba = "inicio" | "cortes" | "criar" | "inspirar" | "postar";
export const ABAS: { id: Aba; nome: string; Icone: typeof Home }[] = [
  { id: "inicio", nome: "Início", Icone: Home },
  { id: "cortes", nome: "Cortes", Icone: Scissors },
  { id: "criar", nome: "Criar", Icone: Sparkles },
  { id: "inspirar", nome: "Inspirar", Icone: Telescope },
  { id: "postar", nome: "Postar", Icone: Send },
];

// Lupa do dock no padrão do Floating Dock (aceternity, 21st.dev): distância do mouse vira escala com mola.
function Item({ aba, ativa, mx, onClick, badge }: { aba: (typeof ABAS)[number]; ativa: boolean; mx: MotionValue<number>; onClick: () => void; badge?: number }) {
  void mx;
  return (
    <button
      onClick={onClick}
      aria-label={aba.nome}
      aria-current={ativa ? "page" : undefined}
      className={cx("relative flex h-14 w-[62px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[22px] sm:w-[74px]", ativa ? "text-ink" : "text-faint hover:text-mute")}
    >
      {ativa && <motion.span layoutId="dock-ativa" transition={mola} className="absolute inset-0 rounded-[22px] bg-white/[0.1] shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]" />}
      <motion.span whileTap={{ scale: 0.86 }} transition={mola} className="relative flex flex-col items-center gap-1">
        <aba.Icone className={cx("size-[21px] transition-colors", ativa && "text-red")} strokeWidth={ativa ? 2.2 : 1.8} />
        <span className="text-[10.5px] font-medium tracking-tight">{aba.nome}</span>
      </motion.span>
      {!!badge && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={mola}
          className="absolute right-2 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[10px] font-semibold text-white tnum">
          {badge}
        </motion.span>
      )}
    </button>
  );
}

export function Dock({ aba, onAba, badges }: { aba: Aba; onAba: (a: Aba) => void; badges: Partial<Record<Aba, number>> }) {
  const mx = useMotionValue(Infinity);
  return (
    <motion.nav
      initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...mola, delay: 0.25 }}
      className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-40 flex justify-center px-3"
    >
      <LiquidGlass appearance="dark" refraction={14} interactive={false} className="rounded-[30px]" style={{ boxShadow: "0 18px 50px -12px rgb(0 0 0 / 0.75), inset 0 0 0 1px rgb(255 255 255 / 0.08)" }}>
        <div className="flex items-center gap-0.5 rounded-[30px] bg-[#120306]/75 p-1.5 backdrop-blur-xl" onMouseMove={(e) => mx.set(e.clientX)} onMouseLeave={() => mx.set(Infinity)}>
          {ABAS.map((a) => (
            <Item key={a.id} aba={a} ativa={a.id === aba} mx={mx} badge={badges[a.id]} onClick={() => { if (a.id !== aba) { som.aba(); onAba(a.id); } }} />
          ))}
        </div>
      </LiquidGlass>
    </motion.nav>
  );
}
