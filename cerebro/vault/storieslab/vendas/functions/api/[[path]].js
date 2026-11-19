// Proxies /api/* to the existing Worker, same as the old vercel.json route.
const WORKER = "https://storieslab-app.tanpzdigital-183.workers.dev";

export function onRequest({ request }) {
  const url = new URL(request.url);
  return fetch(new Request(WORKER + url.pathname + url.search, request));
}
