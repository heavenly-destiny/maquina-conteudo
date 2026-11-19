import { motion } from "motion/react";
import { PanelLeft, Search, Settings2, Volume2, VolumeX } from "lucide-react";
import { ABAS, type Aba } from "./Dock";
import { som } from "./sons";
import { Marca, cx, mola } from "./ui";
import { Luz, Numero } from "./fx";

/* barra lateral do computador (padrão Wensity/Higgsfield): marca, seções, item ativo com pílula que desliza, rodapé com a conta.
   Recolhe para trilho de ícones. No celular quem navega é o Dock. */
export function Sidebar({ aba, onAba, badges, aberta, setAberta, ligado, alternarSom, abrirConfig }: {
  aba: Aba; onAba: (a: Aba) => void; badges: Partial<Record<Aba, number>>;
  aberta: boolean; setAberta: (v: boolean) => void; ligado: boolean; alternarSom: () => void; abrirConfig: () => void;
}) {
  // cinco itens não precisam de grupo com título (o grupo "Criar" tinha um item "Criar" dentro): um separador fino basta
  const grupos: { nome: string; ids: Aba[] }[] = [
    { nome: "fazer", ids: ["inicio", "cortes", "criar"] },
    { nome: "usar", ids: ["inspirar", "postar"] },
  ];
  const item = (id: Aba) => ABAS.find((a) => a.id === id)!;
  return (
    <motion.aside
      initial={false} animate={{ width: aberta ? 248 : 76 }} transition={mola}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col bg-[#0d0305]/35 px-3 pb-4 pt-[max(16px,env(safe-area-inset-top))] shadow-[inset_-1px_0_0_rgb(255_255_255/0.08),inset_-14px_0_30px_-24px_rgb(255_120_130/0.25)] backdrop-blur-2xl backdrop-saturate-[1.8] lg:flex"
    >
      <div className={cx("mb-6 flex h-11 items-center", aberta ? "justify-between pl-1.5" : "justify-center")}>
        <button onClick={() => onAba("inicio")} className="flex cursor-pointer items-center gap-2.5" aria-label="Início">
          <Marca tam={30} />
          {aberta && <span className="text-[15px] font-semibold tracking-tight">Forja</span>}
        </button>
        {aberta && (
          <button aria-label="Recolher barra" onClick={() => { som.toque(); setAberta(false); }} className="grid size-9 cursor-pointer place-items-center rounded-full text-faint hover:bg-white/[0.06] hover:text-ink">
            <PanelLeft className="size-[18px]" />
          </button>
        )}
      </div>
      {!aberta && (
        <button aria-label="Abrir barra" onClick={() => { som.toque(); setAberta(true); }} className="mx-auto mb-4 grid size-9 cursor-pointer place-items-center rounded-full text-faint hover:bg-white/[0.06] hover:text-ink">
          <PanelLeft className="size-[18px] rotate-180" />
        </button>
      )}
      <Luz className="mb-4 rounded-[14px]">
        <button onClick={() => dispatchEvent(new Event("forja:paleta"))} aria-label="Buscar e criar" title={aberta ? undefined : "Buscar (⌘K)"}
          className={cx("flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] border border-white/[0.07] bg-white/[0.03] text-[14px] text-faint transition-colors hover:text-ink", aberta ? "px-3" : "justify-center")}>
          <Search className="size-[17px] shrink-0" />
          {aberta && <><span className="flex-1 text-left">Buscar</span><kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-mute">⌘K</kbd></>}
        </button>
      </Luz>
      <nav className="flex flex-1 flex-col gap-2">
        {grupos.map((g) => (
          <div key={g.nome} className="flex flex-col gap-1">
            {g.nome === "usar" && <span aria-hidden className="mx-3 mb-2 h-px bg-white/[0.06]" />}
            {g.ids.map((id) => {
              const a = item(id), ativa = aba === id, b = badges[id];
              return (
                <button key={id} onClick={() => { if (!ativa) { som.aba(); onAba(id); } }} aria-label={a.nome} aria-current={ativa ? "page" : undefined}
                  title={aberta ? undefined : a.nome}
                  className={cx("relative flex min-h-11 cursor-pointer items-center gap-3 rounded-[14px] text-[14.5px] font-medium transition-colors", aberta ? "px-3" : "justify-center", ativa ? "text-ink" : "text-mute hover:bg-white/[0.04] hover:text-ink")}>
                  {ativa && <motion.span layoutId="side-ativa" transition={mola} className="absolute inset-0 rounded-[14px] bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]" />}
                  {/* ponto que quica até a aba nova (Bounce Sidebar, beui.dev via 21st) */}
                  {ativa && <motion.span aria-hidden layoutId="side-ponto" transition={{ type: "spring", stiffness: 280, damping: 18, mass: 0.3 }}
                    className="absolute -left-[3px] top-[calc(50%-3px)] size-1.5 rounded-full bg-red shadow-[0_0_10px_2px_rgb(225_29_42/0.7)]" />}
                  <a.Icone className={cx("relative size-[19px] shrink-0", ativa && "text-red")} strokeWidth={ativa ? 2.2 : 1.8} />
                  {aberta && <span className="relative flex-1 text-left">{a.nome}</span>}
                  {!!b && <span className={cx("relative grid h-5 min-w-5 place-items-center rounded-full bg-red px-1.5 text-[11px] font-semibold text-white tnum", !aberta && "absolute right-1 top-0.5 h-4 min-w-4 px-1 text-[10px]")}><Numero valor={b} /></span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className={cx("flex gap-1 border-t border-white/[0.06] pt-3", aberta ? "items-center" : "flex-col items-center")}>
        <button onClick={abrirConfig} className={cx("flex min-h-11 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-[14px] font-medium text-mute hover:bg-white/[0.04] hover:text-ink", aberta ? "px-3" : "w-11 flex-none justify-center")} aria-label="Conta e conexões">
          <Settings2 className="size-[18px] shrink-0" />{aberta && "Conta"}
        </button>
        <button aria-label={ligado ? "Desligar sons" : "Ligar sons"} onClick={alternarSom} className="grid size-11 cursor-pointer place-items-center rounded-[14px] text-mute hover:bg-white/[0.04] hover:text-ink">
          {ligado ? <Volume2 className="size-[18px]" /> : <VolumeX className="size-[18px]" />}
        </button>
      </div>
    </motion.aside>
  );
}
