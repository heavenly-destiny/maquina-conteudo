import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { post } from "./api";
import { Botao, Copiar, Gira, Marca, Segmentos, cx, mola, molaSuave } from "./ui";
import { som } from "./sons";

// configuração inicial: quem recebe a máquina conecta o próprio Claude e a própria voz (tudo fica só neste Mac, em maquina/.env)
export type Config = {
  claude: { ok: boolean; tipo: "assinatura" | "api" | "login" | null; final: string };
  voz: { ok: boolean; final: string };
  gemini?: { ok: boolean; final: string };
  ferramentas: { id: string; nome: string; ok: boolean; instalar: string }[];
  perfil?: { nome?: string; nicho?: string; quem?: string; estilo?: string; instagram?: string };
  pronto: boolean; concluido: boolean;
};

export const lerConfig = (): Promise<Config> => fetch("/api/config").then((r) => r.json());

const PASSOS = 6;

export function Campo({ valor, setValor, placeholder, onEnter }: { valor: string; setValor: (v: string) => void; placeholder: string; onEnter: () => void }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="vidro flex min-h-12 items-center gap-1 rounded-[16px] pl-4 pr-1.5 focus-within:shadow-[0_0_0_2px_rgb(225_29_42/0.55)]">
      <input value={valor} onChange={(e) => setValor(e.target.value.trim())} onKeyDown={(e) => e.key === "Enter" && onEnter()}
        type={ver ? "text" : "password"} placeholder={placeholder} autoComplete="off" spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[14px] outline-none" />
      <button type="button" aria-label={ver ? "Esconder" : "Mostrar"} onClick={() => setVer((v) => !v)}
        className="grid size-10 cursor-pointer place-items-center rounded-full text-faint hover:text-ink">
        {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function Feito({ texto }: { texto: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={mola}
      className="flex items-center gap-3 rounded-[16px] bg-ok/10 p-3.5 text-[15px] font-medium">
      <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...mola, delay: 0.05 }}
        className="grid size-8 place-items-center rounded-full bg-ok text-black"><Check className="size-4" strokeWidth={3} /></motion.span>
      {texto}
    </motion.div>
  );
}

export function Erro({ msg }: { msg: string }) {
  return msg ? <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[13.5px] text-red" role="alert">{msg}</motion.p> : null;
}

