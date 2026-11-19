/* Ajustes: página inteira no padrão de configurações do 21st.dev (nov/2026): navegação de seções à esquerda,
   coluna central, grupos com título + descrição e linhas num cartão de vidro (rótulo e ajuda à esquerda, controle à direita).
   Perfil salva sozinho ao sair do campo. Conexões abrem o fluxo de conectar ali mesmo, sem modal. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioLines, Bot, Check, ChevronRight, Eye, PanelLeft, RefreshCw, Sparkles, User, Volume2, Wrench, X } from "lucide-react";
import { post } from "../api";
import { Campo, ESTILOS, Erro, PassoClaude, PassoVoz, lerConfig, type Config } from "../Onboarding";
import { som } from "../sons";
import { Botao, Copiar, Gira, cascata, cx, mola, useAviso } from "../ui";

const SECOES = [
  { id: "perfil", nome: "Perfil", Icone: User },
  { id: "conexoes", nome: "Conexões", Icone: Bot },
  { id: "ferramentas", nome: "Ferramentas", Icone: Wrench },
  { id: "preferencias", nome: "Preferências", Icone: Sparkles },
] as const;
type Secao = (typeof SECOES)[number]["id"];

function Grupo({ id, titulo, desc, children, i }: { id: string; titulo: string; desc?: string; children: ReactNode; i: number }) {
  return (
    <motion.section id={`aj-${id}`} {...cascata(i)} className="scroll-mt-24">
      <h2 className="text-[17px] font-semibold tracking-tight">{titulo}</h2>
      {desc && <p className="mt-1 text-[14px] text-mute">{desc}</p>}
      <div className="vidro mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-[20px]">{children}</div>
    </motion.section>
  );
}

function Linha({ rotulo, ajuda, children, empilha }: { rotulo: string; ajuda?: string; children?: ReactNode; empilha?: boolean }) {
  return (
    <div className={cx("flex gap-3 px-4 py-3.5 sm:px-5", empilha ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between")}>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{rotulo}</p>
        {ajuda && <p className="mt-0.5 text-[13px] text-faint">{ajuda}</p>}
      </div>
      {children && <div className={cx("min-w-0", empilha ? "w-full" : "flex flex-wrap items-center gap-2 sm:flex-nowrap")}>{children}</div>}
    </div>
  );
}

function Interruptor({ on, onChange, rotulo }: { on: boolean; onChange: (v: boolean) => void; rotulo: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={rotulo} onClick={() => { som.toque(); onChange(!on); }}
      className={cx("relative h-[30px] w-[50px] shrink-0 cursor-pointer rounded-full transition-colors", on ? "bg-red" : "bg-white/[0.12]")}>
      <motion.span layout transition={mola} className={cx("absolute top-[3px] size-6 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.4)]", on ? "right-[3px]" : "left-[3px]")} />
    </button>
  );
}

function Estado({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-medium", ok ? "bg-ok/12 text-ok" : "bg-white/[0.06] text-faint")}>
      <span className={cx("size-1.5 rounded-full", ok ? "bg-ok" : "bg-white/30")} />{texto}
    </span>
  );
}

const campoCls = "w-full rounded-[12px] bg-white/[0.05] px-3.5 py-2.5 text-[15px] outline-none ring-1 ring-white/[0.06] transition-shadow focus:ring-2 focus:ring-red/60 sm:w-72";

function Perfil({ cfg, i }: { cfg: Config; i: number }) {
  const p0 = cfg.perfil || {};
  const [p, setP] = useState({ nome: p0.nome || "", nicho: p0.nicho || "", instagram: p0.instagram || "", quem: p0.quem || "", estilo: p0.estilo || "" });
  const [salvo, setSalvo] = useState<"" | "salvando" | "ok">("");
  const ultimo = useRef(JSON.stringify(p));
  const avisar = useAviso();
  const salvar = async (n = p) => {
    if (JSON.stringify(n) === ultimo.current || !n.nome.trim()) return;
    setSalvo("salvando");
    try {
      const r = await post("/api/config/perfil", n);
      if (!r.ok) throw new Error(r.erro || "Não salvou");
      ultimo.current = JSON.stringify(n); setSalvo("ok"); setTimeout(() => setSalvo(""), 1600);
    } catch (er) { setSalvo(""); avisar((er as Error).message, true); }
  };
  const estilos = p.estilo.split(", ").filter(Boolean);
  const campo = (k: "nome" | "nicho" | "instagram", ph: string) => (
    <input value={p[k]} placeholder={ph} onChange={(ev) => setP({ ...p, [k]: ev.target.value })} onBlur={() => salvar()} className={campoCls} />
  );
  return (
    <Grupo id="perfil" i={i} titulo="Seu perfil" desc="A Forja escreve e edita no seu jeito. Salva sozinho.">
      <Linha rotulo="Nome">{campo("nome", "Seu nome")}</Linha>
      <Linha rotulo="Instagram" ajuda="Seu @">{campo("instagram", "@seuperfil")}</Linha>
      <Linha rotulo="Nicho" ajuda="Do que você fala">{campo("nicho", "Ex.: tráfego pago, estética")}</Linha>
      <Linha rotulo="Quem você é" ajuda="O que vende e pra quem fala" empilha>
        <textarea value={p.quem} rows={3} placeholder="Conte em poucas linhas" onChange={(ev) => setP({ ...p, quem: ev.target.value })} onBlur={() => salvar()}
          className={cx(campoCls, "resize-none sm:w-full")} />
      </Linha>
      <Linha rotulo="Estilo de conteúdo" ajuda="Escolha quantos quiser" empilha>
        <div className="flex flex-wrap gap-1.5">
          {ESTILOS.map((s) => {
            const on = estilos.includes(s);
            return (
              <button key={s} aria-pressed={on} onClick={() => { som.toque(); const n = { ...p, estilo: (on ? estilos.filter((x) => x !== s) : [...estilos, s]).join(", ") }; setP(n); salvar(n); }}
                className={cx("min-h-10 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors", on ? "bg-white text-[#14060a]" : "bg-white/[0.06] text-mute hover:text-ink")}>{s}</button>
            );
          })}
        </div>
      </Linha>
      <AnimatePresence>{salvo && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 px-5 py-2.5 text-[13px] text-faint" role="status">
          {salvo === "salvando" ? <><Gira className="size-3.5" /> Salvando</> : <><Check className="size-3.5 text-ok" /> Salvo</>}
        </motion.p>
      )}</AnimatePresence>
    </Grupo>
  );
}

function Gemini({ cfg, recarregar }: { cfg: Config; recarregar: () => void }) {
  const [abrir, setAbrir] = useState(false);
  const [chave, setChave] = useState("");
  const [erro, setErro] = useState("");
  const [testando, setTestando] = useState(false);
  const ok = !!cfg.gemini?.ok;
  const enviar = async (c: string) => {
    setErro(""); setTestando(true);
    try { const r = await post("/api/config/gemini", { chave: c }); if (r.ok) { som.ok(); setAbrir(false); setChave(""); recarregar(); } else setErro(r.erro || "Não conectou"); }
    catch (er) { setErro((er as Error).message); }
    setTestando(false);
  };
  return (
    <Linha rotulo="Gemini" ajuda="Opcional. Segundo olho ao analisar referências por link" empilha={abrir}>
      {!abrir ? (
        <>
          <Estado ok={ok} texto={ok ? `Conectado ${cfg.gemini?.final || ""}` : "Desligado"} />
          <Botao tipo="vidro" className="min-h-10 px-4 text-[14px]" onClick={() => setAbrir(true)}>{ok ? "Trocar" : "Conectar"}</Botao>
          {ok && <Botao tipo="fantasma" className="min-h-10 px-3 text-[14px] text-faint" onClick={() => enviar("")}>Desligar</Botao>}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-mute">Crie grátis em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-ink underline decoration-white/30 underline-offset-4">aistudio.google.com</a> e cole aqui.</p>
          <Campo valor={chave} setValor={setChave} placeholder="AIza…" onEnter={() => chave && enviar(chave)} />
          <Erro msg={erro} />
          <div className="flex gap-2">
            <Botao tipo="principal" disabled={!chave} carregando={testando} onClick={() => enviar(chave)}>{testando ? <><Gira /> Testando</> : "Conectar"}</Botao>
            <Botao tipo="fantasma" onClick={() => { setAbrir(false); setErro(""); }}>Cancelar</Botao>
          </div>
        </div>
      )}
    </Linha>
  );
}

function Conexoes({ cfg, recarregar, i }: { cfg: Config; recarregar: () => void; i: number }) {
  const [aberto, setAberto] = useState<"" | "claude" | "voz">("");
  const fechar = () => { setAberto(""); recarregar(); };
  const tipo = { assinatura: "Assinatura", api: "Chave de API", login: "Login deste computador" }[cfg.claude.tipo || "login"];
  return (
    <Grupo id="conexoes" i={i} titulo="Conexões" desc="Tudo fica só neste computador. A Forja usa as suas contas.">
      <Linha rotulo="Claude" ajuda={cfg.claude.ok ? `${tipo}${cfg.claude.final ? ` · ${cfg.claude.final}` : ""}` : "Corta, escreve e monta os vídeos"} empilha={aberto === "claude"}>
        {aberto === "claude" ? (
          <div className="flex flex-col gap-3">
            <PassoClaude cfg={cfg} pronto={fechar} compacto />
            <Botao tipo="fantasma" className="self-start" onClick={() => setAberto("")}>Cancelar</Botao>
          </div>
        ) : (
          <>
            <Estado ok={cfg.claude.ok} texto={cfg.claude.ok ? "Conectado" : "Desconectado"} />
            <Botao tipo="vidro" className="min-h-10 px-4 text-[14px]" onClick={() => setAberto("claude")}>{cfg.claude.ok ? "Trocar" : "Conectar"}</Botao>
          </>
        )}
      </Linha>
      <Linha rotulo="Voz (ElevenLabs)" ajuda={cfg.voz.ok ? `Chave ${cfg.voz.final}` : "Narra vídeos animados e criativos"} empilha={aberto === "voz"}>
        {aberto === "voz" ? <PassoVoz cfg={cfg} pronto={fechar} compacto /> : (
          <>
            <Estado ok={cfg.voz.ok} texto={cfg.voz.ok ? "Conectada" : "Desligada"} />
            <Botao tipo="vidro" className="min-h-10 px-4 text-[14px]" onClick={() => setAberto("voz")}>{cfg.voz.ok ? "Trocar" : "Conectar"}</Botao>
          </>
        )}
      </Linha>
      <Gemini cfg={cfg} recarregar={recarregar} />
    </Grupo>
  );
}

function Ferramentas({ cfg, recarregar, i }: { cfg: Config; recarregar: () => Promise<void>; i: number }) {
  const [busca, setBusca] = useState(false);
  const faltam = cfg.ferramentas.filter((f) => !f.ok).length;
  return (
    <Grupo id="ferramentas" i={i} titulo="Ferramentas" desc={faltam ? `Faltam ${faltam}. Rode o comando no Terminal e verifique.` : "Tudo instalado neste computador."}>
      {cfg.ferramentas.map((f) => (
        <Linha key={f.id} rotulo={f.nome}>
          {f.ok ? <Estado ok texto="Instalado" /> : (
            <span className="flex min-w-0 items-center gap-2"><code className="min-w-0 truncate font-mono text-[12.5px] text-mute">{f.instalar}</code><Copiar texto={f.instalar} /></span>
          )}
        </Linha>
      ))}
      <div className="px-4 py-3 sm:px-5">
        <Botao tipo="fantasma" className="min-h-10 px-3 text-[14px]" carregando={busca} onClick={async () => { setBusca(true); await recarregar(); setBusca(false); }}>
          <RefreshCw className="size-4" /> Verificar de novo
        </Botao>
      </div>
    </Grupo>
  );
}

function ler(k: string, padrao: boolean) { try { const v = localStorage.getItem(k); return v === null ? padrao : v === "1"; } catch { return padrao; } }
function gravar(k: string, v: boolean) { try { localStorage.setItem(k, v ? "1" : "0"); } catch {} }

function Preferencias({ i, ligado, alternarSom, lateral, setLateral, refazer }: { i: number; ligado: boolean; alternarSom: () => void; lateral: boolean; setLateral: (v: boolean) => void; refazer: () => void }) {
  const [abertura, setAbertura] = useState(() => ler("abertura", true));
  return (
    <Grupo id="preferencias" i={i} titulo="Preferências">
      <Linha rotulo="Sons da interface" ajuda="Toques, abrir e fechar"><Volume2 className="size-4 text-faint" /><Interruptor rotulo="Sons" on={ligado} onChange={alternarSom} /></Linha>
      <Linha rotulo="Abertura do dia" ajuda="A animação de entrada, uma vez por dia">
        <Eye className="size-4 text-faint" /><Interruptor rotulo="Abertura" on={abertura} onChange={(v) => { setAbertura(v); gravar("abertura", v); }} />
      </Linha>
      <Linha rotulo="Barra lateral aberta" ajuda="No computador"><PanelLeft className="size-4 text-faint" /><Interruptor rotulo="Barra lateral" on={lateral} onChange={setLateral} /></Linha>
      <Linha rotulo="Configuração inicial" ajuda="Passo a passo de novo, do começo">
        <Botao tipo="vidro" className="min-h-10 px-4 text-[14px]" onClick={refazer}>Refazer <ChevronRight className="size-4" /></Botao>
      </Linha>
    </Grupo>
  );
}

export function Ajustes(p: { ligado: boolean; alternarSom: () => void; lateral: boolean; setLateral: (v: boolean) => void; refazer: () => void; fechar: () => void }) {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [ativa, setAtiva] = useState<Secao>("perfil");
  const recarregar = async () => setCfg(await lerConfig());
  useEffect(() => { recarregar().catch(() => {}); }, []);
  useEffect(() => { // seção ativa acompanha a rolagem
    if (!cfg) return;
    const ob = new IntersectionObserver((es) => {
      const v = es.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (v) setAtiva(v.target.id.slice(3) as Secao);
    }, { rootMargin: "-20% 0px -60% 0px" });
    SECOES.forEach((s) => { const el = document.getElementById(`aj-${s.id}`); if (el) ob.observe(el); });
    return () => ob.disconnect();
  }, [cfg]);
  const ir = (id: Secao) => { som.toque(); setAtiva(id); document.getElementById(`aj-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="mx-auto flex max-w-5xl gap-10">
      {/* navegação das seções: coluna fixa no computador, chips no celular */}
      <nav aria-label="Seções dos ajustes" className="sticky top-10 hidden h-fit w-52 shrink-0 flex-col gap-1 lg:flex">
        <button onClick={p.fechar} className="mb-3 flex min-h-10 cursor-pointer items-center gap-2 rounded-[12px] px-2 text-[14px] text-faint hover:text-ink">
          <X className="size-4" /> Fechar ajustes
        </button>
        {SECOES.map((s) => (
          <button key={s.id} onClick={() => ir(s.id)} aria-current={ativa === s.id ? "true" : undefined}
            className={cx("relative flex min-h-11 cursor-pointer items-center gap-3 rounded-[14px] px-3 text-[14.5px] font-medium transition-colors", ativa === s.id ? "text-ink" : "text-mute hover:text-ink")}>
            {ativa === s.id && <motion.span layoutId="aj-ativa" transition={mola} className="absolute inset-0 rounded-[14px] bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]" />}
            <s.Icone className={cx("relative size-[18px]", ativa === s.id && "text-red")} /><span className="relative">{s.nome}</span>
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        <motion.h1 {...cascata(0)} className="text-[clamp(26px,4vw,36px)] font-semibold tracking-[-0.035em]">Ajustes</motion.h1>
        <div className="scroll-x -mx-1 mt-4 flex gap-1.5 px-1 lg:hidden">
          {SECOES.map((s) => (
            <button key={s.id} onClick={() => ir(s.id)} className={cx("flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors", ativa === s.id ? "bg-white text-[#14060a]" : "vidro text-mute")}>
              <s.Icone className="size-4" />{s.nome}
            </button>
          ))}
        </div>
        {!cfg ? (
          <div className="mt-10 flex items-center gap-2 text-[14px] text-faint"><Gira /> Lendo os ajustes</div>
        ) : (
          <div className="mt-8 flex max-w-2xl flex-col gap-10">
            <Perfil cfg={cfg} i={1} />
            <Conexoes cfg={cfg} recarregar={recarregar} i={2} />
            <Ferramentas cfg={cfg} recarregar={recarregar} i={3} />
            <Preferencias i={4} {...p} />
            <p className="flex items-center gap-2 text-[13px] text-faint"><AudioLines className="size-3.5" /> Forja se atualiza sozinha a cada 3 horas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
