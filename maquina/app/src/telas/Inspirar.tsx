import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ArrowUpRight, Copy, Link2, Search, Sparkles, Telescope, Wand2, X } from "lucide-react";
import { atualizar, biblioteca, limparBiblioteca, fmtTempo, fmtViews, post, type Estado, type Inspiracao, type ItemBib } from "../api";
import type { Rascunho } from "./Criar";
import { Botao, Cabecalho, Copiar, Excluir, Folha, Segmentos, Status, Vazio, cascata, cx, mola, molaSuave, useAviso } from "../ui";
import { som } from "../sons";
import { Musicas } from "./Musicas";

const FONTES = [
  { v: "todas", nome: "Tudo" }, { v: "decupados", nome: "Analisados" }, { v: "meus", nome: "Meus" }, { v: "virais", nome: "Virais" }, { v: "ads", nome: "Anúncios" },
  { v: "estilos", nome: "Estilos" }, { v: "musicas", nome: "Músicas" },
];
// Motion, HyperFrames, prompts e formatos ficam dentro de Estilos (menos escolha de uma vez na tela)
const ESTILOS = [{ v: "motion", nome: "Motion" }, { v: "hf", nome: "HyperFrames" }, { v: "acervo", nome: "Prompts" }, { v: "formatos", nome: "Formatos" }];

