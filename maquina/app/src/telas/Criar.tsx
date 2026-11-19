import { useMemo, useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { Check, ChevronRight, Pencil, Copy, Download, FileText, Megaphone, Plus, RotateCcw, Smile, Sparkles, Telescope } from "lucide-react";
import { lerRoteiro } from "../roteiro";
import { atualizar, post, type Estado, type Geracao } from "../api";
import { Botao, Cabecalho, Copiar, Folha, GRADE, Segmentos, Status, Tile, Vazio, cascata, cx, mola, useAviso } from "../ui";
import type { Aba } from "../Dock";
import { som } from "../sons";
import { AbrirTranscricao, LinhaTranscricao } from "./Transcricoes";

type Tipo = Geracao["tipo"];
export type { Rascunho } from "../api";

const TIPOS: { v: Tipo; nome: string; Icone: typeof FileText }[] = [
  { v: "animado", nome: "Animados", Icone: Smile },
  { v: "criativo", nome: "Criativos", Icone: Megaphone },
  { v: "modelar", nome: "Modelados", Icone: Telescope },
  { v: "clonar", nome: "Clonados", Icone: Copy },
  { v: "roteiro", nome: "Roteiros", Icone: FileText },
];

/* roteiro aberto: ganchos como opções e a fala em teleprompter, cena em segundo plano */
function Teleprompter({ txt, json }: { txt: string; json?: Geracao["roteiro_json"] }) {
  const r = lerRoteiro(txt, json);
  const [verCena, setVerCena] = useState(false);
  const [verNotas, setVerNotas] = useState(false);
  if (!r) return (
    <div className="vidro rounded-[18px] p-4">
      <div className="mb-3 flex items-center justify-between"><span className="text-[15px] font-semibold tracking-tight">Roteiro</span><Copiar texto={txt} /></div>
      <pre className="max-h-[42dvh] overflow-y-auto whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-ink/90">{txt}</pre>
    </div>
  );
  const fala = r.falas.map((f) => f.fala).join("\n");
  return (
    <div className="flex flex-col gap-5">
      {r.ganchos.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-mute">Ganchos</span>
          {r.ganchos.map((g, i) => (
            <motion.div key={i} {...cascata(i)} className={cx("rounded-[16px] p-3.5", g.escolhido ? "bg-red/[0.12] shadow-[inset_0_0_0_1px_rgb(225_29_42/0.45)]" : "vidro")}>
              <span className={cx("text-[12px] font-medium", g.escolhido ? "text-red" : "text-faint")}>{g.tipo}{g.escolhido && " · escolhido"}</span>
              <p className="mt-1 text-[15px] leading-snug">{g.texto}</p>
            </motion.div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-mute">Fala{r.duracao ? ` · ${r.duracao}s` : ""}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => { som.toque(); setVerCena((v) => !v); }} className={cx("min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors", verCena ? "bg-white/10 text-ink" : "text-mute hover:text-ink")}>Cenas</button>
            <Copiar texto={fala} rotulo="Copiar fala" />
          </div>
        </div>
        <ol className="flex flex-col gap-3.5">
          {r.falas.map((f, i) => (
            <motion.li key={i} {...cascata(i)} className="flex gap-3">
              <span className="w-5 shrink-0 pt-[3px] text-right text-[12px] text-faint tnum">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[18px] font-medium leading-snug tracking-[-0.01em]">{f.fala}</p>
                {verCena && f.cena && <p className="mt-1 text-[13px] leading-relaxed text-mute">{f.cena}</p>}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
      {r.notas.length > 0 && (
        <div className="flex flex-col gap-2">
          <button onClick={() => { som.toque(); setVerNotas((v) => !v); }} aria-expanded={verNotas}
            className="min-h-9 cursor-pointer self-start rounded-full px-3 text-[13px] font-medium text-faint transition-colors hover:text-ink">{verNotas ? "Esconder notas" : "Notas da Forja"}</button>
          {verNotas && <ul className="vidro flex flex-col gap-1.5 rounded-[16px] p-4 text-[13px] leading-relaxed text-mute">{r.notas.map((n, i) => <li key={i}>{n}</li>)}</ul>}
        </div>
      )}
    </div>
  );
}

/* roteiros não são vídeo: lista enxuta no fim, depois dos vídeos */
function LinhaRoteiro({ g, i, onClick }: { g: Geracao; i: number; onClick: () => void }) {
  const r = lerRoteiro(g.roteiro_txt, g.roteiro_json);
  const gancho = r?.ganchos.find((x) => x.escolhido)?.texto ?? r?.falas[0]?.fala;
  const ocupado = ["na-fila", "rodando", "gerando"].includes(g.status);
  return (
    <motion.button data-luz {...cascata(i)} whileTap={{ scale: 0.98 }} onClick={() => { som.abrir(); onClick(); }}
      className="vidro group flex w-full cursor-pointer items-center gap-3.5 rounded-[18px] p-3.5 text-left transition-colors hover:bg-white/[0.07]">
      <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-white/[0.06] text-mute"><FileText className="size-[18px]" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{g.titulo || g.briefing}</span>
        <span className={cx("mt-0.5 block truncate text-[13px]", ocupado ? "brilha-texto" : "text-mute")}>{ocupado ? "Escrevendo…" : gancho || g.briefing}</span>
      </span>
      {r?.duracao && <span className="hidden shrink-0 text-[12px] text-faint tnum sm:block">{r.duracao}s</span>}
      <ChevronRight className="size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
    </motion.button>
  );
}

/* nicho e status do criativo: só o necessário pra organizar */
function Marcar({ g }: { g: Geracao }) {
  const [nicho, setNicho] = useState(g.nicho ?? "");
  const avisar = useAviso();
  const val = g.validacao ?? "teste";
  const salvar = async (c: { nicho?: string; validacao?: "teste" | "validado" }) => {
    try { await post("/api/marcar-geracao", { id: g.id, ...c }); atualizar(); } catch (er) { avisar((er as Error).message, true); }
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Segmentos id={`val-${g.id}`} valor={val} onChange={(v) => salvar({ validacao: v })} className="self-start"
        opcoes={[{ v: "teste" as const, rotulo: "Em teste" }, { v: "validado" as const, rotulo: "Validado" }]} />
      <input value={nicho} onChange={(e) => setNicho(e.target.value)} onBlur={() => nicho.trim() !== (g.nicho ?? "") && salvar({ nicho })}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} maxLength={30} placeholder="Nicho (ex.: estética)"
        className="vidro min-h-11 min-w-0 flex-1 rounded-full px-4 text-[14.5px] outline-none placeholder:text-faint focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
    </div>
  );
}

/* editar a copy antes de aprovar: cada fala vira um campo; salva no roteiro.json/roteiro.md */
function EditorCopy({ g, fechar }: { g: Geracao; fechar: () => void }) {
  const avisar = useAviso();
  const [falas, setFalas] = useState(() => (g.roteiro_json?.falas ?? []).map((f) => f.texto));
  const [legenda, setLegenda] = useState(g.legenda ?? "");
  const [salvando, setSalvando] = useState(false);
  const campo = "vidro w-full resize-none rounded-[14px] px-4 py-3 text-[15.5px] leading-relaxed outline-none [field-sizing:content] focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]";
  const salvar = async () => {
    setSalvando(true);
    try { await post("/api/editar-copy", { id: g.id, falas, legenda }); som.enviar(); avisar("Copy salva."); atualizar(); fechar(); }
    catch (er) { avisar((er as Error).message, true); setSalvando(false); }
  };
  if (!falas.length) return <p className="text-[14px] text-mute">Essa copy não tem falas separadas pra editar.</p>;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-medium text-faint">Fala</p>
      {falas.map((f, i) => (
        <label key={i} className="flex flex-col gap-1.5">
          {g.roteiro_json?.falas?.[i]?.cena && <span className="text-[12.5px] text-faint">{g.roteiro_json.falas[i].cena}</span>}
          <textarea value={f} rows={1} aria-label={`Fala ${i + 1}`} onChange={(e) => setFalas(falas.map((x, j) => (j === i ? e.target.value : x)))} className={campo} />
        </label>
      ))}
      {g.legenda != null && (<>
        <p className="mt-2 text-[13px] font-medium text-faint">Legenda do post</p>
        <textarea value={legenda} rows={3} aria-label="Legenda do post" onChange={(e) => setLegenda(e.target.value)} className={campo} />
      </>)}
      <div className="flex flex-wrap gap-2">
        <Botao tipo="principal" onClick={salvar} disabled={salvando || falas.some((f) => !f.trim())}><Check className="size-4" /> {salvando ? "Salvando…" : "Salvar copy"}</Botao>
        <Botao onClick={fechar}>Cancelar</Botao>
      </div>
    </div>
  );
}

function Abrir({ g, aoAprovar }: { g: Geracao; aoAprovar: () => void }) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");
  const avisar = useAviso();
  const legenda = g.legenda ? (
        <div className="vidro rounded-[18px] p-4">
          <p className="whitespace-pre-line text-[14px] leading-relaxed">{g.legenda}</p>
          {g.hashtags && <p className="mt-2 text-[13px] text-mute">{g.hashtags}</p>}
          <div className="mt-3"><Copiar texto={`${g.legenda}\n\n${g.hashtags ?? ""}`.trim()} rotulo="Copiar legenda" /></div>
        </div>
  ) : null;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 pr-12">
        <Status status={g.status} fase={g.fase} />
        <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{g.titulo || g.briefing}</h3>
      </div>
      {g.video && <video src={g.video} controls autoPlay playsInline className="mx-auto aspect-[9/16] max-h-[60dvh] rounded-[20px] bg-black" />}
      {g.status === "aguardando-voz" && (
        <p className="vidro rounded-[16px] p-4 text-[14px] text-mute">Roteiro pronto. A voz precisa da chave da ElevenLabs no arquivo <span className="font-mono text-ink">maquina/.env</span>.</p>
      )}
      {g.status === "aprovar-copy" && (
        <div className="vidro flex flex-col gap-3 rounded-[18px] p-4">
          <p className="text-[14px] text-mute">Leia a copy e mude o que quiser. Aprovando, a Forja gera voz, música e vídeo sem mudar nenhuma palavra.</p>
          {!editando && <div className="flex flex-wrap gap-2">
            <Botao tipo="principal" onClick={async () => { try { await post("/api/aprovar-copy", { id: g.id }); som.enviar(); avisar("Copy aprovada. Gerando o vídeo."); aoAprovar(); atualizar(); } catch (er) { avisar((er as Error).message, true); } }}>
              <Check className="size-4" /> Aprovar copy
            </Botao>
            {!!g.roteiro_json?.falas?.length && <Botao onClick={() => { som.toque(); setEditando(true); }}><Pencil className="size-4" /> Editar copy</Botao>}
          </div>}
        </div>
      )}
      {g.revisao && !g.revisao.aprovado && !!g.revisao.problemas?.length && (
        <div className="rounded-[16px] bg-red-soft p-4 text-[14px]">
          <p className="mb-2 font-medium">Revisão reprovou{g.revisao.nota != null ? ` (nota ${g.revisao.nota})` : ""}</p>
          <ul className="list-disc space-y-1 pl-5 text-ink/90">{g.revisao.problemas.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      )}
      {g.status === "erro" && (
        <div className="flex flex-col gap-3 rounded-[16px] bg-red-soft p-4 text-[14px]">
          <p>{g.erro || "Parou no meio do caminho."}</p>
          <TentarDeNovo id={g.id} grande />
        </div>
      )}
      {g.tipo !== "roteiro" && <Marcar g={g} />}
      {editando && g.status === "aprovar-copy" ? <EditorCopy g={g} fechar={() => setEditando(false)} /> : <>
      {g.tipo !== "roteiro" && legenda}
      {(g.roteiro_txt || g.roteiro_json) && <Teleprompter txt={g.roteiro_txt ?? ""} json={g.roteiro_json} />}
      {g.tipo === "roteiro" && legenda}
      </>}
      <div className="flex flex-wrap gap-2">
        {g.video && <a href={`${g.video}&baixar=1`} className="vidro inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium hover:bg-white/10"><Download className="size-4" /> Baixar</a>}
      </div>
      {!["na-fila", "rodando", "gerando"].includes(g.status) && (
        <div className="flex flex-col gap-2">
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="O que mudar? Ex.: gancho mais agressivo"
            className="vidro w-full resize-none rounded-[16px] px-4 py-3 text-[15px] outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.6)]" />
          <Botao disabled={!nota.trim()} className="self-start" onClick={async () => { await post("/api/refazer-geracao", { id: g.id, nota }); setNota(""); avisar("Refazendo"); atualizar(); }}>
            <RotateCcw className="size-4" /> Refazer
          </Botao>
        </div>
      )}
    </div>
  );
}

/* card que deu erro: um toque roda de novo do mesmo jeito (sem precisar escrever o que mudar) */
function TentarDeNovo({ id, grande }: { id: string; grande?: boolean }) {
  const avisar = useAviso();
  const ir = async (ev: MouseEvent) => {
    ev.stopPropagation();
    try { await post("/api/tentar-de-novo", { id }); som.enviar(); avisar("Rodando de novo"); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  return grande ? (
    <Botao className="self-start" onClick={ir}><RotateCcw className="size-4" /> Tentar de novo</Botao>
  ) : (
    <button onClick={ir} aria-label="Tentar de novo" className="absolute bottom-2.5 right-2.5 z-10 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-red px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(225_29_42/0.8)]">
      <RotateCcw className="size-3.5" strokeWidth={2.4} /> Tentar de novo
    </button>
  );
}

export function Criar({ e, ir }: { e: Estado | null; ir: (a: Aba) => void }) {
  const [filtro, setFiltro] = useState<"tudo" | Tipo | "transcricao">("tudo");
  const [abertaT, setAbertaT] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);
  const [foco, setFoco] = useState<string | null>(null);
  const [nicho, setNicho] = useState("");
  const [val, setVal] = useState<"" | "teste" | "validado">("");
  const todos = e?.geracoes ?? [];
  const nichos = [...new Set(todos.filter((g) => g.tipo !== "roteiro" && g.nicho).map((g) => g.nicho!))];
  const nichoAt = nichos.includes(nicho) ? nicho : "";
  const lista = useMemo(() => todos.filter((g) => g.tipo !== "roteiro" && (filtro === "tudo" || g.tipo === filtro)
    && (!nichoAt || g.nicho === nichoAt) && (!val || (g.validacao ?? "teste") === val)), [todos, filtro, nichoAt, val]);
  const roteiros = useMemo(() => todos.filter((g) => g.tipo === "roteiro" && (filtro === "tudo" || filtro === "roteiro")), [todos, filtro]);
  const aberto = todos.find((g) => g.id === aberta);
  const transc = e?.transcricoes ?? [];
  const abertoT = transc.find((t) => t.id === abertaT);
  // aprovou a copy: fecha a folha, limpa os filtros e leva até o card que está gerando
  const irPraGeracao = (id: string) => {
    setAberta(null); setFiltro("tudo"); setNicho(""); setVal(""); setFoco(id);
    setTimeout(() => document.querySelector(`[data-tile="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
    setTimeout(() => setFoco((f) => (f === id ? null : f)), 4000);
  };
  const conta = (t: Tipo) => todos.filter((g) => g.tipo === t).length;

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho titulo="Criados" n={todos.length}>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ rotate: 90 }} transition={mola} aria-label="Criar novo" onClick={() => ir("inicio")}
          className="respira grid size-11 cursor-pointer place-items-center rounded-full bg-red text-white">
          <Plus className="size-5" strokeWidth={2.4} />
        </motion.button>
      </Cabecalho>
      <Segmentos id="criados" valor={filtro} onChange={setFiltro} className="self-start max-w-full"
        opcoes={[{ v: "tudo" as const, rotulo: "Tudo" }, ...TIPOS.filter((t) => conta(t.v)).map((t) => ({ v: t.v, rotulo: t.nome })), ...(transc.length ? [{ v: "transcricao" as const, rotulo: "Transcrições" }] : [])]} />
      {todos.some((g) => g.tipo !== "roteiro") && filtro !== "transcricao" && filtro !== "roteiro" && (
        <div className="flex flex-wrap items-center gap-2">
          <Segmentos id="val" valor={val} onChange={setVal} className="max-w-full"
            opcoes={[{ v: "" as const, rotulo: "Todos" }, { v: "teste" as const, rotulo: "Em teste" }, { v: "validado" as const, rotulo: "Validados" }]} />
          {nichos.length > 0 && (
            <Segmentos id="nicho" valor={nichoAt} onChange={setNicho} className="max-w-full"
              opcoes={[{ v: "", rotulo: "Nichos" }, ...nichos.map((n) => ({ v: n, rotulo: n }))]} />
          )}
        </div>
      )}
      {lista.length > 0 && (
        <div className={GRADE}>
          {lista.map((g, i) => (
            <Tile key={g.id} i={i} capa={g.capa} video={g.video} titulo={g.titulo || g.briefing}
              texto={(g.titulo || g.roteiro_txt?.split("\n").find((l) => l.trim().length > 12) || g.briefing).replace(/^[#*\s]+/, "")}
              status={g.status} fase={g.fase} desde={g.desde} fundo={g.inspiracao ? e?.inspiracoes.find((x) => x.id === g.inspiracao)?.capa : null}
              onClick={() => setAberta(g.id)} id={g.id} sel={foco === g.id}
              canto={g.status === "erro" && <TentarDeNovo id={g.id} />} />
          ))}
        </div>
      )}
      {roteiros.length > 0 && (
        <section className="flex flex-col gap-2.5">
          {filtro === "tudo" && lista.length > 0 && <h2 className="mt-4 text-[17px] font-semibold tracking-tight">Roteiros <span className="text-[14px] font-normal text-faint tnum">{roteiros.length}</span></h2>}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:grid-cols-2">{roteiros.map((g, i) => <LinhaRoteiro key={g.id} g={g} i={i} onClick={() => setAberta(g.id)} />)}</div>
        </section>
      )}
      {transc.length > 0 && (filtro === "tudo" || filtro === "transcricao") && (
        <section className="flex flex-col gap-2.5">
          {filtro === "tudo" && <h2 className="mt-4 text-[17px] font-semibold tracking-tight">Transcrições <span className="text-[14px] font-normal text-faint tnum">{transc.length}</span></h2>}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:grid-cols-2">{transc.map((t, i) => <LinhaTranscricao key={t.id} t={t} i={i} onClick={() => setAbertaT(t.id)} />)}</div>
        </section>
      )}
      <Folha aberta={!!abertoT} onFechar={() => setAbertaT(null)}>{abertoT && <AbrirTranscricao t={abertoT} fechar={() => setAbertaT(null)} />}</Folha>
      {!lista.length && !roteiros.length && !transc.length && <Vazio icone={<Sparkles className="size-6" />} titulo="Nada criado ainda"><Botao tipo="principal" onClick={() => ir("inicio")}>Criar o primeiro</Botao></Vazio>}
      <Folha aberta={!!aberto} onFechar={() => setAberta(null)}>{aberto && <Abrir g={aberto} aoAprovar={() => irPraGeracao(aberto.id)} />}</Folha>
    </div>
  );
}
