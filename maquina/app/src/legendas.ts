/* Templates de legenda. Fonte única: o painel mostra a prévia com estes valores e o job de corte recebe o mesmo objeto
   (maquina.py exporta pra legendas.json). Medidas dos 10 do OpusClip em estilos/opusclip-re/ESPEC.md (c), em canvas 1080x1920. */
export type Legenda = {
  id: string; nome: string;
  fonte: string; peso: number; italico?: boolean; caixa: "alta" | "normal"; tam: number; // px no 1080x1920
  cor: string; destaque?: string; futuras?: string; // palavra ativa / palavras ainda não ditas
  contorno?: [number, string]; sombra?: string; fundo?: string; // fundo = pílula atrás da frase
  script?: string; // palavra-chave em fonte script por cima (estilo dourado)
  anim: "pop" | "karaoke" | "troca" | "sublinhado" | "caixa" | "blur";
  palavras: number; posY: number; // palavras por tela, centro vertical em %
  nota?: string;
};

export const LEGENDAS: Legenda[] = [
  { id: "maquina", nome: "Máquina", fonte: "Inter", peso: 800, caixa: "normal", tam: 64, cor: "#ffffff", sombra: "0 4px 18px rgba(0,0,0,.85)", anim: "pop", palavras: 4, posY: 50, nota: "Padrão da tela dividida: na divisão, uma cor, só sombra." },
  { id: "dourado", nome: "Dourado", fonte: "Anton", peso: 400, caixa: "alta", tam: 92, cor: "#ffffff", destaque: "#f5c542", sombra: "0 0 22px rgba(255,255,255,.55)", script: "Allura", anim: "blur", palavras: 3, posY: 65, nota: "Tela cheia, estilo DLw_JtTzhz0: condensada com brilho e palavra-chave em script dourada." },
  { id: "karaoke", nome: "Karaoke", fonte: "Montserrat", peso: 900, caixa: "alta", tam: 80, cor: "#ffffff", destaque: "#FFE11A", contorno: [16, "#000000"], sombra: "4px 4px 4px #000", anim: "karaoke", palavras: 4, posY: 78 },
  { id: "deep-diver", nome: "Pílula", fonte: "Poppins", peso: 700, caixa: "normal", tam: 58, cor: "#111111", futuras: "#9A9A9A", fundo: "#E6E6E6", anim: "karaoke", palavras: 5, posY: 79 },
  { id: "popline", nome: "Sublinhado", fonte: "Montserrat", peso: 900, caixa: "alta", tam: 76, cor: "#ffffff", destaque: "#e11d2a", sombra: "0 4px 14px rgba(0,0,0,.6)", anim: "sublinhado", palavras: 4, posY: 80 },
  { id: "highlighter", nome: "Marca-texto", fonte: "Montserrat", peso: 800, caixa: "normal", tam: 64, cor: "#ffffff", destaque: "#e11d2a", anim: "caixa", palavras: 4, posY: 78 },
  { id: "simple", nome: "Uma palavra", fonte: "Oswald", peso: 700, caixa: "alta", tam: 120, cor: "#ffffff", sombra: "0 3px 10px rgba(0,0,0,.7)", anim: "troca", palavras: 1, posY: 50 },
  { id: "mozi", nome: "Pop", fonte: "Montserrat", peso: 900, caixa: "alta", tam: 84, cor: "#ffffff", destaque: "#3CFF3C", contorno: [14, "#000000"], anim: "pop", palavras: 3, posY: 62 },
  { id: "youshaei", nome: "Menta", fonte: "Montserrat", peso: 800, caixa: "alta", tam: 78, cor: "#45E0A8", futuras: "rgba(255,255,255,.35)", sombra: "0 2px 8px rgba(0,0,0,.4)", anim: "karaoke", palavras: 3, posY: 50 },
  { id: "beasty", nome: "Quadrinho", fonte: "Bangers", peso: 400, italico: true, caixa: "alta", tam: 96, cor: "#ffffff", destaque: "#FFE11A", contorno: [14, "#000000"], anim: "pop", palavras: 2, posY: 80 },
  { id: "think-media", nome: "Itálico", fonte: "Bebas Neue", peso: 400, italico: true, caixa: "alta", tam: 104, cor: "#ffffff", destaque: "#FFE11A", sombra: "4px 4px 0 #000", anim: "troca", palavras: 3, posY: 75 },
  { id: "pod-p", nome: "Magenta", fonte: "Anton", peso: 400, caixa: "alta", tam: 96, cor: "#FF3EC8", sombra: "0 3px 10px rgba(0,0,0,.5)", anim: "troca", palavras: 2, posY: 78 },
];
