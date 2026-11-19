import { useState } from "react";
import { motion } from "motion/react";
import { Check, Download, Send } from "lucide-react";
import { atualizar, post, type Estado } from "../api";
import { Cabecalho, Copiar, Folha, GRADE, Segmentos, Tile, Vazio, cx, mola, useAviso } from "../ui";
import { som } from "../sons";
import { CardVitrine, Fileira, Secao } from "../Vitrine";

const REDES = [
  { v: "instagram", nome: "Instagram", sigla: "IG" },
  { v: "tiktok", nome: "TikTok", sigla: "TT" },
  { v: "youtube", nome: "YouTube", sigla: "YT" },
] as const;

type Item = { ref: string; titulo: string; capa?: string | null; video: string; legenda?: string; hashtags?: string; redes: Set<string>; origem: string };

function itens(e: Estado): Item[] {
  const feitos = new Map<string, Set<string>>();
  for (const p of (e as Estado & { postados?: { ref: string; rede: string }[] }).postados ?? []) {
    if (!feitos.has(p.ref)) feitos.set(p.ref, new Set());
    feitos.get(p.ref)!.add(p.rede);
  }
  const out: Item[] = [];
  for (const g of e.geracoes) if (g.video) out.push({ ref: g.id, titulo: g.titulo || g.briefing, capa: g.capa, video: g.video, legenda: g.legenda, hashtags: g.hashtags, redes: feitos.get(g.id) ?? new Set(), origem: "Criados" });
  for (const j of e.jobs) for (const c of j.cortes) if (c.video && c.status !== "descartado") {
    const ref = `${j.id}:${c.n}`;
    out.push({ ref, titulo: c.titulo, capa: c.capa, video: c.video, legenda: c.legenda, hashtags: c.hashtags, redes: feitos.get(ref) ?? new Set(), origem: `Cortes de ${(j.bruto || j.id).replace(/\.(mov|mp4|m4v)$/i, "")}` });
  }
  return out;
}
export const pendentes = (e: Estado) => itens(e).filter((x) => x.redes.size === 0);

function Detalhe({ x, marcar }: { x: Item; marcar: (ref: string, rede: string) => void }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <video src={x.video} poster={x.capa ?? undefined} controls autoPlay playsInline className="mx-auto aspect-[9/16] w-full max-w-[280px] shrink-0 rounded-[20px] bg-black object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-8">
        <h3 className="pr-12 text-[21px] font-semibold leading-tight tracking-[-0.02em]">{x.titulo}</h3>
        {x.legenda && (
          <div className="vidro rounded-[18px] p-4">
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/90">{x.legenda}</p>
            {x.hashtags && <p className="mt-2 text-[13px] text-mute">{x.hashtags}</p>}
            <div className="mt-3"><Copiar texto={`${x.legenda}\n\n${x.hashtags ?? ""}`.trim()} rotulo="Copiar legenda" /></div>
          </div>
        )}
        <a href={`${x.video}&baixar=1`} onClick={() => som.ok()} className="vidro inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 text-[15px] font-medium hover:bg-white/10">
          <Download className="size-4" /> Baixar
        </a>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-faint">Marcar como postado</span>
          <div className="flex flex-wrap gap-2">
            {REDES.map((r) => {
              const ok = x.redes.has(r.v);
              return (
                <motion.button key={r.v} whileTap={{ scale: 0.9 }} transition={mola} disabled={ok} onClick={() => marcar(x.ref, r.v)}
                  className={cx("inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors disabled:cursor-default",
                    ok ? "bg-ok/15 text-ok" : "bg-white/[0.07] text-mute hover:bg-white/10 hover:text-ink")}>
                  {ok && <Check className="size-4" strokeWidth={2.6} />}{r.nome}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Postar({ e }: { e: Estado | null }) {
  const [ver, setVer] = useState<"geral" | "fila" | "postados">("geral");
  const [aberto, setAberto] = useState<string | null>(null);
  const avisar = useAviso();
  const todos = e ? itens(e) : [];
  const fila = todos.filter((x) => x.redes.size === 0), feitos = todos.filter((x) => x.redes.size > 0);
  const lista = ver === "fila" ? fila : ver === "postados" ? feitos : todos;
  const siglas = (x: Item) => REDES.filter((r) => x.redes.has(r.v)).map((r) => r.sigla).join(" · ");
  const atual = todos.find((x) => x.ref === aberto);
  const marcar = async (ref: string, rede: string) => {
    try { await post("/api/postado", { ref, rede }); som.ok(); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho titulo="Postar" n={fila.length}>
        <Segmentos id="postar" valor={ver} onChange={setVer} opcoes={[{ v: "geral", rotulo: "Visão geral" }, { v: "fila", rotulo: <>Na fila <span className="text-faint tnum">{fila.length}</span></> }, { v: "postados", rotulo: <>Postados <span className="text-faint tnum">{feitos.length}</span></> }]} />
      </Cabecalho>
      {ver === "geral" && todos.length ? (
        <div className="flex flex-col gap-10">
          {fila.length > 0 && (
            <Secao titulo="Na fila" sub="Esperando post" total={fila.length} verTudo={() => setVer("fila")}>
              <Fileira>{fila.map((x, n) => <CardVitrine key={x.ref} i={n} img={x.capa} video={x.video} titulo={x.titulo} meta={x.origem} onClick={() => setAberto(x.ref)} />)}</Fileira>
            </Secao>
          )}
          {feitos.length > 0 && (
            <Secao titulo="Postados" total={feitos.length} verTudo={() => setVer("postados")} i={1}>
              <Fileira>{feitos.map((x, n) => <CardVitrine key={x.ref} i={n} img={x.capa} video={x.video} titulo={x.titulo} selo={siglas(x)} meta={x.origem} onClick={() => setAberto(x.ref)} />)}</Fileira>
            </Secao>
          )}
        </div>
      ) : lista.length ? (
        <div className={GRADE}>
          {lista.map((x, i) => (
            <Tile key={x.ref} i={i} capa={x.capa} video={x.video} titulo={x.titulo} onClick={() => setAberto(x.ref)}
              rodape={x.redes.size > 0 && (
                <span className="pointer-events-none absolute left-2.5 top-2.5 flex gap-1" aria-label={`Postado em ${REDES.filter((r) => x.redes.has(r.v)).map((r) => r.nome).join(", ")}`}>
                  {REDES.filter((r) => x.redes.has(r.v)).map((r) => (
                    <span key={r.v} className="rounded-full bg-black/60 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-ok backdrop-blur">{r.sigla}</span>
                  ))}
                </span>
              )} />
          ))}
        </div>
      ) : (
        <Vazio icone={<Send className="size-6" />} titulo={ver === "postados" ? "Nada postado ainda" : "Nada esperando post"} />
      )}
      <Folha aberta={!!atual} onFechar={() => setAberto(null)} larga>{atual && <Detalhe x={atual} marcar={marcar} />}</Folha>
    </div>
  );
}
