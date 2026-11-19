import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowLeftToLine, ArrowRightToLine, Captions, Film, Highlighter, Music, Pause, Play, RotateCcw, Scissors, TextSelect, Trash2, Type, Undo2, Wand2 } from "lucide-react";
import { atualizar, fmtTempo, post, subirImagem } from "../api";
import { Botao, Gira, Topo, cx, mola, useAviso } from "../ui";
import { som } from "../sons";

/* Editor do corte (estilo Descript/OpusClip): edita pelo texto da fala.
   Apagar palavra corta o pedaço do vídeo; destaque = palavra-chave vermelha; corrigir = texto da legenda.
   Salvar grava ajustes.json e a máquina refaz o corte sem passar pelo Claude. */

type Palavra = { k: string; orig: string; text: string; kw: boolean; fora: boolean; t: number | null };
type Broll = { de: string; ate: string; arq: string; prev?: string };
type Ajustes = { remover?: string[]; texto?: Record<string, string>; kw?: Record<string, boolean>; painel?: Record<string, string>; trilha?: string; legenda?: string; broll?: Broll[] };
type Dados = {
  nome: string; titulo?: string; status?: string; fase?: string; erro?: string; nivel: string; video: string | null;
  palavras: (Palavra | null)[]; painel: { orig: string; atual: string }[]; aj: Ajustes;
  trilhas?: { id: string; nome: string }[]; brollUrl?: Record<string, string | null>;
};
type Estado = { pal: (Palavra | null)[]; painel: Record<string, string>; trilha: string; legenda: string; broll: Broll[] };
const LEGENDAS = [
  { v: "padrao", nome: "Padrão", amostra: <><span className="text-white">fala</span> <span className="font-serif italic text-[#ff3b47]">chave</span></> },
  { v: "amarelo", nome: "Amarelo", amostra: <><span className="font-extrabold text-white">fala</span> <span className="font-extrabold text-[#ffd60a]">chave</span></> },
  { v: "branco", nome: "Branco", amostra: <span className="font-extrabold text-white">fala chave</span> },
  { v: "caixa", nome: "Caixa", amostra: <><span className="rounded bg-white px-1 font-extrabold text-[#0b0204]">fala</span> <span className="rounded bg-[#ffd60a] px-1 font-extrabold text-[#0b0204]">chave</span></> },
];
const inicial = (j: Dados): Estado => ({
  pal: j.palavras, painel: Object.fromEntries(j.painel.map((p) => [p.orig, p.atual])),
  trilha: j.aj.trilha || "", legenda: j.aj.legenda || "padrao",
  broll: (j.aj.broll || []).map((b) => ({ ...b, prev: j.brollUrl?.[b.arq] || undefined })),
});

const ocupado = (d?: Dados | null) => !!d && (d.status === "cortando" || d.status === "editando" || !!d.fase);
const MIN = { simples: "~2 min", medio: "~5 min", completo: "~5 min" } as Record<string, string>;

