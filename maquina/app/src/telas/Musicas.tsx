import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, ExternalLink, Minus, Music, Pause, Play, Plus, RefreshCw, Search } from "lucide-react";
import { musicas as carregar, post, type EstiloMusica, type Musica, type Musicas as Dados, type ResultadoBusca } from "../api";
import { Gira, Segmentos, Vazio, cx, useAviso } from "../ui";
import { som } from "../sons";

const NOME_POS: Record<string, string> = { ig: "Instagram", br: "Brasil", global: "Global" };
const uso = (m: Musica) => Object.entries(m.posicoes ?? {}).slice(0, 2).map(([k, v]) => `#${v} ${NOME_POS[k] ?? k}`).join(" · ") || m.formato_de_uso;

function quando(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso), h = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const hoje = new Date().toDateString() === d.toDateString();
  return hoje ? `Atualizado hoje, ${h}` : `Atualizado ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}, ${h}`;
}

function Capa({ src }: { src?: string | null }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-white/[0.06]" style={{ background: src ? undefined : "linear-gradient(160deg,#3a0711,#0b0204)" }}>
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : <Music className="size-5 text-faint" />}
    </span>
  );
}

function Play_({ url, tocando, onPlay }: { url?: string | null; tocando: boolean; onPlay: () => void }) {
  return (
    <button type="button" aria-label={tocando ? "Pausar prévia" : "Ouvir prévia"} disabled={!url} onClick={onPlay}
      className={cx("grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors disabled:cursor-default disabled:opacity-30", tocando ? "bg-red text-white" : "bg-white/[0.08] hover:bg-white/15")}>
      {tocando ? <Pause className="size-[17px]" /> : <Play className="size-[17px] translate-x-px" />}
    </button>
  );
}

function Linha({ m, i, tocando, onPlay, mostrarRank }: { m: Musica; i: number; tocando: boolean; onPlay: () => void; mostrarRank?: boolean }) {
  const T = m.tendencia === "subindo" ? <ArrowUp className="size-4 text-emerald-400" aria-label="subindo" /> : m.tendencia === "caindo" ? <ArrowDown className="size-4 text-red" aria-label="caindo" /> : <Minus className="size-4 text-faint" aria-label="estável" />;
  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.025 }}
      className="flex items-center gap-3 rounded-[16px] px-2 py-2 hover:bg-white/[0.04]">
      {mostrarRank && <span className="w-7 shrink-0 text-center text-[17px] font-semibold tnum text-mute">{m.rank}</span>}
      <Capa src={m.capa} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-tight">{m.titulo}</span>
        <span className="block truncate text-[13px] text-mute">{m.artista}</span>
        <span className="block truncate text-[12px] text-faint">{[uso(m), m.bpm && `${m.bpm} bpm`].filter(Boolean).join(" · ")}</span>
      </span>
      {mostrarRank && <span className="shrink-0">{T}</span>}
      {m.links?.spotify && <a href={m.links.spotify} target="_blank" rel="noreferrer" aria-label="Abrir no Spotify" className="hidden size-9 shrink-0 place-items-center rounded-full text-faint hover:text-ink sm:grid"><ExternalLink className="size-4" /></a>}
      <Play_ url={m.preview} tocando={tocando} onPlay={onPlay} />
    </motion.li>
  );
}

