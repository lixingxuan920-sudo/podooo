const CACHE_NAME = "podo-vedic-two-stage-v47";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=42",
  "/indian-wellness.css?v=42",
  "/cream-system.css?v=46",
  "/app.js?v=47",
  "/astrology-skill.js?v=41",
  "/indian-astrology-skill.js?v=47",
  "/tarot-skill.js?v=41",
  "/manifest.webmanifest",
  "/assets/app-icon.svg",
  "/assets/tarot-hero.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => (
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("/index.html"))
    ))
  );
});
