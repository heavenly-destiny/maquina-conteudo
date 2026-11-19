// Files over Pages' 25 MiB limit live in R2 (bucket "storieslab-bonus") under the
// same path; everything else in this folder is served from static assets.
export async function onRequestGet({ request, env, params }) {
  const obj = await env.BONUS.get(`e/eabpuFvO266o/${params.file}`);
  if (!obj) return env.ASSETS.fetch(request);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("content-disposition", `attachment; filename="${params.file}"`);
  return new Response(obj.body, { headers });
}
