import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Film, Link2, Pause, Play, Sparkles } from "lucide-react";
import { musicas, type Musicas } from "./api";
import { LEGENDAS, type Legenda } from "./legendas";
import { Botao, cx, mola } from "./ui";
import { som } from "./sons";

/* Tela "Configurar" (modelo Recipe do OpusClip 4.0, ESPEC.md f3): tudo que muda o resultado, escolhido antes de gerar. */
export type ConfigCorte = {
  duracao: string; destaque: string; genero: string; layouts: string[]; legenda: string;
  gancho: string; limpar: boolean; palavraChave: boolean; emojis: boolean; zoom: boolean; musica: boolean; modelo: string;
  trilhaEstilo: string; trilhaFaixa: string | null; trilha?: unknown; legendaEstilo?: unknown;
};
export const CONFIG_PADRAO: ConfigCorte = {
  duracao: "auto", destaque: "", genero: "auto", layouts: ["dividida"], legenda: "maquina",
  gancho: "titulo", limpar: true, palavraChave: true, emojis: false, zoom: true, musica: true, modelo: "economico",
  trilhaEstilo: "auto", trilhaFaixa: null,
};
const lerSalvo = (): ConfigCorte => { try { return { ...CONFIG_PADRAO, ...JSON.parse(localStorage.getItem("config-corte") || "{}") }; } catch { return CONFIG_PADRAO; } };

const DURACOES = [["auto", "Auto"], ["<30", "Até 30s"], ["30-59", "30 a 59s"], ["60-89", "60 a 89s"], ["90-180", "90s a 3min"], ["180-600", "3 a 10min"]];
const GENEROS = [["auto", "A IA vê"], ["podcast", "Podcast"], ["aula", "Aula"], ["venda", "Venda"], ["motivacional", "Motivacional"], ["lifestyle", "Lifestyle"]];
const LAYOUTS = [["cheia", "Tela cheia", "reenquadra no rosto"], ["dividida", "Tela dividida", "motion em cima"], ["encaixar", "Encaixar", "fundo desfocado"]];
const GANCHOS = [["titulo", "Título"], ["animado", "Gancho animado"], ["nenhum", "Nenhum"]];
const MODELOS = [["economico", "Econômico", "o mais barato que segura o resultado"], ["equilibrado", "Equilibrado", "mais cuidado no plano"], ["maximo", "Máximo", "o melhor modelo em tudo"]];

