const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../diagnostic-flows.js"), "utf8");
const window = {};
vm.runInNewContext(source, { window });
const registry = window.MAINTENANCE_DIAGNOSTIC_FLOWS;

test("diagnostic flow registry has a versioned schema and unique question/answer IDs", () => {
  assert.equal(registry.schemaVersion, 3);
  assert.ok(Object.keys(registry.flows).length >= 5);
  const ids = [];
  for (const [key, flow] of Object.entries(registry.flows)) {
    assert.ok(flow.id && flow.equipmentId && flow.symptomId, key);
    assert.ok(flow.question && flow.question.id && flow.question.text, key);
    assert.ok(Array.isArray(flow.answers) && flow.answers.length >= 3, key);
    ids.push(flow.id, flow.question.id, ...flow.answers.map(answer => answer.id));
    for (const answer of flow.answers) {
      assert.ok(answer.label && answer.guidance, key + " answer " + answer.id);
    }
  }
  assert.equal(new Set(ids).size, ids.length, "flow, question, and answer IDs must be unique");
});

test("compressor low-pressure flow distinguishes outlet, network, and missing readings", () => {
  const flow = registry.flows["compressor|low_pressure"];
  assert.ok(flow);
  assert.deepEqual(Array.from(flow.answers, answer => answer.id), [
    "compressor-output-low",
    "network-pressure-drop",
    "pressure-reading-unknown"
  ]);
  assert.ok(flow.answers.every(answer => /لا تغيّر|لا تستنتج|قارن|اجمع/.test(answer.guidance)));
});

test("valve no-response flow uses safe interface observations and rejects bypassing protection", () => {
  const flow = registry.flows["valve|not_start"];
  assert.ok(flow);
  assert.ok(flow.answers.some(answer => /لا تتجاوز interlocks/.test(answer.guidance)));
  assert.ok(flow.answers.every(answer => !/جسّر|bypass interlock|disable interlock/i.test(answer.guidance)));
});


test("equipment workflow expansion includes conservative branches for pneumatic, gearbox, bearing, PLC, conveyor, and thermal faults", () => {
  const expected = [
    "pneumatic|low_flow", "gearbox|overheat", "bearing|vibration",
    "plc|not_start", "conveyor|tracking", "thermal|overheat"
  ];
  for (const key of expected) {
    const flow = registry.flows[key];
    assert.ok(flow, "missing flow " + key);
    assert.ok(flow.answers.length >= 3, key + " should distinguish at least three evidence states");
    assert.ok(flow.answers.every(answer => answer.id && answer.guidance), key + " has incomplete answer");
  }
});

test("expanded flows preserve isolation and protection safeguards", () => {
  const safeText = ["pneumatic|low_flow", "gearbox|overheat", "bearing|vibration", "plc|not_start", "conveyor|tracking", "thermal|overheat"]
    .flatMap(key => registry.flows[key].answers.map(answer => answer.guidance)).join(" ");
  assert.match(safeText, /لا تفك الوصلات تحت الضغط/);
  assert.match(safeText, /لا تتجاوز interlocks|لا تجسّر/);
  assert.match(safeText, /العزل/);
  assert.match(safeText, /لا تقترب من الأجزاء الدوارة/);
});
