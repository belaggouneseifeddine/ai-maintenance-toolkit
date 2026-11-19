const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("Android service worker never precaches assets excluded from the local APK", async () => {
  const source = fs.readFileSync(require.resolve("../sw.js"), "utf8");
  const handlers = new Map();
  const coreCached = [];
  const optionalCached = [];
  const cache = {
    addAll: async assets => coreCached.push(...assets),
    add: async asset => optionalCached.push(String(asset))
  };
  const context = {
    console, Promise, Set, Array, Object, Error,
    self: {
      location: { origin: "https://appassets.androidplatform.net", hostname: "appassets.androidplatform.net" },
      addEventListener: (type, handler) => handlers.set(type, handler),
      skipWaiting: async () => {},
      clients: { claim: async () => {} }
    },
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
      match: async () => undefined
    },
    fetch: async () => new Response("ok", { status: 200 })
  };
  const script = source + "\nglobalThis.__CORE = CORE_APP_SHELL; globalThis.__OPTIONAL = OPTIONAL_APP_SHELL;";
  vm.runInNewContext(script, context, { filename: "sw-android.js" });

  assert.ok(context.__CORE.includes("./index.html"));
  assert.ok(context.__CORE.includes("./assistant-case-context.js"));
  assert.ok(!context.__CORE.includes("./agent-ui.js"));
  assert.ok(!context.__OPTIONAL.includes("./agent-ui.js"));
  assert.ok(!context.__CORE.some(asset => asset.includes("/vendor/transformers/")));
  assert.ok(!context.__OPTIONAL.some(asset => asset.includes("/vendor/transformers/")));
  assert.ok(!context.__CORE.some(asset => asset.endsWith(".traineddata.gz")));
  assert.ok(!context.__OPTIONAL.some(asset => asset.endsWith(".traineddata.gz")));
  assert.ok(context.__OPTIONAL.includes("./vendor/pdfjs/pdf.min.mjs"));

  let installPromise;
  handlers.get("install")({ waitUntil: promise => { installPromise = promise; } });
  await installPromise;
  assert.ok(coreCached.includes("./assistant-case-context.js"));
  assert.ok(optionalCached.includes("./vendor/pdfjs/pdf.min.mjs"));
  assert.ok(!coreCached.includes("./agent-ui.js"));
  assert.ok(!optionalCached.includes("./agent-ui.js"));
});