function Busca({ q, estilos, tocando, tocar, aoUsar }: { q: string; estilos: EstiloMusica[]; tocando: string | null; tocar: (id: string, url?: string | null) => void; aoUsar: () => void }) {
  const [res, setRes] = useState<ResultadoBusca[] | null>(null);
  const [estilo, setEstilo] = useState("hit-do-momento");
  const [adicionando, setAdicionando] = useState<string | null>(null);
  const avisar = useAviso();
  useEffect(() => {
    setRes(null);
    const t = setTimeout(() => { fetch("/api/musicas/busca?q=" + encodeURIComponent(q)).then((r) => r.json()).then(setRes).catch(() => setRes([])); }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const usar = async (r: ResultadoBusca) => {
    const k = `${r.titulo}|${r.artista}`; setAdicionando(k);
    try { await post("/api/musicas/usar", { ...r, estilo }); som.enviar(); avisar("Adicionada ao acervo"); aoUsar(); }
    catch (e) { avisar((e as Error).message, true); } finally { setAdicionando(null); }
  };
  if (res === null) return <div className="flex items-center gap-2 py-10 text-mute"><Gira /> Buscando</div>;
  if (!res.length) return <Vazio icone={<Search className="size-6" />} titulo="Nada encontrado" />;
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-[13px] text-mute">Usar no estilo
        <select value={estilo} onChange={(e) => setEstilo(e.target.value)} className="vidro min-h-9 rounded-full bg-transparent px-3 text-[13px] text-ink outline-none">
          {estilos.map((e) => <option key={e.id} value={e.id} className="bg-black">{e.nome}</option>)}
        </select>
      </label>
      <ul className="flex flex-col">
        {res.map((r, i) => {
          const k = `b${i}`;
          return (
            <li key={k} className="flex items-center gap-3 rounded-[16px] px-2 py-2 hover:bg-white/[0.04]">
              <Capa src={r.capa} />
              <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{r.titulo}</span><span className="block truncate text-[13px] text-mute">{r.artista}</span></span>
              <a href={r.spotify} target="_blank" rel="noreferrer" aria-label="Abrir no Spotify" className="grid size-9 shrink-0 place-items-center rounded-full text-faint hover:text-ink"><ExternalLink className="size-4" /></a>
              <button type="button" onClick={() => usar(r)} disabled={adicionando === `${r.titulo}|${r.artista}`} aria-label="Usar no vídeo"
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 text-[13px] font-medium hover:bg-white/15"><Plus className="size-4" />Usar</button>
              <Play_ url={r.preview} tocando={tocando === k} onPlay={() => tocar(k, r.preview)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Musicas({ busca }: { busca: string }) {
  const [d, setD] = useState<Dados | null>(null);
  const [aba, setAba] = useState("alta");
  const [estilo, setEstilo] = useState("");
  const [tocando, setTocando] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const avisar = useAviso();
  const ler = useCallback(() => carregar().then((x) => { setD(x); return x; }), []);
  useEffect(() => { ler().catch(() => {}); return () => { clearTimeout(timer.current); audio.current?.pause(); }; }, [ler]);
  useEffect(() => { if (d?.atualizando) { timer.current = window.setTimeout(() => ler().catch(() => {}), 4000); return () => clearTimeout(timer.current); } }, [d, ler]);

  const tocar = (id: string, url?: string | null) => {
    if (!url) return;
    if (!audio.current) { audio.current = new Audio(); audio.current.onended = () => setTocando(null); }
    const a = audio.current;
    if (tocando === id) { a.pause(); setTocando(null); return; }
    a.src = url; a.play().then(() => setTocando(id)).catch(() => avisar("Não consegui tocar essa prévia", true));
  };
  const atualizar = async () => {
    try { await post("/api/musicas/atualizar", {}); som.toque(); setD((x) => (x ? { ...x, atualizando: true } : x)); setTimeout(() => ler(), 1500); }
    catch (e) { avisar((e as Error).message, true); }
  };

  const alta = useMemo(() => (d?.musicas ?? []).filter((m) => m.rank).sort((a, b) => a.rank! - b.rank!), [d]);
  const est = d?.estilos ?? [];
  const idEstilo = estilo || est[0]?.id || "";
  const doEstilo = useMemo(() => (d?.musicas ?? []).filter((m) => m.estilos?.includes(idEstilo)).sort((a, b) => (a.estilo_de_video === idEstilo ? 0 : 1) - (b.estilo_de_video === idEstilo ? 0 : 1)), [d, idEstilo]);
  const eAtual = est.find((e) => e.id === idEstilo);
  const q = busca.trim();

  if (!d) return <div className="flex items-center gap-2 py-10 text-mute"><Gira /> Carregando músicas</div>;
  if (q.length >= 2) return <Busca q={q} estilos={est} tocando={tocando} tocar={tocar} aoUsar={() => ler()} />;

  return (
    <div className="flex flex-col gap-4">
      <Segmentos id="musicas-aba" valor={aba} onChange={setAba} className="self-start" opcoes={[{ v: "alta", rotulo: "Em alta" }, { v: "estilo", rotulo: "Por estilo" }]} />
      {aba === "alta" ? (
        <section className="vidro flex flex-col overflow-hidden rounded-[24px]">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="text-[13px] text-mute">{d.atualizando ? "Atualizando…" : quando(d.atualizado_em)}</span>
            <button type="button" onClick={atualizar} disabled={d.atualizando} aria-label="Atualizar lista" className="grid size-9 cursor-pointer place-items-center rounded-full bg-white/[0.08] hover:bg-white/15 disabled:cursor-default">
              {d.atualizando ? <Gira /> : <RefreshCw className="size-4" />}
            </button>
          </header>
          <ul className="flex max-h-[calc(100dvh-460px)] min-h-[280px] sm:max-h-[calc(100dvh-360px)] sm:min-h-[320px] flex-col overflow-y-auto overscroll-contain px-2 py-2 [-webkit-overflow-scrolling:touch] [scroll-behavior:smooth]">
            {alta.map((m, i) => <Linha key={m.id} m={m} i={i} mostrarRank tocando={tocando === m.id} onPlay={() => tocar(m.id, m.preview)} />)}
          </ul>
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {est.map((e) => (
              <button key={e.id} type="button" onClick={() => setEstilo(e.id)}
                className={cx("min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors", e.id === idEstilo ? "bg-red text-white" : "bg-white/[0.08] text-mute hover:text-ink")}>{e.nome}</button>
            ))}
          </div>
          {eAtual && (
            <p className="vidro rounded-[18px] px-4 py-3 text-[13.5px] leading-relaxed text-mute">
              <span className="font-medium text-ink">Trilha base ({eAtual.bpm} bpm, drop em {eAtual.drop_s}s). </span>{eAtual.prompt_trilha}
            </p>
          )}
          <ul className="flex flex-col">{doEstilo.map((m, i) => <Linha key={m.id} m={m} i={i} tocando={tocando === m.id} onPlay={() => tocar(m.id, m.preview)} />)}</ul>
        </div>
      )}
    </div>
  );
}
