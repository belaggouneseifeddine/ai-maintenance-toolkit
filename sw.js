const CACHE_NAME = "maintenance-ai-toolkit-v26";
const APP_SHELL = [
  "./",
  "./index.html",
  "./diagnostic-flows.js",
  "./diagnostic-engine.js",
  "./faults.json",
  "./i18n.js",
  "./manifest.json",
  "./icon.svg",
  "./maintenance-v03.js",
  "./maintenance-v03.css",
  "./decision-trees.json",
  "./ux-redesign.js",
  "./ux-redesign.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(error => {
        // Keep the worker installable even if an optional shell asset is unavailable.
        console.warn("Maintenance Toolkit app-shell cache was incomplete.", error);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("maintenance-ai-toolkit-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range")) return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Cache only successful same-origin responses; never cache errors or opaque responses.
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy))
            .catch(error => console.warn("Could not update app cache.", error));
        }
        return response;
      }).catch(error => {
        if (request.mode === "navigate") {
          return caches.match("./index.html").then(fallback => {
            if (fallback) return fallback;
            throw error;
          });
        }
        throw error;
      });
    })
  );
});
