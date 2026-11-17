const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Casebook = require("../diagnostic-casebook.js");
const lowFlow = JSON.parse(fs.readFileSync("knowledge/diagnostic-cases/centrifugal-pump-low-flow.json", "utf8"));

test("low-flow candidate case satisfies the case contract", () => {
  const result = Casebook.validateCase(lowFlow);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(lowFlow.status, "candidate");
  assert.equal(lowFlow.licenseStatus, "reference_only");
});

test("measurements preserve units, location, operating condition and source provenance", () => {
  for (const m of lowFlow.measurements) {
    assert.ok(m.unit && m.location && m.operatingCondition);
    assert.ok(m.sourceTypes.includes("plc_value"));
    assert.ok(m.sourceTypes.includes("direct_measurement"));
  }
  const broken = structuredClone(lowFlow);
  delete broken.measurements[0].location;
  assert.equal(Casebook.validateCase(broken).ok, false);
});

test("candidate status cannot be promoted without claim-level reviewed sources", () => {
  const broken = structuredClone(lowFlow);
  broken.status = "technically_reviewed";
  broken.sources[0].sectionOrPage = null;
  assert.equal(Casebook.validateCase(broken).ok, false);
});

test("triage keeps all hypotheses unresolved and never emits probabilities", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Flow rate", value: 12, unit: "m3/h", location: "FT-101", operatingCondition: "stable", sourceType: "plc_value" }
  ] }, lowFlow);
  assert.equal(result.status, "candidate_triage_only");
  assert.equal(result.runtimeEligible, false);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
  assert.equal(JSON.stringify(result).includes("probability"), false);
});

test("missing, estimated and incomplete readings are not silently promoted to measured evidence", () => {
  const result = Casebook.triageLowFlow({ measurements: [
    { name: "Suction pressure", value: 1.2, unit: "bar", location: "", operatingCondition: "unknown", sourceType: "estimated" },
    { name: "Discharge pressure", value: null, unit: "bar", location: "PT-102", operatingCondition: "stable", sourceType: "unknown" }
  ] }, lowFlow);
  assert.equal(result.evidenceQuality.acceptedMeasurementCount, 0);
  assert.equal(result.evidenceQuality.incompleteMeasurementCount, 2);
  assert.ok(result.hypotheses.every(h => h.status === "unresolved"));
});

test("unsafe and invasive inspections are not selected as the next automatic observation", () => {
  const result = Casebook.triageLowFlow({ measurements: [] }, lowFlow);
  assert.ok(result.nextEvidence);
  assert.equal(result.nextEvidence.safetyClass, "installed_instrument_observation");
});
