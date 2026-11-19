import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Captions, ChevronRight, Download } from "lucide-react";
import { atualizar, post, type Transcricao } from "../api";
import { Copiar, Excluir, Status, cascata, cx, useAviso } from "../ui";
import { som } from "../sons";

const ocupado = (t: Transcricao) => ["na-fila", "rodando", "gerando"].includes(t.status);
const nome = (t: Transcricao) => (t.titulo || t.arquivo || t.url || "Vídeo").replace(/\.(mov|mp4|m4v)$/i, "");
const mmss = (s?: number) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

export function LinhaTranscricao({ t, i, onClick }: { t: Transcricao; i: number; onClick: () => void }) {
  return (
    <motion.button data-luz {...cascata(i)} whileTap={{ scale: 0.98 }} onClick={() => { som.abrir(); onClick(); }}
      className="vidro group flex w-full cursor-pointer items-center gap-3.5 rounded-[18px] p-3.5 text-left transition-colors hover:bg-white/[0.07]">
      <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-white/[0.06] text-mute"><Captions className="size-[18px]" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{nome(t)}</span>
        <span className={cx("mt-0.5 block truncate text-[13px]", ocupado(t) ? "brilha-texto" : t.status === "erro" ? "text-red" : "text-mute")}>
          {ocupado(t) ? (t.fase === "baixando" ? "Baixando…" : "Transcrevendo…") : t.status === "erro" ? "Não deu pra transcrever" : t.previa}
        </span>
      </span>
      {t.duracao ? <span className="hidden shrink-0 text-[12px] text-faint tnum sm:block">{mmss(t.duracao)}</span> : null}
      <ChevronRight className="size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
    </motion.button>
  );
}

export function AbrirTranscricao({ t, fechar }: { t: Transcricao; fechar: () => void }) {
  const avisar = useAviso();
  const [tempo, setTempo] = useState(false);
  const [txt, setTxt] = useState("");
  const fonte = tempo ? t.tempo : t.texto;
  useEffect(() => { if (fonte) fetch(fonte).then((r) => r.text()).then(setTxt).catch(() => setTxt("")); }, [fonte]);
  const excluir = async () => {
    try { await post("/api/excluir-transcricao", { id: t.id }); avisar("Transcrição excluída."); fechar(); atualizar(); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const baixar = (u?: string | null) => u && <a href={`${u}&baixar=1`} className="vidro inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium hover:bg-white/10"><Download className="size-4" /> {u.includes(".srt") ? "Legenda .srt" : "Texto .txt"}</a>;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 pr-12">
        <Status status={t.status} fase={t.fase} />
        <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere]">{nome(t)}</h3>
        {t.url && <a href={t.url} target="_blank" rel="noreferrer" className="truncate text-[13px] text-faint hover:text-ink">{t.url}</a>}
      </div>
      {t.status === "erro" && <p className="rounded-[16px] bg-red-soft p-4 text-[14px]">{t.erro || "Não deu pra transcrever."}</p>}
      {ocupado(t) && <p className="brilha-texto text-[15px]">{t.fase === "baixando" ? "Baixando o vídeo…" : "Transcrevendo. Vídeo curto leva segundos."}</p>}
      {t.status === "pronto" && (<>
        <div className="flex flex-wrap items-center gap-2">
          <Copiar texto={txt} rotulo="Copiar texto" />
          <button onClick={() => { som.toque(); setTempo(!tempo); }} className={cx("min-h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-medium", tempo ? "bg-white/15 text-ink" : "bg-white/[0.06] text-mute hover:text-ink")}>
            {tempo ? "Esconder tempo" : "Mostrar tempo"}
          </button>
        </div>
        <div className="vidro max-h-[50dvh] overflow-y-auto rounded-[18px] p-4">
          <p className="whitespace-pre-line text-[15px] leading-relaxed [overflow-wrap:anywhere]">{txt || "…"}</p>
        </div>
      </>)}
      <div className="flex flex-wrap gap-2">
        {t.status === "pronto" && baixar(t.texto)}
        {t.status === "pronto" && baixar(t.srt)}
        {!ocupado(t) && <Excluir onConfirmar={excluir} />}
      </div>
    </div>
  );
}
