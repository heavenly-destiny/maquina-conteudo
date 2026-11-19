import { useEffect, useState } from "react";

export type Corte = {
  n: number; slug: string; titulo: string; gancho?: string; inicio: number; fim: number;
  status?: string; fase?: string; desde?: number; video?: string | null; capa?: string | null;
  nome: string; trecho?: string; dur?: number | null; legenda?: string; hashtags?: string; nota?: string; forca?: number;
};
export type Job = { id: string; categoria?: string; etapa?: string; duracao?: number; cortes: Corte[]; ultimo: string; bruto: string };
export type Bruto = { path: string; nome: string; min: number; feito: boolean; data: number };
export type Geracao = {
  id: string; tipo: "roteiro" | "animado" | "criativo" | "modelar" | "clonar"; briefing: string; estilo?: string | null;
  status: string; fase?: string; desde?: number; erro?: string; titulo?: string; legenda?: string; hashtags?: string; revisao?: { aprovado?: boolean; nota?: number; problemas?: string[] };
  inspiracao?: string; nicho?: string; validacao?: "teste" | "validado"; video?: string | null; capa?: string | null; roteiro_txt?: string | null; roteiro_json?: { titulo?: string; gancho?: string; falas?: { texto: string; cena?: string }[] } | null; criado: number; notas?: string[];
};
export type Beat = { t: string; o_que_acontece: string; fala?: string; tecnica_visual?: string; texto_tela?: string; som?: string };
export type Decupagem = {
  titulo?: string; gancho?: string; formato?: string; duracao?: number; estrutura?: Beat[]; estilo_edicao?: string;
  legenda_e_texto?: string; audio?: string; por_que_funciona?: string; como_modelar?: string; nicho?: string; traducao?: string;
};
export type Inspiracao = {
  id: string; url: string; status: string; fase?: string; erro?: string; criado: number; decupagem?: Decupagem | null;
  video?: string | null; capa?: string | null; info?: { titulo?: string; autor?: string; views?: number; duracao?: number };
};
export type Transcricao = {
  id: string; url?: string; arquivo?: string; status: string; fase?: string; erro?: string; criado: number; desde?: number; titulo?: string;
  duracao?: number; previa?: string; texto?: string | null; srt?: string | null; tempo?: string | null;
};
export type Estado = {
  brutos: Bruto[]; jobs: Job[]; geracoes: Geracao[]; inspiracoes: Inspiracao[]; transcricoes?: Transcricao[];
  hoje: { feitos: number; meta: number; postados: number }; envio: { rodando: boolean; msg: string }; agora: number;
};
export type ItemBib = {
  id: string; fonte: string; titulo?: string; autor?: string; url?: string; views?: number | string;
  formato?: string; duracao?: number; resumo?: string; tecnica?: string; img?: string; video?: string;
  prompt?: string; encaixe?: string; relevancia?: number; generico?: boolean;
};

export async function post(rota: string, corpo: unknown) {
  const r = await fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || `erro ${r.status}`);
  return j;
}

let cache: Estado | null = null;
const ouvintes = new Set<(e: Estado) => void>();
let timer: number | undefined;

async function puxar() {
  try {
    const r = await fetch("/api/estado");
    if (r.ok) { cache = await r.json(); ouvintes.forEach((f) => f(cache!)); }
  } catch {}
}
export const atualizar = puxar;

export function useEstado() {
  const [e, setE] = useState<Estado | null>(cache);
  useEffect(() => {
    ouvintes.add(setE);
    if (!timer) { puxar(); timer = window.setInterval(puxar, 2500); }
    return () => { ouvintes.delete(setE); };
  }, []);
  return e;
}

export type Musica = {
  id: string; titulo: string; artista: string; estilo_de_video: string; estilos: string[]; mood: string; energia: number; bpm?: number | null;
  momento_do_drop_s?: number | null; preview?: string | null; capa?: string | null; links: Record<string, string | null>; rank?: number | null;
  tendencia: string; posicoes: Record<string, number>; por_que_viral: string; formato_de_uso: string; origem: string; uso_brasil: string;
};
export type EstiloMusica = { id: string; nome: string; prompt_trilha: string; bpm: number; drop_s: number; faixas: string[] };
export type Musicas = { atualizado_em: string | null; atualizando: boolean; estilos: EstiloMusica[]; musicas: Musica[] };
export type ResultadoBusca = { deezer_id: number | null; titulo: string; artista: string; capa?: string; preview?: string; link?: string; spotify: string };
export const musicas = (): Promise<Musicas> => fetch("/api/musicas").then((r) => r.json());

let bib: Promise<ItemBib[]> | null = null;
export const biblioteca = () => (bib ??= fetch("/api/biblioteca").then((r) => r.json()));
export const limparBiblioteca = () => { bib = null; };

export const fmtTempo = (s?: number | null) => {
  if (!s && s !== 0) return "";
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return m ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
};
export const fmtViews = (v?: number | string) => {
  const n = Number(v);
  if (!n) return "";
  return n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".0", "")} mi` : n >= 1e3 ? `${Math.round(n / 1e3)} mil` : String(n);
};

/* sobe o vídeo cru; o servidor já começa a cortar quando termina */
export type ModoDec = "rapida" | "completa" | "fiel";
export const modoDec = (): ModoDec => { try { return (localStorage.getItem("modo-dec") as ModoDec) || "completa"; } catch { return "completa"; } };
export const guardarModoDec = (m: ModoDec) => { try { localStorage.setItem("modo-dec", m); } catch {} };
export function enviarInspiracao(f: File, prog: (p: number) => void, destino = "inspirar", modo: ModoDec = modoDec()) {
  return new Promise<string>((ok, erro) => {
    const x = new XMLHttpRequest();
    x.open("POST", `/api/upload?destino=${destino}&modo=${modo}&nome=${encodeURIComponent(f.name)}`);
    x.upload.onprogress = (ev) => prog(ev.loaded / ev.total);
    x.onload = () => { try { x.status < 300 ? ok(JSON.parse(x.responseText).id) : erro(new Error("O envio falhou")); } catch { erro(new Error("O envio falhou")); } };
    x.onerror = () => erro(new Error("O envio falhou"));
    x.send(f);
  });
}

export function enviarVideo(f: File, prog: (p: number) => void, config?: unknown) {
  return new Promise<void>((ok, erro) => {
    const x = new XMLHttpRequest();
    x.open("POST", `/api/upload?nome=${encodeURIComponent(f.name)}${config ? `&config=${encodeURIComponent(JSON.stringify(config))}` : ""}`);
    x.upload.onprogress = (ev) => prog(ev.loaded / ev.total);
    x.onload = () => (x.status < 300 ? ok() : erro(new Error("O envio falhou")));
    x.onerror = () => erro(new Error("O envio falhou"));
    x.send(f);
  });
}

/* pedido pré-preenchido que outra tela manda pro composer do Início */
export type Rascunho = { tipo: Geracao["tipo"]; briefing?: string; estilo?: string; inspiracao?: string };
