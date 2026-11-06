const test = require("node:test");
const assert = require("node:assert/strict");
const reasoning = require("../local-reasoning.js");

test("local reasoning returns exploratory hypotheses, never a confirmed cause", () => {
  const result = reasoning.analyse({
    equipmentId: "pump",
    symptomId: "noise",
    language: "en",
    observations: ["Noise reported by operator"],
    measurements: [{ name: "vibration", value: 2.1, unit: "mm/s" }],
    model: "test model"
  });
  assert.ok(Array.isArray(result.hypotheses));
  assert.ok(result.hypotheses.every(item => item.status === "exploratory_hypothesis"));
  assert.equal(Object.hasOwn(result, "confirmedCause"), false);
  assert.ok(result.safetyNote);
});

test("local reasoning output escapes HTML in rendered user-controlled fields", () => {
  const result = reasoning.analyse({
    equipmentId: "pump",
    symptomId: "noise",
    language: "en",
    observations: ["<img src=x onerror=alert(1)>"],
    measurements: []
  });
  const html = reasoning.renderHTML(result, "en");
  assert.equal(/<img\b/i.test(html), false);
  assert.match(html, /&lt;img/);
});

test("unsupported equipment and symptom combinations do not invent hypotheses", () => {
  const result = reasoning.analyse({ equipmentId: "unknown", symptomId: "unknown", language: "en" });
  assert.deepEqual(result.hypotheses, []);
});
