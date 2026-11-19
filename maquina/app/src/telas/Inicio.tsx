import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useAnimationControls } from "motion/react";
import { ArrowUp, Captions, Check, Copy, SlidersHorizontal, FileText, Film, LayoutGrid, Link2, Megaphone, Paperclip, Scissors, Smile, Telescope, Upload, X } from "lucide-react";
import { atualizar, enviarInspiracao, enviarVideo, modoDec, post, type Estado, type Rascunho } from "../api";
import type { Aba } from "../Dock";
import { Folha, Marca, Segmentos, Topo, cx, mola, molaSuave, useAviso, useTransborda } from "../ui";
import { Configurar, ConfigurarVideo, type ConfigCorte } from "../Configurar";
import { som } from "../sons";
import { Aurora } from "../aurora";

// Referência: "AI Prompt Input Box" (kedhareswer, 21st.dev, nov/2026): composer de vidro, frase de exemplo
// se digitando sozinha, chips de modo, menu de ajuste, anexo e botão que respira. Adaptado ao vinho da Máquina.
type Modo = "corte" | "roteiro" | "animado" | "criativo" | "modelar" | "transcrever";
const MODOS: { v: Modo; nome: string; Icone: typeof FileText }[] = [
  { v: "corte", nome: "Cortar", Icone: Scissors },
  { v: "animado", nome: "Animado", Icone: Smile },
  { v: "criativo", nome: "Criativo", Icone: Megaphone },
  { v: "modelar", nome: "Modelar", Icone: Telescope },
  { v: "transcrever", nome: "Transcrever", Icone: Captions },
  { v: "roteiro", nome: "Roteiro", Icone: FileText },
];
const EXEMPLOS: Record<Modo, string[]> = {
  corte: ["Solte aqui o vídeo cru da gravação de hoje", "Arraste a live inteira, eu digo quantos cortes ela rende"],
  roteiro: ["Como eu faço 10 vídeos por dia com o Claude", "3 erros que travam quem tá começando no digital", "O dia que eu parei de editar vídeo na mão"],
  animado: ["O que é uma skill do Claude, passo a passo", "Por que seu story não tem resposta, explicado pelo mascote"],
  criativo: ["Anúncio de 20s pro meu produto, gancho forte nos 3 primeiros segundos", "Anúncio de 30s pra quem perde tempo no Canva"],
  modelar: ["Modelar esse viral pra minha marca, com todos os efeitos", "Mesmo vídeo, trocando a voz e a pessoa", "Mesma estrutura, assunto: criar conteúdo com o Claude"],
  transcrever: ["Cole o link do vídeo ou solte o arquivo", "Tiro o texto inteiro, com legenda .srt pronta"],
};
const COM_BOARD: Modo[] = ["animado", "criativo", "modelar"]; // vídeo gerado: legenda, trilha, duração antes de criar
const ehLink = (s: string) => /^https?:\/\/\S+$/.test(s.trim());

/* frase de exemplo que se digita e se apaga sozinha */
function useDigitando(frases: string[], pausado: boolean) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    if (pausado) return;
    let i = 0, n = 0, apagando = false, t = 0;
    const passo = () => {
      const f = frases[i % frases.length];
      if (!apagando) { n++; setTxt(f.slice(0, n)); if (n >= f.length) { apagando = true; t = window.setTimeout(passo, 1900); return; } t = window.setTimeout(passo, 38 + Math.random() * 40); }
      else { n = Math.max(0, n - 3); setTxt(f.slice(0, n)); if (!n) { apagando = false; i++; t = window.setTimeout(passo, 350); return; } t = window.setTimeout(passo, 18); }
    };
    setTxt(""); t = window.setTimeout(passo, 500);
    return () => clearTimeout(t);
  }, [frases, pausado]);
  return txt;
}

