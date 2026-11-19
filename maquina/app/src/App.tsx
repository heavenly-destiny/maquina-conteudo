import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search, Settings2, Volume2, VolumeX } from "lucide-react";
import { Onboarding, lerConfig, type Config } from "./Onboarding";
import { Intro } from "./Intro";
import { Dock, ABAS, type Aba, type Tela } from "./Dock";
import { Fundo } from "./Fundo";
import { Sidebar } from "./Sidebar";
import { useEstado } from "./api";
import { som } from "./sons";
import { Avisos, Marca, Protege, cx, molaSuave } from "./ui";
import { Inicio } from "./telas/Inicio";
// telas pesadas ou raras carregam só quando abertas (bundle inicial menor)
const Ajustes = lazy(() => import("./telas/Ajustes").then((m) => ({ default: m.Ajustes })));
const Mascotes = lazy(() => import("./telas/Mascotes").then((m) => ({ default: m.Mascotes })));
const Carrosseis = lazy(() => import("./telas/Carrosseis").then((m) => ({ default: m.Carrosseis })));
const Inspirar = lazy(() => import("./telas/Inspirar").then((m) => ({ default: m.Inspirar })));
import { Cortes } from "./telas/Cortes";
import { Criar } from "./telas/Criar";
import type { Rascunho } from "./api";
import { Postar, pendentes } from "./telas/Postar";
import { Paleta } from "./Paleta";

const lerAba = (): Tela => {
  const h = location.hash.slice(1).split("?")[0] as Tela;
  return h === "ajustes" || h === "mascotes" || h === "carrosseis" || ABAS.some((a) => a.id === h) ? h : "inicio";
};

// abertura uma vez por dia (lição do INFLU LAB: repetir toda hora cansa); ?intro=1 força
const hoje = () => new Date().toLocaleDateString("sv");
function querIntro() {
  if (new URLSearchParams(location.search).has("intro")) return true;
  try { return localStorage.getItem("abertura") !== "0" && localStorage.getItem("intro-dia") !== hoje(); } catch { return true; }
}

