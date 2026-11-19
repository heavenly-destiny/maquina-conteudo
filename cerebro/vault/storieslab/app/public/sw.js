// Push only (no fetch handler, nothing is cached). The worker sends an empty push; the text comes from GET /api/push
// (?ep= lets the server hand an admin device its queued sale/report note, see admin-push.js).
// shown/clicked go to /api/pushev (admin: push delivered and opened)
const report = e => self.registration.pushManager.getSubscription()
  .then(s => s && fetch('/api/pushev', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({endpoint: s.endpoint, e})})).catch(() => {});
self.addEventListener('push', e => e.waitUntil(
  self.registration.pushManager.getSubscription().then(sub => fetch('/api/push' + (sub ? '?ep=' + encodeURIComponent(sub.endpoint) : ''))).then(r => r.json()).catch(() => ({title: 'Stories Lab', body: 'Sua figurinha do dia chegou. Vem ver!', url: '/'}))
    .then(m => self.registration.showNotification(m.title, {body: m.body, icon: '/icon-192.png', badge: '/icon-192.png', data: {url: m.url || '/'}}))
    .then(() => report('push_show'))
));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(Promise.all([report('push_click'), clients.matchAll({type: 'window'}).then(ws => {
    const w = ws.find(x => 'focus' in x);
    const url = e.notification.data.url;
    return w ? (url !== '/' && w.navigate ? w.navigate(url).then(x => (x || w).focus()) : w.focus()) : clients.openWindow(url);
  })]));
});
