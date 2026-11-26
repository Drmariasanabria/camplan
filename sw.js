// Service worker: la web funciona sin conexión.
// - Código propio: primero red (siempre la última versión), si no hay red, la copia guardada.
// - Librerías, fuentes, fotos y teselas de mapa ya vistas: primero caché.
// - Las APIs en vivo las gestiona la propia app (guarda los últimos datos).
const V = 'roadbook-20261126115200';
const SHELL = [
  './', './index.html', './css/app.css', './manifest.webmanifest',
  './js/app.js', './js/firebase-config.js', './js/core/fx.js', './js/core/live.js', './js/core/store.js', './js/core/ui.js',
  './destinations/registry.js', './destinations/suiza/index.js', './destinations/suiza/data.js', './destinations/suiza/engine.js', './destinations/suiza/common.js', './destinations/suiza/roadbook.js',
  ...['plan', 'viaje', 'itinerario', 'preparar', 'ruta', 'dormir', 'tiempo', 'actividades', 'perros', 'destino', 'presupuesto', 'equipaje', 'emergencias'].map(s => `./destinations/suiza/sections/${s}.js`),
  './icons/icon-192.png', './icons/icon-512.png',
];
const STATIC = /(unpkg\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com\/firebasejs|upload\.wikimedia\.org|basemaps\.cartocdn\.com|tile\.openstreetmap\.org|tile\.opentopomap\.org|arcgisonline\.com|opensnowmap\.org)/;
const MAX_STATIC = 1500;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'roadbook-static').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // no-cache: revalida con el servidor (rápido, 304) para no mezclar versiones tras publicar
    const fresh = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' });
    e.respondWith(fresh.then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (STATIC.test(url.host + url.pathname)) {
    e.respondWith(caches.open('roadbook-static').then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r.ok || r.type === 'opaque') { c.put(req, r.clone()); c.keys().then(ks => ks.length > MAX_STATIC && ks.slice(0, 200).forEach(k => c.delete(k))); }
        return r;
      } catch { return hit || Response.error(); }
    }));
  }
});
