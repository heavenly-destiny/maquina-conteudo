import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { post } from "./api";
import { Marca } from "./ui";

// Linha do tempo casada com som/intro/<periodo>.mp3 (som/v2: revelar + voz do Antônio entrando em 1.6 s):
// 0 a 1.4 s a fita do M se monta e o som cresce · 1.4 s brilho no pico · 1.6 s "Bom dia, tanpz." · 2.9 s "Tudo pronto pra hoje." · 4.9 s abre o app
const T_FRASE1 = 1.3, T_FRASE2 = 3.55, T_FIM = 6.1; // casado com som/intro (braam no 0, voz Brian grave em 1.3s)

export function periodo() {
  const h = new Date().getHours();
  return h < 5 ? "boa-noite" : h < 12 ? "bom-dia" : h < 18 ? "boa-tarde" : "boa-noite";
}
export function saudacao() {
  return { "bom-dia": "Bom dia", "boa-tarde": "Boa tarde", "boa-noite": "Boa noite" }[periodo()];
}

export function Palavras({ texto, atraso = 0, passo = 0.09, className = "" }: { texto: string; atraso?: number; passo?: number; className?: string }) {
  const ps = texto.split(" ");
  return (
    <span className={className}>
      {ps.map((p, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: atraso + i * passo, type: "spring", stiffness: 160, damping: 20 }}
        >
          {p}{i < ps.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function Intro({ onFim }: { onFim: () => void }) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    // o servidor toca o áudio no Mac (afplay): o Chrome não deixa a página tocar som sem clique
    post("/api/tocar-intro", { periodo: periodo() }).catch(() => {});
    const t1 = setTimeout(() => setSaindo(true), T_FIM * 1000);
    const t2 = setTimeout(onFim, (T_FIM + 0.45) * 1000);
    const pular = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === " " || e.key === "Enter") { clearTimeout(t1); clearTimeout(t2); onFim(); } };
    addEventListener("keydown", pular);
    return () => { clearTimeout(t1); clearTimeout(t2); removeEventListener("keydown", pular); };
  }, [onFim]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-bg"
      onClick={onFim}
      animate={saindo ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* uma luz vinho que acende junto com o som, sem partícula e sem clarão */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 45% at 50% 42%, rgb(115 12 30 / 0.55), transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 0.6, 1, 0.75], scale: [0.85, 1, 1.05, 1.08] }}
        transition={{ duration: T_FIM, times: [0, 0.2, 0.3, 1], ease: "easeOut" }}
      />
      <div className="relative flex flex-col items-center gap-7 px-6 text-center">
        <motion.div layoutId="marca" animate={saindo ? { scale: 0.9, opacity: 0, filter: "blur(6px)" } : {}} transition={{ duration: 0.4 }}>
          <Marca tam={128} montar atraso={0.1} />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[clamp(32px,6vw,60px)] font-semibold leading-[1.05] tracking-[-0.035em]">
            <Palavras texto={`${saudacao()}, tanpz.`} atraso={T_FRASE1} passo={0.22} />
          </h1>
          <p className="text-[clamp(17px,2.4vw,22px)] text-mute">
            <Palavras texto="Tudo pronto pra hoje." atraso={T_FRASE2} passo={0.28} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