export function PassoClaude({ cfg, pronto, compacto }: { cfg: Config; pronto: () => void; compacto?: boolean }) {
  const [modo, setModo] = useState<"assinatura" | "api">("assinatura");
  const [token, setToken] = useState("");
  const [testando, setTestando] = useState<"" | "token" | "login">("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(compacto ? false : cfg.claude.ok);
  const [trocar, setTrocar] = useState(false);
  const testar = async (t: string) => {
    setErro(""); setTestando(t ? "token" : "login");
    try {
      const r = await post("/api/config/claude", { token: t });
      if (r.ok) { som.ok(); setOk(true); setTrocar(false); setToken(""); setTimeout(pronto, 900); } else { setErro(r.erro || "Não conectou"); }
    } catch (e) { setErro(String((e as Error).message)); }
    setTestando("");
  };
  return (
    <div className="flex flex-col gap-5">
      <div hidden={compacto}>
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">Conecte seu Claude</h2>
        <p className="mt-1.5 text-[15px] text-mute">É ele que corta, escreve e monta os vídeos. Usa a sua conta.</p>
      </div>
      {ok && !trocar ? (
        <Feito texto={cfg.claude.tipo === "login" || !cfg.claude.final ? "Claude conectado" : `Claude conectado (${cfg.claude.final})`} />
      ) : (
        <>
          <Segmentos id="claude-modo" valor={modo} onChange={(v) => { setModo(v); setErro(""); }} className="self-start"
            opcoes={[{ v: "assinatura", rotulo: "Assinatura Pro ou Max" }, { v: "api", rotulo: "Chave de API" }]} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={modo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={mola} className="flex flex-col gap-3">
              {modo === "assinatura" ? (
                <ol className="flex flex-col gap-3 text-[14.5px]">
                  <li className="flex flex-col gap-2">
                    <span><span className="text-faint tnum">1</span>  Abra o Terminal e rode</span>
                    <span className="flex items-center gap-2">
                      <code className="vidro flex-1 rounded-[12px] px-3.5 py-2.5 font-mono text-[14px]">claude setup-token</code>
                      <Copiar texto="claude setup-token" />
                    </span>
                  </li>
                  <li><span className="text-faint tnum">2</span>  Entre na sua conta no navegador que abrir</li>
                  <li><span className="text-faint tnum">3</span>  Cole aqui o código que aparecer no Terminal</li>
                </ol>
              ) : (
                <p className="text-[14.5px] text-mute">Crie uma chave em <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white">console.anthropic.com</a> e cole aqui.</p>
              )}
              <Campo valor={token} setValor={setToken} placeholder={modo === "api" ? "sk-ant-api…" : "sk-ant-oat…"} onEnter={() => token && testar(token)} />
              <Erro msg={erro} />
              <div className="flex flex-wrap items-center gap-2">
                <Botao tipo="principal" disabled={!token} carregando={testando === "token"} onClick={() => testar(token)}>
                  {testando === "token" ? <><Gira /> Testando</> : "Conectar"}
                </Botao>
                <Botao tipo="fantasma" carregando={testando === "login"} onClick={() => testar("")}>
                  {testando === "login" ? <><Gira /> Testando</> : "Já uso o Claude neste Mac"}
                </Botao>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
      {ok && !trocar && (
        <div className="flex gap-2">
          <Botao tipo="principal" onClick={pronto}>Continuar <ArrowRight className="size-4" /></Botao>
          <Botao tipo="fantasma" onClick={() => setTrocar(true)}>Trocar conta</Botao>
        </div>
      )}
    </div>
  );
}

export function PassoVoz({ cfg, pronto, compacto }: { cfg: Config; pronto: () => void; compacto?: boolean }) {
  const [chave, setChave] = useState("");
  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(compacto ? false : cfg.voz.ok);
  const [trocar, setTrocar] = useState(false);
  const testar = async () => {
    setErro(""); setTestando(true);
    try {
      const r = await post("/api/config/voz", { chave });
      if (r.ok) { som.ok(); setOk(true); setTrocar(false); setChave(""); setTimeout(pronto, 900); } else setErro(r.erro || "Não conectou");
    } catch (e) { setErro(String((e as Error).message)); }
    setTestando(false);
  };
  return (
    <div className="flex flex-col gap-5">
      <div hidden={compacto}>
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">Conecte sua voz</h2>
        <p className="mt-1.5 text-[15px] text-mute">A ElevenLabs narra os vídeos animados e os criativos. Os cortes funcionam sem ela.</p>
      </div>
      {ok && !trocar ? (
        <>
          <Feito texto={`Voz conectada${cfg.voz.final ? ` (${cfg.voz.final})` : ""}`} />
          <div className="flex gap-2">
            <Botao tipo="principal" onClick={pronto}>Continuar <ArrowRight className="size-4" /></Botao>
            <Botao tipo="fantasma" onClick={() => setTrocar(true)}>Trocar chave</Botao>
          </div>
        </>
      ) : (
        <>
          <p className="text-[14.5px] text-mute">Pegue sua chave em <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer" className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white">elevenlabs.io</a> e cole aqui.</p>
          <Campo valor={chave} setValor={setChave} placeholder="Chave da ElevenLabs" onEnter={() => chave && testar()} />
          <Erro msg={erro} />
          <div className="flex flex-wrap gap-2">
            <Botao tipo="principal" disabled={!chave} carregando={testando} onClick={testar}>{testando ? <><Gira /> Testando</> : "Conectar"}</Botao>
            <Botao tipo="fantasma" onClick={pronto}>{compacto ? "Cancelar" : "Pular por agora"}</Botao>
          </div>
        </>
      )}
    </div>
  );
}

/* Perfil: a camada de quem usa. A base de conhecimento vem junto e nunca é apagada; o que está aqui e as correções
   que a pessoa faz no painel ficam por cima (perfil/, só neste Mac) e a máquina aprende o estilo dela. */
export const ESTILOS = ["Educativo", "Motivacional", "Humor", "Bastidores", "Venda", "Storytelling", "Podcast"];
export function Texto({ v, set, ph, linhas }: { v: string; set: (x: string) => void; ph: string; linhas?: number }) {
  const cls = "vidro w-full rounded-[16px] px-4 py-3 text-[15px] outline-none focus:shadow-[0_0_0_2px_rgb(225_29_42/0.55)]";
  return linhas ? <textarea value={v} onChange={(e) => set(e.target.value)} placeholder={ph} rows={linhas} className={cx(cls, "resize-none")} />
    : <input value={v} onChange={(e) => set(e.target.value)} placeholder={ph} className={cx(cls, "min-h-12")} />;
}
function PassoPerfil({ cfg, pronto }: { cfg: Config; pronto: () => void }) {
  const p0 = cfg.perfil || {};
  const [nome, setNome] = useState(p0.nome || "");
  const [nicho, setNicho] = useState(p0.nicho || "");
  const [quem, setQuem] = useState(p0.quem || "");
  const [insta, setInsta] = useState(p0.instagram || "");
  const [estilos, setEstilos] = useState<string[]>((p0.estilo || "").split(", ").filter(Boolean));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const salvar = async () => {
    setErro(""); setSalvando(true);
    try {
      const r = await post("/api/config/perfil", { nome, nicho, quem, instagram: insta, estilo: estilos.join(", ") });
      if (r.ok) { som.ok(); pronto(); } else setErro(r.erro || "Não salvou");
    } catch (e) { setErro(String((e as Error).message)); }
    setSalvando(false);
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">Quem é você</h2>
        <p className="mt-1.5 text-[15px] text-mute">A Forja já vem com tudo que sabe. Isso aqui ensina o seu jeito, e ela aprende mais a cada correção sua.</p>
      </div>
      <Texto v={nome} set={setNome} ph="Seu nome" />
      <Texto v={nicho} set={setNicho} ph="Seu nicho (ex.: tráfego pago, estética, fitness)" />
      <Texto v={insta} set={setInsta} ph="Seu @ no Instagram" />
      <Texto v={quem} set={setQuem} ph="Quem você é, o que vende e pra quem fala" linhas={3} />
      <div className="flex flex-wrap gap-1.5">
        {ESTILOS.map((e) => {
          const on = estilos.includes(e);
          return <button key={e} onClick={() => { som.toque(); setEstilos((x) => on ? x.filter((y) => y !== e) : [...x, e]); }} aria-pressed={on}
            className={cx("min-h-10 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors", on ? "bg-white !text-[#14060a]" : "bg-white/[0.06] text-mute hover:text-ink")}>{e}</button>;
        })}
      </div>
      <Erro msg={erro} />
      <div className="flex flex-wrap gap-2">
        <Botao tipo="principal" disabled={!nome.trim()} carregando={salvando} onClick={salvar}>{salvando ? <><Gira /> Salvando</> : <>Continuar <ArrowRight className="size-4" /></>}</Botao>
      </div>
    </div>
  );
}

function PassoFerramentas({ cfg, recarregar, pronto }: { cfg: Config; recarregar: () => Promise<void>; pronto: () => void }) {
  const [busca, setBusca] = useState(false);
  const falta = cfg.ferramentas.filter((f) => !f.ok);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">{falta.length ? "Faltam algumas peças" : "Tudo instalado"}</h2>
        <p className="mt-1.5 text-[15px] text-mute">{falta.length ? "Rode cada comando no Terminal e verifique de novo." : "A Forja tem tudo que precisa pra rodar."}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {cfg.ferramentas.map((f, i) => (
          <motion.li key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...mola, delay: i * 0.05 }}
            className="vidro flex min-h-12 flex-wrap items-center gap-3 rounded-[16px] px-3.5 py-2">
            <span className={cx("grid size-6 shrink-0 place-items-center rounded-full", f.ok ? "bg-ok text-black" : "bg-red/20 text-red")}>
              {f.ok ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
            </span>
            <span className="flex-1 text-[15px] font-medium">{f.nome}</span>
            {!f.ok && <span className="flex w-full items-center gap-2 sm:w-auto"><code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-mute">{f.instalar}</code><Copiar texto={f.instalar} /></span>}
          </motion.li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {falta.length ? (
          <Botao tipo="principal" carregando={busca} onClick={async () => { setBusca(true); await recarregar(); setBusca(false); }}>
            <RefreshCw className="size-4" /> Verificar de novo
          </Botao>
        ) : <Botao tipo="principal" onClick={pronto}>Continuar <ArrowRight className="size-4" /></Botao>}
      </div>
    </div>
  );
}

export function Onboarding({ inicial, onFim }: { inicial: Config; onFim: () => void }) {
  const [cfg, setCfg] = useState(inicial);
  const [passo, setPasso] = useState(0);
  const [dir, setDir] = useState(1);
  const recarregar = async () => setCfg(await lerConfig());
  const ir = (p: number) => { setDir(p > passo ? 1 : -1); som.aba(); setPasso(p); recarregar(); };
  const proximo = () => ir(Math.min(passo + 1, PASSOS - 1));
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  const concluir = async () => { await post("/api/config/concluir", {}).catch(() => {}); som.enviar(); onFim(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }} transition={molaSuave}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0204]/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-dvh max-w-[520px] flex-col px-[max(20px,env(safe-area-inset-left))] pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-label={`Passo ${passo + 1} de ${PASSOS}`}>
            {Array.from({ length: PASSOS }, (_, i) => (
              <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.span className="block h-full rounded-full bg-red" initial={false} animate={{ width: i <= passo ? "100%" : "0%" }} transition={molaSuave} />
              </span>
            ))}
          </div>
          {inicial.concluido || inicial.pronto ? (
            <button aria-label="Fechar" onClick={onFim} className="vidro grid size-10 cursor-pointer place-items-center rounded-full text-mute hover:text-ink"><X className="size-4" /></button>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={passo} custom={dir}
              initial={{ opacity: 0, x: 40 * dir, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -30 * dir, filter: "blur(8px)", transition: { duration: 0.16 } }} transition={molaSuave}>
              {passo === 0 && (
                <div className="flex flex-col items-start gap-6">
                  <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ ...molaSuave, delay: 0.1 }}
                    className="relative">
                    <span className="absolute inset-0 -z-10 rounded-full bg-red/40 blur-2xl" />
                    <Marca tam={72} />
                  </motion.div>
                  <div>
                    <h1 className="text-[clamp(32px,8vw,40px)] font-semibold leading-[1.05] tracking-[-0.03em]">Vamos acender<br />sua Forja</h1>
                    <p className="mt-3 text-[16px] text-mute">Conecte seu Claude, sua voz e conte quem você é. Leva dois minutos e tudo fica só neste Mac.</p>
                  </div>
                  <Botao tipo="principal" className="min-h-12 px-6" onClick={proximo}>Começar <ArrowRight className="size-4" /></Botao>
                </div>
              )}
              {passo === 1 && <PassoClaude cfg={cfg} pronto={proximo} />}
              {passo === 2 && <PassoVoz cfg={cfg} pronto={proximo} />}
              {passo === 3 && <PassoPerfil cfg={cfg} pronto={proximo} />}
              {passo === 4 && <PassoFerramentas cfg={cfg} recarregar={recarregar} pronto={proximo} />}
              {passo === 5 && (
                <div className="flex flex-col items-start gap-6">
                  <motion.span initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="respira grid size-16 place-items-center rounded-full bg-red text-white"><Check className="size-8" strokeWidth={2.6} /></motion.span>
                  <div>
                    <h2 className="text-[clamp(32px,8vw,40px)] font-semibold leading-[1.05] tracking-[-0.03em]">Forja acesa</h2>
                    <p className="mt-3 text-[16px] text-mute">{cfg.claude.ok ? "Solte um vídeo cru ou diga o que criar." : "Falta conectar o Claude pra Forja trabalhar."}</p>
                  </div>
                  {cfg.claude.ok
                    ? <Botao tipo="principal" className="min-h-12 px-6" onClick={concluir}>Entrar <ArrowRight className="size-4" /></Botao>
                    : <Botao tipo="principal" className="min-h-12 px-6" onClick={() => ir(1)}>Conectar o Claude</Botao>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {passo > 0 && passo < PASSOS - 1 && (
          <button onClick={() => ir(passo - 1)} className="min-h-11 cursor-pointer self-start rounded-full px-2 text-[14px] text-faint hover:text-ink">Voltar</button>
        )}
      </div>
    </motion.div>
  );
}