function Decupagem({ i, criarCom, excluir }: { i: Inspiracao; criarCom: (r: Rascunho) => void; excluir: () => void }) {
  const d = i.decupagem;
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {i.video && <video src={i.video} controls autoPlay playsInline className="mx-auto aspect-[9/16] w-full max-w-[280px] shrink-0 rounded-[20px] bg-black object-contain sm:sticky sm:top-0 sm:self-start" />}
      <div className="flex min-w-0 flex-1 flex-col gap-5 sm:pt-8">
        <div className="pr-12">
          <span className="text-[13px] text-mute">{[i.info?.autor, fmtViews(i.info?.views) && `${fmtViews(i.info?.views)} views`, fmtTempo(i.info?.duracao)].filter(Boolean).join(" · ")}</span>
          <h3 className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{d?.titulo || i.info?.titulo}</h3>
        </div>
        {d ? (
          <>
            {d.gancho && <p className="text-[16px] leading-relaxed"><span className="font-semibold text-red">Gancho. </span>{d.gancho}</p>}
            {!!d.estrutura?.length && (
              <ol className="relative flex flex-col gap-3 border-l border-line pl-5">
                {d.estrutura.map((b, k) => (
                  <motion.li key={k} {...cascata(k)} className="relative">
                    <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-red shadow-[0_0_10px_rgb(225_29_42/0.8)]" />
                    <span className="text-[12px] font-medium text-faint tnum">{b.t}</span>
                    <p className="text-[14.5px] leading-snug">{b.o_que_acontece}</p>
                    {b.fala && <p className="mt-0.5 text-[13.5px] italic text-mute">“{b.fala}”</p>}
                    {b.tecnica_visual && <p className="mt-0.5 text-[12.5px] text-faint">{b.tecnica_visual}</p>}
                  </motion.li>
                ))}
              </ol>
            )}
            {[["Por que funciona", d.por_que_funciona], ["Como modelar", d.como_modelar], ["Edição", d.estilo_edicao], ["Áudio", d.audio]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <span className="text-[13px] font-medium text-faint">{k}</span>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink/90">{v}</p>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <Botao tipo="principal" onClick={() => criarCom({ tipo: "modelar", inspiracao: i.id, briefing: "Modelar pro meu nicho" })}>
                <Wand2 className="size-4" /> Modelar
              </Botao>
              <Botao onClick={() => criarCom({ tipo: "clonar", inspiracao: i.id, briefing: "Clonar 100% igual" })}>
                <Copy className="size-4" /> Clonar 100%
              </Botao>
              {i.url && <a href={i.url} target="_blank" rel="noreferrer" className="vidro inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium hover:bg-white/10">Original <ArrowUpRight className="size-4" /></a>}
              <Excluir onConfirmar={excluir} />
            </div>
          </>
        ) : <div className="flex flex-col items-start gap-3"><Status status={i.status} fase={i.fase} />{i.status === "erro" && <Excluir onConfirmar={excluir} />}</div>}
      </div>
    </div>
  );
}

function ItemDetalhe({ x, decupar, criarCom, excluir }: { x: ItemBib; decupar: (u: string) => void; criarCom: (r: Rascunho) => void; excluir: () => void }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {x.video ? <video src={x.video} poster={x.img} controls autoPlay muted loop playsInline className="mx-auto max-h-[52dvh] w-full max-w-[300px] shrink-0 rounded-[20px] object-contain bg-black/30" />
        : x.img && <img src={x.img} alt="" className="mx-auto max-h-[52dvh] w-full max-w-[300px] shrink-0 rounded-[20px] object-contain bg-black/30" />}
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-8">
        <div className="pr-12">
          <span className="text-[13px] text-mute">{[x.autor, fmtViews(x.views) && `${fmtViews(x.views)} views`, x.duracao && fmtTempo(x.duracao)].filter(Boolean).join(" · ")}</span>
          <h3 className="mt-1 text-[21px] font-semibold leading-tight tracking-[-0.02em]">{x.titulo}</h3>
        </div>
        {x.resumo && <p className="text-[14.5px] leading-relaxed text-ink/90">{x.resumo}</p>}
        {x.tecnica && <div><span className="text-[13px] font-medium text-faint">Técnica</span><p className="mt-1 text-[14px] leading-relaxed text-mute">{x.tecnica}</p></div>}
        {x.encaixe && <div><span className="text-[13px] font-medium text-faint">Onde encaixa</span><p className="mt-1 text-[14px] leading-relaxed text-mute">{x.encaixe}</p></div>}
        {x.prompt && (
          <div className="vidro rounded-[16px] p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[13px] font-medium text-faint">Prompt</span><Copiar texto={x.prompt} /></div>
            <p className="max-h-[22dvh] overflow-y-auto whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-ink/85">{x.prompt}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {x.prompt && <Botao tipo="principal" onClick={() => criarCom({ tipo: "animado", briefing: `Usar o motion "${x.titulo}" como referência (técnica: ${x.tecnica ?? "-"}). Prompt de origem: ${x.prompt}\n\nAssunto do meu vídeo: ` })}><Sparkles className="size-4" /> Usar no meu vídeo</Botao>}
          {x.url && <Botao tipo={x.prompt ? "fantasma" : "principal"} onClick={() => decupar(x.url!)}><Telescope className="size-4" /> Decupar</Botao>}
          {x.url && <a href={x.url} target="_blank" rel="noreferrer" className="vidro inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium hover:bg-white/10">Original <ArrowUpRight className="size-4" /></a>}
          <Excluir onConfirmar={excluir} />
        </div>
      </div>
    </div>
  );
}

/* card do mural: só a imagem; título aparece no hover (padrão Pinterest) */
/* prévia no hover: o vídeo só carrega quando o mouse entra (preload none) */
function Card({ img, video, titulo, sub, status, fase, i, onClick, alto }: { img?: string | null; video?: string | null; titulo?: string; sub?: string; status?: string; fase?: string; i: number; onClick: () => void; alto?: boolean }) {
  const vid = useRef<HTMLVideoElement>(null);
  return (
    <motion.button onClick={() => { som.abrir(); onClick(); }}
      onMouseEnter={() => vid.current?.play().catch(() => {})} onMouseLeave={() => { if (vid.current) { vid.current.pause(); vid.current.currentTime = 0; } }}
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ ...molaSuave, delay: Math.min(i % 20, 14) * 0.03 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
      className="group relative mb-2.5 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-[20px] bg-white/[0.04] text-left shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] sm:mb-3">
      {img ? <img src={img} alt="" loading="lazy" className={cx("w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]", alto && "aspect-[9/16]")} />
        : <span className="block aspect-[4/5] p-4 text-[14px] font-semibold leading-snug" style={{ background: "linear-gradient(160deg,#3a0711,#0b0204)" }}>{titulo}</span>}
      {video && img && <video ref={vid} src={video} muted playsInline loop preload="none" className="pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      {status && status !== "pronto" && <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur"><Status status={status} fase={fase} /></span>}
      {sub && <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur tnum">{sub}</span>}
      {img && titulo && (
        <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="line-clamp-2 text-[13px] font-semibold leading-snug">{titulo}</span>
        </span>
      )}
    </motion.button>
  );
}

export function Inspirar({ e, criarCom }: { e: Estado | null; criarCom: (r: Rascunho) => void }) {
  const [url, setUrl] = useState("");
  const [bib, setBib] = useState<ItemBib[]>([]);
  const [fonte, setFonte] = useState("todas");
  const [sub, setSub] = useState("motion");
  const fonteReal = fonte === "estilos" ? sub : fonte;
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [foco, setFoco] = useState(false);
  const [limite, setLimite] = useState(40);
  const [aberta, setAberta] = useState<string | null>(null);
  const [item, setItem] = useState<ItemBib | null>(null);
  const campoBusca = useRef<HTMLInputElement>(null);
  const avisar = useAviso();
  useEffect(() => { biblioteca().then(setBib).catch(() => {}); }, []);
  useEffect(() => { if (buscando) campoBusca.current?.focus(); }, [buscando]);

  const decupar = async (u: string) => {
    try { await post("/api/inspirar", { url: u.trim() }); som.enviar(); avisar("Decupando. Leva uns minutos."); setUrl(""); setItem(null); setFonte("decupados"); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const excluirInsp = async (id: string) => {
    try { await post("/api/excluir-acervo", { insp: id }); avisar("Vídeo excluído do acervo."); setAberta(null); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const excluirItem = async (x: ItemBib) => {
    try { await post("/api/excluir-acervo", { id: x.id }); avisar("Vídeo excluído do acervo."); setItem(null); setBib((b) => b.filter((y) => y.id !== x.id)); limparBiblioteca(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const q = busca.toLowerCase();
  const minhas = (e?.inspiracoes ?? []).filter((i) => !q || `${i.decupagem?.titulo} ${i.info?.titulo} ${i.info?.autor}`.toLowerCase().includes(q));
  const lista = useMemo(() => bib.filter((x) => (fonteReal === "todas" ? x.fonte !== "musicas" : x.fonte === fonteReal) && (!q || `${x.titulo} ${x.autor} ${x.resumo} ${x.tecnica}`.toLowerCase().includes(q))).sort((a, b) => fonteReal === "acervo" ? (b.relevancia ?? 0) - (a.relevancia ?? 0) : 0), [bib, fonteReal, q]);
  const verMinhas = fonte === "todas" || fonte === "decupados";
  const emMusicas = fonte === "musicas";
  const aberto = (e?.inspiracoes ?? []).find((i) => i.id === aberta);
  const valido = /^https?:\/\//.test(url.trim());

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho titulo="Inspirar">
        <div className="flex items-center">
          {/* busca que se abre (referência: Search-Expand Nav, 21st.dev) */}
          <motion.label layout transition={mola} className={cx("flex h-11 items-center gap-2 rounded-full", buscando ? "vidro w-[min(260px,60vw)] px-4" : "w-11 justify-center")}>
            <button type="button" aria-label="Buscar" onClick={() => { som.toque(); setBuscando(true); }} className={cx("grid shrink-0 cursor-pointer place-items-center text-mute hover:text-ink", !buscando && "vidro size-11 rounded-full")}>
              <Search className="size-[17px]" />
            </button>
            <AnimatePresence>
              {buscando && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-w-0 flex-1 items-center">
                  <input ref={campoBusca} value={busca} onChange={(ev) => { setBusca(ev.target.value); setLimite(40); }} placeholder="Buscar"
                    onKeyDown={(ev) => ev.key === "Escape" && (setBusca(""), setBuscando(false))} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
                  <button aria-label="Fechar busca" onClick={() => { setBusca(""); setBuscando(false); }} className="cursor-pointer text-faint hover:text-ink"><X className="size-4" /></button>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.label>
        </div>
      </Cabecalho>

      <form onSubmit={(ev) => { ev.preventDefault(); if (valido) decupar(url); }} data-halo={foco ? "on" : "off"}
        className="halo vidro flex items-center gap-2 rounded-full p-1.5 pl-4">
        <Link2 className="size-[17px] shrink-0 text-faint" />
        <input value={url} onChange={(ev) => setUrl(ev.target.value)} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)} placeholder="Cole o link de um vídeo" inputMode="url"
          className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none" />
        <motion.button type="submit" aria-label="Decupar" disabled={!valido} whileTap={{ scale: 0.88 }} transition={mola}
          className={cx("grid size-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors disabled:cursor-default", valido ? "respira bg-red text-white" : "bg-white/[0.08] text-faint")}>
          <ArrowUp className="size-[18px]" strokeWidth={2.4} />
        </motion.button>
      </form>

      <Segmentos id="fonte" valor={fonte} onChange={(f) => { setFonte(f); setLimite(40); }} className="self-start max-w-full"
        opcoes={FONTES.map((f) => ({ v: f.v, rotulo: f.nome }))} />
      <AnimatePresence initial={false}>
        {fonte === "estilos" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={mola} className="-mt-2 overflow-hidden">
            <Segmentos id="sub-estilo" valor={sub} onChange={(s) => { setSub(s); setLimite(40); }} className="max-w-full" opcoes={ESTILOS.map((f) => ({ v: f.v, rotulo: f.nome }))} />
          </motion.div>
        )}
      </AnimatePresence>

      {emMusicas ? <Musicas busca={busca} /> : (verMinhas && minhas.length) || (fonte !== "decupados" && lista.length) ? (
        <div className="columns-2 gap-2.5 sm:columns-3 sm:gap-3 lg:columns-5">
          {verMinhas && minhas.map((i, k) => (
            <Card key={i.id} i={k} alto img={i.capa} video={i.video} titulo={i.decupagem?.titulo || i.info?.titulo} status={i.status} fase={i.fase}
              sub={fmtViews(i.info?.views) || undefined} onClick={() => setAberta(i.id)} />
          ))}
          {fonte !== "decupados" && lista.slice(0, limite).map((x, k) => (
            <Card key={x.id + k} i={k} img={x.img} video={x.video} titulo={x.titulo} sub={fmtViews(x.views) || undefined} onClick={() => setItem(x)} />
          ))}
        </div>
      ) : <Vazio icone={<Search className="size-6" />} titulo={fonte === "decupados" ? "Cole um link acima pra decupar" : bib.length ? "Nada com esse nome" : "Carregando a biblioteca"} />}
      {fonte !== "decupados" && !emMusicas && limite < lista.length && <Botao className="self-center" onClick={() => setLimite((l) => l + 40)}>Ver mais</Botao>}

      <Folha aberta={!!aberto} onFechar={() => setAberta(null)} larga>{aberto && <Decupagem i={aberto} criarCom={criarCom} excluir={() => excluirInsp(aberto.id)} />}</Folha>
      <Folha aberta={!!item} onFechar={() => setItem(null)} larga>{item && <ItemDetalhe x={item} decupar={decupar} criarCom={criarCom} excluir={() => excluirItem(item)} />}</Folha>
    </div>
  );
}
