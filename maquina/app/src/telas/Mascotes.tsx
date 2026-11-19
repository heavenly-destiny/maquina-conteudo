/* Criador de mascote: escolhe o modelo, descreve o personagem e a Forja desenha o mascote e uma folha
   com 32 reações recortadas (PNG sem fundo), prontas pra animar dentro do vídeo de historinha/quadrinho. */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Check, Download, RotateCcw, Smile, Sparkles, X } from "lucide-react";
import { atualizar, post, subirImagem, type Estado, type Mascote } from "../api";
import { Botao, Cabecalho, Excluir, Folha, GRADE, LixeiraCanto, Status, Vazio, cascata, cx, mola, useAviso } from "../ui";
import { som } from "../sons";

const MODELOS = [
  { v: "traco", nome: "Traço", sub: "Boneco de caneta, estilo explicação" },
  { v: "3d", nome: "3D", sub: "Personagem tipo animação de cinema" },
  { v: "bicho", nome: "Bichinho", sub: "Animal fofo em 3D" },
  { v: "objeto", nome: "Objeto", sub: "Coisa do dia a dia com rosto" },
  { v: "quadrinho", nome: "Quadrinho", sub: "Desenho 2D com contorno" },
  { v: "massinha", nome: "Massinha", sub: "Stop-motion de argila" },
] as const;
type Modelo = (typeof MODELOS)[number]["v"];

const IDEIAS: Record<Modelo, string> = {
  traco: "cabeça redonda, sorriso simples, camiseta branca",
  "3d": "mulher de 30 anos, cabelo cacheado, moletom rosa, óculos",
  bicho: "gatinho laranja gordinho, bochecha rosada, coleira vermelha",
  objeto: "celular com rosto, capinha vermelha, bracinhos finos",
  quadrinho: "rapaz de boné, camiseta amarela, tênis branco",
  massinha: "bolinha azul com olhos grandes e um dentinho",
};

// folha que veio fora do formato pedido não tem nome por reação: vira "Reação 7"
const NOME_REACAO = (n: string, i: number) => /^folha\d+-\d+$/.test(n) ? `Reação ${i + 1}` : n.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const XADREZ = { backgroundImage: "conic-gradient(rgb(255 255 255/0.05) 25%, transparent 0 50%, rgb(255 255 255/0.05) 0 75%, transparent 0)", backgroundSize: "18px 18px" };

function Abrir({ m, fechar }: { m: Mascote; fechar: () => void }) {
  const avisar = useAviso();
  const ocupado = ["na-fila", "gerando"].includes(m.status);
  const refazer = async () => { try { await post("/api/refazer-mascote", { id: m.id }); atualizar(); avisar("Tentando de novo"); } catch (er) { avisar((er as Error).message, true); } };
  const excluir = async () => { try { await post("/api/excluir-mascote", { id: m.id }); atualizar(); fechar(); avisar("Foi pra Lixeira"); } catch (er) { avisar((er as Error).message, true); } };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[22px] bg-white/[0.04]" style={XADREZ}>
          {m.imagem ? <img src={m.imagem} alt="" className="size-full object-contain p-2" /> : <Smile className="size-8 text-faint" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-faint">{MODELOS.find((x) => x.v === m.modelo)?.nome}</p>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{m.nome || "Mascote"}</h2>
          <p className="mt-1 text-[14.5px] text-mute">{m.caracteristicas}</p>
          <div className="mt-2"><Status status={m.status} fase={m.fase} /></div>
        </div>
      </div>
      {m.status === "erro" && (
        <div className="flex flex-col gap-3 rounded-[18px] bg-red/10 p-4 text-[14.5px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink/90">{m.erro}</p>
          <Botao onClick={refazer} className="shrink-0"><RotateCcw className="size-4" /> Tentar de novo</Botao>
        </div>
      )}
      {m.reacoes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[17px] font-semibold tracking-tight">Reações <span className="text-[13px] font-medium text-faint tnum">{m.reacoes.length}</span></h3>
            <span className="text-[12.5px] text-faint">PNG sem fundo</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {m.reacoes.map((r, i) => (
              <motion.a key={r.nome} {...cascata(i)} href={r.url} download={`${m.nome || "mascote"}-${r.nome}.png`} onClick={() => som.toque()}
                className="group relative flex cursor-pointer flex-col items-center gap-1 rounded-[16px] bg-white/[0.03] p-2 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.07]">
                <span className="aspect-square w-full overflow-hidden rounded-[12px]" style={XADREZ}>
                  <img src={r.url} alt={r.nome} loading="lazy" className="size-full object-contain transition-transform duration-300 group-hover:scale-[1.06]" />
                </span>
                <span className="line-clamp-1 text-[12px] text-mute">{NOME_REACAO(r.nome, i)}</span>
                <Download aria-hidden className="absolute right-2 top-2 size-3.5 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.a>
            ))}
          </div>
        </div>
      )}
      {m.folhas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight">Folhas originais</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {m.folhas.map((f, i) => (
              <a key={f} href={f} download={`${m.nome || "mascote"}-folha-${i + 1}.png`} className="overflow-hidden rounded-[16px] ring-1 ring-white/[0.06]">
                <img src={f} alt={`Folha ${i + 1}`} loading="lazy" className="w-full" />
              </a>
            ))}
          </div>
        </div>
      )}
      {!ocupado && <div className="flex justify-end"><Excluir onConfirmar={excluir} /></div>}
    </div>
  );
}