export function Editor({ job, n, onFechar }: { job: string; n: number; onFechar: () => void }) {
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [st, setSt] = useState<Estado | null>(null);
  const [hist, setHist] = useState<Estado[]>([]);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [corrigindo, setCorrigindo] = useState<number | null>(null);
  const [agora, setAgora] = useState(-1);
  const [tocando, setTocando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [estender, setEstender] = useState(false); // celular não tem Shift: "Trecho" faz o próximo toque estender a seleção
  const vid = useRef<HTMLVideoElement>(null);
  const avisar = useAviso();

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/corte-edicao?job=${encodeURIComponent(job)}&n=${n}`);
    const j = await r.json();
    if (!r.ok) { setErro(j.erro || "Não deu pra abrir esse corte"); return null; }
    setD(j);
    return j as Dados;
  }, [job, n]);

  useEffect(() => {
    carregar().then((j) => j && setSt(inicial(j)));
  }, [carregar]);

  // enquanto a máquina refaz, confere a cada 3 s; quando termina, recarrega tudo
  useEffect(() => {
    if (!ocupado(d)) return;
    const t = window.setInterval(async () => {
      const j = await carregar();
      if (j && !ocupado(j)) {
        setSt(inicial(j)); setHist([]); setSel(null); setAgora(-1);
        if (j.erro) avisar("Não deu pra refazer. O vídeo anterior continua.", true);
        else { som.ok(); avisar("Corte refeito"); }
        atualizar();
      }
    }, 3000);
    return () => window.clearInterval(t);
  }, [d, carregar, avisar]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape" && corrigindo === null) onFechar(); };
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onFechar, corrigindo]);

  const mudar = (f: (e: Estado) => Estado) => setSt((e) => { if (!e) return e; setHist((h) => [...h.slice(-80), e]); return f(e); });
  const desfazer = () => setHist((h) => { if (!h.length) return h; setSt(h[h.length - 1]); return h.slice(0, -1); });

  const faixa = sel ? [Math.min(...sel), Math.max(...sel)] : null;
  const naFaixa = (i: number) => !!faixa && i >= faixa[0] && i <= faixa[1];
  const escolhidas = st && faixa ? st.pal.slice(faixa[0], faixa[1] + 1).filter((p): p is Palavra => !!p) : [];
  const todasFora = escolhidas.length > 0 && escolhidas.every((p) => p.fora);
  const todasKw = escolhidas.length > 0 && escolhidas.every((p) => p.kw);

  const aplicar = (f: (p: Palavra) => Palavra) => faixa && mudar((e) => ({ ...e, pal: e.pal.map((p, i) => (p && naFaixa(i) ? f(p) : p)) }));
  const cortar = () => { som.toque(); aplicar((p) => ({ ...p, fora: !todasFora })); };
  const destacar = () => { som.toque(); aplicar((p) => ({ ...p, kw: !todasKw })); };
  // aparar: tudo antes (ou depois) da seleção sai do vídeo
  const aparar = (lado: "inicio" | "fim") => { if (!faixa) return; som.toque(); mudar((e) => ({ ...e, pal: e.pal.map((p, i) => (p && (lado === "inicio" ? i < faixa[0] : i > faixa[1]) ? { ...p, fora: true } : p)) })); setSel(null); };
  const arqBroll = useRef<HTMLInputElement>(null);
  const [subindo, setSubindo] = useState(false);
  const brollDe = (i: number) => st?.broll.findIndex((b) => { const a = st.pal.findIndex((p) => p?.k === b.de), z = st.pal.findIndex((p) => p?.k === b.ate); return i >= a && i <= z; }) ?? -1;
  const subirBroll = async (f?: File) => {
    if (!f || !faixa || !st) return;
    const de = st.pal.slice(faixa[0], faixa[1] + 1).find((p) => p)?.k, ate = [...st.pal.slice(faixa[0], faixa[1] + 1)].reverse().find((p) => p)?.k;
    if (!de || !ate) return;
    setSubindo(true);
    try {
      const arq = await subirImagem(f);
      som.ok();
      mudar((e) => ({ ...e, broll: [...e.broll, { de, ate, arq, prev: URL.createObjectURL(f) }] })); setSel(null);
    } catch (er) { avisar((er as Error).message, true); }
    setSubindo(false);
  };

  // tecla apagar corta a seleção; ⌘Z desfaz
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); desfazer(); }
      else if ((e.key === "Backspace" || e.key === "Delete") && faixa) { e.preventDefault(); cortar(); }
      else if (e.key === " " && vid.current) { e.preventDefault(); vid.current.paused ? vid.current.play() : vid.current.pause(); }
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  });

  // palavra tocando agora (só as que estão no vídeo atual)
  const tempos = useMemo(() => (d?.palavras ?? []).map((p, i) => [p?.t ?? null, i] as const).filter(([t]) => t !== null) as [number, number][], [d]);
  const aoTocar = () => {
    const t = vid.current?.currentTime ?? 0;
    let a = -1;
    for (const [tt, i] of tempos) { if (tt <= t + 0.05) a = i; else break; }
    setAgora(a);
  };

  const clicar = (i: number, ev: React.MouseEvent) => {
    som.toque();
    if ((ev.shiftKey || estender) && sel) { setSel([sel[0], i]); setEstender(false); } else setSel([i, i]);
    const t = st?.pal[i]?.t;
    if (t !== null && t !== undefined && vid.current) vid.current.currentTime = t;
  };

  const base = useMemo(() => (d ? Object.fromEntries(d.palavras.filter((p): p is Palavra => !!p).map((p) => [p.k, p])) : {}), [d]);
  const mudancas = useMemo(() => {
    if (!st || !d) return 0;
    let m = 0;
    for (const p of st.pal) if (p) { const b = base[p.k]; if (b && (b.fora !== p.fora || b.kw !== p.kw || b.text !== p.text)) m++; }
    for (const p of d.painel) if ((st.painel[p.orig] ?? p.atual) !== p.atual) m++;
    if (st.trilha !== (d.aj.trilha || "")) m++;
    if (st.legenda !== (d.aj.legenda || "padrao")) m++;
    if (JSON.stringify(st.broll.map((b) => [b.de, b.ate, b.arq])) !== JSON.stringify((d.aj.broll || []).map((b) => [b.de, b.ate, b.arq]))) m++;
    return m;
  }, [st, d, base]);

  const salvar = async () => {
    if (!st || !d) return;
    const aj: Ajustes = { remover: [], texto: { ...(d.aj.texto || {}) }, kw: { ...(d.aj.kw || {}) }, painel: {} };
    for (const p of st.pal) if (p) {
      if (p.fora) aj.remover!.push(p.k);
      const b = base[p.k];
      if (b && b.text !== p.text) aj.texto![p.k] = p.text.trim();
      if (b && b.kw !== p.kw) aj.kw![p.k] = p.kw;
    }
    for (const [o, v] of Object.entries(st.painel)) if (v.trim() && v.trim() !== o) aj.painel![o] = v.trim();
    if (st.trilha) aj.trilha = st.trilha;
    aj.legenda = st.legenda;
    aj.broll = st.broll.map(({ de, ate, arq }) => ({ de, ate, arq }));
    setSalvando(true);
    try {
      await post("/api/corte-ajustar", { job, n, ajustes: aj });
      som.ok(); vid.current?.pause();
      setD({ ...d, status: "cortando", fase: "aplicando ajustes" });
      atualizar();
    } catch (er) { avisar((er as Error).message, true); }
    setSalvando(false);
  };

  const ocup = ocupado(d);
  const cortadoS = st ? st.pal.reduce((s, p, i) => {
    if (!p?.fora || p.t === null) return s;
    const prox = st.pal.slice(i + 1).find((q) => q && q.t !== null);
    return s + Math.max(0, ((prox?.t ?? p.t + 0.4) - p.t));
  }, 0) : 0;

  return (
    <Topo>
      <motion.div className="fixed inset-0 z-[60] flex flex-col bg-[#0b0204]" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={mola}>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgb(115_12_30/0.35),transparent_70%)]" />
        {/* topo */}
        <header className="relative flex items-center gap-3 border-b border-line px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
          <button aria-label="Voltar" onClick={() => { som.fechar(); onFechar(); }} className="vidro grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-mute hover:text-ink">
            <ArrowLeft className="size-[18px]" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-faint">Editar corte</p>
            <h2 className="truncate text-[16px] font-semibold tracking-tight">{d?.titulo ?? "…"}</h2>
          </div>
          <Botao tipo="fantasma" aria-label="Desfazer" disabled={!hist.length || ocup} onClick={desfazer} className="w-11 !px-0 sm:w-auto sm:!px-4">
            <Undo2 className="size-4" /><span className="hidden sm:inline">Desfazer</span>
          </Botao>
        </header>

        {erro ? (
          <div className="grid flex-1 place-items-center p-6 text-center text-mute">{erro}</div>
        ) : !d || !st ? (
          <div className="grid flex-1 place-items-center"><Gira className="size-6 text-mute" /></div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
            {/* vídeo */}
            <div className="flex shrink-0 justify-center px-4 pt-4 md:w-[380px] md:items-start md:px-6 md:pt-6 lg:w-[440px]">
              <div className="relative aspect-[9/16] h-[34dvh] overflow-hidden rounded-[18px] bg-black shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/10 md:h-auto md:w-full md:max-w-[340px]">
                {d.video && (
                  <video ref={vid} key={d.video} src={d.video} playsInline className="size-full object-contain"
                    onTimeUpdate={aoTocar} onPlay={() => setTocando(true)} onPause={() => setTocando(false)} onClick={() => (vid.current?.paused ? vid.current.play() : vid.current?.pause())} />
                )}
                <button aria-label={tocando ? "Pausar" : "Tocar"} onClick={() => (vid.current?.paused ? vid.current.play() : vid.current?.pause())}
                  className="absolute bottom-3 left-3 grid size-11 cursor-pointer place-items-center rounded-full bg-black/55 text-white backdrop-blur ring-1 ring-white/15">
                  {tocando ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                </button>
                <AnimatePresence>
                  {ocup && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <Gira className="size-6 text-red" />
                        <p className="text-[15px] font-semibold">Refazendo o corte</p>
                        <p className="text-[13px] text-mute">{MIN[d.nivel] ?? "~2 min"}. Pode fechar, te aviso.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* texto */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-40 pt-5 sm:px-6 md:pr-10 md:pt-6">
                {d.painel.length > 0 && (
                  <section className="mb-7">
                    <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-faint"><Type className="size-3.5" /> Título no topo</h3>
                    <div className="flex flex-col gap-2">
                      {d.painel.map((p) => (
                        <input key={p.orig} value={st.painel[p.orig] ?? p.atual} disabled={ocup} maxLength={120}
                          onChange={(e) => { const v = e.target.value; setSt((s) => s && { ...s, painel: { ...s.painel, [p.orig]: v } }); }}
                          onFocus={() => setHist((h) => [...h, st])}
                          className="vidro min-h-12 w-full rounded-[14px] px-4 text-[16px] font-medium outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
                      ))}
                    </div>
                  </section>
                )}
                <section className="mb-7 grid gap-5 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-faint"><Music className="size-3.5" /> Trilha</h3>
                    <div className="flex flex-wrap gap-2">
                      {[{ id: "", nome: "Como está" }, ...(d.trilhas || [])].map((t) => (
                        <Chip key={t.id || "atual"} ativo={st.trilha === t.id} disabled={ocup} onClick={() => mudar((e) => ({ ...e, trilha: t.id }))}>{t.nome.replace(/\s*\(.*\)\s*/, "")}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-faint"><Captions className="size-3.5" /> Legenda</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                      {LEGENDAS.map((l) => (
                        <button key={l.v} disabled={ocup} onClick={() => { som.toque(); mudar((e) => ({ ...e, legenda: l.v })); }}
                          className={cx("vidro flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] px-2 transition-shadow disabled:cursor-not-allowed", st.legenda === l.v && "shadow-[0_0_0_2px_rgb(225_29_42/0.8)]")}>
                          <span className="text-[15px] leading-none">{l.amostra}</span>
                          <span className="text-[12px] text-mute">{l.nome}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
                {st.broll.length > 0 && (
                  <section className="mb-7">
                    <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-faint"><Film className="size-3.5" /> B-roll</h3>
                    <div className="flex flex-wrap gap-2">
                      {st.broll.map((b, k) => {
                        const txt = (() => { const a = st.pal.findIndex((p) => p?.k === b.de), z = st.pal.findIndex((p) => p?.k === b.ate); return st.pal.slice(a, z + 1).filter(Boolean).map((p) => p!.text).join(" "); })();
                        const video = /\.(mp4|mov)$/i.test(b.arq);
                        return (
                          <div key={b.arq + k} className="vidro flex items-center gap-2.5 rounded-[14px] p-1.5 pr-1">
                            {b.prev ? (video ? <video src={b.prev} muted className="size-11 rounded-[10px] object-cover" /> : <img src={b.prev} alt="" className="size-11 rounded-[10px] object-cover" />) : <Film className="m-3 size-5 text-mute" />}
                            <span className="max-w-[22ch] truncate text-[13.5px] text-ink/90">“{txt}”</span>
                            <button aria-label="Tirar b-roll" disabled={ocup} onClick={() => { som.toque(); mudar((e) => ({ ...e, broll: e.broll.filter((_, j) => j !== k) })); }}
                              className="grid size-11 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/10 hover:text-ink"><Trash2 className="size-4" /></button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
                <section>
                  <h3 className="mb-1 text-[12px] font-medium uppercase tracking-[0.08em] text-faint">Fala</h3>
                  <p className="mb-4 text-[13px] text-mute">Toque numa palavra pra ir até ela. Pra marcar várias, toque em Trecho e depois na última. Com o trecho marcado dá pra cortar, aparar o começo ou o fim e pôr um b-roll.</p>
                  <div className="max-w-[68ch] text-[18px] leading-[2.05] sm:text-[19px]" onClick={(e) => { if (e.target === e.currentTarget) setSel(null); }}>
                    {st.pal.map((p, i) =>
                      p === null ? (
                        <span key={`q${i}`} aria-hidden className="mx-1.5 inline-block h-[1.1em] w-px translate-y-[3px] bg-white/15" />
                      ) : corrigindo === i ? (
                        <input key={p.k} autoFocus defaultValue={p.text} maxLength={80}
                          onBlur={(e) => { const v = e.target.value.trim(); setCorrigindo(null); if (v && v !== p.text) mudar((s) => ({ ...s, pal: s.pal.map((q, j) => (j === i && q ? { ...q, text: v } : q)) })); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { e.stopPropagation(); setCorrigindo(null); } }}
                          style={{ width: `${Math.max(3, p.text.length + 1)}ch` }}
                          className="mx-0.5 mr-1.5 rounded-md bg-white/10 px-1 text-[inherit] outline-none ring-2 ring-red" />
                      ) : (
                        <Fragment key={p.k}><span role="button" tabIndex={0}
                          onClick={(e) => clicar(i, e)} onDoubleClick={() => !ocup && !p.fora && setCorrigindo(i)}
                          onKeyDown={(e) => { if (e.key === "Enter") clicar(i, e as unknown as React.MouseEvent); }}
                          className={cx(
                            "cursor-pointer rounded-[6px] px-[2px] py-[2px] transition-colors duration-150",
                            p.fora ? "text-faint line-through decoration-red decoration-2" : p.kw ? "font-serif text-[1.12em] italic text-[#ff3b47]" : "text-ink/90",
                            naFaixa(i) ? "bg-red/25 text-ink" : agora === i ? "bg-white/15" : brollDe(i) >= 0 ? "bg-sky-400/15" : "hover:bg-white/[0.07]",
                            base[p.k] && p.text !== base[p.k].text && !p.fora && "underline decoration-white/30 decoration-dotted underline-offset-4",
                          )}>
                          {p.text}
                        </span>{" "}</Fragment>
                      ),
                    )}
                  </div>
                </section>
              </div>

              {/* barra de ações */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 px-4 pb-[max(16px,env(safe-area-inset-bottom))] md:left-auto md:right-0 md:w-[calc(100%-380px)] lg:w-[calc(100%-440px)]">
                <input ref={arqBroll} type="file" accept="image/*,video/mp4,video/quicktime" hidden onChange={(e) => { subirBroll(e.target.files?.[0]); e.target.value = ""; }} />
                <AnimatePresence>
                  {faixa && !ocup && (
                    <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={mola}
                      className="vidro-liquido pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[24px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#1a080b]/85 p-1.5 backdrop-blur-xl sm:rounded-full">
                      <Acao onClick={cortar} ativo={todasFora} icone={todasFora ? <RotateCcw className="size-4" /> : <Scissors className="size-4" />}>{todasFora ? "Voltar" : "Cortar"}</Acao>
                      <Acao onClick={() => { som.toque(); setEstender(!estender); }} ativo={estender} icone={<TextSelect className="size-4" />}>Trecho</Acao>
                      <Acao onClick={destacar} ativo={todasKw} icone={<Highlighter className="size-4" />}>Destaque</Acao>
                      <Acao onClick={() => aparar("inicio")} icone={<ArrowLeftToLine className="size-4" />}>Início aqui</Acao>
                      <Acao onClick={() => aparar("fim")} icone={<ArrowRightToLine className="size-4" />}>Fim aqui</Acao>
                      <Acao onClick={() => arqBroll.current?.click()} ativo={subindo} icone={subindo ? <Gira className="size-4" /> : <Film className="size-4" />}>B-roll</Acao>
                      {faixa[0] === faixa[1] && !escolhidas[0]?.fora && (
                        <Acao onClick={() => setCorrigindo(faixa[0])} icone={<Type className="size-4" />}>Corrigir</Acao>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="vidro-liquido pointer-events-auto flex w-full max-w-[640px] items-center gap-3 rounded-[22px] bg-[#1a080b]/85 p-2 pl-4 backdrop-blur-xl">
                  <p className="min-w-0 flex-1 text-[13.5px] leading-tight text-mute">
                    {ocup ? "Aplicando suas mudanças"
                      : mudancas ? <><span className="font-semibold text-ink">{mudancas} {mudancas === 1 ? "mudança" : "mudanças"}</span>{cortadoS > 0.3 && <> · {fmtTempo(cortadoS)} a menos</>}</>
                      : d.erro ? <span className="text-red">A última tentativa falhou</span> : "Nada mudou ainda"}
                  </p>
                  <Botao tipo="principal" disabled={!mudancas || ocup} carregando={salvando} onClick={salvar} className="shrink-0">
                    <Wand2 className="size-4" /> Salvar
                  </Botao>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Topo>
  );
}

function Acao({ children, icone, onClick, ativo }: { children: React.ReactNode; icone: React.ReactNode; onClick: () => void; ativo?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} transition={mola} onClick={onClick}
      className={cx("inline-flex min-h-12 min-w-[60px] shrink-0 cursor-pointer whitespace-nowrap flex-col items-center justify-center gap-0.5 rounded-[18px] px-2.5 text-[11.5px] font-medium transition-colors sm:min-h-11 sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:text-[14px]", ativo ? "bg-red text-white" : "text-ink/90 hover:bg-white/10")}>
      {icone}{children}
    </motion.button>
  );
}

function Chip({ children, ativo, onClick, disabled }: { children: React.ReactNode; ativo?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={() => { som.toque(); onClick(); }}
      className={cx("min-h-11 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors disabled:cursor-not-allowed", ativo ? "bg-red text-white" : "vidro text-ink/90 hover:bg-white/10")}>
      {children}
    </button>
  );
}