/* prévia viva do template: frase de exemplo, a palavra ativa anda sozinha */
const FRASE = "isso muda tudo pra você hoje".split(" ");
export function PreviaLegenda({ l, larg = 112, viva = true }: { l: Legenda; larg?: number; viva?: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => { if (!viva) return; const t = setInterval(() => setK((x) => (x + 1) % FRASE.length), 420); return () => clearInterval(t); }, [viva]);
  const esc = larg / 1080, n = l.palavras, ini = Math.floor(k / n) * n, grupo = FRASE.slice(ini, ini + n);
  const s = (px: number) => px * esc;
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(160deg,#3b1219,#120306_60%)]" style={{ width: larg, height: larg * 16 / 9 }}>
      {l.id === "maquina" && <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(180deg,#2a2a2e,#151517)]" />}
      <div className="absolute inset-x-0 flex flex-wrap justify-center gap-x-[0.28em] px-[6%] text-center"
        style={{ top: `${l.posY}%`, transform: "translateY(-50%)", fontFamily: `"${l.fonte}", Inter, sans-serif`, fontWeight: l.peso, fontStyle: l.italico ? "italic" : undefined,
          fontSize: s(l.tam), lineHeight: 1.05, textTransform: l.caixa === "alta" ? "uppercase" : undefined, textShadow: l.sombra,
          ...(l.fundo ? { background: l.fundo, borderRadius: s(24), padding: `${s(10)}px ${s(22)}px`, left: "8%", right: "8%" } : {}) }}>
        {grupo.map((w, j) => {
          const on = ini + j === k, dito = ini + j <= k;
          const cor = l.anim === "karaoke" ? (dito ? (l.destaque && on ? l.destaque : l.cor) : l.futuras || l.cor) : on && l.destaque ? l.destaque : l.cor;
          const script = l.script && j === grupo.length - 1;
          return (
            <motion.span key={ini + j} initial={l.anim === "blur" ? { opacity: 0, filter: "blur(6px)" } : l.anim === "pop" ? { scale: 0.6, opacity: 0 } : false}
              animate={{ opacity: 1, filter: "blur(0px)", scale: on && (l.anim === "karaoke" || l.anim === "pop") ? 1.12 : 1 }} transition={mola}
              className="relative inline-block"
              style={{ color: script ? l.destaque : cor, fontFamily: script ? `"${l.script}", cursive` : undefined, textTransform: script ? "none" : undefined,
                fontSize: script ? "1.25em" : undefined, rotate: script ? "-6deg" : undefined,
                WebkitTextStroke: l.contorno ? `${s(l.contorno[0])}px ${l.contorno[1]}` : undefined, paintOrder: "stroke fill",
                background: l.anim === "caixa" && on ? l.destaque : undefined, borderRadius: s(10), padding: l.anim === "caixa" ? `0 ${s(8)}px` : undefined }}>
              {w}
              {l.anim === "sublinhado" && on && <motion.i layoutId={`sub-${l.id}`} className="absolute inset-x-0 -bottom-[0.08em] block" style={{ height: s(10), background: l.destaque, borderRadius: 99 }} />}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

function Chips({ op, v, set, multi, linha }: { op: string[][]; v: string | string[]; set: (x: string) => void; multi?: boolean; linha?: boolean }) {
  return (
    <div className={cx("flex gap-1.5", linha ? "scroll-x -mx-1 overflow-x-auto px-1 pb-1" : "flex-wrap")}>
      {op.map(([id, rot]) => {
        const on = multi ? (v as string[]).includes(id) : v === id;
        return (
          <button key={id} onClick={() => { som.toque(); set(id); }} aria-pressed={on}
            className={cx("min-h-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors", on ? "bg-white !text-[#14060a]" : "bg-white/[0.06] text-mute hover:text-ink")}>{rot}</button>
        );
      })}
    </div>
  );
}

function Linha({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5"><span className="text-[13px] font-medium text-faint">{t}</span>{children}</div>;
}

function Chave({ rot, v, set }: { rot: string; v: boolean; set: (b: boolean) => void }) {
  return (
    <button onClick={() => { som.toque(); set(!v); }} role="switch" aria-checked={v} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[14px] bg-white/[0.04] px-4 text-[14px] font-medium">
      {rot}
      <span className={cx("relative h-6 w-10 rounded-full transition-colors", v ? "bg-red" : "bg-white/15")}>
        <motion.span layout transition={mola} className={cx("absolute top-0.5 size-5 rounded-full bg-white", v ? "right-0.5" : "left-0.5")} />
      </span>
    </button>
  );
}

/* Trilha: estilo (cada um tem trilha base com BPM e drop) e, se quiser, a faixa de referência com prévia. */
const curto = (n: string) => n.split(" (")[0];
function Trilha({ d, c, up }: { d: Musicas | null; c: ConfigCorte; up: (p: Partial<ConfigCorte>) => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [tocando, setTocando] = useState<string | null>(null);
  useEffect(() => () => audio.current?.pause(), []);
  const tocar = (id: string, url?: string | null) => {
    if (!url) return;
    if (!audio.current) { audio.current = new Audio(); audio.current.onended = () => setTocando(null); }
    const a = audio.current;
    if (tocando === id) { a.pause(); setTocando(null); return; }
    a.src = url; a.play().then(() => setTocando(id)).catch(() => setTocando(null));
  };
  const est = d?.estilos ?? [];
  const op = [["auto", "A IA escolhe"], ...est.map((e) => [e.id, curto(e.nome)]), ["nenhuma", "Sem trilha"]];
  const e = est.find((x) => x.id === c.trilhaEstilo);
  const faixas = e ? (d?.musicas ?? []).filter((m) => m.estilos?.includes(e.id)).slice(0, 12) : [];
  return (
    <div className="flex flex-col gap-3">
      <Chips linha op={op} v={c.trilhaEstilo} set={(x) => up({ trilhaEstilo: x, trilhaFaixa: null, musica: x !== "nenhuma" })} />
      {c.trilhaEstilo === "nenhuma" && <p className="text-[12.5px] text-faint">Só para vídeo que você mesmo posta e coloca o áudio em alta no Instagram. Os efeitos sonoros continuam.</p>}
      {e && (
        <div className="scroll-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {faixas.map((m) => {
            const on = c.trilhaFaixa === m.id;
            return (
              <div key={m.id} className={cx("flex w-[208px] shrink-0 items-center gap-2.5 rounded-[16px] p-2 transition-colors", on ? "bg-red/[0.12] shadow-[inset_0_0_0_1.5px_rgb(225_29_42/0.7)]" : "bg-white/[0.04]")}>
                <button onClick={() => tocar(m.id, m.preview)} disabled={!m.preview} aria-label={tocando === m.id ? "Pausar prévia" : "Ouvir prévia"}
                  className="relative grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[11px] bg-white/10 disabled:cursor-default">
                  {m.capa && <img src={m.capa} alt="" className="absolute inset-0 size-full object-cover" />}
                  {m.preview && <span className="relative grid size-7 place-items-center rounded-full bg-black/55 text-white">{tocando === m.id ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}</span>}
                </button>
                <button onClick={() => { som.toque(); up({ trilhaFaixa: on ? null : m.id }); }} aria-pressed={on} className="min-w-0 flex-1 cursor-pointer text-left">
                  <span className="block truncate text-[13.5px] font-medium">{m.titulo}</span>
                  <span className="block truncate text-[12px] text-faint">{on ? "Escolhida" : m.artista}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GradeLegendas({ v, set }: { v: string; set: (id: string) => void }) {
  return (
    <div className="scroll-x -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
      {LEGENDAS.map((l) => {
        const on = v === l.id;
        return (
          <button key={l.id} onClick={() => { som.toque(); set(l.id); }} aria-pressed={on} title={l.nota}
            className={cx("flex shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-[17px] p-1.5 transition-colors", on ? "bg-red/[0.14] shadow-[inset_0_0_0_1.5px_rgb(225_29_42/0.75)]" : "hover:bg-white/[0.05]")}>
            <PreviaLegenda l={l} larg={96} viva={on} />
            <span className={cx("text-[12.5px] font-medium", on ? "text-ink" : "text-mute")}>{l.nome}</span>
          </button>
        );
      })}
    </div>
  );
}

/* trilha escolhida vira o objeto que o job lê (estilo, prompt, BPM, drop e faixa de referência) */
function pacoteTrilha(d: Musicas | null, estilo: string, faixa: string | null) {
  const e = d?.estilos.find((x) => x.id === estilo), f = d?.musicas.find((m) => m.id === faixa);
  return e ? { estilo: e.nome, prompt_trilha: e.prompt_trilha, bpm: e.bpm, drop_s: e.drop_s, faixa: f ? { titulo: f.titulo, artista: f.artista, bpm: f.bpm, drop_s: f.momento_do_drop_s } : null } : null;
}

/* Board de vídeo gerado (Animado, Criativo, Modelar): o que muda o resultado, escolhido antes de criar. */
export type ConfigVideo = { estilo: string; duracao: string; legenda: string; trilhaEstilo: string; trilhaFaixa: string | null };
const VIDEO_PADRAO: ConfigVideo = { estilo: "conteudo-organico", duracao: "30", legenda: "maquina", trilhaEstilo: "auto", trilhaFaixa: null };
const ESTILOS_V = [["conteudo-organico", "Orgânico"], ["criativo-direct-response", "Anúncio"], ["motivacional", "Motivacional"]];
const DURS_V = [["15", "15s"], ["30", "30s"], ["45", "45s"], ["60", "60s"]];
export function ConfigurarVideo({ titulo, tipo, onGerar, onRoteiro }: { titulo: string; tipo: string; onGerar: (pacote: Record<string, unknown>) => void; onRoteiro?: () => void }) {
  const [c, setC] = useState<ConfigVideo>(() => { try { return { ...VIDEO_PADRAO, ...JSON.parse(localStorage.getItem("config-video") || "{}") }; } catch { return VIDEO_PADRAO; } });
  const up = (p: Partial<ConfigVideo>) => setC((x) => ({ ...x, ...p }));
  const [d, setD] = useState<Musicas | null>(null);
  useEffect(() => { musicas().then(setD).catch(() => {}); }, []);
  const estilo = tipo === "criativo" ? "criativo-direct-response" : c.estilo;
  const leg = LEGENDAS.find((l) => l.id === c.legenda) ?? LEGENDAS[0];
  const t = { trilhaEstilo: c.trilhaEstilo, trilhaFaixa: c.trilhaFaixa } as ConfigCorte;
  const gerar = () => {
    try { localStorage.setItem("config-video", JSON.stringify(c)); } catch {}
    som.enviar();
    onGerar({ estilo, duracao: Number(c.duracao), legenda: leg, trilha: c.trilhaEstilo === "nenhuma" ? "nenhuma" : pacoteTrilha(d, c.trilhaEstilo, c.trilhaFaixa) });
  };
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="pr-12"><h3 className="text-[20px] font-semibold tracking-[-0.02em]">Como vai ser o vídeo</h3><p className="truncate text-[13px] text-faint">{titulo}</p></div>
        {tipo !== "criativo" && <Linha t="Estilo"><Chips op={ESTILOS_V} v={c.estilo} set={(x) => up({ estilo: x })} /></Linha>}
        <Linha t="Duração"><Chips op={DURS_V} v={c.duracao} set={(x) => up({ duracao: x })} /></Linha>
        <Linha t="Legenda"><GradeLegendas v={c.legenda} set={(x) => up({ legenda: x })} /></Linha>
        <Linha t="Trilha"><Trilha d={d} c={t} up={(p) => up(p as Partial<ConfigVideo>)} /></Linha>
      </div>
      <aside className="flex flex-col gap-3 lg:sticky lg:top-0 lg:w-[260px] max-lg:sticky max-lg:bottom-0 max-lg:z-10 max-lg:-mb-2 max-lg:bg-gradient-to-t max-lg:from-[#130709] max-lg:from-70% max-lg:to-transparent max-lg:pt-6">
        <div className="vidro flex flex-col items-center gap-3 rounded-[22px] p-4 max-lg:hidden"><PreviaLegenda l={leg} larg={150} /></div>
        <Botao tipo="principal" className="w-full justify-center" onClick={gerar}><Sparkles className="size-4" /> Criar vídeo</Botao>
        {onRoteiro && <button onClick={onRoteiro} className="min-h-10 cursor-pointer text-[13.5px] font-medium text-mute hover:text-ink">Só o roteiro, sem vídeo</button>}
      </aside>
    </div>
  );
}

export function Configurar({ origem, onGerar }: { origem: { tipo: "arquivo" | "link"; nome: string }; onGerar: (c: ConfigCorte) => void }) {
  const [c, setC] = useState<ConfigCorte>(lerSalvo);
  const up = (p: Partial<ConfigCorte>) => setC((x) => ({ ...x, ...p }));
  const togLayout = (id: string) => up({ layouts: c.layouts.includes(id) ? (c.layouts.length > 1 ? c.layouts.filter((x) => x !== id) : c.layouts) : [...c.layouts, id] });
  const leg = LEGENDAS.find((l) => l.id === c.legenda) ?? LEGENDAS[0];
  const [d, setD] = useState<Musicas | null>(null);
  useEffect(() => { musicas().then(setD).catch(() => {}); }, []);
  const estT = d?.estilos.find((x) => x.id === c.trilhaEstilo);
  const faixaT = d?.musicas.find((m) => m.id === c.trilhaFaixa);
  const gerar = () => {
    try { localStorage.setItem("config-corte", JSON.stringify(c)); } catch {}
    som.enviar();
    onGerar({ ...c, musica: c.trilhaEstilo !== "nenhuma", trilha: pacoteTrilha(d, c.trilhaEstilo, c.trilhaFaixa), legendaEstilo: leg });
  };
  const resumo = [
    DURACOES.find((d) => d[0] === c.duracao)?.[1] === "Auto" ? "Duração automática" : `Cortes de ${DURACOES.find((d) => d[0] === c.duracao)?.[1]}`,
    c.layouts.map((x) => LAYOUTS.find((l) => l[0] === x)?.[1]).join(" + "),
    `Legenda ${leg.nome}`,
    c.limpar && "Tira pausas e vícios", c.zoom && "Zoom automático",
    c.trilhaEstilo === "nenhuma" ? "Sem trilha, só efeitos" : faixaT ? `Trilha: ${faixaT.titulo}` : estT ? `Trilha ${curto(estT.nome)}` : "Trilha que a IA escolher",
    `Modelo ${MODELOS.find((m) => m[0] === c.modelo)?.[1]}`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-center gap-3 pr-12">
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white/[0.06] text-mute">{origem.tipo === "link" ? <Link2 className="size-[18px]" /> : <Film className="size-[18px]" />}</span>
          <div className="min-w-0"><h3 className="text-[20px] font-semibold tracking-[-0.02em]">Como vão ser os cortes</h3><p className="truncate text-[13px] text-faint">{origem.nome}</p></div>
        </div>
        <Linha t="Duração de cada corte"><Chips op={DURACOES} v={c.duracao} set={(x) => up({ duracao: x })} /></Linha>
        <Linha t="O que destacar">
          <input value={c.destaque} onChange={(e) => up({ destaque: e.target.value })} placeholder="Ex.: os momentos em que falo de preço"
            className="vidro min-h-12 w-full rounded-[16px] px-4 text-[15px] outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
        </Linha>
        <Linha t="Tipo de vídeo"><Chips op={GENEROS} v={c.genero} set={(x) => up({ genero: x })} /></Linha>
        <Linha t="Formato (marque mais de um e a IA troca por cena)">
          <div className="grid grid-cols-3 gap-2">
            {LAYOUTS.map(([id, rot, sub]) => {
              const on = c.layouts.includes(id);
              return (
                <button key={id} onClick={() => { som.toque(); togLayout(id); }} aria-pressed={on}
                  className={cx("relative flex cursor-pointer flex-col items-center gap-2 rounded-[18px] p-3 text-center transition-colors", on ? "bg-red/[0.12] shadow-[inset_0_0_0_1.5px_rgb(225_29_42/0.7)]" : "bg-white/[0.04] hover:bg-white/[0.07]")}>
                  <span className="relative h-[72px] w-[40px] overflow-hidden rounded-[7px] bg-white/10">
                    {id === "cheia" && <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#7a5a52,#2a1a18)]" />}
                    {id === "dividida" && <><span className="absolute inset-x-0 top-0 h-1/2 bg-red/50" /><span className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_50%_40%,#7a5a52,#2a1a18)]" /></>}
                    {id === "encaixar" && <><span className="absolute inset-0 bg-[#3a2a28] blur-[2px]" /><span className="absolute inset-x-0 top-[34%] h-[32%] bg-[radial-gradient(circle_at_50%_40%,#7a5a52,#2a1a18)]" /></>}
                  </span>
                  <span className="text-[13.5px] font-medium leading-tight">{rot}</span>
                  <span className="hidden text-[11.5px] text-faint sm:block">{sub}</span>
                  {on && <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-red text-white"><Check className="size-3" strokeWidth={3} /></span>}
                </button>
              );
            })}
          </div>
        </Linha>
        <Linha t="Legenda"><GradeLegendas v={c.legenda} set={(x) => up({ legenda: x })} /></Linha>
        <Linha t="Começo do vídeo"><Chips op={GANCHOS} v={c.gancho} set={(x) => up({ gancho: x })} /></Linha>
        <Linha t="Edição">
          <div className="grid gap-2 sm:grid-cols-2">
            <Chave rot="Tirar pausas e vícios" v={c.limpar} set={(b) => up({ limpar: b })} />
            <Chave rot="Destacar palavra-chave" v={c.palavraChave} set={(b) => up({ palavraChave: b })} />
            <Chave rot="Zoom automático" v={c.zoom} set={(b) => up({ zoom: b })} />
            <Chave rot="Emojis" v={c.emojis} set={(b) => up({ emojis: b })} />
          </div>
        </Linha>
        <Linha t="Trilha"><Trilha d={d} c={c} up={up} /></Linha>
        <Linha t="Modelo de IA">
          <div className="grid gap-2 sm:grid-cols-3">
            {MODELOS.map(([id, rot, sub]) => (
              <button key={id} onClick={() => { som.toque(); up({ modelo: id }); }} aria-pressed={c.modelo === id}
                className={cx("cursor-pointer rounded-[16px] p-3.5 text-left transition-colors", c.modelo === id ? "bg-red/[0.12] shadow-[inset_0_0_0_1.5px_rgb(225_29_42/0.7)]" : "bg-white/[0.04] hover:bg-white/[0.07]")}>
                <span className="block text-[14.5px] font-semibold">{rot}</span><span className="mt-0.5 block text-[12.5px] leading-snug text-faint">{sub}</span>
              </button>
            ))}
          </div>
        </Linha>
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-0 lg:w-[260px] max-lg:sticky max-lg:bottom-0 max-lg:z-10 max-lg:-mb-2 max-lg:bg-gradient-to-t max-lg:from-[#130709] max-lg:from-70% max-lg:to-transparent max-lg:pt-6">
        <div className="vidro flex flex-col items-center gap-4 rounded-[22px] p-4 max-lg:hidden">
          <PreviaLegenda l={leg} larg={150} />
          <ul className="w-full space-y-1.5 text-[13.5px] text-mute">
            {resumo.map((r) => <li key={r} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-red" strokeWidth={3} />{r}</li>)}
          </ul>
        </div>
        <Botao tipo="principal" className="w-full justify-center" onClick={gerar}><Sparkles className="size-4" /> Gerar cortes</Botao>
      </aside>
    </div>
  );
}
