const test = require("node:test");
const assert = require("node:assert/strict");

const faults = require("../faults.json");
global.MAINTENANCE_FAULTS = faults;
require("../diagnostic-engine.js");

const diagnose = global.MaintenanceDiagnosticEngine.diagnose;

test("fault library has localized titles and safe guidance", () => {
  assert.ok(Array.isArray(faults.faults));
  assert.ok(faults.faults.length > 0);
  for (const fault of faults.faults) {
    for (const language of ["ar", "fr", "en"]) {
      assert.equal(typeof fault.title?.[language], "string", fault.id + ": title missing for " + language);
      assert.ok((fault.safeChecks || []).some(item => typeof item[language] === "string" && item[language].trim()),
        fault.id + ": safe checks missing for " + language);
      assert.equal(typeof fault.escalation?.[language], "string", fault.id + ": escalation missing for " + language);
    }
  }
});

test("pump symptom with supporting observations returns an advisory match", () => {
  const result = diagnose({
    equipmentType: "pump",
    symptom: "noise",
    observations: "صوت حصى واهتزاز",
    language: "ar"
  }, faults);
  assert.equal(result.matched, true);
  assert.ok(result.results.length > 0);
  assert.equal(result.results[0].thresholdMet, true);
  assert.match(result.advisory, /إرشادية/);
});

test("insufficient evidence does not invent a fault", () => {
  const result = diagnose({
    equipmentType: "motor",
    symptom: "trip",
    observations: "",
    language: "en"
  }, faults);
  assert.equal(result.matched, false);
  assert.equal(result.results.length, 0);
  assert.match(result.message, /No sufficient match/);
});

test("unsupported language falls back to Arabic and shows a tentative equipment/symptom match", () => {
  const result = diagnose({
    equipmentType: "pump",
    symptom: "noise",
    observations: "",
    language: "xx"
  }, faults);
  assert.equal(result.language, "ar");
  assert.equal(result.matched, true);
  assert.ok(result.results.length > 0);
  assert.match(result.results[0].rankingReason, /مطابقة أولية/);
});

test("missing or malformed fault library fails safely", () => {
  const result = diagnose({ equipmentType: "pump", symptom: "noise", language: "en" }, { faults: "invalid" });
  assert.equal(result.matched, false);
  assert.deepEqual(result.results, []);
  assert.match(result.message, /No sufficient match/);
});
