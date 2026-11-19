/* Calendário de posts (referência: calendário do OpusClip / Buffer):
   mês em grade, cada dia mostra as miniaturas dos posts com hora; a fila fica numa faixa em cima e cada vídeo
   é arrastado pro dia (ou tocado, no celular). Agendar abre uma folha com dia, hora, redes e legenda.
   "Programar a fila" distribui o que falta em 3 horários por dia, a partir de amanhã. */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, Trash2, Wand2 } from "lucide-react";
import { atualizar, post } from "../api";
import { Botao, Folha, cx, mola, molaSuave, useAviso } from "../ui";
import { som } from "../sons";

export type Agendado = { id: string; ref: string; quando: string; redes: string[]; legenda?: string; status: "agendado" | "avisado" };
export type ItemCal = { ref: string; titulo: string; capa?: string | null; video: string; legenda?: string; hashtags?: string; redes: Set<string>; origem: string };

const REDES = [
  { v: "instagram", nome: "Instagram", sigla: "IG", cor: "#e1306c" },
  { v: "tiktok", nome: "TikTok", sigla: "TT", cor: "#25f4ee" },
  { v: "youtube", nome: "YouTube", sigla: "YT", cor: "#ff3b30" },
] as const;
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORARIOS = ["12:00", "18:00", "21:00"]; // pico de Reels no Brasil: almoço, fim de tarde, noite
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const mesNome = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

