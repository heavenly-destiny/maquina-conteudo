import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Settings2, Volume2, VolumeX } from "lucide-react";
import { Onboarding, lerConfig, type Config } from "./Onboarding";
import { Intro } from "./Intro";
import { Dock, ABAS, type Aba } from "./Dock";
import { Sidebar } from "./Sidebar";
import { useEstado } from "./api";
import { som } from "./sons";
import { Avisos, Marca, cx, molaSuave } from "./ui";
import { Inicio } from "./telas/Inicio";
import { Cortes } from "./telas/Cortes";
import { Criar } from "./telas/Criar";
import type { Rascunho } from "./api";
import { Inspirar } from "./telas/Inspirar";
import { Postar, pendentes } from "./telas/Postar";

const lerAba = (): Aba => {
  const h = location.hash.slice(1) as Aba;
  return ABAS.some((a) => a.id === h) ? h : "inicio";
};

// abertura uma vez por dia (lição do INFLU LAB: repetir toda hora cansa); ?intro=1 força
const hoje = () => new Date().toLocaleDateString("sv");
function querIntro() {
  if (new URLSearchParams(location.search).has("intro")) return true;
  try { return localStorage.getItem("intro-dia") !== hoje(); } catch { return true; }
}

export default function App() {
  const [intro, setIntro] = useState(querIntro);
  const [aba, setAba] = useState<Aba>(lerAba);
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
  const abrirConfig = useCallback(async () => { som.abrir(); setCfg(await lerConfig()); setOnboard(true); }, []);

  useEffect(() => {
    const f = () => setAba(lerAba());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);

  const ir = useCallback((a: Aba) => {
    history.replaceState(null, "", a === "inicio" ? location.pathname : `#${a}`);
    setAba(a);
    scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
      <div className="fundo" /><div className="grao" />
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
                {aba !== "inicio" && <span className="text-[15px] font-semibold tracking-tight">Máquina</span>}
              </motion.button>
              <div className="flex items-center gap-2">
              <button aria-label="Conexões" onClick={abrirConfig}
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
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.15 } }}
                  transition={molaSuave}
                >
                  {aba === "inicio" && <Inicio e={e} ir={ir} rascunho={rascunho} limpar={limparRascunho} />}
                  {aba === "cortes" && <Cortes e={e} />}
                  {aba === "criar" && <Criar e={e} ir={ir} />}
                  {aba === "inspirar" && <Inspirar e={e} criarCom={criarCom} />}
                  {aba === "postar" && <Postar e={e} />}
                </motion.div>
              </AnimatePresence>
            </main>
            </div>
            <AnimatePresence>{onboard && cfg && <Onboarding key="onb" inicial={cfg} onFim={() => { setOnboard(false); if (location.search) history.replaceState(null, "", location.pathname + location.hash); }} />}</AnimatePresence>
            <div className="lg:hidden"><Dock aba={aba} onAba={ir} badges={badges} /></div>
          </>
        )}
      </LayoutGroup>
    </Avisos>
  );
}