export function Inicio({ e, ir, rascunho, limpar }: { e: Estado | null; ir: (a: Aba) => void; rascunho: Rascunho | null; limpar: () => void }) {
  const [modo, setModo] = useState<Modo>("animado");
  const [texto, setTexto] = useState("");
  const [board, setBoard] = useState<null | "corte" | "video">(null);
  const [insp, setInsp] = useState<string | undefined>();
  const inpInsp = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [prog, setProg] = useState<number | null>(null);
  const [foco, setFoco] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [recibo, setRecibo] = useState<{ msg: string; aba: Aba } | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  const modosRef = useTransborda<HTMLDivElement>();
  const avisar = useAviso();
  const exemplo = useDigitando(EXEMPLOS[modo], !!texto || !!arquivo);
  // a logo olha pro mouse (inclina em 3D) e pulsa a cada letra digitada
  const logo = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const pulso = useAnimationControls();
  useEffect(() => {
    const f = (ev: PointerEvent) => {
      const b = logo.current?.getBoundingClientRect(); if (!b || ev.pointerType !== "mouse") return;
      const dx = (ev.clientX - (b.left + b.width / 2)) / innerWidth, dy = (ev.clientY - (b.top + b.height / 2)) / innerHeight;
      ry.set(Math.max(-1, Math.min(1, dx * 2)) * 22); rx.set(Math.max(-1, Math.min(1, dy * 2)) * -22);
    };
    addEventListener("pointermove", f, { passive: true }); return () => removeEventListener("pointermove", f);
  }, [rx, ry]);
  useEffect(() => { if (texto) pulso.start({ scale: [1, 1.06, 1], transition: { duration: 0.28 } }); }, [texto, pulso]);
  useEffect(() => { pulso.start({ rotateZ: [0, -8, 6, 0], scale: [1, 1.08, 1], transition: { duration: 0.5 } }); }, [modo, pulso]);

  useEffect(() => {
    if (!rascunho) return;
    setModo(rascunho.tipo === "clonar" ? "modelar" : rascunho.tipo); setTexto(rascunho.briefing ?? ""); setInsp(rascunho.inspiracao);
    limpar(); ta.current?.focus();
  }, [rascunho, limpar]);
  useEffect(() => { // altura acompanha o texto
    const el = ta.current; if (!el) return;
    el.style.height = "0px"; el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [texto]);
  useEffect(() => { if (!recibo) return; const t = setTimeout(() => setRecibo(null), 6000); return () => clearTimeout(t); }, [recibo]);

  const prontas = e?.inspiracoes.filter((i) => i.status === "pronto") ?? [];
  const escolhida = e?.inspiracoes.find((i) => i.id === insp);
  const subirInsp = async (f?: File | null) => { // modelar: o vídeo que a pessoa subiu vira a referência
    if (!f) return;
    if (!/\.(mov|mp4|m4v)$/i.test(f.name)) return avisar("Só vídeo .mov ou .mp4", true);
    try { setProg(0); som.toque(); const id = await enviarInspiracao(f, setProg, "inspirar", modo === "modelar" ? "fiel" : modoDec()); setInsp(id); atualizar(); }
    catch (er) { avisar(String((er as Error).message), true); }
    setProg(null);
  };
  const link = ehLink(texto);
  const pode = prog === null && (modo === "corte" ? !!arquivo : modo === "transcrever" ? !!arquivo || link : link || (texto.trim().length > 3 && (modo !== "modelar" || !!insp)));
  const anexar = (f?: File | null) => {
    if (!f) return;
    if (!/\.(mov|mp4|m4v)$/i.test(f.name)) return avisar("Só vídeo .mov ou .mp4", true);
    if (modo === "modelar") return void subirInsp(f);
    som.toque(); setArquivo(f); if (modo !== "transcrever") setModo("corte");
  };

  const enviar = async (extra?: Record<string, unknown>) => {
    if (!pode) return;
    if (!extra && modo === "corte" && arquivo) return void (som.abrir(), setBoard("corte"));
    if (!extra && COM_BOARD.includes(modo) && !link) return void (som.abrir(), setBoard("video"));
    setBoard(null);
    try {
      if (modo === "transcrever") {
        if (arquivo) { setProg(0); som.enviar(); await enviarInspiracao(arquivo, setProg, "transcrever"); setArquivo(null); }
        else { await post("/api/transcrever", { url: texto.trim() }); som.enviar(); }
        setRecibo({ msg: "Transcrevendo. O texto aparece em Criar.", aba: "criar" });
      } else if (modo === "corte" && arquivo) {
        setProg(0); som.enviar();
        await enviarVideo(arquivo, setProg, extra);
        setArquivo(null); setRecibo({ msg: "Vídeo recebido. Já estou cortando.", aba: "cortes" });
      } else if (link) {
        await post("/api/inspirar", { url: texto.trim(), modo: modoDec() }); som.enviar();
        setRecibo({ msg: "Decupando o vídeo. Leva uns minutos.", aba: "inspirar" });
      } else {
        await post("/api/gerar", { tipo: modo, briefing: texto.trim() || MODOS.find((m) => m.v === modo)!.nome, inspiracao: insp, estilo: "conteudo-organico", duracao: 30, ...extra }); som.enviar();
        setRecibo({ msg: `${MODOS.find((m) => m.v === modo)!.nome} na fila. A Forja já começou.`, aba: "criar" });
      }
      setTexto(""); setInsp(undefined); atualizar();
    } catch (er) { avisar((er as Error).message, true); }
    setProg(null);
  };


  return (
    <div className="flex min-h-[calc(100dvh-210px)] flex-col items-center justify-center gap-9 pb-10">
      {/* cortinas de luz vinho atrás de tudo que se inclinam pro mouse; clique solta um anel */}
      <Topo><div aria-hidden className="pointer-events-none fixed inset-0 opacity-75" style={{ zIndex: -1 }}>
        <Aurora colors={["#e11d2a", "#9b1027", "#ff3b4a", "#5a0618"]} background="#0b0204" backgroundDark="#0b0204" intensity={0.28} height={0.06} spread={0.16} layers={3} waviness={1.1} lean={1.4} speed={0.6} grain={0.03} maxFps={45}
          style={{ position: "absolute", inset: 0 }} />
      </div></Topo>
      {/* a logo no meio, com uma luz que respira atrás */}
      <motion.div layoutId="marca" className="relative" transition={molaSuave}>
        <motion.span aria-hidden className="absolute inset-[-40%] rounded-full bg-red/40 blur-3xl"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.05, 0.9] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span ref={logo} animate={pulso} style={{ rotateX: rx, rotateY: ry, transformPerspective: 600 }} className="relative block cursor-grab active:cursor-grabbing"
          drag dragSnapToOrigin dragElastic={0.35} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onTap={() => som.toque()}>
          <Marca tam={84} />
        </motion.span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ ...molaSuave, delay: 0.12 }}
        className="w-full max-w-[720px]">
        <motion.div
          data-halo={foco || sobre ? "on" : "off"}
          animate={{ scale: sobre ? 1.015 : 1 }} transition={mola}
          onDragOver={(ev) => { ev.preventDefault(); setSobre(true); }} onDragLeave={() => setSobre(false)}
          onDrop={(ev) => { ev.preventDefault(); setSobre(false); anexar(ev.dataTransfer.files[0]); }}
          className="halo relative rounded-[26px] bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.03))] p-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_0_0_1px_rgb(255_255_255/0.07),0_40px_90px_-30px_rgb(0_0_0/0.95)] backdrop-blur-2xl"
        >
          {/* anexo */}
          <AnimatePresence initial={false}>
            {arquivo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={mola} className="overflow-hidden">
                <div className="m-1 mb-2 flex w-fit max-w-full items-center gap-3 rounded-[16px] bg-white/[0.06] py-2 pl-2 pr-3">
                  <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-red/20 text-red"><Film className="size-[18px]" />
                    {prog !== null && <motion.span className="absolute inset-x-0 bottom-0 bg-red/50" animate={{ height: `${prog * 100}%` }} transition={mola} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium">{arquivo.name}</span>
                    <span className="block text-[12px] text-faint tnum">{prog !== null ? `Enviando ${Math.round(prog * 100)}%` : arquivo.size >= 1e9 ? `${(arquivo.size / 1e9).toFixed(1)} GB` : `${Math.max(1, Math.round(arquivo.size / 1e6))} MB`}</span>
                  </span>
                  {prog === null && <button aria-label="Tirar vídeo" onClick={() => setArquivo(null)} className="grid size-7 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/10 hover:text-ink"><X className="size-3.5" /></button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* modelar: escolher a inspiração */}
          <AnimatePresence initial={false}>
            {modo === "modelar" && !link && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={mola} className="overflow-hidden">
                <input ref={inpInsp} type="file" accept="video/mp4,video/quicktime,.mov,.mp4,.m4v" hidden onChange={(ev) => { subirInsp(ev.target.files?.[0]); ev.target.value = ""; }} />
                {insp ? (
                  <div className="flex items-center gap-3 p-1 pb-2">
                    <div className="relative aspect-[9/16] w-12 shrink-0 overflow-hidden rounded-[10px] bg-white/5 ring-2 ring-red">
                      {escolhida?.capa ? <img src={escolhida.capa} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center"><span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /></span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{escolhida?.decupagem?.titulo || escolhida?.info?.titulo || "Vídeo de referência"}</p>
                      <p className="text-[12.5px] text-faint">{escolhida?.status === "pronto" ? "Pronto pra modelar" : "Analisando o vídeo…"}</p>
                    </div>
                    <button onClick={() => { som.toque(); setInsp(undefined); }} aria-label="Tirar referência" className="grid size-10 cursor-pointer place-items-center rounded-full text-faint hover:text-ink"><X className="size-4" /></button>
                  </div>
                ) : null}
                {insp ? null : (
                  <div className="flex flex-col gap-2 p-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => inpInsp.current?.click()} disabled={prog !== null}
                        className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[14px] font-medium text-mute hover:text-ink disabled:opacity-50">
                        <Upload className="size-4" /> {prog !== null ? `Enviando ${Math.round(prog * 100)}%` : "Subir vídeo"}
                      </button>
                      {prontas.length > 0 && (
                        <button onClick={() => { som.toque(); ir("inspirar"); }}
                          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[14px] font-medium text-mute hover:text-ink">
                          <LayoutGrid className="size-4" /> Escolher na biblioteca
                        </button>
                      )}
                      <span className="text-[12.5px] text-faint">ou cole o link aqui embaixo</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <textarea ref={ta} value={texto} rows={2} disabled={modo === "corte"}
              onChange={(ev) => setTexto(ev.target.value)} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
              onKeyDown={(ev) => { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); enviar(); } }}
              onPaste={(ev) => { const f = ev.clipboardData.files[0]; if (f) { ev.preventDefault(); anexar(f); } }}
              aria-label="O que vamos criar"
              className="block min-h-[64px] w-full resize-none bg-transparent px-3 pt-2.5 text-[16.5px] leading-relaxed outline-none disabled:cursor-default" />
            {!texto && (
              <span aria-hidden className="pointer-events-none absolute left-3 top-2.5 right-3 text-[16.5px] leading-relaxed text-faint">
                {exemplo}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }} className="ml-px inline-block h-[1.1em] w-px translate-y-[3px] bg-mute" />
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div ref={modosRef} className="scroll-x flex min-w-0 flex-1 gap-1">
              {MODOS.filter((m) => m.v !== "roteiro" || modo === "roteiro").map((m) => {
                const on = m.v === modo && !link;
                return (
                  <motion.button key={m.v} whileTap={{ scale: 0.92 }} transition={mola} aria-label={m.nome}
                    onClick={() => { som.aba(); setModo(m.v); if (m.v !== "corte") setArquivo(null); else inp.current?.click(); }}
                    className={cx("relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-[13px] font-medium transition-colors", on ? "text-ink" : "text-mute hover:text-ink")}>
                    {on && <motion.span layoutId="modo" transition={mola} className="absolute inset-0 rounded-full bg-white/[0.11] shadow-[inset_0_1px_0_rgb(255_255_255/0.16)]" />}
                    <m.Icone className={cx("relative size-[15px]", on && "text-red")} strokeWidth={2} />
                    <span className="relative">{m.nome}</span>
                  </motion.button>
                );
              })}
              <AnimatePresence>
                {link && (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={mola}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.11] px-3 text-[13px] font-medium">
                    <Link2 className="size-[15px] text-red" /> Decupar link
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {(COM_BOARD.includes(modo) || (modo === "corte" && arquivo)) && !link && (
              <button onClick={() => { som.abrir(); setBoard(modo === "corte" ? "corte" : "video"); }} aria-label="Configurações do vídeo" title="Legenda, trilha, duração"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-ink">
                <SlidersHorizontal className="size-[16px]" />
              </button>
            )}

            <input ref={inp} type="file" accept="video/*,.mov" hidden onChange={(ev) => anexar(ev.target.files?.[0])} />
            <button aria-label="Anexar vídeo cru" onClick={() => inp.current?.click()} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.07] hover:text-ink">
              <Paperclip className="size-[17px]" />
            </button>
            <motion.button aria-label="Enviar" onClick={() => enviar()} disabled={!pode} whileTap={{ scale: 0.88 }} transition={mola}
              className={cx("grid size-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-300 disabled:cursor-default",
                pode ? "respira bg-red text-white" : "bg-white/[0.08] text-faint")}>
              {prog !== null ? <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <ArrowUp className="size-[18px]" strokeWidth={2.4} />}
            </motion.button>
          </div>
        </motion.div>

        {/* o envio vira um recibo que leva pro trabalho em andamento */}
        <div className="mt-4 flex h-9 justify-center">
          <AnimatePresence mode="wait">
            {recibo ? (
              <motion.button key="r" onClick={() => ir(recibo.aba)} initial={{ opacity: 0, y: -10, scale: 0.9, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: 6, filter: "blur(6px)" }} transition={mola}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.07] px-4 text-[13.5px] font-medium shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] hover:bg-white/10">
                <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-red" /></span>
                <span className="brilha-texto">{recibo.msg}</span>
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
      <Folha aberta={board === "corte" && !!arquivo} onFechar={() => setBoard(null)} larga>
        {board === "corte" && arquivo && <Configurar origem={{ tipo: "arquivo", nome: arquivo.name }} onGerar={(c: ConfigCorte) => enviar({ ...c })} />}
      </Folha>
      <Folha aberta={board === "video"} onFechar={() => setBoard(null)} larga>
        {board === "video" && <ConfigurarVideo titulo={texto.trim() || MODOS.find((m) => m.v === modo)!.nome} tipo={modo} onGerar={(p) => enviar(p)}
          onRoteiro={modo === "modelar" ? undefined : async () => {
            setBoard(null);
            try { await post("/api/gerar", { tipo: "roteiro", briefing: texto, estilo: "conteudo-organico", duracao: 30 }); som.enviar(); setTexto(""); setRecibo({ msg: "Roteiro na fila.", aba: "criar" }); atualizar(); }
            catch (er) { avisar((er as Error).message, true); }
          }} />}
      </Folha>
    </div>
  );
}
