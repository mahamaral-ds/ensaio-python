/*
 * Service worker do Level Code: permite abrir o app sem internet depois do primeiro acesso.
 * - Arquivos do próprio app: rede primeiro (sempre a versão mais nova), cache como reserva.
 * - Bibliotecas externas (Pyodide, pacotes Python, CodeMirror, fontes): cache primeiro.
 */
const CACHE = "ensaio-v1";
const EXTERNOS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (EXTERNOS.includes(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copia));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
  }
});
