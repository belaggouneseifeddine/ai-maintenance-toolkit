const CACHE_NAME = "maintenance-ai-toolkit-v49";
const APP_SHELL = [
  "./",
  "./index.html",
  "./diagnostic-flows.js",
  "./normalization.js",
  "./bayesian-engine.js",
  "./diagnostic-engine.js",
  "./engineering-core.js",
  "./agent-core.js",
  "./evidence-reasoning.js",
  "./evidence-reasoning-ui.js",
  "./diagnostic-evidence-register.json",
  "./agent-ui.js",
  "./oem-lookup.js",
  "./faults.json",
  "./knowledge/manufacturer-sources.json",
  "./knowledge/oem-platform-index.json",
  "./knowledge/oem-verified-faults.json",
  "./knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md",
  "./knowledge/manufacturer-machine-fault-matrix.json",
  "./i18n.js",
  "./manifest.json",
  "./icon.svg",
  "./maintenance-v03.js",
  "./knowledge-review.js",
  "./answer-tools.js",
  "./maintenance-v03.css",
  "./decision-trees.json",
  "./ux-redesign.js",
  "./ux-redesign.css",
  "./navigation-redesign.js"
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
