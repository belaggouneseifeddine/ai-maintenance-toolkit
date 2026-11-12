const CACHE_NAME = "maintenance-ai-toolkit-v57";
const APP_SHELL = [
  "./",
  "./index.html",
  "./p1-app-shell.css",
  "./p1-app-shell.js",
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
  "./diagnostic-session.js",
  "./diagnostic-session-ui.js",
  "./oem-lookup.js",
  "./faults.json",
  "./knowledge/faults-supplement.json",
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

const OPTIONAL_APP_SHELL = [
  "./document-library-core.js",
  "./document-library.js",
  "./document-library.css",
  "./diagnostic-evidence-register.json",
  "./knowledge/manufacturer-sources.json",
  "./knowledge/oem-platform-index.json",
  "./knowledge/oem-verified-faults.json",
  "./knowledge/OEM-VERIFIED-FAULTS-AR-FR-EN.md",
  "./knowledge/manufacturer-machine-fault-matrix.json",
  "./decision-trees.json"
];
const CORE_APP_SHELL = APP_SHELL.filter(asset => !OPTIONAL_APP_SHELL.includes(asset));

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Core UI, local diagnostic code and the local fault library must be cached
    // together. If one is missing, keep the previous worker rather than install
    // a partially usable offline application.
    await cache.addAll(CORE_APP_SHELL);

    // Optional reference bundles are cached independently so one unavailable
    // document cannot prevent the core app from becoming available offline.
    const optionalResults = await Promise.allSettled(
      OPTIONAL_APP_SHELL.map(asset => cache.add(asset))
    );
    const failedOptionalAssets = optionalResults.filter(result => result.status === "rejected").length;
    if (failedOptionalAssets) {
      console.warn("Maintenance Toolkit optional offline references were not all cached.", {
        failedOptionalAssets,
        totalOptionalAssets: OPTIONAL_APP_SHELL.length
      });
    }

    await self.skipWaiting();
  })());
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
