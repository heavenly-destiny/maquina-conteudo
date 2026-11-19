/* Carrosséis: clona um carrossel de referência slide a slide e abre num editor de camadas
   (a mágica do "separar camadas" do Canva, feita local e grátis): fundo limpo + cada texto vira camada
   que a pessoa move, troca, muda fonte/cor/tamanho, e exporta em PNG 1080 pronto pro feed. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as PE } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toPng } from "html-to-image";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, ChevronLeft, ChevronRight, Download, Eye, GalleryHorizontal,
  ImagePlus, Italic, Layers, Plus, RotateCcw, Trash2, Type, Undo2, Upload, X,
} from "lucide-react";
import { atualizar, post, subirImagem, type Camada, type Carrossel, type Estado } from "../api";
import { Botao, Cabecalho, GRADE, LixeiraCanto, Status, Vazio, cascata, cx, mola, molaSuave, useAviso } from "../ui";
import { som } from "../sons";

const FONTES = ["Inter", "Montserrat", "Poppins", "DM Sans", "Anton", "Bebas Neue", "Oswald", "Playfair Display", "Instrument Serif", "Caveat", "Allura", "Bangers"];
const CORES = ["#ffffff", "#111111", "#e11d2a", "#ff2e74", "#ffd60a", "#22c55e", "#3b82f6", "#a855f7"];

/* ---------------- novo carrossel: arrasta os slides ---------------- */
function Novo({ pronto }: { pronto: (id: string) => void }) {
  const avisar = useAviso();
  const [arqs, setArqs] = useState<File[]>([]);
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sobre, setSobre] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const previas = useMemo(() => arqs.map((a) => URL.createObjectURL(a)), [arqs]);
  useEffect(() => () => previas.forEach((u) => URL.revokeObjectURL(u)), [previas]);
  const juntar = (lista: FileList | null) => {
    const novos = [...(lista ?? [])].filter((a) => a.type.startsWith("image/") || /\.(heic|webp)$/i.test(a.name));
    if (!novos.length) return;
    som.toque();
    setArqs((v) => [...v, ...novos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))].slice(0, 20));
  };
  const mover = (i: number, d: number) => setArqs((v) => { const n = [...v]; const j = i + d; if (j < 0 || j >= n.length) return v; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const enviar = async () => {
    setEnviando(true);
    try {
      const imgs: string[] = [];
      for (const a of arqs) imgs.push(await subirImagem(a));
      const r = await post("/api/carrossel/novo", { imgs, nome: nome.trim() });
      atualizar(); setArqs([]); setNome(""); avisar("Separando em camadas"); if (r?.id) pronto(r.id);
    } catch (er) { avisar((er as Error).message, true); }
    setEnviando(false);
  };
  return (
    <section className="vidro flex flex-col gap-4 rounded-[24px] p-4 sm:p-5">
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(ev) => { juntar(ev.target.files); ev.target.value = ""; }} />
      {arqs.length === 0 ? (
        <button onClick={() => input.current?.click()}
          onDragOver={(ev) => { ev.preventDefault(); setSobre(true); }} onDragLeave={() => setSobre(false)}
          onDrop={(ev) => { ev.preventDefault(); setSobre(false); juntar(ev.dataTransfer.files); }}
          className={cx("flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed px-6 text-center transition-colors",
            sobre ? "border-red bg-red/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03]")}>
          <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.06]"><Upload className="size-5 text-red" /></span>
          <span className="text-[16px] font-medium">Solta aqui os slides do carrossel</span>
          <span className="max-w-sm text-[13.5px] text-faint">Print ou imagem salva de cada slide, na ordem. A Forja separa o texto do fundo e você edita tudo.</span>
        </button>
      ) : (
        <>
          <div className="scroll-x -mx-1 flex gap-2.5 px-1 pb-1">
            {previas.map((u, i) => (
              <motion.div key={u} layout transition={mola} className="group relative w-[104px] shrink-0">
                <img src={u} alt={`Slide ${i + 1}`} className="aspect-[4/5] w-full rounded-[12px] object-cover ring-1 ring-white/10" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 text-[11px] font-medium tnum backdrop-blur">{i + 1}</span>
                <button aria-label="Tirar slide" onClick={() => setArqs((v) => v.filter((_, k) => k !== i))} className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-black/60 backdrop-blur"><X className="size-3.5" /></button>
                <div className="mt-1 flex justify-between">
                  <button aria-label="Mover pra esquerda" onClick={() => mover(i, -1)} disabled={i === 0} className="grid size-8 cursor-pointer place-items-center rounded-full text-faint hover:text-ink disabled:opacity-20"><ChevronLeft className="size-4" /></button>
                  <button aria-label="Mover pra direita" onClick={() => mover(i, 1)} disabled={i === arqs.length - 1} className="grid size-8 cursor-pointer place-items-center rounded-full text-faint hover:text-ink disabled:opacity-20"><ChevronRight className="size-4" /></button>
                </div>
              </motion.div>
            ))}
            <button onClick={() => input.current?.click()} className="grid aspect-[4/5] w-[104px] shrink-0 cursor-pointer place-items-center rounded-[12px] border border-dashed border-white/15 text-faint hover:border-white/30 hover:text-ink" aria-label="Adicionar slides"><Plus className="size-5" /></button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input value={nome} onChange={(ev) => setNome(ev.target.value)} placeholder="Nome (opcional)" maxLength={80}
              className="w-full flex-1 rounded-[14px] bg-white/[0.05] px-4 py-3 text-[16px] outline-none ring-1 ring-white/[0.06] focus:ring-2 focus:ring-red/60" />
            <Botao tipo="principal" onClick={enviar} carregando={enviando} className="w-full shrink-0 sm:w-auto"><Layers className="size-4" /> Separar {arqs.length} {arqs.length === 1 ? "slide" : "slides"}</Botao>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------- slide: fundo + camadas, em qualquer escala ---------------- */
/* texto da camada. Camada que veio do slide original (fixo) mantém as quebras de linha dele e encolhe
   a fonte se a do navegador sair mais larga que a caixa medida, pra nunca quebrar linha a mais e encavalar */
function TextoCamada({ c, largura, edit, salvar, ajustar }: { c: Camada; largura: number; edit: boolean; salvar: (t: string) => void; ajustar?: (tam: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const base = (c.tam || 0.04) * largura;
  const [fs, setFs] = useState(base);
  // camada vinda do slide original: a fonte do navegador pode sair mais larga que a medida. Na primeira vez encolhe até
  // caber na caixa e grava (ajustado); depois o tamanho fica fixo e texto novo mais comprido cresce em vez de encolher
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !c.fixo || c.ajustado) { setFs(base); return; }
    el.style.fontSize = `${base}px`;
    const caixa = c.w * largura, natural = el.scrollWidth;
    const novo = natural > caixa * 1.02 ? base * (caixa / natural) : base;
    setFs(novo);
    ajustar?.(+(novo / largura).toFixed(5));
  }, [base, c.fixo, c.ajustado, c.w, largura]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // entrou na edição: cursor já dentro e texto todo selecionado, pronto pra digitar por cima
    const el = ref.current; if (!edit || !el) return;
    el.focus();
    const r = document.createRange(); r.selectNodeContents(el);
    const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
  }, [edit]);
  return (
    <div ref={ref} contentEditable={edit} suppressContentEditableWarning spellCheck={false}
      onBlur={(ev) => salvar(ev.currentTarget.innerText)}
      className={cx("outline-none", c.fixo ? "w-max min-w-full whitespace-pre" : "whitespace-pre-wrap break-words", edit && "cursor-text")}
      style={{
        fontFamily: `"${c.fonte || "Inter"}", Inter, sans-serif`, fontSize: fs, fontWeight: c.peso || 600,
        fontStyle: c.italico ? "italic" : "normal", color: c.cor || "#fff", textAlign: c.alinhar || "left", lineHeight: 1.12,
        letterSpacing: "-0.01em", background: c.fundoCor || "transparent", padding: c.fundoCor ? "0.08em 0.25em" : 0, borderRadius: c.fundoCor ? "0.2em" : 0,
      }}>{c.texto}</div>
  );
}

function Slide({ s, largura, sel, setSel, mudar, editando, setEditando, verOriginal, refNo, ajustar }: {
  s: Carrossel["slides"][number]; largura: number; sel?: string | null; setSel?: (id: string | null) => void;
  mudar?: (id: string, c: Partial<Camada>) => void; editando?: string | null; setEditando?: (id: string | null) => void;
  verOriginal?: boolean; refNo?: (el: HTMLDivElement | null) => void; ajustar?: (id: string, tam: number) => void;
}) {
  const altura = largura * (s.h / s.w);
  const arrasto = useRef<{ id: string; x: number; y: number; cx: number; cy: number; modo: "mover" | "largura"; w: number } | null>(null);
  const baixo = (ev: PE, c: Camada, modo: "mover" | "largura") => {
    if (!mudar || editando === c.id) return;
    ev.stopPropagation(); setSel?.(c.id);
    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
    arrasto.current = { id: c.id, x: ev.clientX, y: ev.clientY, cx: c.x, cy: c.y, modo, w: c.w };
  };
  const mexe = (ev: PE) => {
    const a = arrasto.current; if (!a || !mudar) return;
    const dx = (ev.clientX - a.x) / largura, dy = (ev.clientY - a.y) / altura;
    if (a.modo === "mover") mudar(a.id, { x: +(a.cx + dx).toFixed(4), y: +(a.cy + dy).toFixed(4) });
    else mudar(a.id, { w: Math.max(0.05, +(a.w + dx).toFixed(4)), fixo: false });
  };
  return (
    <div ref={refNo} onPointerDown={() => { setSel?.(null); setEditando?.(null); }} onPointerMove={mexe} onPointerUp={() => (arrasto.current = null)}
      className="relative select-none overflow-hidden bg-[#1a0a0d]" style={{ width: largura, height: altura }}>
      <img src={verOriginal ? s.origem : s.fundo} alt="" draggable={false} className="absolute inset-0 size-full object-cover" crossOrigin="anonymous" />
      {!verOriginal && s.camadas.map((c) => {
        const ativo = sel === c.id, edit = editando === c.id;
        const estilo = {
          left: c.x * largura, top: c.y * altura, ...(c.tipo === "texto" && c.fixo ? { minWidth: c.w * largura } : { width: c.w * largura }),
          ...(c.tipo === "imagem" ? { height: c.h * altura } : {}),
        };
        return (
          <div key={c.id} style={estilo} onPointerDown={(ev) => baixo(ev, c, "mover")}
            onDoubleClick={() => { if (c.tipo === "texto" && setEditando) { setEditando(c.id); setSel?.(c.id); } }}
            className={cx("absolute", mudar && !edit && "cursor-move", mudar && (ativo ? "outline outline-2 outline-red" : "hover:outline hover:outline-1 hover:outline-white/40"))}>
            {c.tipo === "imagem" ? <img src={c.src} alt="" draggable={false} className="size-full object-contain" />
              : (
                <TextoCamada c={c} largura={largura} edit={edit} ajustar={ajustar && ((tam) => ajustar(c.id, tam))}
                  salvar={(texto) => { if (texto !== c.texto) mudar?.(c.id, { texto }); setEditando?.(null); }} />
              )}
            {ativo && mudar && !edit && (
              <span onPointerDown={(ev) => baixo(ev, c, "largura")} aria-label="Largura"
                className="absolute -right-2 top-1/2 h-6 w-3 -translate-y-1/2 cursor-ew-resize rounded-full bg-white shadow ring-2 ring-red" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- painel da camada selecionada ---------------- */
function Painel({ c, mudar, excluir }: { c: Camada; mudar: (p: Partial<Camada>) => void; excluir: () => void }) {
  const lbl = "text-[12.5px] font-medium text-faint";
  const pilula = (on: boolean) => cx("grid size-10 cursor-pointer place-items-center rounded-[12px] transition-colors", on ? "bg-white/[0.14] text-ink" : "bg-white/[0.04] text-mute hover:text-ink");
  return (
    <div className="flex flex-col gap-4">
      {c.tipo === "texto" && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>Texto</span>
            <textarea value={c.texto} onChange={(ev) => mudar({ texto: ev.target.value })} rows={3}
              className="w-full resize-none rounded-[12px] bg-white/[0.05] px-3 py-2.5 text-[15px] outline-none ring-1 ring-white/[0.06] focus:ring-2 focus:ring-red/60" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>Fonte</span>
            <select value={c.fonte || "Inter"} onChange={(ev) => mudar({ fonte: ev.target.value })}
              className="min-h-11 w-full cursor-pointer rounded-[12px] bg-white/[0.05] px-3 text-[15px] outline-none ring-1 ring-white/[0.06]" style={{ fontFamily: `"${c.fonte || "Inter"}"` }}>
              {FONTES.map((f) => <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>{f}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={cx(lbl, "flex justify-between")}>Tamanho <span className="tnum">{Math.round((c.tam || 0.04) * 1080)} px</span></span>
            <input type="range" min={0.012} max={0.2} step={0.001} value={c.tam || 0.04} onChange={(ev) => mudar({ tam: +ev.target.value })} className="w-full accent-[#e11d2a]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button aria-label="Negrito" onClick={() => mudar({ peso: (c.peso || 600) >= 700 ? 400 : 800 })} className={pilula((c.peso || 600) >= 700)}><Bold className="size-4" /></button>
            <button aria-label="Itálico" onClick={() => mudar({ italico: !c.italico })} className={pilula(!!c.italico)}><Italic className="size-4" /></button>
            <span className="mx-1 w-px bg-white/10" />
            {(["left", "center", "right"] as const).map((a) => {
              const I = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
              return <button key={a} aria-label={`Alinhar ${a}`} onClick={() => mudar({ alinhar: a })} className={pilula((c.alinhar || "left") === a)}><I className="size-4" /></button>;
            })}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>Cor</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {CORES.map((k) => <button key={k} aria-label={k} onClick={() => mudar({ cor: k })} className={cx("size-8 cursor-pointer rounded-full ring-1 ring-white/20", c.cor?.toLowerCase() === k && "ring-2 ring-red ring-offset-2 ring-offset-[#140708]")} style={{ background: k }} />)}
              <label className="relative size-8 cursor-pointer overflow-hidden rounded-full ring-1 ring-white/20" style={{ background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} aria-label="Outra cor">
                <input type="color" value={c.cor || "#ffffff"} onChange={(ev) => mudar({ cor: ev.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>Marca-texto</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => mudar({ fundoCor: undefined })} className={pilula(!c.fundoCor)} aria-label="Sem marca-texto"><X className="size-4" /></button>
              {CORES.map((k) => <button key={k} aria-label={`Marca-texto ${k}`} onClick={() => mudar({ fundoCor: k })} className={cx("size-8 cursor-pointer rounded-[8px] ring-1 ring-white/20", c.fundoCor === k && "ring-2 ring-red")} style={{ background: k }} />)}
            </div>
          </div>
        </>
      )}
      <Botao onClick={excluir} className="text-mute"><Trash2 className="size-4" /> Tirar camada</Botao>
    </div>
  );
}

/* ---------------- editor ---------------- */
function Editor({ id, fechar }: { id: string; fechar: () => void }) {
  const avisar = useAviso();
  const [c, setC] = useState<Carrossel | null>(null);
  const [k, setK] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [original, setOriginal] = useState(false);
  const [exportando, setExportando] = useState(false);
  const palco = useRef<HTMLDivElement>(null);
  const noSlide = useRef<HTMLDivElement | null>(null);
  const [larg, setLarg] = useState(400);
  const salvarT = useRef<number>(0);
  const inputImg = useRef<HTMLInputElement>(null);
  const inputFundo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/carrossel?id=${encodeURIComponent(id)}`);
    if (r.ok) setC(await r.json());
  }, [id]);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { // ainda separando: confere de novo até ficar pronto
    if (!c || !["na-fila", "gerando"].includes(c.status)) return;
    const t = setTimeout(carregar, 1500); return () => clearTimeout(t);
  }, [c, carregar]);
  useEffect(() => { // o slide ocupa o máximo do palco sem passar da altura da tela
    const el = palco.current; if (!el || !c?.slides[k]) return;
    const s = c.slides[k];
    const medir = () => { // clientWidth inclui o padding do palco: desconta pra o slide não colar na borda
      const st = getComputedStyle(el), px = parseFloat(st.paddingLeft) + parseFloat(st.paddingRight), py = parseFloat(st.paddingTop) + parseFloat(st.paddingBottom);
      setLarg(Math.floor(Math.min(el.clientWidth - px, ((el.clientHeight || 600) - py) * (s.w / s.h), 620)));
    };
    medir(); const ro = new ResizeObserver(medir); ro.observe(el); return () => ro.disconnect();
  }, [c, k]);

  const salvar = (novo: Carrossel) => {
    clearTimeout(salvarT.current);
    salvarT.current = window.setTimeout(() => { post("/api/carrossel/salvar", { id, nome: novo.nome, slides: novo.slides.map((s) => ({ camadas: s.camadas })) }).catch((er) => avisar((er as Error).message, true)); }, 700);
  };
  // desfazer: guarda o carrossel antes de cada mudança; arrastar (várias mudanças seguidas) conta como uma
  const hist = useRef<{ antes: Carrossel[]; depois: Carrossel[]; t: number }>({ antes: [], depois: [], t: 0 });
  const mudarCamadas = (fn: (cs: Camada[]) => Camada[]) => setC((v) => {
    if (!v) return v;
    const h = hist.current;
    if (Date.now() - h.t > 500) { h.antes = [...h.antes.slice(-49), v]; h.depois = []; }
    h.t = Date.now();
    const n = { ...v, editado: true, slides: v.slides.map((s, i) => (i === k ? { ...s, camadas: fn(s.camadas) } : s)) };
    salvar(n); return n;
  });
  const mudar = (cid: string, p: Partial<Camada>) => mudarCamadas((cs) => cs.map((x) => (x.id === cid ? { ...x, ...p } : x)));
  const ajustar = (cid: string, tam: number) => setC((v) => { // correção automática de tamanho: não entra no desfazer
    if (!v) return v;
    const n = { ...v, slides: v.slides.map((s, i) => (i === k ? { ...s, camadas: s.camadas.map((x) => (x.id === cid ? { ...x, tam, ajustado: true } : x)) } : s)) };
    salvar(n); return n;
  });
  const desfazer = (refazer = false) => setC((v) => {
    const h = hist.current, de = refazer ? h.depois : h.antes, para = refazer ? h.antes : h.depois;
    const alvo = de.pop();
    if (!v || !alvo) return v;
    para.push(v); h.t = 0; salvar(alvo); setSel(null); return alvo;
  });
  const addTexto = () => {
    som.toque();
    const nid = `t${Date.now()}`;
    mudarCamadas((cs) => [...cs, { id: nid, tipo: "texto", texto: "Seu texto", x: 0.1, y: 0.42, w: 0.8, h: 0.1, tam: 0.07, cor: "#ffffff", peso: 800, alinhar: "center", fonte: "Inter" }]);
    setSel(nid);
  };
  const addImagem = (arq: File) => { // vira data URL reduzida: a camada fica salva junto com a edição
    const img = new Image();
    img.onload = () => {
      const lado = 900, esc = Math.min(1, lado / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = img.width * esc; cv.height = img.height * esc;
      cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
      const s = c!.slides[k], w = 0.5, h = w * (cv.height / cv.width) * (s.w / s.h);
      const nid = `i${Date.now()}`;
      mudarCamadas((cs) => [...cs, { id: nid, tipo: "imagem", src: cv.toDataURL("image/png"), x: 0.25, y: Math.max(0, 0.5 - h / 2), w, h }]);
      setSel(nid); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(arq);
  };
  const trocarFundo = async (arq: File) => {
    try { const img = await subirImagem(arq); await post("/api/carrossel/fundo", { id, slide: k, img }); await carregar(); avisar("Fundo trocado"); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const voltarOriginal = async () => {
    try { await post("/api/carrossel/original", { id }); await carregar(); setSel(null); avisar("Voltou pro que a leitura achou"); }
    catch (er) { avisar((er as Error).message, true); }
  };
  const exportar = async () => {
    if (!c) return;
    setExportando(true); setSel(null); setEditando(null); setOriginal(false);
    try {
      for (let i = 0; i < c.slides.length; i++) {
        setK(i);
        await new Promise((r) => setTimeout(r, 450)); // espera o slide e as fontes desenharem
        if (!noSlide.current) continue;
        const url = await toPng(noSlide.current, { pixelRatio: c.slides[i].w / noSlide.current.clientWidth, cacheBust: true });
        const a = document.createElement("a"); a.href = url; a.download = `${(c.nome || "carrossel").replace(/[^\w-]+/g, "-")}-${String(i + 1).padStart(2, "0")}.png`; a.click();
      }
      som.ok(); avisar(`${c.slides.length} slides baixados`);
    } catch (er) { avisar(`Não exportou: ${(er as Error).message}`, true); }
    setExportando(false);
  };

  useEffect(() => { // atalhos: setas trocam slide, Delete tira a camada, Esc solta a seleção
    const t = (ev: KeyboardEvent) => {
      if (editando || (ev.target as HTMLElement)?.closest("input,textarea,select,[contenteditable=true]")) return;
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "z") { ev.preventDefault(); desfazer(ev.shiftKey); return; }
      if (ev.key === "Escape") { if (sel) setSel(null); else fechar(); }
      if ((ev.key === "Delete" || ev.key === "Backspace") && sel) { mudarCamadas((cs) => cs.filter((x) => x.id !== sel)); setSel(null); }
      if (ev.key === "ArrowRight" && c) setK((v) => Math.min(v + 1, c.slides.length - 1));
      if (ev.key === "ArrowLeft") setK((v) => Math.max(v - 1, 0));
    };
    addEventListener("keydown", t); return () => removeEventListener("keydown", t);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const s = c?.slides[k];
  const camada = s?.camadas.find((x) => x.id === sel);
  const ocupado = c && ["na-fila", "gerando"].includes(c.status);

  return (
    <motion.div data-tela-cheia initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col bg-[#0b0304]/95 backdrop-blur-2xl">
      <input ref={inputImg} type="file" accept="image/*" hidden onChange={(ev) => { const a = ev.target.files?.[0]; if (a) addImagem(a); ev.target.value = ""; }} />
      <input ref={inputFundo} type="file" accept="image/*" hidden onChange={(ev) => { const a = ev.target.files?.[0]; if (a) trocarFundo(a); ev.target.value = ""; }} />
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-[max(12px,env(safe-area-inset-left))] py-2.5 pt-[max(10px,env(safe-area-inset-top))] sm:px-5">
        <button aria-label="Voltar" onClick={() => { som.fechar(); fechar(); }} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-ink"><ArrowLeft className="size-5" /></button>
        <input value={c?.nome ?? ""} onChange={(ev) => setC((v) => { if (!v) return v; const n = { ...v, nome: ev.target.value }; salvar(n); return n; })}
          className="min-w-0 flex-1 truncate bg-transparent text-[16px] font-semibold outline-none" aria-label="Nome do carrossel" />
        <button aria-label="Desfazer" title="Desfazer (⌘Z)" onClick={() => desfazer()} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-ink"><Undo2 className="size-[18px]" /></button>
        {c?.editado && <button onClick={voltarOriginal} className="hidden min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13.5px] text-mute hover:bg-white/[0.06] hover:text-ink sm:flex"><RotateCcw className="size-4" /> Original</button>}
        <Botao tipo="principal" onClick={exportar} carregando={exportando} disabled={!c || !!ocupado} className="shrink-0 px-4"><Download className="size-4" /><span className="hidden sm:inline">Baixar PNGs</span></Botao>
      </header>

      {!c || ocupado || c.status === "erro" ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          {c?.status === "erro" ? <p className="max-w-md text-[15px] text-mute">{c.erro || "Não deu pra separar esse carrossel."}</p>
            : <div className="flex flex-col items-center gap-3"><span className="size-10 animate-spin rounded-full border-2 border-red border-t-transparent" /><Status status={c?.status ?? "gerando"} fase={c?.fase || "abrindo"} /></div>}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* ferramentas */}
          <div className="flex shrink-0 justify-center gap-1.5 border-b border-white/[0.06] p-2 lg:flex-col lg:justify-start lg:border-b-0 lg:border-r lg:p-3">
            {[
              { r: "Texto", I: Type, f: addTexto },
              { r: "Imagem", I: ImagePlus, f: () => inputImg.current?.click() },
              { r: "Fundo", I: GalleryHorizontal, f: () => inputFundo.current?.click() },
            ].map(({ r, I, f }) => (
              <button key={r} onClick={f} className="flex min-h-12 min-w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11.5px] font-medium text-mute hover:bg-white/[0.06] hover:text-ink">
                <I className="size-[18px]" />{r}
              </button>
            ))}
            <button onPointerDown={() => setOriginal(true)} onPointerUp={() => setOriginal(false)} onPointerLeave={() => setOriginal(false)}
              className={cx("flex min-h-12 min-w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11.5px] font-medium hover:bg-white/[0.06]", original ? "bg-white/[0.1] text-ink" : "text-mute")} title="Segura pra ver o original">
              <Eye className="size-[18px]" />Original
            </button>
          </div>

          {/* palco */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div ref={palco} className="relative flex min-h-[300px] flex-1 items-center justify-center p-3 sm:p-6">
              {s && (
                <motion.div key={k} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={molaSuave}
                  className="overflow-hidden rounded-[6px] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
                  <Slide s={s} largura={larg} sel={sel} setSel={setSel} mudar={mudar} ajustar={ajustar} editando={editando} setEditando={setEditando} verOriginal={original} refNo={(el) => (noSlide.current = el)} />
                </motion.div>
              )}
              {c.slides.length > 1 && (
                <>
                  <button aria-label="Slide anterior" disabled={k === 0} onClick={() => { som.toque(); setK(k - 1); setSel(null); }} className="vidro absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full disabled:opacity-0 sm:left-4 sm:grid"><ChevronLeft className="size-5" /></button>
                  <button aria-label="Próximo slide" disabled={k === c.slides.length - 1} onClick={() => { som.toque(); setK(k + 1); setSel(null); }} className="vidro absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full disabled:opacity-0 sm:right-4 sm:grid"><ChevronRight className="size-5" /></button>
                </>
              )}
            </div>
            {/* tira de slides */}
            <div className="scroll-x flex shrink-0 gap-2 border-t border-white/[0.06] px-3 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
              {c.slides.map((x, i) => (
                <button key={i} onClick={() => { som.toque(); setK(i); setSel(null); }} aria-label={`Slide ${i + 1}`}
                  className={cx("relative shrink-0 cursor-pointer overflow-hidden rounded-[8px] ring-2 transition-shadow", i === k ? "ring-red" : "ring-transparent opacity-60 hover:opacity-100")}>
                  <div className="pointer-events-none"><Slide s={x} largura={52} /></div>
                  <span className="absolute bottom-0.5 left-1 text-[10px] font-semibold tnum drop-shadow">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* propriedades: coluna fixa no computador (o slide não pula de lugar ao selecionar, senão o duplo clique erra),
              gaveta por cima no celular pelo mesmo motivo */}
          {!camada && (
            <aside className="hidden shrink-0 border-l border-white/[0.06] p-5 lg:block lg:w-[300px]">
              <span className="text-[15px] font-semibold">Editar</span>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mute">Clique num texto pra mudar fonte, cor e tamanho. Duplo clique troca o texto. Arraste pra mover.</p>
              <p className="mt-3 text-[12.5px] text-faint">⌘Z desfaz · Delete tira a camada · setas trocam o slide</p>
            </aside>
          )}
          <AnimatePresence>
            {camada && (
              <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={mola}
                className="absolute inset-x-0 bottom-0 z-10 max-h-[46dvh] overflow-y-auto rounded-t-[22px] border-t border-white/[0.08] bg-[#140507]/95 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:max-h-none lg:w-[300px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[15px] font-semibold">{camada.tipo === "texto" ? "Texto" : "Imagem"}</span>
                  <button aria-label="Fechar painel" onClick={() => setSel(null)} className="grid size-9 cursor-pointer place-items-center rounded-full text-faint hover:bg-white/[0.06] hover:text-ink"><X className="size-4" /></button>
                </div>
                <Painel c={camada} mudar={(p) => mudar(camada.id, p)} excluir={() => { mudarCamadas((cs) => cs.filter((x) => x.id !== camada.id)); setSel(null); }} />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- tela ---------------- */
export function Carrosseis({ e }: { e: Estado | null }) {
  const avisar = useAviso();
  const lista = e?.carrosseis ?? [];
  const [aberto, setAberto] = useState<string | null>(() => new URLSearchParams(location.hash.split("?")[1]).get("abrir"));
  const excluir = async (id: string) => { try { await post("/api/excluir-carrossel", { id }); atualizar(); avisar("Foi pra Lixeira"); } catch (er) { avisar((er as Error).message, true); } };
  return (
    <div className="flex flex-col gap-8">
      <Cabecalho titulo="Carrosséis" n={lista.length} />
      <Novo pronto={setAberto} />
      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight">Seus carrosséis</h2>
        {lista.length === 0 ? <Vazio icone={<Layers className="size-6" />} titulo="Nenhum carrossel ainda" /> : (
          <div className={GRADE}>
            {lista.map((x, i) => {
              const ocupado = ["na-fila", "gerando"].includes(x.status);
              return (
                <motion.div key={x.id} {...cascata(i)} className="group relative">
                  <button onClick={() => { som.abrir(); setAberto(x.id); }} className="block w-full cursor-pointer text-left">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-white/[0.04] ring-1 ring-white/[0.07]">
                      {x.capa && <img src={x.capa} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium tnum backdrop-blur">{x.n} slides</span>
                    </span>
                    <span className="mt-2 block px-0.5">
                      <span className="block line-clamp-1 text-[14px] font-medium">{x.nome}</span>
                      <Status status={x.status} fase={x.fase} />
                    </span>
                  </button>
                  {!ocupado && <LixeiraCanto onConfirmar={() => excluir(x.id)} />}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
      <AnimatePresence>{aberto && <Editor key={aberto} id={aberto} fechar={() => { setAberto(null); atualizar(); }} />}</AnimatePresence>
    </div>
  );
}
