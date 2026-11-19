// Gera imagem no Workers AI (FLUX.2) pra Forja. Protegido por segredo compartilhado (CHAVE).
// POST multipart: prompt, modelo (opcional), w, h, ref0..ref3 (PNG/JPG até 512px). Responde a imagem em bytes.
export default {
  async fetch(req, env) {
    if (req.method !== "POST" || req.headers.get("x-chave") !== env.CHAVE) return new Response("nao", { status: 401 });
    const f = await req.formData();
    const modelo = f.get("modelo") || "@cf/black-forest-labs/flux-2-dev";
    const corpo = new FormData();
    corpo.append("prompt", f.get("prompt"));
    corpo.append("width", f.get("w") || "1024");
    corpo.append("height", f.get("h") || "1024");
    for (let i = 0; i < 4; i++) { const r = f.get(`ref${i}`); if (r) corpo.append(`input_image_${i}`, r); }
    const q = new Request("http://x", { method: "POST", body: corpo });
    try {
      const out = await env.AI.run(modelo, { multipart: { body: q.body, contentType: q.headers.get("content-type") } });
      const b = Uint8Array.from(atob(out.image), c => c.charCodeAt(0));
      return new Response(b, { headers: { "content-type": "image/png" } });
    } catch (e) {
      return new Response(String(e.message || e), { status: 502 });
    }
  },
};
