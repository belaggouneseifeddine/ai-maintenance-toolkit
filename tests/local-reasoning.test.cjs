const test = require("node:test");
const assert = require("node:assert/strict");

require("../normalization.js");
const faults = require("../faults.json");
global.MAINTENANCE_FAULTS = faults;
const bayesian = require("../bayesian-engine.js");
require("../diagnostic-engine.js");

const engine = global.MaintenanceDiagnosticEngine;

test("local reasoning returns bounded exploratory pump hypotheses with reasons and safe checks", () => {
  const result = engine.analyse({ machine: "pump", symptom: "noise", observations: "", language: "en" }, { faults: [] });
  assert.equal(result.mode, "exploratory");
  assert.ok(result.hypotheses.length >= 1 && result.hypotheses.length <= 3);
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
  assert.ok(result.hypotheses.every(item => item.why && item.nextCheck));
  assert.equal(result.confirmedCause, "");
  assert.match(result.note, /not direct proof/i);
});

test("wrong equipment/symptom combinations do not receive unrelated hypotheses", () => {
  const result = engine.analyse({ machine: "motor", symptom: "low_flow", language: "en" }, { faults: [] });
  assert.equal(result.hypotheses.length, 0);
  assert.equal(result.mode, "insufficient");
});

test("local fault-library matches remain hypotheses and never become confirmed causes", () => {
  const result = engine.analyse({ machine: "pump", symptom: "noise", observations: "gravel noise and vibration", language: "en" }, faults);
  assert.ok(result.hypotheses.length > 0);
  assert.equal(result.confirmedCause, "");
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("manufacturer source is hidden unless exact family context is supplied", () => {
  const generic = engine.analyse({ machine: "pump", symptom: "low_flow", manualRef: "Grundfos Hydro EN", language: "en" }, { faults: [] });
  assert.equal(generic.references.some(item => item.id === "grundfos-hydro-en"), false);
  const matchedFamily = engine.analyse({ machine: "pump", symptom: "low_flow", manufacturer: "Grundfos", model: "Hydro EN", application: "firefighting system", language: "en" }, { faults: [] });
  const source = matchedFamily.references.find(item => item.id === "grundfos-hydro-en");
  assert.ok(source);
  assert.match(source.status, /heading-only-not-evidence/);
});

test("no probabilities, OEM limits, or unverified fault claims are generated", () => {
  const result = engine.analyse({ machine: "compressor", symptom: "low_pressure", language: "en" }, { faults: [] });
  assert.ok(result.hypotheses.length > 0);
  assert.ok(result.hypotheses.every(item => !/%/.test(JSON.stringify(item))));
  assert.ok(result.hypotheses.every(item => item.status === "hypothesis_only"));
});

test("exploratory library does not claim a source supports the cause", () => {
  const result = engine.analyse({ machine: "motor", symptom: "overheat", language: "en" }, { faults: [] });
  assert.ok(result.hypotheses.length > 0);
  assert.ok(result.hypotheses.every(item => item.basis === "symptom-pattern-not-source-verified"));
});

test("local knowledge retrieval returns relevant excerpts with source scope metadata", () => {
  const result = engine.analyse({ machine: "pump", symptom: "low_flow", observations: "suction pressure low", language: "en" }, { faults: [] });
  assert.ok(result.retrievedKnowledge.some(item => item.id === "kb-pump-low-flow"));
  assert.ok(result.retrievedKnowledge.every(item => item.sourceTitle && item.sourceUrl && item.sourceStatus));
  assert.ok(result.retrievedKnowledge.every(item => item.evidenceClass === "general-knowledge-note-not-OEM-verified"));
});

test("local diagnostic hypotheses are reranked by the qualitative Bayesian network without becoming confirmed", () => {
  const local = engine.analyse({
    machine: "pump",
    symptom: "low_flow",
    observations: "suction pressure and flow readings are recorded",
    language: "en"
  }, { faults: [] });
  const ranked = bayesian.enrich({}, local);
  assert.equal(ranked.reasoningModel, "qualitative_bn_v1");
  assert.equal(ranked.network.calibrated, false);
  assert.equal(ranked.confirmedCause, "");
  assert.ok(ranked.hypotheses.every(item => item.status === "hypothesis_only"));
  assert.ok(ranked.hypotheses.every(item => Number.isFinite(item.relativeSupportScore)));
  assert.ok(ranked.hypotheses.every(item => !Object.hasOwn(item, "bayesianEstimate")));
});