export default function App() {
  const [intro, setIntro] = useState(querIntro);
  const [aba, setAba] = useState<Tela>(lerAba);
  const [ligado, setLigado] = useState(som.ligado);
  const [lateral, setLateralSt] = useState(() => { try { return localStorage.getItem("lateral") !== "0"; } catch { return true; } });
  const setLateral = useCallback((v: boolean) => { setLateralSt(v); try { localStorage.setItem("lateral", v ? "1" : "0"); } catch {} }, []);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const e = useEstado();
  // configuração inicial: aparece sozinha quando a máquina ainda não tem Claude conectado; ?onboard=1 força
  const [cfg, setCfg] = useState<Config | null>(null);
  const [onboard, setOnboard] = useState(false);
  useEffect(() => {
    lerConfig().then((c) => { setCfg(c); if (!c.pronto && !c.concluido || new URLSearchParams(location.search).has("onboard")) setOnboard(true); }).catch(() => {});
  }, []);
  const refazerConfig = useCallback(async () => { som.abrir(); setCfg(await lerConfig()); setOnboard(true); }, []);
  const abrirConfig = useCallback(() => { som.abrir(); ir("ajustes"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // luz que segue o mouse + data-luz acendendo no ponto exato
    let r = 0;
    const mover = (ev: PointerEvent) => {
      if (ev.pointerType !== "mouse") return;
      cancelAnimationFrame(r);
      r = requestAnimationFrame(() => {
        const l = document.querySelector<HTMLElement>(".luz-cursor");
        if (l) { l.style.setProperty("--cx", `${ev.clientX}px`); l.style.setProperty("--cy", `${ev.clientY}px`); l.dataset.on = "1"; }
        const alvo = (ev.target as HTMLElement)?.closest?.<HTMLElement>("[data-luz]");
        if (alvo) { const b = alvo.getBoundingClientRect(); alvo.style.setProperty("--lx", `${ev.clientX - b.left}px`); alvo.style.setProperty("--ly", `${ev.clientY - b.top}px`); }
      });
    };
    const sair = () => { const l = document.querySelector<HTMLElement>(".luz-cursor"); if (l) l.dataset.on = "0"; };
    addEventListener("pointermove", mover, { passive: true }); document.addEventListener("mouseleave", sair);
    return () => { removeEventListener("pointermove", mover); document.removeEventListener("mouseleave", sair); };
  }, []);

  useEffect(() => {
    const f = () => setAba(lerAba());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);

  const ir = useCallback((a: Tela) => {
    history.replaceState(null, "", a === "inicio" ? location.pathname : `#${a}`);
    setAba(a);
    scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // atalhos: 1 a 5 trocam de aba, N (ou /) abre o campo de criar. Nunca dispara digitando, com modal aberto ou com ⌘/Ctrl.
  useEffect(() => {
    const k = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey || (ev.target as HTMLElement).closest("input,textarea,select,[contenteditable]")) return;
      if (document.body.style.overflow === "hidden" || document.querySelector("[data-tela-cheia]")) return; // editor em tela cheia tem atalhos próprios
      const n = Number(ev.key);
      if (n >= 1 && n <= ABAS.length) { ev.preventDefault(); som.aba(); ir(ABAS[n - 1].id); return; }
      if (ev.key === "n" || ev.key === "/") {
        ev.preventDefault(); ir("inicio");
        setTimeout(() => document.querySelector<HTMLTextAreaElement>("main textarea, textarea")?.focus(), 60);
      }
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [ir]);

  const fimIntro = useCallback(() => {
    try { localStorage.setItem("intro-dia", hoje()); } catch {}
    if (location.search) history.replaceState(null, "", location.pathname + location.hash);
    setIntro(false);
  }, []);

  const limparRascunho = useCallback(() => setRascunho(null), []);
  const criarCom = useCallback((r: Rascunho) => { setRascunho(r); ir("inicio"); }, [ir]);

  const editando = e?.jobs.flatMap((j) => j.cortes).filter((c) => c.status === "editando").length ?? 0;
  const criando = e?.geracoes.filter((g) => ["na-fila", "rodando", "gerando"].includes(g.status)).length ?? 0;

  const badges = { cortes: editando, criar: criando, postar: e ? pendentes(e).length : 0 };

  return (
    <Avisos>
      <div className="fundo"><Fundo className="absolute inset-0 size-full" /></div><div className="luz-cursor" /><div className="grao" />
      <LayoutGroup>
        <AnimatePresence>{intro && <Intro key="intro" onFim={fimIntro} />}</AnimatePresence>
        {!intro && (
          <>
            <Sidebar aba={aba} onAba={ir} badges={badges} aberta={lateral} setAberta={setLateral} ligado={ligado} alternarSom={() => setLigado(som.alternar())} abrirConfig={abrirConfig} />
            <div className={cx("transition-[padding] duration-300", lateral ? "lg:pl-[248px]" : "lg:pl-[76px]")}>
            <header className="mx-auto flex max-w-6xl lg:hidden items-center justify-between px-[max(16px,env(safe-area-inset-left))] pt-[max(16px,env(safe-area-inset-top))]">
              <motion.button
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={molaSuave}
                onClick={() => ir("inicio")} className="flex cursor-pointer items-center gap-2.5" aria-label="Início"
              >
                {aba !== "inicio" && <motion.span layoutId="marca" transition={molaSuave}><Marca tam={30} /></motion.span>}
                {aba !== "inicio" && <span className="text-[15px] font-semibold tracking-tight">Forja</span>}
              </motion.button>
              <div className="flex items-center gap-2">
              <button aria-label="Buscar" onClick={() => dispatchEvent(new Event("forja:paleta"))}
                className="vidro grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:text-ink">
                <Search className="size-4" />
              </button>
              <button aria-label="Ajustes" onClick={abrirConfig}
                className="vidro grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:text-ink">
                <Settings2 className="size-4" />
              </button>
              <button
                aria-label={ligado ? "Desligar sons" : "Ligar sons"}
                onClick={() => setLigado(som.alternar())}
                className="vidro grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:text-ink"
              >
                {ligado ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-[max(16px,env(safe-area-inset-left))] pb-36 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={aba}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} /* filter que fica no pai corta o backdrop: o vidro não vê o fundo */
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.15 } }}
                  transition={molaSuave}
                >
                  <Protege key={aba}><Suspense fallback={null}>
                  {aba === "inicio" && <Inicio e={e} ir={ir} rascunho={rascunho} limpar={limparRascunho} />}
                  {aba === "cortes" && <Cortes e={e} />}
                  {aba === "criar" && <Criar e={e} ir={ir} />}
                  {aba === "inspirar" && <Inspirar e={e} criarCom={criarCom} />}
                  {aba === "postar" && <Postar e={e} />}
                  {aba === "mascotes" && <Mascotes e={e} />}
                  {aba === "carrosseis" && <Carrosseis e={e} />}
                  {aba === "ajustes" && <Ajustes ligado={ligado} alternarSom={() => setLigado(som.alternar())} lateral={lateral} setLateral={setLateral} refazer={refazerConfig} fechar={() => ir("inicio")} />}
                  </Suspense></Protege>
                </motion.div>
              </AnimatePresence>
            </main>
            </div>
            <Paleta e={e} ir={ir} criarCom={criarCom} abrirConfig={abrirConfig} alternarSom={() => setLigado(som.alternar())} />
            <AnimatePresence>{onboard && cfg && <Onboarding key="onb" inicial={cfg} onFim={() => { setOnboard(false); if (location.search) history.replaceState(null, "", location.pathname + location.hash); }} />}</AnimatePresence>
            <div className="lg:hidden"><Dock aba={aba} onAba={ir} badges={badges} /></div>
          </>
        )}
      </LayoutGroup>
    </Avisos>
  );
}
