// Sons de interface reais (ElevenLabs SFX, cortados e normalizados em som/v2), tocados por WebAudio:
// o arquivo é decodificado uma vez e cada toque sai sem atraso.
const NOMES = ["toque", "aba", "abrir", "ok", "enviar", "erro"] as const;
type Nome = (typeof NOMES)[number];
const VOLUME: Record<Nome, number> = { toque: 0.35, aba: 0.4, abrir: 0.45, ok: 0.5, enviar: 0.5, erro: 0.45 };

let ctx: AudioContext | null = null;
let ligado = true;
try { ligado = localStorage.getItem("som") !== "0"; } catch {}
const buf: Partial<Record<Nome, AudioBuffer>> = {};

function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    for (const n of NOMES)
      fetch(`/sons/${n}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx!.decodeAudioData(b)).then((d) => { buf[n] = d; }).catch(() => {});
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
// o Chrome só libera áudio depois do primeiro gesto: carrega tudo nesse momento
addEventListener("pointerdown", () => ac(), { once: true, capture: true });

function tocar(n: Nome) {
  if (!ligado) return;
  const a = ac(), b = buf[n];
  if (!b) return;
  const s = a.createBufferSource(), g = a.createGain();
  s.buffer = b;
  g.gain.value = VOLUME[n];
  s.connect(g).connect(a.destination);
  s.start();
}

export const som = {
  toque: () => tocar("toque"),
  aba: () => tocar("aba"),
  abrir: () => tocar("abrir"),
  fechar: () => tocar("toque"),
  ok: () => tocar("ok"),
  enviar: () => tocar("enviar"),
  erro: () => tocar("erro"),
  get ligado() { return ligado; },
  alternar() {
    ligado = !ligado;
    try { localStorage.setItem("som", ligado ? "1" : "0"); } catch {}
    if (ligado) tocar("ok");
    return ligado;
  },
};