export function Mascotes({ e }: { e: Estado | null }) {
  const avisar = useAviso();
  const [modelo, setModelo] = useState<Modelo>("3d");
  const [nome, setNome] = useState("");
  const [carac, setCarac] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const previa = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);
  const inputFoto = useRef<HTMLInputElement>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const lista = useMemo(() => e?.mascotes ?? [], [e]);
  const aberto = lista.find((m) => m.id === abertoId);

  const criar = async () => {
    if (!carac.trim() && !foto) { avisar("Manda uma foto ou descreve como ele é", true); return; }
    setEnviando(true);
    try {
      const img = foto ? await subirImagem(foto) : undefined;
      await post("/api/mascote", { modelo, nome: nome.trim(), caracteristicas: carac.trim(), foto: img });
      atualizar(); setNome(""); setCarac(""); setFoto(null); avisar("Desenhando o mascote");
    } catch (er) { avisar((er as Error).message, true); }
    setEnviando(false);
  };
  const excluir = async (id: string) => { try { await post("/api/excluir-mascote", { id }); atualizar(); avisar("Foi pra Lixeira"); } catch (er) { avisar((er as Error).message, true); } };

  return (
    <div className="flex flex-col gap-8">
      <Cabecalho titulo="Mascotes" n={lista.length} />

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight">Modelo</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:grid-cols-6">
          {MODELOS.map((m, i) => {
            const sel = modelo === m.v;
            return (
              <motion.button key={m.v} {...cascata(i)} onClick={() => { som.toque(); setModelo(m.v); }} aria-pressed={sel}
                className={cx("group relative flex cursor-pointer flex-col overflow-hidden rounded-[20px] text-left ring-1 transition-shadow", sel ? "ring-2 ring-red shadow-[0_18px_40px_-20px_rgb(225_29_42/0.8)]" : "ring-white/[0.07] hover:ring-white/20")}>
                <span className="relative aspect-square overflow-hidden bg-[#ececec]">
                  <img src={`/mascotes/${m.v}.jpg`} alt="" className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
                  <AnimatePresence>{sel && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={mola}
                      className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-red text-white shadow-lg"><Check className="size-3.5" strokeWidth={3} /></motion.span>
                  )}</AnimatePresence>
                </span>
                <span className="bg-white/[0.03] px-2.5 py-2 sm:px-3 sm:py-2.5">
                  <span className="block text-[14.5px] font-medium">{m.nome}</span>
                  <span className="hidden line-clamp-1 text-[12px] text-faint sm:block">{m.sub}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="vidro flex flex-col gap-4 rounded-[24px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* foto da pessoa: o mascote sai com o rosto, cabelo e roupa dela no estilo escolhido */}
          <input ref={inputFoto} type="file" accept="image/*" hidden onChange={(ev) => { const a = ev.target.files?.[0]; if (a) { som.toque(); setFoto(a); } ev.target.value = ""; }} />
          {previa ? (
            <div className="relative size-[104px] shrink-0 overflow-hidden rounded-[16px] ring-1 ring-white/10 sm:size-[52px]">
              <img src={previa} alt="Sua foto" className="size-full object-cover" />
              <button aria-label="Tirar a foto" onClick={() => { som.toque(); setFoto(null); }} className="absolute right-1 top-1 grid size-6 cursor-pointer place-items-center rounded-full bg-black/60 backdrop-blur"><X className="size-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => inputFoto.current?.click()} className="flex min-h-[52px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-white/[0.05] px-4 text-[15px] text-mute ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-ink">
              <Camera className="size-[18px]" /> Usar minha foto
            </button>
          )}
          <input value={nome} onChange={(ev) => setNome(ev.target.value)} placeholder="Nome (opcional)" maxLength={60}
            className="w-full rounded-[14px] bg-white/[0.05] px-4 py-3 text-[16px] outline-none ring-1 ring-white/[0.06] focus:ring-2 focus:ring-red/60 sm:w-56" />
          <textarea value={carac} onChange={(ev) => setCarac(ev.target.value)} rows={2} placeholder={foto ? "Algum detalhe a mais? (opcional)" : `Como ele é. Ex.: ${IDEIAS[modelo]}`} maxLength={1200}
            className="min-h-[52px] w-full flex-1 resize-none rounded-[14px] bg-white/[0.05] px-4 py-3 text-[16px] outline-none ring-1 ring-white/[0.06] focus:ring-2 focus:ring-red/60" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-faint">{foto ? "Seu mascote com o seu rosto" : "Sai o mascote"} e 32 reações sem fundo · cerca de 2 min</p>
          <Botao tipo="principal" onClick={criar} carregando={enviando} className="w-full sm:w-auto"><Sparkles className="size-4" /> Criar mascote</Botao>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight">Seus mascotes</h2>
        {lista.length === 0 ? (
          <Vazio icone={<Smile className="size-6" />} titulo="Nenhum mascote ainda" />
        ) : (
          <div className={GRADE}>
            {lista.map((m, i) => {
              const ocupado = ["na-fila", "gerando"].includes(m.status);
              return (
                <motion.div key={m.id} {...cascata(i)} className="group relative">
                  <button onClick={() => { som.abrir(); setAbertoId(m.id); }} className="block w-full cursor-pointer text-left">
                    <span className="relative block aspect-square overflow-hidden rounded-[18px] bg-white/[0.04] ring-1 ring-white/[0.07]" style={XADREZ}>
                      {m.imagem ? <img src={m.imagem} alt="" className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.05]" />
                        : <span className="grid size-full place-items-center">{ocupado ? <span className="size-8 animate-pulse rounded-full bg-red/40" /> : <Smile className="size-7 text-faint" />}</span>}
                      {m.reacoes.length > 0 && <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur tnum">{m.reacoes.length} reações</span>}
                    </span>
                    <span className="mt-2 block px-0.5">
                      <span className="block line-clamp-1 text-[14px] font-medium">{m.nome || MODELOS.find((x) => x.v === m.modelo)?.nome}</span>
                      <span className="block"><Status status={m.status} fase={m.fase} /></span>
                    </span>
                  </button>
                  {!ocupado && <LixeiraCanto onConfirmar={() => excluir(m.id)} />}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Folha aberta={!!aberto} onFechar={() => setAbertoId(null)} larga>
        {aberto && <Abrir m={aberto} fechar={() => setAbertoId(null)} />}
      </Folha>
    </div>
  );
}
