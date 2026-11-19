import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Download, Film, Trash2, Undo2, UploadCloud, Wand2, MessageCircle, Minus, Plus } from "lucide-react";
import { atualizar, enviarVideo, fmtTempo, notaDe, post, type Corte, type Estado, type Job } from "../api";
import { Botao, Nota, Cabecalho, Copiar, Folha, GRADE, Segmentos, Status, Tile, Topo, Vazio, cascata, cx, mola, useAviso } from "../ui";
import { som } from "../sons";
import { CardVitrine, Fileira, Secao } from "../Vitrine";
import { Configurar, type ConfigCorte } from "../Configurar";
import { LEGENDAS } from "../legendas";
import { Editor } from "./Editor";
import { Scissors } from "lucide-react";
import { Link2, ArrowUp } from "lucide-react";

type Filtro = "escolher" | "editando" | "prontos" | "todos";
const filtrar = (c: Corte, f: Filtro) =>
  f === "todos" ? c.status !== "descartado"
  : f === "escolher" ? c.status === "planejado" || !c.status
  : f === "editando" ? c.status === "editando"
  : c.status === "pronto" || c.status === "enviado";

function Upload() {
  const [prog, setProg] = useState<number | null>(null);
  const [sobre, setSobre] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const avisar = useAviso();
  // fluxo OpusClip: escolhe o vídeo (arquivo ou link) -> Configurar -> gera
  const [pend, setPend] = useState<{ f?: File; url?: string } | null>(null);
  const [link, setLink] = useState("");
  const enviar = async (f?: File) => {
    if (!f) return;
    if (!/\.(mov|mp4|m4v)$/i.test(f.name)) return avisar("Só vídeo .mov ou .mp4", true);
    som.abrir(); setPend({ f });
  };
  const gerar = async (c: ConfigCorte) => {
    const cfg = { ...c, legendaEstilo: LEGENDAS.find((l) => l.id === c.legenda) }; // o job recebe o template inteiro
    const p = pend; setPend(null);
    if (!p) return;
    if (p.url) {
      try { await post("/api/novo-link", { url: p.url, config: cfg }); setLink(""); avisar("Baixando o vídeo. Já começo a cortar."); atualizar(); }
      catch (er) { avisar((er as Error).message, true); }
      return;
    }
    setProg(0);
    try { await enviarVideo(p.f!, setProg, cfg); avisar("Recebido. Já estou cortando."); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
    setProg(null);
  };
  // referência: Halo Dropzone (cult-ui, 21st.dev): rastro de luz correndo na borda quando o vídeo chega perto
  return (
    <div className="flex flex-col gap-2.5">
    <motion.button data-luz {...cascata(0)} data-halo={sobre || prog !== null ? "on" : "off"}
      onClick={() => prog === null && inp.current?.click()}
      onDragOver={(ev) => { ev.preventDefault(); setSobre(true); }} onDragLeave={() => setSobre(false)}
      onDrop={(ev) => { ev.preventDefault(); setSobre(false); enviar(ev.dataTransfer.files[0]); }}
      whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}
      className="halo vidro group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-[24px] p-3 pr-5 text-left">
      <input ref={inp} type="file" accept="video/*,.mov" hidden onChange={(ev) => enviar(ev.target.files?.[0])} />
      <motion.span animate={{ y: sobre ? -3 : 0, rotate: sobre ? -6 : 0 }} transition={mola}
        className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-red text-white shadow-[0_10px_30px_-8px_rgb(225_29_42/0.8)]">
        <UploadCloud className="size-[22px]" />
      </motion.span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold tracking-tight">{prog === null ? (sobre ? "Pode soltar" : "Solte o vídeo cru") : `Enviando ${Math.round(prog * 100)}%`}</span>
        <span className="block text-[13px] text-faint">{prog === null ? "ou clique pra escolher" : "não feche a página"}</span>
      </span>
      {prog !== null && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/5"><motion.span className="block h-full bg-red" animate={{ width: `${prog * 100}%` }} transition={mola} /></span>}
    </motion.button>
    <form onSubmit={(ev) => { ev.preventDefault(); if (/^https?:\/\//.test(link.trim())) { som.abrir(); setPend({ url: link.trim() }); } else avisar("Cole um link de vídeo", true); }}
      className="vidro flex min-h-12 items-center gap-2 rounded-[18px] pl-4 pr-1.5">
      <Link2 className="size-4 shrink-0 text-faint" />
      <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="ou cole o link do vídeo" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-faint" />
      <button type="submit" aria-label="Usar link" disabled={!link.trim()} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-red text-white disabled:cursor-default disabled:bg-white/10 disabled:text-faint"><ArrowUp className="size-4" /></button>
    </form>
    <Folha aberta={!!pend} onFechar={() => setPend(null)} larga>
      {pend && <Configurar origem={pend.url ? { tipo: "link", nome: pend.url } : { tipo: "arquivo", nome: pend.f!.name }} onGerar={gerar} />}
    </Folha>
    </div>
  );
}
/* confirmação na própria página (window.confirm é bloqueado): 1º toque arma, 2º exclui */
function Excluir({ rotulo, onConfirmar, className, icone }: { rotulo: string; onConfirmar: () => Promise<void>; className?: string; icone?: boolean }) {
  const [armado, setArmado] = useState(false);
  const t = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <Botao tipo="fantasma" aria-label={rotulo}
      className={cx("min-h-11 hover:bg-red/10 hover:text-red", icone && !armado ? "w-11 !px-0 text-mute" : "text-red", armado && "bg-red/15 font-semibold text-red", className)}
      onClick={() => {
        if (!armado) { setArmado(true); t.current = window.setTimeout(() => setArmado(false), 3000); return; }
        window.clearTimeout(t.current); setArmado(false); onConfirmar();
      }}>
      <Trash2 className="size-4 shrink-0" /> {armado ? "Toca de novo pra excluir" : !icone && rotulo}
    </Botao>
  );
}

function CardCorte({ c, sel, onSel, onAbrir, i }: { c: Corte; sel: boolean; onSel?: () => void; onAbrir: () => void; i: number }) {
  return (
    <Tile i={i} capa={c.capa} video={c.video} titulo={c.titulo} texto={c.gancho || c.titulo} sel={sel} nota={notaDe(c) || undefined}
      status={c.status || "planejado"} fase={c.status === "editando" ? c.fase : undefined} dur={c.dur ? fmtTempo(c.dur) : undefined} onClick={onAbrir}
      canto={onSel && (
        <button aria-label="Selecionar" onClick={() => { som.toque(); onSel(); }}
          className={cx("absolute bottom-2.5 right-2.5 z-10 grid size-10 cursor-pointer place-items-center rounded-full border transition-all", sel ? "border-red bg-red text-white" : "border-white/40 bg-black/40 text-transparent backdrop-blur hover:text-white/70")}>
          <Check className="size-4" strokeWidth={3} />
        </button>
      )} />
  );
}

function Detalhe({ job, lista, idx, setIdx }: { job: Job; lista: Corte[]; idx: number; setIdx: (i: number | null) => void }) {
  const c = lista[idx];
  const [nota, setNota] = useState("");
  const [cru, setCru] = useState(false);
  const [editor, setEditor] = useState(false);
  const avisar = useAviso();
  if (!c) return null;
  const mudar = (d: number) => { som.aba(); setCru(false); setNota(""); setIdx((idx + d + lista.length) % lista.length); };
  useEffect(() => { // ← → passa de corte com o teclado (fora de campo de texto)
    const k = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).closest("input,textarea,[contenteditable]")) return;
      if (ev.key === "ArrowRight") mudar(1); else if (ev.key === "ArrowLeft") mudar(-1);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  });
  const fonte = cru || !c.video ? `/bruto?job=${encodeURIComponent(job.id)}#t=${c.inicio},${c.fim}` : c.video;
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <div className={cx("mx-auto w-full shrink-0 self-start overflow-hidden rounded-[20px] bg-black", cru || !c.video ? "sm:w-[440px] aspect-video" : "max-w-[300px] aspect-[9/16]")}>
        <video key={fonte} src={fonte} controls autoPlay playsInline className="size-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-8">
        <div className="flex flex-col gap-2 pr-10">
          <Status status={c.status || "planejado"} fase={c.fase} />
          <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.02em]">{c.titulo}</h3>
          <span className="text-[13px] text-faint tnum">{fmtTempo(c.inicio)} a {fmtTempo(c.fim)} do vídeo cru</span>
        </div>
        {c.viral && <PainelViral v={c.viral} />}
        {c.legenda && (
          <div className="vidro rounded-[18px] p-4">
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">{c.legenda}</p>
            {c.hashtags && <p className="mt-2 text-[13px] text-mute">{c.hashtags}</p>}
            <div className="mt-3 flex gap-2"><Copiar texto={`${c.legenda}\n\n${c.hashtags ?? ""}`.trim()} rotulo="Copiar legenda" /></div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {(c.status === "planejado" || !c.status) && (
            <Botao tipo="principal" onClick={async () => { await post("/api/editar", { job: job.id, ns: [c.n] }); avisar("Editando esse corte"); atualizar(); }}>
              <Wand2 className="size-4" /> Editar
            </Botao>
          )}
          {c.video && (c.status === "pronto" || c.status === "revisar" || c.status === "enviado") && (
            <Botao tipo="principal" onClick={() => { som.abrir(); setEditor(true); }}><Scissors className="size-4" /> Editar vídeo</Botao>
          )}
          {editor && <Editor job={job.id} n={c.n} onFechar={() => setEditor(false)} />}
          {c.video && <a href={`${c.video}&baixar=1`} onClick={() => som.ok()} className="vidro inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium hover:bg-white/10"><Download className="size-4" /> Baixar</a>}
          {c.video && <Botao onClick={() => setCru(!cru)}><Film className="size-4" />{cru ? "Ver editado" : "Ver cru"}</Botao>}
          {c.status !== "descartado" && c.status !== "editando" && (
            <Botao tipo="fantasma" onClick={async () => { await post("/api/descartar", { job: job.id, n: c.n, sim: true }); avisar("Descartado"); atualizar(); }}><Trash2 className="size-4" /> Descartar</Botao>
          )}
          {c.status === "descartado" && (
            <Botao tipo="fantasma" onClick={async () => { await post("/api/descartar", { job: job.id, n: c.n, sim: false }); avisar("Voltou pra lista"); atualizar(); }}><Undo2 className="size-4" /> Voltar</Botao>
          )}
          {c.status !== "editando" && (
            <Excluir rotulo="Excluir" onConfirmar={async () => {
              try { await post("/api/excluir-corte", { job: job.id, n: c.n }); setIdx(null); avisar("Vídeo excluído. Está na Lixeira."); atualizar(); }
              catch (er) { avisar((er as Error).message, true); }
            }} />
          )}
        </div>
        {c.video && (
          <div className="flex flex-col gap-2">
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="O que mudar? Ex.: corta a primeira frase"
              className="vidro w-full resize-none rounded-[16px] px-4 py-3 text-[15px] outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
            <Botao disabled={!nota.trim()} onClick={async () => { await post("/api/refazer", { job: job.id, n: c.n, nota }); setNota(""); avisar("Ajustando. Te aviso quando ficar pronto."); atualizar(); }} className="self-start">
              <Wand2 className="size-4" /> Ajustar
            </Botao>
          </div>
        )}
        {lista.length > 1 && (
          <div className="mt-auto flex items-center justify-between pt-2">
            <Botao tipo="fantasma" aria-label="Anterior" onClick={() => mudar(-1)}><ChevronLeft className="size-4" /></Botao>
            <span className="text-[13px] text-faint tnum">{idx + 1} de {lista.length}</span>
            <Botao tipo="fantasma" aria-label="Próximo" onClick={() => mudar(1)}><ChevronRight className="size-4" /></Botao>
          </div>
        )}
      </div>
    </div>
  );
}

/* nota de viral do corte: número grande + as 4 notas e o porquê (estilo OpusClip) */
function PainelViral({ v }: { v: NonNullable<Corte["viral"]> }) {
  const itens: [string, number][] = [["Gancho", v.gancho], ["Ritmo", v.ritmo], ["Valor", v.valor], ["Tendência", v.tendencia]];
  return (
    <div className="vidro flex flex-col gap-3.5 rounded-[18px] p-4">
      <div className="flex items-center gap-3">
        <span className={cx("text-[34px] font-bold leading-none tracking-[-0.04em] tnum", v.nota >= 80 ? "text-red" : v.nota >= 65 ? "text-[#ff5a64]" : "text-ink/80")}>{v.nota}</span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-faint">Nota de viral</p>
          <p className="text-[13.5px] leading-snug text-ink/85">{v.porque}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
        {itens.map(([r, n], k) => (
          <div key={r} className="flex flex-col gap-1.5">
            <span className="flex justify-between text-[12px] text-mute"><span>{r}</span><span className="tnum text-ink/80">{n}</span></span>
            <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.span className="block h-full rounded-full bg-red" initial={{ width: 0 }} animate={{ width: `${n * 10}%` }} transition={{ ...mola, delay: 0.05 * k }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ETAPAS = ["Ouvindo o vídeo", "Escolhendo cortes", "Editando", "Pronto"];
function etapaIdx(j: Job) {
  if (!j.cortes.length) return j.etapa === "planejando" ? 1 : 0;
  if (j.cortes.some((c) => c.status === "editando")) return 2;
  if (j.cortes.some((c) => c.status === "pronto" || c.status === "enviado")) return 3;
  return 1;
}

/* a IA diz quanto o vídeo rende; a pessoa escolhe quantos quer (os melhores primeiro) */
function Quantos({ job, sel, setSel }: { job: Job; sel: Set<number>; setSel: (s: Set<number>) => void }) {
  const livres = job.cortes.filter((c) => c.status === "planejado" || !c.status);
  const ranking = [...livres].sort((a, b) => notaDe(b) - notaDe(a) || a.n - b.n);
  const fortes = livres.filter((c) => notaDe(c) >= 70).length;
  if (livres.length < 2) return null;
  const n = sel.size;
  const marcar = (k: number) => { som.toque(); setSel(new Set(ranking.slice(0, Math.max(0, Math.min(k, ranking.length))).map((c) => c.n))); };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={mola}
      className="vidro flex flex-col gap-3 rounded-[20px] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[16px] font-semibold tracking-tight">Esse vídeo rende <span className="text-red tnum">{livres.length}</span> cortes</p>
        <p className="mt-0.5 text-[13px] text-mute">{fortes ? `${fortes} com mais chance de viralizar. ` : ""}Quantos você quer fazer?</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="vidro flex items-center rounded-full p-1">
          <motion.button whileTap={{ scale: 0.88 }} aria-label="Menos" onClick={() => marcar(n - 1)} disabled={!n}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-mute hover:text-ink disabled:opacity-30"><Minus className="size-4" /></motion.button>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={n} initial={{ y: 10, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -10, opacity: 0, filter: "blur(4px)" }} transition={mola}
              className="w-9 text-center text-[17px] font-semibold tnum">{n}</motion.span>
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.88 }} aria-label="Mais" onClick={() => marcar(n ? n + 1 : fortes || Math.min(5, livres.length))} disabled={n >= livres.length}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-mute hover:text-ink disabled:opacity-30"><Plus className="size-4" /></motion.button>
        </div>
        <Botao className="min-h-11 px-4 text-[14px]" onClick={() => marcar(n === livres.length ? 0 : livres.length)}>{n === livres.length ? "Limpar" : "Todos"}</Botao>
      </div>
    </motion.div>
  );
}

/* categoria do vídeo: toca pra renomear */
function Categoria({ job, todas }: { job: Job; todas: string[] }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState("");
  const avisar = useAviso();
  const nome = job.categoria || "Sem categoria";
  const salvar = async () => {
    setEdit(false);
    if (!v.trim() || v.trim() === nome) return;
    try { await post("/api/marcar-job", { job: job.id, categoria: v }); atualizar(); } catch (er) { avisar((er as Error).message, true); }
  };
  return edit ? (
    <>
      <input autoFocus list={`cat-${job.id}`} value={v} maxLength={30} onChange={(e) => setV(e.target.value)} onBlur={salvar}
        onKeyDown={(e) => { if (e.key === "Enter") salvar(); if (e.key === "Escape") setEdit(false); }} placeholder="Categoria"
        className="vidro min-h-11 w-40 rounded-full px-4 text-[14px] outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
      <datalist id={`cat-${job.id}`}>{todas.map((c) => <option key={c} value={c} />)}</datalist>
    </>
  ) : (
    <Botao tipo="vidro" aria-label="Mudar categoria" className="px-4 text-[13.5px]" onClick={() => { setV(job.categoria && job.categoria !== "Sem categoria" ? job.categoria : ""); setEdit(true); }}>{nome}</Botao>
  );
}

function BlocoJob({ job, i, cats }: { job: Job; i: number; cats: string[] }) {
  const [filtro, setFiltro] = useState<Filtro>(() => (["escolher", "prontos", "editando"] as Filtro[]).find((f) => job.cortes.some((c) => filtrar(c, f))) ?? "todos");
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [formato, setFormato] = useState<"dividida" | "cheia">("dividida");
  const [aberto, setAberto] = useState<number | null>(null);
  const avisar = useAviso();
  const lista = useMemo(() => { const l = job.cortes.filter((c) => filtrar(c, filtro)); return filtro === "escolher" ? l.sort((a, b) => notaDe(b) - notaDe(a) || a.n - b.n) : l; }, [job, filtro]);
  const conta = (f: Filtro) => job.cortes.filter((c) => filtrar(c, f)).length;
  const et = etapaIdx(job);
  const selPlan = [...sel].filter((n) => job.cortes.find((c) => c.n === n && (c.status === "planejado" || !c.status)));
  const selProntos = [...sel].filter((n) => job.cortes.find((c) => c.n === n && c.status === "pronto"));

  return (
    <motion.section {...cascata(i + 1)} id={`job-${job.id}`} className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-semibold tracking-tight">{(job.bruto || job.id).replace(/\.(mov|mp4|m4v)$/i, "")}</h3>
          {et >= 3 ? (
            <p className="mt-1 text-[13px] text-mute tnum">{job.cortes.filter((c) => c.status === "pronto").length} cortes prontos</p>
          ) : (
          <div className="mt-1.5 flex items-center gap-2" aria-label={`Etapa: ${ETAPAS[et]}`}>
            <span className="flex gap-1">{ETAPAS.map((n, k) => <motion.span key={n} layout className={cx("h-1 rounded-full", k <= et ? "w-5 bg-red" : "w-2 bg-white/15")} transition={mola} />)}</span>
            <span className={cx("whitespace-nowrap text-[12px] font-medium", et < 3 ? "brilha-texto" : "text-mute")}>{ETAPAS[et]}</span>
          </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Segmentos id={`f-${job.id}`} valor={filtro} onChange={(f) => { setFiltro(f); setSel(new Set()); }}
          opcoes={(["escolher", "editando", "prontos", "todos"] as Filtro[]).map((f) => ({ v: f, rotulo: <>{({ escolher: "Escolher", editando: "Editando", prontos: "Prontos", todos: "Todos" })[f]} <span className="text-faint tnum">{conta(f)}</span></> }))} />
        <Categoria job={job} todas={cats} />
        <Excluir icone rotulo="Excluir vídeo" className="text-[13.5px]" onConfirmar={async () => {
          try { await post("/api/excluir-job", { job: job.id }); avisar("Vídeo excluído. Está na Lixeira."); atualizar(); }
          catch (er) { avisar((er as Error).message, true); }
        }} />
        </div>
      </div>
      {filtro === "escolher" && <Quantos job={job} sel={sel} setSel={setSel} />}
      {lista.length ? (
        <div className={GRADE}>
          {lista.map((c, k) => (
            <CardCorte key={c.n} c={c} i={k} sel={sel.has(c.n)} onAbrir={() => { som.abrir(); setAberto(k); }}
              onSel={c.status === "editando" || c.status === "descartado" || c.status === "enviado" ? undefined : () => setSel((s) => { const n = new Set(s); n.has(c.n) ? n.delete(c.n) : n.add(c.n); return n; })} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-[14px] text-faint">{job.cortes.length ? "Nenhum corte nessa aba." : job.etapa === "escolher" ? "Todos os cortes deste vídeo foram excluídos." : job.ultimo || "Lendo o vídeo…"}</p>
      )}
      <Topo><AnimatePresence>
        {sel.size > 0 && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={mola}
            className="fixed inset-x-0 bottom-[calc(max(14px,env(safe-area-inset-bottom))+86px)] z-30 flex justify-center px-4">
            <div className="vidro flex items-center gap-2 rounded-full bg-[#1a0c0f]/80 p-1.5 pl-5">
              <span className="text-[14px] font-medium tnum">{sel.size} {sel.size > 1 ? "escolhidos" : "escolhido"}</span>
              {selPlan.length > 0 && (
                <div role="radiogroup" aria-label="Formato" className="flex rounded-full bg-white/[0.06] p-0.5 text-[13px] font-medium">
                  {([["dividida", "Dividida"], ["cheia", "Tela cheia"]] as const).map(([v, r]) => (
                    <button key={v} role="radio" aria-checked={formato === v} onClick={() => { som.toque(); setFormato(v); }}
                      className={cx("min-h-9 cursor-pointer rounded-full px-3 transition-colors", formato === v ? "bg-white/15 text-ink" : "text-mute hover:text-ink")}>{r}</button>
                  ))}
                </div>
              )}
              {selPlan.length > 0 && (
                <Botao tipo="principal" className="min-h-10" onClick={async () => { await post("/api/editar", { job: job.id, ns: selPlan, formato }); avisar(`Editando ${selPlan.length}`); setSel(new Set()); setFiltro("editando"); atualizar(); }}>
                  <Wand2 className="size-4" /> Editar
                </Botao>
              )}
              {selProntos.length > 0 && (
                <Botao className="min-h-10" onClick={async () => { try { await post("/api/enviar", { job: job.id, ns: selProntos }); avisar("Enviando no WhatsApp"); setSel(new Set()); } catch (er) { avisar(String((er as Error).message), true); } }}>
                  <MessageCircle className="size-4" /> WhatsApp
                </Botao>
              )}
              <Botao tipo="fantasma" className="min-h-10 px-3" onClick={() => setSel(new Set())}>Limpar</Botao>
            </div>
          </motion.div>
        )}
      </AnimatePresence></Topo>
      <Folha aberta={aberto !== null} onFechar={() => setAberto(null)} larga>
        {aberto !== null && <Detalhe job={job} lista={lista} idx={aberto} setIdx={setAberto} />}
      </Folha>
    </motion.section>
  );
}

export function Cortes({ e }: { e: Estado | null }) {
  const avisar = useAviso();
  const novos = e?.brutos.filter((b) => !b.feito) ?? [];
  const [cat, setCat] = useState("");
  const cats = [...new Set((e?.jobs ?? []).map((j) => j.categoria || "Sem categoria"))];
  const ativa = cats.includes(cat) ? cat : "";
  const jobs = (e?.jobs ?? []).filter((j) => !ativa || (j.categoria || "Sem categoria") === ativa);
  // ver os cortes de todos os vídeos juntos (prontos ou editando) sem abrir vídeo por vídeo
  const [vista, setVista] = useState<"geral" | "video" | "prontos" | "editando">("geral");
  const [abertoV, setAbertoV] = useState<{ job: Job; lista: Corte[]; idx: number } | null>(null);
  const nomeJob = (j: Job) => (j.bruto || j.id).replace(/\.(mov|mp4|m4v)$/i, "");
  const porForca = (a: Corte, b: Corte) => notaDe(b) - notaDe(a) || a.n - b.n;
  const prontosG = jobs.flatMap((j) => j.cortes.filter((c) => filtrar(c, "prontos")).map((c) => ({ j, c }))).sort((a, b) => porForca(a.c, b.c));
  const editandoG = jobs.flatMap((j) => j.cortes.filter((c) => c.status === "editando").map((c) => ({ j, c })));
  const abrirV = (j: Job, lista: Corte[], c: Corte) => { som.abrir(); setAbertoV({ job: j, lista, idx: lista.indexOf(c) }); };
  const verJob = (id: string) => { setVista("video"); setTimeout(() => document.getElementById(`job-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250); };
  const metaCorte = (j: Job, c: Corte) => [nomeJob(j), fmtTempo(c.dur ?? c.fim - c.inicio)].filter(Boolean).join(" · ");
  const [abertoG, setAbertoG] = useState<{ job: string; idx: number } | null>(null);
  const juntos = vista !== "prontos" && vista !== "editando" ? [] : jobs.flatMap((j) => j.cortes.filter((c) => filtrar(c, vista)).map((c) => ({ j, c })));
  const jobAberto = abertoG && jobs.find((j) => j.id === abertoG.job);
  const listaAberta = jobAberto && (vista === "prontos" || vista === "editando") ? jobAberto.cortes.filter((c) => filtrar(c, vista)) : [];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Cabecalho titulo="Cortes" />
        <Upload />
        {novos.map((b, i) => (
          <motion.div key={b.path} {...cascata(i + 1)} className="flex items-center gap-3 rounded-[20px] bg-white/[0.04] py-2 pl-4 pr-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
            <Film className="size-4 shrink-0 text-faint" />
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{b.nome} <span className="font-normal text-faint tnum">· {b.min} min</span></span>
            <Botao tipo="principal" className="min-h-9 px-4 text-[13.5px]" onClick={async () => { await post("/api/novo", { bruto: b.path }); avisar("Cortando. Te aviso quando os cortes aparecerem."); atualizar(); }}>
              <Wand2 className="size-3.5" /> Cortar
            </Botao>
          </motion.div>
        ))}
      </div>
      {!!e?.jobs.length && (
        <div className="-mb-4 flex flex-wrap items-center gap-2">
          <Segmentos id="vista" valor={vista} onChange={(v) => { setVista(v); setAbertoG(null); }} className="max-w-full"
            opcoes={[{ v: "geral", rotulo: "Visão geral" }, { v: "video", rotulo: "Por vídeo" }, { v: "prontos", rotulo: <>Prontos <span className="text-faint tnum">{prontosG.length}</span></> }, { v: "editando", rotulo: <>Editando <span className="text-faint tnum">{editandoG.length}</span></> }]} />
          {cats.length > 1 && (
            <Segmentos id="cat" valor={ativa} onChange={setCat} className="max-w-full"
              opcoes={[{ v: "", rotulo: "Tudo" }, ...cats.map((c) => ({ v: c, rotulo: c }))]} />
          )}
        </div>
      )}
      {!e?.jobs.length ? (
        <Vazio icone={<Film className="size-6" />} titulo="Nenhum vídeo cortado ainda" />
      ) : vista === "geral" ? (
        <div className="flex flex-col gap-10">
          {prontosG.length > 0 && (
            <Secao titulo="Prontos pra postar" sub="Os mais fortes primeiro" total={prontosG.length} verTudo={() => setVista("prontos")}>
              <Fileira>
                {prontosG.slice(0, 16).map(({ j, c }, k) => (
                  <CardVitrine key={`${j.id}:${c.n}`} i={k} img={c.capa} video={c.video} titulo={c.titulo} meta={metaCorte(j, c)}
                    selo={c.status === "enviado" ? "Enviado" : undefined} nota={notaDe(c) || undefined} onClick={() => abrirV(j, prontosG.map((x) => x.c).filter((x) => j.cortes.includes(x)), c)} />
                ))}
              </Fileira>
            </Secao>
          )}
          {editandoG.length > 0 && (
            <Secao titulo="Editando agora" total={editandoG.length} verTudo={() => setVista("editando")}>
              <Fileira>
                {editandoG.map(({ j, c }, k) => (
                  <CardVitrine key={`${j.id}:${c.n}`} i={k} img={c.capa} video={c.video} titulo={c.titulo} meta={<Status status={c.status} fase={c.fase} />}
                    onClick={() => abrirV(j, j.cortes.filter((x) => x.status === "editando"), c)} />
                ))}
              </Fileira>
            </Secao>
          )}
          {jobs.filter((j) => j.cortes.length).map((j, k) => {
            const lista = [...j.cortes.filter((c) => c.status !== "descartado")].sort(porForca);
            const pr = j.cortes.filter((c) => filtrar(c, "prontos")).length, esc = j.cortes.filter((c) => filtrar(c, "escolher")).length;
            return (
              <Secao key={j.id} i={k + 2} titulo={nomeJob(j)} total={lista.length} verTudo={() => verJob(j.id)}
                sub={[pr && `${pr} ${pr > 1 ? "prontos" : "pronto"}`, esc && `${esc} pra escolher`, j.categoria !== "Sem categoria" && j.categoria].filter(Boolean).join(" · ") || undefined}>
                <Fileira>
                  {lista.slice(0, 16).map((c, n) => (
                    <CardVitrine key={c.n} i={n} img={c.capa} video={c.video} titulo={c.titulo} meta={c.gancho || fmtTempo(c.dur ?? c.fim - c.inicio)}
                      selo={c.status === "editando" ? "Editando" : undefined} nota={notaDe(c) || undefined}
                      onClick={() => abrirV(j, lista, c)} />
                  ))}
                </Fileira>
              </Secao>
            );
          })}
        </div>
      ) : vista === "video" ? jobs.map((j, i) => <BlocoJob key={j.id} job={j} i={i} cats={cats} />) : juntos.length ? (
        <div className={GRADE}>
          {juntos.map(({ j, c }, k) => (
            <CardCorte key={`${j.id}:${c.n}`} c={c} i={k} sel={false}
              onAbrir={() => { som.abrir(); setAbertoG({ job: j.id, idx: j.cortes.filter((x) => filtrar(x, vista)).indexOf(c) }); }} />
          ))}
        </div>
      ) : (
        <Vazio icone={<Film className="size-6" />} titulo={vista === "prontos" ? "Nenhum corte pronto ainda" : "Nada editando agora"} />
      )}
      <Folha aberta={!!abertoV} onFechar={() => setAbertoV(null)} larga>
        {abertoV && <Detalhe job={abertoV.job} lista={abertoV.lista} idx={Math.max(0, Math.min(abertoV.idx, abertoV.lista.length - 1))} setIdx={(i) => setAbertoV(i === null ? null : { ...abertoV, idx: i })} />}
      </Folha>
      <Folha aberta={!!jobAberto && listaAberta.length > 0} onFechar={() => setAbertoG(null)} larga>
        {jobAberto && abertoG && listaAberta.length > 0 && (
          <Detalhe job={jobAberto} lista={listaAberta} idx={Math.min(abertoG.idx, listaAberta.length - 1)} setIdx={(i) => setAbertoG(i === null ? null : { job: jobAberto.id, idx: i })} />
        )}
      </Folha>
    </div>
  );
}
