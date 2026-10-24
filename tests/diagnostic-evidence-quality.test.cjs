const test = require("node:test");
const assert = require("node:assert/strict");

require("../normalization.js");
const library = require("../faults.json");
global.MAINTENANCE_FAULTS = library;
require("../diagnostic-engine.js");

const diagnose = global.MaintenanceDiagnosticEngine.diagnose;
const languages = ["ar", "fr", "en"];

test("fault library has unique stable IDs and explicit equipment/symptom scope", () => {
  assert.ok(Array.isArray(library.faults) && library.faults.length > 0);
  const ids = new Set();
  for (const fault of library.faults) {
    assert.equal(typeof fault.id, "string", "fault ID must be a string");
    assert.ok(fault.id.trim(), "fault ID must not be blank");
    assert.ok(!ids.has(fault.id), "duplicate fault ID: " + fault.id);
    ids.add(fault.id);
    assert.equal(typeof fault.equipmentType, "string", fault.id + ": equipmentType missing");
    assert.ok(fault.equipmentType.trim(), fault.id + ": equipmentType blank");
    assert.ok(Array.isArray(fault.symptoms) && fault.symptoms.length > 0, fault.id + ": symptoms missing");
    assert.ok(fault.symptoms.every(s => typeof s === "string" && s.trim()), fault.id + ": invalid symptom ID");
  }
});

test("every fault has multilingual labels, safe checks, escalation, and cause labels", () => {
  for (const fault of library.faults) {
    for (const language of languages) {
      assert.ok(typeof fault.title?.[language] === "string" && fault.title[language].trim(),
        fault.id + ": title missing for " + language);
      assert.ok(typeof fault.escalation?.[language] === "string" && fault.escalation[language].trim(),
        fault.id + ": escalation missing for " + language);
      assert.ok(Array.isArray(fault.safeChecks) && fault.safeChecks.some(item =>
        typeof item?.[language] === "string" && item[language].trim()),
        fault.id + ": safe checks missing for " + language);
    }
    assert.ok(Array.isArray(fault.causes) && fault.causes.length > 0, fault.id + ": causes missing");
    for (const cause of fault.causes) {
      assert.ok(typeof cause.id === "string" && cause.id.trim(), fault.id + ": cause ID missing");
      for (const language of languages) {
        assert.ok(typeof cause.label?.[language] === "string" && cause.label[language].trim(),
          fault.id + "/" + cause.id + ": cause label missing for " + language);
      }
      assert.ok(Array.isArray(cause.keywords) && cause.keywords.length > 0,
        fault.id + "/" + cause.id + ": cause keywords missing");
    }
  }
});

test("unrecognized equipment and symptom do not become a confident exact diagnosis", () => {
  const result = diagnose({
    equipmentType: "unlisted-equipment-xyz",
    symptom: "unlisted-symptom-xyz",
    observations: "",
    language: "en"
  }, library);
  assert.equal(result.matched, false);
  assert.ok(Array.isArray(result.results));
  assert.match(result.advisory, /not a confirmed diagnosis/i);
});

test("diagnostic match scores are described as match scores, not probabilities", () => {
  const result = diagnose({
    equipmentType: "pump",
    symptom: "low_flow",
    observations: "flow is low",
    language: "en"
  }, library);
  assert.ok(result.results.length > 0);
  assert.equal(result.results[0].thresholdMet, true);
  assert.match(result.advisory, /not a confirmed diagnosis/i);
  assert.doesNotMatch(result.advisory, /probability|percent chance|confidence of [0-9]/i);
});
