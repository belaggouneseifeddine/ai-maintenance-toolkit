const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("service worker installs the core offline app when an optional reference fails", async () => {
  const source = fs.readFileSync(require.resolve("../sw.js"), "utf8");
  const handlers = new Map();
  const cached = new Set();
  const warnings = [];
  let skipWaitingCalls = 0;
  const cache = {
    addAll: async assets => {
      for (const asset of assets) cached.add(asset);
    },
    add: async asset => {
      if (asset === "./knowledge/oem-platform-index.json") throw new Error("simulated optional 404");
      cached.add(String(asset));
    }
  };
  const context = {
    console,
    Promise,
    Set,
    Array,
    Object,
    Error,
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (type, handler) => handlers.set(type, handler),
      skipWaiting: async () => { skipWaitingCalls++; },
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
  const script = source + "\nglobalThis.__APP_SHELL = APP_SHELL; globalThis.__CORE_APP_SHELL = CORE_APP_SHELL; globalThis.__OPTIONAL_APP_SHELL = OPTIONAL_APP_SHELL;";
  vm.runInNewContext(script, context, { filename: "sw.js" });

  let installPromise;
  handlers.get("install")({ waitUntil: promise => { installPromise = promise; } });
  await installPromise;

  assert.ok(cached.has("./index.html"));
  assert.ok(cached.has("./diagnostic-session.js"));
  assert.ok(cached.has("./document-library-core.js"));
  assert.ok(cached.has("./document-library.js"));
  assert.ok(cached.has("./document-library.css"));
  assert.ok(cached.has("./faults.json"));
  assert.ok(cached.has("./knowledge/faults-supplement.json"));
  assert.ok(cached.has("./knowledge/manufacturer-sources.json"));
  assert.ok(!cached.has("./knowledge/oem-platform-index.json"));
  assert.equal(skipWaitingCalls, 1);
  assert.equal(context.__CORE_APP_SHELL.length + context.__OPTIONAL_APP_SHELL.length, context.__APP_SHELL.length);
  assert.equal(new Set([...context.__CORE_APP_SHELL, ...context.__OPTIONAL_APP_SHELL]).size, context.__APP_SHELL.length);
  assert.ok(context.__CORE_APP_SHELL.includes("./faults.json"));
  assert.ok(context.__OPTIONAL_APP_SHELL.includes("./knowledge/oem-platform-index.json"));
  assert.ok(context.__OPTIONAL_APP_SHELL.includes("./document-library.js"));
});

test("service worker does not activate a new version when a core asset cannot be cached", async () => {
  const source = fs.readFileSync(require.resolve("../sw.js"), "utf8");
  const handlers = new Map();
  let skipWaitingCalls = 0;
  const cache = {
    addAll: async () => { throw new Error("simulated core asset failure"); },
    add: async () => {}
  };
  const context = {
    console,
    Promise,
    Set,
    Array,
    Object,
    Error,
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (type, handler) => handlers.set(type, handler),
      skipWaiting: async () => { skipWaitingCalls++; },
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
  const script = source + "\nglobalThis.__CORE_APP_SHELL = CORE_APP_SHELL;";
  vm.runInNewContext(script, context, { filename: "sw.js" });

  let installPromise;
  handlers.get("install")({ waitUntil: promise => { installPromise = promise; } });
  await assert.rejects(installPromise, /simulated core asset failure/);
  assert.equal(skipWaitingCalls, 0);
  assert.ok(context.__CORE_APP_SHELL.includes("./index.html"));
});