/* capa quando existe; sem capa (ou capa quebrada), o primeiro quadro do próprio vídeo */
function Miniatura({ x, className }: { x: ItemCal; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  return x.capa && !falhou
    ? <img src={x.capa} alt="" loading="lazy" draggable={false} onError={() => setFalhou(true)} className={cx("object-cover", className)} />
    : <video src={`${x.video}#t=0.5`} muted playsInline preload="metadata" className={cx("pointer-events-none object-cover", className)} />;
}

function Agendar({ x, ag, dia, fechar }: { x: ItemCal; ag?: Agendado; dia?: string; fechar: () => void }) {
  const [data, setData] = useState(ag?.quando.slice(0, 10) ?? dia ?? iso(new Date(Date.now() + 864e5)));
  const [hora, setHora] = useState(ag?.quando.slice(11) ?? "18:00");
  const [redes, setRedes] = useState<string[]>(ag?.redes ?? ["instagram", "tiktok", "youtube"]);
  const [legenda, setLegenda] = useState(ag?.legenda ?? [x.legenda, x.hashtags].filter(Boolean).join("\n\n"));
  const [salvando, setSalvando] = useState(false);
  const avisar = useAviso();
  const salvar = async () => {
    setSalvando(true);
    try {
      const r = await post("/api/agendar", { id: ag?.id, ref: x.ref, quando: `${data}T${hora}`, redes, legenda });
      if (r.erro) throw new Error(r.erro);
      som.ok(); avisar(`Agendado pra ${new Date(`${data}T${hora}`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })} às ${hora}`); atualizar(); fechar();
    } catch (er) { avisar((er as Error).message, true); }
    setSalvando(false);
  };
  const campo = "min-h-11 w-full rounded-[12px] bg-white/[0.06] px-3.5 text-[15px] outline-none ring-1 ring-white/[0.06] focus:ring-2 focus:ring-red/60 [color-scheme:dark]";
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <video src={x.video} poster={x.capa ?? undefined} muted loop autoPlay playsInline className="mx-auto aspect-[9/16] w-full max-w-[220px] shrink-0 rounded-[20px] bg-black object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-8">
        <div className="pr-12">
          <span className="text-[13px] text-faint">{ag ? "Reagendar" : "Agendar post"}</span>
          <h3 className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.02em]">{x.titulo}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5"><span className="text-[13px] text-mute">Dia</span><input type="date" value={data} onChange={(e) => setData(e.target.value)} className={campo} /></label>
          <label className="flex flex-col gap-1.5"><span className="text-[13px] text-mute">Hora</span><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={campo} /></label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HORARIOS.map((h) => (
            <button key={h} onClick={() => { som.toque(); setHora(h); }} className={cx("min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-medium tnum transition-colors", hora === h ? "bg-white/15 text-ink" : "bg-white/[0.05] text-mute hover:text-ink")}>{h}</button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-mute">Redes</span>
          <div className="flex flex-wrap gap-2">
            {REDES.map((r) => {
              const on = redes.includes(r.v);
              return (
                <motion.button key={r.v} whileTap={{ scale: 0.92 }} transition={mola} aria-pressed={on} onClick={() => { som.toque(); setRedes(on ? redes.filter((y) => y !== r.v) : [...redes, r.v]); }}
                  className={cx("inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors", on ? "bg-white/[0.12] text-ink shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]" : "bg-white/[0.04] text-faint hover:text-mute")}>
                  <span className="size-2 rounded-full transition-opacity" style={{ background: r.cor, opacity: on ? 1 : 0.3 }} />{r.nome}
                </motion.button>
              );
            })}
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-mute">Legenda</span>
          <textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={5} className={cx(campo, "resize-none py-3 leading-relaxed")} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Botao tipo="principal" carregando={salvando} disabled={!redes.length} onClick={salvar}><CalendarPlus className="size-4" /> {ag ? "Salvar" : "Agendar"}</Botao>
          {ag && (
            <Botao tipo="fantasma" onClick={async () => { await post("/api/desagendar", { id: ag.id }); som.toque(); avisar("Tirado do calendário."); atualizar(); fechar(); }}>
              <Trash2 className="size-4" /> Tirar do calendário
            </Botao>
          )}
        </div>
      </div>
    </div>
  );
}

export function Calendario({ itens, agenda }: { itens: ItemCal[]; agenda: Agendado[] }) {
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sobre, setSobre] = useState<string | null>(null); // dia com algo sendo arrastado por cima
  const [aberto, setAberto] = useState<{ x: ItemCal; ag?: Agendado; dia?: string } | null>(null);
  const [diaSel, setDiaSel] = useState<string>(iso(new Date()));
  const [pegando, setPegando] = useState<ItemCal | null>(null); // celular: tocou num vídeo da fila, agora toca no dia
  const avisar = useAviso();
  const porRef = useMemo(() => new Map(itens.map((x) => [x.ref, x])), [itens]);
  const agendados = new Set(agenda.map((a) => a.ref));
  const fila = itens.filter((x) => x.redes.size === 0 && !agendados.has(x.ref));
  const porDia = useMemo(() => { const m = new Map<string, Agendado[]>(); agenda.forEach((a) => { const k = a.quando.slice(0, 10); m.set(k, [...(m.get(k) ?? []), a]); }); return m; }, [agenda]);
  const hoje = iso(new Date());
  const celulas = useMemo(() => {
    const ini = new Date(mes); ini.setDate(1 - mes.getDay());
    return Array.from({ length: 42 }, (_, k) => { const d = new Date(ini); d.setDate(ini.getDate() + k); return d; });
  }, [mes]);
  const largar = (dia: string, ref?: string) => {
    setSobre(null);
    const x = ref ? porRef.get(ref) : pegando;
    if (!x) return;
    if (dia < hoje) { avisar("Esse dia já passou.", true); return; }
    som.abrir(); setPegando(null); setAberto({ x, dia });
  };
  const programarFila = async () => {
    const livres: string[] = [];
    const ocupados = new Set(agenda.map((a) => a.quando));
    for (let d = 1; livres.length < fila.length && d < 120; d++) {
      const dia = iso(new Date(Date.now() + d * 864e5));
      HORARIOS.forEach((h) => { if (!ocupados.has(`${dia}T${h}`) && livres.length < fila.length) livres.push(`${dia}T${h}`); });
    }
    try {
      for (const [k, x] of fila.entries()) await post("/api/agendar", { ref: x.ref, quando: livres[k], redes: ["instagram", "tiktok", "youtube"], legenda: [x.legenda, x.hashtags].filter(Boolean).join("\n\n") });
      som.ok(); avisar(`${fila.length} posts programados, 3 por dia a partir de amanhã.`); atualizar();
    } catch (er) { avisar((er as Error).message, true); }
  };
  const doDia = (porDia.get(diaSel) ?? []).sort((a, b) => a.quando.localeCompare(b.quando));

  return (
    <div className="flex flex-col gap-5">
      {/* fila: arrasta pro dia (computador) ou toca e depois toca no dia (celular) */}
      {fila.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13.5px] text-mute"><span className="font-medium text-ink tnum">{fila.length}</span> na fila · <span className="hidden sm:inline">arraste pro dia</span><span className="sm:hidden">toque e escolha o dia</span></p>
            <Botao tipo="vidro" className="min-h-10 shrink-0 whitespace-nowrap px-4 text-[13.5px]" onClick={programarFila}><Wand2 className="size-4" /> Programar<span className="hidden sm:inline"> a fila</span></Botao>
          </div>
          <div className="scroll-x -mx-1 flex gap-2 px-1 pb-1">
            {fila.map((x) => (
              <button key={x.ref} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", x.ref); e.dataTransfer.effectAllowed = "move"; }}
                onClick={() => { som.toque(); setPegando(pegando?.ref === x.ref ? null : x); }} aria-pressed={pegando?.ref === x.ref} title={x.titulo}
                className={cx("relative aspect-[9/16] w-[64px] shrink-0 cursor-grab overflow-hidden rounded-[12px] bg-white/[0.05] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition active:cursor-grabbing",
                  pegando?.ref === x.ref && "ring-2 ring-red ring-offset-2 ring-offset-[#0b0104]")}>
                <Miniatura x={x} className="size-full" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="vidro overflow-hidden rounded-[22px]">
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <h2 className="whitespace-nowrap text-[16px] font-semibold tracking-tight first-letter:uppercase sm:text-[17px]">{mesNome(mes)}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => { som.toque(); const d = new Date(); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); setDiaSel(hoje); }} className="min-h-10 cursor-pointer rounded-full px-3 text-[13.5px] font-medium text-mute hover:bg-white/[0.06] hover:text-ink">Hoje</button>
            <button aria-label="Mês anterior" onClick={() => { som.toque(); setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1)); }} className="grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-ink"><ChevronLeft className="size-5" /></button>
            <button aria-label="Próximo mês" onClick={() => { som.toque(); setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1)); }} className="grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-ink"><ChevronRight className="size-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-t border-white/[0.06] text-center text-[11.5px] font-medium uppercase tracking-wider text-faint">
          {DIAS.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={iso(mes)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={molaSuave}
            className="grid grid-cols-7 border-t border-white/[0.06]">
            {celulas.map((d) => {
              const k = iso(d), posts = (porDia.get(k) ?? []).sort((a, b) => a.quando.localeCompare(b.quando)), fora = d.getMonth() !== mes.getMonth(), passado = k < hoje;
              return (
                <div key={k} role="button" tabIndex={0} aria-label={`${d.getDate()}, ${posts.length} posts`}
                  onClick={() => { if (pegando) largar(k); else { som.toque(); setDiaSel(k); } }}
                  onKeyDown={(e) => e.key === "Enter" && setDiaSel(k)}
                  onDragOver={(e) => { if (!passado) { e.preventDefault(); setSobre(k); } }} onDragLeave={() => setSobre((s) => (s === k ? null : s))}
                  onDrop={(e) => { e.preventDefault(); largar(k, e.dataTransfer.getData("text/plain")); }}
                  className={cx("relative flex min-h-[64px] cursor-pointer flex-col gap-1 border-b border-r border-white/[0.05] p-1 text-left transition-colors sm:min-h-[118px] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                    fora && "opacity-40", passado && !fora && "opacity-60", sobre === k && "bg-red/15", diaSel === k && "bg-white/[0.05]", pegando && !passado && "hover:bg-red/10")}>
                  <span className={cx("grid size-6 place-items-center self-start rounded-full text-[12.5px] font-medium tnum", k === hoje ? "bg-red text-white" : "text-mute")}>{d.getDate()}</span>
                  {/* computador: miniaturas com hora; celular: pontinhos */}
                  <div className="hidden flex-col gap-1 sm:flex">
                    {posts.slice(0, 2).map((a) => {
                      const x = porRef.get(a.ref);
                      return x && (
                        <button key={a.id} draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", a.ref); }}
                          onClick={(e) => { e.stopPropagation(); som.abrir(); setAberto({ x, ag: a }); }}
                          className="flex min-w-0 items-center gap-1.5 rounded-[9px] bg-white/[0.06] p-1 pr-1.5 text-left hover:bg-white/[0.1]">
                          <Miniatura x={x} className="h-7 w-4 shrink-0 rounded-[4px]" />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold tnum">{a.quando.slice(11)}</span>
                            <span className="flex gap-0.5">{a.redes.map((r) => <span key={r} className="size-1.5 rounded-full" style={{ background: REDES.find((y) => y.v === r)?.cor }} />)}</span>
                          </span>
                        </button>
                      );
                    })}
                    {posts.length > 2 && <span className="px-1 text-[11px] text-faint">+{posts.length - 2}</span>}
                  </div>
                  {posts.length > 0 && <span className="mt-auto flex gap-0.5 self-center sm:hidden">{posts.slice(0, 3).map((a) => <span key={a.id} className="size-1.5 rounded-full bg-red" />)}</span>}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* posts do dia escolhido */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[15px] font-semibold tracking-tight first-letter:uppercase">{new Date(`${diaSel}T12:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</h3>
        {doDia.length ? doDia.map((a) => {
          const x = porRef.get(a.ref);
          return x && (
            <button key={a.id} onClick={() => { som.abrir(); setAberto({ x, ag: a }); }} className="vidro flex min-h-[64px] cursor-pointer items-center gap-3 rounded-[18px] p-2 pr-4 text-left hover:bg-white/[0.06]">
              <Miniatura x={x} className="h-14 w-8 shrink-0 rounded-[8px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-medium">{x.titulo}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-faint"><Clock className="size-3.5" /><span className="tnum">{a.quando.slice(11)}</span> · {a.redes.map((r) => REDES.find((y) => y.v === r)?.sigla).join(" · ")}{a.status === "avisado" && " · avisado"}</span>
              </span>
            </button>
          );
        }) : <p className="text-[14px] text-faint">{pegando ? "Toque num dia do calendário pra agendar." : "Nada agendado nesse dia."}</p>}
      </div>

      <Folha aberta={!!aberto} onFechar={() => setAberto(null)} larga>{aberto && <Agendar key={aberto.ag?.id ?? aberto.x.ref} {...aberto} fechar={() => setAberto(null)} />}</Folha>
    </div>
  );
}
