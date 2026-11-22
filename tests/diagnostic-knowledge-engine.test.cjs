const test = require("node:test");
const assert = require("node:assert/strict");
const Engine = require("../diagnostic-knowledge-engine.js");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = require("../knowledge/diagnostic-cases/centrifugal-pump-low-flow.json");

test("candidate cases remain outside runtime and hypotheses remain unresolved", () => {
  const result = Engine.analyze({ measurements: [] }, lowFlow, { casebook: Casebook });
  assert.equal(result.ok, true);
  assert.equal(result.runtimeEligible, false);
  assert.equal(result.status, "candidate_case_assessment");
  assert.ok(result.hypotheses.every(item => item.status === "unresolved"));
  assert.equal(result.probabilities, null);
});

test("only fully field-validated and reuse-permitted cases pass the runtime gate", () => {
  const candidate = structuredClone(lowFlow);
  candidate.status = "technically_reviewed";
  candidate.licenseStatus = "reuse_permitted";
  candidate.sources = candidate.sources.map(source => ({ ...source, reviewStatus: "reviewed", sectionOrPage: "Section 4" }));
  assert.equal(Engine.runtimeGate(candidate, { ok: true }).eligible, false);
  candidate.status = "field_validated";
  assert.equal(Engine.runtimeGate(candidate, { ok: true }).eligible, true);
});

test("estimated, PLC and historian readings are preserved as distinct sources", () => {
  const result = Engine.normalizeMeasurements([
    { name: "Flow", value: 10, unit: "m3/h", location: "FT-1", operatingCondition: "stable", sourceType: "direct_measurement" },
    { name: "Flow", value: 10, unit: "m3/h", location: "FT-1", operatingCondition: "stable", sourceType: "plc_value" },
    { name: "Flow estimate", value: 9, unit: "m3/h", location: "calc", operatingCondition: "stable", sourceType: "estimated" }
  ]);
  assert.deepEqual(result.accepted.map(item => item.sourceType), ["direct_measurement", "plc_value", "estimated"]);
  assert.ok(result.warnings.some(item => item.code === "estimated_not_measured"));
  assert.ok(result.warnings.some(item => item.code === "control_system_value_not_independent"));
});

test("missing and contradictory measurements are surfaced rather than inferred", () => {
  const result = Engine.normalizeMeasurements([
    { name: "Suction pressure", value: 1.2, unit: "bar", location: "PT-1", operatingCondition: "steady", sourceType: "direct_measurement", timestamp: "10:00" },
    { name: "Suction pressure", value: 1.8, unit: "bar", location: "PT-1", operatingCondition: "steady", sourceType: "direct_measurement", timestamp: "10:00" },
    { name: "Flow", value: null, unit: "m3/h", location: "FT-1", operatingCondition: "steady", sourceType: "unknown" }
  ]);
  assert.equal(result.conflicts.length, 1);
  assert.ok(result.warnings.some(item => item.code === "value_missing"));
});

test("unsafe inspection classes are never selected as next tests", () => {
  const result = Engine.analyze({ measurements: [] }, lowFlow, { casebook: Casebook });
  assert.ok(result.nextTest);
  assert.equal(result.nextTest.safetyClass, "installed_instrument_observation");
});
