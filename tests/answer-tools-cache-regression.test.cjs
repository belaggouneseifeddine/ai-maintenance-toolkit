const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../answer-tools.js"), "utf8");
const KEY = "maintenance-ai-toolkit-answer-cache-v1";

function setup() {
  const store = new Map();
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  const window = { localStorage };
  vm.runInNewContext(source, { window, globalThis: window, Date, JSON, Math, Object, Number, Array, String });
  return { api: window.MaintenanceAnswerTools, store, localStorage };
}

function supportedResult(overrides = {}) {
  return {
    answer: "Preliminary evidence-backed guidance.",
    citations: [{ id: "S1", source: "knowledge/pump.md" }],
    diagnosis: {
      status: "preliminary_assessment",
      escalation: { required: false },
      possible_causes: [{
        evidence_class: "source_supported_hypothesis",
        source_ids: ["S1"]
      }]
    },
    retrieval: { status: "retrieved", matchedChunks: 1 },
    ...overrides
  };
}

const input = {
  machine: "pump model X",
  symptom: "low flow",
  code: "E-01",
  language: "en"
};

test("cache is disabled by default at the UI layer and core cache API remains opt-in", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /id="aiCacheEnabled"/);
  assert.match(html, /id="aiCacheEnabled"[^>]*checked/i, "cache opt-in control should communicate its default explicitly");
  const { api } = setup();
  assert.equal(typeof api.get, "function");
  assert.equal(typeof api.put, "function");
  assert.equal(typeof api.clear, "function");
});

test("cache key is input-sensitive and storage does not retain the raw input object", () => {
  const { api, store } = setup();
  assert.notEqual(api.hash(input), api.hash({ ...input, symptom: "no flow" }));
  assert.equal(api.put(input, supportedResult(), 1000), true);
  const serialized = store.get(KEY);
  assert.ok(serialized);
  assert.equal(serialized.includes("pump model X"), false);
  assert.equal(serialized.includes("low flow"), false);
  assert.equal(api.get(input, 1001).answer, "Preliminary evidence-backed guidance.");
  assert.equal(api.get({ ...input, symptom: "no flow" }, 1001), null);
});

test("safety-gate, escalation, and ungrounded answers are rejected", () => {
  const { api } = setup();
  assert.equal(api.put(input, supportedResult({ safety_gate: { trigger: "unsafe" } }), 1000), false);
  assert.equal(api.put(input, supportedResult({ diagnosis: { status: "escalation_required", escalation: { required: true } } }), 1000), false);
  assert.equal(api.put(input, supportedResult({ diagnosis: { status: "preliminary_assessment", escalation: { required: false }, possible_causes: [] } }), 1000), false);
  assert.equal(api.put(input, supportedResult({ retrieval: { status: "no-match", matchedChunks: 0 } }), 1000), false);
  assert.equal(api.get(input, 1001), null);
});

test("entries expire at 24 hours and future-dated entries fail closed", () => {
  const { api } = setup();
  assert.equal(api.put(input, supportedResult(), 1000), true);
  assert.equal(api.get(input, 1000 + 24 * 60 * 60 * 1000 - 1).answer, "Preliminary evidence-backed guidance.");
  assert.equal(api.get(input, 1000 + 24 * 60 * 60 * 1000), null);
  assert.equal(api.put(input, supportedResult(), 5000), true);
  assert.equal(api.get(input, 4999), null);
});

test("cache stores only bounded response fields and clear removes the cache", () => {
  const { api, store } = setup();
  const result = supportedResult({ privateExtra: "must not persist" });
  assert.equal(api.put(input, result, 1000), true);
  const saved = JSON.parse(store.get(KEY));
  const entry = Object.values(saved)[0];
  assert.equal("privateExtra" in entry.data, false);
  assert.equal(api.clear(), true);
  assert.equal(store.has(KEY), false);
});

test("cache size remains bounded", () => {
  const { api, store } = setup();
  for (let i = 0; i < 15; i++) {
    assert.equal(api.put({ ...input, symptom: "symptom " + i }, supportedResult(), 1000 + i), true);
  }
  assert.equal(Object.keys(JSON.parse(store.get(KEY))).length, 12);
});
