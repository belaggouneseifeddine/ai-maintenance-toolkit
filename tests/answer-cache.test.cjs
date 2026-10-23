const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");
const { TextEncoder } = require("node:util");

const source = fs.readFileSync(require.resolve("../answer-cache.js"), "utf8");
const KEY = "maintenance-ai-toolkit-ai-answer-cache-v1";

function setup({ now = () => 1000000, failStorage = false, crypto = webcrypto } = {}) {
  const values = new Map();
  const storage = {
    getItem(key) { if (failStorage) throw new Error("storage blocked"); return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { if (failStorage) throw new Error("storage blocked"); values.set(key, String(value)); },
    removeItem(key) { if (failStorage) throw new Error("storage blocked"); values.delete(key); }
  };
  const window = { localStorage: storage, crypto, TextEncoder };
  vm.runInNewContext(source, { window }, { filename: "answer-cache.js" });
  const cache = window.MaintenanceAnswerCache.create({ storage, crypto, TextEncoder, now });
  return { cache, storage, values };
}

const payload = {
  machine: "pump model X",
  symptom: "low flow",
  code: "E-01",
  observations: "existing readings available",
  measurementStatus: "available",
  language: "en"
};
function safeResult(overrides = {}) {
  return {
    answer: "Preliminary guidance based on retrieved evidence.",
    diagnosis: {
      status: "preliminary_assessment",
      escalation: { required: false, reason: "No immediate escalation indicated." }
    },
    retrieval: { status: "retrieved", matchedChunks: 2 },
    citations: [{ id: "S1", source: "knowledge/pump.md", section: "Pump flow" }],
    ...overrides
  };
}

test("opt-in cache reuses only an exact input fingerprint without storing raw input", async () => {
  const app = setup();
  assert.equal(await app.cache.set(payload, safeResult()), true);
  const cached = await app.cache.get(payload);
  assert.equal(cached.answer, "Preliminary guidance based on retrieved evidence.");
  assert.equal(await app.cache.get({ ...payload, symptom: "no flow" }), null);
  assert.equal(app.values.get(KEY).includes("pump model X"), false);
});

test("safety-gate, escalation, and unsupported-evidence answers are never cached", async () => {
  const app = setup();
  assert.equal(await app.cache.set(payload, safeResult({ safety_gate: { trigger: "protection_bypass" } })), false);
  assert.equal(await app.cache.set(payload, safeResult({ diagnosis: { status: "escalation_required", escalation: { required: true } } })), false);
  assert.equal(await app.cache.set(payload, safeResult({ retrieval: { status: "no-match", matchedChunks: 0 } })), false);
  assert.equal(await app.cache.get(payload), null);
});

test("entries expire after 24 hours and expired data is purged", async () => {
  let time = 1000000;
  const app = setup({ now: () => time });
  assert.equal(await app.cache.set(payload, safeResult()), true);
  time += 24 * 60 * 60 * 1000 + 1;
  assert.equal(await app.cache.get(payload), null);
  assert.deepEqual(JSON.parse(app.values.get(KEY)), []);
});

test("cache can be cleared explicitly", async () => {
  const app = setup();
  assert.equal(await app.cache.set(payload, safeResult()), true);
  assert.equal(app.cache.clear(), true);
  assert.equal(await app.cache.get(payload), null);
});

test("blocked local storage and unavailable Web Crypto fail closed without breaking diagnosis", async () => {
  const blocked = setup({ failStorage: true });
  assert.equal(await blocked.cache.get(payload), null);
  assert.equal(await blocked.cache.set(payload, safeResult()), false);
  const noCrypto = setup({ crypto: null });
  assert.equal(await noCrypto.cache.get(payload), null);
  assert.equal(await noCrypto.cache.set(payload, safeResult()), false);
});
